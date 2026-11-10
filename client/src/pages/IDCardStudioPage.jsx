import React, { useState, useEffect, useRef } from 'react';
import IDCard from '../components/id-card/IDCard';
import IDCardActions from '../components/id-card/IDCardActions';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { getTemplate } from '../components/id-card/templateLibrary';
import { downloadIDCardPDF, downloadIDCardJPGs } from '../utils/pdfGenerator';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  CreditCard,
  CheckCircle2,
  RotateCw,
  Save,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const organizationLabel = (value) => !value || value.trim().toLowerCase() === 'global tech university' ? 'Your Organization' : value;

export default function IDCardStudioPage() {
  const { user, student: authStudent, card: authCard, setCard } = useAuth();
  const [template, setTemplate] = useState(getTemplate(authCard?.template || 'navy').id);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [notification, setNotification] = useState('');
  const [allowedTemplates, setAllowedTemplates] = useState(null);
  const [savedDesigns, setSavedDesigns] = useState(() => {
    try { return JSON.parse(localStorage.getItem('idforge_designs') || '[]'); } catch { return []; }
  });
  const activeTemplate = getTemplate(template);
  const isLandscape = activeTemplate.orientation === 'Landscape';
  const exportWidth = isLandscape ? 516 : 324;
  const exportHeight = isLandscape ? 324 : 516;

  // Off-screen clean 2D refs for flawless PDF and JPG exports
  const frontExportRef = useRef(null);
  const backExportRef = useRef(null);

  // Fresh, clean student and card details
  const [cardData, setCardData] = useState({
    fullName: authStudent?.fullName || user?.name || 'Your Name',
    logoUrl: authStudent?.logoUrl || '',
    avatarUrl: authStudent?.avatarUrl || '',
    rollNumber: authStudent?.rollNumber || 'ORG-0001',
    collegeName: organizationLabel(authStudent?.collegeName),
    department: authStudent?.department || 'Team / Department',
    course: authStudent?.course || 'Role / Title',
    currentSemester: authStudent?.currentSemester?.toString() || '',
    academicBatch: authStudent?.academicBatch || '',
    bloodGroup: authStudent?.bloodGroup === 'Not Specified' ? '' : (authStudent?.bloodGroup || ''),
    validUntil: authCard?.validUntil || '—',
    cardNumber: authCard?.cardNumber || 'UNISSUED',
    status: authCard?.status || (user ? 'PENDING' : 'PREVIEW'),
    verificationId: authCard?.verificationId || 'PREVIEW',
  });
  const canDownload = !user || ['admin', 'main_admin', 'mid_admin'].includes(user.role) || cardData.status === 'APPROVED';

  // Pull latest data if authenticated
  useEffect(() => {
    const fetchLatestCard = async () => {
      try {
        const res = await api.get('/id-cards/my-card');
        if (res.data.success) {
          const c = res.data.data;
          setCard(c);
          if (c.template) setTemplate(getTemplate(c.template).id);
          setCardData((prev) => ({
            ...prev,
            status: c.status,
            cardNumber: c.cardNumber || prev.cardNumber,
            verificationId: c.verificationId || prev.verificationId,
            validUntil: c.validUntil || prev.validUntil,
            fullName: c.student?.fullName || prev.fullName,
            logoUrl: c.student?.logoUrl || prev.logoUrl,
            collegeName: organizationLabel(c.student?.collegeName) || prev.collegeName,
            avatarUrl: c.student?.avatarUrl || prev.avatarUrl,
            rollNumber: c.student?.rollNumber || prev.rollNumber,
            department: c.student?.department || prev.department,
            course: c.student?.course || prev.course,
            academicBatch: c.student?.academicBatch || prev.academicBatch,
            bloodGroup: c.student?.bloodGroup || prev.bloodGroup,
          }));
        }
      } catch (err) {
        // Fallback demo state
      }
    };

    fetchLatestCard();
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/id-cards/available-templates').then((res) => setAllowedTemplates(res.data.data)).catch(() => setAllowedTemplates(['minimal']));
  }, [user]);

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setNotification('Choose a PNG, JPG, SVG, or WebP image for the logo.');
      return;
    }
    if (file.size > 512 * 1024) {
      setNotification('Organization logos must be smaller than 512 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCardData(current => ({ ...current, logoUrl: reader.result }));
    reader.onerror = () => setNotification('Could not read this image. Try a different file.');
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  // Save selected style
  const handleSaveTemplate = async () => {
    const design = { id: Date.now(), name: `${cardData.fullName || 'Untitled'} · ${template}`, template, cardData, savedAt: new Date().toISOString() };
    const nextDesigns = [design, ...savedDesigns].slice(0, 6);
    setSavedDesigns(nextDesigns);
    try {
      localStorage.setItem('idforge_designs', JSON.stringify(nextDesigns));
    } catch {
      setNotification('Browser storage is full. Remove an older saved card or use a smaller logo.');
      return;
    }
    try {
      setIsSavingTemplate(true);
      const res = await api.post('/id-cards/apply', { template });
      if (res.data.success) {
        setCard(res.data.data);
        setNotification('Design saved to My cards.');
        setTimeout(() => setNotification(''), 4000);
      }
    } catch (err) {
      setNotification('Design saved to My cards on this device.');
      setTimeout(() => setNotification(''), 4000);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // 1. Download Single 2-Page PDF
  const handleDownloadPDF = async () => {
    if (!canDownload) { setNotification('Your ID card needs organization approval before download.'); return; }
    if (!frontExportRef.current || !backExportRef.current) return;
    try {
      setIsDownloading(true);
      await downloadIDCardPDF(
        frontExportRef.current,
        backExportRef.current,
        `ID-${cardData.rollNumber || 'Card'}.pdf`,
        isLandscape ? 'landscape' : 'portrait'
      );
      setNotification('PDF downloaded successfully! Page 1 is Front, Page 2 is Back.');
      setTimeout(() => setNotification(''), 5000);
    } catch (err) {
      alert('Could not download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // 2. Download Two Clean JPG Images
  const handleDownloadJPGs = async () => {
    if (!canDownload) { setNotification('Your ID card needs organization approval before download.'); return; }
    if (!frontExportRef.current || !backExportRef.current) return;
    try {
      setIsDownloading(true);
      await downloadIDCardJPGs(
        frontExportRef.current,
        backExportRef.current,
        cardData.rollNumber || 'Holder',
        isLandscape ? 'landscape' : 'portrait'
      );
      setNotification('Downloaded 2 JPG images: Front Side and Back Side!');
      setTimeout(() => setNotification(''), 5000);
    } catch (err) {
      alert('Could not download images. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Template mapper for export
  const ActiveExportComponent = activeTemplate.component;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-brand-600" />
            <span>Card design studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Start with a template, make it yours, and export a print-ready card.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={cardData.status === 'APPROVED' ? 'success' : 'warning'}
            size="md"
            dot
          >
            {user ? (cardData.status === 'APPROVED' ? 'Ready to export' : 'Draft') : 'Design preview'}
          </Badge>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveTemplate}
            isLoading={isSavingTemplate}
            className="text-xs font-bold"
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            <span>Save design</span>
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 3D ID Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="sticky top-24 w-full flex flex-col items-center space-y-3">
            {/* Lanyard top cutout applies to portrait badges */}
            {!isLandscape && <div className="w-6 h-7 bg-brand-700 rounded-t-sm shadow-sm flex flex-col items-center justify-end pb-1 mb-[-4px] z-10">
              <div className="w-3.5 h-1.5 bg-slate-300 rounded-sm" />
            </div>}

            {/* 3D Vertical Card */}
            <IDCard
              student={cardData}
              template={template}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
            />

            <p className="text-xs text-slate-500 font-medium text-center flex items-center justify-center gap-1.5 pt-1">
              <RotateCw className="w-3.5 h-3.5 text-brand-600" />
              <span>Click card or button to flip front & back</span>
            </p>
          </div>
        </div>

        {/* Right: Actions & Student Info */}
        <div className="lg:col-span-7 space-y-5">
          <IDCardActions
            currentTemplate={template}
            student={cardData}
            onSelectTemplate={setTemplate}
            isFlipped={isFlipped}
            onToggleFlip={() => setIsFlipped(!isFlipped)}
            onDownloadPDF={handleDownloadPDF}
            onDownloadJPGs={handleDownloadJPGs}
            allowedTemplateIds={allowedTemplates}
            canDownload={canDownload}
            isDownloading={isDownloading}
          />

          {/* Editable card details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                <span>Personalize your card</span>
              </h3>
              <Link
                to={user ? "/dashboard/profile" : "/register"}
                className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1"
              >
                <span>{user ? 'Account details' : 'Create account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <label className="text-[10px] text-slate-400 block font-medium">Name</label>
                <input className="w-full bg-transparent font-bold text-slate-800 outline-none" value={cardData.fullName} onChange={e => setCardData({...cardData, fullName:e.target.value})} />
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <label className="text-[10px] text-slate-400 block font-medium">ID number</label>
                <input className="w-full bg-transparent font-mono font-bold text-brand-700 outline-none" value={cardData.rollNumber} onChange={e => setCardData({...cardData, rollNumber:e.target.value})} />
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <label className="text-[10px] text-slate-400 block font-medium">Organization name</label>
                <input className="w-full bg-transparent font-medium text-slate-800 outline-none" value={cardData.collegeName} onChange={e => setCardData({...cardData, collegeName:e.target.value})} />
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <label className="text-[10px] text-slate-400 block font-medium">Role / department</label>
                <input className="w-full bg-transparent font-medium text-slate-800 outline-none" value={cardData.department} onChange={e => setCardData({...cardData, department:e.target.value})} />
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <label className="text-[10px] text-slate-400 block font-medium">Additional detail (e.g. blood type)</label>
                <input className="w-full bg-transparent font-bold text-rose-600 outline-none" value={cardData.bloodGroup} onChange={e => setCardData({...cardData,bloodGroup:e.target.value})} placeholder="Optional" />
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <label className="text-[10px] text-slate-400 block font-medium">Valid through</label>
                <input className="w-full bg-transparent font-semibold text-slate-800 outline-none" value={cardData.validUntil} onChange={e => setCardData({...cardData,validUntil:e.target.value})} />
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                <label className="text-[10px] text-slate-400 block font-medium">Profile photo URL</label>
                <input className="w-full bg-transparent text-slate-800 outline-none" value={cardData.avatarUrl} onChange={e => setCardData({...cardData,avatarUrl:e.target.value})} />
              </div>
            </div>
          </div>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {cardData.logoUrl ? <img src={cardData.logoUrl} alt="Selected organization logo" className="h-full w-full object-contain p-2"/> : <span className="text-[10px] font-bold text-slate-400">LOGO</span>}
              </div>
              <div className="min-w-0 flex-1"><h3 className="text-sm font-bold text-slate-900">Organization logo</h3><p className="mt-1 text-xs text-slate-500">Optional · Upload a logo to see it in the card preview.</p></div>
              <label className="shrink-0 cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-brand-400">{cardData.logoUrl ? 'Change' : 'Choose logo'}<input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} className="sr-only"/></label>
              {cardData.logoUrl && <button type="button" onClick={() => setCardData(current => ({...current,logoUrl:''}))} className="text-xs font-semibold text-rose-600">Remove</button>}
            </div>
          </section>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex justify-between items-center"><h3 className="text-sm font-bold text-slate-900">My saved cards</h3><span className="text-xs text-slate-500">{savedDesigns.length} saved</span></div>
            {savedDesigns.length ? <div className="mt-3 grid sm:grid-cols-2 gap-2">{savedDesigns.map(d => <button key={d.id} onClick={() => {setTemplate(d.template);setCardData(d.cardData)}} className="text-left rounded-xl border border-slate-200 p-3 hover:border-brand-400"><span className="block text-xs font-bold">{d.name}</span><span className="text-[11px] text-slate-500">{new Date(d.savedAt).toLocaleDateString()}</span></button>)}</div> : <p className="mt-2 text-xs text-slate-500">Save a design to keep it here and make more cards with different styles.</p>}
          </div>
        </div>
      </div>

      {/* Export faces use standard ID-1 dimensions in the selected orientation. */}
      <div style={{ position: 'fixed', top: 0, left: 0, zIndex: -9999, pointerEvents: 'none', opacity: 1 }}>
        <div
          ref={frontExportRef}
          style={{ width: `${exportWidth}px`, height: `${exportHeight}px`, boxSizing: 'border-box' }}
          className="rounded-2xl overflow-hidden bg-white shadow-none"
        >
          <ActiveExportComponent student={cardData} isBack={false} />
        </div>

        <div
          ref={backExportRef}
          style={{ width: `${exportWidth}px`, height: `${exportHeight}px`, boxSizing: 'border-box', marginTop: '10px' }}
          className="rounded-2xl overflow-hidden bg-white shadow-none"
        >
          <ActiveExportComponent student={cardData} isBack={true} />
        </div>
      </div>
    </div>
  );
}
