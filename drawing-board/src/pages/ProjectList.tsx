import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { loadProjects, saveProjects } from '../utils/localStorage';

const ProjectList = () => {
  const [projects, setProjects] = useState<{ id: string; title: string; pages: any[][] }[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const loaded = loadProjects();
    setProjects(loaded);
  }, []);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const createProject = () => {
    if (!newTitle.trim()) return;
    const newProject = {
      id: uuidv4(),
      title: newTitle.trim(),
      pages: [[]] // 初始一頁空白
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    setNewTitle('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>My Projects</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter project title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button onClick={createProject} style={{ marginLeft: 10 }}>
          + New Project
        </button>
      </div>

      <ul>
        {projects.map((project) => (
          <li key={project.id} style={{ marginBottom: 10 }}>
            <button onClick={() => navigate(`/project/${project.id}`)}>
              {project.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectList;
