import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Mail, UserRound, Hash, Lock, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', email: '', rollNumber: '', organizationCode: '', department: '', category: '', password: '', confirmPassword: '' });
  const [joinInfo, setJoinInfo] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setFormData(current => name === 'organizationCode'
      ? ({ ...current, organizationCode: value, department: '', category: '' })
      : ({ ...current, [name]: value }));
    if (name === 'organizationCode') setJoinInfo(null);
    setErrors(current => ({ ...current, [name]: '' }));
    setServerError('');
  };

  const lookupOrganization = async () => {
    if (!formData.organizationCode.trim()) return;
    try {
      const res = await api.get(`/public/organizations/${encodeURIComponent(formData.organizationCode.trim())}`);
      setJoinInfo(res.data.data);
      setFormData((current) => ({ ...current, department: current.department || res.data.data.departments[0]?._id || '', category: current.category || res.data.data.categories[0] || '' }));
      setServerError('');
    } catch (error) { setJoinInfo(null); setServerError(error.response?.data?.message || 'Could not find that organization code.'); }
  };

  const handleSubmit = async event => {
    event.preventDefault();
    const nextErrors = {};
    if (!formData.fullName.trim()) nextErrors.fullName = 'Enter your name.';
    if (!formData.email.trim()) nextErrors.email = 'Enter your email address.';
    if (!formData.rollNumber.trim()) nextErrors.rollNumber = 'Enter an ID number for your card.';
    if (formData.password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (!joinInfo) nextErrors.organizationCode = 'Load a valid organization using its access code.';
    if (!formData.department) nextErrors.department = 'Choose a department.';
    if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }

    setIsLoading(true);
    setServerError('');
    try {
      const result = await register({
        fullName: formData.fullName.trim(), email: formData.email.trim().toLowerCase(),
        password: formData.password, rollNumber: formData.rollNumber.trim().toUpperCase(),
        organizationCode: formData.organizationCode.trim().toUpperCase(),
        department: formData.department, category: formData.category, course: formData.category, batch: String(new Date().getFullYear()),
      });
      if (!result?.success) { setServerError(result?.error || 'Could not create your account. Please try again.'); return; }
      navigate('/dashboard/id-card');
    } catch (error) {
      setServerError(error.response?.data?.message || 'Could not create your account. Please try again.');
    } finally { setIsLoading(false); }
  };

  const field = 'w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 placeholder:text-slate-400';
  const label = 'mb-1.5 block text-xs font-semibold text-slate-700';
  const icon = 'absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400';

  return <main className="min-h-[75vh] bg-slate-50 px-4 py-12 sm:py-16">
    <div className="mx-auto max-w-xl">
      <header className="mb-7 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-900"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white"><CreditCard className="h-5 w-5" /></span><span className="text-lg font-extrabold">CardForge</span></Link>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.18em] text-brand-700">Free creator account</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">Set up your details once, then create and save the cards you need.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        {serverError && <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/><span>{serverError}</span></div>}
        <div><label className={label} htmlFor="fullName">Your name</label><div className="relative"><UserRound className={icon}/><input id="fullName" name="fullName" autoComplete="name" required value={formData.fullName} onChange={handleChange} className={field} placeholder="Alex Rivera"/></div>{errors.fullName && <p className="mt-1 text-xs text-rose-600">{errors.fullName}</p>}</div>
        <div><label className={label} htmlFor="email">Email address</label><div className="relative"><Mail className={icon}/><input id="email" type="email" name="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={field} placeholder="alex@example.com"/></div>{errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}</div>
        <div><label className={label} htmlFor="organizationCode">Organization access code</label><div className="flex gap-2"><div className="relative min-w-0 flex-1"><Building2 className={icon}/><input id="organizationCode" name="organizationCode" required value={formData.organizationCode} onChange={handleChange} className={field} placeholder="Ask your organization administrator"/></div><button type="button" onClick={lookupOrganization} className="rounded-xl border border-brand-200 bg-brand-50 px-3 text-xs font-bold text-brand-700">Find</button></div>{joinInfo && <p className="mt-1 text-xs text-emerald-700">Joining {joinInfo.organization.name}</p>}{errors.organizationCode && <p className="mt-1 text-xs text-rose-600">{errors.organizationCode}</p>}<p className="mt-1 text-xs text-slate-500">This connects your account to the correct private workspace.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label} htmlFor="rollNumber">Card ID number</label><div className="relative"><Hash className={icon}/><input id="rollNumber" name="rollNumber" required value={formData.rollNumber} onChange={handleChange} className={field} placeholder="ORG-0001"/></div>{errors.rollNumber && <p className="mt-1 text-xs text-rose-600">{errors.rollNumber}</p>}</div>
          <div><label className={label} htmlFor="department">Department</label><select id="department" name="department" required value={formData.department} onChange={handleChange} className={field}><option value="">Find your organization first</option>{joinInfo?.departments.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}</select>{errors.department && <p className="mt-1 text-xs text-rose-600">{errors.department}</p>}</div>
          <div><label className={label} htmlFor="category">User category</label><select id="category" name="category" required value={formData.category} onChange={handleChange} className={field}><option value="">Find your organization first</option>{joinInfo?.categories.map(item => <option key={item}>{item}</option>)}</select></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className={label} htmlFor="password">Password</label><div className="relative"><Lock className={icon}/><input id="password" type="password" name="password" autoComplete="new-password" minLength={8} required value={formData.password} onChange={handleChange} className={field} placeholder="At least 8 characters"/></div>{errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}</div>
          <div><label className={label} htmlFor="confirmPassword">Confirm password</label><div className="relative"><Lock className={icon}/><input id="confirmPassword" type="password" name="confirmPassword" autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} className={field} placeholder="Re-enter password"/></div>{errors.confirmPassword && <p className="mt-1 text-xs text-rose-600">{errors.confirmPassword}</p>}</div>
        </div>
        <Button type="submit" isLoading={isLoading} className="w-full justify-center rounded-xl py-3 font-bold">Create account <ArrowRight className="ml-1 h-4 w-4"/></Button>
        <p className="text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-bold text-brand-700 hover:underline">Sign in</Link></p>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">Setting up a new organization? <Link to="/organization/register" className="font-bold text-brand-700 hover:underline">Create its workspace</Link></p>
    </div>
  </main>;
}
