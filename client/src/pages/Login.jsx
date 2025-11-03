import React, {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    try{
      const res = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      nav('/chat');
    }catch(e){ alert('Login failed'); }
  };
  return (
    <form onSubmit={submit} className="max-w-md space-y-3">
      <h2 className="text-xl font-semibold">Login</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full p-2" />
      <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2" />
      <button className="px-4 py-2 bg-slate-800 text-white rounded">Login</button>
    </form>
  );
}
