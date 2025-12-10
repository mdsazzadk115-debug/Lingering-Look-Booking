import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND_COLOR } from '../constants';
import { Lock } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Updated password as requested
    if (password === 'linger123') {
        localStorage.setItem('isAdminAuthenticated', 'true');
        navigate('/admin/dashboard');
    } else {
        setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-pink-100">
                <Lock className="h-6 w-6 text-pink-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Staff Login</h2>
            <p className="mt-2 text-sm text-gray-600">Enter passcode to access dashboard</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                    <label htmlFor="password" className="sr-only">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div>
                <button
                    type="submit"
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    style={{ backgroundColor: BRAND_COLOR }}
                >
                    Sign in
                </button>
            </div>
            <div className="text-center mt-4">
                <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-600 hover:text-gray-900">
                    &larr; Back to Home
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;