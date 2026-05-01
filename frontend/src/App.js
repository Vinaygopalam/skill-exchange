import MySkills from './pages/MySkills';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostSkill from './pages/PostSkill';
import Requests from './pages/Requests';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import EditSkill from './pages/EditSkill';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/my-skills" element={<MySkills />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/post-skill" element={<PostSkill />} />
          <Route path="/requests" element={<Requests />} />
          <Route path="/chat/:roomId" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-skill/:id" element={<EditSkill />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;