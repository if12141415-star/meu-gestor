/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import HomeView from "./components/HomeView.tsx";
import LoginView from "./components/LoginView.tsx";
import RegisterView from "./components/RegisterView.tsx";
import RecoverView from "./components/RecoverView.tsx";
import ResetPasswordView from "./components/ResetPasswordView.tsx";
import DashboardView from "./components/DashboardView.tsx";
import SuperAdminSetupView from "./components/SuperAdminSetupView.tsx";
import SuperAdminLoginView from "./components/SuperAdminLoginView.tsx";

type ActiveView = "home" | "login" | "register" | "recover" | "reset_password" | "dashboard" | "superadmin_setup" | "superadmin_login";

export default function App() {
  const [view, setView] = useState<ActiveView>("home");
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("meugestor_token"));
  const [user, setUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [restoringSession, setRestoringSession] = useState(true);
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Auto-restore session and parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const rt = params.get("resetToken");
    if (rt) {
      setResetToken(rt);
      setView("reset_password");
      setRestoringSession(false);
      return;
    }

    const restoreSession = async () => {
      // 1. Check if superadmin setup is required
      try {
        const setupRes = await fetch("/api/superadmin/setup/status");
        if (setupRes.ok) {
          const setupData = await setupRes.json();
          if (!setupData.hasSuperAdmin) {
            setView("superadmin_setup");
            setRestoringSession(false);
            return;
          }
        }
      } catch (e) {
        console.error("Erro ao carregar status do superadmin:", e);
      }

      if (!token) {
        setRestoringSession(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setCompany(data.company);
          setView("dashboard");
        } else {
          // Token expired or invalid
          localStorage.removeItem("meugestor_token");
          setToken(null);
        }
      } catch (err) {
        console.error("Erro ao restaurar sessão:", err);
      } finally {
        setRestoringSession(false);
      }
    };

    restoreSession();
  }, [token]);

  // Auth handler: Successful Login
  const handleAuthSuccess = (newToken: string, loggedUser: any, loggedCompany: any) => {
    localStorage.setItem("meugestor_token", newToken);
    setToken(newToken);
    setUser(loggedUser);
    setCompany(loggedCompany);
    setView("dashboard");
  };

  // Auth handler: Log Out
  const handleLogout = () => {
    localStorage.removeItem("meugestor_token");
    setToken(null);
    setUser(null);
    setCompany(null);
    setView("home");
  };

  if (restoringSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <svg className="animate-spin h-8 w-8 text-emerald-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-slate-500 text-sm font-semibold">Carregando Meu Gestor...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 overflow-x-hidden">
      <AnimatePresence mode="wait">
        
        {view === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <HomeView onNavigate={setView} />
          </motion.div>
        )}

        {view === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <LoginView onNavigate={setView} onLoginSuccess={handleAuthSuccess} />
          </motion.div>
        )}

        {view === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <RegisterView onNavigate={setView} onRegisterSuccess={handleAuthSuccess} />
          </motion.div>
        )}

        {view === "recover" && (
          <motion.div
            key="recover"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <RecoverView onNavigate={setView} />
          </motion.div>
        )}

        {view === "reset_password" && (
          <motion.div
            key="reset_password"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ResetPasswordView token={resetToken || ""} onNavigate={setView} />
          </motion.div>
        )}

        {view === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DashboardView 
              token={token || ""} 
              user={user} 
              company={company} 
              onLogout={handleLogout} 
            />
          </motion.div>
        )}

        {view === "superadmin_setup" && (
          <motion.div
            key="superadmin_setup"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <SuperAdminSetupView onSetupSuccess={handleAuthSuccess} />
          </motion.div>
        )}

        {view === "superadmin_login" && (
          <motion.div
            key="superadmin_login"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <SuperAdminLoginView onNavigate={setView} onLoginSuccess={handleAuthSuccess} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
