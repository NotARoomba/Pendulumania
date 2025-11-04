import { GripVertical, X } from "lucide-react";
import { Universe } from "physics-engine";
import { useState, useRef, useEffect } from "react";

interface BobEditorProps {
  universe: Universe;
  editingBobIndex: number | null;
  setEditingBobIndex: (index: number | null) => void;
  editingRodIndex: number | null;
  setEditingRodIndex: (index: number | null) => void;
  onUpdate?: () => void;
}

export default function BobEditor({
  universe,
  editingBobIndex,
  setEditingBobIndex,
  editingRodIndex,
  setEditingRodIndex,
  onUpdate,
}: BobEditorProps) {
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (editorRef.current) {
      const rect = editorRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

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
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleClose = () => {
    setEditingBobIndex(null);
    setEditingRodIndex(null);
  };

  const triggerUpdate = () => {
    if (onUpdate) onUpdate();
  };

  // Don't render if nothing is being edited
  if (editingBobIndex === null && editingRodIndex === null) {
    return null;
  }

  // Render Bob Editor
  if (editingBobIndex !== null) {
    const bobs = universe.get_bobs();
    const bob = bobs[editingBobIndex];

    if (!bob) return null;

    return (
      <div
        ref={editorRef}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000,
        }}
        className="bg-white border-2 border-gray-300 rounded-xl shadow-2xl w-96 select-none"
      >
        {/* Header with drag handle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onMouseDown={handleMouseDown}
              className="cursor-move p-1 hover:bg-gray-100 rounded transition-colors"
              title="Drag to move"
            >
              <GripVertical className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              Edit Bob {editingBobIndex + 1}'s Properties
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Angle θ (theta):
            </label>
            <input
              type="number"
              step="0.1"
              value={((bob.theta * 180) / Math.PI).toFixed(2)}
              onChange={(e) => {
                const degrees = parseFloat(e.target.value);
                const radians = (degrees * Math.PI) / 180;
                universe.update_bob_theta(editingBobIndex, radians);
                triggerUpdate();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">degrees</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Angular Velocity ω (omega):
            </label>
            <input
              type="number"
              step="0.01"
              value={bob.omega.toFixed(4)}
              onChange={(e) => {
                const newOmega = parseFloat(e.target.value);
                bob.omega = newOmega;
                triggerUpdate();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">rad/s</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rod Length:
            </label>
            <input
              type="number"
              step="1"
              value={bob.rod?.length.toFixed(1) || 0}
              onChange={(e) => {
                const newLength = parseFloat(e.target.value);
                universe.update_bob_length(
                  editingBobIndex,
                  Math.max(10, newLength)
                );
                triggerUpdate();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">pixels</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mass:
            </label>
            <input
              type="number"
              step="0.1"
              value={bob.mass.toFixed(2)}
              onChange={(e) => {
                const newMass = parseFloat(e.target.value);
                universe.update_bob_mass(
                  editingBobIndex,
                  Math.max(0.1, newMass)
                );
                triggerUpdate();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">kg</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius:
            </label>
            <input
              type="number"
              step="1"
              value={bob.radius.toFixed(1)}
              onChange={(e) => {
                const newRadius = parseFloat(e.target.value);
                bob.radius = Math.max(5, newRadius);
                triggerUpdate();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">pixels</span>
          </div>
        </div>
      </div>
    );
  }

  // Render Rod Editor
  if (editingRodIndex !== null) {
    const bobs = universe.get_bobs();
    const bob = bobs[editingRodIndex];

    if (!bob || !bob.rod) return null;

    return (
      <div
        ref={editorRef}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000,
        }}
        className="bg-white border-2 border-gray-300 rounded-xl shadow-2xl w-96 select-none"
      >
        {/* Header with drag handle */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onMouseDown={handleMouseDown}
              className="cursor-move p-1 hover:bg-gray-100 rounded transition-colors"
              title="Drag to move"
            >
              <GripVertical className="w-5 h-5 text-gray-500" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              Edit Rod {editingRodIndex + 1}'s Properties
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Length:
            </label>
            <input
              type="number"
              step="1"
              value={bob.rod.length.toFixed(1)}
              onChange={(e) => {
                const newLength = parseFloat(e.target.value);
                universe.update_bob_length(
                  editingRodIndex,
                  Math.max(10, newLength)
                );
                triggerUpdate();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">pixels</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mass:
            </label>
            <input
              type="number"
              step="0.1"
              value={bob.rod.mass.toFixed(2)}
              onChange={(e) => {
                const newMass = parseFloat(e.target.value);
                bob.rod.mass = Math.max(0.1, newMass);
                triggerUpdate();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-gray-500">kg</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
