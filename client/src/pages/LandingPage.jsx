import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Download,
  Image as ImageIcon,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import Button from '../components/common/Button';
import IDCard from '../components/id-card/IDCard';

export default function LandingPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('navy');
  const [isFlipped, setIsFlipped] = useState(false);

  // Sample holder data for the interactive card preview
  const demoStudent = {
    fullName: 'Your Name',
    rollNumber: 'ORG-0001',
    collegeName: 'Organization Name',
    department: 'Department / Team',
    course: 'Role / Category',
    academicBatch: '',
    currentSemester: '',
    bloodGroup: '',
    validUntil: '—',
    cardNumber: 'PREVIEW',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    verificationId: 'PREVIEW',
    status: 'PREVIEW',
  };

  return (
    <div className="relative overflow-hidden bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="pt-12 pb-16 lg:pt-16 lg:pb-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Introduction */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>One studio for every kind of ID</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Your ID, your style. Create it in minutes.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Create personal, school, staff, event, and membership cards from a growing set of templates. Add your details, choose a look, preview both sides, and download a print-ready card.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <Link to="/studio">
                <Button variant="primary" size="lg" className="font-bold text-sm shadow-sm">
                  <span>Open card studio</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <Link to="/register">
                <Button variant="outline" size="lg" className="font-semibold text-sm shadow-sm bg-white">
                  <QrCode className="w-4 h-4 mr-2 text-brand-600" />
                  <span>Create free account</span>
                </Button>
              </Link>
            </div>

            {/* Quick 3-Pillar Highlights */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-left">
              <div>
                <p className="text-base font-bold text-slate-900">Vertical</p>
                <p className="text-xs text-slate-500">Standard 54 × 86 mm</p>
              </div>
              <div>
                <p className="text-base font-bold text-brand-600">Front & Back</p>
                <p className="text-xs text-slate-500">2-Page PDF & 2 JPGs</p>
              </div>
              <div>
                <p className="text-base font-bold text-slate-900">Live QR</p>
                <p className="text-xs text-slate-500">Fast phone camera scan</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Card Preview */}
          <div id="card-styles" className="lg:col-span-5 flex flex-col items-center scroll-mt-24">
            <div className="w-full max-w-[320px] flex flex-col items-center">
              {/* Flippable Vertical ID Card */}
              <div className="w-full">
                <IDCard
                  student={demoStudent}
                  template={selectedTemplate}
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped(!isFlipped)}
                />
              </div>

              {/* Controls below card */}
              <div className="mt-4 w-full bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Card Theme:</span>
                  <button
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="flex items-center gap-1 text-brand-600 hover:text-brand-700 text-[11px] font-bold"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Flip to {isFlipped ? 'Front' : 'Back'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'navy', label: 'Royal Navy' },
                    { id: 'emerald', label: 'Emerald' },
                    { id: 'crimson', label: 'Crimson' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        selectedTemplate === t.id
                          ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-16 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              One flexible workspace for all your cards
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Choose a template, personalize the information, and save multiple designs in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Standing (Vertical) Format</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vertical cards hang properly from neck lanyards without flipping upside down. Standard 54 × 86 mm credit card dimensions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">QR Code Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan the QR code with any smartphone camera. It instantly opens a page showing if the student is actively enrolled.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                <Download className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Print-Ready Single PDF</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download a clean 2-page PDF containing Page 1 (Front Side) and Page 2 (Back Side) ready for PVC card printing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Two JPG Images</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Download separate Front and Back JPG images to keep on your mobile phone or digital wallet.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
