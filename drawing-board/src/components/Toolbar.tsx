import React from 'react';
import type { ShapeType } from './CanvasPage'; // 確保有 import
import '../App.css'

type ToolbarProps = {
  color: string;
  setColor: (c: string) => void;
  thickness: number;
  setThickness: (n: number) => void;
  mode: ShapeType;
  setMode: (m: ShapeType) => void;
  zoom: number;
  setZoom: (z: number) => void;
  fontSize: number;
  setFontSize: (n: number) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
};

const Toolbar = ({
  color,
  setColor,
  thickness,
  setThickness,
  mode,
  setMode,
  zoom,
  setZoom,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily
}: ToolbarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-md shadow-sm border">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Tool:</label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as ShapeType)}
          className="px-2 py-1 border rounded-md text-sm"
        >
          <option value="brush">Brush</option>
          <option value="eraser">Eraser</option>
          <option value="rect">Rectangle</option>
          <option value="circle">Circle</option>
          <option value="triangle">Triangle</option>
          <option value="arrow">Arrow</option>
          <option value="text">Text</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Color:</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 p-0 border rounded"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Thickness:</label>
        <input
          type="range"
          min={1}
          max={20}
          value={thickness}
          onChange={(e) => setThickness(Number(e.target.value))}
          className="w-24"
        />
        <span className="text-sm">{thickness}px</span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Font Size:</label>
        <input
          type="number"
          min={10}
          max={100}
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          className="w-16 px-2 py-1 border rounded-md text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Font Family:</label>
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="px-2 py-1 border rounded-md text-sm"
        >
          <option value="Arial">Arial</option>
          <option value="Courier New">Courier New</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Zoom:</label>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-24"
        />
        <span className="text-sm">{zoom.toFixed(1)}x</span>
      </div>
    </div>
  );
};

export default Toolbar;
