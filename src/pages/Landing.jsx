import React from "react";
import {
  Zap,
  Wallet,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Star,
  LayoutDashboard,
  Quote,
} from "lucide-react";

export default function Landing({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans text-gray-900 selection:bg-brand-100 overflow-x-hidden">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <Zap size={20} fill="white" />
            </div>
            <span>UniMetric</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={onGetStarted}
              className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Log in
            </button>
            <button
              onClick={onGetStarted}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* LEFT: Copywriting */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold uppercase tracking-wide mb-6">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Student Finance App
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
              Stop guessing where your{" "}
              <span className="text-brand-600 relative inline-block">
                allowance
                <svg
                  className="absolute w-full h-3 -bottom-1 left-0 text-brand-200 -z-10"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                  />
                </svg>
              </span>{" "}
              went.
            </h1>

            <p className="text-lg text-gray-500 mb-8 leading-relaxed max-w-lg">
              The all-in-one tracker for students. Monitor expenses, split
              bills, and verify your landlord's electricity reading in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-brand-500/20 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Start Tracking Free <ArrowRight size={18} />
              </button>
              <div className="flex items-center gap-4 px-4 py-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden"
                    >
                      <img
                        src={`https://i.pravatar.cc/100?img=${i + 55}`}
                        alt="User"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex text-yellow-400 gap-0.5">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                  </div>
                  <span className="font-semibold text-gray-900">
                    Loved by students
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" /> No credit
                card needed
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" /> Free for
                students
              </span>
            </div>
          </div>

          {/* RIGHT: Mockup */}
          <div className="relative perspective-1000 hidden lg:block">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-100 to-transparent rounded-full blur-3xl -z-10 opacity-60 animate-pulse"></div>

            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200/50 p-2 transform rotate-y-12 rotate-x-6 hover:rotate-0 transition-transform duration-700 ease-out">
              <div className="h-8 bg-gray-50 border-b border-gray-100 rounded-t-xl flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>

              <div className="grid grid-cols-4 gap-0 h-[400px] bg-gray-50 overflow-hidden rounded-b-xl">
                <div className="col-span-1 bg-white border-r border-gray-100 p-4 space-y-4">
                  <div className="h-8 w-8 bg-brand-500 rounded-lg mb-6"></div>
                  <div className="h-2 w-20 bg-gray-100 rounded"></div>
                  <div className="h-2 w-16 bg-gray-100 rounded"></div>
                  <div className="h-2 w-24 bg-gray-100 rounded"></div>
                </div>
                <div className="col-span-3 p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 w-48 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="h-8 w-8 rounded-lg bg-green-50 mb-3"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 w-12 bg-gray-100 rounded"></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="h-8 w-8 rounded-lg bg-orange-50 mb-3"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 w-12 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-gray-100 rounded"></div>
                      <div className="h-3 w-12 bg-gray-100 rounded"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 w-32 bg-gray-100 rounded"></div>
                      <div className="h-3 w-12 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Element 1 */}
              <div
                className="absolute -right-12 top-20 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce"
                style={{ animationDuration: "3s" }}
              >
                <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">
                    Transaction
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    Saved ₱150.00
                  </p>
                </div>
              </div>

              {/* Floating Element 2 */}
              <div
                className="absolute -left-8 bottom-12 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce"
                style={{ animationDuration: "4s" }}
              >
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">
                    Electricity
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    Overcharge Detected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 bg-white border-t border-gray-100 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to survive college
            </h2>
            <p className="text-gray-500">
              Simple tools designed specifically for the student lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Expenses */}
            <div className="bg-[#F9FAFB] p-8 rounded-3xl border border-gray-100 hover:border-brand-200 transition-colors md:col-span-2 group">
              <div className="w-12 h-12 bg-white shadow-sm text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Smart Expense Tracking
              </h3>
              <p className="text-gray-500 mb-6">
                Log purchases in seconds. Categorize by Food, Transport, or
                School supplies and see exactly where your weekly allowance is
                going.
              </p>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-medium">
                  Weekly View
                </span>
                <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-medium">
                  Category Filters
                </span>
              </div>
            </div>

            {/* Card 2: Electricity */}
            <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-sm hover:shadow-lg transition-all text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-green-500 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2 group-hover:opacity-30 transition-opacity"></div>
              <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Electricity Audit</h3>
              <p className="text-gray-400 mb-6">
                Landlord overcharging you? Log your meter readings and calculate
                the *real* cost instantly.
              </p>
              <div className="flex items-center gap-2 text-sm font-semibold text-green-300">
                <ShieldCheck size={16} />
                <span>Verify Accuracy</span>
              </div>
            </div>

            {/* Card 3: Dashboard */}
            <div className="bg-[#F9FAFB] p-8 rounded-3xl border border-gray-100 hover:border-brand-200 transition-colors group">
              <div className="w-12 h-12 bg-white shadow-sm text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Visual Dashboard
              </h3>
              <p className="text-gray-500">
                Beautiful charts that show your spending trends at a glance.
                Know when to save and when to treat yourself.
              </p>
            </div>

            {/* Card 4: History */}
            <div className="bg-[#F9FAFB] p-8 rounded-3xl border border-gray-100 hover:border-brand-200 transition-colors md:col-span-2 group">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Complete History
              </h3>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-100 group-hover:border-brand-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400">
                        {i}
                      </div>
                      <div className="h-2 w-24 bg-gray-100 rounded-full"></div>
                    </div>
                    <div className="h-2 w-12 bg-gray-100 rounded-full"></div>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 mt-6 text-sm">
                Never lose track of a transaction again with our powerful search
                and filter history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: TESTIMONIALS --- */}
      <section className="py-24 bg-gray-50 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by students
            </h2>
            <p className="text-gray-500">
              See why your classmates are switching to UniMetric.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Miguel",
                role: "BSIT Student",
                text: "Finally found out my landlord was overcharging me by 300 pesos every month. This app pays for itself.",
              },
              {
                name: "Sarah",
                role: "Nursing Student",
                text: "I used to run out of allowance by Wednesday. The weekly budget view actually saved my life.",
              },
              {
                name: "Jay",
                role: "Engineering",
                text: "Simple, fast, and doesn't look like a boring spreadsheet. Exactly what I needed.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <Quote className="text-brand-200 mb-4" size={32} />
                <p className="text-gray-600 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center font-bold text-brand-600">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NEW SECTION: FINAL CTA --- */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gray-900 rounded-3xl p-12 text-center relative overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-brand-500 rounded-full blur-[100px] opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-30 translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to take control?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto text-lg">
              Join hundreds of students who are mastering their finances today.
              It's free, secure, and easy.
            </p>
            <button
              onClick={onGetStarted}
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg active:scale-95"
            >
              Get Started Now
            </button>
            <p className="mt-4 text-xs text-gray-500">
              No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4 text-center">
        <div className="flex items-center justify-center gap-2 font-bold text-xl tracking-tight text-gray-900 mb-4">
          <Zap size={20} className="text-brand-600" />
          <span>UniMetric</span>
        </div>
        <p className="text-gray-500 text-sm mb-8">
          © 2026 UniMetric. Built for students.
        </p>
        <div className="flex justify-center gap-6 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-brand-600 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-brand-600 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-brand-600 transition-colors">
            Twitter
          </a>
        </div>
      </footer>
    </div>
  );
}
