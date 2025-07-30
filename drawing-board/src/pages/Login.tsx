import React, { useState } from 'react';

type LoginProps = {
  onLogin: (username: string) => void;
};

const mockUsers = [
  { username: 'admin', password: '1234' },
  { username: 'wendy', password: '5678' },
];

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    const matchedUser = mockUsers.find(
      (user) => user.username === username && user.password === password
    );

    if (matchedUser) {
      onLogin(matchedUser.username);
    } else {
      setError('❌ Invalid username or password');
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Login</h2>
      <div style={{ marginBottom: 10 }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: 10 }}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
