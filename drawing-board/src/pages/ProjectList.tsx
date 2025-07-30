import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import type { Project } from '../App';

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
    <div style={{ padding: 20 }}>
      <h2>Welcome, {username}!</h2>
      <input
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        placeholder="Enter project title"
      />
      <button onClick={handleCreateProject}>+ New Project</button>
      <button onClick={handleClearAll} style={{ marginLeft: 10 }}>🗑️ Clear All</button>
      <button onClick={onLogout} style={{ marginLeft: 10 }}>🔓 Logout</button>

      <hr />

      <div>
        {projects.length === 0 && <p>No projects yet.</p>}
        {projects.map((project) => (
          <div key={project.id} style={{ margin: '10px 0' }}>
            <button onClick={() => navigate(`/project/${project.id}`)}>
              🖌️ {project.title}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
