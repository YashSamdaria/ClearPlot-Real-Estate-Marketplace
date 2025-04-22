import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 👈

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(false); // 👈 track loading

  const onRegister = async (e) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true); // start loading

    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message); // "User registered successfully"
        setName('');
        setEmail('');
        setPassword('');
        navigate('/properties'); 
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      alert('Something went wrong');
    }finally {
      setLoading(false); // stop loading regardless of outcome
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background image from public/images/bg.jpeg */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-sm brightness-50"
        style={{ backgroundImage: "url('/images/bg.jpeg')" }}
      />

      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black opacity-40"></div>

      {/* Register form */}
      <div className="relative z-10 bg-white bg-opacity-90 rounded-xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-[#0a0f1c]">Register for ClearPLOT</h2>
        <form className="space-y-4" onSubmit={onRegister}>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading} // 👈 disable while loading
            className={`w-full font-semibold py-2 rounded-md transition ${
              loading
                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                : 'bg-[#FFD700] text-[#0a0f1c] hover:bg-white'
            }`}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
