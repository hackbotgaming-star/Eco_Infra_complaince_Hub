import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Lock, Mail, User, Shield, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, register, quickLogin } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'COMPLIANCE_STAFF',
    department: 'Site Environmental Engineering',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegistering) {
        await register(formData);
      } else {
        await login(formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      await quickLogin(role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-xl shadow-emerald-500/20 group-hover:scale-105 transition">
            <Leaf className="w-6 h-6 text-slate-950" />
          </div>
          <span className="font-extrabold text-xl text-white tracking-tight leading-tight">
            Eco Infra<span className="text-emerald-400"> Compliance Hub</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isRegistering ? 'Create your account' : 'Sign in to Eco Infra Compliance Hub'}
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          Environmental Compliance Management Platform for Infrastructure Projects
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        {/* Quick Demo Switcher Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 backdrop-blur-md shadow-xl">
          <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> 1-Click Demo Persona Access
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-semibold transition border border-slate-800 text-left group"
            >
              <div className="font-bold group-hover:text-slate-950 text-white">1. Admin</div>
              <div className="text-[10px] text-slate-400 group-hover:text-slate-900">Dr. Sengupta</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('PROJECT_MANAGER')}
              className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-semibold transition border border-slate-800 text-left group"
            >
              <div className="font-bold group-hover:text-slate-950 text-white">2. Project Mgr</div>
              <div className="text-[10px] text-slate-400 group-hover:text-slate-900">Sarah Jenkins</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('ENVIRONMENTAL_OFFICER')}
              className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-semibold transition border border-slate-800 text-left group"
            >
              <div className="font-bold group-hover:text-slate-950 text-white">3. Enviro Officer</div>
              <div className="text-[10px] text-slate-400 group-hover:text-slate-900">Arunabh Sharma</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('COMPLIANCE_STAFF')}
              className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 font-semibold transition border border-slate-800 text-left group"
            >
              <div className="font-bold group-hover:text-slate-950 text-white">4. Compliance Staff</div>
              <div className="text-[10px] text-slate-400 group-hover:text-slate-900">Elena Rodriguez</div>
            </button>
          </div>
        </div>

        {/* Credentials Form Box */}
        <div className="bg-slate-900/95 rounded-3xl p-8 shadow-2xl border border-slate-800 backdrop-blur-md">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rachel Adams"
                    className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@ecoinfracompliance.io"
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:bg-slate-900 focus:border-emerald-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Select Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:bg-slate-900 focus:border-emerald-500 outline-none transition"
                >
                  <option value="COMPLIANCE_STAFF">Compliance Staff</option>
                  <option value="ENVIRONMENTAL_OFFICER">Environmental Officer</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isRegistering ? 'Register Account' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              {isRegistering
                ? 'Already have an account? Sign in'
                : "Don't have an account? Register new profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
