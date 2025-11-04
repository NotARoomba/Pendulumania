import { Universe } from "physics-engine";
import Transitions from "../utils/Transitions";
import { Application, extend } from "@pixi/react";
import { useWindowDimension } from "../utils/useWindowDimension";
import { Viewport } from "../utils/Viewport";
import SandBox from "../components/SandBox";
import { Container, Text } from "pixi.js";
import SettingsBar from "../components/SettingsBar";
import PropertyEditor from "../components/PropertyEditor";
import { memo } from "react";
import {
  SimulationProvider,
  useSimulation,
} from "../contexts/SimulationContext";

extend({ Container, Text });

// Create universe singleton
const universeInstance: Universe = new Universe();

console.log("Universe initialized:", universeInstance.get_balls());

// Memoize the canvas to prevent re-renders from context changes
const PixiCanvas = memo(function PixiCanvas({
  universe,
}: {
  universe: Universe;
}) {
  const [width, height] = useWindowDimension();

  return (
    <Application
      background={"#ffffff00"}
      width={width}
      height={height}
      className="overflow-hidden"
      antialias
      onInit={(app) => {
        // Store app reference globally for viewport access
        (window as any).pixiApp = app;
      }}
    >
      <Viewport>
        <SandBox universe={universe} />
      </Viewport>
    </Application>
  );
});

function SimulationContent() {
  const { universe } = useSimulation();

  return (
    <Transitions>
      <PixiCanvas universe={universe} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 p-2 sm:p-4 pointer-events-none flex flex-col justify-center items-start">
        <p className="text-neutral-700 font-bold text-4xl md:text-5xl  text-center">
          Pendulumania
        </p>
        <p className="text-neutral-700 text-md md:text-lg  text-center mx-auto">
          Made by{" "}
          <a
            className="underline pointer-events-auto"
            href="https://github.com/NotARoomba"
            target="_blank"
            rel="noopener noreferrer"
          >
            NotARoomba
          </a>
        </p>
      </div>
      <div className="absolute bottom-0 w-screen p-2 sm:p-4 pointer-events-none flex justify-center items-start">
        <SettingsBar />
      </div>

      {/* Property Editor */}
      <PropertyEditor />
    </Transitions>
  );
}

export default function Simulation() {
  return (
    <SimulationProvider universe={universeInstance}>
      <SimulationContent />
    </SimulationProvider>
  );
}
