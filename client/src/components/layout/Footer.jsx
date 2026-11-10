import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white text-slate-600 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base text-slate-900">
                Card<span className="text-brand-600">Forge</span>
              </span>
            </Link>
            <p className="text-slate-500 max-w-sm leading-relaxed">
              A flexible identity card studio for personal, school, team, event, and membership cards.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Pages
            </h5>
            <ul className="space-y-1.5">
              <li>
                <Link to="/" className="hover:text-brand-600">Home</Link>
              </li>
              <li>
                <Link to="/#features" className="hover:text-brand-600">Features</Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-brand-600">Check Card (QR)</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-brand-600">Account sign in</Link>
              </li>
            </ul>
          </div>

          {/* Tech Info */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Built With
            </h5>
            <ul className="space-y-1.5 text-slate-500">
              <li>MERN Stack (MongoDB, Express, React, Node)</li>
              <li>Vertical Card Format (54 × 86 mm)</li>
              <li>Print-Ready PDF Download</li>
              <li>QR Code Verification</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px]">
          <p>© {new Date().getFullYear()} CardForge. All rights reserved.</p>
          <p>Make an ID that feels like yours.</p>
        </div>
      </div>
    </footer>
  );
}
