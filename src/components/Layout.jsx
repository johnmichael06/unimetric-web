import React, { useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  Zap,
  Menu,
  X,
  LogOut,
  UserCircle,
  History,
  Target,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const Logo = () => (
  <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900">
    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white">
      <Zap size={20} fill="white" />
    </div>
    <span>UniMetric</span>
  </div>
);

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg ${
      active ? "bg-brand-50 text-brand-600" : "text-gray-600 hover:bg-gray-50"
    }`}
  >
    <Icon size={20} />
    {label}
  </button>
);

export default function Layout({
  children,
  activePage,
  setActivePage,
  userProfile,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "expenses", label: "Expenses", icon: Wallet },
    { id: "goals", label: "Goals", icon: Target },
    { id: "history", label: "History", icon: History },
    { id: "electricity", label: "Electricity & Utilities", icon: Zap },
    { id: "profile", label: "Account Settings", icon: UserCircle },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* --- MOBILE HEADER (Fixed Top) --- */}
      <div className="lg:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-50 px-4 py-3 flex justify-between items-center h-16">
        <Logo />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside
        className={`
          fixed inset-0 z-40 bg-white border-r border-gray-200
          /* Mobile: Full screen, padded top, fade animation */
          pt-16 w-full transition-all duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible -translate-y-2"
          }
          
          /* Desktop: Static, fixed width, always visible, no padding/animation */
          lg:static lg:w-64 lg:pt-0 lg:opacity-100 lg:visible lg:translate-y-0 lg:block
        `}
      >
        <div className="h-full flex flex-col">
          {/* Desktop Logo Area */}
          <div className="p-6 border-b border-gray-100 hidden lg:block h-20">
            <Logo />
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activePage === item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsMobileMenuOpen(false); // Auto-close on selection
                }}
              />
            ))}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-gray-100">
            <div
              onClick={() => {
                setActivePage("profile");
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 group"
            >
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-brand-500 shrink-0">
                <UserCircle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userProfile?.full_name || "Student"}
                </p>
                <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                  Edit Profile
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }}
                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-white"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 relative w-full bg-gray-50/30">
        <div className="max-w-6xl mx-auto p-4 lg:p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
