import { Bob, Rod } from "physics-engine";

export interface SandboxProps {
  random: boolean;
  width: number;
  height: number;
  count: number;
}
export interface BatchGraphicsProps {
  bobs: Array<Bob>;
  rods: Array<Rod>;
}

export interface UniverseInfo {
  width: number;
  height: number;
  count: number;
  random: boolean;
  qtv: boolean;
}

export const bgColors = [
  "bg-light-cyan",
  "bg-salmon",
  "bg-medium-blue",
  "bg-teal",
  "bg-orange-orange",
  "bg-really-red",
];

export const accentColors = [
  "accent-dark-blue",
  "accent-light-cyan",
  "accent-yellow-orange",
  "accent-salmon",
  "accent-medium-blue",
  "accent-teal",
  "accent-darkish-yellow",
  "accent-orange-orange",
  "accent-really-red",
];

export const textColors = [
  "text-light-cyan",
  "text-yellow-orange",
  "text-salmon",
  "text-medium-blue",
  "text-teal",
  "text-darkish-yellow",
  "text-orange-orange",
];
