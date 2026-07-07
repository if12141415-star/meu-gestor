/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Mail, Lock, AlertCircle, ArrowLeft, ShieldAlert, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface SuperAdminLoginViewProps {
  onNavigate: (view: string) => void;
  onLoginSuccess: (token: string, user: any, company: any) => void;
}

export default function SuperAdminLoginView({ onNavigate, onLoginSuccess }: SuperAdminLoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Recovery states
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/superadmin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro de autenticação.");
      }

      onLoginSuccess(data.token, data.user, data.company);
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRecoverySuccess(null);

    if (!recoveryEmail) {
      setError("Por favor, preencha o e-mail.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao recuperar senha.");
      }

      setRecoverySuccess(data.message || "E-mail de recuperação enviado com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao solicitar recuperação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased text-slate-100 relative overflow-hidden">
      
      {/* Visual background elements */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl"></div>

      <div className="max-w-md w-full space-y-8 bg-slate-900/80 p-8 rounded-2xl border border-slate-800 shadow-2xl relative z-10 backdrop-blur-sm">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/10 mb-4">
            <ShieldAlert className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isRecovering ? "Recuperar Senha Master" : "Acesso do Super Administrador"}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            {isRecovering 
              ? "Insira seu e-mail cadastrado de Super Administrador."
              : "Painel de controle geral da infraestrutura e faturamento."
            }
          </p>
        </div>

        {/* Success Feedback */}
        {recoverySuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5"
            id="recovery-success-box"
          >
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold block">Sucesso!</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">{recoverySuccess}</p>
            </div>
          </motion.div>
        )}

        {/* Error notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
            id="login-error-box"
          >
            <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
            <span className="font-medium leading-relaxed">{error}</span>
          </motion.div>
        )}

        {isRecovering ? (
          // Recover Password Form
          <form className="mt-6 space-y-4" onSubmit={handleRecoverySubmit} id="form-recover-superadmin">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                E-mail do Super Administrador
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="superadmin@meugestor.com"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 transition-colors focus:outline-none"
                  id="recovery-email"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-submit-recovery"
              >
                {loading ? "Processando..." : "Solicitar Link de Recuperação"}
              </button>

              <button
                type="button"
                onClick={() => { setIsRecovering(false); setError(null); setRecoverySuccess(null); }}
                className="w-full text-center text-xs text-slate-400 hover:text-white font-semibold transition-colors py-2 cursor-pointer flex items-center justify-center gap-1.5"
                id="btn-back-to-login"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login Master
              </button>
            </div>
          </form>
        ) : (
          // Login Form
          <form className="mt-6 space-y-4" onSubmit={handleLoginSubmit} id="form-login-superadmin">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                E-mail Master
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@meugestor.com"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 transition-colors focus:outline-none"
                  id="login-email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Senha Master
                </label>
                <button
                  type="button"
                  onClick={() => { setIsRecovering(true); setError(null); setRecoverySuccess(null); }}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold tracking-tight cursor-pointer focus:outline-none"
                  id="link-recover-password"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 transition-colors focus:outline-none"
                  id="login-password"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                id="btn-submit-login"
              >
                {loading ? "Validando..." : "Entrar como Super Administrador"}
              </button>

              <button
                type="button"
                onClick={() => onNavigate("login")}
                className="w-full text-center text-xs text-slate-400 hover:text-white font-semibold transition-colors py-2 cursor-pointer flex items-center justify-center gap-1.5"
                id="btn-return-login"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Login Geral
              </button>
            </div>
          </form>
        )}

        <div className="text-center relative z-10 pt-4 border-t border-slate-800/50 text-[10px] text-slate-500 font-mono">
          Meu Gestor SaaS • Acesso Restrito
        </div>

      </div>
    </div>
  );
}
