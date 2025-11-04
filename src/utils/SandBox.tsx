import { extend, useTick } from "@pixi/react";
import type { Bob, Trail, Universe } from "physics-engine";
import { Container, Graphics } from "pixi.js";
import { useCallback, useState } from "react";

extend({
  Container,
  Graphics,
});

export default function SandBox({ universe }: { universe: Universe }) {
  const [render, setRender] = useState(0);
  const drawCallback = useCallback(
    (graphics: any) => {
      graphics.clear();
      //center bob
      graphics.beginFill(0x0f0f0f);
      graphics.drawCircle(0, 0, 10);
      graphics.endFill();

      const bobs: Bob[] = universe.get_bobs();
      const trails: Trail[][] = universe.get_trails();

      for (let i = 0; i < bobs.length; i++) {
        if (bobs[i].rod) {
          graphics.lineStyle(2, bobs[i].rod!.color, 1);
          graphics.moveTo(
            i == 0 ? 0 : bobs[i - 1].pos.x,
            i == 0 ? 0 : bobs[i - 1].pos.y
          );
          graphics.lineTo(bobs[i].pos.x, bobs[i].pos.y);
          graphics.endFill();
        }
      }
      for (let i = 0; i < bobs.length; i++) {
        graphics.beginFill(bobs[i].color, 1);
        graphics.drawCircle(bobs[i].pos.x, bobs[i].pos.y, bobs[i].radius);
        graphics.endFill();
      }
      for (let i = 0; i < trails.length; i++) {
        const trail = trails[i];
        for (let j = 0; j < trail.length; j++) {
          //draw lines for trail
          graphics.lineStyle(2, trail[j].color, (j + 1) / trail.length);
          if (j == 0) {
            graphics.moveTo(trail[j].pos.x, trail[j].pos.y);
          } else {
            graphics.lineTo(trail[j].pos.x, trail[j].pos.y);
          }
          graphics.endFill();
          graphics.lineStyle(0);
        }
      }
    },
    [render]
  );

  useTick((delta) => {
    if (universe.get_is_paused()) return;
    setRender(render + 1);
    universe.time_step(delta.deltaTime);
  });
  return (
    <>
      <pixiContainer x={0} y={0}>
        <pixiGraphics draw={drawCallback} />
      </pixiContainer>
    </>
  );
}
