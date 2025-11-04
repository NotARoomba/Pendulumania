import {
  Rewind,
  Pause,
  Play,
  FastForward,
  RotateCcw,
  Calculator,
  ChartScatter,
  Plus,
  Edit3,
  Save,
  Minus,
} from "lucide-react";
import { Implementation, Universe } from "physics-engine";
import { useEffect, useState } from "react";

export default function SettingsBar({ universe }: { universe: Universe }) {
  const [isPaused, setIsPaused] = useState(universe.get_is_paused());
  const [implementation, setImplementation] = useState<Implementation>(
    universe.get_implementation()
  );

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
  }, [isPaused]);

  const rewind = () => {
    const currentIndex = multipliers.indexOf(multiplier);
    const newIndex = Math.max(0, currentIndex - 1);
    const newMultiplier = multipliers[newIndex];
    setMultiplier(newMultiplier);
    universe.set_speed(newMultiplier * BASE_SPEED);
  };

  const fastForward = () => {
    const currentIndex = multipliers.indexOf(multiplier);
    const newIndex = Math.min(multipliers.length - 1, currentIndex + 1);
    const newMultiplier = multipliers[newIndex];
    setMultiplier(newMultiplier);
    universe.set_speed(newMultiplier * BASE_SPEED);
  };

  const reset = () => {
    const isPaused = universe.get_is_paused();
    universe.reset();
    universe.set_is_paused(isPaused);
    setMultiplier(1);
    universe.set_speed(1 * BASE_SPEED);
    setImplementation(universe.get_implementation());
  };

  return (
    <div className="w-fit py-2 px-4 bg-white border pointer-events-auto border-gray-200 rounded-lg shadow-xl">
      <div className="flex items-center justify-center divide-x  divide-gray-300">
        <div className="flex items-center gap-2 px-4">
          <button
            onClick={() => setImplementation(Implementation.Euler)}
            className={`p-2 rounded cursor-pointer ${
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
            className={`p-2 rounded cursor-pointer ${
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
          <div className="">
            <p>{multiplier}x</p>
          </div>
          <button
            onClick={rewind}
            className={`p-2 rounded cursor-pointer transition-colors active:bg-blue-200 hover:bg-gray-100`}
            title="Rewind"
          >
            <Rewind className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 hover:bg-gray-100 rounded cursor-pointer"
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
            className={`p-2 rounded cursor-pointer transition-colors active:bg-blue-200 hover:bg-gray-100`}
            title="Fast Forward"
          >
            <FastForward className="w-5 h-5" />
          </button>
          <button
            onClick={reset}
            className={`p-2 rounded cursor-pointer transition-colors active:bg-blue-200 hover:bg-gray-100`}
            title="Reset Simulation"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 px-4">
          <button
            onClick={() => {
              universe.add_bob_simple(Math.PI * 2.0 * Math.random());
            }}
            className={`p-2 rounded cursor-pointer transition-colors active:bg-blue-200 hover:bg-gray-100`}
            title="Add Bob"
          >
            <Plus className="w-5 h-5" />
          </button>
          {/* <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded cursor-pointer"
            title={isEditing ? "Save" : "Editing Mode"}
          >
            {isEditing ? (
              <Save className="w-5 h-5" />
            ) : (
              <Edit3 className="w-5 h-5" />
            )}
          </button> */}
          <button
            onClick={() => {
              universe.remove_bob();
            }}
            className={`p-2 rounded cursor-pointer transition-colors active:bg-blue-200 hover:bg-gray-100`}
            title="Remove Bob"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
