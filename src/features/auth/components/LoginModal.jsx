import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '../authSlice';
import { setBalance } from '../../wallet/walletSlice';
import { X, Eye, EyeOff, TrendingUp, Users, Rocket } from 'lucide-react';

import { API_BASE } from '../../../config';

export default function LoginModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((s) => s.auth);

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', username: '', role: 'investor' });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setForm({ ...form, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    // 1. Legit email check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email.trim())) {
      dispatch(loginFailure('Please enter a valid email address'));
      return;
    }

    if (isRegister) {
      // 2. Username check
      const usernameCleaned = form.username.trim();
      if (usernameCleaned.length < 3) {
        dispatch(loginFailure('Username must be at least 3 characters long'));
        return;
      }
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(usernameCleaned)) {
        dispatch(loginFailure('Username can only contain letters, numbers, and underscores'));
        return;
      }

      // 3. Password checks
      if (form.password.length < 8) {
        dispatch(loginFailure('Password must be at least 8 characters long'));
        return;
      }
      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (!specialCharRegex.test(form.password)) {
        dispatch(loginFailure('Password must contain at least one special character (!@#$%^&*, etc.)'));
        return;
      }
    }

    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const referrer = isRegister ? (sessionStorage.getItem('referralCode') || undefined) : undefined;
    const body = isRegister
      ? { email: form.email, password: form.password, username: form.username, role: form.role, referrer }
      : { email: form.email, password: form.password };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Authentication failed');
      }
      const data = await res.json();
      if (isRegister) {
        sessionStorage.removeItem('referralCode');
      }
      dispatch(loginSuccess({ user: data.user, token: data.access_token, isNew: data.isNew }));
      dispatch(setBalance(data.user.walletBalance));
      onClose();
    } catch (err) {
      dispatch(loginFailure(err.message));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-4 rounded-xl border border-white/10 bg-[hsl(240,10%,6%)] p-6 shadow-2xl">
        {/* Neon top border */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-60 rounded-t-xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-md bg-[#00FF66]/20 flex items-center justify-center border border-[#00FF66]/50">
            <TrendingUp className="w-5 h-5 text-[#00FF66]" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#FF3366]/10 border border-[#FF3366]/30 text-[#FF3366] text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              {/* Role Selection */}
              <div>
                <label className="block text-sm text-white/60 mb-1.5">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('investor')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                      form.role === 'investor'
                        ? 'bg-[#00FF66]/10 border-[#00FF66]/50 text-[#00FF66]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Angel Investor</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('founder')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all ${
                      form.role === 'founder'
                        ? 'bg-[#00FF66]/10 border-[#00FF66]/50 text-[#00FF66]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Rocket className="w-5 h-5" />
                    <span className="text-sm font-medium">Founder</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-1.5">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#00FF66]/50 focus:ring-1 focus:ring-[#00FF66]/30 transition-all"
                  placeholder="satoshi_nakamoto"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm text-white/60 mb-1.5 flex justify-between items-center">
              <span>Email</span>
              {isRegister && <span className="text-[10px] text-white/30">e.g. name@gmail.com, name@yahoo.com</span>}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#00FF66]/50 focus:ring-1 focus:ring-[#00FF66]/30 transition-all"
              placeholder="you@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5 flex justify-between items-center">
              <span>Password</span>
              {isRegister && <span className="text-[10px] text-white/30">Min 8 chars, 1 special character</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#00FF66]/50 focus:ring-1 focus:ring-[#00FF66]/30 transition-all pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg bg-[#00FF66] text-black font-bold hover:bg-[#00FF66]/80 transition-all shadow-[0_0_20px_rgba(0,255,102,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-white/40">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-[#00FF66] hover:underline"
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        {/* Disclaimer */}
        <p className="mt-4 text-[10px] text-white/20 text-center leading-relaxed">
          Not real investment. Not securities. Virtual game only.
        </p>
      </div>
    </div>
  );
}
