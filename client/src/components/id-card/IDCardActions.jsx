import React, { useMemo, useState } from 'react';
import { RotateCw, Download, Image as ImageIcon, Check, Palette, Search } from 'lucide-react';
import Button from '../common/Button';
import { templateLibrary } from './templateLibrary';

export default function IDCardActions({
  currentTemplate,
  student,
  onSelectTemplate,
  isFlipped,
  onToggleFlip,
  onDownloadPDF,
  onDownloadJPGs,
  allowedTemplateIds,
  canDownload = true,
  isDownloading = false,
}) {
  const [activeSector, setActiveSector] = useState('All');
  const [search, setSearch] = useState('');
  const permittedLibrary = allowedTemplateIds?.length ? templateLibrary.filter((item) => allowedTemplateIds.includes(item.id)) : templateLibrary;
  const sectors = ['All', ...new Set(permittedLibrary.map(item => item.sector))];
  const templates = useMemo(() => permittedLibrary.filter(item =>
    (activeSector === 'All' || item.sector === activeSector) &&
    `${item.name} ${item.sector} ${item.concept} ${item.orientation}`.toLowerCase().includes(search.toLowerCase())
  ), [permittedLibrary, activeSector, search]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      {/* 1. Theme Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-brand-600" />
            <span>1. Choose ID Card Theme</span>
          </h4>
          <span className="text-xs text-slate-500 font-medium">{permittedLibrary.length} assigned layouts · portrait and landscape</span>
        </div>

        <div className="relative mb-3"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Find a style or industry" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-800 outline-none focus:border-brand-400 focus:bg-white"/></div>
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">{sectors.map(sector => <button key={sector} type="button" onClick={() => setActiveSector(sector)} className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-semibold ${activeSector === sector ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{sector}</button>)}</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
          {templates.map((t) => {
            const isSelected = currentTemplate === t.id;

            return (
              <button
                key={t.id}
                type="button" onClick={() => onSelectTemplate(t.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-[114px] w-[116px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                    <div style={{ width:t.orientation === 'Landscape' ? 516 : 324, height:t.orientation === 'Landscape' ? 324 : 516, transform:'scale(.21)', transformOrigin:'center center' }}>
                      <t.component student={student} isBack={false}/>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1"><span className="text-xs font-bold text-slate-900">{t.name}</span>{isSelected && <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-brand-600 text-white"><Check className="h-2.5 w-2.5 stroke-[3]"/></span>}</div>
                    <p className="mt-1 text-[10px] text-slate-500">{t.sector} · {t.orientation}</p>
                    <p className="mt-1 text-[10px] leading-snug text-slate-600">{t.concept}</p>
                  </div>
                  <span className={`h-8 w-1.5 shrink-0 rounded-full ${t.accent}`} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Preview Flip Button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
          2. Card Preview
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFlip}
          className="text-xs font-semibold text-slate-700"
        >
          <RotateCw className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
          <span>{isFlipped ? 'Show Front Side' : 'Show Back Side (QR Code)'}</span>
        </Button>
      </div>

      {/* 3. Download Options */}
      <div className="pt-4 border-t border-slate-100 space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
          3. Download Your ID Card
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Single PDF with Front and Back */}
          <Button
            variant="primary"
            size="md"
            onClick={onDownloadPDF}
            disabled={!canDownload}
            isLoading={isDownloading}
            className="w-full text-xs font-bold shadow-sm justify-center py-3"
          >
            <Download className="w-4 h-4 mr-2" />
            <span>Download PDF (Front & Back)</span>
          </Button>

          {/* Two JPG Images */}
          <Button
            variant="outline"
            size="md"
            onClick={onDownloadJPGs}
            disabled={!canDownload}
            isLoading={isDownloading}
            className="w-full text-xs font-bold text-slate-700 hover:text-slate-900 justify-center py-3"
          >
            <ImageIcon className="w-4 h-4 mr-2 text-brand-600" />
            <span>Download JPGs (2 Images)</span>
          </Button>
        </div>
        {!canDownload && <p className="text-center text-xs font-medium text-amber-700">Downloads unlock after your organization approves this ID card.</p>}

        <p className="text-[11px] text-slate-500 text-center pt-1">
          Downloaded files are calibrated to official ID card dimensions (54 × 86 mm ISO standard) with high print resolution.
        </p>
      </div>
    </div>
  );
}
