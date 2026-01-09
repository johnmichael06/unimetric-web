import React, { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

export default function BrowserGuard({ children }) {
  const [isInApp, setIsInApp] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    // Detect Facebook (FBAN/FBAV) and Instagram
    const isFacebook = ua.indexOf("FBAN") > -1 || ua.indexOf("FBAV") > -1;
    const isInstagram = ua.indexOf("Instagram") > -1;

    // Uncomment the next line to preview the screen on localhost
    // setIsInApp(true);
    setIsInApp(isFacebook || isInstagram);
  }, []);

  if (isInApp) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in overflow-hidden">
        {/* --- BACKGROUND PATTERNS --- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Dot Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>

          {/* Soft Green Glow Orb in Middle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[80px]"></div>
        </div>

        {/* --- CONTENT (Relative z-10 to sit above pattern) --- */}
        <div className="relative z-10 flex flex-col items-center max-w-sm w-full">
          {/* Friendly Green Icon */}
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10 border border-emerald-100">
            <ExternalLink
              size={32}
              className="text-emerald-600"
              strokeWidth={2.5}
            />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
            Open in System Browser
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            For the best experience and secure login, please open this in your
            phone's main browser.
          </p>

          {/* Instruction Card */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-200/40 w-full">
            <ol className="text-left space-y-5 text-sm text-gray-700 font-medium">
              <li className="flex gap-4 items-center">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
                  1
                </span>
                <span>
                  Tap the <strong>3 dots</strong> (or Share icon) in the corner
                  of your screen.
                </span>
              </li>
              <li className="flex gap-4 items-center">
                <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200">
                  2
                </span>
                <span>
                  Select <strong>Open in Browser</strong> (Chrome or Safari).
                </span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
