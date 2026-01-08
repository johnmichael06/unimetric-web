import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Electricity from "./pages/Electricity";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import History from "./pages/History";
import Landing from "./pages/Landing"; // <--- Import the new page
import { Loader2 } from "lucide-react";

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  // New State: Controls if we show Auth screen or Landing page
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    checkUser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSession(session);
    if (session) await fetchProfile(session.user.id);
    else setLoading(false);
  }

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setUserProfile(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  // LOGIC: If no session...
  if (!session) {
    // Show Auth if requested, otherwise show Landing
    return showAuth ? (
      <Auth onBack={() => setShowAuth(false)} /> // <--- Add this prop!
    ) : (
      <Landing onGetStarted={() => setShowAuth(true)} />
    );
  }

  // LOGIC: If session exists, but no profile -> Onboarding
  if (userProfile && (!userProfile.full_name || !userProfile.course_year)) {
    return <Onboarding onComplete={() => fetchProfile(session.user.id)} />;
  }

  // LOGIC: Logged in & Profile ready -> Main App
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onNavigate={setActivePage} />;
      case "expenses":
        return <Expenses />;
      case "history":
        return <History />;
      case "electricity":
        return <Electricity />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <Layout
      activePage={activePage}
      setActivePage={setActivePage}
      userProfile={userProfile}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
