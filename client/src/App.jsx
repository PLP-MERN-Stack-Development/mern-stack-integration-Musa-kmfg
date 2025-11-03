import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App(){
  return (
    <div>
      <header className="bg-white shadow-sm">
        <div className="container flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold">Socket Chat</Link>
          <nav>
            <Link to="/chat" className="mr-4">Chat</Link>
            <Link to="/login">Login</Link>
          </nav>
        </div>
      </header>
      <main className="container mt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
}
