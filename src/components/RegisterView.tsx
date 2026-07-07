/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Layers, ArrowLeft, Building, User, Mail, Phone, Lock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

interface RegisterViewProps {
  onNavigate: (view: string) => void;
  onRegisterSuccess: (token: string, user: any, company: any) => void;
}

export default function RegisterView({ onNavigate, onRegisterSuccess }: RegisterViewProps) {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (senha.length < 6) {
      setError("Senha muito curta.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeEmpresa,
          nomeResponsavel,
          username,
          email,
          telefone,
          senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Houve um erro ao realizar o cadastro.");
      }

      // Auto-login on success
      onRegisterSuccess(data.token, data.user, data.company);
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
      if (!res.ok) throw new Error("Erro ao obter URL de autenticação.");
      const { url } = await res.json();

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
        onRegisterSuccess(token, user, company);
      } else if (event.data?.type === 'GOOGLE_AUTH_FAILURE') {
        setError(event.data.error || "A autenticação com o Google falhou.");
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onRegisterSuccess]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      
      {/* Back button */}
      <div className="absolute top-6 left-6">
        <button 
          onClick={() => onNavigate("home")}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium group"
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
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Crie sua conta profissional
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ou{" "}
          <button 
            onClick={() => onNavigate("login")}
            className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
          >
            faça login em uma conta existente
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200/50 sm:px-10 space-y-6"
        >
          {/* Error Banner */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-rose-800 text-xs font-medium leading-relaxed"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* Nome do Responsável */}
            <div className="space-y-1.2">
              <label htmlFor="nomeResponsavel" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nome
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="nomeResponsavel"
                  type="text"
                  required
                  value={nomeResponsavel}
                  onChange={(e) => setNomeResponsavel(e.target.value)}
                  placeholder="Seu nome completo"
                  className="block w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 transition-all text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Nome da Empresa */}
            <div className="space-y-1.2">
              <label htmlFor="nomeEmpresa" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nome da Empresa
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building className="h-4 w-4" />
                </div>
                <input
                  id="nomeEmpresa"
                  type="text"
                  required
                  value={nomeEmpresa}
                  onChange={(e) => setNomeEmpresa(e.target.value)}
                  placeholder="Nome do seu negócio"
                  className="block w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 transition-all text-slate-900"
                />
              </div>
            </div>

            {/* Usuário (username) */}
            <div className="space-y-1.2">
              <label htmlFor="username" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Usuário
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: joaosilva"
                  className="block w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 transition-all text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.2">
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                E-mail
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@email.com"
                  className="block w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 transition-all text-slate-900"
                />
              </div>
            </div>

            {/* Telefone */}
            <div className="space-y-1.2">
              <label htmlFor="telefone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Telefone
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="telefone"
                  type="text"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="Ex: (11) 99999-8888"
                  className="block w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 transition-all text-slate-900"
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-1.2">
              <label htmlFor="senha" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Senha
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="senha"
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="block w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400 transition-all text-slate-900"
                />
              </div>
            </div>

            {/* Terms of use */}
            <div className="text-[10px] text-slate-500 leading-normal">
              Ao se cadastrar, você concorda com nossos{" "}
              <a href="#" className="font-semibold text-emerald-600 hover:underline">Termos de Uso</a>{" "}
              e{" "}
              <a href="#" className="font-semibold text-emerald-600 hover:underline">Políticas de Privacidade</a>.
            </div>

            {/* Submit button (Criar Conta) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all text-sm disabled:bg-emerald-400 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Cadastrando...</span>
                </>
              ) : (
                "Criar Conta"
              )}
            </button>

          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400 font-bold uppercase">Ou</span>
            </div>
          </div>

          {/* Cadastrar com Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            type="button"
            className="w-full inline-flex justify-center items-center gap-2.5 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Cadastrar com Google</span>
          </button>

        </motion.div>
      </div>

    </div>
  );
}
