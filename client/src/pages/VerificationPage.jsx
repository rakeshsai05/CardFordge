import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  DoorOpen,
} from 'lucide-react';
import Button from '../components/common/Button';
import api from '../services/api';

const organizationLabel = (value) => !value || value.trim().toLowerCase() === 'global tech university' ? 'Your Organization' : value;

export default function VerificationPage() {
  const { verificationId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [statusResult, setStatusResult] = useState('INVALID');
  const [lookupCode, setLookupCode] = useState('');
  const navigate = useNavigate();
  const [gateLogSuccess, setGateLogSuccess] = useState(false);
  const [selectedGate, setSelectedGate] = useState('Main Entrance');

  // Record details
  const [record, setRecord] = useState({
    institution: '',
    studentName: '',
    rollNumber: '',
    department: '',
    course: '',
    batch: '',
    cardNumber: '',
    issueDate: '',
    validUntil: '',
    avatarUrl: '',
    verificationId: verificationId || '',
    verifiedTimestamp: new Date().toLocaleTimeString(),
  });

  // Call the verify API
  useEffect(() => {
    if (!verificationId) return;
    const fetchVerification = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/verify/${verificationId}`);
        if (res.data.success && res.data.data) {
          const d = res.data.data;
          setStatusResult(d.statusResult || 'VERIFIED');
          if (d.student) {
            setRecord((prev) => ({
              ...prev,
              institution: organizationLabel(d.institution) || prev.institution,
              studentName: d.student.fullName || prev.studentName,
              rollNumber: d.student.rollNumber || prev.rollNumber,
              department: d.student.department || prev.department,
              course: d.student.course || prev.course,
              batch: d.student.academicBatch || prev.batch,
              avatarUrl: d.student.avatarUrl || prev.avatarUrl,
              cardNumber: d.cardNumber || prev.cardNumber,
              validUntil: d.validUntil || prev.validUntil,
              issueDate: d.issueDate ? new Date(d.issueDate).toLocaleDateString() : prev.issueDate,
            }));
          }
        }
      } catch (err) {
        setStatusResult('INVALID');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerification();
  }, [verificationId]);

  if (!verificationId) return <main className="min-h-[70vh] bg-slate-50 px-4 py-12 text-slate-900"><form onSubmit={(e)=>{e.preventDefault(); if(lookupCode.trim()) navigate(`/verify/${encodeURIComponent(lookupCode.trim())}`);}} className="mx-auto max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-700"><ShieldCheck className="h-6 w-6"/></div><h1 className="text-center text-2xl font-black">Verify an ID card</h1><p className="text-center text-sm text-slate-500">Enter the verification code printed on the card or opened by its QR code.</p><input className="w-full rounded-xl border border-slate-200 px-3 py-3 font-mono text-sm" value={lookupCode} onChange={(e)=>setLookupCode(e.target.value)} placeholder="Verification code" required/><Button type="submit" className="w-full justify-center">Verify card</Button><Link to="/" className="block text-center text-xs text-brand-700">Back to CardForge</Link></form></main>;

  const handleMarkEntry = () => {
    setGateLogSuccess(true);
    setTimeout(() => setGateLogSuccess(false), 3000);
  };

  const isVerified = statusResult === 'VERIFIED';
  const isRevoked = statusResult === 'REVOKED';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg space-y-5">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <span className="text-[11px] text-slate-500 font-mono">
            ID: {record.verificationId}
          </span>
        </div>

        {/* Main Verification Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
          {/* Organization header */}
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase text-slate-900">
                {record.institution}
              </h2>
              <p className="text-xs text-slate-500">
                Identity Verification
              </p>
            </div>
          </div>

          {/* Status Message Box */}
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
              <p className="text-xs text-slate-500">Checking database records...</p>
            </div>
          ) : (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3.5 ${
                isVerified
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : isRevoked
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isVerified
                    ? 'bg-emerald-600 text-white'
                    : isRevoked
                    ? 'bg-rose-600 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {isVerified ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : isRevoked ? (
                  <ShieldX className="w-6 h-6" />
                ) : (
                  <ShieldAlert className="w-6 h-6" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold">
                  {isVerified
                    ? 'Valid ID Card'
                    : isRevoked
                    ? 'This Card Has Been Cancelled'
                    : 'Card Waiting for Approval'}
                </h3>
                <p className="text-xs opacity-90 leading-tight mt-0.5">
                  {isVerified
                    ? 'This card holder is active in the organization records.'
                    : isRevoked
                    ? 'This card has been cancelled by the organization.'
                    : 'This card is waiting for approval.'}
                </p>
              </div>
            </div>
          )}

          {/* Card holder details */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <img
                src={record.avatarUrl}
                alt={record.studentName}
                className="w-14 h-16 rounded-lg object-cover border border-slate-200"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="text-base font-bold text-slate-900 truncate">
                  {record.studentName}
                </h4>
                <p className="text-xs font-mono font-bold text-brand-700">
                  ID: {record.rollNumber}
                </p>
                <p className="text-xs text-slate-700 truncate">{record.course}</p>
                <p className="text-xs text-slate-500 truncate">{record.department}</p>
              </div>
            </div>

            {/* Simple Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[11px] block">Card Number</span>
                <span className="font-semibold text-slate-800">{record.cardNumber}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 text-[11px] block">Valid Until</span>
                <span className="font-semibold text-slate-800">{record.validUntil}</span>
              </div>
            </div>

            {/* Access entry action */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <DoorOpen className="w-4 h-4 text-brand-600" />
                <span>Record an access entry:</span>
              </span>

              <div className="flex gap-2">
                <select
                  value={selectedGate}
                  onChange={(e) => setSelectedGate(e.target.value)}
                  className="bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Main Entrance">Main Entrance</option>
                  <option value="Staff Entrance">Staff Entrance</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Event Hall">Event Hall</option>
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkEntry}
                  className="text-xs font-bold"
                >
                  {gateLogSuccess ? 'Recorded!' : 'Mark Entry'}
                </Button>
              </div>

              {gateLogSuccess && (
                <p className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Entry marked for {selectedGate}</span>
                </p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-center text-slate-400 pt-2 border-t border-slate-100">
            Verified by CardForge System
          </p>
        </div>
      </div>
    </div>
  );
}
