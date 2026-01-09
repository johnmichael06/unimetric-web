import React, { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Electricity from "./pages/Electricity";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import History from "./pages/History";
import Landing from "./pages/Landing";
import ProfileSettings from "./pages/Profile";
import VerifySuccess from "./pages/VerifySuccess";
import { Loader2 } from "lucide-react";
import Goals from "./pages/Goals";

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [showAuth, setShowAuth] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // 1. Detect verification hash BEFORE checking session
    const hash = window.location.hash;
    if (
      hash &&
      (hash.includes("access_token") || hash.includes("type=signup"))
    ) {
      setIsVerified(true);
      window.history.replaceState(null, null, " ");
    }

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

  // --- RENDERING ORDER IS CRITICAL HERE ---

  // 1. Loading screen
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  // 2. Verification Success (HIGHEST PRIORITY)
  // This must be above session/onboarding checks.
  if (isVerified) {
    return (
      <VerifySuccess
        onContinue={() => {
          setIsVerified(false);
          if (!session) setShowAuth(true);
        }}
      />
    );
  }

  // 3. No Session (Landing/Auth)
  if (!session) {
    return showAuth ? (
      <Auth onBack={() => setShowAuth(false)} />
    ) : (
      <Landing onGetStarted={() => setShowAuth(true)} />
    );
  }

  // 4. Incomplete Profile (Onboarding)
  if (userProfile && (!userProfile.full_name || !userProfile.course_year)) {
    return <Onboarding onComplete={() => fetchProfile(session.user.id)} />;
  }

  // 5. Main App
  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard onNavigate={setActivePage} />;
      case "expenses":
        return <Expenses />;
      case "history":
        return <History />;
      // In App.jsx inside renderPage():

      case "goals":
        return <Goals />;
      case "electricity":
        return <Electricity onNavigate={setActivePage} />; // <--- ADD THIS PROP
      case "profile":
        return (
          <ProfileSettings onUpdate={() => fetchProfile(session.user.id)} />
        );
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };
  // Trigger update

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
