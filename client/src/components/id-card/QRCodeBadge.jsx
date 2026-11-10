import React from 'react';
import * as QRCodeModule from 'qrcode.react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

const QRCodeComponent = QRCodeModule.QRCodeSVG || QRCodeModule.QRCodeCanvas;

export default function QRCodeBadge({
  verificationId = 'PREVIEW',
  size = 84,
  template = 'white',
  className,
}) {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const verificationUrl = `${origin}/verify/${verificationId}`;

  return (
    <div
      className={cn(
        'p-2 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center shadow-sm flex-shrink-0',
        className
      )}
    >
      {QRCodeComponent ? (
        <QRCodeComponent
          value={verificationUrl}
          size={size}
          level="M"
          includeMargin={false}
          className="w-full h-auto"
        />
      ) : (
        <div style={{ width: size, height: size }} className="bg-slate-100 rounded-lg flex items-center justify-center text-[8px] font-mono text-slate-500">
          QR CODE
        </div>
      )}
      <div className="mt-1 flex items-center gap-1 text-[8px] font-bold text-slate-600">
        <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
        <span>Scan with Phone Camera</span>
      </div>
    </div>
  );
}
