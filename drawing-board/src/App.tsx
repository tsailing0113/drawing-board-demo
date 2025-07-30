import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import DrawingBoard from './pages/DrawingBoard';
import Login from './pages/Login';
import { loadProjects, saveProjects, getCurrentUser } from './utils/localStorage';
import type { Project } from './utils/localStorage';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('loggedIn') === 'true');
  const [loggedInUser, setLoggedInUser] = useState(() => localStorage.getItem('username') || '');
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = localStorage.getItem(`projects-${localStorage.getItem('username')}`);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    if (loggedInUser) {
      const stored = localStorage.getItem(`projects-${loggedInUser}`);
      setProjects(stored ? JSON.parse(stored) : []);
    }
  }, [loggedInUser]);

  const handleLogin = (username: string) => {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('username', username);
    setLoggedIn(true);
    setLoggedInUser(username);
    const userProjects = loadProjects();
    setProjects(userProjects);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    setLoggedIn(false);
    setLoggedInUser('');
    setProjects([]);
  };

  useEffect(() => {
    if (loggedIn) {
      saveProjects(projects);
    }
  }, [projects, loggedIn]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            loggedIn ? (
              <Navigate to={`/users/${loggedInUser}/projects`} />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/users/:username/projects"
          element={
            loggedIn ? (
              <ProjectList
                username={loggedInUser}
                onLogout={handleLogout}
                projects={projects}
                setProjects={setProjects}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/users/:username/projects/:projectId"
          element={
            loggedIn ? (
              <DrawingBoard
                username={loggedInUser}
                projects={projects}
                setProjects={setProjects}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
