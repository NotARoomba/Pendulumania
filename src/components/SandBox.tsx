import { extend, useTick } from "@pixi/react";
import type { Bob, Trail, Universe } from "physics-engine";
import { Container, Graphics } from "pixi.js";
import { useCallback, useRef, useState } from "react";
import { useSimulation } from "../contexts/SimulationContext";
extend({
  Container,
  Graphics,
});

interface SandBoxProps {
  universe: Universe;
}

export default function SandBox({ universe }: SandBoxProps) {
  const {
    selectedBobIndex,
    setSelectedBobIndex,
    setIsPropertyEditorOpen,
    render,
    setRender,
  } = useSimulation();

  const [hoveredBobIndex, setHoveredBobIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotationIndicator, setRotationIndicator] = useState(0);
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
    setRender((prev) => prev + 1);
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

      const bobs: Bob[] = universe.get_bobs();
      const trails: Trail[][] = universe.get_trails();
      const isPaused = universe.get_is_paused();

      // Draw angle arcs, velocity and acceleration vectors when paused
      if (isPaused) {
        for (let i = 0; i < bobs.length; i++) {
          const prevX = i === 0 ? 0 : bobs[i - 1].pos.x;
          const prevY = i === 0 ? 0 : bobs[i - 1].pos.y;

          // Draw angle arc
          const arcRadius = 40;
          const theta = bobs[i].theta;

          // console.log("Drawing angle arc for bob", i, "theta:", theta);

          // Draw arc from downward vertical (0) to theta
          // In the coordinate system, 0 degrees is straight down (Math.PI/2 in standard coords)
          const endAngle = Math.PI / 2; // Straight down (0 degrees in pendulum coords)
          const startAngle = Math.PI / 2 - theta; // Current angle
          graphics.moveTo(bobs[i].pos.x, bobs[i].pos.y);

          graphics.setStrokeStyle({
            width: 2,
            color: 0x4a5568,
            alpha: 0.8,
            cap: "round",
            join: "round",
          });
          // graphics.clear();
          graphics.arc(
            prevX,
            prevY,
            arcRadius,
            startAngle,
            endAngle,
            theta < 0 // counterclockwise if theta is negative
          );
          graphics.stroke();

          // Calculate velocity (v = ω * r for circular motion)
          const rodLength = bobs[i].rod ? bobs[i].rod.length : 100;
          const velocityMag = Math.abs(bobs[i].omega * rodLength);
          const velocityAngle =
            theta + (bobs[i].omega > 0 ? Math.PI / 2 : -Math.PI / 2);

          // Draw velocity vector (tangent to motion)
          if (velocityMag > 0.1) {
            const velScale = 1.0; // Increased scale for better visibility
            const velX = Math.sin(velocityAngle) * velocityMag * velScale;
            const velY = Math.cos(velocityAngle) * velocityMag * velScale;

            graphics.setStrokeStyle({
              width: 3,
              color: 0x4a5568,
              alpha: 1,
              cap: "round",
              join: "round",
            });
            graphics.moveTo(bobs[i].pos.x, bobs[i].pos.y);
            graphics.lineTo(bobs[i].pos.x + velX, bobs[i].pos.y + velY);
            graphics.stroke();

            // Draw arrow head for velocity
            const arrowSize = 15;
            const arrowAngle = Math.PI / 6;
            const velAngleDir = Math.atan2(velY, velX);

            // Arrow tip is at the end of the velocity vector
            const tipX = bobs[i].pos.x + velX;
            const tipY = bobs[i].pos.y + velY;

            // Move the arrow base back along the shaft
            const arrowOffset = -8; // Distance back from the tip
            const arrowTipX = tipX - Math.cos(velAngleDir) * arrowOffset;
            const arrowTipY = tipY - Math.sin(velAngleDir) * arrowOffset;

            graphics.poly([
              {
                x: arrowTipX,
                y: arrowTipY,
              },
              {
                x: arrowTipX - Math.cos(velAngleDir - arrowAngle) * arrowSize,
                y: arrowTipY - Math.sin(velAngleDir - arrowAngle) * arrowSize,
              },
              {
                x: arrowTipX - Math.cos(velAngleDir + arrowAngle) * arrowSize,
                y: arrowTipY - Math.sin(velAngleDir + arrowAngle) * arrowSize,
              },
            ]);
            graphics.fill({ color: 0x4a5568, alpha: 1 });
          }
        }
      }

      // Draw center bob
      graphics.circle(0, 0, 10);
      graphics.fill({ color: 0x0f0f0f });

      // Draw rods
      for (let i = 0; i < bobs.length; i++) {
        if (bobs[i].rod) {
          graphics.setStrokeStyle({
            width: 2,
            color: bobs[i].rod!.color,
            alpha: 1,
          });
          graphics.moveTo(
            i == 0 ? 0 : bobs[i - 1].pos.x,
            i == 0 ? 0 : bobs[i - 1].pos.y
          );
          graphics.lineTo(bobs[i].pos.x, bobs[i].pos.y);
          graphics.stroke();
        }
      }

      // Draw trails
      for (let i = 0; i < trails.length; i++) {
        const trail = trails[i];
        for (let j = 0; j < trail.length; j++) {
          graphics.setStrokeStyle({
            width: 2,
            color: trail[j].color,
            alpha: (j + 1) / trail.length,
          });
          if (j == 0) {
            graphics.moveTo(trail[j].pos.x, trail[j].pos.y);
          } else {
            graphics.lineTo(trail[j].pos.x, trail[j].pos.y);
          }
          graphics.stroke();
        }
      }

      // Draw bobs with hover highlight
      for (let i = 0; i < bobs.length; i++) {
        // Draw hover highlight (only when paused)
        if (hoveredBobIndex === i && isPaused) {
          graphics.circle(bobs[i].pos.x, bobs[i].pos.y, bobs[i].radius + 8);
          graphics.fill({ color: 0xffaa00, alpha: 0.1 });
          graphics.stroke({ width: 3, color: 0xffaa00, alpha: 0.6 });
        }

        // Draw bob
        graphics.circle(bobs[i].pos.x, bobs[i].pos.y, bobs[i].radius);
        graphics.fill({ color: bobs[i].color, alpha: 1 });
      }
    },
    [render, hoveredBobIndex, selectedBobIndex, rotationIndicator]
  );

  useTick((delta) => {
    if (universe.get_is_paused()) return;
    setRender(render + 1);
    universe.time_step(delta.deltaTime);

    // Update rotation indicator for selected bob
    if (selectedBobIndex !== null) {
      const bobs = universe.get_bobs();
      if (bobs[selectedBobIndex]) {
        setRotationIndicator(
          (prev) => prev + bobs[selectedBobIndex].omega * delta.deltaTime * 0.1
        );
      }
    }
  });
  return (
    <>
      <pixiContainer
        x={0}
        y={0}
        ref={pixiContainerRef}
        interactive
        onPointerDown={(e: any) => {
          // Only allow interaction when paused
          if (!universe.get_is_paused()) return;

          const localPos = pixiContainerRef.current.toLocal(e.data.global);
          const bobs = universe.get_bobs();

          // Check if clicked on a bob first
          for (let i = 0; i < bobs.length; i++) {
            const dx = localPos.x - bobs[i].pos.x;
            const dy = localPos.y - bobs[i].pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < bobs[i].radius + 10) {
              setSelectedBobIndex(i);
              // Only open property editor when paused
              if (universe.get_is_paused()) {
                setIsPropertyEditorOpen(true);
              }
              handleBobDragStart(i, e);
              return;
            }
          }

          // Check if clicked on a rod
          for (let i = 0; i < bobs.length; i++) {
            const prevX = i === 0 ? 0 : bobs[i - 1].pos.x;
            const prevY = i === 0 ? 0 : bobs[i - 1].pos.y;
            const bobX = bobs[i].pos.x;
            const bobY = bobs[i].pos.y;

            // Calculate distance from point to line segment
            const A = localPos.x - prevX;
            const B = localPos.y - prevY;
            const C = bobX - prevX;
            const D = bobY - prevY;

            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            const param = lenSq !== 0 ? dot / lenSq : -1;

            let nearestX, nearestY;

            if (param < 0) {
              nearestX = prevX;
              nearestY = prevY;
            } else if (param > 1) {
              nearestX = bobX;
              nearestY = bobY;
            } else {
              nearestX = prevX + param * C;
              nearestY = prevY + param * D;
            }

            const distToRod = Math.sqrt(
              (localPos.x - nearestX) ** 2 + (localPos.y - nearestY) ** 2
            );

            if (distToRod < 10) {
              // Clicked on rod - select the bob it's attached to
              setSelectedBobIndex(i);
              // Only open property editor when paused
              if (universe.get_is_paused()) {
                setIsPropertyEditorOpen(true);
              }
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

          // Only allow hover highlighting when paused
          if (!universe.get_is_paused()) {
            setHoveredBobIndex(null);
            pixiContainerRef.current.cursor = "default";
            return;
          }

          if (!isDragging) {
            // Check if hovering over a bob and update hover state
            const bobs = universe.get_bobs();
            let hoveringOverBob = false;
            let hoveredIndex: number | null = null;
            const localPos = pixiContainerRef.current.toLocal(e.data.global);

            for (let i = 0; i < bobs.length; i++) {
              const dx = localPos.x - bobs[i].pos.x;
              const dy = localPos.y - bobs[i].pos.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < bobs[i].radius + 10) {
                hoveringOverBob = true;
                hoveredIndex = i;
                break;
              }
            }

            setHoveredBobIndex(hoveredIndex);
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
