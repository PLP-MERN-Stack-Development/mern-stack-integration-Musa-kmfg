import React, { useEffect, useState, useRef } from 'react';
import { connect, getSocket } from '../socket/client';
import axios from 'axios';

export default function Chat(){
  const [users,setUsers]=useState([]); const [messages,setMessages]=useState([]); const [selected, setSelected] = useState(null);
  const [content,setContent]=useState(''); const socketRef = useRef(null);

  useEffect(()=> {
    const token = localStorage.getItem('token');
    if(!token){ return; }
    socketRef.current = connect(token);
    const s = socketRef.current;
    s.on('connect', ()=> console.log('socket connected', s.id));
    s.on('message', (m) => setMessages(prev => [...prev, m]));
    s.on('presence', ({ userId, online }) => setUsers(prev => prev.map(u => u._id===userId ? {...u, online} : u)));
    s.on('read-receipt', ({ messageId, userId }) => {
      setMessages(prev=> prev.map(m => m._id===messageId ? {...m, readBy: [...(m.readBy||[]), userId]} : m));
    });
    s.on('typing', ({ userId }) => { console.log('typing from', userId); });

    axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/users')
      .then(r=> setUsers(r.data))
      .catch(()=>{});

    return ()=> { s.disconnect(); };
  },[]);

  const send = () => {
    const s = getSocket();
    if(!s) return alert('Not connected');
    const payload = { content, to: selected ? selected._id : null };
    s.emit('send-message', payload);
    setContent('');
  };

  const markRead = (msgId) => {
    const s = getSocket();
    if(!s) return;
    s.emit('mark-read', { messageId: msgId });
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      <aside className="col-span-1">
        <h3 className="font-semibold">Users</h3>
        <ul className="space-y-2">
          {users.map(u => <li key={u._id} className={"p-2 bg-white rounded " + (u.online ? 'ring-2 ring-green-300' : '')} onClick={()=>setSelected(u)}>{u.name} {u.online ? '(online)' : ''}</li>)}
        </ul>
      </aside>
      <section className="col-span-2 space-y-3">
        <div className="bg-white p-3 rounded h-96 overflow-auto">
          {messages.map(m => (
            <div key={m._id} className="mb-2">
              <div className="text-sm text-slate-600">{m.from?.name}</div>
              <div className="bg-slate-100 p-2 rounded">{m.content}</div>
              <div className="text-xs text-slate-500">Read by: {(m.readBy||[]).length}</div>
              <button onClick={()=>markRead(m._id)} className="text-xs text-blue-600">Mark Read</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={content} onChange={e=>setContent(e.target.value)} onKeyDown={()=> getSocket()?.emit('typing',{ to: selected?._id })} className="flex-1 p-2" placeholder="Message..." />
          <button onClick={send} className="px-3 py-2 bg-slate-800 text-white rounded">Send</button>
        </div>
      </section>
    </div>
  );
}
