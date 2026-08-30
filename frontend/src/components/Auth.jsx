import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/api/auth/login`, { email: formData.email, password: formData.password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        navigate(res.data.user.role === 'admin' ? '/admin' : '/');
      } else {
        await axios.post(`${API_URL}/api/auth/register`, formData);
        setIsLogin(true);
      }
    } catch (err) { setError(err.response?.data?.error || "Error occurred"); }
  };

  const inputClass = "w-full px-4 py-3 bg-[#2C2C2E] border border-[#38383A] focus:border-[#0A84FF] text-white rounded-xl outline-none transition-colors";

  return (
    <div className="max-w-sm mx-auto mt-20 bg-[#1C1C1E] rounded-3xl border border-[#38383A] p-8">
      <h2 className="text-2xl font-bold text-center text-white mb-2">{isLogin ? "Sign In" : "Create Account"}</h2>
      <p className="text-center text-[#86868B] text-sm mb-8">Access StudySpace AI</p>

      {error && <div className="bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/20 p-3 rounded-lg text-sm font-medium mb-4 text-center">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && <input type="text" placeholder="Full Name" required className={inputClass} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />}
        <input type="email" placeholder="Email Address" required className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
        <input type="password" placeholder="Password" required className={inputClass} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
        
        <button type="submit" className="w-full bg-[#0A84FF] text-white font-semibold py-3 rounded-xl hover:bg-[#007AFF] transition-colors mt-2">
          {isLogin ? "Sign In" : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-[#86868B] text-sm mt-6">
        {isLogin ? "No account? " : "Have an account? "}
        <button onClick={() => setIsLogin(!isLogin)} className="text-white font-medium hover:underline">
          {isLogin ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}