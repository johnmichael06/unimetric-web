import React from "react";
import { CheckCircle, ArrowRight, Zap } from "lucide-react";

export default function VerifySuccess({ onContinue }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100 text-center animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 shadow-inner">
            <CheckCircle size={48} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verification Successful!
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          Your email has been confirmed. You can now access your UniMetric
          dashboard and start tracking your expenses.
        </p>

        <button
          onClick={onContinue}
          className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] flex justify-center items-center gap-2"
        >
          Go to Sign In <ArrowRight size={18} />
        </button>

        <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
          <Zap size={16} />
          <span className="text-xs font-medium uppercase tracking-widest">
            UniMetric
          </span>
        </div>
      </div>
    </div>
  );
}
