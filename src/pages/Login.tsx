import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('bdp.0231@gmail.com');
  const [password, setPassword] = useState('password123');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState('');
  const [otp, setOtp] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      login(data);
      toast.success('Welcome back!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForOtp }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      toast.success('OTP sent to your email');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailForOtp, otp }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP login failed');
      
      login(data);
      toast.success('Logged in with OTP!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900 text-white items-center justify-center px-12">
        <div className="max-w-md space-y-10">
          <div className="flex items-center justify-center">
            <Package className="w-16 h-16 text-emerald-200" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight">CoreInventory</h1>
            <p className="text-base text-emerald-100">
              Streamline your stock operations with real-time tracking, powerful analytics, and seamless warehouse management.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900">Sign in to your account</h2>
            <p className="mt-2 text-sm text-slate-600">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <div className="bg-white py-8 px-8 shadow-xl rounded-2xl border border-slate-100">
            {!forgotPassword ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email address</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl py-2 border"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl py-2 border"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Sign in
                  </button>
                </div>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email address</label>
                  <div className="mt-1 relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={emailForOtp}
                      onChange={(e) => setEmailForOtp(e.target.value)}
                      className="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-slate-200 rounded-xl py-2 border"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Send OTP
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Enter OTP</label>
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-slate-200 rounded-xl py-2 border"
                    placeholder="123456"
                  />
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleOtpLogin}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Login with OTP
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-slate-500">
              {!forgotPassword ? (
                <>
                  Don’t have an account?{' '}
                  <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-700">
                    Request access
                  </Link>
                  <br />
                  <button onClick={() => setForgotPassword(true)} className="font-medium text-emerald-600 hover:text-emerald-700">
                    Forgot Password?
                  </button>
                </>
              ) : (
                <button onClick={() => setForgotPassword(false)} className="font-medium text-emerald-600 hover:text-emerald-700">
                  Back to Password Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
