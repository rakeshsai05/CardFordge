import React, { useState } from 'react';
import { CheckCircle2, X, DoorOpen, Radio } from 'lucide-react';
import Button from '../common/Button';
import api from '../../services/api';

/**
 * Clean audio chime when student card is tapped at the gate.
 */
function playGateBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Ignore if browser restricts audio
  }
}

export default function GateTapModal({ isOpen, onClose, student }) {
  const [selectedGate, setSelectedGate] = useState('College Main Gate');
  const [tapStatus, setTapStatus] = useState('idle'); // 'idle' | 'scanning' | 'granted'
  const [entryTime, setEntryTime] = useState('');

  if (!isOpen) return null;

  const gates = [
    'College Main Gate',
    'Central Library',
    'Computer Science Lab',
    'Sports & Gym Center',
  ];

  const handleTap = async () => {
    setTapStatus('scanning');

    setTimeout(async () => {
      playGateBeep();
      setTapStatus('granted');
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setEntryTime(timeString);

      try {
        if (student?.verificationId) {
          await api.post(`/verify/${student.verificationId}/gate-tap`, {
            gateLocation: selectedGate,
          });
        }
      } catch (err) {
        // Fallback demo
      }
    }, 700);
  };

  const handleReset = () => {
    setTapStatus('idle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 shadow-xl text-slate-900 space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <h3 className="text-base font-bold text-slate-900">Campus Gate Entry</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Tap your ID card to mark your entry attendance
          </p>
        </div>

        {/* Select Gate Dropdown */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Choose Gate / Room:</label>
          <select
            value={selectedGate}
            onChange={(e) => {
              setSelectedGate(e.target.value);
              handleReset();
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {gates.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Status Box */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-6 flex flex-col items-center justify-center text-center min-h-[160px]">
          {tapStatus === 'idle' && (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <DoorOpen className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-800">Scanner Ready</p>
              <p className="text-[11px] text-slate-500">Click the button below to tap your card</p>
            </div>
          )}

          {tapStatus === 'scanning' && (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full border-2 border-brand-600 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-bold text-brand-600">Checking Card...</p>
            </div>
          )}

          {tapStatus === 'granted' && (
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-700">Entry Allowed</p>
                <p className="text-xs font-medium text-slate-800 mt-1">{student?.fullName || 'Student'}</p>
                <p className="text-[11px] text-slate-500">
                  {selectedGate} at {entryTime}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          {tapStatus === 'granted' ? (
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={handleReset}>
              Tap Again
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              className="w-full text-xs font-bold"
              onClick={handleTap}
              disabled={tapStatus === 'scanning'}
            >
              {tapStatus === 'scanning' ? 'Checking...' : 'Tap Card to Enter'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
