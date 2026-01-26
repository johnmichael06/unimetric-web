import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Zap,
  Wallet,
  LayoutDashboard,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Star,
  Quote,
  TrendingUp,
} from "lucide-react";

// Register GSAP Plugin
gsap.registerPlugin(ScrollTrigger);

export default function Landing({ onGetStarted }) {
  const comp = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // --- 1. HERO ANIMATION (Using fromTo for safety) ---
      const tl = gsap.timeline();

      // Navbar
      tl.fromTo(
        "nav",
        { y: -100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      )
        // Badge
        .fromTo(
          ".hero-badge",
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" },
          "-=0.4",
        )
        // Headline (Staggered)
        .fromTo(
          ".hero-text",
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out" },
          "-=0.3",
        )
        // Buttons (CRITICAL FIX: Explicit visibility)
        .fromTo(
          ".hero-btn",
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" },
          "-=0.4",
        )
        // Mockup
        .fromTo(
          ".hero-mockup",
          { x: 100, opacity: 0, rotateY: -30 },
          { x: 0, opacity: 1, rotateY: 0, duration: 1.2, ease: "power3.out" },
          "-=0.8",
        );

      // --- 2. SCROLL TRIGGER ANIMATIONS ---

      // Feature Cards
      gsap.fromTo(
        ".feature-card",
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".features-grid",
            start: "top 85%", // Trigger sooner
          },
        },
      );

      // Testimonial Cards
      gsap.fromTo(
        ".testimonial-card",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".testimonials-grid",
            start: "top 90%",
          },
        },
      );

      // CTA Section
      gsap.fromTo(
        ".cta-box",
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".cta-section",
            start: "top 85%",
          },
        },
      );
    }, comp);

    return () => ctx.revert(); // Cleanup is crucial
  }, []);

  return (
    <div
      ref={comp}
      className="min-h-screen bg-white font-sans text-gray-900 selection:bg-brand-100 overflow-x-hidden opacity-0 animate-fade-in-page"
    >
      {/* CSS Failsafe: If JS crashes, this forces opacity:1 after 100ms */}
      <style>{`
        @keyframes fadeInPage { to { opacity: 1; } }
        .animate-fade-in-page { animation: fadeInPage 0.1s forwards; }
      `}</style>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
              <Zap size={20} fill="white" />
            </div>
            <span>UniMetric</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={onGetStarted}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors hidden sm:block"
            >
              Log in
            </button>
            <button
              onClick={onGetStarted}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-xl active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        {/* Subtle Gradient Background */}
        <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-brand-50/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -z-10 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-3xl opacity-40 pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          {/* LEFT: Copywriting */}
          <div className="max-w-2xl relative z-10">
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.05]">
              <div className="hero-text">Stop guessing</div>
              <div className="hero-text">
                where your <span className="text-brand-600">allowance</span>
              </div>
              <div className="hero-text">actually went.</div>
            </h1>

            <p className="hero-text text-lg sm:text-xl text-gray-500 mb-10 leading-relaxed max-w-lg">
              The only financial tracker built for the student lifestyle. Track
              expenses, audit your electricity bill, and survive the semester
              without going broke.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={onGetStarted}
                className="hero-btn group px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-full font-bold text-lg transition-all shadow-xl shadow-brand-500/25 hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Start Tracking Free
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <div className="hero-btn flex items-center gap-4 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"
                    >
                      <img
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        alt="User"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex text-yellow-400 gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={10} fill="currentColor" />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">100+ Students</span>
                </div>
              </div>
            </div>

            <div className="hero-btn flex items-center gap-6 text-sm font-medium text-gray-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> No
                credit card
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Free
                forever plan
              </span>
            </div>
          </div>

          {/* RIGHT: Mockup (GSAP Animated) */}
          <div className="hero-mockup relative perspective-1000 hidden lg:block">
            {/* The 3D Container */}
            <div className="relative transform-style-3d rotate-y-12 hover:rotate-y-0 transition-transform duration-1000 ease-out cursor-default">
              {/* Main App Window */}
              <div className="relative bg-white rounded-2xl border border-gray-200/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] p-2">
                {/* Traffic Lights */}
                <div className="h-8 bg-gray-50/50 border-b border-gray-100 rounded-t-xl flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
                </div>

                {/* Mockup Content */}
                <div className="grid grid-cols-4 gap-0 h-[450px] bg-gray-50/30 overflow-hidden rounded-b-xl">
                  {/* Sidebar */}
                  <div className="col-span-1 bg-white border-r border-gray-100 p-4 space-y-4">
                    <div className="h-8 w-8 bg-brand-500 rounded-lg mb-8 shadow-lg shadow-brand-500/20"></div>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-2.5 rounded-full ${i === 1 ? "w-20 bg-gray-200" : "w-16 bg-gray-100"}`}
                      ></div>
                    ))}
                  </div>
                  {/* Main Content */}
                  <div className="col-span-3 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="h-4 w-32 bg-gray-800 rounded-md mb-2"></div>
                        <div className="h-3 w-48 bg-gray-200 rounded-md"></div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-gray-100 border border-gray-200"></div>
                    </div>
                    {/* Charts */}
                    <div className="flex gap-4 items-end h-32 pb-4 border-b border-gray-100">
                      {[40, 70, 45, 90, 60, 80].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-brand-500 rounded-t-lg opacity-80"
                          style={{ height: `${h}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                          <Zap size={16} />
                        </div>
                        <div className="h-2 w-12 bg-gray-100 rounded mb-2"></div>
                        <div className="h-5 w-24 bg-gray-800 rounded"></div>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                          <Wallet size={16} />
                        </div>
                        <div className="h-2 w-12 bg-gray-100 rounded mb-2"></div>
                        <div className="h-5 w-24 bg-gray-800 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Notifications (Parallax effect) */}
              <div className="absolute -right-8 top-24 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] border border-white/50 flex items-center gap-3 animate-float-slow">
                <div className="p-2.5 bg-green-100 text-green-600 rounded-xl">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Success
                  </p>
                  <p className="text-sm font-bold text-gray-900">
                    Budget Saved!
                  </p>
                </div>
              </div>

              <div className="absolute -left-12 bottom-20 bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-800 flex items-center gap-3 animate-float-delayed">
                <div className="p-2.5 bg-brand-500 text-white rounded-xl">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Alert
                  </p>
                  <p className="text-sm font-bold text-white">
                    Overcharge Detected
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="features-grid py-32 bg-gray-50/50 border-t border-gray-100 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Everything you need to <br /> survive the semester.
            </h2>
            <p className="text-lg text-gray-500">
              We stripped away the complex finance jargon and built tools that
              actually help students manage daily life in Davao.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="feature-card bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 md:col-span-2 group">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                <Wallet size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Smart Expense Tracking
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Log purchases in seconds. Categorize by Food, Transport, or
                School supplies and see exactly where your allowance is going
                before it's gone.
              </p>
            </div>

            {/* Card 2 (Dark Mode Card) */}
            <div className="feature-card bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-brand-500 rounded-full blur-[80px] opacity-20 translate-x-1/2 -translate-y-1/2 group-hover:opacity-30 transition-opacity"></div>
              <div className="w-14 h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-3">Electricity Audit</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Landlord overcharging? Log readings and calculate the *real*
                cost instantly.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-brand-200">
                <ShieldCheck size={14} /> Power Protection
              </div>
            </div>

            {/* Card 3 */}
            <div className="feature-card bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <LayoutDashboard size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Visual Dashboard
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Beautiful charts show spending trends at a glance. Know when to
                save and when to treat yourself.
              </p>
            </div>

            {/* Card 4 */}
            <div className="feature-card bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 md:col-span-2 group">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <TrendingUp size={28} />
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-4 border-white bg-gray-100"
                    ></div>
                  ))}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Complete History & Search
              </h3>
              <p className="text-gray-500 leading-relaxed">
                "Where did that 500 pesos go?" Now you know. Search by date,
                category, or amount instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section className="testimonials-grid py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
              Trusted by students in Davao
            </h2>
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
                className="testimonial-card bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-6 text-brand-300">
                  <Quote size={40} className="fill-current opacity-20" />
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed font-medium">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-600 text-lg">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="cta-section py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
        <div className="cta-box max-w-5xl mx-auto bg-gray-900 rounded-[2.5rem] p-12 sm:p-24 text-center relative overflow-hidden shadow-2xl shadow-gray-900/20">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-600 rounded-full blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2 mix-blend-screen"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[120px] opacity-20 translate-x-1/2 translate-y-1/2 mix-blend-screen"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-8 tracking-tight">
              Ready to stop being <br /> broke?
            </h2>
            <p className="text-gray-300 mb-10 text-xl leading-relaxed">
              Join hundreds of students who are mastering their finances today.
              <span className="text-white font-semibold">
                {" "}
                It's free, secure, and easier than Excel.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg active:scale-95"
              >
                Get Started Now
              </button>
              <p className="text-xs text-gray-500 sm:hidden">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-white py-12 px-4 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
              <Zap size={20} fill="white" />
            </div>
            <span>UniMetric</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">
            © 2026 UniMetric. Built by John Michael Rivera
          </p>
          <div className="flex gap-6">
            {/* Social placeholders */}
            <div className="w-5 h-5 bg-gray-200 rounded-full hover:bg-brand-500 transition-colors cursor-pointer"></div>
            <div className="w-5 h-5 bg-gray-200 rounded-full hover:bg-brand-500 transition-colors cursor-pointer"></div>
            <div className="w-5 h-5 bg-gray-200 rounded-full hover:bg-brand-500 transition-colors cursor-pointer"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
