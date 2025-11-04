import { Universe } from "physics-engine";
import Transitions from "../utils/Transitions";
import { Application, extend } from "@pixi/react";
import { useWindowDimension } from "../utils/useWindowDimension";
import { Viewport } from "../utils/Viewport";
import SandBox from "../utils/SandBox";
import { Container, Text } from "pixi.js";
import SettingsBar from "../components/SettingsBar";

extend({ Container, Text });

const universe: Universe = new Universe();

console.log("Universe initialized:", universe.get_bobs());

export default function Simulation() {
  const [width, height] = useWindowDimension();

  return (
    <Transitions>
      <Application
        background={"#ffffff00"}
        width={width}
        height={height}
        className="overflow-hidden"
        antialias
      >
        <Viewport>
          <SandBox universe={universe} />
        </Viewport>
      </Application>
      <div className="absolute inset-0 p-4 pointer-events-none flex justify-center items-start">
        <p className="text-neutral-700 font-bold text-5xl">
          Pendulum Simulation
        </p>
      </div>
      <div className="absolute bottom-0 w-screen p-4 pointer-events-none flex justify-center items-start ">
        <SettingsBar universe={universe} />
      </div>
    </Transitions>
  );
}
