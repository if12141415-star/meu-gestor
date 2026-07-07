/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  TrendingUp, 
  Layers, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Package, 
  CheckCircle, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  Zap, 
  MessageSquare,
  HelpCircle,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

interface HomeViewProps {
  onNavigate: (view: string) => void;
}

export default function HomeView({ onNavigate }: HomeViewProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Features list
  const features = [
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      title: "Análise Financeira Avançada",
      description: "Acompanhe faturamento, margem de lucro e fluxo de caixa de forma visual e intuitiva com gráficos atualizados em tempo real."
    },
    {
      icon: <Package className="w-6 h-6 text-emerald-600" />,
      title: "Controle de Estoque Inteligente",
      description: "Alertas automáticos de estoque mínimo, giro de mercadoria, custo médio e valor total de ativos para evitar desperdícios."
    },
    {
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      title: "CRM & Gestão de Clientes",
      description: "Histórico completo de compras de cada cliente, localização geográfica, ticket médio e canais de relacionamento integrados."
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-emerald-600" />,
      title: "Faturamento & Vendas Simplificado",
      description: "Registre pedidos de vendas, controle orçamentos, acompanhe vendas pendentes e gere relatórios com apenas um clique."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: "Segurança de Nível Bancário",
      description: "Seus dados criptografados em nuvem com backups redundantes, controle rígido de acessos e conformidade com a LGPD."
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-600" />,
      title: "Alta Performance & Escalabilidade",
      description: "Desenvolvido com arquitetura ultrarrápida que garante carregamento instantâneo em qualquer dispositivo móvel ou desktop."
    }
  ];

  // Benefits list
  const benefits = [
    {
      title: "Sua empresa sob total controle",
      subtitle: "Adeus planilhas confusas e sistemas lentos.",
      description: "O Meu Gestor foi desenhado para eliminar a complexidade. Centralize todas as operações comerciais de sua micro, pequena ou média empresa em um painel executivo moderno e visual.",
      highlights: [
        "Acesso de qualquer lugar, a qualquer hora",
        "Interface limpa que dispensa treinamentos caros",
        "Suporte técnico humanizado e em português"
      ]
    }
  ];

  // Plans/Pricing
  const plans = [
    {
      name: "Starter",
      price: "R$ 49",
      period: "/mês",
      description: "Perfeito para profissionais autônomos e MEI iniciando a jornada.",
      features: [
        "Até 100 produtos cadastrados",
        "Gestão financeira simplificada",
        "Cadastro de clientes ilimitado",
        "1 usuário administrador",
        "Suporte via e-mail"
      ],
      cta: "Começar Agora",
      popular: false
    },
    {
      name: "Pro",
      price: "R$ 99",
      period: "/mês",
      description: "O plano ideal para empresas em crescimento constante.",
      features: [
        "Produtos ilimitados",
        "Dashboard financeiro avançado",
        "Análise de lucro e margem",
        "Até 5 usuários simultâneos",
        "Controle de estoque crítico",
        "Suporte prioritário via WhatsApp"
      ],
      cta: "Começar Agora",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Sob Consulta",
      period: "",
      description: "Para operações robustas que necessitam de máxima performance.",
      features: [
        "Tudo do plano Pro",
        "Usuários e filiais ilimitadas",
        "Integração personalizada via API",
        "Gerente de conta dedicado",
        "Backup em nuvem em tempo real",
        "Treinamento exclusivo de equipe"
      ],
      cta: "Falar com Consultor",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate("home")}>
              <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                Meu Gestor
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#recursos" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                Recursos
              </a>
              <a href="#beneficios" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                Benefícios
              </a>
              <a href="#planos" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                Planos
              </a>
              <a href="#contato" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                Contato
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <button 
                onClick={() => onNavigate("login")}
                className="text-sm font-medium text-slate-700 hover:text-emerald-600 px-4 py-2 rounded-lg transition-colors"
              >
                Entrar
              </button>
              <button 
                onClick={() => onNavigate("register")}
                className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all active:scale-[0.98]"
              >
                Criar Conta
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-slate-100 bg-white py-4 px-6 space-y-4 shadow-xl"
          >
            <a 
              href="#recursos" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-700 hover:text-emerald-600 py-1"
            >
              Recursos
            </a>
            <a 
              href="#beneficios" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-700 hover:text-emerald-600 py-1"
            >
              Benefícios
            </a>
            <a 
              href="#planos" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-700 hover:text-emerald-600 py-1"
            >
              Planos
            </a>
            <a 
              href="#contato" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-700 hover:text-emerald-600 py-1"
            >
              Contato
            </a>
            <hr className="border-slate-100" />
            <div className="flex flex-col gap-2 pt-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigate("login"); }}
                className="w-full text-center font-medium text-slate-700 hover:text-emerald-600 py-2 border border-slate-200 rounded-lg"
              >
                Entrar
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onNavigate("register"); }}
                className="w-full text-center font-semibold bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg shadow-md"
              >
                Criar Conta
              </button>
            </div>
          </motion.div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-white pt-16 pb-20 sm:pt-24 sm:pb-28">
        {/* Background ambient lighting */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-emerald-100/50 blur-3xl"></div>
          <div className="absolute bottom-[20%] left-[-15%] w-[500px] h-[500px] rounded-full bg-slate-100 blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            
            {/* Text Hero */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider">
                <Activity className="w-3.5 h-3.5" /> ERP Inteligente para PMEs
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                Gerencie sua empresa com <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">inteligência</span>.
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Controle vendas, estoque, clientes e finanças em um único lugar. Uma plataforma SaaS moderna criada para impulsionar a gestão do seu negócio de forma automatizada e segura.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button 
                  onClick={() => onNavigate("register")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/35 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-base cursor-pointer"
                >
                  Começar Agora <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onNavigate("login")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-base cursor-pointer border border-slate-200/50"
                >
                  Acessar Conta
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-slate-100 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                <div>
                  <span className="block text-2xl font-bold text-slate-900">99.9%</span>
                  <span className="text-xs text-slate-500">Uptime Garantido</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900">+5 mil</span>
                  <span className="text-xs text-slate-500">Empresas Ativas</span>
                </div>
                <div>
                  <span className="block text-2xl font-bold text-slate-900">Zero</span>
                  <span className="text-xs text-slate-500">Taxa de Configuração</span>
                </div>
              </div>

            </div>

            {/* Visual Hero Mockup */}
            <div className="lg:col-span-6 mt-12 lg:mt-0 relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/60 overflow-hidden"
              >
                {/* Browser bar */}
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  <div className="bg-slate-200/60 rounded px-6 py-0.5 text-[10px] text-slate-500 font-mono w-48 text-center truncate">
                    app.meugestor.com/dashboard
                  </div>
                  <div className="w-10"></div>
                </div>

                {/* Simulated App Screen */}
                <div className="p-4 sm:p-6 bg-slate-900 text-white font-mono text-[10px] space-y-4">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                      <span className="text-slate-400 block text-[8px]">FATURAMENTO</span>
                      <span className="text-emerald-400 font-bold text-sm block mt-1">R$ 45.890</span>
                      <span className="text-emerald-500 block text-[7px] mt-1">▲ +14.2% este mês</span>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                      <span className="text-slate-400 block text-[8px]">PRODUTOS EM ESTOQUE</span>
                      <span className="text-slate-200 font-bold text-sm block mt-1">1.432 itens</span>
                      <span className="text-amber-400 block text-[7px] mt-1">● 3 com estoque baixo</span>
                    </div>
                    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                      <span className="text-slate-400 block text-[8px]">CLIENTES ATIVOS</span>
                      <span className="text-indigo-400 font-bold text-sm block mt-1">328 cadastros</span>
                      <span className="text-indigo-500 block text-[7px] mt-1">▲ +24 novos clientes</span>
                    </div>
                  </div>

                  {/* Graph mockup */}
                  <div className="bg-slate-800 p-4 rounded-lg border border-slate-700/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-bold">Desempenho Semanal de Vendas</span>
                      <span className="text-[8px] bg-slate-700 px-2 py-0.5 rounded text-emerald-400 font-bold">META ATINGIDA</span>
                    </div>
                    <div className="h-28 flex items-end justify-between pt-4 gap-2 font-sans">
                      {[40, 55, 45, 60, 85, 75, 95].map((val, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                          <div className="w-full bg-emerald-600/30 hover:bg-emerald-600/50 rounded-t transition-colors relative group" style={{ height: `${val}%` }}>
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-950 text-emerald-400 px-1 py-0.5 rounded text-[8px] hidden group-hover:block font-mono">
                              {val * 100}
                            </div>
                          </div>
                          <span className="text-[8px] text-slate-500">Dia {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* RECURSOS / FEATURES SECTION */}
      <section id="recursos" className="py-20 bg-slate-50 scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold tracking-widest text-emerald-600 uppercase">Recursos Premium</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Tudo o que você precisa para gerenciar sua empresa
            </h3>
            <p className="text-slate-600">
              Desenvolvemos as ferramentas essenciais para sua gestão diária sem a complexidade dos sistemas legados antigos.
            </p>
          </div>

          {/* Grid list */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, index) => (
              <motion.div 
                whileHover={{ y: -4 }}
                key={index}
                className="bg-white p-8 rounded-2xl border border-slate-200/50 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-600/[0.02] transition-all duration-300 flex flex-col"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h4>
                <p className="text-slate-600 text-sm leading-relaxed flex-grow">{feat.description}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* BENEFICIOS / BENEFITS SECTION */}
      <section id="beneficios" className="py-20 bg-white scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {benefits.map((ben, index) => (
            <div key={index} className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
              
              {/* Text benefit */}
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">Seu Negócio Escalável</span>
                <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{ben.title}</h3>
                <h4 className="text-xl text-slate-700 font-medium">{ben.subtitle}</h4>
                <p className="text-slate-600 leading-relaxed text-base">{ben.description}</p>
                
                <ul className="space-y-3 pt-2">
                  {ben.highlights.map((high, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-slate-700 font-medium text-sm">{high}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <button 
                    onClick={() => onNavigate("register")}
                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold transition-colors cursor-pointer"
                  >
                    Começar a gerenciar agora <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual benefit list */}
              <div className="lg:col-span-6 mt-12 lg:mt-0">
                <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100 grid grid-cols-2 gap-4 relative">
                  
                  {/* Floating badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-4 border border-slate-100/60 flex items-center gap-3 z-10 max-w-[200px]">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500 font-medium">Margem Líquida</span>
                      <span className="block text-sm font-bold text-emerald-600">+18% Lucro</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2">
                    <span className="text-3xl font-extrabold text-emerald-600">30m</span>
                    <span className="text-xs font-bold text-slate-800">Economizados/dia</span>
                    <span className="text-[10px] text-slate-400">Em conferência de estoque</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2">
                    <span className="text-3xl font-extrabold text-emerald-600">100%</span>
                    <span className="text-xs font-bold text-slate-800">Criptografado</span>
                    <span className="text-[10px] text-slate-400">Seus dados blindados</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2">
                    <span className="text-3xl font-extrabold text-emerald-600">Zero</span>
                    <span className="text-xs font-bold text-slate-800">Planilhas Perdidas</span>
                    <span className="text-[10px] text-slate-400">Centralização total</span>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2">
                    <span className="text-3xl font-extrabold text-emerald-600">R$ 0</span>
                    <span className="text-xs font-bold text-slate-800">Custo de Servidor</span>
                    <span className="text-[10px] text-slate-400">Acesso via nuvem</span>
                  </div>

                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* PLANOS / PRICING SECTION */}
      <section id="planos" className="py-20 bg-slate-50 scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold tracking-widest text-emerald-600 uppercase">Nossos Planos</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Preços transparentes, sem pegadinhas ou taxas extras
            </h2>
            <p className="text-slate-600">
              Escolha o plano ideal para a sua estrutura atual e mude de categoria a qualquer momento de forma simples.
            </p>
          </div>

          {/* Grid Plans */}
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`bg-white rounded-3xl p-8 border flex flex-col relative h-full transition-all duration-300 hover:shadow-2xl ${
                  plan.popular 
                    ? "border-emerald-500 shadow-xl shadow-emerald-600/[0.04]" 
                    : "border-slate-200/60"
                }`}
              >
                {/* Popular Ribbon */}
                {plan.popular && (
                  <span className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                    Mais Escolhido
                  </span>
                )}

                <div className="space-y-4 mb-8">
                  <h4 className="text-xl font-bold text-slate-900">{plan.name}</h4>
                  <p className="text-slate-500 text-sm">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-1 pt-2">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 text-sm font-medium">{plan.period}</span>
                  </div>
                </div>

                <hr className="border-slate-100 mb-8" />

                {/* Features */}
                <ul className="space-y-4 flex-grow mb-8">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <span className="text-slate-600 text-sm font-medium leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => onNavigate("register")}
                  className={`w-full text-center py-3.5 rounded-xl font-bold transition-all text-sm cursor-pointer ${
                    plan.popular
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/15 hover:shadow-emerald-600/35 active:scale-[0.98]"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-slate-900 active:scale-[0.98]"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CONTATO / CONTACT SECTION */}
      <section id="contato" className="py-20 bg-white scroll-mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
            {/* Ambient circle shadow */}
            <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 rounded-full bg-emerald-700/20 blur-3xl"></div>
            
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center relative z-10">
              
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Fale Conosco</span>
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Pronto para transformar sua gestão empresarial?
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Tem alguma dúvida sobre os recursos, planos ou quer agendar uma demonstração exclusiva com nossos engenheiros de produto? Mande sua mensagem agora!
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400">Atendimento 24/7</span>
                      <span className="text-sm font-medium">suporte@meugestor.com</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="block text-xs text-slate-400">Central de Ajuda</span>
                      <span className="text-sm font-medium">ajuda.meugestor.com</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-7 mt-8 lg:mt-0 bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200">
                <form onSubmit={(e) => { e.preventDefault(); alert("Mensagem recebida com sucesso! Retornaremos o contato em breve."); }} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Seu Nome</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ex: Carlos Silva"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Seu E-mail</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="Ex: carlos@empresa.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Assunto</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: Dúvida sobre plano Pro"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Mensagem</label>
                    <textarea 
                      rows={4}
                      required 
                      placeholder="Como podemos te ajudar hoje?"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/30 cursor-pointer"
                  >
                    Enviar Mensagem
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            
            {/* Col 1 */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Meu Gestor</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Plataforma ERP e SaaS de última geração projetada especificamente para pequenas e médias empresas se destacarem no mercado moderno.
              </p>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <h5 className="text-sm font-bold text-white uppercase tracking-wider">Produto</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#recursos" className="hover:text-emerald-400 transition-colors">Recursos</a></li>
                <li><a href="#planos" className="hover:text-emerald-400 transition-colors">Planos de Preço</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Central de Suporte</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">API de Integração</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <h5 className="text-sm font-bold text-white uppercase tracking-wider">Empresa</h5>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Trabalhe Conosco</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog de Novidades</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Termos de Uso</a></li>
              </ul>
            </div>

          </div>

          <hr className="border-slate-800 mb-8" />

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <span>© 2026 Meu Gestor SaaS Ltda. Todos os direitos reservados. CNPJ 12.345.678/0001-99</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacidade</a>
              <span>•</span>
              <a href="#" className="hover:text-emerald-400 transition-colors">Termos de Serviço</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
