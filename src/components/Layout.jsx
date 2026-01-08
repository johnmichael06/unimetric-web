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
    { id: "history", label: "History", icon: History },
    { id: "electricity", label: "Electricity & Utilities", icon: Zap },
  ];

  return (
    // FIX 1: Change min-h-screen to h-screen and overflow-hidden
    // This stops the whole page from scrolling and locks the layout structure
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Header (unchanged) */}
      <div className="lg:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-50 px-4 py-3 flex justify-between items-center">
        <Logo />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      {/* FIX 2: Simplified positioning so it stays stable */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-200 ease-in-out 
        lg:static lg:translate-x-0 flex flex-col
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 hidden lg:block">
            <Logo />
          </div>

          <nav className="flex-1 p-4 space-y-1 mt-14 lg:mt-0 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activePage === item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setIsMobileMenuOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                <UserCircle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {userProfile?.full_name || "Student"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userProfile?.course_year || "Course not set"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* FIX 3: overflow-y-auto is HERE. Only this box scrolls now. */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 relative w-full">
        <div className="max-w-5xl mx-auto p-4 lg:p-8 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
