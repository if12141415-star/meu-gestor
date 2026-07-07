/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Layers, ArrowLeft, Mail, Lock, AlertCircle, Eye, EyeOff, Building2, Search, Check, ChevronDown, User } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LoginViewProps {
  onNavigate: (view: string) => void;
  onLoginSuccess: (token: string, user: any, company: any) => void;
}

interface CompanyItem {
  id: string;
  name: string;
  status: string;
}

export default function LoginView({ onNavigate, onLoginSuccess }: LoginViewProps) {
  const [empresa, setEmpresa] = useState("");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("meugestor_remember") !== "false";
  });
  
  const [googleEnabled, setGoogleEnabled] = useState(false);
  
  // Searchable companies list states
  const [companiesList, setCompaniesList] = useState<CompanyItem[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyItem[]>([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load companies and Google config on mount
  useEffect(() => {
    // Check Google Auth config
    fetch("/api/auth/google/config")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.enabled === "boolean") {
          setGoogleEnabled(data.enabled);
        }
      })
      .catch(err => {
        console.error("Erro ao verificar configuração do Google OAuth:", err);
      });

    // Fetch registered companies list
    fetch("/api/auth/companies")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCompaniesList(data);
          setFilteredCompanies(data);
        }
      })
      .catch(err => {
        console.error("Erro ao carregar lista de empresas:", err);
      });

    // Load remembered company/user if available
    const savedCompany = localStorage.getItem("meugestor_remember_company");
    const savedUser = localStorage.getItem("meugestor_remember_user");
    if (savedCompany) setEmpresa(savedCompany);
    if (savedUser) setUsernameOrEmail(savedUser);
  }, []);

  // Filter companies based on user typing
  useEffect(() => {
    const query = empresa.trim().toLowerCase();
    if (!query) {
      setFilteredCompanies(companiesList);
    } else {
      setFilteredCompanies(
        companiesList.filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.id.toLowerCase().includes(query)
        )
      );
    }
  }, [empresa, companiesList]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa, usernameOrEmail, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Algo deu errado durante a autenticação.");
      }

      // Handle "Lembrar-me" (Remember me)
      if (rememberMe) {
        localStorage.setItem("meugestor_remember", "true");
        localStorage.setItem("meugestor_remember_company", empresa);
        localStorage.setItem("meugestor_remember_user", usernameOrEmail);
      } else {
        localStorage.setItem("meugestor_remember", "false");
        localStorage.removeItem("meugestor_remember_company");
        localStorage.removeItem("meugestor_remember_user");
      }

      // Login success
      onLoginSuccess(data.token, data.user, data.company);
    } catch (err: any) {
      setError(err.message || "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/google/url?origin=${encodeURIComponent(window.location.origin)}`);
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || "Erro ao obter URL de autenticação.");
      }
      
      const { url } = data;
      const width = 500;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      const authWindow = window.open(
        url,
        "google_oauth_popup",
        `width=${width},height=${height},top=${top},left=${left}`
      );

      if (!authWindow) {
        throw new Error("O bloqueador de popups impediu a autenticação. Por favor, autorize popups para este site.");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao conectar com o Google.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }

      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const { token, user, company } = event.data;
        onLoginSuccess(token, user, company);
      } else if (event.data?.type === 'GOOGLE_AUTH_FAILURE') {
        setError(event.data.error || "A autenticação com o Google falhou.");
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLoginSuccess]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-emerald-100 selection:text-emerald-900 font-sans relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Back button */}
      <div className="absolute top-6 left-6">
        <button 
          onClick={() => onNavigate("home")}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium group cursor-pointer"
          id="btn-back-home"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Voltar para o início
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
            <Layers className="w-6 h-6 text-white" />
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight" id="login-title">
          Meu Gestor
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-semibold uppercase tracking-wider">
          Plataforma Multiempresa
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/50 sm:px-10 space-y-6 relative z-10"
        >
          {/* Error banner */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-rose-800 text-xs font-medium leading-relaxed"
              id="error-banner"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} id="login-form">
            
            {/* 🏢 Empresa Input with searchable Autocomplete dropdown */}
            <div className="space-y-1.5 relative" ref={dropdownRef}>
              <label htmlFor="empresa" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                🏢 Código da Empresa
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  id="empresa"
                  name="empresa"
                  type="text"
                  required
                  value={empresa}
                  onChange={(e) => {
                    setEmpresa(e.target.value);
                    setShowCompanyDropdown(true);
                  }}
                  onFocus={() => setShowCompanyDropdown(true)}
                  placeholder="Código ou Nome da sua Empresa"
                  className="block w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 transition-all text-slate-900 font-bold"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* Companies list Dropdown overlay */}
              <AnimatePresence>
                {showCompanyDropdown && filteredCompanies.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-slate-100"
                  >
                    <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 flex items-center justify-between">
                      <span>Empresas Registradas ({filteredCompanies.length})</span>
                      <Search className="w-3 h-3 text-slate-400" />
                    </div>
                    {filteredCompanies.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setEmpresa(c.id);
                          setShowCompanyDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between text-sm text-slate-800 font-semibold"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-800 text-xs font-bold">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-900">{c.name}</span>
                            <span className="block text-[10px] text-slate-400 font-normal">Código: {c.id}</span>
                          </div>
                        </div>
                        {empresa.toLowerCase().trim() === c.id.toLowerCase().trim() && (
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 👤 Username or Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="usernameOrEmail" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                👤 Usuário ou E-mail
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  type="text"
                  required
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="ex: mariana.silva"
                  className="block w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 transition-all text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* 🔒 Password input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="senha" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  🔒 Senha
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate("recover")}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  id="btn-forgot-password"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="senha"
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="block w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 transition-all text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  id="btn-toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* ☑ Remember me option */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" 
                  id="check-remember-me"
                />
                <span>Lembrar-me</span>
              </label>
              <span className="font-semibold text-slate-400 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Dados Isolados
              </span>
            </div>

            {/* 🔐 Submit button (Botão Entrar) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm disabled:bg-emerald-400 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
              id="btn-submit-login"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Identificando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-emerald-200" />
                  <span>Entrar com Segurança</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          {googleEnabled && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400 font-bold uppercase">Ou continue com</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {/* Google OAuth Button */}
            {googleEnabled && (
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                type="button"
                className="w-full inline-flex justify-center items-center gap-2.5 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
                id="btn-google-login"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Entrar com Google</span>
              </button>
            )}

            {/* Create Account Button (Botão Criar Conta) */}
            <button
              onClick={() => onNavigate("register")}
              type="button"
              className="w-full inline-flex justify-center items-center py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-600 transition-colors cursor-pointer"
              id="btn-create-account"
            >
              Criar Conta
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigate("superadmin_login")}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors cursor-pointer"
              id="link-superadmin-login"
            >
              Acesso do Super Administrador
            </button>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
