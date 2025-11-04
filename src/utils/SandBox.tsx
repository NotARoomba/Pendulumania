import { extend, useTick } from "@pixi/react";
import type { Bob, Trail, Universe } from "physics-engine";
import { Container, Graphics, Text as PixiText } from "pixi.js";
import { useCallback, useEffect, useRef, useState } from "react";

extend({
  Container,
  Graphics,
  PixiText,
});

interface SandBoxProps {
  universe: Universe;
  editingBobIndex: number | null;
  setEditingBobIndex: (index: number | null) => void;
  editingRodIndex: number | null;
  setEditingRodIndex: (index: number | null) => void;
}

export default function SandBox({
  universe,
  editingBobIndex,
  setEditingBobIndex,
  editingRodIndex,
  setEditingRodIndex,
}: SandBoxProps) {
  const [render, setRender] = useState(0);
  const [selectedBobIndex, setSelectedBobIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredBobIndex, setHoveredBobIndex] = useState<number | null>(null);
  const [hoveredRodIndex, setHoveredRodIndex] = useState<number | null>(null);
  const [isDraggingRod, setIsDraggingRod] = useState(false);
  const [rotationLineAngle, setRotationLineAngle] = useState(0);
  const [angleTexts, setAngleTexts] = useState<
    Array<{ x: number; y: number; text: string }>
  >([]);
  const pixiContainerRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

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

  const handleBobClick = (index: number) => {
    setSelectedBobIndex(index);
    setEditingBobIndex(index);
  };

  const handleRodClick = (index: number, event: any) => {
    event.stopPropagation();
    setEditingRodIndex(index);
  };

  const handleRodDragStart = (index: number, event: any) => {
    event.stopPropagation();
    setEditingRodIndex(index);
    setIsDraggingRod(true);
    universe.set_is_paused(true);
  };

  const handleRodDrag = (index: number, event: any) => {
    if (!isDraggingRod) return;

    const bobs = universe.get_bobs();
    const localPos = pixiContainerRef.current.toLocal(event.global);

    const prevX = index === 0 ? 0 : bobs[index - 1].pos.x;
    const prevY = index === 0 ? 0 : bobs[index - 1].pos.y;

    const dx = localPos.x - prevX;
    const dy = localPos.y - prevY;
    const newLength = Math.sqrt(dx * dx + dy * dy);

    universe.update_bob_length(index, Math.max(10, newLength));
    setRender(render + 1);
  };

  const handleRodDragEnd = () => {
    setIsDraggingRod(false);
  };

  // Animate the rotating line
  useEffect(() => {
    if (selectedBobIndex !== null) {
      const animate = () => {
        const bobs = universe.get_bobs();
        if (selectedBobIndex < bobs.length) {
          setRotationLineAngle(
            (prev) => prev + bobs[selectedBobIndex].omega * 0.1
          );
        }
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [selectedBobIndex, universe]);

  const drawCallback = useCallback(
    (graphics: any) => {
      graphics.clear();
      //center bob
      graphics.beginFill(0x0f0f0f);
      // graphics.drawCircle(0, 0, 10);
      graphics.circle(0, 0, 10);
      graphics.endFill();

      const bobs: Bob[] = universe.get_bobs();
      console.log("Bobs:", bobs);
      const trails: Trail[][] = universe.get_trails();
      const isPaused = universe.get_is_paused();

      // Draw rods
      for (let i = 0; i < bobs.length; i++) {
        if (bobs[i].rod) {
          const isEditingThis = editingRodIndex === i;
          const isHoveredRod = hoveredRodIndex === i;

          graphics.lineStyle(
            isEditingThis ? 4 : isHoveredRod ? 3 : 2,
            isEditingThis
              ? 0x3b82f6
              : isHoveredRod
              ? 0x888888
              : bobs[i].rod!.color,
            1
          );
          graphics.moveTo(
            i == 0 ? 0 : bobs[i - 1].pos.x,
            i == 0 ? 0 : bobs[i - 1].pos.y
          );
          graphics.lineTo(bobs[i].pos.x, bobs[i].pos.y);
          graphics.endFill();
        }
      }

      // Draw bobs with hover and selection effects
      for (let i = 0; i < bobs.length; i++) {
        const isHovered = hoveredBobIndex === i;
        const isSelected = selectedBobIndex === i;

        // Draw highlight ring if hovered
        if (isHovered) {
          graphics.lineStyle(3, 0x888888, 0.8);
          graphics.drawCircle(bobs[i].pos.x, bobs[i].pos.y, bobs[i].radius + 5);
          graphics.endFill();
          graphics.lineStyle(0);
        }

        // Draw bob
        graphics.beginFill(bobs[i].color, 1);
        graphics.drawCircle(bobs[i].pos.x, bobs[i].pos.y, bobs[i].radius);
        graphics.endFill();

        // Draw rotating line when selected
        if (isSelected) {
          const lineLength = bobs[i].radius + 20;
          graphics.clear();
          graphics.lineStyle(2, 0xff0000, 1);
          graphics.moveTo(bobs[i].pos.x, bobs[i].pos.y);
          graphics.lineTo(
            bobs[i].pos.x + Math.sin(rotationLineAngle) * lineLength,
            bobs[i].pos.y + Math.cos(rotationLineAngle) * lineLength
          );
          graphics.endFill();

          // Draw rotation direction arrow
          const omega = bobs[i].omega;
          if (omega !== 0) {
            const arrowRadius = bobs[i].radius + 15;
            const arrowSize = 8;
            const direction = omega > 0 ? 1 : -1;
            const arrowAngle = Math.PI / 2;

            // Draw arc
            graphics.lineStyle(2, 0x00ff00, 0.8);
            graphics.arc(
              bobs[i].pos.x,
              bobs[i].pos.y,
              arrowRadius,
              0,
              Math.PI,
              direction < 0
            );

            // Draw arrowhead
            const arrowX = bobs[i].pos.x + Math.sin(arrowAngle) * arrowRadius;
            const arrowY = bobs[i].pos.y + Math.cos(arrowAngle) * arrowRadius;
            graphics.endFill();
            graphics.beginFill(0x00ff00, 0.8);
            graphics.moveTo(arrowX, arrowY);
            graphics.lineTo(
              arrowX + arrowSize * Math.sin(arrowAngle - direction * 0.5),
              arrowY + arrowSize * Math.cos(arrowAngle - direction * 0.5)
            );
            graphics.lineTo(
              arrowX + arrowSize * Math.sin(arrowAngle + direction * 0.5),
              arrowY + arrowSize * Math.cos(arrowAngle + direction * 0.5)
            );
            graphics.closePath();
            graphics.endFill();
          }
        }

        // Draw angle measurements when paused
        if (isPaused) {
          const prevX = i === 0 ? 0 : bobs[i - 1].pos.x;
          const prevY = i === 0 ? 0 : bobs[i - 1].pos.y;

          // Draw vertical reference line (like E1 in the diagram)
          graphics.lineStyle(2, 0x000000, 0.4);
          graphics.moveTo(prevX, prevY);
          graphics.lineTo(prevX, prevY + 50);
          graphics.endFill();

          // Draw angle arc from vertical (0) to theta
          const arcRadius = 40;
          graphics.lineStyle(2, 0xff0000, 0.8);
          graphics.arc(prevX, prevY, arcRadius, 0, bobs[i].theta, false);
          graphics.endFill();

          // Draw small arrowhead at the end of the arc
          const arrowAngle = bobs[i].theta;
          const arrowX = prevX + Math.sin(arrowAngle) * arcRadius;
          const arrowY = prevY + Math.cos(arrowAngle) * arcRadius;
          const arrowSize = 6;

          graphics.beginFill(0xff0000, 0.8);
          graphics.moveTo(arrowX, arrowY);
          graphics.lineTo(
            arrowX - arrowSize * Math.cos(arrowAngle - Math.PI / 6),
            arrowY + arrowSize * Math.sin(arrowAngle - Math.PI / 6)
          );
          graphics.lineTo(
            arrowX - arrowSize * Math.cos(arrowAngle + Math.PI / 6),
            arrowY + arrowSize * Math.sin(arrowAngle + Math.PI / 6)
          );
          graphics.closePath();
          graphics.endFill();
        }
      }

      // Draw text labels for angles when paused (must be done after all graphics)
      if (isPaused) {
        const newAngleTexts: Array<{ x: number; y: number; text: string }> = [];

        for (let i = 0; i < bobs.length; i++) {
          const prevX = i === 0 ? 0 : bobs[i - 1].pos.x;
          const prevY = i === 0 ? 0 : bobs[i - 1].pos.y;

          // Position text at angle/2 from vertical
          const textAngle = bobs[i].theta / 2;
          const textRadius = 55;
          const textX = prevX + Math.sin(textAngle) * textRadius;
          const textY = prevY + Math.cos(textAngle) * textRadius;

          // Create text showing angle symbol
          const textContent = `θ${i + 1}`;

          // Draw text background
          graphics.lineStyle(0);
          graphics.beginFill(0xffffff, 0.9);
          graphics.drawRoundedRect(textX - 15, textY - 8, 30, 16, 3);
          graphics.endFill();

          // Draw text outline
          graphics.lineStyle(1, 0x000000, 0.3);
          graphics.drawRoundedRect(textX - 15, textY - 8, 30, 16, 3);
          graphics.endFill();

          newAngleTexts.push({ x: textX, y: textY, text: textContent });
        }

        // Update angle texts state if changed
        if (JSON.stringify(newAngleTexts) !== JSON.stringify(angleTexts)) {
          setAngleTexts(newAngleTexts);
        }
      } else if (angleTexts.length > 0) {
        setAngleTexts([]);
      }

      // Draw trails
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
    [
      render,
      hoveredBobIndex,
      hoveredRodIndex,
      selectedBobIndex,
      rotationLineAngle,
      editingRodIndex,
      angleTexts,
    ]
  );

  useTick((delta) => {
    if (universe.get_is_paused()) return;
    setRender(render + 1);
    universe.time_step(delta.deltaTime);
  });

  // Helper to check if point is near a rod
  const isNearRod = (x: number, y: number, rodIndex: number): boolean => {
    const bobs = universe.get_bobs();
    if (rodIndex >= bobs.length || !bobs[rodIndex].rod) return false;

    const prevX = rodIndex === 0 ? 0 : bobs[rodIndex - 1].pos.x;
    const prevY = rodIndex === 0 ? 0 : bobs[rodIndex - 1].pos.y;
    const bobX = bobs[rodIndex].pos.x;
    const bobY = bobs[rodIndex].pos.y;

    // Calculate distance from point to line segment
    const dx = bobX - prevX;
    const dy = bobY - prevY;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) return false;

    const t = Math.max(
      0,
      Math.min(1, ((x - prevX) * dx + (y - prevY) * dy) / lengthSq)
    );
    const projX = prevX + t * dx;
    const projY = prevY + t * dy;
    const dist = Math.sqrt((x - projX) ** 2 + (y - projY) ** 2);

    return dist < 10;
  };

  return (
    <>
      <pixiContainer
        x={0}
        y={0}
        ref={pixiContainerRef}
        interactive
        onPointerDown={(e: any) => {
          const localPos = pixiContainerRef.current.toLocal(e.data.global);
          const bobs = universe.get_bobs();

          // Check if clicked on a bob
          for (let i = 0; i < bobs.length; i++) {
            const dx = localPos.x - bobs[i].pos.x;
            const dy = localPos.y - bobs[i].pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < bobs[i].radius + 10) {
              handleBobClick(i);
              handleBobDragStart(i, e);
              return;
            }
          }

          // Check if clicked on a rod
          for (let i = 0; i < bobs.length; i++) {
            if (isNearRod(localPos.x, localPos.y, i)) {
              handleRodClick(i, e);
              handleRodDragStart(i, e);
              return;
            }
          }

          // Clicked on empty space - deselect
          setSelectedBobIndex(null);
          setEditingBobIndex(null);
          setEditingRodIndex(null);
        }}
        onGlobalPointerMove={(e: any) => {
          const localPos = pixiContainerRef.current.toLocal(e.data.global);
          const bobs = universe.get_bobs();

          // Handle dragging
          if (isDragging && selectedBobIndex !== null) {
            handleBobDrag(selectedBobIndex, e);
            return;
          }

          if (isDraggingRod && editingRodIndex !== null) {
            handleRodDrag(editingRodIndex, e);
            return;
          }

          // Update hover state and cursor
          if (!isDragging && !isDraggingRod) {
            let hoveringOverBob = false;
            let hoveredIndex: number | null = null;
            let hoveredRod: number | null = null;

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

            // Check hovering over rod
            if (!hoveringOverBob) {
              for (let i = 0; i < bobs.length; i++) {
                if (isNearRod(localPos.x, localPos.y, i)) {
                  hoveredRod = i;
                  break;
                }
              }
            }

            setHoveredBobIndex(hoveredIndex);
            setHoveredRodIndex(hoveredRod);
            pixiContainerRef.current.cursor =
              hoveredIndex !== null || hoveredRod !== null
                ? "pointer"
                : "default";
          }
        }}
        onPointerUp={() => {
          handleBobDragEnd();
          handleRodDragEnd();
        }}
        onPointerUpOutside={() => {
          handleBobDragEnd();
          handleRodDragEnd();
        }}
      >
        <pixiGraphics draw={drawCallback} />

        {/* Render angle text labels when paused */}
        {angleTexts.map((textData, index) => (
          <pixiText
            key={`angle-text-${index}`}
            text={textData.text}
            x={textData.x}
            y={textData.y}
            anchor={0.5}
            style={{
              fontFamily: "Arial",
              fontSize: 14,
              fill: 0x000000,
              align: "center",
            }}
          />
        ))}
      </pixiContainer>
    </>
  );
}
