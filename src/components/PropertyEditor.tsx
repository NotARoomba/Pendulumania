import { X, GripVertical } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useSimulation } from "../contexts/SimulationContext";

export default function PropertyEditor() {
  const {
    universe,
    selectedBobIndex,
    isPropertyEditorOpen,
    setIsPropertyEditorOpen,
    render,
    setRender,
  } = useSimulation();

  // Get the selected bob
  const bob = useMemo(() => {
    return selectedBobIndex !== null
      ? universe.get_bob(selectedBobIndex)
      : null;
  }, [selectedBobIndex, universe, render]);

  // Check if mass calculation is enabled
  const isMassCalculationEnabled = universe.get_mass_calculation();

  const [position, setPosition] = useState({
    x: 10,
    y: 10,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);

  // Local state for input values and errors
  const [angleValue, setAngleValue] = useState("0.00");
  const [omegaValue, setOmegaValue] = useState("0.000");
  const [massValue, setMassValue] = useState("0.00");
  const [rodLengthValue, setRodLengthValue] = useState("0.0");
  const [radiusValue, setRadiusValue] = useState("0.0");

  // Error states
  const [angleError, setAngleError] = useState("");
  const [omegaError, setOmegaError] = useState("");
  const [massError, setMassError] = useState("");
  const [rodLengthError, setRodLengthError] = useState("");
  const [radiusError, setRadiusError] = useState("");

  // Track if user is actively editing to prevent auto-formatting
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Update local values when bob changes, but only if user is not actively editing
  useEffect(() => {
    // console.log("Updating PropertyEditor values from bob:", bob);
    if (!isEditing && bob) {
      setAngleValue(((bob.theta * 180) / Math.PI).toFixed(2));
      setOmegaValue(((bob.omega * 180) / Math.PI).toFixed(3));
      setMassValue(bob.mass.toFixed(2));
      setRodLengthValue(bob.rod ? bob.rod.length.toFixed(1) : "0");
      setRadiusValue(bob.radius.toFixed(1));
    }
  }, [bob, selectedBobIndex, isEditing]); // Update when bob properties or index changes

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  // Validation and update handlers
  const handlePropertyUpdate = (property: string, value: number) => {
    if (selectedBobIndex === null) return;

    switch (property) {
      case "theta":
        universe.update_bob_theta(selectedBobIndex, value);
        break;
      case "omega":
        universe.update_bob_omega(selectedBobIndex, value);
        break;
      case "mass":
        universe.update_bob_mass(selectedBobIndex, value);
        break;
      case "rod_length":
        universe.update_bob_length(selectedBobIndex, value);
        break;
      case "radius":
        universe.update_bob_radius(selectedBobIndex, value);
        break;
      case "color":
        universe.update_bob_color(selectedBobIndex, value);
        break;
    }

    // Trigger a re-render
    setRender((prev) => prev + 1);
  };

  const handleAngleChange = (value: string) => {
    setIsEditing("angle");
    setAngleValue(value);
    setAngleError("");

    if (value === "" || value === "-") return; // Allow empty and minus sign

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setAngleError("Please enter a valid number");
    } else {
      handlePropertyUpdate("theta", (numValue * Math.PI) / 180);
    }
  };

  const handleOmegaChange = (value: string) => {
    setIsEditing("omega");
    setOmegaValue(value);
    setOmegaError("");

    if (value === "" || value === "-") return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setOmegaError("Please enter a valid number");
    } else {
      // Convert degrees/s to radians/s
      handlePropertyUpdate("omega", (numValue * Math.PI) / 180);
    }
  };

  const handleMassChange = (value: string) => {
    setIsEditing("mass");
    setMassValue(value);
    setMassError("");

    if (value === "" || value === "-") return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setMassError("Please enter a valid number");
    } else if (numValue <= 0) {
      setMassError("Mass must be greater than 0");
    } else {
      handlePropertyUpdate("mass", numValue);
    }
  };

  const handleRodLengthChange = (value: string) => {
    setIsEditing("rodLength");
    setRodLengthValue(value);
    setRodLengthError("");

    if (value === "" || value === "-") return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setRodLengthError("Please enter a valid number");
    } else if (numValue <= 0) {
      setRodLengthError("Rod length must be greater than 0");
    } else {
      handlePropertyUpdate("rod_length", numValue);
    }
  };

  const handleRadiusChange = (value: string) => {
    setIsEditing("radius");
    setRadiusValue(value);
    setRadiusError("");

    if (value === "" || value === "-") return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setRadiusError("Please enter a valid number");
    } else if (numValue <= 0) {
      setRadiusError("Radius must be greater than 0");
    } else {
      handlePropertyUpdate("radius", numValue);
    }
  };

  if (!isPropertyEditorOpen || !bob) return null;

  return (
    <div
      ref={editorRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl pointer-events-auto max-h-3/4 overflow-y-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: "400px",
        minHeight: "500px",
        zIndex: 1000,
      }}
    >
      {/* Header with drag handle and close button */}
      <div className="flex sticky top-0 items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div
          className="flex items-center gap-2 cursor-move flex-1"
          onMouseDown={handleDragStart}
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
          <GripVertical className="w-5 h-5 text-gray-400 -ml-4" />
          <h2 className="text-lg font-semibold text-gray-800 ml-2">
            Edit Bob {selectedBobIndex !== null ? selectedBobIndex + 1 : 0}'s
            Properties
          </h2>
        </div>
        <button
          onClick={() => setIsPropertyEditorOpen(false)}
          className="p-1 hover:bg-gray-200 rounded transition-all duration-200"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Property fields */}
      <div className="p-4 space-y-4">
        {/* Angle θ */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Angle <span className="text-lg">θ</span>:
          </label>
          <input
            type="text"
            value={angleValue}
            onChange={(e) => handleAngleChange(e.target.value)}
            onBlur={() => setIsEditing(null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              angleError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Angle in degrees"
          />
          {angleError && (
            <span className="text-xs text-red-600">{angleError}</span>
          )}
          {!angleError && (
            <span className="text-xs text-gray-500">degrees</span>
          )}
        </div>

        {/* Angular velocity ω */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Angular Velocity <span className="text-lg">ω</span>:
          </label>
          <input
            type="text"
            value={omegaValue}
            onChange={(e) => handleOmegaChange(e.target.value)}
            onBlur={() => setIsEditing(null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              omegaError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Angular velocity"
          />
          {omegaError && (
            <span className="text-xs text-red-600">{omegaError}</span>
          )}
          {!omegaError && <span className="text-xs text-gray-500">deg/s</span>}
        </div>

        {/* Angular acceleration α - read only, calculated by physics */}
        {/* <div className="space-y-1 bg-gray-50 p-3 rounded-md">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Angular Acceleration <span className="text-lg">α</span>:
          </label>
          <div className="text-sm text-gray-600">
            (Calculated by physics engine)
          </div>
        </div> */}

        {/* Mass m */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Mass <span className="text-lg">m</span>:
            {!isMassCalculationEnabled && (
              <span className="text-xs text-gray-400 font-normal">
                (disabled - enable in the settings bar)
              </span>
            )}
          </label>
          <input
            type="text"
            value={massValue}
            onChange={(e) => handleMassChange(e.target.value)}
            onBlur={() => setIsEditing(null)}
            disabled={!isMassCalculationEnabled}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              massError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            } ${
              !isMassCalculationEnabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : ""
            }`}
            placeholder="Mass"
          />
          {massError && (
            <span className="text-xs text-red-600">{massError}</span>
          )}
          {!massError && <span className="text-xs text-gray-500">kg</span>}
        </div>

        {/* Rod Length ℓ */}
        {bob.rod && (
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              Rod Length <span className="text-lg">ℓ</span>:
            </label>
            <input
              type="text"
              value={rodLengthValue}
              onChange={(e) => handleRodLengthChange(e.target.value)}
              onBlur={() => setIsEditing(null)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                rodLengthError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="Rod length"
            />
            {rodLengthError && (
              <span className="text-xs text-red-600">{rodLengthError}</span>
            )}
            {!rodLengthError && (
              <span className="text-xs text-gray-500">pixels</span>
            )}
          </div>
        )}

        {/* Radius */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Radius <span className="text-lg">r</span>:
          </label>
          <input
            type="text"
            value={radiusValue}
            onChange={(e) => handleRadiusChange(e.target.value)}
            onBlur={() => setIsEditing(null)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              radiusError
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Radius"
          />
          {radiusError && (
            <span className="text-xs text-red-600">{radiusError}</span>
          )}
          {!radiusError && (
            <span className="text-xs text-gray-500">pixels</span>
          )}
        </div>

        {/* Position */}
        <div className="space-y-1 bg-gray-50 p-3 rounded-md">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Position:
          </label>
          <div className="text-sm text-gray-600">
            <div>x: {bob.pos.x.toFixed(2)} px</div>
            <div>y: {bob.pos.y.toFixed(2)} px</div>
          </div>
        </div>
      </div>
    </div>
  );
}
