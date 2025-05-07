import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { SERVER_URL } from '../config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(false); 

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // start loading

    try {
      const response = await fetch(`${SERVER_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Login successful!');
        localStorage.setItem('token', data.token); // Save JWT token
        navigate('/properties');
        // Optionally redirect to dashboard
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong');
    }finally {
      setLoading(false); // stop loading regardless of outcome
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm brightness-50"
        style={{ backgroundImage: `url('/images/bg.jpeg')` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-30"></div>

      {/* Login Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-[#0a0f1c] mb-6">Login to ClearPLOT</h2>
        <form className="space-y-4" onSubmit={onLogin}>
          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading} // 👈 disable while loading
            className={`w-full font-semibold py-2 rounded-md transition ${
              loading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-[#FFD700] text-[#0a0f1c] hover:bg-white'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
