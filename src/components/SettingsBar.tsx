import {
  Rewind,
  Pause,
  Play,
  FastForward,
  RotateCcw,
  Calculator,
  ChartScatter,
  Plus,
  Minus,
  Edit3,
  Scale,
  Sparkles,
  Maximize2,
} from "lucide-react";
import { Implementation } from "physics-engine";
import { useEffect, useState } from "react";
import { useSimulation } from "../contexts/SimulationContext";

export default function SettingsBar() {
  const { universe, setRender, setIsPropertyEditorOpen, isPropertyEditorOpen } =
    useSimulation();
  const [isPaused, setIsPaused] = useState(universe.get_is_paused());
  const [implementation, setImplementation] = useState<Implementation>(
    universe.get_implementation()
  );
  const [massCalculation, setMassCalculation] = useState(
    universe.get_mass_calculation()
  );
  const [showTrails, setShowTrails] = useState(universe.get_show_trails());

  const BASE_SPEED = 0.05; // 1x == 0.05
  const multipliers = [-4, -2, -1, -0.5, -0.25, 0, 0.25, 0.5, 1, 2, 4];
  const [multiplier, setMultiplier] = useState(() => {
    const current = universe.get_speed();
    return Math.round((current / BASE_SPEED) * 100) / 100;
  });

  useEffect(() => {
    universe.set_implementation(implementation);
    console.log("Implementation set to", implementation);
  }, [implementation]);

  useEffect(() => {
    universe.set_is_paused(isPaused);
    console.log("Simulation is now", isPaused ? "paused" : "playing");
    setRender((prev) => prev + 1);
  }, [isPaused]);

  const rewind = () => {
    const currentIndex = multipliers.indexOf(multiplier);
    const newIndex = Math.max(0, currentIndex - 1);
    const newMultiplier = multipliers[newIndex];
    setMultiplier(newMultiplier);
    universe.set_speed(newMultiplier * BASE_SPEED);
    setRender((prev) => prev + 1);
  };

  const fastForward = () => {
    const currentIndex = multipliers.indexOf(multiplier);
    const newIndex = Math.min(multipliers.length - 1, currentIndex + 1);
    const newMultiplier = multipliers[newIndex];
    setMultiplier(newMultiplier);
    universe.set_speed(newMultiplier * BASE_SPEED);
    setRender((prev) => prev + 1);
  };

  const reset = () => {
    const isPaused = universe.get_is_paused();
    universe.reset();
    universe.set_is_paused(isPaused);
    universe.set_mass_calculation(massCalculation);
    setMultiplier(1);
    universe.set_speed(1 * BASE_SPEED);
    setImplementation(implementation);
    setRender((prev) => prev + 1);
  };

  const resetView = () => {
    // Access the viewport through the stage children
    const app = (window as any).pixiApp;
    if (app && app.stage && app.stage.children) {
      const viewport = app.stage.children.find(
        (child: any) => child.constructor.name === "ViewportWrapper"
      );
      if (viewport) {
        viewport.position.set(app.canvas.width / 2, app.canvas.height / 3);
        viewport.scale.set(1, 1);
        viewport.rotation = 0;
      }
    }
  };

  return (
    <div className="w-fit py-2 px-4 bg-white border pointer-events-auto border-gray-200 rounded-lg shadow-xl">
      <div className="flex items-center justify-center divide-x  divide-gray-300">
        <div className="flex items-center gap-2 px-4">
          <button
            onClick={() => setImplementation(Implementation.Euler)}
            className={`p-2 rounded cursor-pointer transition-all duration-200 ${
              implementation === Implementation.Euler
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
            title="Euler Method"
          >
            <Calculator className="w-5 h-5" />
          </button>
          <button
            onClick={() => setImplementation(Implementation.RK4)}
            className={`p-2 rounded cursor-pointer transition-all duration-200 ${
              implementation === Implementation.RK4
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
            title="RK4 Method"
          >
            <ChartScatter className="w-5 h-5" />
          </button>
          {/* <button
            onClick={() => setImplementation("hamiltonian")}
            className={`p-2 rounded cursor-pointer ${
              implementation === "hamiltonian"
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
            title="Hamiltonian Method"
          >
            <GraduationCap className="w-5 h-5" />
          </button> */}
        </div>

        <div className="flex items-center gap-2 px-4">
          <button
            onClick={() => {
              universe.toggle_mass_calculation();
              setMassCalculation(universe.get_mass_calculation());
              setRender((prev) => prev + 1);
            }}
            className={`p-2 rounded cursor-pointer transition-all duration-200 ${
              massCalculation ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
            title={
              massCalculation
                ? "Mass Calculation Enabled"
                : "Mass Calculation Disabled"
            }
          >
            <Scale className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              universe.toggle_show_trails();
              setShowTrails(universe.get_show_trails());
              setRender((prev) => prev + 1);
            }}
            className={`p-2 rounded cursor-pointer transition-all duration-200 ${
              showTrails ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
            title={showTrails ? "Trails Visible" : "Trails Hidden"}
          >
            <Sparkles className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4">
          <div className="w-12 text-center">
            <p>{multiplier}x</p>
          </div>
          <button
            onClick={rewind}
            className={`p-2 rounded cursor-pointer transition-all duration-200 active:bg-blue-200 hover:bg-gray-100`}
            title="Rewind"
          >
            <Rewind className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 hover:bg-gray-100 rounded cursor-pointer transition-all duration-200"
            title={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? (
              <Play className="w-5 h-5" />
            ) : (
              <Pause className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={fastForward}
            className={`p-2 rounded cursor-pointer transition-all duration-200 active:bg-blue-200 hover:bg-gray-100`}
            title="Fast Forward"
          >
            <FastForward className="w-5 h-5" />
          </button>
          <button
            onClick={reset}
            className={`p-2 rounded cursor-pointer transition-all duration-200 active:bg-blue-200 hover:bg-gray-100`}
            title="Reset Simulation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4">
          <button
            onClick={() => {
              universe.add_bob_simple(Math.PI * 2.0 * Math.random());
              setRender((prev) => prev + 1);
            }}
            className={`p-2 rounded cursor-pointer transition-all duration-200 active:bg-blue-200 hover:bg-gray-100`}
            title="Add Bob"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPropertyEditorOpen(!isPropertyEditorOpen)}
            className={`p-2 hover:bg-gray-100 rounded cursor-pointer transition-all duration-200 ${
              isPropertyEditorOpen ? "bg-blue-100" : ""
            }`}
            title={
              isPropertyEditorOpen
                ? "Close Property Editor"
                : "Open Property Editor"
            }
          >
            <Edit3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              universe.remove_bob();
              setRender((prev) => prev + 1);
            }}
            className={`p-2 rounded cursor-pointer transition-all duration-200 active:bg-blue-200 hover:bg-gray-100`}
            title="Remove Bob"
          >
            <Minus className="w-5 h-5" />
          </button>
          <button
            onClick={resetView}
            className={`p-2 rounded cursor-pointer transition-all duration-200 active:bg-blue-200 hover:bg-gray-100`}
            title="Reset View"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
