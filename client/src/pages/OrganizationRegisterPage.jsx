import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, CreditCard, AlertCircle } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

const categories = ['Education', 'Healthcare', 'Corporate', 'Government', 'Banking', 'Industrial', 'Hospitality', 'Transportation', 'Non-Profit', 'Sports', 'Retail', 'Other'];
const initial = { name: '', organizationName: '', organizationCategory: 'Corporate', email: '', password: '', address: '', contact: '', website: '' };

export default function OrganizationRegisterPage() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerAdmin } = useAuth();
  const navigate = useNavigate();
  const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100';
  const set = (e) => setForm((v) => ({ ...v, [e.target.name]: e.target.value }));
  const setLogo = (e) => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 1024 * 1024) { setError('Logo must be smaller than 1 MB.'); return; } const reader = new FileReader(); reader.onload = () => setForm((v) => ({ ...v, logoUrl: reader.result })); reader.readAsDataURL(file); };
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    const result = await registerAdmin(form);
    setLoading(false);
    if (!result?.success) return setError(result?.error || 'Could not create the organization workspace.');
    navigate('/admin', { replace: true });
  };
  return <main className="min-h-[75vh] bg-slate-50 px-4 py-10 text-slate-900"><div className="mx-auto max-w-2xl">
    <header className="mb-6 text-center"><Link to="/" className="inline-flex items-center gap-2 font-extrabold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white"><CreditCard className="h-5 w-5"/></span>CardForge</Link><p className="mt-5 text-xs font-bold uppercase tracking-widest text-brand-700">Organization onboarding</p><h1 className="mt-2 text-3xl font-black">Create your workspace</h1><p className="mt-2 text-sm text-slate-500">Your account becomes the main administrator for this organization.</p></header>
    <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-7">
      {error && <div role="alert" className="sm:col-span-2 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle className="h-4 w-4 shrink-0"/>{error}</div>}
      <label className="text-xs font-semibold text-slate-700">Your full name<input className={`${field} mt-1.5`} name="name" value={form.name} onChange={set} required autoComplete="name"/></label>
      <label className="text-xs font-semibold text-slate-700">Organization name<input className={`${field} mt-1.5`} name="organizationName" value={form.organizationName} onChange={set} required/></label>
      <label className="text-xs font-semibold text-slate-700">Organization category<select className={`${field} mt-1.5`} name="organizationCategory" value={form.organizationCategory} onChange={set}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
      <label className="text-xs font-semibold text-slate-700">Work email<input className={`${field} mt-1.5`} type="email" name="email" value={form.email} onChange={set} required autoComplete="email"/></label>
      <label className="text-xs font-semibold text-slate-700">Password<input className={`${field} mt-1.5`} type="password" name="password" minLength={8} value={form.password} onChange={set} required autoComplete="new-password"/></label>
      <label className="text-xs font-semibold text-slate-700">Contact number<input className={`${field} mt-1.5`} name="contact" value={form.contact} onChange={set}/></label>
      <label className="text-xs font-semibold text-slate-700">Website<input className={`${field} mt-1.5`} name="website" value={form.website} onChange={set} placeholder="https://"/></label>
      <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Organization logo<input className={`${field} mt-1.5`} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={setLogo}/>{form.logoUrl && <span className="mt-2 flex items-center gap-2 text-xs text-emerald-700"><img src={form.logoUrl} alt="Logo preview" className="h-10 w-10 rounded-lg border border-slate-200 object-contain"/>Logo selected</span>}</label>
      <label className="text-xs font-semibold text-slate-700 sm:col-span-2">Organization address<input className={`${field} mt-1.5`} name="address" value={form.address} onChange={set}/></label>
      <Button type="submit" isLoading={loading} className="sm:col-span-2 sm:justify-center"><Building2 className="mr-2 h-4 w-4"/>Create workspace</Button>
    </form>
    <p className="mt-4 text-center text-sm text-slate-500">Already registered? <Link className="font-semibold text-brand-700" to="/login">Sign in</Link></p>
  </div></main>;
}
