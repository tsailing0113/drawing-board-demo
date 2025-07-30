import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import type { Project } from '../App';
import '../App.css'

type Props = {
  username: string;
  onLogout: () => void;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
};

const ProjectList: React.FC<Props> = ({ username, onLogout, projects, setProjects }) => {
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  const handleCreateProject = () => {
    if (!newTitle.trim()) return;

    const newProject: Project = {
      id: uuidv4(),
      title: newTitle.trim(),
      pages: [[]], // 初始空白畫布
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem(`projects-${username}`, JSON.stringify(updatedProjects));

    navigate(`/project/${newProject.id}`);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all projects?')) {
      localStorage.removeItem(`projects-${username}`);
      setProjects([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h2 className="text-2xl font-bold text-indigo-600 mb-4">
          Welcome, {username}!
        </h2>

        <div className="flex gap-2 mb-6">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter project title"
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleCreateProject}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md"
          >
            + New
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={handleClearAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            🗑️ Clear All
          </button>
          <button
            onClick={onLogout}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            🔓 Logout
          </button>
        </div>

        <hr className="my-4" />

        <div>
          {projects.length === 0 && (
            <p className="text-gray-500 text-center">No projects yet.</p>
          )}
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.id}>
                <button
                  onClick={() => navigate(`/project/${project.id}`)}
                  className="w-full text-left px-4 py-2 bg-indigo-100 hover:bg-indigo-200 rounded-md"
                >
                  🖌️ {project.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;
