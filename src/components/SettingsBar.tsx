import { Rewind, Pause, Play, FastForward } from "lucide-react";
import type { Universe } from "physics-engine";
import { useEffect, useState } from "react";

export default function SettingsBar({ universe }: { universe: Universe }) {
  const [isPaused, setIsPaused] = useState(universe.get_is_paused());
  const [implementation, setImplementation] = useState<
    "euler" | "rk4" | "matrices"
  >("rk4");
  const [isRewindHeld, setIsRewindHeld] = useState(false);
  const [isFastForwardHeld, setIsFastForwardHeld] = useState(false);

  useEffect(() => {
    console.log("Implementation changed to:", implementation);
  }, [implementation]);

  useEffect(() => {
    universe.set_is_paused(isPaused);
    console.log("Simulation is now", isPaused ? "paused" : "playing");
  }, [isPaused]);

  useEffect(() => {
    if (!isRewindHeld) return;
    const interval = setInterval(() => {
      universe.set_speed(universe.get_speed() - 0.01);
    }, 50);
    return () => clearInterval(interval);
  }, [isRewindHeld, universe]);

  useEffect(() => {
    if (!isFastForwardHeld) return;
    const interval = setInterval(() => {
      universe.set_speed(universe.get_speed() + 0.01);
    }, 50);
    return () => clearInterval(interval);
  }, [isFastForwardHeld, universe]);

  return (
    <div className="w-fit py-2 px-4 bg-white border pointer-events-auto border-gray-200 rounded-lg shadow-xl">
      <div className="flex items-center justify-center divide-x  divide-gray-300">
        {/* <div className="flex items-center gap-2 px-4">
          <button
            onClick={() => setImplementation("euler")}
            className={`p-2 rounded cursor-pointer ${
              implementation === "euler" ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
            title="Euler Method"
          >
            <Calculator className="w-5 h-5" />
          </button>
          <button
            onClick={() => setImplementation("rk4")}
            className={`p-2 rounded cursor-pointer ${
              implementation === "rk4" ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
            title="RK4 Method"
          >
            <ChartScatter className="w-5 h-5" />
          </button>
          <button
            onClick={() => setImplementation("matrices")}
            className={`p-2 rounded cursor-pointer ${
              implementation === "matrices"
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
            title="Hamiltonian Method"
          >
            <GraduationCap className="w-5 h-5" />
          </button>
        </div> */}

        <div className="flex items-center gap-2 px-4">
          <button
            onMouseDown={() => setIsRewindHeld(true)}
            onMouseUp={() => setIsRewindHeld(false)}
            onMouseLeave={() => setIsRewindHeld(false)}
            className={`p-2 rounded cursor-pointer transition-colors ${
              isRewindHeld ? "bg-blue-200" : "hover:bg-gray-100"
            }`}
            title="Rewind (hold to continuous)"
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
            onMouseDown={() => setIsFastForwardHeld(true)}
            onMouseUp={() => setIsFastForwardHeld(false)}
            onMouseLeave={() => setIsFastForwardHeld(false)}
            className={`p-2 rounded cursor-pointer transition-colors ${
              isFastForwardHeld ? "bg-blue-200" : "hover:bg-gray-100"
            }`}
            title="Fast Forward (hold to continuous)"
          >
            <FastForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
