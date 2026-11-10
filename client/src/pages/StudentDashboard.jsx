import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  CheckCircle2,
  QrCode,
  ArrowRight,
  User,
  ExternalLink,
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function StudentDashboard() {
  const { user, student: authStudent, card: authCard, setStudent, setCard } = useAuth();
  const [loading, setLoading] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    name: user?.name || 'Your Name',
    rollNumber: authStudent?.rollNumber || '—',
    department: authStudent?.department || 'Team / Department',
    course: authStudent?.course || 'Role / Title',
    batch: authStudent?.academicBatch || '',
    semester: '',
    email: user?.email || '',
    cardStatus: authCard?.status || 'PENDING',
    validUntil: authCard?.validUntil || '—',
    cardNumber: authCard?.cardNumber || 'UNISSUED',
    verificationId: authCard?.verificationId || '—',
    photo: authStudent?.avatarUrl || '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, cardRes] = await Promise.all([
          api.get('/students/profile').catch(() => null),
          api.get('/id-cards/my-card').catch(() => null),
        ]);

        if (profileRes?.data?.success) {
          const s = profileRes.data.data;
          setStudent(s);
          setDashboardData((prev) => ({
            ...prev,
            name: s.fullName || prev.name,
            rollNumber: s.rollNumber || prev.rollNumber,
            department: s.department || prev.department,
            course: s.course || prev.course,
            batch: s.academicBatch || prev.batch,
            photo: s.avatarUrl || prev.photo,
          }));
        }

        if (cardRes?.data?.success) {
          const c = cardRes.data.data;
          setCard(c);
          setDashboardData((prev) => ({
            ...prev,
            cardStatus: c.status,
            validUntil: c.validUntil || prev.validUntil,
            cardNumber: c.cardNumber || prev.cardNumber,
            verificationId: c.verificationId || prev.verificationId,
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 text-slate-800">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-100">
            Creator account
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Hello, {dashboardData.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {dashboardData.course} • {dashboardData.department} • ID: <span className="font-mono font-bold text-slate-700">{dashboardData.rollNumber}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/dashboard/profile">
            <Button variant="outline" size="sm" className="text-xs font-semibold">
              <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
              <span>Edit My Profile</span>
            </Button>
          </Link>

          <Link to="/dashboard/id-card">
            <Button variant="primary" size="sm" className="text-xs font-bold">
              <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              <span>Design & Download Card</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 3 Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: ID Card Status */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ID Card Status
            </span>
            <Badge
              variant={dashboardData.cardStatus === 'APPROVED' ? 'success' : 'warning'}
              size="sm"
              dot
            >
              {dashboardData.cardStatus === 'APPROVED' ? 'Approved' : 'Pending'}
            </Badge>
          </div>

          <div>
            <p className="text-xl font-bold text-slate-900">
              {dashboardData.cardStatus === 'APPROVED' ? 'Ready to Download' : 'Under Review'}
            </p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Card Number: {dashboardData.cardNumber || 'PREVIEW'}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Valid Until: {dashboardData.validUntil}</span>
            <Link to="/dashboard/id-card" className="text-brand-600 font-semibold hover:underline">
              Download →
            </Link>
          </div>
        </div>

        {/* Card 2: QR Code Info */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              QR Code Number
            </span>
            <QrCode className="w-4 h-4 text-brand-600" />
          </div>

          <div>
            <p className="text-xs text-slate-500">Your unique verification code:</p>
            <p className="text-xs font-mono font-bold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1 truncate">
              {dashboardData.verificationId}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs">
            <Link
              to={`/verify/${dashboardData.verificationId}`}
              className="text-brand-600 hover:underline font-semibold flex items-center gap-1"
            >
              <span>Test Online Scan Link</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Card 3: Card Format */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Card Format
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>

          <div>
            <p className="text-lg font-bold text-slate-900">Vertical (Standing)</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard 54 × 86 mm credit card size with lanyard slot
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Orientation:</span>
            <span className="text-slate-800 font-bold">Portrait</span>
          </div>
        </div>
      </div>
    </div>
  );
}
