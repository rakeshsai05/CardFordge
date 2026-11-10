import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, CreditCard, Clock3, ArrowRight, Check, X, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard() {
  const [workspace, setWorkspace] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [home, queue] = await Promise.all([api.get('/organization'), api.get('/admin/cards?status=PENDING')]);
      setWorkspace(home.data.data); setCards(queue.data.data || []);
    } catch (e) { setError(e.response?.data?.message || 'Could not load organization data.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  const act = async (card, action) => {
    setBusyId(card._id); setError('');
    try { await api.patch(`/admin/cards/${card._id}/${action}`, action === 'reject' ? { reason: 'Please review the submitted details and photo.' } : {}); await load(); }
    catch (e) { setError(e.response?.data?.message || `Could not ${action} this request.`); }
    finally { setBusyId(''); }
  };
  const statItems = [[Users, 'People', workspace?.stats?.users], [Building2, 'Departments', workspace?.stats?.departments], [CreditCard, 'ID cards', workspace?.stats?.cards], [Clock3, 'Pending', workspace?.stats?.pendingCards]];
  return <div className="space-y-6 text-slate-800">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-brand-700">Main administrator</p><h1 className="mt-1 text-2xl font-black text-slate-900">{workspace?.organization?.name || 'Organization dashboard'}</h1><p className="mt-1 text-sm text-slate-500">Organization-wide users, card approvals and activity.</p></div><div className="flex gap-2"><button onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold"><RefreshCw className="h-4 w-4"/>Refresh</button><Link to="/admin/workspace" className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white">Manage workspace<ArrowRight className="h-4 w-4"/></Link></div></header>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</div>}
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{statItems.map(([Icon, label, value])=><article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{label}</span><Icon className="h-4 w-4 text-brand-600"/></div><p className="mt-3 text-2xl font-black text-slate-900">{loading ? '—' : value ?? 0}</p></article>)}</section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Pending ID card requests</h2><p className="mt-1 text-xs text-slate-500">Requests from this organization only.</p></div><Link to="/admin/cards" className="text-xs font-bold text-brand-700">Open approvals</Link></div>
      {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading requests…</p> : cards.length ? <div className="mt-4 divide-y divide-slate-100">{cards.slice(0,8).map((card)=>{const person=card.student || {};return <div key={card._id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="flex items-center gap-3"><img className="h-10 w-10 rounded-xl object-cover" src={person.avatarUrl || ''} alt=""/><div><p className="text-sm font-semibold text-slate-900">{person.fullName || 'New member'}</p><p className="text-xs text-slate-500">{person.rollNumber || 'No ID'} · {person.department || 'Unassigned department'} · {card.template}</p></div></div><div className="flex gap-2"><button disabled={busyId===card._id} onClick={()=>act(card,'approve')} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 disabled:opacity-50"><Check className="h-3.5 w-3.5"/>Approve</button><button disabled={busyId===card._id} onClick={()=>act(card,'reject')} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 disabled:opacity-50"><X className="h-3.5 w-3.5"/>Reject</button></div></div>})}</div> : <p className="py-8 text-center text-sm text-slate-500">There are no pending requests.</p>}
    </section>
    <section className="grid gap-4 lg:grid-cols-2"><article className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold text-slate-900">Recently joined</h2><div className="mt-3 divide-y divide-slate-100">{(workspace?.recentUsers || []).slice(0,5).map((person)=><div className="flex justify-between gap-3 py-2.5" key={person._id}><span className="text-sm font-medium">{person.name}</span><span className="text-xs text-slate-500">{person.category || person.role}</span></div>)}{!workspace?.recentUsers?.length && <p className="py-4 text-sm text-slate-500">No users yet.</p>}</div></article><article className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="font-bold text-slate-900">Recent activity</h2><div className="mt-3 divide-y divide-slate-100">{(workspace?.recentActivity || []).slice(0,5).map((item)=><div className="py-2.5" key={item._id}><p className="text-sm font-medium">{item.action.replaceAll('.', ' ')}</p><p className="text-xs text-slate-500">{item.actor?.name || 'System'} · {new Date(item.createdAt).toLocaleString()}</p></div>)}{!workspace?.recentActivity?.length && <p className="py-4 text-sm text-slate-500">No activity recorded yet.</p>}</div></article></section>
  </div>;
}
