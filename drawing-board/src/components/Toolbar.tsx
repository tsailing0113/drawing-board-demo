import React from 'react';
import type { ShapeType } from './CanvasPage'; // 確保有 import


type ToolbarProps = {
  color: string;
  setColor: (c: string) => void;
  thickness: number;
  setThickness: (n: number) => void;
  mode: ShapeType;
  setMode: (m: ShapeType) => void; // ✅ 改這裡！
  zoom: number;
  setZoom: (z: number) => void;
};

const Toolbar = ({
  color,
  setColor,
  thickness,
  setThickness,
  mode,
  setMode,
  zoom,
  setZoom
}: ToolbarProps) => {
  return (
    <div style={{ marginBottom: 10, display: 'flex', gap: '10px', alignItems: 'center' }}>
      <label>Tool:</label>
      <select value={mode} onChange={(e) => setMode(e.target.value as ShapeType)}>
        <option value="brush">Brush</option>
        <option value="eraser">Eraser</option>
        <option value="rect">Rectangle</option>
        <option value="circle">Circle</option>
        <option value="triangle">Triangle</option>
        <option value="arrow">Arrow</option>
        <option value="text">Text</option>
      </select>

      <label>Color:</label>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        style={{ width: 40, height: 30 }}
      />

      <label>Thickness:</label>
      <input
        type="range"
        min={1}
        max={20}
        value={thickness}
        onChange={(e) => setThickness(Number(e.target.value))}
      />
      <span>{thickness}px</span>

      <label>Zoom:</label>
      <input
        type="range"
        min={0.5}
        max={2}
        step={0.1}
        value={zoom}
        onChange={(e) => setZoom(Number(e.target.value))}
      />
      <span>{zoom.toFixed(1)}x</span>
    </div>
  );
};

export default Toolbar;
