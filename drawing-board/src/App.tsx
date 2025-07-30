import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import DrawingBoard from './pages/DrawingBoard';
import Login from './pages/Login';
import './App.css'

export type Project = {
  id: string;
  title: string;
  pages: any[][];
};

function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('loggedIn') === 'true');
  const [loggedInUser, setLoggedInUser] = useState(() => localStorage.getItem('username') || '');
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = localStorage.getItem(`projects-${localStorage.getItem('username')}`);
    return stored ? JSON.parse(stored) : [];
  });

  const handleLogin = (username: string) => {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('username', username);
    setLoggedIn(true);
    setLoggedInUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    setLoggedIn(false);
    setLoggedInUser('');
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            loggedIn ? (
              <Navigate to="/projects" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/projects"
          element={
            loggedIn ? (
              <ProjectList username={loggedInUser} onLogout={handleLogout} projects={projects} setProjects={setProjects} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/project/:projectId"
          element={
            loggedIn ? (
              <DrawingBoard username={loggedInUser} projects={projects} setProjects={setProjects} />
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
