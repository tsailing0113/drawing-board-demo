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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-pink-100 px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-indigo-600">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Please login to your account</p>
        </div>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none transition"
          />
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-md shadow-md transition duration-200"
          >
            Login
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
