import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import CanvasPage, { CanvasPageHandle } from '../components/CanvasPage';
import Toolbar from '../components/Toolbar';
import { loadProjects, saveProjects } from '../utils/localStorage';
import type { ShapeType } from '../components/CanvasPage';
import type { Project as ProjectType } from '../App';  // ✅ 避免名稱衝突
import { useNavigate } from 'react-router-dom';
import '../App.css'

type DrawingBoardProps = {
  username: string;
  projects: ProjectType[];
  setProjects: React.Dispatch<React.SetStateAction<ProjectType[]>>;
};


const DrawingBoard = ({ username, projects, setProjects }: DrawingBoardProps) => {
  const { projectId } = useParams();
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(3);
  const [mode, setMode] = useState<ShapeType>('brush');
  const [zoom, setZoom] = useState(1);
  // const [projects, setProjects] = useState(loadProjects());
  const [currentPage, setCurrentPage] = useState(0);
  const canvasRef = useRef<CanvasPageHandle>(null);
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('Arial');

  const projectIndex = projects.findIndex((p: { id: string | undefined; }) => p.id === projectId);
  const project = projects[projectIndex];
  const navigate = useNavigate();

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

  const handleBringForward = () => {
    canvasRef.current?.bringForward();
  };

  const handleSendBackward = () => {
    canvasRef.current?.sendBackward();
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-indigo-600 mb-4">{project.title}</h2>
        <div className="mb-4">
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
        >
          🔙 Back to Projects
        </button>
      </div>

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

      <div className="flex items-center flex-wrap gap-2 my-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          Prev
        </button>
        <span className="text-gray-700 font-medium">
          Page {currentPage + 1} / {project.pages.length}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(project.pages.length - 1, p + 1))}
          className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
        >
          Next
        </button>

        <button
          onClick={addPage}
          className="ml-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          + Page
        </button>

        <button
          onClick={handleUndo}
          className="ml-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
        >
          Undo
        </button>
        <button
          onClick={handleRedo}
          className="ml-1 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
        >
          Redo
        </button>

        <button
          onClick={handleBringForward}
          className="ml-4 px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500"
        >
          Bring Forward
        </button>
        <button
          onClick={handleSendBackward}
          className="ml-1 px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500"
        >
          Send Backward
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4">
        <CanvasPage
          ref={canvasRef}
          color={color}
          thickness={thickness}
          mode={mode}
          zoom={zoom}
          fontSize={fontSize}
          fontFamily={fontFamily}
          lines={project.pages[currentPage]}
          setLines={setLines}
        />
      </div>
    </div>
  );
};

export default DrawingBoard;
