import { extend, useTick } from "@pixi/react";
import type { Bob, Trail, Universe } from "physics-engine";
import { Container, Graphics } from "pixi.js";
import { useCallback, useRef, useState } from "react";
import { useWindowDimension } from "./useWindowDimension";

extend({
  Container,
  Graphics,
});

export default function SandBox({ universe }: { universe: Universe }) {
  const [render, setRender] = useState(0);
  const [selectedBobIndex, setSelectedBobIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const pixiContainerRef = useRef<any>(null);

  const handleBobDragStart = (index: number, event: any) => {
    event.stopPropagation();
    setSelectedBobIndex(index);
    setIsDragging(true);
    // Pause simulation while dragging
    universe.set_is_paused(true);
  };

  const handleBobDrag = (index: number, event: any) => {
    if (!isDragging) return;

    const bobs = universe.get_bobs();

    const localPos = pixiContainerRef.current.toLocal(event.global);

    // Get the position relative to the previous bob or origin
    const prevX = index === 0 ? 0 : bobs[index - 1].pos.x;
    const prevY = index === 0 ? 0 : bobs[index - 1].pos.y;

    // Calculate new angle from mouse position
    const dx = localPos.x - prevX;
    const dy = localPos.y - prevY;
    const newTheta = Math.atan2(dx, dy);

    // Update the bob's angle
    universe.update_bob_theta(index, newTheta);
    setRender(render + 1);
  };

  const handleBobDragEnd = () => {
    setIsDragging(false);
    // Resume simulation
    if (!universe.get_is_paused()) {
      universe.set_is_paused(false);
    }
  };

  const drawCallback = useCallback(
    (graphics: any) => {
      graphics.clear();
      //center bob
      graphics.beginFill(0x0f0f0f);
      graphics.drawCircle(0, 0, 10);
      graphics.endFill();

      const bobs: Bob[] = universe.get_bobs();
      console.log("Bobs:", bobs);
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
      <pixiContainer
        x={0}
        y={0}
        ref={pixiContainerRef}
        interactive
        onPointerDown={(e: any) => {
          // Check if clicked on a bob
          const bobs = universe.get_bobs();
          for (let i = 0; i < bobs.length; i++) {
            const localPos = pixiContainerRef.current.toLocal(e.data.global);
            const dx = localPos.x - bobs[i].pos.x;
            const dy = localPos.y - bobs[i].pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < bobs[i].radius + 10) {
              setSelectedBobIndex(i);
              handleBobDragStart(i, e);
              return;
            }
          }
          // Clicked on empty space - deselect
          setSelectedBobIndex(null);
        }}
        onGlobalPointerMove={(e: any) => {
          if (isDragging && selectedBobIndex !== null) {
            handleBobDrag(selectedBobIndex, e);
          }

          if (!isDragging && pixiContainerRef.current.cursor == "default") {
            // Change cursor if hovering over a bob
            const bobs = universe.get_bobs();
            let hoveringOverBob = false;
            const localPos = pixiContainerRef.current.toLocal(e.data.global);
            for (let i = 0; i < bobs.length; i++) {
              const dx = localPos.x - bobs[i].pos.x;
              const dy = localPos.y - bobs[i].pos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < bobs[i].radius + 10) {
                hoveringOverBob = true;
                break;
              }
            }
            pixiContainerRef.current.cursor = hoveringOverBob
              ? "grab"
              : "default";
          }
        }}
        onPointerUp={handleBobDragEnd}
        onPointerUpOutside={handleBobDragEnd}
      >
        <pixiGraphics draw={drawCallback} />
      </pixiContainer>
    </>
  );
}
