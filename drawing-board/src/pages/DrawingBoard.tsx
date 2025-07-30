import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CanvasPage, { CanvasPageHandle } from '../components/CanvasPage';
import Toolbar from '../components/Toolbar';
import { loadProjects, saveProjects } from '../utils/localStorage';
import type { ShapeType } from '../components/CanvasPage'; // ← 引入 ShapeType

const DrawingBoard = () => {
  const { projectId } = useParams();
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(3);
  const [mode, setMode] = useState<ShapeType>('brush'); // ✅ 指定類型
  const [zoom, setZoom] = useState(1);
  const [projects, setProjects] = useState(loadProjects());
  const [currentPage, setCurrentPage] = useState(0);
  const canvasRef = useRef<CanvasPageHandle>(null);
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('Arial');
  
  const projectIndex = projects.findIndex((p) => p.id === projectId);
  const project = projects[projectIndex];

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  if (!project) return <div>Project not found.</div>;

  const setLines = (lines: any[]) => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].pages[currentPage] = lines;
    setProjects(updatedProjects);
  };

  const addPage = () => {
    const updatedProjects = [...projects];
    updatedProjects[projectIndex].pages.push([]);
    setProjects(updatedProjects);
    setCurrentPage(updatedProjects[projectIndex].pages.length - 1);
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{project.title}</h2>

      <Toolbar
  color={color}
  setColor={setColor}
  thickness={thickness}
  setThickness={setThickness}
  mode={mode}
  setMode={setMode}
  zoom={zoom}
  setZoom={setZoom}
  fontSize={fontSize}
  setFontSize={setFontSize}
  fontFamily={fontFamily}
  setFontFamily={setFontFamily}
/>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}>Prev</button>
        <span style={{ margin: '0 10px' }}>
          Page {currentPage + 1} / {project.pages.length}
        </span>
        <button onClick={() => setCurrentPage((p) => Math.min(project.pages.length - 1, p + 1))}>
          Next
        </button>
        <button onClick={addPage} style={{ marginLeft: 10 }}>
          + Page
        </button>
        <button onClick={handleUndo} style={{ marginLeft: 10 }}>
          Undo
        </button>
        <button onClick={handleRedo} style={{ marginLeft: 5 }}>
          Redo
        </button>
      </div>

      <CanvasPage
        ref={canvasRef}
        color={color}
        thickness={thickness}
        mode={mode}
        zoom={zoom}
        fontSize={fontSize}
        fontFamily={fontFamily}
      />
    </div>
  );
};

export default DrawingBoard;
