import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setServerError('');
    const result = await login(formData.email.trim(), formData.password);
    if (!result?.success) setServerError(result?.error || 'Could not sign in. Check your email and password.');
    else navigate(location.state?.from?.pathname || (result.user?.role === 'platform_owner' ? '/owner' : ['admin', 'main_admin', 'mid_admin'].includes(result.user?.role) ? '/admin' : '/dashboard'), { replace: true });
    setIsLoading(false);
  };

  return <div className="min-h-[75vh] bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-16">
    <div className="w-full max-w-md">
      <div className="text-center mb-7"><div className="mx-auto w-12 h-12 rounded-2xl bg-brand-600 text-white grid place-items-center"><CreditCard className="w-6 h-6" /></div><h1 className="mt-4 text-3xl font-black text-slate-900">Welcome back</h1><p className="mt-2 text-sm text-slate-500">Sign in to design your cards or manage your workspace.</p></div>
      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-7 space-y-5 shadow-sm">
        {serverError && <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{serverError}</div>}
        <label className="block text-xs font-semibold text-slate-700">Email address<div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3"><Mail className="w-4 h-4 text-slate-400"/><input required type="email" autoComplete="email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none" placeholder="you@example.com"/></div></label>
        <label className="block text-xs font-semibold text-slate-700">Password<div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3"><Lock className="w-4 h-4 text-slate-400"/><input required type="password" autoComplete="current-password" value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})} className="w-full bg-transparent py-3 text-sm text-slate-900 outline-none" placeholder="Your password"/></div></label>
        <Button type="submit" variant="primary" isLoading={isLoading} className="w-full justify-center py-3 font-bold">Sign in <ArrowRight className="ml-2 w-4 h-4"/></Button>
        <p className="text-center text-xs text-slate-500">New to CardForge? <Link to="/register" className="font-bold text-brand-700 hover:underline">Create an account</Link></p>
      </form>
      <p className="mt-5 text-center text-[11px] text-slate-500">Owner accounts use this same sign in page.</p>
    </div>
  </div>;
}
