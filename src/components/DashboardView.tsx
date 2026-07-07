/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  Legend, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { 
  TrendingUp, 
  Layers, 
  Users, 
  ShoppingBag, 
  ShoppingCart,
  ClipboardList,
  DollarSign, 
  Package, 
  Search, 
  Plus, 
  LogOut, 
  Building, 
  User, 
  AlertTriangle, 
  Activity, 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  Hash, 
  Check, 
  ChevronRight,
  RefreshCw,
  Bell,
  Sliders,
  Calendar,
  Trash,
  Menu,
  X,
  ArrowLeft,
  Download,
  Printer,
  Bot,
  Send,
  CreditCard,
  HelpCircle,
  Lock,
  Unlock,
  Key,
  Settings,
  Edit,
  Eye,
  TrendingDown,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  Sparkles,
  Info,
  Camera,
  Upload,
  Shield,
  Ban,
  CheckCircle,
  Copy,
  Image as ImageIcon,
  PlusCircle,
  MinusCircle,
  ArrowDownRight,
  ClipboardCheck,
  Scan,
  ChevronDown,
  Wrench
} from "lucide-react";
import { DashboardStats, Product, Client, Sale, StockNotification, WhatsappConfig } from "../types.ts";
import CaixaView from "./CaixaView.tsx";
import InventoryView from "./InventoryView.tsx";
import StockCenterView from "./StockCenterView.tsx";
import { Ticker } from "./Ticker.tsx";

interface DashboardViewProps {
  token: string;
  user: any;
  company: any;
  onLogout: () => void;
}

function ValueInputField({ id, label, value, onChange, placeholder = "0.00", required = false }: { id: string; label: string; value: string; onChange: (val: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div className="space-y-1.5" id={`value-field-container-${id}`}>
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-slate-700 uppercase">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-0.5">
            ● Autosalve
          </span>
          {value && (
            <button
              type="button"
              id={`btn-clear-${id}`}
              onClick={() => onChange("")}
              className="text-[10px] font-bold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 transition-colors cursor-pointer"
            >
              Apagar / Limpar
            </button>
          )}
        </div>
      </div>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">R$</span>
        <input 
          type="text"
          required={required}
          id={id}
          value={value}
          onChange={(e) => {
            const raw = e.target.value.replace(",", ".");
            onChange(raw);
          }}
          onFocus={(e) => {
            e.target.select();
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-12 py-2.5 rounded-xl border border-slate-200 text-sm font-bold font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none"
        />
        {value && (
          <button
            type="button"
            id={`btn-clear-icon-${id}`}
            onClick={() => onChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            title="Limpar valor"
          >
            <span className="text-xs font-bold">✕</span>
          </button>
        )}
      </div>
      <p className="text-[10px] text-slate-400 leading-none">
        Clique no campo para editar ou use "Limpar" para remover o valor totalmente.
      </p>
    </div>
  );
}

function SubscriptionPortal({ company, plans, history, overdueDays, token, onLogout, onSuccess }: {
  company: any;
  plans: any[];
  history: any[];
  overdueDays: number;
  token: string;
  onLogout: () => void;
  onSuccess: () => void;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState("plan_pro");
  const [selectedGateway, setSelectedGateway] = useState("stripe");
  const [paying, setPaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"checkout" | "history">("checkout");

  const defaultPlans = [
    { id: "plan_basic", name: "Plano Start", price: 49.90, billingPeriod: "Mensal", maxProducts: 100, maxUsers: 2, features: ["Dashboard Simplificado", "Controle de Estoque", "Suporte por Email"] },
    { id: "plan_pro", name: "Plano Pro", price: 99.90, billingPeriod: "Mensal", maxProducts: 1000, maxUsers: 10, features: ["Dashboard Completo", "Frente de Caixa (PDV)", "Controle de Estoque", "Controle de Equipes", "Gestor IA", "Suporte WhatsApp"] },
    { id: "plan_enterprise", name: "Plano Premium", price: 199.90, billingPeriod: "Mensal", maxProducts: 99999, maxUsers: 99, features: ["Tudo Ilimitado", "IA Avançada", "Suporte Prioritário 24/7", "Personalizações ERP"] }
  ];

  const actualPlans = plans && plans.length > 0 ? plans : defaultPlans;

  const handlePay = async () => {
    setPaying(true);
    try {
      const res = await fetch("/api/company/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ planId: selectedPlanId, gateway: selectedGateway })
      });
      const data = await res.json();
      if (res.ok && data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert(data.error || "Erro ao iniciar checkout.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="subscription-portal-root">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white py-4 px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow">
            <span className="font-extrabold text-white text-base">M</span>
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight">Meu Gestor SaaS</h1>
            <p className="text-[10px] text-slate-400 font-semibold">{company.name}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-3.5 py-1.5 rounded-lg border border-slate-700 hover:border-rose-500 hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Sair da Conta</span>
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-6">
        
        {/* Status Notice Block */}
        {company.status === "suspended" ? (
          <div className="bg-rose-50 border-l-4 border-rose-600 p-5 rounded-2xl shadow-sm text-rose-900 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🚨</span>
              <h2 className="text-base font-extrabold uppercase tracking-wide">Acesso Suspenso por Falta de Pagamento</h2>
            </div>
            <p className="text-sm leading-relaxed">
              Sua assinatura está atrasada há <strong className="font-black underline">{overdueDays} dias</strong>. Todos os dados comerciais de sua empresa permanecem salvos e intactos em nossa nuvem, mas as operações de venda, estoque e relatórios foram bloqueadas por segurança.
            </p>
            <p className="text-xs font-semibold text-rose-700">
              Regularize o pagamento de qualquer plano abaixo para restabelecer seu acesso imediatamente.
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-2xl shadow-sm text-amber-900 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">⏳</span>
              <h2 className="text-base font-extrabold uppercase tracking-wide">Aguardando Pagamento da Assinatura</h2>
            </div>
            <p className="text-sm leading-relaxed">
              Para começar a vender e gerenciar sua empresa com o Meu Gestor, você precisa realizar o pagamento da sua primeira mensalidade. Selecione o plano ideal abaixo e faça a ativação segura.
            </p>
          </div>
        )}

        {/* Tab Controls for Checkout and History */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("checkout")}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "checkout" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            💳 Pagamento e Planos
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "history" ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            📋 Histórico de Cobranças
          </button>
        </div>

        {activeTab === "checkout" ? (
          <div className="space-y-6">
            {/* Plans List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Escolha o seu Plano de Assinatura</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actualPlans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative bg-white ${
                        isSelected 
                          ? "border-emerald-600 ring-4 ring-emerald-600/10 shadow-lg" 
                          : "border-slate-200 hover:border-slate-300 shadow-sm"
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white rounded-full px-2 py-0.5 leading-none text-[10px] font-bold">
                          ✓ Selecionado
                        </div>
                      )}
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-slate-900 text-base">{p.name}</h4>
                        <div className="flex items-baseline gap-1">
                          <span className="text-slate-400 text-xs font-bold">R$</span>
                          <span className="text-slate-900 text-2xl font-black">{p.price.toFixed(2).replace(".", ",")}</span>
                          <span className="text-slate-400 text-xs font-semibold">/{p.billingPeriod || "Mês"}</span>
                        </div>
                        <div className="border-t border-slate-100 my-3 pt-2 text-[11px] text-slate-500 space-y-1">
                          <p>📦 Limite de <strong className="text-slate-700">{p.maxProducts}</strong> produtos</p>
                          <p>👥 Limite de <strong className="text-slate-700">{p.maxUsers}</strong> usuários</p>
                        </div>
                        <ul className="space-y-1.5 pt-1">
                          {(p.features || []).map((feat: string, idx: number) => (
                            <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <span className="text-emerald-500 font-bold">✓</span>
                              <span className="truncate">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gateway Selection */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Forma de Pagamento / Gateway Seguro</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "stripe", name: "Stripe", desc: "Cartão de Crédito e Boleto", logo: "💳" },
                  { id: "mercadopago", name: "Mercado Pago", desc: "Pix e Cartões", logo: "⚡" },
                  { id: "asaas", name: "Asaas", desc: "Boleto e Pix Automático", logo: "💼" }
                ].map((gt) => {
                  const isSelected = selectedGateway === gt.id;
                  return (
                    <div
                      key={gt.id}
                      onClick={() => setSelectedGateway(gt.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer bg-white flex items-center gap-3 ${
                        isSelected 
                          ? "border-emerald-600 bg-emerald-50/20" 
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-2xl">{gt.logo}</div>
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">{gt.name}</h4>
                        <p className="text-[10px] text-slate-500 font-semibold">{gt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit checkout */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Resumo da Ativação</p>
                <p className="text-sm font-bold text-slate-800">
                  Plano selecionado: <span className="text-emerald-700">{actualPlans.find(p => p.id === selectedPlanId)?.name || "Nenhum"}</span>
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  Ambiente de Checkout REAL e Protegido.
                </p>
              </div>

              <button
                onClick={handlePay}
                disabled={paying || !selectedPlanId}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-extrabold text-sm shadow-md transition-all cursor-pointer"
              >
                {paying ? (
                  <>
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Conectando com o Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Pagamento Seguro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Billing History */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-800">Histórico de Pagamento</h3>
              <p className="text-xs text-slate-400 font-semibold">Consulte suas faturas pagas e pendentes.</p>
            </div>
            {history.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm font-bold">Nenhum registro de faturamento localizado para esta conta.</p>
                <p className="text-xs text-slate-400 mt-1">Seus pagamentos confirmados serão listados aqui.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                      <th className="p-4">Identificador</th>
                      <th className="p-4">Data</th>
                      <th className="p-4">Plano</th>
                      <th className="p-4">Gateway</th>
                      <th className="p-4 text-right">Valor</th>
                      <th className="p-4 text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-mono text-xs font-bold text-slate-500">{h.id}</td>
                        <td className="p-4 text-slate-600">{new Date(h.date).toLocaleDateString("pt-BR")}</td>
                        <td className="p-4 font-bold text-slate-800">{h.planName || "Assinatura"}</td>
                        <td className="p-4 text-slate-500 font-semibold uppercase text-xs">{h.gateway || "Stripe"}</td>
                        <td className="p-4 text-right font-mono font-bold text-slate-900">R$ {h.amount.toFixed(2).replace(".", ",")}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 border border-emerald-100 text-emerald-700">
                            PAGO
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardView({ token, user, company, onLogout }: DashboardViewProps) {
  // Tab states: including superadmin views
  const [activeTab, setActiveTab] = useState<
    "overview" | "caixa" | "products" | "inventory" | "clients" | "sales" | "finance" | "reports" | "ai_assistant" | "settings" | "profile" | "plans" | "support" | "employees" | "users_permissions" | "stock_center" |
    "superadmin_dash" | "superadmin_plans" | "superadmin_companies" | "superadmin_company_admins" | "superadmin_payments" | "superadmin_system" | "superadmin_users" | "superadmin_support" | "superadmin_access_requests" | "superadmin_logs" | "superadmin_modules"
  >(() => {
    let initialTab: any = "overview";
    if (user) {
      if (user.role === "superadmin") initialTab = "superadmin_dash";
      else if (user.role === "admin") initialTab = "overview";
      else {
        const roleId = user.roleId || "";
        if (roleId.includes("estoque") || roleId.includes("estoquista") || user.permissions?.includes("manage_stock")) {
          initialTab = "stock_center";
        } else if (roleId.includes("operador")) {
          initialTab = "caixa";
        } else if (roleId.includes("compras")) {
          initialTab = "inventory";
        } else if (roleId.includes("financeiro")) {
          initialTab = "finance";
        } else if (roleId.includes("gerente")) {
          initialTab = "overview";
        } else {
          const canViewStats = user.permissions?.includes("view_stats") || false;
          const canCreateSales = user.permissions?.includes("create_sales") || false;
          if (!canViewStats && canCreateSales) {
            initialTab = "caixa";
          }
        }
      }
    }
    
    if (company?.usePdv === false && (initialTab === "caixa" || initialTab === "sales")) {
      return "products";
    }
    return initialTab;
  });
  
  // Superadmin states
  const isSuperAdmin = user?.role === "superadmin";
  const isOnlyCashier = !isSuperAdmin && user?.role !== "admin" && !(user?.permissions?.includes("view_stats") || false) && (user?.permissions?.includes("create_sales") || false);
  const isOnlyStockOperator = !isSuperAdmin && user?.role !== "admin" && (
    user?.roleId?.includes("estoque") ||
    user?.roleId?.includes("estoquista") ||
    (user?.permissions?.includes("manage_stock") && !(user?.permissions?.includes("view_stats") || user?.permissions?.includes("create_sales")))
  );
  const [stockSubTab, setStockSubTab] = useState("recebimento");
  const [saasSystem, setSaasSystem] = useState<any>({ version: "v2.5.0", status: "OPERACIONAL" });
  const [saasPlansList, setSaasPlansList] = useState<any[]>([]);
  const [saasCompanies, setSaasCompanies] = useState<any[]>([]);
  const [saasCompanySearch, setSaasCompanySearch] = useState("");
  const [editingSaasCompany, setEditingSaasCompany] = useState<any | null>(null);
  const [deletingSaasCompany, setDeletingSaasCompany] = useState<any | null>(null);
  const [isConfirmingDeleteSaas, setIsConfirmingDeleteSaas] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [saasPaymentsList, setSaasPaymentsList] = useState<any[]>([]);
  const [saasUsers, setSaasUsers] = useState<any[]>([]);
  const [saasSupportTickets, setSaasSupportTickets] = useState<any[]>([]);
  const [saasAccessRequests, setSaasAccessRequests] = useState<any[]>([]);
  const [saasAuditLogs, setSaasAuditLogs] = useState<any[]>([]);
  const [saasBroadcasts, setSaasBroadcasts] = useState<any[]>([]);
  const [newBroadcastMsg, setNewBroadcastMsg] = useState("");
  const [saasLoading, setSaasLoading] = useState(false);
  const [searchingBarcode, setSearchingBarcode] = useState(false);
  const [companySub, setCompanySub] = useState<any>(null);

  // New plan form state
  const [newSaaSPlan, setNewSaaSPlan] = useState({
    id: "",
    name: "",
    price: "",
    period: "mensal",
    limitProducts: "100",
    limitUsers: "5",
    limitStorage: "10",
    status: "active",
    description: "",
    features: ""
  });

  // Superadmin manual company management states
  const [selectedCompanyForEdit, setSelectedCompanyForEdit] = useState<any>(null);
  const [selectedCompanyForView, setSelectedCompanyForView] = useState<any>(null);

  const isModuleActive = (moduleKey: string): boolean => {
    if (!company) return true;
    if (!company.modules) {
      if (moduleKey === "use_pdv" || moduleKey === "usePdv") {
        return company.usePdv !== false;
      }
      return true;
    }
    const val = company.modules[moduleKey];
    if (val === undefined) {
      if (moduleKey === "use_pdv" || moduleKey === "usePdv") {
        return company.usePdv !== false;
      }
      return true;
    }
    return val === "active" || val === true;
  };

  useEffect(() => {
    if (user?.role !== "superadmin" && activeTab && activeTab !== "overview" && activeTab !== "profile" && activeTab !== "settings") {
      let allowed = true;
      if ((activeTab === "caixa" || activeTab === "sales") && !isModuleActive("use_pdv")) allowed = false;
      if (activeTab === "products" && !isModuleActive("products")) allowed = false;
      if ((activeTab === "stock_center" || activeTab === "inventory") && !isModuleActive("stock")) allowed = false;
      if (activeTab === "clients" && !isModuleActive("clients")) allowed = false;
      if (activeTab === "finance" && !isModuleActive("finance")) allowed = false;
      if (activeTab === "reports" && !isModuleActive("reports")) allowed = false;
      if (activeTab === "ai_assistant" && !isModuleActive("ai_assistant")) allowed = false;
      if ((activeTab === "employees" || activeTab === "users_permissions") && !isModuleActive("multi_users")) allowed = false;
      
      if (!allowed) {
        setActiveTab("overview");
      }
    }
  }, [activeTab, company, user]);
  const [isCompanyEditModalOpen, setIsCompanyEditModalOpen] = useState(false);
  const [isCompanyViewModalOpen, setIsCompanyViewModalOpen] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState("");

  // States for modules configuration screen
  const [selectedModuleCompanyId, setSelectedModuleCompanyId] = useState<string>("");
  const [modulesMap, setModulesMap] = useState<Record<string, boolean>>({
    products: true,
    stock: true,
    compras: true,
    fornecedores: true,
    clients: true,
    finance: true,
    reports: true,
    ai_assistant: true,
    whatsapp: true,
    barcode: true,
    lot_control: true,
    location_control: true,
    multi_users: true,
    compras_approval: true,
    use_pdv: true,
  });

  useEffect(() => {
    if (saasCompanies.length > 0) {
      const oliveira = saasCompanies.find(c => c.id === "cmp_mercado_oliveira" || c.name.toLowerCase().includes("mercado oliveira"));
      if (oliveira && !selectedModuleCompanyId) {
        setSelectedModuleCompanyId(oliveira.id);
      } else if (!selectedModuleCompanyId) {
        setSelectedModuleCompanyId(saasCompanies[0].id);
      }
    }
  }, [saasCompanies]);

  useEffect(() => {
    if (selectedModuleCompanyId && saasCompanies.length > 0) {
      const comp = saasCompanies.find(c => c.id === selectedModuleCompanyId);
      if (comp) {
        const mods = comp.modules || {};
        const defaultToTrue = comp.id === "cmp_mercado_oliveira" || comp.name.toLowerCase().includes("mercado oliveira");
        
        setModulesMap({
          products: mods.products !== undefined ? (mods.products === "active" || mods.products === true) : defaultToTrue,
          stock: mods.stock !== undefined ? (mods.stock === "active" || mods.stock === true) : defaultToTrue,
          compras: mods.compras !== undefined ? (mods.compras === "active" || mods.compras === true) : defaultToTrue,
          fornecedores: mods.fornecedores !== undefined ? (mods.fornecedores === "active" || mods.fornecedores === true) : defaultToTrue,
          clients: mods.clients !== undefined ? (mods.clients === "active" || mods.clients === true) : defaultToTrue,
          finance: mods.finance !== undefined ? (mods.finance === "active" || mods.finance === true) : defaultToTrue,
          reports: mods.reports !== undefined ? (mods.reports === "active" || mods.reports === true) : defaultToTrue,
          ai_assistant: mods.ai_assistant !== undefined ? (mods.ai_assistant === "active" || mods.ai_assistant === true) : defaultToTrue,
          whatsapp: mods.whatsapp !== undefined ? (mods.whatsapp === "active" || mods.whatsapp === true) : defaultToTrue,
          barcode: mods.barcode !== undefined ? (mods.barcode === "active" || mods.barcode === true) : defaultToTrue,
          lot_control: mods.lot_control !== undefined ? (mods.lot_control === "active" || mods.lot_control === true) : defaultToTrue,
          location_control: mods.location_control !== undefined ? (mods.location_control === "active" || mods.location_control === true) : defaultToTrue,
          multi_users: mods.multi_users !== undefined ? (mods.multi_users === "active" || mods.multi_users === true) : defaultToTrue,
          compras_approval: mods.compras_approval !== undefined ? (mods.compras_approval === "active" || mods.compras_approval === true) : defaultToTrue,
          use_pdv: mods.use_pdv !== undefined ? (mods.use_pdv === "active" || mods.use_pdv === true) : (comp.usePdv !== false || defaultToTrue),
        });
      }
    }
  }, [selectedModuleCompanyId, saasCompanies]);

  const handleSaveCompanyModules = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModuleCompanyId) return;
    
    const modulesToSave: Record<string, string> = {};
    Object.entries(modulesMap).forEach(([key, val]) => {
      modulesToSave[key] = val ? "active" : "inactive";
    });

    try {
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      };
      
      const res = await fetch(`/api/superadmin/companies/${selectedModuleCompanyId}/modules`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ modules: modulesToSave })
      });

      if (res.ok) {
        showToast("Configuração de módulos salva com sucesso!", "success");
        fetchSuperAdminData();
      } else {
        const errData = await res.json();
        showToast(`Erro ao salvar: ${errData.error || "Erro desconhecido"}`, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro ao conectar com o servidor.", "error");
    }
  };

  // Support access authorization states
  const [activeSupportAuth, setActiveSupportAuth] = useState<any>(null);
  const [supportReason, setSupportReason] = useState("");
  const [isSubmittingSupportAuth, setIsSubmittingSupportAuth] = useState(false);
  const [supportAuthorizationsList, setSupportAuthorizationsList] = useState<any[]>([]);

  const getStatusLabel = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "active" || s === "ativo") {
      return { label: "🟢 Ativa", color: "bg-emerald-50 text-emerald-700 border-emerald-100" };
    }
    if (s === "trial" || s === "em_teste") {
      return { label: "🟡 Em Teste", color: "bg-amber-50 text-amber-700 border-amber-100" };
    }
    if (s === "pending_payment" || s === "aguardando_liberacao" || s === "pending_release" || s === "pending") {
      return { label: "🟠 Aguardando Liberação", color: "bg-orange-50 text-orange-700 border-orange-100" };
    }
    if (s === "suspended" || s === "suspenso") {
      return { label: "🔴 Suspensa", color: "bg-rose-50 text-rose-700 border-rose-100" };
    }
    if (s === "blocked" || s === "bloqueado") {
      return { label: "⚫ Bloqueada", color: "bg-slate-100 text-slate-700 border-slate-200" };
    }
    return { label: status || "N/A", color: "bg-slate-50 text-slate-600 border-slate-100" };
  };

  const fetchSupportStatus = async () => {
    if (isSuperAdmin) return;
    try {
      const res = await fetch("/api/support/status", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSupportAuth(data.authorization);
      }
    } catch (err) {
      console.error("Error fetching support status:", err);
    }
  };

  const handleAuthorizeSupport = async () => {
    if (!supportReason.trim()) {
      showToast("Por favor, descreva o motivo do suporte.", "error");
      return;
    }
    setIsSubmittingSupportAuth(true);
    try {
      const res = await fetch("/api/support/authorize", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ reason: supportReason })
      });
      if (res.ok) {
        const data = await res.json();
        setActiveSupportAuth(data.authorization);
        setSupportReason("");
        showToast("Acesso de suporte técnico autorizado com sucesso!");
      } else {
        const err = await res.json();
        showToast(err.error || "Erro ao autorizar suporte.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro de rede ao autorizar suporte.", "error");
    } finally {
      setIsSubmittingSupportAuth(false);
    }
  };

  const handleRevokeSupport = async () => {
    try {
      const res = await fetch("/api/support/revoke", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        setActiveSupportAuth(null);
        showToast("Autorização de suporte técnico revogada.");
      } else {
        const err = await res.json();
        showToast(err.error || "Erro ao revogar suporte.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro de rede ao revogar suporte.", "error");
    }
  };

  const handleStartSupportImpersonation = async (companyId: string) => {
    try {
      const res = await fetch(`/api/superadmin/impersonate/${companyId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Save current superadmin session to restore later
        localStorage.setItem("superadmin_token", token);
        localStorage.setItem("superadmin_user", JSON.stringify(user));
        // Use impersonation token as primary
        localStorage.setItem("meugestor_token", data.token);
        showToast("Sessão de suporte seguro iniciada! Carregando...");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const err = await res.json();
        showToast(err.error || "Não autorizado ou erro ao acessar.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro de rede ao iniciar suporte.", "error");
    }
  };

  const handleTerminateSupportImpersonation = async () => {
    try {
      await fetch("/api/superadmin/impersonate/terminate", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Error terminating on server:", err);
    }
    const saToken = localStorage.getItem("superadmin_token");
    if (saToken) {
      localStorage.setItem("meugestor_token", saToken);
    }
    localStorage.removeItem("superadmin_token");
    localStorage.removeItem("superadmin_user");
    showToast("Sessão de suporte finalizada. Retornando ao Painel SaaS...");
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const fetchSuperAdminData = async () => {
    if (!isSuperAdmin) return;
    setSaasLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const [sysRes, plansRes, compRes, payRes, usersRes, supportRes, accessRes, logsRes, authsRes, broadcastsRes] = await Promise.all([
        fetch("/api/superadmin/system", { headers }),
        fetch("/api/superadmin/plans", { headers }),
        fetch("/api/superadmin/companies", { headers }),
        fetch("/api/superadmin/payments", { headers }),
        fetch("/api/superadmin/users", { headers }),
        fetch("/api/superadmin/support", { headers }),
        fetch("/api/superadmin/access-requests", { headers }),
        fetch("/api/superadmin/logs", { headers }),
        fetch("/api/superadmin/support-authorizations", { headers }).catch(() => null),
        fetch("/api/superadmin/broadcasts", { headers }).catch(() => null)
      ]);
 
      if (sysRes.ok) setSaasSystem(await sysRes.json());
      if (plansRes.ok) setSaasPlansList(await plansRes.json());
      if (compRes.ok) setSaasCompanies(await compRes.json());
      if (payRes.ok) setSaasPaymentsList(await payRes.json());
      if (usersRes.ok) setSaasUsers(await usersRes.json());
      if (supportRes.ok) setSaasSupportTickets(await supportRes.json());
      if (accessRes.ok) setSaasAccessRequests(await accessRes.json());
      if (logsRes.ok) setSaasAuditLogs(await logsRes.json());
      if (authsRes && authsRes.ok) setSupportAuthorizationsList(await authsRes.json());
      if (broadcastsRes && broadcastsRes.ok) setSaasBroadcasts(await broadcastsRes.json());
    } catch (err) {
      console.error("Error fetching superadmin data:", err);
    } finally {
      setSaasLoading(false);
    }
  };

  const handleCreateBroadcast = async (message: string) => {
    if (!message.trim()) return;
    try {
      const response = await fetch("/api/superadmin/broadcasts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error("Erro ao criar comunicado.");
      showToast("Novo comunicado global publicado com sucesso!", "success");
      setNewBroadcastMsg("");
      
      const headers = { "Authorization": `Bearer ${token}` };
      const res = await fetch("/api/superadmin/broadcasts", { headers });
      if (res.ok) setSaasBroadcasts(await res.json());
    } catch (err: any) {
      showToast(err.message || "Erro ao publicar comunicado", "error");
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    try {
      const response = await fetch(`/api/superadmin/broadcasts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error("Erro ao deletar comunicado.");
      showToast("Comunicado removido com sucesso!", "success");
      
      const headers = { "Authorization": `Bearer ${token}` };
      const res = await fetch("/api/superadmin/broadcasts", { headers });
      if (res.ok) setSaasBroadcasts(await res.json());
    } catch (err: any) {
      showToast(err.message || "Erro ao remover comunicado", "error");
    }
  };

  const handleSuperAdminToggleUser = async (userId: string) => {
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const res = await fetch(`/api/superadmin/users/${userId}/toggle`, {
        method: "POST",
        headers
      });
      if (res.ok) {
        showToast("Status do usuário alterado!", "success");
        fetchSuperAdminData();
      } else {
        showToast("Erro ao alterar status do usuário.", "error");
      }
    } catch (err) {
      showToast("Erro ao conectar com o servidor.", "error");
    }
  };

  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const handleReplyTicket = async (ticketId: string) => {
    const text = replyTextMap[ticketId];
    if (!text || !text.trim()) {
      showToast("Insira o texto da resposta.", "error");
      return;
    }
    try {
      const headers = { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      };
      const res = await fetch(`/api/superadmin/support/${ticketId}/reply`, {
        method: "POST",
        headers,
        body: JSON.stringify({ replyText: text })
      });
      if (res.ok) {
        showToast("Resposta enviada com sucesso!", "success");
        setReplyTextMap(prev => ({ ...prev, [ticketId]: "" }));
        fetchSuperAdminData();
      } else {
        showToast("Erro ao enviar resposta.", "error");
      }
    } catch (err) {
      showToast("Erro ao conectar com o servidor.", "error");
    }
  };

  const handleApproveAccessRequest = async (requestId: string) => {
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const res = await fetch(`/api/superadmin/access-requests/${requestId}/approve`, {
        method: "POST",
        headers
      });
      if (res.ok) {
        showToast("Solicitação de acesso aprovada com sucesso!", "success");
        fetchSuperAdminData();
      } else {
        showToast("Erro ao aprovar solicitação.", "error");
      }
    } catch (err) {
      showToast("Erro ao conectar com o servidor.", "error");
    }
  };

  const handleBarcodeLookup = async (code: string) => {
    if (!code) {
      showToast("Insira um código de barras para pesquisar.", "error");
      return;
    }
    setSearchingBarcode(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const res = await fetch(`/api/products/barcode/${code}`, { headers });
      const data = await res.json();
      if (res.ok && data.found) {
        showToast(`🟢 Produto "${data.product.name}" localizado na base pública!`, "success");
        const finalName = data.product.brand ? `${data.product.name} - ${data.product.brand}` : data.product.name;
        
        setNewProduct(prev => ({
          ...prev,
          name: finalName,
          category: data.product.category || "Geral",
          image: data.product.image || ""
        }));
        
        setSuggestedImage(data.product.image || "");
        setShowImagePrompt(true);
      } else {
        showToast("🟡 Código não encontrado na base de dados pública. Preencha os dados manualmente.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro ao conectar ao serviço de código de barras.", "error");
    } finally {
      setSearchingBarcode(false);
    }
  };

  const handleCreateSaaSPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      const isEditing = !!newSaaSPlan.id;
      const res = await fetch("/api/superadmin/plans", {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: newSaaSPlan.id || undefined,
          name: newSaaSPlan.name,
          price: newSaaSPlan.price === "" ? 0 : parseFloat(newSaaSPlan.price),
          period: newSaaSPlan.period,
          limitProducts: parseInt(newSaaSPlan.limitProducts) || 100,
          limitUsers: parseInt(newSaaSPlan.limitUsers) || 5,
          limitStorage: parseInt(newSaaSPlan.limitStorage) || 10,
          description: newSaaSPlan.description,
          features: newSaaSPlan.features,
          status: newSaaSPlan.status
        })
      });
      if (res.ok) {
        showToast(isEditing ? "Plano SaaS atualizado com sucesso!" : "Plano SaaS cadastrado com sucesso!");
        setNewSaaSPlan({ id: "", name: "", price: "", period: "mensal", limitProducts: "100", limitUsers: "5", limitStorage: "10", status: "active", description: "", features: "" });
        fetchSuperAdminData();
      } else {
        const d = await res.json();
        showToast(d.error || "Erro ao salvar plano", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro ao processar requisição.", "error");
    }
  };

  const handleToggleSaaSPlanStatus = async (planId: string) => {
    try {
      const headers = { 
        "Authorization": `Bearer ${token}`
      };
      const res = await fetch(`/api/superadmin/plans/${planId}/toggle`, {
        method: "POST",
        headers
      });
      if (res.ok) {
        showToast("Status do plano atualizado!");
        fetchSuperAdminData();
      } else {
        const d = await res.json();
        showToast(d.error || "Erro ao alternar status do plano", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicateSaaSPlan = async (planId: string) => {
    try {
      const headers = { 
        "Authorization": `Bearer ${token}`
      };
      const res = await fetch(`/api/superadmin/plans/${planId}/duplicate`, {
        method: "POST",
        headers
      });
      if (res.ok) {
        showToast("Plano duplicado com sucesso!");
        fetchSuperAdminData();
      } else {
        const d = await res.json();
        showToast(d.error || "Erro ao duplicar plano", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSaaSPlan = (planId: string, companyCount: number) => {
    if (companyCount > 0) {
      triggerConfirm(
        "Este plano está vinculado a empresas cadastradas. Para preservar a integridade dos dados, primeiro altere essas empresas para outro plano ou desative este plano.",
        () => {}
      );
      return;
    }

    triggerConfirm("Deseja realmente excluir este plano?", async () => {
      try {
        const headers = { 
          "Authorization": `Bearer ${token}`
        };
        const res = await fetch(`/api/superadmin/plans/${planId}`, {
          method: "DELETE",
          headers
        });
        if (res.ok) {
          showToast("Plano SaaS excluído permanentemente!");
          fetchSuperAdminData();
        } else {
          const d = await res.json();
          showToast(d.error || "Erro ao excluir plano", "error");
        }
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleToggleCompanyStatus = async (compId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "ativo" ? "suspenso" : "ativo";
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      const res = await fetch(`/api/superadmin/companies/${compId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`Empresa atualizada para status: ${nextStatus.toUpperCase()}`);
        fetchSuperAdminData();
      } else {
        showToast("Erro ao alterar status da empresa", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLiberarCompany = async (compId: string) => {
    try {
      const headers = { 
        "Authorization": `Bearer ${token}`
      };
      const res = await fetch(`/api/superadmin/companies/${compId}/liberar`, {
        method: "POST",
        headers
      });
      if (res.ok) {
        showToast("Empresa liberada manualmente com sucesso!");
        fetchSuperAdminData();
      } else {
        const d = await res.json();
        showToast(d.error || "Erro ao liberar empresa", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro de conexão.", "error");
    }
  };

  const handleSuspenderCompany = async (compId: string) => {
    try {
      const headers = { 
        "Authorization": `Bearer ${token}`
      };
      const res = await fetch(`/api/superadmin/companies/${compId}/suspender`, {
        method: "POST",
        headers
      });
      if (res.ok) {
        showToast("Empresa suspensa com sucesso!");
        fetchSuperAdminData();
      } else {
        const d = await res.json();
        showToast(d.error || "Erro ao suspender empresa", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro de conexão.", "error");
    }
  };

  const handleReativarCompany = async (compId: string) => {
    try {
      const headers = { 
        "Authorization": `Bearer ${token}`
      };
      const res = await fetch(`/api/superadmin/companies/${compId}/reativar`, {
        method: "POST",
        headers
      });
      if (res.ok) {
        showToast("Empresa reativada com sucesso!");
        fetchSuperAdminData();
      } else {
        const d = await res.json();
        showToast(d.error || "Erro ao reativar empresa", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro de conexão.", "error");
    }
  };

  const handleDeleteCompany = (compId: string, compName: string) => {
    triggerConfirm(`Tem certeza de que deseja EXCLUIR DEFINITIVAMENTE a empresa "${compName}"? Todos os seus dados, usuários, produtos e vendas serão apagados para sempre!`, async () => {
      try {
        const headers = { 
          "Authorization": `Bearer ${token}`
        };
        const res = await fetch(`/api/superadmin/companies/${compId}`, {
          method: "DELETE",
          headers
        });
        if (res.ok) {
          showToast("Empresa excluída com sucesso!");
          fetchSuperAdminData();
        } else {
          const d = await res.json();
          showToast(d.error || "Erro ao excluir empresa", "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Erro de conexão.", "error");
      }
    });
  };

  const handleSaveCompanyEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyForEdit) return;
    try {
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      const res = await fetch(`/api/superadmin/companies/${selectedCompanyForEdit.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          name: selectedCompanyForEdit.name,
          email: selectedCompanyForEdit.email,
          responsibleName: selectedCompanyForEdit.responsibleName,
          phone: selectedCompanyForEdit.phone,
          planId: selectedCompanyForEdit.planId,
          status: selectedCompanyForEdit.status,
          usePdv: selectedCompanyForEdit.usePdv,
          username: selectedCompanyForEdit.username,
          password: selectedCompanyForEdit.password
        })
      });
      if (res.ok) {
        showToast("Empresa editada com sucesso!");
        setIsCompanyEditModalOpen(false);
        fetchSuperAdminData();
      } else {
        const d = await res.json();
        showToast(d.error || "Erro ao editar empresa", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Erro de conexão.", "error");
    }
  };

  const handleCyclePaymentStatus = async (payId: string, currentStatus: string) => {
    try {
      let nextStatus = "Pago";
      if (currentStatus === "Pago") nextStatus = "Pendente";
      else if (currentStatus === "Pendente") nextStatus = "Atrasado";
      
      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };
      const res = await fetch(`/api/superadmin/payments/${payId}/status`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showToast(`Faturamento ID ${payId} atualizado para ${nextStatus.toUpperCase()}`);
        fetchSuperAdminData();
      } else {
        showToast("Erro ao alterar status de fatura", "error");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateSystemUpdate = async () => {
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const res = await fetch("/api/superadmin/update-system", {
        method: "POST",
        headers
      });
      if (res.ok) {
        const d = await res.json();
        setSaasSystem(d);
        showToast(`Plataforma atualizada com sucesso para ${d.version}!`);
        fetchSuperAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSuperAdminData();
      setActiveTab("superadmin_dash");
    } else {
      fetchSupportStatus();
    }
  }, [isSuperAdmin]);
  
  // Sidebar collapsible / mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Subviews (for inline editing and creation instead of simple modals)
  const [productSubView, setProductSubView] = useState<"list" | "new" | "edit">("list");
  const [clientSubView, setClientSubView] = useState<"list" | "new" | "edit">("list");
  const [saleSubView, setSaleSubView] = useState<"list" | "new" | "view">("list");
  const [financeSubView, setFinanceSubView] = useState<"list" | "new">("list");

  // Record references for editing/viewing
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  // Sorting & Pagination states
  const [sortField, setSortField] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Custom Toasts state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" }[]>([]);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Custom Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const triggerConfirm = (message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, message, onConfirm });
  };

  // Finance Transactions State (persisted to LocalStorage for full, continuous ledger)
  const [transactions, setTransactions] = useState<any[]>(() => {
    const stored = localStorage.getItem(`meugestor_txs_${company?.id || 'production'}`);
    if (stored) return JSON.parse(stored);
    return [];
  });

  useEffect(() => {
    localStorage.setItem(`meugestor_txs_${company?.id || 'production'}`, JSON.stringify(transactions));
  }, [transactions, company]);

  const [newTransaction, setNewTransaction] = useState({
    description: "",
    type: "income" as "income" | "expense",
    category: "Vendas",
    amount: "",
    status: "paid" as "paid" | "pending"
  });

  // Settings State
  const [companySettings, setCompanySettings] = useState({
    name: company?.name || "Meu Gestor Corp",
    responsibleName: user?.name || "Administrador",
    email: company?.email || "contato@meugestor.com",
    phone: company?.phone || "(11) 98888-7777",
    cnpj: "12.345.678/0001-99",
    currency: "BRL",
    timezone: "America/Sao_Paulo",
    allowNegativeStock: false,
    tickerConfig: {
      showDateTime: true,
      showSystemMessages: true,
      showLowStock: true,
      showExpiringProducts: true,
      showAccountsDue: true,
      showSuperAdminAnnouncements: true,
      showMarketNews: true,
      showEconomicIndicators: true,
      tickerSpeed: "normal" as "slow" | "normal" | "fast",
      tickerTheme: "dark" as "dark" | "light" | "emerald"
    }
  });

  // Profile State
  const [userProfile, setUserProfile] = useState({
    name: user?.name || "Administrador",
    email: user?.email || "admin@meugestor.com",
    phone: user?.phone || "(11) 98888-7777",
    currentPassword: "",
    newPassword: ""
  });

  // Support Tickets State
  const [supportTicket, setSupportTicket] = useState({
    subject: "",
    category: "finance",
    priority: "medium",
    message: ""
  });
  const [supportTicketsList, setSupportTicketsList] = useState<any[]>(() => {
    return [];
  });

  // AI Chat State
  const [aiMessage, setAiMessage] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<{ role: "user" | "model"; content: string }[]>([
    { role: "model", content: "Olá! Sou o **Gestor IA**, seu assistente estratégico. Tenho acesso em tempo real ao faturamento, nível de estoque, cadastros de clientes e fluxo de vendas da sua empresa. Como posso te auxiliar a impulsionar seus negócios hoje?" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [productsLowStock, setProductsLowStock] = useState<Product[]>([]);
  
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);
  
  // RBAC states
  const [permissions, setPermissions] = useState<any[]>([]);
  const [customRoles, setCustomRoles] = useState<any[]>([]);
  const [teamUsers, setTeamUsers] = useState<any[]>([]);
  
  // RBAC modal / interaction states
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [teamUserModalOpen, setTeamUserModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [editingTeamUser, setEditingTeamUser] = useState<any | null>(null);

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  });

  const [newTeamUser, setNewTeamUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user" as "admin" | "user",
    roleId: "",
    password: "",
    confirmPassword: "",
    username: "",
    cargo: "",
    status: "active" as "active" | "inactive",
    photo: "",
    cpf: "",
    admissaoDate: new Date().toISOString().split("T")[0],
    observacoes: "",
    hasAccess: false,
    setor: ""
  });

  // State variables for managing user system access (Module 2)
  const [userAccessModalOpen, setUserAccessModalOpen] = useState(false);
  const [editingUserAccess, setEditingUserAccess] = useState<any | null>(null);
  const [selectedAccessEmployeeId, setSelectedAccessEmployeeId] = useState("");
  const [newUserAccess, setNewUserAccess] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "user" as "admin" | "user",
    roleId: "",
    status: "active" as "active" | "inactive"
  });
  
  // Redefine password states
  const [redefinePasswordOpen, setRedefinePasswordOpen] = useState(false);
  const [redefinePasswordUser, setRedefinePasswordUser] = useState<any | null>(null);
  const [redefinePasswordValue, setRedefinePasswordValue] = useState("");
  const [redefinePasswordConfirmValue, setRedefinePasswordConfirmValue] = useState("");
  
  // Custom user permissions states
  const [userPermissionsModalOpen, setUserPermissionsModalOpen] = useState(false);
  const [selectedPermissionUserId, setSelectedPermissionUserId] = useState<string | null>(null);
  const [selectedPermissionUserPerms, setSelectedPermissionUserPerms] = useState<string[]>([]);

  const [selectedPermissionRoleId, setSelectedPermissionRoleId] = useState("");
  const [selectedPermissionRolePerms, setSelectedPermissionRolePerms] = useState<string[]>([]);

  // Loading & error states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Stock Notifications & WhatsApp Configuration States
  const [notifications, setNotifications] = useState<StockNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [analyzingStock, setAnalyzingStock] = useState(false);
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsappConfig | null>(null);
  const [whatsappConfigOpen, setWhatsappConfigOpen] = useState(false);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [teamFilterStatus, setTeamFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredTeamUsers = teamUsers.filter((member) => {
    const query = teamSearchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      (member.phone && member.phone.toLowerCase().includes(query)) ||
      (member.cargo && member.cargo.toLowerCase().includes(query)) ||
      (member.username && member.username.toLowerCase().includes(query));
    
    if (!matchesSearch) return false;
    
    if (teamFilterStatus === "active") return member.status !== "inactive";
    if (teamFilterStatus === "inactive") return member.status === "inactive";
    return true;
  });

  // Modal open states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [activeProductDropdown, setActiveProductDropdown] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [quickStockMovementProd, setQuickStockMovementProd] = useState<Product | null>(null);
  const [configuringProduct, setConfiguringProduct] = useState<Product | null>(null);
  const [showDeleteHistoryDialog, setShowDeleteHistoryDialog] = useState<Product | null>(null);
  const [quickStockType, setQuickStockType] = useState<"input" | "output">("input");
  const [quickStockQty, setQuickStockQty] = useState("");
  const [quickStockReason, setQuickStockReason] = useState("Compra");
  const [quickStockOperator, setQuickStockOperator] = useState("");
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [saleModalOpen, setSaleModalOpen] = useState(false);

  // Form states for creating resources
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    price: "",
    costPrice: "",
    stock: "",
    minStock: "",
    category: "Geral",
    barcode: "",
    image: "",
    unidade: "Unidade",
    marca: "",
    supplier: "",
    location: "",
    descricao: "",
    status: "active"
  });

  // Automatic Image lookup & photo states
  const [searchingImage, setSearchingImage] = useState(false);
  const [suggestedImage, setSuggestedImage] = useState<string | null>(null);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [editingProductPhoto, setEditingProductPhoto] = useState<any | null>(null);
  
  const [newClient, setNewClient] = useState({
    name: "", email: "", phone: "", document: "", city: "", state: "SP"
  });

  const [newSale, setNewSale] = useState({
    productId: "", quantity: "1", clientId: "", status: "completed" as "completed" | "pending"
  });

  // Helper to check user permissions
  const hasPermission = (permissionId: string): boolean => {
    if (user?.role === "admin" || user?.role === "superadmin") return true;
    return user?.permissions?.includes(permissionId) || false;
  };

  // Fetch RBAC data
  const fetchRbacData = async () => {
    if (user?.role !== "admin" && user?.role !== "superadmin" && !user?.permissions?.includes("manage_users")) return;
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const [permRes, rolesRes, usersRes] = await Promise.all([
        fetch("/api/rbac/permissions", { headers }),
        fetch("/api/rbac/roles", { headers }),
        fetch("/api/rbac/users", { headers })
      ]);
      if (permRes.ok) setPermissions(await permRes.json());
      if (rolesRes.ok) {
        const roles = await rolesRes.json();
        setCustomRoles(roles);
        if (roles.length > 0 && !selectedPermissionRoleId) {
          setSelectedPermissionRoleId(roles[0].id);
          setSelectedPermissionRolePerms(roles[0].permissions);
        }
      }
      if (usersRes.ok) setTeamUsers(await usersRes.json());
    } catch (err) {
      console.error("Erro ao carregar dados de acesso:", err);
    }
  };

  // Fetch all dashboard data
  const fetchData = async (showRefreshIndicator = false) => {
    if (user?.role === "superadmin") {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const headers = { "Authorization": `Bearer ${token}` };

      // 1. Fetch Stats if they have permission or are admin
      if (hasPermission("view_stats")) {
        const statsRes = await fetch("/api/dashboard/stats", { headers });
        const statsData = await statsRes.json();
        if (statsRes.ok) {
          setStats(statsData.stats);
          setRecentSales(statsData.recentSales || []);
          setProductsLowStock(statsData.productsWithLowStock || []);
        }
      } else {
        setStats(null);
        setRecentSales([]);
        setProductsLowStock([]);
      }

      // 2. Fetch Products if they have permission
      if (hasPermission("view_products")) {
        const prodRes = await fetch("/api/products", { headers });
        const prodData = await prodRes.json();
        if (prodRes.ok) setAllProducts(prodData);
      } else {
        setAllProducts([]);
      }

      // 3. Fetch Clients if they have permission
      if (hasPermission("view_clients")) {
        const cliRes = await fetch("/api/clients", { headers });
        const cliData = await cliRes.json();
        if (cliRes.ok) setAllClients(cliData);
      } else {
        setAllClients([]);
      }

      // 4. Fetch Sales if they have permission
      if (hasPermission("view_sales")) {
        const salesRes = await fetch("/api/sales", { headers });
        const salesData = await salesRes.json();
        if (salesRes.ok) setAllSales(salesData);
      } else {
        setAllSales([]);
      }

      // 5. Fetch RBAC data
      await fetchRbacData();

      // Fetch Transactions from Server
      const txsRes = await fetch("/api/transactions", { headers });
      if (txsRes.ok) {
        const txsData = await txsRes.json();
        setTransactions(txsData.sort((a: any, b: any) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime()));
      }

      // Fetch Company Settings from Server
      const settingsRes = await fetch("/api/company/settings", { headers });
      if (settingsRes.ok) {
        setCompanySettings(await settingsRes.json());
      }

      // 6. Fetch AI Stock Notifications & WhatsApp Config
      const notifRes = await fetch("/api/notifications", { headers });
      if (notifRes.ok) setNotifications(await notifRes.json());

      const waRes = await fetch("/api/whatsapp-config", { headers });
      if (waRes.ok) setWhatsappConfig(await waRes.json());

      // Fetch current company subscription status
      const subRes = await fetch("/api/company/subscription", { headers });
      if (subRes.ok) {
        setCompanySub(await subRes.json());
      }

    } catch (err: any) {
      setError(err.message || "Houve um erro ao sincronizar dados com o servidor.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        showToast("Todas as notificações marcadas como lidas!", "success");
      }
    } catch (err) {
      console.error("Erro ao marcar todas notificações:", err);
    }
  };

  const handleTriggerAIScan = async () => {
    setAnalyzingStock(true);
    showToast("Inteligência Artificial analisando estoque e vendas...", "success");
    try {
      const response = await fetch("/api/notifications/analyze-stock", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.notifications) {
        setNotifications(data.notifications);
        showToast("Análise inteligente de estoque concluída com sucesso!", "success");
      } else {
        throw new Error(data.error || "Erro na análise de estoque.");
      }
    } catch (err: any) {
      showToast(err.message || "Não foi possível realizar a análise no momento.", "error");
    } finally {
      setAnalyzingStock(false);
    }
  };

  const handleSaveWhatsappConfig = async (enabled: boolean, phone: string) => {
    try {
      const response = await fetch("/api/whatsapp-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ whatsappEnabled: enabled, whatsappPhone: phone })
      });
      const data = await response.json();
      if (response.ok && data.config) {
        setWhatsappConfig(data.config);
        showToast("Configuração do WhatsApp atualizada com sucesso!", "success");
        setWhatsappConfigOpen(false);
      } else {
        throw new Error(data.error || "Erro ao salvar configuração.");
      }
    } catch (err: any) {
      showToast(err.message || "Erro ao salvar.", "error");
    }
  };

  const handleSendWhatsappAlert = (notification: StockNotification) => {
    if (!whatsappConfig || !whatsappConfig.whatsappEnabled || !whatsappConfig.whatsappPhone) {
      setWhatsappConfigOpen(true);
      showToast("Ative e configure o número de WhatsApp primeiro!", "error");
      return;
    }

    const cleanPhone = whatsappConfig.whatsappPhone.replace(/\D/g, "");
    
    const text = `⚠️ *Meu Gestor*
Seu estoque está baixo.

*Produto:*
${notification.metadata?.productName || "Produto Não Identificado"}

*Quantidade atual:*
${notification.metadata?.stock ?? 0} unidades

*Estoque mínimo:*
${notification.metadata?.minStock ?? 10} unidades

Acesse o sistema para realizar a reposição.`;

    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    showToast("Redirecionando para o WhatsApp...", "success");
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const planId = params.get("planId");
    const gateway = params.get("gateway");
    
    if (payment === "success" && planId) {
      const activate = async () => {
        try {
          const res = await fetch("/api/company/activate-subscription", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ planId, gateway })
          });
          const data = await res.json();
          if (res.ok) {
            showToast("🎉 Assinatura ativada com sucesso! Bem-vindo ao Meu Gestor.", "success");
            window.history.replaceState(null, "", window.location.pathname);
            fetchData(true);
          } else {
            showToast(data.error || "Erro ao ativar assinatura.", "error");
          }
        } catch (err: any) {
          console.error("Erro na ativação:", err);
          showToast("Erro de comunicação ao ativar assinatura.", "error");
        }
      };
      activate();
    } else if (payment === "cancel") {
      showToast("❌ O pagamento foi cancelado ou não concluído.", "error");
      window.history.replaceState(null, "", window.location.pathname);
      fetchData();
    } else {
      fetchData();
    }
  }, [token]);

  const closeProductModal = () => {
    setProductModalOpen(false);
    setEditingProduct(null);
    setNewProduct({
      name: "",
      sku: "",
      price: "",
      costPrice: "",
      stock: "",
      minStock: "",
      category: "Geral",
      barcode: "",
      image: "",
      unidade: "Unidade",
      marca: "",
      supplier: "",
      location: "",
      descricao: "",
      status: "active"
    });
    setSuggestedImage(null);
    setShowImagePrompt(false);
  };

  // Form submission: Create Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao cadastrar produto.");
      
      setProductModalOpen(false);
      setNewProduct({
        name: "",
        sku: "",
        price: "",
        costPrice: "",
        stock: "",
        minStock: "",
        category: "Geral",
        barcode: "",
        image: "",
        unidade: "Unidade",
        marca: "",
        supplier: "",
        location: "",
        descricao: "",
        status: "active"
      });
      setSuggestedImage(null);
      setShowImagePrompt(false);
      fetchData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const triggerImageSearch = async (name: string, barcode: string) => {
    if (!name && !barcode) return;
    setSearchingImage(true);
    setSuggestedImage(null);
    setShowImagePrompt(false);
    try {
      const params = new URLSearchParams();
      if (name) params.append("name", name);
      if (barcode) params.append("barcode", barcode);
      
      const res = await fetch(`/api/products/search-image?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.url) {
          setSuggestedImage(data.url);
          setShowImagePrompt(true);
        } else {
          showToast("Nenhuma imagem localizada automaticamente.", "error");
        }
      } else {
        showToast("Erro ao buscar imagem nas fontes públicas.", "error");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSearchingImage(false);
    }
  };

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      setTimeout(() => {
        const videoElement = document.getElementById("webcam") as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
        }
      }, 300);
    } catch (err: any) {
      showToast("Não foi possível acessar a câmera. Verifique as permissões.", "error");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCameraStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    const videoElement = document.getElementById("webcam") as HTMLVideoElement;
    if (videoElement) {
      const canvas = document.createElement("canvas");
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        if (teamUserModalOpen) {
          setNewTeamUser(prev => ({ ...prev, photo: dataUrl }));
        } else if (editingProductPhoto) {
          setEditingProductPhoto({ ...editingProductPhoto, image: dataUrl });
        } else {
          setNewProduct({ ...newProduct, image: dataUrl });
        }
      }
    }
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (teamUserModalOpen) {
          setNewTeamUser(prev => ({ ...prev, photo: base64 }));
        } else if (editingProductPhoto) {
          setEditingProductPhoto({ ...editingProductPhoto, image: base64 });
        } else {
          setNewProduct({ ...newProduct, image: base64 });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProductPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductPhoto) return;
    try {
      const response = await fetch(`/api/products/${editingProductPhoto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingProductPhoto
        })
      });
      const data = response.ok ? await response.json() : null;
      if (!response.ok) throw new Error((data && data.error) || "Erro ao atualizar foto do produto.");
      
      showToast("Foto do produto atualizada com sucesso!", "success");
      setEditingProductPhoto(null);
      setSuggestedImage(null);
      setShowImagePrompt(false);
      fetchData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Form submission: Create Client
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newClient)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao cadastrar cliente.");
      
      setClientModalOpen(false);
      setNewClient({ name: "", email: "", phone: "", document: "", city: "", state: "SP" });
      fetchData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Form submission: Record Sale
  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find selected product
      const targetProd = allProducts.find(p => p.id === newSale.productId);
      if (!targetProd) {
        showToast("Por favor, selecione um produto válido.", "error");
        return;
      }

      // Find selected client
      const targetCli = allClients.find(c => c.id === newSale.clientId);
      const clientName = targetCli ? targetCli.name : "Consumidor Final";

      const qty = Number(newSale.quantity || 1);
      const totalValue = targetProd.price * qty;
      const totalCost = targetProd.costPrice * qty;
      const profitValue = totalValue - totalCost;

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: newSale.clientId || "c_generic",
          clientName: clientName,
          total: totalValue,
          profit: profitValue,
          itemsCount: qty,
          status: newSale.status
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao registrar venda.");

      // Sync into server-side finance transactions ledger
      try {
        await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            description: `Venda registrada - ${clientName}`,
            type: "income",
            category: "Vendas",
            amount: totalValue,
            status: newSale.status === "completed" ? "paid" : "pending"
          })
        });
      } catch (txErr) {
        console.error("Erro ao sincronizar transação de venda:", txErr);
      }

      setSaleModalOpen(false);
      setSaleSubView("list");
      setNewSale({ productId: "", quantity: "1", clientId: "", status: "completed" });
      showToast("Lançamento de venda concluído com sucesso!");
      fetchData(true);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Update Product handler
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao atualizar produto.");
      
      setProductSubView("list");
      setEditingProduct(null);
      setNewProduct({
        name: "",
        sku: "",
        price: "",
        costPrice: "",
        stock: "",
        minStock: "",
        category: "Geral",
        barcode: "",
        image: "",
        unidade: "Unidade",
        marca: "",
        supplier: "",
        location: "",
        descricao: "",
        status: "active"
      });
      showToast("Cadastro de produto atualizado com sucesso!");
      fetchData(true);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Delete Product handler
  const handleDeleteProduct = async (id: string) => {
    triggerConfirm("Deseja realmente excluir este produto?", async () => {
      try {
        const response = await fetch(`/api/products/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) {
          if (data.hasHistory) {
            const prod = allProducts.find(p => p.id === id);
            if (prod) {
              setShowDeleteHistoryDialog(prod);
              return;
            }
          }
          throw new Error(data.error || "Erro ao excluir produto.");
        }
        
        showToast("Produto excluído com sucesso!");
        fetchData(true);
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  // Submit hander: Quick Stock Movement
  const handleQuickStockMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickStockMovementProd) return;
    const qty = Number(quickStockQty);
    if (!qty || qty <= 0) {
      showToast("Por favor, informe uma quantidade válida maior que zero.", "error");
      return;
    }

    const currentStock = Number(quickStockMovementProd.stock) || 0;
    const newStock = quickStockType === "input" ? currentStock + qty : currentStock - qty;
    if (newStock < 0) {
      showToast("Estoque insuficiente para esta saída.", "error");
      return;
    }

    try {
      const op = quickStockOperator || user?.name || "Operador";
      // 1. Post stock movement
      const movementRes = await fetch("/api/stock-movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: quickStockMovementProd.id,
          productName: quickStockMovementProd.name,
          sku: quickStockMovementProd.sku,
          type: quickStockType,
          quantity: qty,
          reason: quickStockReason,
          operator: op
        })
      });
      if (!movementRes.ok) throw new Error("Erro ao salvar histórico de movimentação.");

      // 2. Put updated stock on product
      const productRes = await fetch(`/api/products/${quickStockMovementProd.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...quickStockMovementProd,
          stock: String(newStock)
        })
      });
      if (!productRes.ok) throw new Error("Erro ao atualizar saldo de estoque.");

      showToast(`Movimentação de ${quickStockType === "input" ? "entrada" : "saída"} registrada com sucesso!`, "success");
      setQuickStockMovementProd(null);
      setQuickStockQty("");
      setQuickStockReason("Compra");
      setQuickStockOperator("");
      fetchData(true);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Submit handler: Quick Product Configuration
  const handleQuickConfigureProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuringProduct) return;
    try {
      const response = await fetch(`/api/products/${configuringProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...configuringProduct,
          minStock: configuringProduct.minStock,
          status: configuringProduct.status,
          location: configuringProduct.location
        })
      });
      if (!response.ok) throw new Error("Erro ao atualizar configurações do produto.");
      showToast("Configurações do produto atualizadas com sucesso!", "success");
      setConfiguringProduct(null);
      fetchData(true);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Submit handler: Deactivate product instead of deletion if history exists
  const handleDeactivateProductAlternative = async () => {
    if (!showDeleteHistoryDialog) return;
    try {
      const response = await fetch(`/api/products/${showDeleteHistoryDialog.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...showDeleteHistoryDialog,
          status: "inactive"
        })
      });
      if (!response.ok) throw new Error("Erro ao desativar produto.");
      showToast("Produto desativado com sucesso para preservar histórico!", "success");
      setShowDeleteHistoryDialog(null);
      fetchData(true);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Update Client handler
  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    try {
      const response = await fetch(`/api/clients/${editingClient.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newClient)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao atualizar cliente.");
      
      setClientSubView("list");
      setEditingClient(null);
      setNewClient({ name: "", email: "", phone: "", document: "", city: "", state: "SP" });
      showToast("Cadastro de cliente atualizado!");
      fetchData(true);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Delete Client handler
  const handleDeleteClient = async (id: string) => {
    triggerConfirm("Tem certeza de que deseja remover permanentemente este cliente?", async () => {
      try {
        const response = await fetch(`/api/clients/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao excluir cliente.");
        
        showToast("Cliente removido com sucesso!");
        fetchData(true);
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  // Delete Sale handler
  const handleDeleteSale = async (id: string) => {
    triggerConfirm("Tem certeza de que deseja cancelar e excluir esta venda do faturamento?", async () => {
      try {
        const response = await fetch(`/api/sales/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao excluir venda.");
        
        showToast("Lançamento de venda removido!");
        fetchData(true);
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  // RBAC handlers
  const handleCreateOrUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingRole;
      const url = isEditing ? `/api/rbac/roles/${editingRole.id}` : "/api/rbac/roles";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newRole)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao salvar cargo.");

      setRoleModalOpen(false);
      setEditingRole(null);
      setNewRole({ name: "", description: "", permissions: [] });
      fetchData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    triggerConfirm("Tem certeza que deseja remover este cargo? Usuários associados a ele perderão o acesso correspondente.", async () => {
      try {
        const response = await fetch(`/api/rbac/roles/${roleId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao excluir cargo.");

        fetchData(true);
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  const handleCreateOrUpdateTeamUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingTeamUser;

      // Access system validation
      if (newTeamUser.hasAccess) {
        if (!newTeamUser.username || !newTeamUser.username.trim()) {
          alert("Por favor, preencha o Nome de Usuário (login) para o acesso ao sistema.");
          return;
        }
        if (!isEditing && !newTeamUser.password) {
          alert("Por favor, informe a Senha para o acesso ao sistema.");
          return;
        }
        if (newTeamUser.password && newTeamUser.password !== newTeamUser.confirmPassword) {
          alert("As senhas informadas não coincidem. Por favor, confirme a senha.");
          return;
        }
        if (newTeamUser.password && newTeamUser.password.length < 6) {
          alert("A senha de acesso deve ter no mínimo 6 caracteres.");
          return;
        }
      }

      const url = isEditing ? `/api/rbac/users/${editingTeamUser.id}` : "/api/rbac/users";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newTeamUser)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao salvar membro da equipe.");

      setTeamUserModalOpen(false);
      setEditingTeamUser(null);
      setNewTeamUser({
        name: "",
        email: "",
        phone: "",
        role: "user",
        roleId: "",
        password: "",
        confirmPassword: "",
        username: "",
        cargo: "",
        status: "active",
        photo: "",
        cpf: "",
        admissaoDate: new Date().toISOString().split("T")[0],
        observacoes: "",
        hasAccess: false,
        setor: ""
      });
      fetchData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveUserAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEditing = !!editingUserAccess;
      const empId = isEditing ? editingUserAccess.id : selectedAccessEmployeeId;
      
      if (!empId) {
        alert("Por favor, selecione um funcionário.");
        return;
      }

      if (!newUserAccess.username || !newUserAccess.username.trim()) {
        alert("Por favor, informe o usuário (login).");
        return;
      }

      if (!isEditing && !newUserAccess.password) {
        alert("Por favor, informe a senha de acesso.");
        return;
      }

      if (newUserAccess.password) {
        if (newUserAccess.password !== newUserAccess.confirmPassword) {
          alert("As senhas não coincidem.");
          return;
        }
        if (newUserAccess.password.length < 6) {
          alert("A senha deve ter no mínimo 6 caracteres.");
          return;
        }
      }

      const employee = teamUsers.find((u: any) => u.id === empId);
      if (!employee) {
        alert("Funcionário não encontrado.");
        return;
      }

      // Prepare request payload
      const payload = {
        ...employee,
        hasAccess: true,
        username: newUserAccess.username.trim(),
        password: newUserAccess.password || undefined,
        role: newUserAccess.role,
        roleId: newUserAccess.role === "admin" ? null : newUserAccess.roleId,
        status: newUserAccess.status
      };

      const response = await fetch(`/api/rbac/users/${empId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao salvar acesso.");

      setUserAccessModalOpen(false);
      setEditingUserAccess(null);
      setSelectedAccessEmployeeId("");
      setNewUserAccess({
        username: "",
        password: "",
        confirmPassword: "",
        role: "user",
        roleId: "",
        status: "active"
      });
      fetchData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveUserPermissions = async () => {
    if (!selectedPermissionUserId) return;
    try {
      const response = await fetch(`/api/rbac/users/${selectedPermissionUserId}/permissions`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ permissions: selectedPermissionUserPerms })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao salvar permissões customizadas.");

      setUserPermissionsModalOpen(false);
      setSelectedPermissionUserId(null);
      setSelectedPermissionUserPerms([]);
      fetchData(true);
      
      setToasts(prev => [...prev, { id: Date.now().toString(), message: "Permissões atualizadas com sucesso!", type: "success" }]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevokeUserAccess = async (emp: any) => {
    triggerConfirm(`Tem certeza que deseja revogar o acesso de ${emp.name}? O funcionário continuará cadastrado, mas não poderá mais acessar o sistema.`, async () => {
      try {
        const payload = {
          ...emp,
          hasAccess: false,
          username: undefined,
          roleId: null,
          role: "user"
        };

        const response = await fetch(`/api/rbac/users/${emp.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao revogar acesso.");

      fetchData(true);
      showToast("Acesso revogado com sucesso!");
    } catch (err: any) {
      showToast(err.message, "error");
    }
    });
  };

  const handleRedefinePassword = async () => {
    if (!redefinePasswordValue || redefinePasswordValue.length < 6) {
      alert("A senha deve conter pelo menos 6 caracteres.");
      return;
    }
    if (redefinePasswordValue !== redefinePasswordConfirmValue) {
      alert("As senhas não coincidem.");
      return;
    }
    try {
      const payload = {
        ...redefinePasswordUser,
        password: redefinePasswordValue
      };

      const response = await fetch(`/api/rbac/users/${redefinePasswordUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao redefinir senha.");

      alert("Senha redefinida com sucesso!");
      setRedefinePasswordOpen(false);
      setRedefinePasswordUser(null);
      setRedefinePasswordValue("");
      setRedefinePasswordConfirmValue("");
      fetchData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleUserStatus = async (userToToggle: any) => {
    const newStatus = userToToggle.status === "inactive" ? "active" : "inactive";
    const actionName = newStatus === "active" ? "desbloquear" : "bloquear";
    triggerConfirm(`Tem certeza que deseja ${actionName} o acesso de ${userToToggle.name}?`, async () => {
      try {
        const payload = {
          ...userToToggle,
          status: newStatus
        };

        const response = await fetch(`/api/rbac/users/${userToToggle.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao alterar status.");

        showToast(`Acesso ${newStatus === "active" ? "desbloqueado" : "bloqueado"} com sucesso!`);
        fetchData(true);
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  const handleSaveRolePermissions = async (roleId: string, updatedPerms: string[]) => {
    try {
      const role = customRoles.find(r => r.id === roleId);
      if (!role) {
        alert("Cargo não encontrado.");
        return;
      }

      const response = await fetch(`/api/rbac/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: role.name,
          description: role.description,
          permissions: updatedPerms
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao atualizar permissões do cargo.");

      alert("Permissões salvas com sucesso!");
      fetchData(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteTeamUser = async (teamUserId: string) => {
    triggerConfirm("Tem certeza que deseja remover este membro da equipe?", async () => {
      try {
        const response = await fetch(`/api/rbac/users/${teamUserId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Erro ao excluir membro da equipe.");

        showToast("Membro da equipe removido com sucesso!");
        fetchData(true);
      } catch (err: any) {
        showToast(err.message, "error");
      }
    });
  };

  const startEditRole = (role: any) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    });
    setRoleModalOpen(true);
  };

  const startEditTeamUser = (member: any) => {
    setEditingTeamUser(member);
    setNewTeamUser({
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      role: member.role,
      roleId: member.roleId || "",
      password: "",
      confirmPassword: "",
      username: member.username || "",
      cargo: member.cargo || "",
      status: member.status || "active",
      photo: member.photo || "",
      cpf: member.cpf || "",
      admissaoDate: member.admissaoDate || new Date().toISOString().split("T")[0],
      observacoes: member.observacoes || "",
      hasAccess: member.hasAccess !== false,
      setor: member.setor || ""
    });
    setTeamUserModalOpen(true);
  };

  // Format currency helpers
  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  // Filter lists based on search queries
  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredClients = allClients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.document.includes(searchQuery)
  );

  const filteredSales = allSales.filter(s => 
    s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Extract unique categories for filter
  const productCategories = Array.from(new Set(allProducts.map(p => p.category)));

  // Tab permission mappings for client-side routing guard
  const tabPermissions: Record<string, string> = {
    overview: "view_stats",
    caixa: "create_sales",
    products: "view_products",
    inventory: "edit_products",
    sales: "view_sales",
    clients: "view_clients",
    finance: "view_sales",
    reports: "view_stats",
    ai_assistant: "view_stats",
    employees: "manage_users",
    users_permissions: "manage_users",
    settings: "manage_users",
  };

  const requiredPermissionForTab = tabPermissions[activeTab];
  const isAllowedTab = user?.role === "admin" || user?.role === "superadmin" || !requiredPermissionForTab || hasPermission(requiredPermissionForTab);

  const subStatus = companySub?.company?.status || company?.status || "pending_payment";
  const isSuspendedOrPending = !isSuperAdmin && (subStatus === "pending_payment" || subStatus === "suspended");

  if (isSuspendedOrPending) {
    return (
      <SubscriptionPortal 
        company={companySub?.company || company}
        plans={companySub?.plans || []}
        history={companySub?.history || []}
        overdueDays={companySub?.overdueDays || 0}
        token={token}
        onLogout={onLogout}
        onSuccess={() => fetchData(true)}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 ${localStorage.getItem("superadmin_token") ? "pt-10" : ""}`}>
      
      {/* Impersonation active banner */}
      {localStorage.getItem("superadmin_token") && (
        <div className="fixed top-0 left-0 right-0 bg-amber-600 text-white px-4 py-2.5 flex items-center justify-between z-50 shadow-md font-sans text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-white animate-pulse"></span>
            <span>
              <strong>Modo de Suporte Ativo:</strong> Você está acessando temporariamente os dados de <strong>{company?.name || "Empresa"}</strong>. Suas ações estão registradas no log de auditoria.
            </span>
          </div>
          <button
            onClick={handleTerminateSupportImpersonation}
            className="px-3 py-1 bg-white text-amber-800 hover:bg-amber-50 rounded-lg font-bold transition-all cursor-pointer text-[10px] uppercase tracking-wider"
          >
            Finalizar e Revogar Acesso
          </button>
        </div>
      )}

      {/* 1. LEFT SIDEBAR */}
      {!isOnlyCashier && (
        <aside className={`hidden lg:flex flex-col bg-slate-900 text-white border-r border-slate-800 flex-shrink-0 transition-all duration-300 relative z-20 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}>
          
          {/* Brand Logo header */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-2 overflow-hidden justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <Layers className="w-4.5 h-4.5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent truncate">
                  Meu Gestor
                </span>
              )}
            </div>
            {!sidebarCollapsed && (
              <span className="text-[9px] bg-slate-800 text-emerald-400 font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                SaaS
              </span>
            )}
          </div>

          {/* Company Profile details */}
          <div className={`p-4 bg-slate-800/40 border-b border-slate-800/80 mx-2 mt-4 rounded-xl flex items-center gap-3 overflow-hidden ${sidebarCollapsed ? "justify-center" : ""}`}>
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Building className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {isSuperAdmin ? "Super Admin" : "Empresa"}
                </span>
                <span className="block text-sm font-semibold truncate text-white">
                  {isSuperAdmin ? "Gestão SaaS" : (company?.name || "Empresa Ativa")}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
            {(isSuperAdmin ? [
              { id: "superadmin_dash", label: "Dashboard", icon: Activity },
              { id: "superadmin_companies", label: "Empresas", icon: Building },
              { id: "superadmin_company_admins", label: "Administradores das Empresas", icon: Shield },
              { id: "superadmin_users", label: "Usuários", icon: Users },
              { id: "superadmin_plans", label: "Planos", icon: Sliders },
              { id: "superadmin_payments", label: "Assinaturas", icon: CreditCard },
              { id: "superadmin_modules", label: "Módulos", icon: Layers },
              { id: "superadmin_logs", label: "Logs", icon: FileText },
              { id: "superadmin_system", label: "Configurações da Plataforma", icon: Settings }
            ] : isOnlyStockOperator ? [
              { id: "stock_recebimento", label: "Recebimento de Mercadorias", icon: ArrowDownRight },
              { id: "stock_lote", label: "Cadastro em Lote", icon: Layers },
              { id: "stock_entrada", label: "Entrada de Estoque", icon: PlusCircle },
              { id: "stock_saida", label: "Saída de Estoque", icon: MinusCircle },
              { id: "stock_inventario", label: "Inventário", icon: ClipboardCheck },
              { id: "stock_consulta", label: "Consulta de Produtos", icon: Search },
              { id: "stock_localizacao", label: "Localização de Produtos", icon: MapPin },
              { id: "stock_leitor", label: "Leitor de Código de Barras", icon: Scan },
              { id: "profile", label: "Meu Perfil", icon: User }
            ] : [
              { id: "overview", label: "Dashboard", icon: Activity, permission: "view_stats" },
              { id: "caixa", label: "Caixa (PDV)", icon: ShoppingCart, permission: "create_sales" },
              { id: "products", label: "Produtos", icon: Package, permission: "view_products" },
              { id: "stock_center", label: "Centro de Estoque", icon: Layers, permission: "manage_stock" },
              { id: "inventory", label: "Estoque Clássico", icon: ClipboardList, permission: "view_products" },
              { id: "sales", label: "Vendas", icon: ShoppingBag, permission: "view_sales" },
              { id: "clients", label: "Clientes", icon: Users, permission: "view_clients" },
              { id: "finance", label: "Financeiro", icon: DollarSign, permission: "view_sales" },
              { id: "reports", label: "Relatórios", icon: FileText, permission: "view_stats" },
              { id: "ai_assistant", label: "Assistente IA", icon: Bot, permission: "view_stats" },
              { id: "employees", label: "Funcionários", icon: Users, permission: "manage_users" },
              { id: "users_permissions", label: "Usuários e Permissões", icon: Lock, adminOnly: true },
              { id: "settings", label: "Configurações", icon: Settings, permission: "manage_users" },
              { id: "profile", label: "Perfil", icon: User },
              { id: "plans", label: "Planos SaaS", icon: CreditCard },
              { id: "support", label: "Suporte", icon: HelpCircle }
            ]).filter((item: any) => {
              if (item.id === "caixa" || item.id === "sales") {
                return isModuleActive("use_pdv");
              }
              if (item.id === "products") {
                return isModuleActive("products");
              }
              if (item.id === "stock_center" || item.id === "inventory") {
                return isModuleActive("stock");
              }
              if (item.id === "clients") {
                return isModuleActive("clients");
              }
              if (item.id === "finance") {
                return isModuleActive("finance");
              }
              if (item.id === "reports") {
                return isModuleActive("reports");
              }
              if (item.id === "ai_assistant") {
                return isModuleActive("ai_assistant");
              }
              if (item.id === "employees" || item.id === "users_permissions") {
                return isModuleActive("multi_users");
              }
              if (item.id === "stock_localizacao") {
                return isModuleActive("location_control");
              }
              if (item.id === "stock_leitor") {
                return isModuleActive("barcode");
              }
              if (item.id === "stock_recebimento" || item.id === "stock_lote") {
                return isModuleActive("lot_control");
              }
              return true;
            }).map((item: any) => {
              if (item.adminOnly && user?.role !== "admin" && user?.role !== "superadmin") return null;
              if (item.permission && !hasPermission(item.permission)) return null;
              if ((item.id === "plans" || item.id === "support") && user?.role === "user") return null;
              const IconComponent = item.icon;
              
              const isActive = item.id.startsWith("stock_") 
                ? (activeTab === "stock_center" && stockSubTab === item.id.replace("stock_", "")) 
                : (activeTab === item.id);

              return (
                <button 
                  key={item.id}
                  onClick={() => {
                    if (item.id.startsWith("stock_")) {
                      setActiveTab("stock_center");
                      setStockSubTab(item.id.replace("stock_", ""));
                    } else {
                      setActiveTab(item.id as any);
                    }
                    setSearchQuery("");
                  }}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded-xl text-xs font-bold transition-all ${
                    sidebarCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3"
                  } ${
                    isActive 
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User profile bottom footer */}
          <div className="p-3 border-t border-slate-800/60 mt-auto space-y-4 overflow-hidden">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 flex-shrink-0">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-200 truncate">{user?.name || "Carlos Silva"}</span>
                  <span className="block text-[10px] text-slate-500 truncate">{user?.email}</span>
                </div>
              )}
            </div>
            <button 
              onClick={onLogout}
              title={sidebarCollapsed ? "Sair do Painel" : undefined}
              className={`w-full inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700/80 hover:text-rose-400 rounded-xl text-xs font-semibold text-slate-400 transition-colors active:scale-[0.98] border border-slate-800/80 cursor-pointer ${
                sidebarCollapsed ? "p-3" : "gap-2 py-2.5"
              }`}
            >
              <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
              {!sidebarCollapsed && <span>Sair do Painel</span>}
            </button>
          </div>

        </aside>
      )}

      {/* 2. DYNAMIC MAIN BODY */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative z-10">
        
        {/* TOP HEADER CONTROLS */}
        {isOnlyCashier ? (
          <header className="sticky top-0 z-10 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-sm gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <Layers className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-900 leading-tight">Meu Gestor PDV</span>
                <span className="block text-[10px] font-semibold text-slate-500">Operador: @{user?.username || "caixa01"}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Sync Button */}
              <button 
                onClick={() => fetchData(true)}
                title="Sincronizar dados"
                disabled={refreshing}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
              </button>

              {/* Detailed User Profile Top-Right */}
              <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-extrabold text-slate-800 leading-tight truncate max-w-[150px]">
                    {user?.name || "Operador"}
                  </span>
                  <span className="block text-[10px] font-bold text-emerald-700 leading-tight">
                    {user?.cargo || "Operador de Caixa"}
                  </span>
                  <span className="block text-[9px] text-slate-400 font-semibold leading-none mt-0.5">
                    {company?.name || "Meu Gestor"} • Caixa #01
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200/50 flex items-center justify-center font-bold text-xs text-emerald-800 overflow-hidden shadow-sm flex-shrink-0">
                  {user?.photo ? (
                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    user?.name ? user.name.slice(0, 2).toUpperCase() : "OP"
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <button 
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-200 text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </header>
        ) : (
          <header className="sticky top-0 z-10 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-sm gap-4">
          
          {/* Menu triggers for mobile and Collapsible trigger for desktop */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title={sidebarCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            
            {/* Breadcrumb Path representation */}
            <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>Meu Gestor</span>
              <span>/</span>
              <span className="text-emerald-600 font-bold">
                {activeTab === "overview" && "Dashboard"}
                {activeTab === "caixa" && "Frente de Caixa (PDV)"}
                {activeTab === "products" && `Produtos ${productSubView !== "list" ? `> ${productSubView === "new" ? "Novo" : "Editar"}` : ""}`}
                {activeTab === "inventory" && "Controle de Estoque"}
                {activeTab === "sales" && `Vendas ${saleSubView !== "list" ? `> ${saleSubView === "new" ? "Lançar" : "Detalhes"}` : ""}`}
                {activeTab === "clients" && `Clientes ${clientSubView !== "list" ? `> ${clientSubView === "new" ? "Novo" : "Editar"}` : ""}`}
                {activeTab === "finance" && `Financeiro ${financeSubView !== "list" ? "> Novo" : ""}`}
                {activeTab === "reports" && "Relatórios"}
                {activeTab === "ai_assistant" && "Gestor IA"}
                {activeTab === "employees" && "Funcionários"}
                {activeTab === "users_permissions" && "Usuários e Permissões"}
                {activeTab === "settings" && "Configurações"}
                {activeTab === "profile" && "Perfil"}
                {activeTab === "plans" && "Planos"}
                {activeTab === "support" && "Suporte"}
              </span>
            </div>
          </div>

          {/* Premium Global Search bar */}
          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text"
              placeholder="Pesquisa rápida (produtos, clientes, etc)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-sm pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
            />
          </div>

          {/* Quick Actions & Indicators */}
          <div className="flex items-center gap-3">
            
            {/* Sync Refresh Button */}
            <button 
              onClick={() => fetchData(true)}
              title="Sincronizar dados"
              disabled={refreshing}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
            </button>

            {/* Notification Badge with Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${notificationsOpen ? "bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-100" : "border-slate-200 hover:bg-slate-50 text-slate-600"}`}
                title="Sino de Notificações IA"
              >
                <Bell className="w-4 h-4" />
              </button>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white font-bold text-[8px] flex items-center justify-center rounded-full animate-pulse">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}

              {/* Dropdown panel */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    {/* Click-away backdrop */}
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 flex flex-col"
                    >
                      {/* Header */}
                      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-emerald-400" />
                          <h4 className="font-bold text-sm">Monitoramento de Estoque IA</h4>
                        </div>
                        <button 
                          onClick={handleTriggerAIScan}
                          disabled={analyzingStock}
                          className="text-[10px] bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {analyzingStock ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          <span>Análise IA</span>
                        </button>
                      </div>

                      {/* Config alert info & WhatsApp setup shortcut */}
                      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Canal de Alertas</span>
                        <button 
                          onClick={() => { setWhatsappConfigOpen(true); setNotificationsOpen(false); }}
                          className="text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {whatsappConfig?.whatsappEnabled ? "🟢 WhatsApp Ativo" : "⚪ Configurar WhatsApp"}
                        </button>
                      </div>

                      {/* Main List */}
                      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[320px] custom-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-xs italic">
                            Nenhum alerta pendente. O estoque está 100% monitorado pela IA!
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              className={`p-3.5 transition-colors relative flex gap-3 ${notif.read ? "bg-white opacity-85" : "bg-emerald-50/30"}`}
                            >
                              {/* Severity dot indicator */}
                              <div className="flex-shrink-0 mt-1">
                                {notif.severity === "danger" && <span className="flex h-2.5 w-2.5 rounded-full bg-red-500" />}
                                {notif.severity === "warning" && <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500" />}
                                {notif.severity === "success" && <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />}
                                {notif.severity === "info" && <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500" />}
                              </div>

                              {/* Notification info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                  {notif.message}
                                </p>
                                <div className="mt-1.5 flex items-center gap-3">
                                  <span className="text-[9px] text-slate-400 font-semibold">
                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>

                                  {/* Read trigger */}
                                  {!notif.read && (
                                    <button 
                                      onClick={() => handleMarkNotificationRead(notif.id)}
                                      className="text-[9px] text-slate-500 hover:text-emerald-700 hover:underline cursor-pointer font-bold"
                                    >
                                      Lido
                                    </button>
                                  )}

                                  {/* Send WhatsApp action for low_stock alerts */}
                                  {(notif.type === "low_stock" || notif.type === "near_min" || notif.type === "out_of_stock") && (
                                    <button 
                                      onClick={() => handleSendWhatsappAlert(notif)}
                                      className="text-[9px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline cursor-pointer ml-auto"
                                    >
                                      📲 Enviar WhatsApp
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <button 
                          onClick={handleMarkAllNotificationsRead}
                          className="text-[10px] text-slate-600 hover:text-emerald-700 font-bold cursor-pointer hover:underline"
                        >
                          Limpar Tudo / Lidos
                        </button>
                        <span className="text-[10px] text-slate-400 font-bold">
                          Meu Gestor IA v2.6
                        </span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Settings shortcut button */}
            <button 
              onClick={() => setActiveTab("settings")}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer"
              title="Configurações do Sistema"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User profile avatar click opens profile tab */}
            <button 
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-3 p-1 hover:bg-slate-50 rounded-xl transition-all cursor-pointer text-left border-l border-slate-200 pl-4"
              title="Ver meu perfil"
            >
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-extrabold text-slate-800 leading-tight truncate max-w-[150px]">
                  {user?.name || "Administrador"}
                </span>
                <span className="block text-[10px] font-bold text-emerald-700 leading-tight">
                  {user?.cargo || (user?.role === "superadmin" ? "Super Administrador" : user?.role === "admin" ? "Administrador" : "Funcionário")}
                </span>
                <span className="block text-[9px] text-slate-400 font-semibold leading-none mt-0.5">
                  {isSuperAdmin ? "Gestão SaaS" : (company?.name || "Meu Gestor")} {((user?.cargo || "").toLowerCase().includes("caixa") || (user?.permissions?.includes("create_sales") && !user?.permissions?.includes("view_stats"))) && "• Caixa #01"}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200/50 flex items-center justify-center font-bold text-xs text-emerald-800 overflow-hidden shadow-sm flex-shrink-0">
                {user?.photo ? (
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"
                )}
              </div>
            </button>

          </div>
        </header>
        )}

        {/* MOBILE SLIDE-OUT DRAWER MENU OVERLAY */}
        <AnimatePresence>
          {mobileSidebarOpen && !isOnlyCashier && (
            <>
              {/* Dark backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black z-40 lg:hidden"
              />
              {/* Sidebar Content drawer */}
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                className="fixed inset-y-0 left-0 w-72 bg-slate-900 text-white shadow-2xl z-50 lg:hidden flex flex-col p-5"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-lg text-white">Meu Gestor SaaS</span>
                  </div>
                  <button 
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Company banner */}
                <div className="p-3 bg-slate-800 rounded-lg flex items-center gap-2.5 mb-5 text-xs">
                  <Building className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold truncate text-slate-200">
                    {isSuperAdmin ? "Gestão SaaS" : (company?.name || "Meu Gestor Corp")}
                  </span>
                </div>

                {/* Links */}
                <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
                  {(isSuperAdmin ? [
                    { id: "superadmin_dash", label: "Dashboard", icon: Activity },
                    { id: "superadmin_companies", label: "Empresas", icon: Building },
                    { id: "superadmin_company_admins", label: "Administradores das Empresas", icon: Shield },
                    { id: "superadmin_users", label: "Usuários", icon: Users },
                    { id: "superadmin_plans", label: "Planos", icon: Sliders },
                    { id: "superadmin_payments", label: "Assinaturas", icon: CreditCard },
                    { id: "superadmin_modules", label: "Módulos", icon: Layers },
                    { id: "superadmin_logs", label: "Logs", icon: FileText },
                    { id: "superadmin_system", label: "Configurações da Plataforma", icon: Settings }
                  ] : isOnlyStockOperator ? [
                    { id: "stock_recebimento", label: "Recebimento de Mercadorias", icon: ArrowDownRight },
                    { id: "stock_lote", label: "Cadastro em Lote", icon: Layers },
                    { id: "stock_entrada", label: "Entrada de Estoque", icon: PlusCircle },
                    { id: "stock_saida", label: "Saída de Estoque", icon: MinusCircle },
                    { id: "stock_inventario", label: "Inventário", icon: ClipboardCheck },
                    { id: "stock_consulta", label: "Consulta de Produtos", icon: Search },
                    { id: "stock_localizacao", label: "Localização de Produtos", icon: MapPin },
                    { id: "stock_leitor", label: "Leitor de Código de Barras", icon: Scan },
                    { id: "profile", label: "Meu Perfil", icon: User }
                  ] : [
                    { id: "overview", label: "Dashboard", icon: Activity, permission: "view_stats" },
                    { id: "caixa", label: "Caixa (PDV)", icon: ShoppingCart, permission: "create_sales" },
                    { id: "products", label: "Produtos", icon: Package, permission: "view_products" },
                    { id: "stock_center", label: "Centro de Estoque", icon: Layers, permission: "manage_stock" },
                    { id: "inventory", label: "Estoque Clássico", icon: ClipboardList, permission: "view_products" },
                    { id: "sales", label: "Vendas", icon: ShoppingBag, permission: "view_sales" },
                    { id: "clients", label: "Clientes", icon: Users, permission: "view_clients" },
                    { id: "finance", label: "Financeiro", icon: DollarSign, permission: "view_sales" },
                    { id: "reports", label: "Relatórios", icon: FileText, permission: "view_stats" },
                    { id: "ai_assistant", label: "Assistente IA", icon: Bot, permission: "view_stats" },
                    { id: "employees", label: "Funcionários", icon: Users, permission: "manage_users" },
                    { id: "users_permissions", label: "Usuários e Permissões", icon: Lock, adminOnly: true },
                    { id: "settings", label: "Configurações", icon: Settings, permission: "manage_users" },
                    { id: "profile", label: "Perfil", icon: User },
                    { id: "plans", label: "Planos SaaS", icon: CreditCard },
                    { id: "support", label: "Suporte", icon: HelpCircle }
                  ]).filter((item: any) => {
                    if (item.id === "caixa" || item.id === "sales") {
                      return isModuleActive("use_pdv");
                    }
                    if (item.id === "products") {
                      return isModuleActive("products");
                    }
                    if (item.id === "stock_center" || item.id === "inventory") {
                      return isModuleActive("stock");
                    }
                    if (item.id === "clients") {
                      return isModuleActive("clients");
                    }
                    if (item.id === "finance") {
                      return isModuleActive("finance");
                    }
                    if (item.id === "reports") {
                      return isModuleActive("reports");
                    }
                    if (item.id === "ai_assistant") {
                      return isModuleActive("ai_assistant");
                    }
                    if (item.id === "employees" || item.id === "users_permissions") {
                      return isModuleActive("multi_users");
                    }
                    if (item.id === "stock_localizacao") {
                      return isModuleActive("location_control");
                    }
                    if (item.id === "stock_leitor") {
                      return isModuleActive("barcode");
                    }
                    if (item.id === "stock_recebimento" || item.id === "stock_lote") {
                      return isModuleActive("lot_control");
                    }
                    return true;
                  }).map((item) => {
                    if (item.permission && !hasPermission(item.permission)) return null;
                    if ((item.id === "plans" || item.id === "support") && user?.role === "user") return null;
                    const IconComponent = item.icon;
                    
                    const isActive = item.id.startsWith("stock_") 
                      ? (activeTab === "stock_center" && stockSubTab === item.id.replace("stock_", "")) 
                      : (activeTab === item.id);

                    return (
                      <button 
                        key={item.id}
                        onClick={() => {
                          if (item.id.startsWith("stock_")) {
                            setActiveTab("stock_center");
                            setStockSubTab(item.id.replace("stock_", ""));
                          } else {
                            setActiveTab(item.id as any);
                          }
                          setMobileSidebarOpen(false);
                          setSearchQuery("");
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                          isActive ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 text-xs text-slate-300">
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold">
                      {user?.name ? user.name.charAt(0) : "A"}
                    </div>
                    <div className="truncate">
                      <span className="block font-bold truncate">{user?.name}</span>
                      <span className="block text-[10px] text-slate-500 truncate">{user?.email}</span>
                    </div>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-300 py-2 rounded-lg text-xs font-bold transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Desconectar</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MOBILE NAVIGATION TABS RAIL (Quick Swipeable bar) */}
        <div className="lg:hidden bg-slate-900 text-white px-4 py-2 border-b border-slate-800 flex gap-2 overflow-x-auto scrollbar-none">
          {(isSuperAdmin ? [
            { id: "superadmin_dash", label: "Dashboard" },
            { id: "superadmin_companies", label: "Empresas" },
            { id: "superadmin_company_admins", label: "Admins das Empresas" },
            { id: "superadmin_users", label: "Usuários" },
            { id: "superadmin_plans", label: "Planos" },
            { id: "superadmin_payments", label: "Assinaturas" },
            { id: "superadmin_modules", label: "Módulos" },
            { id: "superadmin_logs", label: "Logs" },
            { id: "superadmin_system", label: "Plataforma" }
          ] : [
            { id: "overview", label: "Painel", permission: "view_stats" },
            { id: "caixa", label: "Caixa (PDV)", permission: "create_sales" },
            { id: "products", label: "Produtos", permission: "view_products" },
            { id: "sales", label: "Vendas", permission: "view_sales" },
            { id: "clients", label: "Clientes", permission: "view_clients" },
            { id: "finance", label: "Financeiro", permission: "view_sales" },
            { id: "reports", label: "Relatórios", permission: "view_stats" },
            { id: "ai_assistant", label: "Gestor IA", permission: "view_stats" },
            { id: "employees", label: "Funcionários", permission: "manage_users" },
            { id: "users_permissions", label: "Usuários e Permissões", adminOnly: true },
            { id: "settings", label: "Ajustes", permission: "manage_users" },
            { id: "profile", label: "Perfil" },
            { id: "plans", label: "Planos" },
            { id: "support", label: "Suporte" }
          ]).filter((tab: any) => {
            if (tab.id === "caixa" || tab.id === "sales") {
              return isModuleActive("use_pdv");
            }
            if (tab.id === "products") {
              return isModuleActive("products");
            }
            if (tab.id === "stock_center" || tab.id === "inventory") {
              return isModuleActive("stock");
            }
            if (tab.id === "clients") {
              return isModuleActive("clients");
            }
            if (tab.id === "finance") {
              return isModuleActive("finance");
            }
            if (tab.id === "reports") {
              return isModuleActive("reports");
            }
            if (tab.id === "ai_assistant") {
              return isModuleActive("ai_assistant");
            }
            if (tab.id === "employees" || tab.id === "users_permissions") {
              return isModuleActive("multi_users");
            }
            return true;
          }).map((tab) => {
            if (tab.permission && !hasPermission(tab.permission)) return null;
            if ((tab.id === "plans" || tab.id === "support") && user?.role === "user") return null;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setSearchQuery(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex-shrink-0 transition-colors ${
                  isActive ? "bg-emerald-600 text-white" : "text-slate-400"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* MAIN BODY WRAPPER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">

          {/* Loading Indicator */}
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
              <svg className="animate-spin h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm font-semibold text-slate-500">Sincronizando com Meu Gestor...</span>
            </div>
          ) : !isAllowedTab ? (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto text-center py-16 px-6 bg-white border border-rose-100 rounded-3xl shadow-xl space-y-6 mt-10"
              id="acesso-negado-block"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-slate-900">Acesso Negado</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Acesso Negado. Você não tem permissão para acessar esta tela ({requiredPermissionForTab}).
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                As credenciais de acesso corporativo são gerenciadas pelo administrador em <span className="font-bold">Usuários e Permissões</span>.
              </div>
              <button
                id="btn-back-safe-area"
                onClick={() => {
                  const allowedTabs = Object.keys(tabPermissions).filter(t => hasPermission(tabPermissions[t]));
                  if (allowedTabs.length > 0) {
                    setActiveTab(allowedTabs[0] as any);
                  } else {
                    setActiveTab("profile" as any);
                  }
                }}
                className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer shadow-md"
              >
                Voltar para área segura
              </button>
            </motion.div>
          ) : (
            <>
              {/* SMART TICKER INFO BAR (La caixa branca abaixo do menu) */}
              <div id="barra_informacao_ticker" className="w-full bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-3 overflow-hidden select-none">
                {/* Active green indicator on the left */}
                <div className="w-2.5 h-6 bg-emerald-500 rounded-full flex-shrink-0 animate-pulse"></div>
                
                {/* Ticker marquee container */}
                <div className="flex-1 min-w-0 overflow-hidden">
                  <Ticker 
                    products={allProducts}
                    transactions={transactions}
                    tickerConfig={companySettings?.tickerConfig || {}}
                    token={token}
                  />
                </div>
              </div>

              {/* Welcome/Header block conditional on activeTab */}
              {activeTab === "overview" ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                      Bem-vindo ao Meu Gestor.
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                      Olá, <span className="font-bold text-slate-700">{user?.name}</span>! O sistema está operando normalmente para <span className="font-bold text-slate-700">{company?.name}</span>.
                    </p>
                  </div>
                  
                  {/* Global quick action buttons */}
                  <div className="flex flex-wrap gap-2.5">
                    <button 
                      onClick={() => setSaleModalOpen(true)}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Nova Venda
                    </button>
                    <button 
                      onClick={() => setProductModalOpen(true)}
                      className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Novo Produto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-emerald-600 rounded-full"></div>
                    <h1 className="text-sm font-extrabold tracking-tight text-slate-800 uppercase">
                      {activeTab === "caixa" && "Frente de Caixa (PDV)"}
                      {activeTab === "products" && "Gerenciamento de Produtos"}
                      {activeTab === "inventory" && "Controle de Estoque"}
                      {activeTab === "stock_center" && "Módulo Exclusivo de Estoque"}
                      {activeTab === "sales" && "Lançamento de Vendas"}
                      {activeTab === "clients" && "Gestão de Clientes"}
                      {activeTab === "finance" && "Controle Financeiro"}
                      {activeTab === "reports" && "Relatórios de Desempenho"}
                      {activeTab === "ai_assistant" && "Assistente IA Inteligente"}
                      {activeTab === "employees" && "Funcionários"}
                      {activeTab === "users_permissions" && "Usuários e Permissões"}
                      {activeTab === "settings" && "Configurações do Sistema"}
                      {activeTab === "profile" && "Perfil do Usuário"}
                      {activeTab === "plans" && "Planos de Assinatura"}
                      {activeTab === "support" && "Suporte Técnico"}
                    </h1>
                  </div>
                  
                  {/* Voltar button on sub-pages */}
                  <button
                    onClick={() => { setActiveTab("overview"); setSearchQuery(""); }}
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer shadow"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Voltar para o Dashboard
                  </button>
                </div>
              )}


              {/* ==========================================
                  TAB 1: OVERVIEW PANEL
              ========================================== */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  
                  {/* SIX METRIC BENTO CARDS */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Card 1: Faturamento */}
                    <div id="card-faturamento" className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faturamento</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <DollarSign className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="block text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">
                          {formatCurrency(stats?.billing)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                          <span>▲ +14.2%</span>
                          <span className="text-slate-400 font-normal">vs. mês anterior</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Lucro */}
                    <div id="card-lucro" className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lucro Líquido</span>
                        <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="block text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">
                          {formatCurrency(stats?.profit)}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                          <span>▲ +8.5%</span>
                          <span className="text-slate-400 font-normal">margem saudável</span>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Produtos */}
                    <div id="card-produtos" className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produtos</span>
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Package className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="block text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">
                          {stats?.productsCount || 0}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Tipos de produtos cadastrados
                        </span>
                      </div>
                    </div>

                    {/* Card 4: Clientes */}
                    <div id="card-clientes" className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes</span>
                        <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                          <Users className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="block text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">
                          {stats?.clientsCount || 0}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Contatos ativos na base
                        </span>
                      </div>
                    </div>

                    {/* Card 5: Vendas */}
                    <div id="card-vendas" className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vendas</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="block text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">
                          {stats?.salesCount || 0}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          Vendas realizadas e registradas
                        </span>
                      </div>
                    </div>

                    {/* Card 6: Estoque */}
                    <div id="card-estoque" className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estoque Total</span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          productsLowStock.length > 0 ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          <Sliders className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <span className="block text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">
                          {stats?.stockCount || 0} <span className="text-xs font-normal text-slate-400">unid.</span>
                        </span>
                        <div className="flex items-center gap-1 text-[10px]">
                          {productsLowStock.length > 0 ? (
                            <span className="text-amber-600 font-bold flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> {productsLowStock.length} crítico
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-bold">● Equilibrado</span>
                          )}
                          <span className="text-slate-400 font-normal">| {formatCurrency(stats?.stockValue)}</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* GRID WORKSPACE: LOW STOCK WARNINGS & RECENT SALES */}
                  <div className="grid lg:grid-cols-12 gap-6">
                    
                    {/* Left: Recent Sales */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900">Histórico de Vendas Recentes</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Últimos lançamentos de faturamento da empresa.</p>
                        </div>
                        <button 
                          onClick={() => setActiveTab("sales")}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
                        >
                          Ver todas <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {recentSales.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm space-y-2">
                          <ShoppingBag className="w-8 h-8 text-slate-200 mx-auto" />
                          <p className="font-bold text-slate-600">Você ainda não possui vendas registradas.</p>
                          <p className="text-xs">Registre uma nova venda para começar.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 flex-1">
                          {recentSales.map((sale) => (
                            <div key={sale.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                                  <FileText className="w-4.5 h-4.5" />
                                </div>
                                <div className="min-w-0">
                                  <span className="block text-sm font-bold text-slate-800 truncate">{sale.clientName}</span>
                                  <span className="block text-[10px] text-slate-400 font-mono">{new Date(sale.createdAt).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                                </div>
                              </div>
                              <div className="text-right space-y-1">
                                <span className="block text-sm font-extrabold text-slate-900">{formatCurrency(sale.total)}</span>
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                  sale.status === "completed" 
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                    : "bg-amber-50 text-amber-700 border border-amber-100"
                                }`}>
                                  {sale.status === "completed" ? "Concluída" : "Pendente"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right: Low Stock Warnings */}
                    <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-5 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900">Alertas de Reposição</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Estoque no limite crítico ou zerado.</p>
                      </div>

                      {allProducts.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm space-y-2 flex-1 flex flex-col justify-center items-center">
                          <AlertTriangle className="w-10 h-10 text-amber-500 bg-amber-50 rounded-full p-2 mb-2" />
                          <p className="font-bold text-slate-800">Seu estoque está vazio.</p>
                          <p className="text-xs">Cadastre seu primeiro produto para iniciar o controle de estoque.</p>
                        </div>
                      ) : productsLowStock.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm space-y-2 flex-1 flex flex-col justify-center items-center">
                          <Check className="w-10 h-10 text-emerald-500 bg-emerald-50 rounded-full p-2 mb-2" />
                          <p className="font-bold text-slate-800">Tudo em ordem!</p>
                          <p className="text-xs">Todos os produtos possuem níveis de estoque seguros.</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-100 flex-1">
                          {productsLowStock.map((prod) => (
                            <div key={prod.id} className="p-4 flex items-center justify-between bg-amber-50/20">
                              <div className="min-w-0 pr-2">
                                <span className="block text-xs font-bold text-slate-800 truncate">{prod.name}</span>
                                <span className="block text-[9px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="block text-xs font-extrabold text-rose-600">{prod.stock} em estoque</span>
                                <span className="block text-[9px] text-slate-400">Mínimo: {prod.minStock}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}


              {/* ==========================================
                  TAB 1.1: INTEGRATED CASH REGISTER (PDV)
              ========================================== */}
              {activeTab === "caixa" && (
                <CaixaView 
                  token={token}
                  user={user}
                  company={company}
                  allProducts={allProducts}
                  allClients={allClients}
                  onSaleComplete={() => fetchData(true)}
                  allowNegativeStock={companySettings.allowNegativeStock === true}
                  transactions={transactions}
                  setTransactions={setTransactions}
                />
              )}

              {/* ==========================================
                  TAB 1.2: INTEGRATED INVENTORY CONTROL (ALMOXARIFADO)
              ========================================== */}
              {activeTab === "inventory" && (
                <InventoryView 
                  token={token}
                  user={user}
                  company={company}
                  allProducts={allProducts}
                  onInventoryUpdate={() => fetchData(true)}
                  showToast={showToast}
                />
              )}


              {/* ==========================================
                  TAB 1.3: EXCLUSIVE STOCK CENTER (CENTRO DE ESTOQUE)
              ========================================== */}
              {activeTab === "stock_center" && (
                <StockCenterView 
                  token={token}
                  user={user}
                  company={company}
                  allProducts={allProducts}
                  onProductsUpdate={() => fetchData(true)}
                  showToast={showToast}
                  initialTab={stockSubTab}
                />
              )}


              {/* ==========================================
                  TAB 2: PRODUCTS MANAGER
              ========================================== */}
              {activeTab === "products" && (
                <div className="space-y-4">
                  
                  {/* Top Bar actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                    
                    {/* Search and Category filter */}
                    <div className="flex flex-1 gap-2">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Buscar produto por nome ou SKU..."
                          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-700"
                      >
                        <option value="all">Todas Categorias</option>
                        {productCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={() => setProductModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/10"
                    >
                      + Novo Produto
                    </button>
                  </div>

                  {/* Products Table view */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-visible">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="p-4 w-16">Foto</th>
                            <th className="p-4">Nome</th>
                            <th className="p-4 font-mono">Cód. Barras</th>
                            <th className="p-4 font-mono">SKU</th>
                            <th className="p-4">Categoria</th>
                            <th className="p-4 text-right">Preço Custo</th>
                            <th className="p-4 text-right">Preço Venda</th>
                            <th className="p-4 text-center">Qtd</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Nível</th>
                            <th className="p-4 text-center w-32">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {allProducts.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="p-12 text-center text-slate-400">
                                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="font-extrabold text-slate-700 text-base">Você ainda não possui produtos cadastrados.</p>
                                <p className="text-sm text-slate-400 mt-1 mb-4">Clique em 'Novo Produto' para começar.</p>
                                <button
                                  onClick={() => setProductModalOpen(true)}
                                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                                >
                                  <Plus className="w-4 h-4" /> Novo Produto
                                </button>
                              </td>
                            </tr>
                          ) : filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan={11} className="p-8 text-center text-slate-400">
                                <Package className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                Nenhum produto corresponde aos filtros ou busca.
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map((prod) => (
                              <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4">
                                  {prod.image ? (
                                    <img 
                                      src={prod.image} 
                                      alt={prod.name} 
                                      referrerPolicy="no-referrer"
                                      className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                                      <Package className="w-5 h-5" />
                                    </div>
                                  )}
                                </td>
                                <td className="p-4 font-bold text-slate-800">
                                  {prod.name}
                                </td>
                                <td className="p-4 font-mono text-xs text-slate-500">
                                  {prod.barcode || "-"}
                                </td>
                                <td className="p-4 font-mono text-xs text-slate-500">
                                  {prod.sku}
                                </td>
                                <td className="p-4">
                                  <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">
                                    {prod.category}
                                  </span>
                                </td>
                                <td className="p-4 text-right font-mono text-slate-500">{formatCurrency(prod.costPrice)}</td>
                                <td className="p-4 text-right font-mono font-bold text-slate-900">{formatCurrency(prod.price)}</td>
                                <td className="p-4 text-center font-mono font-bold">{prod.stock}</td>
                                <td className="p-4 text-center">
                                  {prod.status === "inactive" ? (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                      Inativo
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                      Ativo
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  {prod.stock <= prod.minStock ? (
                                    <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                                      Reposição
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                      Estável
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-center relative overflow-visible">
                                  <div className="relative inline-block text-left">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveProductDropdown(activeProductDropdown === prod.id ? null : prod.id);
                                      }}
                                      className="inline-flex justify-center items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-slate-200/50"
                                    >
                                      <span>Ações</span>
                                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                                    </button>
                                    
                                    {activeProductDropdown === prod.id && (
                                      <>
                                        <div 
                                          className="fixed inset-0 z-10" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveProductDropdown(null);
                                          }}
                                        />
                                        <div className="absolute right-0 mt-1 w-52 rounded-xl bg-white border border-slate-200 shadow-xl z-20 overflow-hidden py-1.5">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveProductDropdown(null);
                                              setViewingProduct(prod);
                                            }}
                                            className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Eye className="w-3.5 h-3.5 text-sky-500" />
                                            <span>👁 Visualizar</span>
                                          </button>
                                          
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveProductDropdown(null);
                                              setEditingProduct(prod);
                                              setNewProduct({
                                                name: prod.name,
                                                sku: prod.sku,
                                                price: String(prod.price),
                                                costPrice: String(prod.costPrice),
                                                stock: String(prod.stock),
                                                minStock: String(prod.minStock),
                                                category: prod.category,
                                                barcode: prod.barcode || "",
                                                image: prod.image || "",
                                                unidade: prod.unidade || "Unidade",
                                                marca: prod.marca || "",
                                                supplier: prod.supplier || prod.fornecedor || "",
                                                location: prod.location || "",
                                                descricao: prod.descricao || "",
                                                status: prod.status || "active"
                                              });
                                              setProductModalOpen(true);
                                            }}
                                            className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Edit className="w-3.5 h-3.5 text-amber-500" />
                                            <span>✏ Editar</span>
                                          </button>
                                          
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveProductDropdown(null);
                                              // Pre-fill fields for duplication
                                              setEditingProduct(null);
                                              setNewProduct({
                                                name: prod.name + " (Cópia)",
                                                sku: prod.sku + "-COPIA",
                                                price: String(prod.price),
                                                costPrice: String(prod.costPrice),
                                                stock: String(prod.stock),
                                                minStock: String(prod.minStock),
                                                category: prod.category,
                                                barcode: "", // Clear barcode for copied product to prevent duplicates
                                                image: prod.image || "",
                                                unidade: prod.unidade || "Unidade",
                                                marca: prod.marca || "",
                                                supplier: prod.supplier || prod.fornecedor || "",
                                                location: prod.location || "",
                                                descricao: prod.descricao || "",
                                                status: prod.status || "active"
                                              });
                                              setProductModalOpen(true);
                                            }}
                                            className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                                            <span>📄 Duplicar</span>
                                          </button>
                                          
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveProductDropdown(null);
                                              setQuickStockMovementProd(prod);
                                            }}
                                            className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-500" />
                                            <span>📦 Movimentar Estoque</span>
                                          </button>
                                          
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveProductDropdown(null);
                                              setConfiguringProduct(prod);
                                            }}
                                            className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                          >
                                            <Settings className="w-3.5 h-3.5 text-indigo-500" />
                                            <span>⚙ Configurar</span>
                                          </button>
                                          
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveProductDropdown(null);
                                              handleDeleteProduct(prod.id);
                                            }}
                                            className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 cursor-pointer font-semibold"
                                          >
                                            <Trash className="w-3.5 h-3.5 text-red-500" />
                                            <span>🗑 Excluir</span>
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}


              {/* ==========================================
                  TAB 3: SALES MANAGER
              ========================================== */}
              {activeTab === "sales" && (
                <div className="space-y-4">
                  
                  {/* Top Bar actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                    
                    {/* Search and Category filter */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar vendas por nome do cliente..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <button 
                      onClick={() => setSaleModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Registrar Nova Venda
                    </button>
                  </div>

                  {/* Sales Table view */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="p-4">Identificador</th>
                            <th className="p-4">Cliente / Comprador</th>
                            <th className="p-4">Itens</th>
                            <th className="p-4 text-right">Lucro Estimado</th>
                            <th className="p-4 text-right">Valor Total</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Data Lançamento</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {allSales.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-12 text-center text-slate-400">
                                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="font-extrabold text-slate-700 text-base">Você ainda não possui vendas registradas.</p>
                                <p className="text-sm text-slate-400 mt-1 mb-4">Lançar vendas permite gerar faturamento, calcular margens de lucro e atualizar o estoque.</p>
                                <button
                                  onClick={() => setSaleModalOpen(true)}
                                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                                >
                                  <Plus className="w-4 h-4" /> Registrar Nova Venda
                                </button>
                              </td>
                            </tr>
                          ) : filteredSales.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400">
                                <ShoppingBag className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                Nenhuma venda correspondente aos filtros de busca.
                              </td>
                            </tr>
                          ) : (
                            filteredSales.map((sale) => (
                              <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-mono text-xs font-bold text-slate-500 uppercase">
                                  #{sale.id.slice(-6)}
                                </td>
                                <td className="p-4 font-bold text-slate-800">
                                  {sale.clientName}
                                </td>
                                <td className="p-4">
                                  <span className="font-semibold text-slate-700">{sale.itemsCount}x</span> unid.
                                </td>
                                <td className="p-4 text-right font-mono text-emerald-600 font-semibold">{formatCurrency(sale.profit)}</td>
                                <td className="p-4 text-right font-mono font-extrabold text-slate-900">{formatCurrency(sale.total)}</td>
                                <td className="p-4 text-center">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                    sale.status === "completed" 
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                      : "bg-amber-50 text-amber-700 border border-amber-100"
                                  }`}>
                                    {sale.status === "completed" ? "Concluída" : "Pendente"}
                                  </span>
                                </td>
                                <td className="p-4 text-center text-slate-400 text-xs">
                                  {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}


              {/* ==========================================
                  TAB 4: CLIENTS MANAGER
              ========================================== */}
              {activeTab === "clients" && (
                <div className="space-y-4">
                  
                  {/* Top Bar actions */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                    
                    {/* Search and Category filter */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar por nome, email ou CPF/CNPJ..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <button 
                      onClick={() => setClientModalOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Cadastrar Novo Cliente
                    </button>
                  </div>

                  {/* Clients Table view */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="p-4">Nome Razão Social</th>
                            <th className="p-4">Documento</th>
                            <th className="p-4">E-mail de Contato</th>
                            <th className="p-4">Telefone</th>
                            <th className="p-4">Localização</th>
                            <th className="p-4 text-center">Cadastro</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {allClients.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-12 text-center text-slate-400">
                                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="font-extrabold text-slate-700 text-base">Você ainda não possui clientes cadastrados.</p>
                                <p className="text-sm text-slate-400 mt-1 mb-4">Cadastre seu primeiro cliente.</p>
                                <button
                                  onClick={() => setClientModalOpen(true)}
                                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                                >
                                  <Plus className="w-4 h-4" /> Cadastrar Novo Cliente
                                </button>
                              </td>
                            </tr>
                          ) : filteredClients.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-400">
                                <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                Nenhum cliente corresponde aos critérios informados.
                              </td>
                            </tr>
                          ) : (
                            filteredClients.map((cli) => (
                              <tr key={cli.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-bold text-slate-800">
                                  {cli.name}
                                </td>
                                <td className="p-4 font-mono text-xs text-slate-600">{cli.document || "Não cadastrado"}</td>
                                <td className="p-4 text-slate-600">
                                  {cli.email || "Sem e-mail"}
                                </td>
                                <td className="p-4 text-slate-600 font-mono text-xs">{cli.phone || "Sem telefone"}</td>
                                <td className="p-4 text-slate-700">
                                  {cli.city ? `${cli.city} - ${cli.state}` : "Geral"}
                                </td>
                                <td className="p-4 text-center text-slate-400 text-xs">
                                  {new Date(cli.createdAt).toLocaleDateString("pt-BR")}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* ==========================================
                  TAB 5: EMPLOYEES (MÓDULO 1 - FUNCIONÁRIOS)
              ========================================== */}
              {activeTab === "employees" && hasPermission("manage_users") && (
                <div className="space-y-6">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">Fichas de Funcionários</h2>
                      <p className="text-xs text-slate-500">Cadastre e gerencie a ficha completa de funcionários da empresa.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTeamUser(null);
                        setNewTeamUser({
                          name: "",
                          email: "",
                          phone: "",
                          role: "user",
                          roleId: "",
                          password: "",
                          confirmPassword: "",
                          username: "",
                          cargo: "",
                          status: "active",
                          photo: "",
                          cpf: "",
                          admissaoDate: new Date().toISOString().split("T")[0],
                          observacoes: "",
                          hasAccess: false,
                          setor: ""
                        });
                        setTeamUserModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Novo Funcionário
                    </button>
                  </div>

                  {/* Filter & Search Bar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:max-w-xs">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </span>
                      <input
                        type="text"
                        value={teamSearchQuery}
                        onChange={(e) => setTeamSearchQuery(e.target.value)}
                        placeholder="Buscar funcionário..."
                        className="w-full pl-9 pr-4 py-2 text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                      />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => setTeamFilterStatus("all")}
                        className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          teamFilterStatus === "all" ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => setTeamFilterStatus("active")}
                        className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          teamFilterStatus === "active" ? "bg-emerald-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Ativos
                      </button>
                      <button
                        onClick={() => setTeamFilterStatus("inactive")}
                        className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          teamFilterStatus === "inactive" ? "bg-rose-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Inativos
                      </button>
                    </div>
                  </div>

                  {/* Employees Table */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="p-4">Colaborador</th>
                            <th className="p-4">Cargo / Setor</th>
                            <th className="p-4">CPF</th>
                            <th className="p-4">Contato</th>
                            <th className="p-4">Data Admissão</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {filteredTeamUsers.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-8 text-center text-slate-400">
                                Nenhum funcionário cadastrado com esses filtros.
                              </td>
                            </tr>
                          ) : (
                            filteredTeamUsers.map((member) => (
                              <tr key={member.id} className="hover:bg-slate-50/30 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    {member.photo ? (
                                      <img 
                                        src={member.photo} 
                                        alt={member.name}
                                        referrerPolicy="no-referrer"
                                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-shrink-0 bg-emerald-100 text-emerald-800">
                                        {member.name.substring(0, 2)}
                                      </div>
                                    )}
                                    <div>
                                      <span className="block font-bold text-slate-900">{member.name} {member.id === user.id && "(Você)"}</span>
                                      <span className="block text-xs text-slate-400">{member.email || "Sem e-mail"}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-0.5">
                                    <span className="block font-semibold text-slate-700">{member.cargo || "Não definido"}</span>
                                    {member.setor && <span className="block text-[10px] text-slate-400 font-semibold uppercase">{member.setor}</span>}
                                  </div>
                                </td>
                                <td className="p-4 text-xs text-slate-500 font-mono">
                                  {member.cpf || "Não informado"}
                                </td>
                                <td className="p-4 text-xs text-slate-500 font-mono">
                                  {member.phone || "Não cadastrado"}
                                </td>
                                <td className="p-4 text-xs text-slate-500">
                                  {member.admissaoDate ? new Date(member.admissaoDate).toLocaleDateString("pt-BR") : "Não cadastrada"}
                                </td>
                                <td className="p-4">
                                  {member.status === "inactive" ? (
                                    <span className="inline-flex items-center text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">🔴 Inativo</span>
                                  ) : (
                                    <span className="inline-flex items-center text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">🟢 Ativo</span>
                                  )}
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => startEditTeamUser(member)}
                                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                      title="Editar Funcionário"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    {member.id !== user.id && (
                                      <button
                                        onClick={() => handleDeleteTeamUser(member.id)}
                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                        title="Excluir Funcionário"
                                      >
                                        <Trash className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================
                  TAB 5.5: USERS & PERMISSIONS (MÓDULO 2 - USUÁRIOS E PERMISSÕES)
              ========================================== */}
              {activeTab === "users_permissions" && (user?.role === "admin" || user?.role === "superadmin") && (
                <div className="space-y-6">
                  
                  {/* Two columns bento layout */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    
                    {/* Panel Left: System Access Users (7 cols) */}
                    <div className="xl:col-span-7 space-y-4">
                      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                        <div>
                          <h2 className="text-lg font-bold text-slate-950">Usuários e Permissões</h2>
                          <p className="text-xs text-slate-500">Crie e configure credenciais de login para funcionários cadastrados.</p>
                        </div>
                        <button
                          onClick={() => {
                            setEditingUserAccess(null);
                            setSelectedAccessEmployeeId("");
                            setNewUserAccess({
                              username: "",
                              password: "",
                              confirmPassword: "",
                              role: "user",
                              roleId: `role_gerente_${company?.id}`,
                              status: "active"
                            });
                            setUserAccessModalOpen(true);
                          }}
                          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-md cursor-pointer"
                        >
                          <Plus className="w-4 h-4" /> Novo Usuário
                        </button>
                      </div>

                      {/* Filter Search */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-7 pointer-events-none">
                          <Search className="h-4 w-4 text-slate-400" />
                        </span>
                        <input
                          type="text"
                          value={teamSearchQuery}
                          onChange={(e) => setTeamSearchQuery(e.target.value)}
                          placeholder="Buscar usuário cadastrado..."
                          className="w-full pl-9 pr-4 py-2 text-sm text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                        />
                      </div>

                      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="p-4 w-12 text-center">Foto</th>
                                <th className="p-4">Nome</th>
                                <th className="p-4">Cargo</th>
                                <th className="p-4">Usuário</th>
                                <th className="p-4">Perfil</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Último Login</th>
                                <th className="p-4 text-center">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                              {teamUsers.filter(u => u.hasAccess === true).filter(u => !teamSearchQuery || u.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) || u.username?.toLowerCase().includes(teamSearchQuery.toLowerCase())).length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="p-8 text-center text-slate-400">
                                    Nenhum usuário de acesso cadastrado com estes termos.
                                  </td>
                                </tr>
                              ) : (
                                teamUsers.filter(u => u.hasAccess === true).filter(u => !teamSearchQuery || u.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) || u.username?.toLowerCase().includes(teamSearchQuery.toLowerCase())).map((member) => {
                                  const associatedRole = customRoles.find(r => r.id === member.roleId);
                                  return (
                                    <tr key={member.id} className="hover:bg-slate-50/30 transition-colors">
                                      <td className="p-4 text-center">
                                        {member.photo ? (
                                          <img 
                                            src={member.photo} 
                                            alt={member.name}
                                            referrerPolicy="no-referrer"
                                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm mx-auto"
                                          />
                                        ) : (
                                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold uppercase mx-auto bg-indigo-100 text-indigo-800">
                                            {member.name.substring(0, 2)}
                                          </div>
                                        )}
                                      </td>
                                      <td className="p-4 font-semibold text-slate-900">
                                        {member.name} {member.id === user.id && <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal ml-1">(Você)</span>}
                                      </td>
                                      <td className="p-4 text-slate-600">
                                        {member.cargo || "Funcionário"}
                                      </td>
                                      <td className="p-4 font-mono text-xs text-indigo-600 font-bold">
                                        @{member.username}
                                      </td>
                                      <td className="p-4">
                                        {member.role === "admin" ? (
                                          <span className="inline-flex items-center text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
                                            Administrador
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase">
                                            {associatedRole ? associatedRole.name : "Operador"}
                                          </span>
                                        )}
                                      </td>
                                      <td className="p-4">
                                        {member.status === "inactive" ? (
                                          <span className="inline-flex items-center text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">🔴 Bloqueado</span>
                                        ) : (
                                          <span className="inline-flex items-center text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">🟢 Ativo</span>
                                        )}
                                      </td>
                                      <td className="p-4 text-xs text-slate-500">
                                        {member.lastLogin ? (
                                          (() => {
                                            try {
                                              const date = new Date(member.lastLogin);
                                              return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
                                            } catch {
                                              return member.lastLogin;
                                            }
                                          })()
                                        ) : (
                                          "Nunca"
                                        )}
                                      </td>
                                      <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                          {/* Editar */}
                                          <button
                                            onClick={() => {
                                              setEditingUserAccess(member);
                                              setSelectedAccessEmployeeId(member.id);
                                              setNewUserAccess({
                                                username: member.username || "",
                                                password: "",
                                                confirmPassword: "",
                                                role: member.role || "user",
                                                roleId: member.roleId || "",
                                                status: member.status || "active"
                                              });
                                              setUserAccessModalOpen(true);
                                            }}
                                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                            title="Editar Acesso"
                                          >
                                            <Sliders className="w-3.5 h-3.5" />
                                          </button>

                                          {/* Bloquear / Desbloquear */}
                                          <button
                                            onClick={() => handleToggleUserStatus(member)}
                                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                              member.status === "inactive" 
                                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600" 
                                                : "bg-amber-50 hover:bg-amber-100 text-amber-600"
                                            }`}
                                            title={member.status === "inactive" ? "Desbloquear Usuário" : "Bloquear Usuário"}
                                          >
                                            {member.status === "inactive" ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                                          </button>

                                          {/* Excluir Acesso (Revogar) */}
                                          {member.id !== user.id && (
                                            <button
                                              onClick={() => handleRevokeUserAccess(member)}
                                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                              title="Excluir Acesso (Revogar)"
                                            >
                                              <Trash className="w-3.5 h-3.5 text-rose-600" />
                                            </button>
                                          )}

                                          {/* Redefinir Senha */}
                                          <button
                                            onClick={() => {
                                              setRedefinePasswordUser(member);
                                              setRedefinePasswordValue("");
                                              setRedefinePasswordConfirmValue("");
                                              setRedefinePasswordOpen(true);
                                            }}
                                            className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors cursor-pointer"
                                            title="Redefinir Senha"
                                          >
                                            <Key className="w-3.5 h-3.5" />
                                          </button>

                                          {/* Permissões Personalizadas */}
                                          {member.role !== "admin" && member.role !== "superadmin" && (
                                            <button
                                              onClick={() => {
                                                setSelectedPermissionUserId(member.id);
                                                setSelectedPermissionUserPerms(member.permissions || []);
                                                setUserPermissionsModalOpen(true);
                                              }}
                                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors cursor-pointer"
                                              title="Permissões Personalizadas"
                                            >
                                              <Shield className="w-3.5 h-3.5" />
                                            </button>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Panel Right: Roles Checklist (5 cols) */}
                    <div className="xl:col-span-5 space-y-4">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                        <div>
                          <h2 className="text-lg font-bold text-slate-950">Telas por Perfil</h2>
                          <p className="text-xs text-slate-500">Marque quais telas cada perfil de acesso poderá visualizar no sistema.</p>
                        </div>

                        {/* Profile Selector tabs inside Right Panel */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase">Selecione o Perfil</label>
                          <select 
                            value={selectedPermissionRoleId}
                            onChange={(e) => {
                              const rId = e.target.value;
                              setSelectedPermissionRoleId(rId);
                              if (rId === "administrador") {
                                setSelectedPermissionRolePerms(permissions.map(p => p.id));
                              } else {
                                const matched = customRoles.find(role => role.id === rId);
                                setSelectedPermissionRolePerms(matched ? matched.permissions : []);
                              }
                            }}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 bg-white"
                          >
                            <option value="">Selecione um perfil...</option>
                            <option value="administrador">Administrador (Todos os acessos liberados)</option>
                            {customRoles.map(role => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                          </select>
                        </div>

                        {selectedPermissionRoleId ? (
                          <div className="space-y-4 border-t border-slate-100 pt-4">
                            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Telas & Permissões Liberadas</h3>
                            
                            <div className="space-y-3">
                              {[
                                { id: "view_stats", name: "📊 Dashboard (Painel Geral)", desc: "Métricas, indicadores de desempenho e gráficos de receita." },
                                { id: "create_sales", name: "🛒 Frente de Caixa (PDV)", desc: "Abertura de caixa e lançamento de novas vendas de produtos." },
                                { id: "view_products", name: "📦 Catálogo de Produtos & Estoque", desc: "Acesso à lista e fichas de produtos em estoque." },
                                { id: "edit_products", name: "✏️ Modificar Estoque & Produtos", desc: "Permissão para dar entrada/saída de itens e cadastrar novos produtos." },
                                { id: "view_sales", name: "🧾 Vendas & Financeiro", desc: "Histórico completo de transações e controle financeiro." },
                                { id: "view_clients", name: "👥 Gestão de Clientes", desc: "Lista de clientes e histórico de compras." },
                                { id: "manage_users", name: "🔐 Funcionários e Permissões", desc: "Gerenciamento da equipe (Disponível apenas para Administradores por padrão)" }
                              ].map(item => {
                                const isChecked = selectedPermissionRoleId === "administrador" || selectedPermissionRolePerms.includes(item.id);
                                return (
                                  <label key={item.id} className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                                    <input 
                                      type="checkbox" 
                                      disabled={selectedPermissionRoleId === "administrador"}
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedPermissionRolePerms([...selectedPermissionRolePerms, item.id]);
                                        } else {
                                          setSelectedPermissionRolePerms(selectedPermissionRolePerms.filter(id => id !== item.id));
                                        }
                                      }}
                                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 disabled:opacity-50"
                                    />
                                    <div>
                                      <span className="block text-xs font-bold text-slate-800">{item.name}</span>
                                      <span className="block text-[10px] text-slate-500 leading-normal">{item.desc}</span>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>

                            {selectedPermissionRoleId !== "administrador" && (
                              <button
                                type="button"
                                onClick={() => handleSaveRolePermissions(selectedPermissionRoleId, selectedPermissionRolePerms)}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10"
                              >
                                Salvar Permissões do Perfil
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="p-6 text-center text-slate-400 text-xs italic">
                            Selecione um perfil acima para visualizar e marcar as telas liberadas.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* ==========================================
                  TAB 6: FINANCE MODULE
              ========================================== */}
              {activeTab === "finance" && (
                <div className="space-y-6">
                  {financeSubView === "list" ? (
                    <>
                      {/* KPI Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase">Saldo Consolidado</span>
                          <span className="text-2xl font-extrabold text-slate-900 mt-2">
                            {formatCurrency(
                              transactions.reduce((acc, tx) => acc + (tx.type === "income" ? tx.amount : -tx.amount), 0)
                            )}
                          </span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase">Total Receitas</span>
                          <span className="text-2xl font-extrabold text-emerald-600 mt-2">
                            {formatCurrency(
                              transactions.filter(t => t.type === "income").reduce((acc, tx) => acc + tx.amount, 0)
                            )}
                          </span>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase">Total Despesas</span>
                          <span className="text-2xl font-extrabold text-rose-600 mt-2">
                            {formatCurrency(
                              transactions.filter(t => t.type === "expense").reduce((acc, tx) => acc + tx.amount, 0)
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Header controls */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
                        <div className="flex flex-1 max-w-md relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar transações..."
                            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          <button 
                            onClick={() => {
                              const csvContent = "data:text/csv;charset=utf-8,ID,Descricao,Tipo,Categoria,Valor,Data,Status\n" + 
                                transactions.map(t => `${t.id},"${t.description}",${t.type},${t.category},${t.amount},${t.date},${t.status}`).join("\n");
                              const encodedUri = encodeURI(csvContent);
                              const link = document.createElement("a");
                              link.setAttribute("href", encodedUri);
                              link.setAttribute("download", `extrato_meugestor_${new Date().toISOString().slice(0, 10)}.csv`);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              showToast("Extrato exportado com sucesso!");
                            }}
                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            <Download className="w-4 h-4" /> Exportar CSV
                          </button>
                          <button 
                            onClick={() => setFinanceSubView("new")}
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            <Plus className="w-4 h-4" /> Novo Lançamento
                          </button>
                        </div>
                      </div>

                      {/* Ledger transactions list */}
                      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="p-4">Data / ID</th>
                                <th className="p-4">Descrição</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Valor</th>
                                <th className="p-4 text-center">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                              {transactions.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-12 text-center text-slate-400">
                                    <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="font-extrabold text-slate-700 text-base">Você ainda não possui transações registradas.</p>
                                    <p className="text-sm text-slate-400 mt-1 mb-4">Clique em 'Novo Lançamento' para registrar sua primeira movimentação financeira.</p>
                                    <button
                                      onClick={() => setFinanceSubView("new")}
                                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                                    >
                                      <Plus className="w-4 h-4" /> Novo Lançamento
                                    </button>
                                  </td>
                                </tr>
                              ) : transactions.filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-400">
                                    Nenhuma transação correspondente à busca foi encontrada.
                                  </td>
                                </tr>
                              ) : (
                                transactions
                                  .filter(t => t.description.toLowerCase().includes(searchQuery.toLowerCase()))
                                  .map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="p-4 font-mono text-xs text-slate-400">
                                        {new Date(tx.date).toLocaleDateString("pt-BR")}<br />{tx.id}
                                      </td>
                                      <td className="p-4 font-bold text-slate-800">{tx.description}</td>
                                      <td className="p-4">
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-semibold">{tx.category}</span>
                                      </td>
                                      <td className="p-4 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          tx.status === "paid" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                        }`}>
                                          {tx.status === "paid" ? "Confirmado" : "Pendente"}
                                        </span>
                                      </td>
                                      <td className={`p-4 text-right font-bold font-mono ${tx.type === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                                        {tx.type === "income" ? "+ " : "- "} {formatCurrency(tx.amount)}
                                      </td>
                                      <td className="p-4 text-center">
                                        <button 
                                          onClick={() => {
                                            triggerConfirm("Deseja mesmo remover esta transação financeira do caixa?", async () => {
                                              try {
                                                const response = await fetch(`/api/transactions/${tx.id}`, {
                                                  method: "DELETE",
                                                  headers: { "Authorization": `Bearer ${token}` }
                                                });
                                                if (!response.ok) throw new Error("Erro ao excluir transação no servidor.");
                                                setTransactions(prev => prev.filter(t => t.id !== tx.id));
                                                showToast("Lançamento financeiro removido com sucesso!", "success");
                                                fetchData(true);
                                              } catch (err: any) {
                                                showToast(err.message || "Erro ao excluir transação", "error");
                                              }
                                            });
                                          }}
                                          className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                          title="Excluir"
                                        >
                                          <Trash className="w-4 h-4" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Finance Creation Form */
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setFinanceSubView("list")}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <div>
                            <h3 className="font-extrabold text-slate-900">Novo Lançamento no Caixa</h3>
                            <p className="text-xs text-slate-500">Adicione uma movimentação direta de receita ou despesa.</p>
                          </div>
                        </div>
                      </div>

                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const txVal = Number(newTransaction.amount);
                          if (!newTransaction.description || !txVal) {
                            showToast("Por favor, preencha todos os campos corretamente.", "error");
                            return;
                          }
                          try {
                            const response = await fetch("/api/transactions", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                description: newTransaction.description,
                                type: newTransaction.type,
                                category: newTransaction.category,
                                amount: txVal,
                                status: newTransaction.status
                              })
                            });
                            if (!response.ok) throw new Error("Erro ao salvar transação financeira no servidor.");
                            const resData = await response.json();
                            setTransactions(prev => [resData.transaction, ...prev]);
                            setNewTransaction({ description: "", type: "income", category: "Geral", amount: "", status: "paid" });
                            setFinanceSubView("list");
                            showToast("Movimentação financeira lançada com sucesso no banco de dados!", "success");
                            fetchData(true);
                          } catch (err: any) {
                            showToast(err.message || "Erro ao salvar transação", "error");
                          }
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl"
                      >
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-xs font-bold text-slate-700 uppercase">Descrição da Operação</label>
                          <input 
                            type="text"
                            required
                            value={newTransaction.description}
                            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            placeholder="Ex: Pagamento mensalidade licença software, etc"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase">Natureza do Fluxo</label>
                          <select 
                            value={newTransaction.type}
                            onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as any })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="income">Receita (Entrada)</option>
                            <option value="expense">Despesa (Saída)</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase">Categoria</label>
                          <select 
                            value={newTransaction.category}
                            onChange={(e) => setNewTransaction({ ...newTransaction, category: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="Vendas">Vendas</option>
                            <option value="Assinaturas">Assinaturas</option>
                            <option value="Marketing">Marketing</option>
                            <option value="TI / Servidores">TI / Servidores</option>
                            <option value="Infraestrutura">Infraestrutura</option>
                            <option value="Geral">Outras despesas</option>
                          </select>
                        </div>
                        <ValueInputField
                          id="transaction_amount"
                          label="Valor do Lançamento"
                          value={newTransaction.amount}
                          onChange={(val) => setNewTransaction({ ...newTransaction, amount: val })}
                          placeholder="1500.00"
                          required
                        />
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase">Situação de Pagamento</label>
                          <select 
                            value={newTransaction.status}
                            onChange={(e) => setNewTransaction({ ...newTransaction, status: e.target.value as any })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="paid">Confirmado (Pago / Recebido)</option>
                            <option value="pending">Pendente (A faturar)</option>
                          </select>
                        </div>
                        <div className="md:col-span-2 pt-4 flex gap-3">
                          <button 
                            type="submit"
                            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 cursor-pointer"
                          >
                            <Check className="w-4 h-4" /> Salvar Movimentação
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFinanceSubView("list")}
                            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* ==========================================
                  TAB 7: PERFORMANCE REPORTS
              ========================================== */}
              {activeTab === "reports" && (
                <div className="space-y-6">
                  
                  {/* Top Bar actions */}
                  <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Relatórios Estratégicos & BI</h3>
                      <p className="text-xs text-slate-500">Visualização gráfica do desempenho financeiro, margens de lucro e categorias.</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          window.print();
                        }}
                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                      >
                        <Printer className="w-4 h-4" /> Imprimir Relatório
                      </button>
                    </div>
                  </div>

                  {/* Business intelligence graphs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                      <h4 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wider">Histórico de Receitas vs Margem de Lucro</h4>
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={allSales.slice(-7)}>
                            <defs>
                              <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="clientName" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <ChartTooltip />
                            <Area type="monotone" dataKey="total" name="Faturamento" stroke="#10b981" fillOpacity={1} fill="url(#colorFaturamento)" />
                            <Area type="monotone" dataKey="profit" name="Lucro Estimado" stroke="#0ea5e9" fill="transparent" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                      <h4 className="font-bold text-sm text-slate-900 mb-4 uppercase tracking-wider">Distribuição Categorias Financeiras</h4>
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { name: "Vendas", total: transactions.filter(t=>t.category==="Vendas").reduce((a,b)=>a+b.amount, 0) },
                            { name: "Infra", total: transactions.filter(t=>t.category==="Infraestrutura").reduce((a,b)=>a+b.amount, 0) },
                            { name: "Servidores", total: transactions.filter(t=>t.category==="TI / Servidores").reduce((a,b)=>a+b.amount, 0) },
                            { name: "Mkt", total: transactions.filter(t=>t.category==="Marketing").reduce((a,b)=>a+b.amount, 0) },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <ChartTooltip />
                            <Bar dataKey="total" name="Movimentado (R$)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Top Selling Products list */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-900 mb-4 uppercase">Análise de Curva ABC de Produtos</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-slate-100 text-xs text-slate-500 font-bold uppercase pb-2">
                            <th className="py-2">Nome do Produto</th>
                            <th className="py-2">Estoque Disponível</th>
                            <th className="py-2 text-right">Margem Unitária</th>
                            <th className="py-2 text-center">Status Vendas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {allProducts.slice(0, 5).map(prod => (
                            <tr key={prod.id}>
                              <td className="py-3 font-semibold text-slate-800">{prod.name}</td>
                              <td className="py-3 font-mono">{prod.stock} un</td>
                              <td className="py-3 text-right font-mono font-bold text-slate-900">{formatCurrency(prod.price - prod.costPrice)}</td>
                              <td className="py-3 text-center">
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold">Alta Demanda</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================
                  TAB 8: SECURE AI ASSISTANT (GESTOR IA)
              ========================================== */}
              {activeTab === "ai_assistant" && (
                <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                  
                  {/* Assistant Header */}
                  <div className="p-4 bg-slate-900 text-white flex items-center gap-3 border-b border-slate-800">
                    <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Bot className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <span className="block font-extrabold text-sm text-white flex items-center gap-1.5">
                        Gestor IA <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-bold px-1 py-0.5 rounded">CONECTADO</span>
                      </span>
                      <span className="block text-[10px] text-slate-400">Análise cognitiva em tempo real conectada ao seu ERP Meu Gestor</span>
                    </div>
                    
                    <button 
                      onClick={() => setAiChatHistory([{ role: "model", content: "Chat resetado! Como posso ajudar você?" }])}
                      className="ml-auto text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      Limpar Chat
                    </button>
                  </div>

                  {/* Messages workspace scroll area */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                    {aiChatHistory.map((chat, i) => (
                      <div 
                        key={i}
                        className={`flex gap-3 max-w-3xl ${chat.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                          chat.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-900 text-white"
                        }`}>
                          {chat.role === "user" ? "Eu" : "IA"}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          chat.role === "user" 
                            ? "bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/10" 
                            : "bg-white text-slate-800 rounded-tl-none border border-slate-200/60 shadow-sm"
                        }`}>
                          <p className="whitespace-pre-wrap">{chat.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    {aiLoading && (
                      <div className="flex gap-3 max-w-3xl mr-auto">
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs animate-spin">
                          IA
                        </div>
                        <div className="bg-white text-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-200/60 shadow-sm flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-semibold animate-pulse">Gestor IA está analisando seus relatórios...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input box form */}
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!aiMessage.trim()) return;
                      const userMsg = aiMessage;
                      setAiChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
                      setAiMessage("");
                      setAiLoading(true);
                      try {
                        const response = await fetch("/api/ai/chat", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            message: userMsg,
                            history: aiChatHistory
                          })
                        });
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.error || "Erro no assistente.");
                        setAiChatHistory(prev => [...prev, { role: "model", content: data.reply }]);
                      } catch (err: any) {
                        showToast(err.message, "error");
                      } finally {
                        setAiLoading(false);
                      }
                    }}
                    className="p-3 border-t border-slate-200 bg-white flex gap-2 items-center"
                  >
                    <input 
                      type="text"
                      value={aiMessage}
                      onChange={(e) => setAiMessage(e.target.value)}
                      placeholder="Pergunte sobre estoque baixo, faturamento do mês ou peça dicas de vendas..."
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button 
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* ==========================================
                  TAB 9: COMPANY CONFIGURATIONS
              ========================================== */}
              {activeTab === "settings" && (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Configurações da Conta SaaS</h3>
                    <p className="text-xs text-slate-500">Mantenha os dados corporativos e de faturamento sincronizados para emissão de relatórios.</p>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        const response = await fetch("/api/company/settings", {
                          method: "PUT",
                          headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                          },
                          body: JSON.stringify(companySettings)
                        });
                        if (!response.ok) throw new Error("Erro ao salvar configurações no servidor.");
                        const resData = await response.json();
                        setCompanySettings(resData.settings);
                        showToast("Configurações da empresa salvas com sucesso no banco de dados!", "success");
                        fetchData(true);
                      } catch (err: any) {
                        showToast(err.message || "Erro ao salvar configurações", "error");
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Razão Social / Nome da Empresa</label>
                      <input 
                        type="text"
                        value={companySettings.name}
                        onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">CNPJ Comercial</label>
                      <input 
                        type="text"
                        value={companySettings.cnpj}
                        onChange={(e) => setCompanySettings({ ...companySettings, cnpj: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">E-mail Corporativo</label>
                      <input 
                        type="email"
                        value={companySettings.email}
                        onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Telefone de Contato</label>
                      <input 
                        type="text"
                        value={companySettings.phone}
                        onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Nome do Responsável Legal</label>
                      <input 
                        type="text"
                        value={companySettings.responsibleName}
                        onChange={(e) => setCompanySettings({ ...companySettings, responsibleName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Fuso Horário Local</label>
                      <select 
                        value={companySettings.timezone}
                        onChange={(e) => setCompanySettings({ ...companySettings, timezone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                        <option value="America/Sao_Paulo">GMT-3 America/Sao_Paulo (Horário Padrão Brasília)</option>
                        <option value="America/Manaus">GMT-4 America/Manaus</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3 mt-2">
                      <input 
                        type="checkbox"
                        id="allow-negative-stock"
                        checked={companySettings.allowNegativeStock}
                        onChange={(e) => setCompanySettings({ ...companySettings, allowNegativeStock: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                      />
                      <div className="space-y-0.5 text-left">
                        <label htmlFor="allow-negative-stock" className="text-xs font-black text-slate-800 uppercase cursor-pointer select-none">Permitir Venda Sem Estoque (Estoque Negativo)</label>
                        <p className="text-[10px] text-slate-500">Se ativado, os operadores do Caixa (PDV) poderão realizar vendas de produtos que não possuem unidades disponíveis em estoque, gerando saldo negativo de inventário. Se desativado, o sistema bloqueará a venda.</p>
                      </div>
                    </div>

                    {/* SMART TICKER SETTINGS */}
                    <div className="md:col-span-2 border-t border-slate-200/60 pt-6 mt-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 text-slate-800 rounded-lg">
                          <Sliders className="w-4.5 h-4.5" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-sm font-bold text-slate-900">Configuração da Barra Inteligente (Ticker)</h4>
                          <p className="text-[10px] text-slate-500">Selecione quais informações devem rolar continuamente no topo da tela do sistema.</p>
                        </div>
                      </div>

                      {/* Controls Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={companySettings.tickerConfig?.showDateTime ?? true}
                            onChange={(e) => setCompanySettings({
                              ...companySettings,
                              tickerConfig: { ...(companySettings.tickerConfig || {}), showDateTime: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-800">Data & Hora</span>
                            <span className="block text-[9px] text-slate-500">Exibir relógio em tempo real</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={companySettings.tickerConfig?.showSystemMessages ?? true}
                            onChange={(e) => setCompanySettings({
                              ...companySettings,
                              tickerConfig: { ...(companySettings.tickerConfig || {}), showSystemMessages: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-800">Mensagens do Sistema</span>
                            <span className="block text-[9px] text-slate-500">Dicas e status operacionais</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={companySettings.tickerConfig?.showLowStock ?? true}
                            onChange={(e) => setCompanySettings({
                              ...companySettings,
                              tickerConfig: { ...(companySettings.tickerConfig || {}), showLowStock: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-800">Alertas de Estoque Baixo</span>
                            <span className="block text-[9px] text-slate-500">Produtos abaixo do estoque mínimo</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={companySettings.tickerConfig?.showExpiringProducts ?? true}
                            onChange={(e) => setCompanySettings({
                              ...companySettings,
                              tickerConfig: { ...(companySettings.tickerConfig || {}), showExpiringProducts: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-800">Próximos do Vencimento</span>
                            <span className="block text-[9px] text-slate-500">Validade do lote nos próximos 45 dias</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={companySettings.tickerConfig?.showAccountsDue ?? true}
                            onChange={(e) => setCompanySettings({
                              ...companySettings,
                              tickerConfig: { ...(companySettings.tickerConfig || {}), showAccountsDue: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-800">Contas a Vencer</span>
                            <span className="block text-[9px] text-slate-500">Fluxo de despesas/receitas em aberto</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={companySettings.tickerConfig?.showSuperAdminAnnouncements ?? true}
                            onChange={(e) => setCompanySettings({
                              ...companySettings,
                              tickerConfig: { ...(companySettings.tickerConfig || {}), showSuperAdminAnnouncements: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-800">Comunicados Globais</span>
                            <span className="block text-[9px] text-slate-500">Mural do Super Administrador</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={companySettings.tickerConfig?.showMarketNews ?? true}
                            onChange={(e) => setCompanySettings({
                              ...companySettings,
                              tickerConfig: { ...(companySettings.tickerConfig || {}), showMarketNews: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-800">Notícias do Mercado</span>
                            <span className="block text-[9px] text-slate-500">Últimas do mercado financeiro (G1)</span>
                          </div>
                        </label>

                        <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={companySettings.tickerConfig?.showEconomicIndicators ?? true}
                            onChange={(e) => setCompanySettings({
                              ...companySettings,
                              tickerConfig: { ...(companySettings.tickerConfig || {}), showEconomicIndicators: e.target.checked }
                            })}
                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <div>
                            <span className="block text-xs font-bold text-slate-800">Indicadores Econômicos</span>
                            <span className="block text-[9px] text-slate-500">Cotação do Dólar, Euro e Ibovespa</span>
                          </div>
                        </label>
                      </div>

                      {/* Theme and Speed selects */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-left">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase">Velocidade da Animação</label>
                          <select 
                            value={companySettings.tickerConfig?.tickerSpeed || "normal"}
                            onChange={(e) => setCompanySettings({
                              ...companySettings,
                              tickerConfig: { ...(companySettings.tickerConfig || {}), tickerSpeed: e.target.value as any }
                            })}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="slow">Lenta (Suave e discreta)</option>
                            <option value="normal">Normal (Recomendada)</option>
                            <option value="fast">Rápida (Dinâmica)</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 uppercase">Tema Visual do Ticker</label>
                          <select 
                            value={companySettings.tickerConfig?.tickerTheme || "dark"}
                            onChange={(e) => setCompanySettings({
                              ...companySettings,
                              tickerConfig: { ...(companySettings.tickerConfig || {}), tickerTheme: e.target.value as any }
                            })}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                          >
                            <option value="dark">Escuro (Fundo Slate / Letras Claras)</option>
                            <option value="light">Claro (Fundo Branco / Letras Escuras)</option>
                            <option value="emerald">Esmeralda (Fundo Verde Escuro / Letras Verdes)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2 pt-4">
                      <button 
                        type="submit"
                        className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Salvar Configurações
                      </button>
                    </div>
                  </form>

                  {/* WhatsApp Stock Alerts Settings card */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">Configurações de Alertas por WhatsApp</h3>
                        <p className="text-xs text-slate-500">Mantenha os canais de comunicação com o proprietário sempre ativos para receber alertas em tempo real.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase">Telefone Proprietário (DDI + DDD)</label>
                        <input 
                          type="text"
                          placeholder="Ex: 5511999999999"
                          value={whatsappConfig?.whatsappPhone || ""}
                          onChange={(e) => setWhatsappConfig(prev => prev ? { ...prev, whatsappPhone: e.target.value } : { companyId: company?.id, whatsappPhone: e.target.value, whatsappEnabled: false })}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-3 md:col-span-2 p-4 bg-emerald-50 border border-emerald-100 rounded-xl mt-1">
                        <input 
                          type="checkbox"
                          id="settings-wa-enabled"
                          checked={whatsappConfig?.whatsappEnabled || false}
                          onChange={(e) => setWhatsappConfig(prev => prev ? { ...prev, whatsappEnabled: e.target.checked } : { companyId: company?.id, whatsappPhone: "", whatsappEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="space-y-0.5 text-left">
                          <label htmlFor="settings-wa-enabled" className="text-xs font-black text-slate-800 uppercase cursor-pointer select-none">Autorizar Notificações por WhatsApp</label>
                          <p className="text-[10px] text-slate-500">Ao marcar esta opção, você autoriza o sistema Meu Gestor a gerar e agilizar o envio de mensagens do estoque de reposição diretamente para seu celular.</p>
                        </div>
                      </div>

                      <div className="md:col-span-2 pt-2">
                        <button 
                          type="button"
                          onClick={() => handleSaveWhatsappConfig(whatsappConfig?.whatsappEnabled || false, whatsappConfig?.whatsappPhone || "")}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Atualizar Canal de Alertas
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==========================================
                  TAB 10: USER PROFILE
              ========================================== */}
              {activeTab === "profile" && (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Meu Perfil de Acesso</h3>
                    <p className="text-xs text-slate-500">Atualize suas credenciais de segurança e dados pessoais no Meu Gestor.</p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      showToast("Perfil atualizado com sucesso!");
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl"
                  >
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Nome do Usuário</label>
                      <input 
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">E-mail de Login</label>
                      <input 
                        type="email"
                        value={userProfile.email}
                        onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Telefone Celular</label>
                      <input 
                        type="text"
                        value={userProfile.phone}
                        onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Função Organizacional</label>
                      <input 
                        type="text"
                        disabled
                        value={user?.role === "admin" ? "Administrador Proprietário" : "Colaborador"}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-100 text-slate-500 font-bold outline-none"
                      />
                    </div>
                    <div className="border-t border-slate-100 md:col-span-2 my-2 pt-4">
                      <h4 className="text-xs font-bold text-slate-900 uppercase mb-4">Alterar Senha de Segurança</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500">Nova Senha</label>
                          <input 
                            type="password"
                            placeholder="Nova senha..."
                            value={userProfile.newPassword}
                            onChange={(e) => setUserProfile({ ...userProfile, newPassword: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="md:col-span-2 pt-2">
                      <button 
                        type="submit"
                        className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                      >
                        <Check className="w-4 h-4" /> Salvar Alterações
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ==========================================
                  TAB 11: SAAS PLANS MANAGEMENT
              ========================================== */}
              {activeTab === "plans" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Assinatura & Faturamento</h3>
                    <p className="text-xs text-slate-500">Gerencie seu plano, faturas, data de vencimento e histórico de pagamentos.</p>
                  </div>

                  {/* Company Subscription Info Panel */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Summary */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider">Status da Assinatura</h4>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                          (companySub?.company?.status || company?.status) === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {companySub?.company?.status === "active" ? "Ativo" : "Aguardando Pagamento"}
                        </span>
                      </div>

                      <div className="space-y-3.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Plano Ativo:</span>
                          <strong className="text-slate-800 font-bold">{companySub?.company?.planName || company?.planName || "Plano Pro"}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Preço Mensal:</span>
                          <strong className="text-slate-800 font-bold font-mono">
                            R$ {(companySub?.company?.price || 99.90).toFixed(2).replace(".", ",")}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Data de Vencimento:</span>
                          <strong className="text-slate-800 font-bold font-mono">
                            {companySub?.company?.dueDate 
                              ? new Date(companySub.company.dueDate).toLocaleDateString("pt-BR") 
                              : company?.dueDate 
                              ? new Date(company.dueDate).toLocaleDateString("pt-BR") 
                              : "N/A"}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Próxima Cobrança:</span>
                          <strong className="text-slate-800 font-bold font-mono">
                            {companySub?.company?.dueDate 
                              ? new Date(companySub.company.dueDate).toLocaleDateString("pt-BR") 
                              : company?.dueDate 
                              ? new Date(company.dueDate).toLocaleDateString("pt-BR") 
                              : "N/A"}
                          </strong>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex gap-3">
                        <button
                          onClick={() => {
                            const payNow = async () => {
                              try {
                                const res = await fetch("/api/company/pay", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token}`
                                  },
                                  body: JSON.stringify({ planId: companySub?.company?.planId || "plan_pro", gateway: "stripe" })
                                });
                                const data = await res.json();
                                if (res.ok && data.paymentUrl) {
                                  window.location.href = data.paymentUrl;
                                } else {
                                  showToast(data.error || "Erro ao conectar gateway.", "error");
                                }
                              } catch (err: any) {
                                showToast("Erro ao iniciar faturamento.", "error");
                              }
                            };
                            payNow();
                          }}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/30 text-center cursor-pointer"
                        >
                          Pagar Agora 💳
                        </button>
                      </div>
                    </div>

                    {/* Resources Limits Dashboard */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                      <h4 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">Limites de Uso do Plano</h4>
                      
                      <div className="space-y-4 text-xs font-bold text-slate-600">
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>Cadastro de Produtos</span>
                            <span>{allProducts.length} / {companySub?.company?.limitProducts || "1000"}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full transition-all" 
                              style={{ width: `${Math.min(100, (allProducts.length / (companySub?.company?.limitProducts || 1000)) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span>Usuários Colaboradores</span>
                            <span>{saasUsers.length || 1} / {companySub?.company?.limitUsers || "10"}</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all" 
                              style={{ width: `${Math.min(100, ((saasUsers.length || 1) / (companySub?.company?.limitUsers || 10)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Billing History inside regular plans tab (Requirement 5) */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-100">
                      <h4 className="font-extrabold text-sm text-slate-800">📋 Histórico de Pagamentos Efetuados</h4>
                      <p className="text-xs text-slate-400">Relação completa de mensalidades e ativações desta conta.</p>
                    </div>

                    {(!companySub?.history || companySub.history.length === 0) ? (
                      <div className="p-8 text-center text-slate-400">
                        <p className="text-xs font-bold text-slate-400">Nenhum histórico de pagamentos registrado no banco de dados.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">
                              <th className="p-4">Identificador</th>
                              <th className="p-4">Data do Pagamento</th>
                              <th className="p-4">Plano Ativado</th>
                              <th className="p-4">Gateway</th>
                              <th className="p-4 text-right">Valor Pago</th>
                              <th className="p-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                            {companySub.history.map((h: any) => (
                              <tr key={h.id} className="hover:bg-slate-50/50">
                                <td className="p-4 font-mono text-[10px] font-bold text-slate-400">{h.id}</td>
                                <td className="p-4">{new Date(h.date).toLocaleDateString("pt-BR")}</td>
                                <td className="p-4 text-slate-800 font-bold">{h.planName || "Plano Pro"}</td>
                                <td className="p-4 uppercase text-[10px]">{h.gateway || "Stripe"}</td>
                                <td className="p-4 text-right font-mono text-slate-900 font-bold">R$ {h.amount.toFixed(2).replace(".", ",")}</td>
                                <td className="p-4 text-center">
                                  <span className="inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                                    {h.status || "PAGO"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==========================================
                  TAB 12: CUSTOMER SUPPORT & TICKETS
              ========================================== */}
              {activeTab === "support" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Central de Suporte & Chamados</h3>
                    <p className="text-xs text-slate-500">Abra chamados para reportar erros ou tire suas dúvidas rapidamente com nosso FAQ corporativo.</p>
                  </div>

                  {/* Autorização de Acesso de Suporte */}
                  {user?.role === "admin" && (
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            🛡️ Autorização de Acesso Técnico (Suporte Seguro)
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                            Para que nossa equipe ou o Super Administrador possa investigar problemas diretamente no seu painel, 
                            você deve autorizar o acesso temporário de forma explícita. Você pode revogar este acesso a qualquer momento.
                          </p>
                        </div>
                        {activeSupportAuth && (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 self-start sm:self-center">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Acesso Autorizado
                          </span>
                        )}
                      </div>

                      {activeSupportAuth ? (
                        <div className="p-4 bg-slate-50 rounded-xl space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-slate-400 block">Autorizado em:</span>
                              <span className="font-semibold text-slate-700">
                                {new Date(activeSupportAuth.authorizedAt).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <div className="md:col-span-2">
                              <span className="text-slate-400 block">Motivo do Suporte:</span>
                              <span className="font-semibold text-slate-700">{activeSupportAuth.reason}</span>
                            </div>
                          </div>
                          <div className="border-t border-slate-200/60 pt-3 flex justify-end">
                            <button
                              onClick={handleRevokeSupport}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                            >
                              Revogar Acesso do Suporte
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row items-end gap-3">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Motivo do Suporte Técnico</label>
                            <input
                              type="text"
                              value={supportReason}
                              onChange={(e) => setSupportReason(e.target.value)}
                              placeholder="Descreva brevemente o problema para suporte (ex: Correção de estoque ou ajuste financeiro)..."
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                            />
                          </div>
                          <button
                            onClick={handleAuthorizeSupport}
                            disabled={isSubmittingSupportAuth}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm h-[38px] whitespace-nowrap"
                          >
                            {isSubmittingSupportAuth ? "Enviando..." : "Autorizar Acesso Técnico"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* FAQ list */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                      <h4 className="font-bold text-sm text-slate-900 uppercase">FAQ - Dúvidas Frequentes</h4>
                      <div className="space-y-3 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-800 block">Como posso editar cargos customizados?</span>
                          <span className="text-slate-500 block">Acesse a aba 'Equipe & Permissões', clique no botão de configurações (Sliders) ao lado do cargo correspondente e altere as chaves.</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-800 block">O Gestor IA possui limite de mensagens?</span>
                          <span className="text-slate-500 block">O plano PRO premium disponibiliza mensagens ilimitadas utilizando os modelos Gemini em tempo real, sem custo extra.</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                          <span className="font-bold text-slate-800 block">Como é calculada a margem de faturamento?</span>
                          <span className="text-slate-500 block">Nossos servidores monitoram a diferença entre o preço de custo inserido nos produtos e o total faturado nas vendas.</span>
                        </div>
                      </div>
                    </div>

                    {/* Open Ticket Form */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                      <h4 className="font-bold text-sm text-slate-900 uppercase mb-4">Abrir Chamado Técnico</h4>
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!supportTicket.subject || !supportTicket.message) {
                            showToast("Por favor, preencha o assunto e a mensagem.", "error");
                            return;
                          }
                          const newTk = {
                            id: "tk_" + Math.random().toString(36).substring(2, 7),
                            subject: supportTicket.subject,
                            category: supportTicket.category,
                            status: "Aberto",
                            date: new Date().toLocaleDateString("pt-BR")
                          };
                          setSupportTicketsList([newTk, ...supportTicketsList]);
                          setSupportTicket({ subject: "", category: "finance", priority: "medium", message: "" });
                          showToast("Chamado aberto com sucesso! Aguarde nossa análise.");
                        }}
                        className="space-y-3.5"
                      >
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Assunto</label>
                          <input 
                            type="text"
                            required
                            placeholder="Ex: Divergência no faturamento total..."
                            value={supportTicket.subject}
                            onChange={(e) => setSupportTicket({ ...supportTicket, subject: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Módulo</label>
                            <select 
                              value={supportTicket.category}
                              onChange={(e) => setSupportTicket({ ...supportTicket, category: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                            >
                              <option value="finance">Financeiro</option>
                              <option value="inventory">Produtos / Estoque</option>
                              <option value="rbac">Controle de Equipe</option>
                              <option value="other">Outros assuntos</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Urgência</label>
                            <select 
                              value={supportTicket.priority}
                              onChange={(e) => setSupportTicket({ ...supportTicket, priority: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                            >
                              <option value="low">Baixa</option>
                              <option value="medium">Média</option>
                              <option value="high">Alta (Bloqueante)</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Mensagem Detalhada</label>
                          <textarea 
                            required
                            rows={3}
                            placeholder="Explique sua dúvida ou report..."
                            value={supportTicket.message}
                            onChange={(e) => setSupportTicket({ ...supportTicket, message: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                          />
                        </div>
                        <button 
                          type="submit"
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Enviar Chamado Técnico
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Open Tickets table */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
                    <h4 className="font-bold text-sm text-slate-900 mb-4 uppercase">Chamados de Suporte Registrados</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase pb-2">
                            <th className="py-2">Código</th>
                            <th className="py-2">Assunto</th>
                            <th className="py-2">Módulo</th>
                            <th className="py-2">Data</th>
                            <th className="py-2 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {supportTicketsList.map(tk => (
                            <tr key={tk.id}>
                              <td className="py-3 font-mono text-slate-400">{tk.id}</td>
                              <td className="py-3 font-semibold text-slate-800">{tk.subject}</td>
                              <td className="py-3">{tk.category}</td>
                              <td className="py-3 text-slate-400">{tk.date}</td>
                              <td className="py-3 text-right">
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-bold">{tk.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {/* ========================================================================
                  SUPER ADMIN TAB 1: SAAS GENERAL METRICS DASHBOARD
              ======================================================================== */}
              {activeTab === "superadmin_dash" && (
                <div className="space-y-6">
                  {/* KPI Grid - Platform Metrics Only */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 1. Total de Empresas */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:border-slate-300/80 transition-all">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Empresas</span>
                      <span className="block text-2xl font-black text-slate-800 font-mono mt-1">
                        {saasCompanies.length}
                      </span>
                      <span className="block text-[10px] text-slate-400 mt-1">
                        💼 Organizações registradas
                      </span>
                    </div>

                    {/* 2. Empresas Ativas */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:border-slate-300/80 transition-all">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Empresas Ativas</span>
                      <span className="block text-2xl font-black text-emerald-600 font-mono mt-1">
                        {saasCompanies.filter(c => (c.status || "").toLowerCase() === "active" || (c.status || "").toLowerCase() === "ativo").length}
                      </span>
                      <span className="block text-[10px] text-emerald-500 font-semibold mt-1">
                        🟢 Operacionais e ativas
                      </span>
                    </div>

                    {/* 3. Empresas em Teste */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:border-slate-300/80 transition-all">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Empresas em Teste</span>
                      <span className="block text-2xl font-black text-amber-500 font-mono mt-1">
                        {saasCompanies.filter(c => (c.status || "").toLowerCase() === "trial" || (c.status || "").toLowerCase() === "em_teste").length}
                      </span>
                      <span className="block text-[10px] text-amber-500 font-semibold mt-1">
                        🟡 Período de avaliação
                      </span>
                    </div>

                    {/* 4. Empresas Suspensas */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:border-slate-300/80 transition-all">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Empresas Suspensas</span>
                      <span className="block text-2xl font-black text-rose-500 font-mono mt-1">
                        {saasCompanies.filter(c => (c.status || "").toLowerCase() === "suspended" || (c.status || "").toLowerCase() === "suspenso").length}
                      </span>
                      <span className="block text-[10px] text-rose-500 font-semibold mt-1">
                        🔴 Bloqueadas por inadimplência
                      </span>
                    </div>

                    {/* 5. Empresas Bloqueadas */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:border-slate-300/80 transition-all">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Empresas Bloqueadas</span>
                      <span className="block text-2xl font-black text-slate-700 font-mono mt-1">
                        {saasCompanies.filter(c => (c.status || "").toLowerCase() === "blocked" || (c.status || "").toLowerCase() === "bloqueado" || (c.status || "").toLowerCase() === "pending_payment" || (c.status || "").toLowerCase() === "pending").length}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-1">
                        ⚫ Bloqueadas administrativamente
                      </span>
                    </div>

                    {/* 6. Assinaturas Ativas */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:border-slate-300/80 transition-all">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Assinaturas Ativas</span>
                      <span className="block text-2xl font-black text-emerald-600 font-mono mt-1">
                        {saasCompanies.filter(c => (c.status || "").toLowerCase() === "active" || (c.status || "").toLowerCase() === "ativo").length}
                      </span>
                      <span className="block text-[10px] text-emerald-600 font-semibold mt-1">
                        ✨ MRR Recorrente Ativo
                      </span>
                    </div>

                    {/* 7. Assinaturas Vencidas */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:border-slate-300/80 transition-all">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Assinaturas Vencidas</span>
                      <span className="block text-2xl font-black text-rose-600 font-mono mt-1">
                        {saasCompanies.filter(c => (c.overdueDays || 0) > 0 || (c.status || "").toLowerCase() === "suspended" || (c.status || "").toLowerCase() === "suspenso").length}
                      </span>
                      <span className="block text-[10px] text-rose-600 font-semibold mt-1">
                        ⚠️ Licenças expiradas
                      </span>
                    </div>

                    {/* 8. Próximas do Vencimento */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm hover:border-slate-300/80 transition-all">
                      <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Próximas do Vencimento</span>
                      <span className="block text-2xl font-black text-amber-600 font-mono mt-1">
                        {saasCompanies.filter(c => {
                          if (!c.subscriptionExpiresAt) return false;
                          const diffDays = Math.ceil((new Date(c.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          return diffDays > 0 && diffDays <= 7;
                        }).length}
                      </span>
                      <span className="block text-[10px] text-amber-600 font-semibold mt-1">
                        📅 Vencimento em até 7 dias
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Signups list */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase">Novas Empresas Registradas</h4>
                        <p className="text-[11px] text-slate-400">Últimos clientes integrados na plataforma Meu Gestor.</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold pb-2 uppercase">
                              <th className="py-2">Nome Comercial</th>
                              <th className="py-2">Proprietário</th>
                              <th className="py-2">Plano</th>
                              <th className="py-2 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {saasCompanies.slice(0, 5).map(c => (
                              <tr key={c.id}>
                                <td className="py-3 font-semibold text-slate-800">{c.name}</td>
                                <td className="py-3 text-slate-500">
                                  {c.ownerName} <span className="block text-[10px] text-slate-400">{c.ownerEmail}</span>
                                </td>
                                <td className="py-3 capitalize text-slate-600">{c.plan}</td>
                                <td className="py-3 text-right">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                    c.status === "ativo" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                                  }`}>
                                    {c.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Empresas Próximas do Vencimento */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          Empresas Próximas do Vencimento
                        </h4>
                        <p className="text-[11px] text-slate-400">Clientes com licenças expirando nos próximos 7 dias.</p>
                      </div>
                      {saasCompanies.filter(c => {
                        if (!c.subscriptionExpiresAt) return false;
                        const diffDays = Math.ceil((new Date(c.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return diffDays > 0 && diffDays <= 7;
                      }).length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          🟢 Nenhuma empresa com vencimento nos próximos 7 dias.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-slate-400 font-bold pb-2 uppercase">
                                <th className="py-2">Nome Comercial</th>
                                <th className="py-2">Expiração</th>
                                <th className="py-2">Plano</th>
                                <th className="py-2 text-right">Dias Restantes</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {saasCompanies.filter(c => {
                                if (!c.subscriptionExpiresAt) return false;
                                const diffDays = Math.ceil((new Date(c.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                return diffDays > 0 && diffDays <= 7;
                              }).map(c => {
                                const diffDays = Math.ceil((new Date(c.subscriptionExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                return (
                                  <tr key={c.id}>
                                    <td className="py-3 font-semibold text-slate-800">{c.name}</td>
                                    <td className="py-3 text-slate-500">
                                      {new Date(c.subscriptionExpiresAt).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td className="py-3 capitalize text-slate-600">{c.plan || c.planName}</td>
                                    <td className="py-3 text-right">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
                                        {diffDays} {diffDays === 1 ? 'dia' : 'dias'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Infrastructure Overview */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase">Infraestrutura Global</h4>
                        <p className="text-[11px] text-slate-400">Métricas de performance e segurança do cluster.</p>
                      </div>
                      <div className="space-y-3.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-500">Uso de CPU Cluster</span>
                            <span className="text-slate-800 font-mono">14%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: "14%" }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-500">Uso de Memória RAM</span>
                            <span className="text-slate-800 font-mono">42%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: "42%" }}></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-500">Uptime dos Servidores</span>
                            <span className="text-emerald-600 font-mono font-bold">99.98%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full" style={{ width: "99.98%" }}></div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 font-semibold">
                          <p className="flex justify-between">
                            <span>Base PostgreSQL:</span>
                            <span className="text-emerald-600 font-mono">OPERACIONAL</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Engine AI de Monitoramento:</span>
                            <span className="text-emerald-600 font-mono">ONLINE</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Serviço WhatsApp API:</span>
                            <span className="text-emerald-600 font-mono">ONLINE</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================
                  SUPER ADMIN TAB 2: SAAS PLANS CREATION & CONFIGURATION
              ======================================================================== */}
              {activeTab === "superadmin_plans" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Plan Creation / Edition Form */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 uppercase">
                        {newSaaSPlan.id ? "✏️ Editar Plano SaaS" : "🚀 Criar Novo Plano SaaS"}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {newSaaSPlan.id ? "Modifique os limites comerciais deste plano." : "Defina os limites comerciais para novos clientes."}
                      </p>
                    </div>

                    <form onSubmit={handleCreateSaaSPlan} className="space-y-3.5 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 uppercase block">Nome do Plano</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Ex: Plano Intermediário"
                          value={newSaaSPlan.name}
                          onChange={(e) => setNewSaaSPlan({ ...newSaaSPlan, name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <ValueInputField
                          id="plan_price"
                          label="Preço"
                          value={newSaaSPlan.price}
                          onChange={(val) => setNewSaaSPlan({ ...newSaaSPlan, price: val })}
                          placeholder="149.90"
                          required
                        />
                        <div className="space-y-1">
                          <label className="font-bold text-[11px] text-slate-700 uppercase block">Período</label>
                          <select
                            value={newSaaSPlan.period}
                            onChange={(e) => setNewSaaSPlan({ ...newSaaSPlan, period: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-semibold"
                          >
                            <option value="mensal">Mensal</option>
                            <option value="anual">Anual</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="font-bold text-[10px] text-slate-700 uppercase block">Produtos Max</label>
                          <input 
                            type="number" 
                            required
                            placeholder="Ex: 500"
                            value={newSaaSPlan.limitProducts}
                            onChange={(e) => setNewSaaSPlan({ ...newSaaSPlan, limitProducts: e.target.value })}
                            className="w-full px-2.5 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-center font-bold text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-[10px] text-slate-700 uppercase block">Usuários Max</label>
                          <input 
                            type="number" 
                            required
                            placeholder="Ex: 10"
                            value={newSaaSPlan.limitUsers}
                            onChange={(e) => setNewSaaSPlan({ ...newSaaSPlan, limitUsers: e.target.value })}
                            className="w-full px-2.5 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-center font-bold text-slate-800"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-bold text-[10px] text-slate-700 uppercase block">Espaço (GB)</label>
                          <input 
                            type="number" 
                            required
                            placeholder="Ex: 20"
                            value={newSaaSPlan.limitStorage}
                            onChange={(e) => setNewSaaSPlan({ ...newSaaSPlan, limitStorage: e.target.value })}
                            className="w-full px-2.5 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-center font-bold text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 uppercase block">Descrição</label>
                        <input 
                          type="text" 
                          placeholder="Ex: Ideal para empresas de médio porte com equipe expandida."
                          value={newSaaSPlan.description}
                          onChange={(e) => setNewSaaSPlan({ ...newSaaSPlan, description: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 uppercase block">Recursos disponíveis (Separados por vírgula)</label>
                        <textarea 
                          rows={2}
                          placeholder="Ex: Controle de estoque, IA inteligente, WhatsApp Ilimitado, Relatórios PDF"
                          value={newSaaSPlan.features}
                          onChange={(e) => setNewSaaSPlan({ ...newSaaSPlan, features: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 uppercase block">Status</label>
                        <select
                          value={newSaaSPlan.status}
                          onChange={(e) => setNewSaaSPlan({ ...newSaaSPlan, status: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                        >
                          <option value="active">Ativo (Visível no checkout)</option>
                          <option value="inactive">Inativo (Rascunho)</option>
                        </select>
                      </div>

                      <div className="pt-2 space-y-2">
                        <button 
                          type="submit"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {newSaaSPlan.id ? "💾 Salvar Alterações" : "🚀 Publicar Plano SaaS"}
                        </button>

                        {newSaaSPlan.id && (
                          <button 
                            type="button"
                            onClick={() => setNewSaaSPlan({ id: "", name: "", price: "", period: "mensal", limitProducts: "100", limitUsers: "5", limitStorage: "10", status: "active", description: "", features: "" })}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center block"
                          >
                            ❌ Cancelar Edição
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Plans Table List */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 uppercase">Planos de Assinatura Cadastrados</h4>
                      <p className="text-[11px] text-slate-400">Lista completa de planos de acesso configurados no sistema.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold pb-2 uppercase text-[10px]">
                            <th className="py-2.5">Plano</th>
                            <th className="py-2.5 text-right">Mensalidade</th>
                            <th className="py-2.5 text-center">Limites</th>
                            <th className="py-2.5 text-center">Empresas</th>
                            <th className="py-2.5 text-center">Criação</th>
                            <th className="py-2.5 text-center">Status</th>
                            <th className="py-2.5 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {saasPlansList.map(plan => {
                            const isPlanInUse = (plan.companyCount || 0) > 0;
                            return (
                              <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3">
                                  <span className="font-extrabold text-slate-800 text-xs block">{plan.name}</span>
                                  <span className="text-[10px] text-slate-400 block max-w-[160px] truncate">{plan.description || "Sem descrição"}</span>
                                </td>
                                <td className="py-3 text-right font-mono font-extrabold text-slate-900 text-xs">
                                  {formatCurrency(plan.price)}
                                  <span className="text-[9px] text-slate-400 block font-normal capitalize">por {plan.period || plan.billingPeriod || "mensal"}</span>
                                </td>
                                <td className="py-3 text-center">
                                  <div className="inline-flex flex-col text-[10px] text-slate-600 font-mono leading-tight">
                                    <span>📦 {plan.limitProducts || plan.maxProducts || 100} prods</span>
                                    <span>👥 {plan.limitUsers || plan.maxUsers || 5} users</span>
                                    <span>💾 {plan.limitStorage || 10} GB</span>
                                  </div>
                                </td>
                                <td className="py-3 text-center font-mono font-bold text-slate-700 text-xs">
                                  <span className={`px-2 py-0.5 rounded-full ${isPlanInUse ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>
                                    {plan.companyCount || 0}
                                  </span>
                                </td>
                                <td className="py-3 text-center text-slate-400 font-mono text-[10px]">
                                  {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString("pt-BR") : "01/01/2026"}
                                </td>
                                <td className="py-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                    plan.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500"
                                  }`}>
                                    {plan.status === "active" ? "ATIVO" : "INATIVO"}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      title="Editar Plano"
                                      onClick={() => setNewSaaSPlan({
                                        id: plan.id,
                                        name: plan.name,
                                        price: String(plan.price),
                                        period: plan.period || plan.billingPeriod || "mensal",
                                        limitProducts: String(plan.limitProducts || plan.maxProducts || "100"),
                                        limitUsers: String(plan.limitUsers || plan.maxUsers || "5"),
                                        limitStorage: String(plan.limitStorage || "10"),
                                        status: plan.status || "active",
                                        description: plan.description || "",
                                        features: Array.isArray(plan.features) ? plan.features.join(", ") : ""
                                      })}
                                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      title="Duplicar Plano"
                                      onClick={() => handleDuplicateSaaSPlan(plan.id)}
                                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      title={plan.status === "active" ? "Desativar Plano" : "Ativar Plano"}
                                      onClick={() => handleToggleSaaSPlanStatus(plan.id)}
                                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        plan.status === "active" 
                                          ? "bg-amber-50 hover:bg-amber-100 text-amber-600" 
                                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                      }`}
                                    >
                                      {plan.status === "active" ? (
                                        <Lock className="w-3.5 h-3.5" />
                                      ) : (
                                        <Unlock className="w-3.5 h-3.5" />
                                      )}
                                    </button>

                                    <button
                                      title="Excluir Plano"
                                      onClick={() => handleDeleteSaaSPlan(plan.id, plan.companyCount || 0)}
                                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        isPlanInUse 
                                          ? "bg-slate-50 text-slate-300 cursor-not-allowed" 
                                          : "bg-rose-50 hover:bg-rose-100 text-rose-600"
                                      }`}
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================
                  SUPER ADMIN TAB 3: CLIENT / COMPANY MANAGEMENT
              ======================================================================== */}
              {activeTab === "superadmin_companies" && (
                <div className="space-y-6">
                  {/* Summary Dashboard Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total</span>
                      <span className="text-2xl font-black text-slate-800 mt-2 block">{saasCompanies.length}</span>
                      <span className="text-[9px] text-slate-450 font-bold block mt-1">Empresas</span>
                    </div>
                    <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">🟢 Ativas</span>
                      <span className="text-2xl font-black text-emerald-700 mt-2 block">
                        {saasCompanies.filter(c => c.status === "active" || c.status === "ativo").length}
                      </span>
                      <span className="text-[9px] text-emerald-600/70 font-bold block mt-1">Acesso Liberado</span>
                    </div>
                    <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">🟡 Em Teste</span>
                      <span className="text-2xl font-black text-amber-700 mt-2 block">
                        {saasCompanies.filter(c => c.status === "trial" || c.status === "em_teste").length}
                      </span>
                      <span className="text-[9px] text-amber-600/70 font-bold block mt-1">Período Grátis</span>
                    </div>
                    <div className="bg-orange-50/40 border border-orange-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider block">🟠 Aguardando</span>
                      <span className="text-2xl font-black text-orange-700 mt-2 block">
                        {saasCompanies.filter(c => c.status === "pending_payment" || c.status === "aguardando_liberacao" || c.status === "pending_release").length}
                      </span>
                      <span className="text-[9px] text-orange-600/70 font-bold block mt-1">Aguardando Liberação</span>
                    </div>
                    <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider block">🔴 Suspensas</span>
                      <span className="text-2xl font-black text-rose-700 mt-2 block">
                        {saasCompanies.filter(c => c.status === "suspended" || c.status === "suspenso").length}
                      </span>
                      <span className="text-[9px] text-rose-600/70 font-bold block mt-1">Sem Acesso</span>
                    </div>
                    <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">⚫ Bloqueadas</span>
                      <span className="text-2xl font-black text-slate-800 mt-2 block">
                        {saasCompanies.filter(c => c.status === "blocked" || c.status === "bloqueado").length}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold block mt-1">Acesso Bloqueado</span>
                    </div>
                  </div>

                  {/* Main Company Grid & Controller */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase">Empresas Parceiras (Clientes Meu Gestor)</h4>
                        <p className="text-xs text-slate-400">Ative, suspenda, bloqueie ou reative o acesso comercial das empresas clientes corporativos em tempo real.</p>
                      </div>

                      <div className="relative w-full sm:w-80">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Search className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          value={companySearchQuery}
                          onChange={(e) => setCompanySearchQuery(e.target.value)}
                          placeholder="Buscar por nome, código, contato..."
                          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                        />
                        {companySearchQuery && (
                          <button
                            onClick={() => setCompanySearchQuery("")}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-sans">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase p-3">
                            <th className="p-3 text-[10px]">Empresa / Código ID</th>
                            <th className="p-3 text-[10px]">Responsável / Contato</th>
                            <th className="p-3 text-[10px]">Plano Contratado</th>
                            <th className="p-3 text-[10px]">Status Atual</th>
                            <th className="p-3 text-[10px]">Data de Cadastro</th>
                            <th className="p-3 text-center text-[10px] w-[350px]">Ações Manuais</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {saasCompanies
                            .filter(c => {
                              const q = companySearchQuery.toLowerCase().trim();
                              if (!q) return true;
                              const nameMatch = (c.name || "").toLowerCase().includes(q);
                              const idMatch = (c.id || "").toLowerCase().includes(q);
                              const respMatch = (c.responsibleName || c.ownerName || "").toLowerCase().includes(q);
                              const emailMatch = (c.email || c.ownerEmail || "").toLowerCase().includes(q);
                              const phoneMatch = (c.phone || "").toLowerCase().includes(q);
                              const planMatch = (c.plan || c.planName || "").toLowerCase().includes(q);
                              const statusLabelText = getStatusLabel(c.status).label.toLowerCase();
                              return nameMatch || idMatch || respMatch || emailMatch || phoneMatch || planMatch || statusLabelText.includes(q);
                            })
                            .map(c => {
                              const statusInfo = getStatusLabel(c.status);
                              return (
                                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-3">
                                    <span className="block font-bold text-slate-800 text-xs">{c.name}</span>
                                    <span className="inline-block mt-1 font-mono text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-semibold">
                                      ID: {c.id}
                                    </span>
                                  </td>
                                  <td className="p-3 space-y-0.5">
                                    <span className="block font-semibold text-slate-700">{c.responsibleName || c.ownerName || "Não informado"}</span>
                                    <span className="block text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                      <Mail className="w-3 h-3 text-slate-350" /> {c.email || c.ownerEmail || "N/A"}
                                    </span>
                                    {c.phone && (
                                      <span className="block text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-slate-350" /> {c.phone}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <span className="block uppercase font-mono font-bold text-slate-600 bg-slate-50 px-2 py-1 border border-slate-100 rounded text-[10px] inline-block">
                                      💎 {c.planName || c.plan || "Nenhum"}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${statusInfo.color}`}>
                                      {statusInfo.label}
                                    </span>
                                    {c.manualReleased && (
                                      <span className="block text-[8px] text-emerald-600 font-bold uppercase mt-1">
                                        🔓 Liberada por Super Admin
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-slate-400 font-mono text-[10px]">
                                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString("pt-BR") : "01/01/2026"}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                                      {/* 🛡️ Acesso Suporte (Impersonate) */}
                                      {(() => {
                                        const activeAuth = supportAuthorizationsList.find(auth => auth.companyId === c.id && auth.status === "active");
                                        if (activeAuth) {
                                          return (
                                            <button
                                              onClick={() => handleStartSupportImpersonation(c.id)}
                                              title={`Acesso de suporte AUTORIZADO. Motivo: ${activeAuth.reason}`}
                                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                                            >
                                              <Wrench className="w-3.5 h-3.5" />
                                              <span>Acesso Suporte</span>
                                            </button>
                                          );
                                        } else {
                                          return (
                                            <button
                                              disabled
                                              title="Esta empresa não autorizou acesso de suporte técnico. Solicite que o administrador ative no menu Suporte."
                                              className="p-1.5 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-bold cursor-not-allowed flex items-center gap-1 opacity-55"
                                            >
                                              <Lock className="w-3.5 h-3.5" />
                                              <span>Sem Suporte</span>
                                            </button>
                                          );
                                        }
                                      })()}

                                      {/* ✅ Liberar Acesso */}
                                      {(c.status !== "active" && c.status !== "ativo") && (
                                        <button
                                          onClick={() => handleLiberarCompany(c.id)}
                                          title="Liberar acesso total sem exigir pagamentos"
                                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 hover:text-emerald-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                        >
                                          <CheckCircle className="w-3.5 h-3.5" />
                                          <span>Liberar</span>
                                        </button>
                                      )}

                                      {/* ⛔ Suspender */}
                                      {(c.status === "active" || c.status === "ativo" || c.status === "trial" || c.status === "em_teste") && (
                                        <button
                                          onClick={() => handleSuspenderCompany(c.id)}
                                          title="Bloquear uso do sistema temporariamente preservando dados"
                                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                        >
                                          <Ban className="w-3.5 h-3.5" />
                                          <span>Suspender</span>
                                        </button>
                                      )}

                                      {/* 🔓 Reativar */}
                                      {(c.status === "suspended" || c.status === "suspenso" || c.status === "blocked" || c.status === "bloqueado") && (
                                        <button
                                          onClick={() => handleReativarCompany(c.id)}
                                          title="Reestabelecer acesso comercial da empresa"
                                          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                        >
                                          <Unlock className="w-3.5 h-3.5" />
                                          <span>Reativar</span>
                                        </button>
                                      )}

                                      {/* ✏ Editar */}
                                      <button
                                        onClick={() => {
                                          const adminUser = saasUsers.find(u => u.companyId === c.id && u.role === "admin");
                                          setSelectedCompanyForEdit({
                                            id: c.id,
                                            name: c.name,
                                            responsibleName: c.responsibleName || c.ownerName || "",
                                            email: c.email || c.ownerEmail || "",
                                            phone: c.phone || "",
                                            planId: c.planId || "plan_pro",
                                            status: c.status || "active",
                                            usePdv: c.usePdv !== false,
                                            username: adminUser ? adminUser.username : "",
                                            password: ""
                                          });
                                          setIsCompanyEditModalOpen(true);
                                        }}
                                        title="Editar dados da empresa"
                                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 hover:text-amber-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                        <span>Editar</span>
                                      </button>

                                      {/* 👁 Visualizar */}
                                      <button
                                        onClick={() => {
                                          setSelectedCompanyForView(c);
                                          setIsCompanyViewModalOpen(true);
                                        }}
                                        title="Visualizar estatísticas e dados de uso"
                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Ver</span>
                                      </button>



                                      {/* 🗑 Excluir */}
                                      <button
                                        onClick={() => handleDeleteCompany(c.id, c.name)}
                                        title="Remover definitivamente do sistema"
                                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                      >
                                        <Trash className="w-3.5 h-3.5" />
                                        <span>Excluir</span>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================
                  SUPER ADMIN TAB 4: SAAS PAYMENTS & SUBSCRIPTIONS
              ======================================================================== */}
              {activeTab === "superadmin_payments" && (
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase">Fluxo de Faturamento & Pagamentos SaaS</h4>
                    <p className="text-xs text-slate-400">Controle a adimplência das empresas clientes. Clique nas ações para simular a mudança de status do pagamento.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase p-3">
                          <th className="p-3">Código Fatura</th>
                          <th className="p-3">Empresa</th>
                          <th className="p-3">Plano</th>
                          <th className="p-3 text-right">Valor da Fatura</th>
                          <th className="p-3">Vencimento</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-center">Controle Manual</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {saasPaymentsList.map(pay => (
                          <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-mono text-slate-400">{pay.id}</td>
                            <td className="p-3 font-bold text-slate-800">{pay.companyName}</td>
                            <td className="p-3 capitalize font-semibold">{pay.plan}</td>
                            <td className="p-3 text-right font-mono font-extrabold text-slate-900">{formatCurrency(pay.price)}</td>
                            <td className="p-3 font-mono text-slate-500">{pay.dueDate}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${
                                pay.status === "Pago" 
                                  ? "bg-emerald-50 text-emerald-700" 
                                  : pay.status === "Pendente" 
                                    ? "bg-amber-50 text-amber-700" 
                                    : "bg-rose-50 text-rose-700 animate-pulse"
                              }`}>
                                {pay.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleCyclePaymentStatus(pay.id, pay.status)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-extrabold transition-colors cursor-pointer"
                              >
                                🔄 Ciclar Status
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================================
                  SUPER ADMIN TAB 5: SYSTEM INFRASTRUCTURE UPGRADE
              ======================================================================== */}
              {activeTab === "superadmin_system" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upgrade Actions */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase">Engenharia de Lançamento</h4>
                        <p className="text-[11px] text-slate-400">Dispare updates e correções diretamente na plataforma.</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-2">
                        <p className="flex justify-between font-semibold">
                          <span className="text-slate-500">Versão Atual:</span>
                          <span className="text-slate-900 font-mono font-bold">{saasSystem?.version || "v2.5.0"}</span>
                        </p>
                        <p className="flex justify-between font-semibold">
                          <span className="text-slate-500">Última Build:</span>
                          <span className="text-slate-600">Hoje às 10:45 AM</span>
                        </p>
                        <p className="flex justify-between font-semibold">
                          <span className="text-slate-500">Verificações de Integridade:</span>
                          <span className="text-emerald-600 font-bold">🟢 PASSANDO</span>
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={handleSimulateSystemUpdate}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-all shadow hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          ⚡ Compilar & Atualizar Versão (Patch)
                        </button>
                        <p className="text-[10px] text-slate-400 text-center mt-2">
                          Simula o empacotamento do frontend Vite, compilação do servidor de produção e atualização de versão global.
                        </p>
                      </div>
                    </div>

                    {/* Updates Timeline log history */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase">Linha do Tempo de Lançamento (Release History)</h4>
                        <p className="text-[11px] text-slate-400">Histórico de compilações aplicadas na infraestrutura do Meu Gestor.</p>
                      </div>

                      <div className="space-y-4 border-l border-slate-100 pl-4 text-xs">
                        <div className="relative">
                          <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-4 ring-emerald-50"></span>
                          <p className="font-extrabold text-slate-800">Versão {saasSystem?.version || "v2.5.0"} <span className="text-[10px] text-slate-400 font-normal ml-2">Hoje</span></p>
                          <p className="text-slate-500 mt-1">Simulado com sucesso. Compilação do build bundle finalizada, hot-swapping de servidores concluído.</p>
                        </div>

                        <div className="relative">
                          <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></span>
                          <p className="font-extrabold text-slate-600">Versão v2.5.0 <span className="text-[10px] text-slate-400 font-normal ml-2">Ontem</span></p>
                          <p className="text-slate-500 mt-1">Lançamento do assistente virtual de inteligência artificial estratégico com conexão em tempo real.</p>
                        </div>

                        <div className="relative">
                          <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></span>
                          <p className="font-extrabold text-slate-600">Versão v2.4.0 <span className="text-[10px] text-slate-400 font-normal ml-2">2 dias atrás</span></p>
                          <p className="text-slate-500 mt-1">Implementação de controle de acessos (RBAC) com criação de cargos e permissões personalizáveis.</p>
                        </div>

                        <div className="relative">
                          <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></span>
                          <p className="font-extrabold text-slate-600">Versão v2.3.0 <span className="text-[10px] text-slate-400 font-normal ml-2">5 dias atrás</span></p>
                          <p className="text-slate-500 mt-1">Integração do Frente de Caixa (PDV) com simulador de emissão de cupons fiscais térmicos.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mural de Comunicados Globais (Ticker) */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4 text-left">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase">Comunicados Globais da Barra Inteligente (Ticker)</h4>
                        <p className="text-[11px] text-slate-400">Escreva e remova comunicados visíveis para todas as empresas em tempo real.</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                        {saasBroadcasts.length} ativo(s)
                      </span>
                    </div>

                    {/* Criar Novo Comunicado Form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleCreateBroadcast(newBroadcastMsg);
                      }}
                      className="flex gap-3"
                    >
                      <input 
                        type="text"
                        placeholder="Ex: [ALERTA DE MANUTENÇÃO] O sistema passará por manutenção programada às 23:00..."
                        value={newBroadcastMsg}
                        onChange={(e) => setNewBroadcastMsg(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                      />
                      <button 
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/10 cursor-pointer transition-all active:scale-[0.98]"
                      >
                        Publicar Comunicado
                      </button>
                    </form>

                    {/* Comunicados List */}
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                      {saasBroadcasts.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl">
                          <p className="text-xs text-slate-400">Nenhum comunicado global ativo no momento. Escreva acima para publicar.</p>
                        </div>
                      ) : (
                        saasBroadcasts.map((b: any) => (
                          <div key={b.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100/50 transition-colors">
                            <div className="flex items-start gap-2.5">
                              <span className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse"></span>
                              <div className="space-y-0.5">
                                <p className="text-xs font-medium text-slate-800">{b.message}</p>
                                <p className="text-[9px] text-slate-400">Publicado em: {new Date(b.createdAt).toLocaleString("pt-BR")}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteBroadcast(b.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                              title="Excluir comunicado"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}


              {/* ========================================================================
                  SUPER ADMIN TAB 6: USERS MANAGEMENT
              ======================================================================== */}
              {activeTab === "superadmin_users" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 uppercase">Gestão de Usuários SaaS</h4>
                        <p className="text-[11px] text-slate-400">Todos os operadores, administradores e gerentes cadastrados na plataforma.</p>
                      </div>
                      <div className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold self-start">
                        Total: {saasUsers.length} usuários
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold pb-2 uppercase">
                            <th className="py-2">Nome</th>
                            <th className="py-2">E-mail</th>
                            <th className="py-2">Empresa</th>
                            <th className="py-2">Perfil/Regra</th>
                            <th className="py-2">Status</th>
                            <th className="py-2 text-right">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {saasUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold text-xs">
                                Nenhum usuário cadastrado.
                              </td>
                            </tr>
                          ) : (
                            saasUsers.map((u) => (
                              <tr key={u.id}>
                                <td className="py-3 font-semibold text-slate-800">{u.name}</td>
                                <td className="py-3 text-slate-600 font-mono">{u.email}</td>
                                <td className="py-3 text-slate-500 font-semibold">{u.companyName}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    u.role === "superadmin" 
                                      ? "bg-purple-100 text-purple-700" 
                                      : u.role === "admin" 
                                        ? "bg-blue-100 text-blue-700" 
                                        : "bg-slate-100 text-slate-600"
                                  }`}>
                                    {u.role === "superadmin" ? "Master" : u.role === "admin" ? "Admin" : "Operador"}
                                  </span>
                                </td>
                                <td className="py-3">
                                  <span className={`inline-flex items-center gap-1 font-bold ${
                                    u.status === "inactive" ? "text-rose-600" : "text-emerald-600"
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${u.status === "inactive" ? "bg-rose-500" : "bg-emerald-500"}`}></span>
                                    {u.status === "inactive" ? "Bloqueado" : "Ativo"}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  {u.role !== "superadmin" ? (
                                    <button
                                      onClick={() => handleSuperAdminToggleUser(u.id)}
                                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                                        u.status === "inactive" 
                                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                                          : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                      }`}
                                      id={`btn-toggle-user-${u.id}`}
                                    >
                                      {u.status === "inactive" ? "Desbloquear" : "Bloquear"}
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-semibold">-</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {/* ========================================================================
                  SUPER ADMIN TAB 7: SUPPORT TICKETS & FEEDBACKS
              ======================================================================== */}
              {activeTab === "superadmin_support" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 uppercase">Tickets de Suporte SaaS</h4>
                      <p className="text-[11px] text-slate-400">Atenda chamados abertos pelas empresas parceiras em tempo real.</p>
                    </div>

                    <div className="space-y-4">
                      {saasSupportTickets.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 font-semibold text-xs">
                          Nenhum chamado de suporte registrado.
                        </div>
                      ) : (
                        saasSupportTickets.map((t) => (
                          <div key={t.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-mono font-bold">TICKET #{t.id}</span>
                                <h5 className="font-extrabold text-xs text-slate-800">{t.subject}</h5>
                                <span className="text-[10px] text-slate-500 font-semibold">
                                  Por <strong className="text-slate-700">{t.companyName}</strong> em {new Date(t.date).toLocaleDateString("pt-BR")} às {new Date(t.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase self-start sm:self-center ${
                                t.status === "aberto" 
                                  ? "bg-amber-100 text-amber-700" 
                                  : t.status === "respondido" 
                                    ? "bg-emerald-100 text-emerald-700" 
                                    : "bg-slate-200 text-slate-600"
                              }`}>
                                {t.status}
                              </span>
                            </div>

                            <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-100 leading-relaxed font-medium">
                              {t.message}
                            </p>

                            {/* Replies Thread */}
                            {t.replies.length > 0 && (
                              <div className="space-y-2.5 pl-4 border-l-2 border-indigo-100">
                                {t.replies.map((rep: any, idx: number) => (
                                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-100 text-[11px] space-y-1">
                                    <div className="flex justify-between items-center text-[10px] text-indigo-600 font-bold">
                                      <span>{rep.sender}</span>
                                      <span className="text-slate-400 font-normal">{new Date(rep.date).toLocaleDateString("pt-BR")}</span>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed font-medium">{rep.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Input Form */}
                            <div className="space-y-2 pt-2">
                              <textarea
                                value={replyTextMap[t.id] || ""}
                                onChange={(e) => setReplyTextMap(prev => ({ ...prev, [t.id]: e.target.value }))}
                                placeholder="Digite sua resposta master oficial para este parceiro..."
                                className="w-full bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3 text-xs placeholder-slate-400 focus:outline-none min-h-[70px]"
                                id={`textarea-reply-${t.id}`}
                              />
                              <div className="flex justify-end">
                                <button
                                  onClick={() => handleReplyTicket(t.id)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-lg text-[10px] uppercase transition-colors cursor-pointer"
                                  id={`btn-reply-${t.id}`}
                                >
                                  Enviar Resposta
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}


              {/* ========================================================================
                  SUPER ADMIN TAB 8: ACCESS REQUESTS
              ======================================================================== */}
              {activeTab === "superadmin_access_requests" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 uppercase">Solicitações de Acesso à Plataforma</h4>
                      <p className="text-[11px] text-slate-400">Analise e aprove demonstrações ou registros pendentes de novos leads comerciais.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold pb-2 uppercase">
                            <th className="py-2">Responsável</th>
                            <th className="py-2">E-mail</th>
                            <th className="py-2">Telefone</th>
                            <th className="py-2">Nome Comercial</th>
                            <th className="py-2">Status</th>
                            <th className="py-2 text-right">Ação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {saasAccessRequests.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400 font-semibold">
                                Nenhuma solicitação pendente.
                              </td>
                            </tr>
                          ) : (
                            saasAccessRequests.map((r) => (
                              <tr key={r.id}>
                                <td className="py-3 font-semibold text-slate-800">{r.name}</td>
                                <td className="py-3 text-slate-600 font-mono">{r.email}</td>
                                <td className="py-3 text-slate-500 font-mono">{r.phone || "-"}</td>
                                <td className="py-3 font-semibold text-slate-700">{r.companyName}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    r.status === "aprovado" 
                                      ? "bg-emerald-100 text-emerald-700" 
                                      : "bg-amber-100 text-amber-700"
                                  }`}>
                                    {r.status}
                                  </span>
                                </td>
                                <td className="py-3 text-right">
                                  {r.status === "pendente" ? (
                                    <button
                                      onClick={() => handleApproveAccessRequest(r.id)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-3 rounded-lg text-[10px] uppercase transition-colors cursor-pointer"
                                      id={`btn-approve-req-${r.id}`}
                                    >
                                      Aprovar Acesso
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-emerald-600 font-bold">🟢 Autorizado</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================================
                  SUPER ADMIN TAB 8.5: GESTÃO DE MÓDULOS (SaaS Features)
              ======================================================================== */}
              {activeTab === "superadmin_modules" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900 uppercase tracking-tight">Gestão Master de Módulos por Empresa</h4>
                        <p className="text-xs text-slate-500 mt-1">Ative ou desative recursos específicos contratados pelas empresas registradas no sistema.</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <label htmlFor="select-module-company" className="text-xs font-bold text-slate-600 uppercase whitespace-nowrap">Empresa Contratante:</label>
                        <select
                          id="select-module-company"
                          value={selectedModuleCompanyId}
                          onChange={(e) => setSelectedModuleCompanyId(e.target.value)}
                          className="px-3.5 py-2 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                        >
                          {saasCompanies.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.responsibleName || "Admin"})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <form onSubmit={handleSaveCompanyModules} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        
                        {/* 1. Produtos */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.products 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.products}
                            onChange={(e) => setModulesMap({...modulesMap, products: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <Package className="w-4 h-4 text-emerald-600" />
                              Produtos
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Gerenciamento completo de produtos, marcas, precificação e margens comerciais.
                            </span>
                          </div>
                        </label>

                        {/* 2. Estoque */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.stock 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.stock}
                            onChange={(e) => setModulesMap({...modulesMap, stock: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <Layers className="w-4 h-4 text-emerald-600" />
                              Estoque
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Monitoramento físico de quantidades, alertas de nível mínimo e movimentações.
                            </span>
                          </div>
                        </label>

                        {/* 3. Compras */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.compras 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.compras}
                            onChange={(e) => setModulesMap({...modulesMap, compras: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <ShoppingCart className="w-4 h-4 text-emerald-600" />
                              Compras
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Disparo de solicitações de abastecimento de estoque e pedidos de compra.
                            </span>
                          </div>
                        </label>

                        {/* 4. Fornecedores */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.fornecedores 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.fornecedores}
                            onChange={(e) => setModulesMap({...modulesMap, fornecedores: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <Users className="w-4 h-4 text-emerald-600" />
                              Fornecedores
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Cadastro de parceiros comerciais, contatos, CNPJ e histórico de compras.
                            </span>
                          </div>
                        </label>

                        {/* 5. Clientes */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.clients 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.clients}
                            onChange={(e) => setModulesMap({...modulesMap, clients: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <User className="w-4 h-4 text-emerald-600" />
                              Clientes
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Registro de compradores, análise de crédito, histórico e faturamento direto.
                            </span>
                          </div>
                        </label>

                        {/* 6. Financeiro */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.finance 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.finance}
                            onChange={(e) => setModulesMap({...modulesMap, finance: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <DollarSign className="w-4 h-4 text-emerald-600" />
                              Financeiro
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Lançamentos de receitas e despesas, fluxo de caixa operacional e DRE.
                            </span>
                          </div>
                        </label>

                        {/* 7. Relatórios */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.reports 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.reports}
                            onChange={(e) => setModulesMap({...modulesMap, reports: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <FileText className="w-4 h-4 text-emerald-600" />
                              Relatórios
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Exportações e gráficos de faturamento, vendas e movimentação operacional.
                            </span>
                          </div>
                        </label>

                        {/* 8. Eu (IA) */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.ai_assistant 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.ai_assistant}
                            onChange={(e) => setModulesMap({...modulesMap, ai_assistant: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <Bot className="w-4 h-4 text-emerald-600" />
                              Eu
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Assistente de Inteligência Artificial integrado para insights e projeções de estoque.
                            </span>
                          </div>
                        </label>

                        {/* 9. WhatsApp */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.whatsapp 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.whatsapp}
                            onChange={(e) => setModulesMap({...modulesMap, whatsapp: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <Phone className="w-4 h-4 text-emerald-600" />
                              WhatsApp
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Envio automático de alertas de estoque crítico e faturamento via WhatsApp.
                            </span>
                          </div>
                        </label>

                        {/* 10. Código de barras */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.barcode 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.barcode}
                            onChange={(e) => setModulesMap({...modulesMap, barcode: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <Scan className="w-4 h-4 text-emerald-600" />
                              Código de barras
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Pesquisa automática de nomes e fotos de produtos por EAN/UPC na API nacional.
                            </span>
                          </div>
                        </label>

                        {/* 11. Controle de Lotes */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.lot_control 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.lot_control}
                            onChange={(e) => setModulesMap({...modulesMap, lot_control: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <Layers className="w-4 h-4 text-emerald-600" />
                              Controle de Lotes
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Rastreabilidade de validade de mercadorias, lote de fabricação e perdas estruturadas.
                            </span>
                          </div>
                        </label>

                        {/* 12. Localização de Estoque */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.location_control 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.location_control}
                            onChange={(e) => setModulesMap({...modulesMap, location_control: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <MapPin className="w-4 h-4 text-emerald-600" />
                              Localização de Estoque
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Setorização física de estoque (rua, prateleira, nível) para agilizar picking de produtos.
                            </span>
                          </div>
                        </label>

                        {/* 13. Multiusuários */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.multi_users 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.multi_users}
                            onChange={(e) => setModulesMap({...modulesMap, multi_users: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <Shield className="w-4 h-4 text-emerald-600" />
                              Multiusuários
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Controle de múltiplos logins com perfis de permissão refinados (Sellers, Admins, Op).
                            </span>
                          </div>
                        </label>

                        {/* 14. Aprovação de Compras */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.compras_approval 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.compras_approval}
                            onChange={(e) => setModulesMap({...modulesMap, compras_approval: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <ClipboardCheck className="w-4 h-4 text-emerald-600" />
                              Aprovação de Compras
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Alçada de aprovação financeira para pedidos de reposição de estoque feitos por compradores.
                            </span>
                          </div>
                        </label>

                        {/* 15. Frente de Caixa (PDV) */}
                        <label 
                          className={`p-4 rounded-2xl border cursor-pointer flex gap-3.5 items-start transition-all select-none ${
                            modulesMap.use_pdv 
                              ? "bg-emerald-50/50 border-emerald-200/80 shadow-sm" 
                              : "bg-white border-slate-200/80 hover:bg-slate-50/30"
                          }`}
                        >
                          <input 
                            type="checkbox"
                            checked={!!modulesMap.use_pdv}
                            onChange={(e) => setModulesMap({...modulesMap, use_pdv: e.target.checked})}
                            className="w-4.5 h-4.5 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                          />
                          <div className="space-y-1">
                            <span className="flex items-center gap-1.5 font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                              <ShoppingCart className="w-4 h-4 text-emerald-600" />
                              Frente de Caixa (PDV)
                            </span>
                            <span className="text-[11px] text-slate-500 block leading-relaxed">
                              Terminal de vendas pdv, abertura/fechamento de operador e impressão de comprovantes térmicos.
                            </span>
                          </div>
                        </label>

                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="submit"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                        >
                          Salvar Configuração
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}



              {activeTab === "superadmin_logs" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-5 space-y-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 uppercase">Logs de Auditoria do Sistema</h4>
                      <p className="text-[11px] text-slate-400">Rastreamento e segurança operacional de todas as ações executadas no Painel Master.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse font-mono font-bold">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold pb-2 uppercase text-[10px]">
                            <th className="py-2">Operador</th>
                            <th className="py-2">Ação</th>
                            <th className="py-2">Detalhes</th>
                            <th className="py-2 text-right">Data/Hora</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-[11px]">
                          {saasAuditLogs.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                                Nenhum log registrado.
                              </td>
                            </tr>
                          ) : (
                            saasAuditLogs.map((l) => (
                              <tr key={l.id} className="hover:bg-slate-50/50">
                                <td className="py-3 font-bold text-slate-700">{l.operator}</td>
                                <td className="py-3 font-bold text-indigo-600">{l.action}</td>
                                <td className="py-3 text-slate-600 max-w-xs truncate">{l.details}</td>
                                <td className="py-3 text-slate-400 text-right">
                                  {new Date(l.date).toLocaleDateString("pt-BR")} {new Date(l.date).toLocaleTimeString("pt-BR")}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </>
          )}

        </main>

      </div>


      {/* ========================================================================
          DOCK MODALS (Add Product, Add Client, Add Sale)
      ======================================================================== */}
      
      {/* A. PRODUCT CREATION MODAL */}
      <AnimatePresence>
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProductModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Body card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900">{editingProduct ? "✏️ Editar Produto" : "Novo Cadastro de Produto"}</h3>
                <button 
                  onClick={closeProductModal}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors font-bold text-sm cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Nome Comercial</label>
                  <input 
                    type="text" 
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    onBlur={() => {
                      if (newProduct.name && !newProduct.image && !suggestedImage) {
                        triggerImageSearch(newProduct.name, newProduct.barcode);
                      }
                    }}
                    placeholder="Ex: Teclado Mecânico RGB Wireless"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Código de Barras / EAN</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={newProduct.barcode}
                      onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                      onBlur={() => {
                        if (newProduct.barcode && !newProduct.image && !suggestedImage) {
                          triggerImageSearch(newProduct.name, newProduct.barcode);
                        }
                      }}
                      placeholder="Ex: 7891234567890"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      disabled={searchingBarcode}
                      onClick={() => handleBarcodeLookup(newProduct.barcode)}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      {searchingBarcode ? (
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : "🏷️ Autopreencher"}
                    </button>
                    <button
                      type="button"
                      disabled={searchingImage}
                      onClick={() => triggerImageSearch(newProduct.name, newProduct.barcode)}
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      {searchingImage ? (
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : "🔍 Buscar Imagem"}
                    </button>
                  </div>
                </div>

                {/* IMAGEM DO PRODUTO */}
                <div className="space-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Imagem do Produto</label>
                  
                  {searchingImage && (
                    <div className="py-3 flex items-center justify-center gap-2 text-xs text-slate-500 font-semibold bg-emerald-50/50 border border-emerald-100/50 rounded-xl animate-pulse">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                      Buscando foto automaticamente...
                    </div>
                  )}

                  {showImagePrompt && suggestedImage && (
                    <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3 space-y-3">
                      <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        ✨ Foto localizada automaticamente!
                      </p>
                      <div className="flex items-center gap-3">
                        <img 
                          src={suggestedImage} 
                          alt="Sugestão" 
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                        />
                        <div className="space-y-1.5 flex-1">
                          <p className="text-[11px] text-slate-600 font-medium">Deseja usar esta imagem no cadastro?</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setNewProduct({ ...newProduct, image: suggestedImage });
                                setShowImagePrompt(false);
                                setSuggestedImage(null);
                                showToast("Imagem aplicada com sucesso!", "success");
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              ✔ Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowImagePrompt(false);
                                setSuggestedImage(null);
                              }}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              ✖ Escolher outra
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!showImagePrompt && (
                    <div className="space-y-3">
                      {newProduct.image ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={newProduct.image} 
                            alt="Produto" 
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                          />
                          <div className="space-y-1">
                            <span className="block text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 w-max">
                              Imagem Definida
                            </span>
                            <button
                              type="button"
                              onClick={() => setNewProduct({ ...newProduct, image: "" })}
                              className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                            >
                              Remover imagem
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Nenhuma foto vinculada a este produto.</p>
                      )}

                      {cameraActive ? (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-black relative">
                          <video id="webcam" autoPlay playsInline className="w-full max-h-48 object-cover" />
                          <div className="p-2 bg-slate-900 flex justify-between gap-2">
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              📸 Capturar Foto
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={startCamera}
                            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Camera className="w-4 h-4 text-slate-500" />
                            <span>📷 Tirar Foto</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => document.getElementById("fileUploadInput")?.click()}
                            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-4 h-4 text-slate-500" />
                            <span>📁 Enviar Foto</span>
                          </button>
                          <input 
                            type="file" 
                            id="fileUploadInput" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">SKU / Código</label>
                    <input 
                      type="text" 
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                      placeholder="Ex: KEY-RGB-01"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Categoria</label>
                    <input 
                      type="text" 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      placeholder="Ex: Periféricos"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Marca</label>
                    <input 
                      type="text" 
                      value={newProduct.marca}
                      onChange={(e) => setNewProduct({...newProduct, marca: e.target.value})}
                      placeholder="Ex: Corsair"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Unidade de Medida</label>
                    <select 
                      value={newProduct.unidade}
                      onChange={(e) => setNewProduct({...newProduct, unidade: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700"
                    >
                      <option value="Unidade">Unidade (un)</option>
                      <option value="Caixa">Caixa (cx)</option>
                      <option value="Pacote">Pacote (pct)</option>
                      <option value="Kg">Quilograma (kg)</option>
                      <option value="Litro">Litro (l)</option>
                      <option value="Metro">Metro (m)</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Fornecedor</label>
                    <input 
                      type="text" 
                      value={newProduct.supplier}
                      onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                      placeholder="Ex: Tech Distribuidora LTDA"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Localização Física</label>
                    <input 
                      type="text" 
                      value={newProduct.location}
                      onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                      placeholder="Ex: Prateleira B3"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ValueInputField
                    id="product_costPrice"
                    label="Preço de Custo"
                    value={newProduct.costPrice}
                    onChange={(val) => setNewProduct({...newProduct, costPrice: val})}
                    placeholder="150.00"
                    required
                  />
                  <ValueInputField
                    id="product_price"
                    label="Preço de Venda"
                    value={newProduct.price}
                    onChange={(val) => setNewProduct({...newProduct, price: val})}
                    placeholder="299.90"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Estoque Inicial</label>
                    <input 
                      type="number" 
                      required
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      placeholder="Ex: 25"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Estoque Mínimo Alerta</label>
                    <input 
                      type="number" 
                      required
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                      placeholder="Ex: 5"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Descrição Completa</label>
                  <textarea 
                    value={newProduct.descricao}
                    onChange={(e) => setNewProduct({...newProduct, descricao: e.target.value})}
                    placeholder="Descrição detalhada sobre as especificações e características do produto..."
                    rows={2}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {editingProduct && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Status do Produto</label>
                    <select 
                      value={newProduct.status}
                      onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700 font-bold"
                    >
                      <option value="active">🟢 Ativo (Disponível para venda)</option>
                      <option value="inactive">🔴 Inativo (Bloqueado para venda)</option>
                    </select>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={closeProductModal}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Salvar Produto
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. PRODUCT DETAIL VIEW MODAL */}
      <AnimatePresence>
        {viewingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingProduct(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-sky-500" />
                  <h3 className="font-extrabold text-lg text-slate-900">Detalhes do Produto</h3>
                </div>
                <button 
                  onClick={() => setViewingProduct(null)}
                  className="bg-slate-200/80 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Image & Main stats */}
                  <div className="md:col-span-1 space-y-4 text-center md:text-left">
                    <div className="w-full aspect-square bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner mx-auto">
                      {viewingProduct.image ? (
                        <img 
                          src={viewingProduct.image} 
                          alt={viewingProduct.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-slate-300" />
                      )}
                    </div>
                    <div>
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 mb-1">
                        {viewingProduct.category}
                      </span>
                      <h4 className="text-xl font-bold text-slate-800 leading-tight">{viewingProduct.name}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-1">SKU: {viewingProduct.sku}</p>
                      {viewingProduct.barcode && (
                        <p className="text-xs text-slate-400 font-mono">EAN: {viewingProduct.barcode}</p>
                      )}
                    </div>
                  </div>

                  {/* Comprehensive Stats */}
                  <div className="md:col-span-2 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Estoque Atual</span>
                        <span className="text-2xl font-black text-slate-800">{viewingProduct.stock} <span className="text-xs text-slate-400 font-normal">{viewingProduct.unidade || "un"}</span></span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Estoque Mínimo</span>
                        <span className="text-2xl font-black text-slate-800">{viewingProduct.minStock} <span className="text-xs text-slate-400 font-normal">{viewingProduct.unidade || "un"}</span></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/50">
                        <span className="text-[10px] text-emerald-600 font-bold uppercase block">Preço de Venda</span>
                        <span className="text-xl font-black text-emerald-800">{formatCurrency(viewingProduct.price)}</span>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Preço de Custo</span>
                        <span className="text-xl font-bold text-slate-700">{formatCurrency(viewingProduct.costPrice)}</span>
                      </div>
                    </div>

                    {/* Meta info list */}
                    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 font-semibold block">Marca:</span>
                          <span className="text-slate-800 font-bold">{viewingProduct.marca || "Não informada"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block">Localização física:</span>
                          <span className="text-slate-800 font-bold">{viewingProduct.location || "Não definida"}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-slate-400 font-semibold block">Fornecedor:</span>
                          <span className="text-slate-800 font-bold">{viewingProduct.supplier || "Não informado"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-semibold block">Status:</span>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${viewingProduct.status === "inactive" ? "bg-slate-100 text-slate-600" : "bg-emerald-50 text-emerald-700"}`}>
                            {viewingProduct.status === "inactive" ? "Inativo" : "Ativo"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase block">Descrição do Produto</span>
                      <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100 min-h-[50px] leading-relaxed">
                        {viewingProduct.descricao || "Nenhuma descrição complementar cadastrada."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. QUICK STOCK MOVEMENT MODAL */}
      <AnimatePresence>
        {quickStockMovementProd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickStockMovementProd(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-emerald-500" />
                  <span>📦 Movimentar Estoque</span>
                </h3>
                <button 
                  onClick={() => setQuickStockMovementProd(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <form onSubmit={handleQuickStockMovementSubmit} className="p-6 space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                  {quickStockMovementProd.image ? (
                    <img 
                      src={quickStockMovementProd.image} 
                      alt={quickStockMovementProd.name} 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{quickStockMovementProd.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Saldo atual: {quickStockMovementProd.stock} {quickStockMovementProd.unidade || "un"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => { setQuickStockType("input"); setQuickStockReason("Compra"); }}
                    className={`p-3 rounded-xl border font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${quickStockType === "input" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-200 hover:bg-slate-50 text-slate-600"}`}
                  >
                    <PlusCircle className="w-5 h-5 text-emerald-600" />
                    <span>Entrada (+)</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setQuickStockType("output"); setQuickStockReason("Ajuste de Inventário"); }}
                    className={`p-3 rounded-xl border font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${quickStockType === "output" ? "border-rose-600 bg-rose-50 text-rose-700" : "border-slate-200 hover:bg-slate-50 text-slate-600"}`}
                  >
                    <MinusCircle className="w-5 h-5 text-rose-600" />
                    <span>Saída (-)</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Quantidade</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={quickStockQty}
                    onChange={(e) => setQuickStockQty(e.target.value)}
                    placeholder="Ex: 10"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Motivo / Origem</label>
                  <select 
                    value={quickStockReason}
                    onChange={(e) => setQuickStockReason(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700 font-semibold"
                  >
                    {quickStockType === "input" ? (
                      <>
                        <option value="Compra">Compra / Aquisição</option>
                        <option value="Devolução">Devolução de Cliente</option>
                        <option value="Ajuste de Inventário">Ajuste de Inventário</option>
                        <option value="Brinde">Brinde / Bonificação</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="Venda">Venda / Saída Comercial</option>
                        <option value="Ajuste de Inventário">Ajuste de Inventário</option>
                        <option value="Perda/Avaria">Perda, Roubo ou Avaria</option>
                        <option value="Consumo Interno">Consumo Interno / Uso próprio</option>
                        <option value="Outros">Outros</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Operador Responsável</label>
                  <input 
                    type="text" 
                    value={quickStockOperator}
                    onChange={(e) => setQuickStockOperator(e.target.value)}
                    placeholder={user?.name || "Nome do Operador"}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setQuickStockMovementProd(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md cursor-pointer"
                  >
                    Confirmar Movimentação
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. QUICK CONFIGURE PRODUCT MODAL */}
      <AnimatePresence>
        {configuringProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfiguringProduct(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-500" />
                  <span>⚙️ Configurar Alertas e Status</span>
                </h3>
                <button 
                  onClick={() => setConfiguringProduct(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Fechar
                </button>
              </div>

              <form onSubmit={handleQuickConfigureProductSubmit} className="p-6 space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                  {configuringProduct.image ? (
                    <img 
                      src={configuringProduct.image} 
                      alt={configuringProduct.name} 
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200">
                      <Package className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{configuringProduct.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">SKU: {configuringProduct.sku}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Estoque Mínimo Alerta</label>
                  <input 
                    type="number" 
                    required
                    value={configuringProduct.minStock}
                    onChange={(e) => setConfiguringProduct({ ...configuringProduct, minStock: Number(e.target.value) })}
                    placeholder="Ex: 5"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">Define o limite abaixo do qual o produto entrará em estado de reposição.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Localização no Estoque</label>
                  <input 
                    type="text" 
                    value={configuringProduct.location || ""}
                    onChange={(e) => setConfiguringProduct({ ...configuringProduct, location: e.target.value })}
                    placeholder="Ex: Prateleira B3"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400">Ajuda o operador de estoque a localizar fisicamente o item no galpão.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Status do Produto</label>
                  <select 
                    value={configuringProduct.status || "active"}
                    onChange={(e) => setConfiguringProduct({ ...configuringProduct, status: e.target.value as "active" | "inactive" })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white text-slate-700 font-bold"
                  >
                    <option value="active">🟢 Ativo (Aparece no Caixa / POS)</option>
                    <option value="inactive">🔴 Inativo (Bloqueado no Caixa / POS)</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setConfiguringProduct(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md cursor-pointer"
                  >
                    Salvar Configuração
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. DELETE HISTORY ALTERNATIVE DIALOG */}
      <AnimatePresence>
        {showDeleteHistoryDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteHistoryDialog(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 z-10"
            >
              <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-rose-50/50">
                <Ban className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-base text-slate-900">Operação não permitida</h3>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Este produto possui vendas ou movimentações registradas no histórico do sistema. Para preservar a integridade dos seus relatórios e balanços, ele não pode ser excluído definitivamente.
                </p>
                
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <p className="text-xs text-amber-800 font-medium">
                    💡 <strong>Alternativa recomendada:</strong> Você pode desativá-lo. Produtos desativados não aparecerão na Frente de Caixa e não poderão ser vendidos, mas continuarão preservados nos seus registros históricos.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button 
                    type="button"
                    onClick={() => setShowDeleteHistoryDialog(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Manter Ativo
                  </button>
                  <button 
                    type="button"
                    onClick={handleDeactivateProductAlternative}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Desativar Produto</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AA. PRODUCT PHOTO EDIT MODAL */}
      <AnimatePresence>
        {editingProductPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                stopCamera();
                setEditingProductPhoto(null);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Body card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900">Alterar Foto do Produto</h3>
                <button 
                  onClick={() => {
                    stopCamera();
                    setEditingProductPhoto(null);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors font-bold text-sm"
                >
                  Fechar
                </button>
              </div>

              <form onSubmit={handleUpdateProductPhoto} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                  <p className="text-sm font-bold text-slate-800">{editingProductPhoto.name}</p>
                  <p className="text-xs text-slate-500 font-mono">SKU: {editingProductPhoto.sku}</p>
                  {editingProductPhoto.barcode && (
                    <p className="text-xs text-slate-500 font-mono">EAN: {editingProductPhoto.barcode}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Buscar Imagem Automaticamente</label>
                  <button
                    type="button"
                    disabled={searchingImage}
                    onClick={() => triggerImageSearch(editingProductPhoto.name, editingProductPhoto.barcode)}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {searchingImage ? (
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : "🔍 Localizar Foto na Internet"}
                  </button>
                </div>

                {/* IMAGEM DO PRODUTO */}
                <div className="space-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Imagem Atual / Nova</label>
                  
                  {searchingImage && (
                    <div className="py-3 flex items-center justify-center gap-2 text-xs text-slate-500 font-semibold bg-emerald-50/50 border border-emerald-100/50 rounded-xl animate-pulse">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                      Buscando foto automaticamente...
                    </div>
                  )}

                  {showImagePrompt && suggestedImage && (
                    <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-3 space-y-3">
                      <p className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                        ✨ Foto localizada automaticamente!
                      </p>
                      <div className="flex items-center gap-3">
                        <img 
                          src={suggestedImage} 
                          alt="Sugestão" 
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                        />
                        <div className="space-y-1.5 flex-1">
                          <p className="text-[11px] text-slate-600 font-medium">Deseja usar esta imagem para este produto?</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingProductPhoto({ ...editingProductPhoto, image: suggestedImage });
                                setShowImagePrompt(false);
                                setSuggestedImage(null);
                                showToast("Imagem aplicada!", "success");
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              ✔ Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowImagePrompt(false);
                                setSuggestedImage(null);
                              }}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              ✖ Escolher outra
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {!showImagePrompt && (
                    <div className="space-y-3">
                      {editingProductPhoto.image ? (
                        <div className="flex items-center gap-3">
                          <img 
                            src={editingProductPhoto.image} 
                            alt="Produto" 
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm"
                          />
                          <div className="space-y-1">
                            <span className="block text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 rounded px-1.5 py-0.5 w-max">
                              Imagem Definida
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditingProductPhoto({ ...editingProductPhoto, image: "" })}
                              className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                            >
                              Remover imagem
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Nenhuma foto vinculada a este produto.</p>
                      )}

                      {cameraActive ? (
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-black relative">
                          <video id="webcam" autoPlay playsInline className="w-full max-h-48 object-cover" />
                          <div className="p-2 bg-slate-900 flex justify-between gap-2">
                            <button
                              type="button"
                              onClick={stopCamera}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={capturePhoto}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
                            >
                              📸 Capturar Foto
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={startCamera}
                            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Camera className="w-4 h-4 text-slate-500" />
                            <span>📷 Tirar Foto</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => document.getElementById("fileUploadEditInput")?.click()}
                            className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 px-3 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Upload className="w-4 h-4 text-slate-500" />
                            <span>📁 Enviar Foto</span>
                          </button>
                          <input 
                            type="file" 
                            id="fileUploadEditInput" 
                            accept="image/*" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      stopCamera();
                      setEditingProductPhoto(null);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WHATSAPP ALERTS CONFIGURATION MODAL */}
      <AnimatePresence>
        {whatsappConfigOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWhatsappConfigOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 z-50"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Integração WhatsApp</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Alertas inteligentes no celular do proprietário</p>
                  </div>
                </div>
                <button 
                  onClick={() => setWhatsappConfigOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Número de WhatsApp</label>
                  <input 
                    type="text"
                    placeholder="Ex: 5511999999999 (com DDI + DDD)"
                    defaultValue={whatsappConfig?.whatsappPhone || ""}
                    id="waPhoneInput"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">
                    Insira o número completo iniciando com o código do país (Brasil: 55), seguido de DDD e número, apenas dígitos.
                  </p>
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start gap-3 bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl">
                  <input 
                    type="checkbox"
                    id="waEnabledInput"
                    defaultChecked={whatsappConfig?.whatsappEnabled ?? false}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="waEnabledInput" className="text-xs text-slate-600 font-semibold leading-relaxed cursor-pointer select-none">
                    Autorizo o sistema <span className="text-emerald-700 font-bold">Meu Gestor</span> a enviar notificações automáticas e manuais de níveis de estoque baixo para meu WhatsApp cadastrado.
                  </label>
                </div>

                {/* Message preview block */}
                <div className="border border-slate-100 bg-slate-50 rounded-xl p-4 space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prévia da Mensagem</span>
                  <div className="bg-white border border-slate-100 rounded-lg p-3 text-[11px] font-mono text-slate-600 space-y-1">
                    <p className="text-slate-500 font-bold">⚠️ Meu Gestor</p>
                    <p>Seu estoque está baixo.</p>
                    <p className="font-bold text-slate-800 mt-2">Produto:</p>
                    <p>Arroz 5kg</p>
                    <p className="font-bold text-slate-800 mt-2">Quantidade atual:</p>
                    <p>4 unidades</p>
                    <p className="font-bold text-slate-800 mt-2">Estoque mínimo:</p>
                    <p>10 unidades</p>
                    <p className="text-slate-400 mt-2">Acesse o sistema para realizar a reposição.</p>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setWhatsappConfigOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const enabled = (document.getElementById("waEnabledInput") as HTMLInputElement)?.checked ?? false;
                      const phone = (document.getElementById("waPhoneInput") as HTMLInputElement)?.value ?? "";
                      handleSaveWhatsappConfig(enabled, phone);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Confirmar & Ativar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. CLIENT CREATION MODAL */}
      <AnimatePresence>
        {clientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClientModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900">Novo Cadastro de Cliente</h3>
                <button 
                  onClick={() => setClientModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors font-bold text-sm"
                >
                  Fechar
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="p-6 space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Nome / Razão Social</label>
                  <input 
                    type="text" 
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="Ex: Tech Solutions Distribuidores Ltda"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">CPF ou CNPJ</label>
                  <input 
                    type="text" 
                    value={newClient.document}
                    onChange={(e) => setNewClient({...newClient, document: e.target.value})}
                    placeholder="Ex: 00.000.000/0001-00"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">E-mail Corporativo</label>
                    <input 
                      type="email" 
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      placeholder="Ex: compras@empresa.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Telefone / Celular</label>
                    <input 
                      type="text" 
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      placeholder="Ex: (11) 98888-2222"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Cidade</label>
                    <input 
                      type="text" 
                      value={newClient.city}
                      onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                      placeholder="Ex: São Paulo"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Estado (UF)</label>
                    <input 
                      type="text" 
                      maxLength={2}
                      value={newClient.state}
                      onChange={(e) => setNewClient({...newClient, state: e.target.value.toUpperCase()})}
                      placeholder="Ex: SP"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setClientModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Salvar Cliente
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. SALE RECORDING MODAL */}
      <AnimatePresence>
        {saleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSaleModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-lg text-slate-900">Registrar Lançamento de Venda</h3>
                <button 
                  onClick={() => setSaleModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors font-bold text-sm"
                >
                  Fechar
                </button>
              </div>

              <form onSubmit={handleCreateSale} className="p-6 space-y-4">
                
                {/* Product Select list */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Produto Vendido</label>
                  <select 
                    required
                    value={newSale.productId}
                    onChange={(e) => setNewSale({...newSale, productId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 bg-white"
                  >
                    <option value="">Selecione um produto cadastrado</option>
                    {allProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatCurrency(p.price)} - Qtd: {p.stock})</option>
                    ))}
                  </select>
                </div>

                {/* Client select list */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Cliente Adquirente</label>
                  <select 
                    value={newSale.clientId}
                    onChange={(e) => setNewSale({...newSale, clientId: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 bg-white"
                  >
                    <option value="">Consumidor Final (Sem cadastro)</option>
                    {allClients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Quantidade Itens</label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      value={newSale.quantity}
                      onChange={(e) => setNewSale({...newSale, quantity: e.target.value})}
                      placeholder="Ex: 1"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Status do Faturamento</label>
                    <select 
                      value={newSale.status}
                      onChange={(e) => setNewSale({...newSale, status: e.target.value as any})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 bg-white"
                    >
                      <option value="completed">Concluída (Pago)</option>
                      <option value="pending">Aguardando Pagamento</option>
                    </select>
                  </div>
                </div>

                {/* Simulated dynamic total display */}
                {newSale.productId && (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span>Subtotal Itens:</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(
                          (allProducts.find(p => p.id === newSale.productId)?.price || 0) * Number(newSale.quantity || 1)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium text-emerald-600">
                      <span>Margem Estimada:</span>
                      <span className="font-bold">
                        {formatCurrency(
                          ((allProducts.find(p => p.id === newSale.productId)?.price || 0) - 
                           (allProducts.find(p => p.id === newSale.productId)?.costPrice || 0)) * Number(newSale.quantity || 1)
                        )}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setSaleModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Lançar Venda
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* E. TEAM USER CREATION & EDIT MODAL */}
      <AnimatePresence>
        {teamUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTeamUserModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Body card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 z-10 space-y-5 overflow-y-auto max-h-[90vh]"
            >
              
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Membro da Equipe</span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {editingTeamUser ? "Editar Membro" : "Convidar Colaborador"}
                </h3>
                <p className="text-slate-400 text-xs">Preencha os dados do colaborador para configurar seu nível de acesso.</p>
              </div>

              <form onSubmit={handleCreateOrUpdateTeamUser} className="space-y-4">
                
                {/* PROFILE PHOTO SELECTOR / SNAPSHOT */}
                <div className="space-y-2 border border-slate-100 rounded-xl p-4 bg-slate-50/50">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Foto do Colaborador</label>
                  
                  <div className="flex items-center gap-4">
                    {newTeamUser.photo ? (
                      <img 
                        src={newTeamUser.photo} 
                        alt="Preview" 
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xl uppercase flex-shrink-0">
                        {newTeamUser.name ? newTeamUser.name.slice(0, 2) : <User className="w-6 h-6 text-slate-400" />}
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-1">
                      <input 
                        type="text"
                        placeholder="Cole a URL da foto ou use abaixo"
                        value={newTeamUser.photo}
                        onChange={(e) => setNewTeamUser({ ...newTeamUser, photo: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const fileInput = document.getElementById("team-photo-file") as HTMLInputElement;
                            if (fileInput) fileInput.click();
                          }}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 font-bold px-2.5 py-1.5 rounded-lg text-slate-700 transition-colors cursor-pointer"
                        >
                          📤 Enviar Arquivo
                        </button>
                        <input 
                          id="team-photo-file"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                        {newTeamUser.photo && (
                          <button
                            type="button"
                            onClick={() => setNewTeamUser({ ...newTeamUser, photo: "" })}
                            className="text-[10px] text-red-600 hover:underline font-bold"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {cameraActive ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-black relative mt-2">
                      <video id="webcam" autoPlay playsInline className="w-full max-h-48 object-cover" />
                      <div className="p-2 bg-slate-900 flex justify-between gap-2">
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          📸 Capturar Foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10px] font-bold py-2 px-3 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      <span>📸 Tirar Foto da Webcam</span>
                    </button>
                  )}
                </div>

                {/* DADOS PESSOAIS SECTION */}
                <div className="space-y-4 border-b border-slate-100 pb-5">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">👤</span>
                    Dados Pessoais
                  </h3>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Nome Completo <span className="text-rose-500">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={newTeamUser.name}
                      onChange={(e) => setNewTeamUser({...newTeamUser, name: e.target.value})}
                      placeholder="Ex: Mariana Souza"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">CPF (Opcional)</label>
                      <input 
                        type="text" 
                        value={newTeamUser.cpf || ""}
                        onChange={(e) => setNewTeamUser({...newTeamUser, cpf: e.target.value})}
                        placeholder="000.000.000-00"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Telefone</label>
                      <input 
                        type="text" 
                        value={newTeamUser.phone}
                        onChange={(e) => setNewTeamUser({...newTeamUser, phone: e.target.value})}
                        placeholder="(11) 97777-6666"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">E-mail (Opcional)</label>
                      <input 
                        type="email" 
                        value={newTeamUser.email}
                        onChange={(e) => setNewTeamUser({...newTeamUser, email: e.target.value})}
                        placeholder="mariana@empresa.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Cargo</label>
                      <input 
                        type="text" 
                        value={newTeamUser.cargo}
                        onChange={(e) => setNewTeamUser({...newTeamUser, cargo: e.target.value})}
                        placeholder="Ex: Auxiliar Administrativo"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Setor</label>
                      <input 
                        type="text" 
                        value={newTeamUser.setor || ""}
                        onChange={(e) => setNewTeamUser({...newTeamUser, setor: e.target.value})}
                        placeholder="Ex: Comercial, Financeiro"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Data de Admissão</label>
                      <input 
                        type="date" 
                        required
                        value={newTeamUser.admissaoDate ? newTeamUser.admissaoDate.substring(0, 10) : ""}
                        onChange={(e) => setNewTeamUser({...newTeamUser, admissaoDate: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Observações</label>
                    <textarea 
                      value={newTeamUser.observacoes || ""}
                      onChange={(e) => setNewTeamUser({...newTeamUser, observacoes: e.target.value})}
                      placeholder="Notas ou observações adicionais..."
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setTeamUserModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Salvar Funcionário
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* USER SYSTEM ACCESS SETUP MODAL (MÓDULO 2) */}
      <AnimatePresence>
        {userAccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setUserAccessModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Body card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 z-10 space-y-5 overflow-y-auto max-h-[90vh]"
            >
              <div className="space-y-1">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Acesso ao Sistema</span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {editingUserAccess ? "Editar Credenciais" : "Liberar Acesso ao Sistema"}
                </h3>
                <p className="text-slate-400 text-xs">Crie ou atualize o usuário de login para acesso ao painel do Meu Gestor.</p>
              </div>

              <form onSubmit={handleSaveUserAccess} className="space-y-4">
                {/* SELECT EMPLOYEE FIELD */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Funcionário <span className="text-rose-500">*</span></label>
                  {editingUserAccess ? (
                    <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800">
                      {editingUserAccess.name}
                    </div>
                  ) : (
                    <select
                      required
                      value={selectedAccessEmployeeId}
                      onChange={(e) => {
                        const empId = e.target.value;
                        setSelectedAccessEmployeeId(empId);
                        // pre-fill username with some nice suggestion
                        const matched = teamUsers.find(u => u.id === empId);
                        if (matched) {
                          const suggestion = matched.name.toLowerCase().replace(/\s+/g, ".").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                          setNewUserAccess(prev => ({ ...prev, username: suggestion }));
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 bg-white"
                    >
                      <option value="">Selecione um funcionário...</option>
                      {teamUsers.filter(u => u.hasAccess !== true).map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.cargo || "Sem cargo"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* USERNAME / LOGIN */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Usuário (login) <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-bold text-sm">@</span>
                    <input 
                      type="text" 
                      required
                      value={newUserAccess.username}
                      onChange={(e) => setNewUserAccess({...newUserAccess, username: e.target.value.toLowerCase().replace(/\s+/g, "")})}
                      placeholder="Ex: mariana.silva"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-slate-800"
                    />
                  </div>
                </div>

                {/* PASSWORDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      {editingUserAccess ? "Nova Senha" : "Senha"} {!editingUserAccess && <span className="text-rose-500">*</span>}
                    </label>
                    <input 
                      type="password" 
                      required={!editingUserAccess}
                      value={newUserAccess.password}
                      onChange={(e) => setNewUserAccess({...newUserAccess, password: e.target.value})}
                      placeholder={editingUserAccess ? "Manter atual" : "Mínimo 6 dígitos"}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">
                      Confirmar Senha {!editingUserAccess && <span className="text-rose-500">*</span>}
                    </label>
                    <input 
                      type="password" 
                      required={!editingUserAccess}
                      value={newUserAccess.confirmPassword}
                      onChange={(e) => setNewUserAccess({...newUserAccess, confirmPassword: e.target.value})}
                      placeholder="Repita a senha"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* ROLE PROFILE SELECTOR */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Perfil de Acesso</label>
                    <select 
                      value={
                        newUserAccess.role === "admin" ? "admin" :
                        newUserAccess.roleId === `role_gerente_${company?.id}` ? "gerente" :
                        newUserAccess.roleId === `role_operador_${company?.id}` ? "operador" :
                        newUserAccess.roleId === `role_estoquista_${company?.id}` ? "estoquista" :
                        newUserAccess.roleId === `role_financeiro_${company?.id}` ? "financeiro" :
                        newUserAccess.roleId === `role_compras_${company?.id}` ? "compras" : "personalizado"
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "admin") {
                          setNewUserAccess({
                            ...newUserAccess,
                            role: "admin",
                            roleId: `role_admin_${company?.id}`
                          });
                        } else if (val === "gerente") {
                          setNewUserAccess({
                            ...newUserAccess,
                            role: "user",
                            roleId: `role_gerente_${company?.id}`
                          });
                        } else if (val === "operador") {
                          setNewUserAccess({
                            ...newUserAccess,
                            role: "user",
                            roleId: `role_operador_${company?.id}`
                          });
                        } else if (val === "estoquista") {
                          setNewUserAccess({
                            ...newUserAccess,
                            role: "user",
                            roleId: `role_estoquista_${company?.id}`
                          });
                        } else if (val === "financeiro") {
                          setNewUserAccess({
                            ...newUserAccess,
                            role: "user",
                            roleId: `role_financeiro_${company?.id}`
                          });
                        } else if (val === "compras") {
                          setNewUserAccess({
                            ...newUserAccess,
                            role: "user",
                            roleId: `role_compras_${company?.id}`
                          });
                        } else {
                          setNewUserAccess({
                            ...newUserAccess,
                            role: "user",
                            roleId: ""
                          });
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 bg-white"
                    >
                      <option value="admin">Administrador</option>
                      <option value="gerente">Gerente</option>
                      <option value="operador">Operador de Caixa</option>
                      <option value="estoquista">Estoquista</option>
                      <option value="financeiro">Financeiro</option>
                      <option value="compras">Compras</option>
                      <option value="personalizado">Personalizado</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Status do Acesso</label>
                    <select 
                      value={newUserAccess.status || "active"}
                      onChange={(e) => setNewUserAccess({...newUserAccess, status: e.target.value as "active" | "inactive"})}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 bg-white"
                    >
                      <option value="active">🟢 Ativo</option>
                      <option value="inactive">🔴 Bloqueado</option>
                    </select>
                  </div>
                </div>

                {/* Personalizado Selection dropdown */}
                {(newUserAccess.role !== "admin" && 
                  newUserAccess.roleId !== `role_gerente_${company?.id}` &&
                  newUserAccess.roleId !== `role_operador_${company?.id}` &&
                  newUserAccess.roleId !== `role_estoquista_${company?.id}` &&
                  newUserAccess.roleId !== `role_financeiro_${company?.id}` &&
                  newUserAccess.roleId !== `role_compras_${company?.id}`) && (
                  <div className="space-y-1.5 border border-slate-100 p-3 bg-slate-50 rounded-xl animate-fadeIn">
                    <label className="text-xs font-bold text-slate-700 uppercase">Selecione o Cargo Customizado</label>
                    <select 
                      required
                      value={newUserAccess.roleId}
                      onChange={(e) => {
                        setNewUserAccess({
                          ...newUserAccess,
                          roleId: e.target.value
                        });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 bg-white"
                    >
                      <option value="">Selecione um perfil customizado...</option>
                      {customRoles.filter(r => !r.id.startsWith("role_")).map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setUserAccessModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    Confirmar Acesso
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REDEFINE PASSWORD MODAL */}
      <AnimatePresence>
        {redefinePasswordOpen && redefinePasswordUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setRedefinePasswordOpen(false);
                setRedefinePasswordUser(null);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Body card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 z-10 space-y-5"
            >
              <div className="space-y-1">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Segurança</span>
                <h3 className="text-xl font-extrabold text-slate-900">Redefinir Senha</h3>
                <p className="text-slate-400 text-xs">Configure uma nova senha de acesso para o usuário de <strong>{redefinePasswordUser.name}</strong> (@{redefinePasswordUser.username}).</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Nova Senha <span className="text-rose-500">*</span></label>
                  <input 
                    type="password" 
                    value={redefinePasswordValue}
                    onChange={(e) => setRedefinePasswordValue(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Confirmar Nova Senha <span className="text-rose-500">*</span></label>
                  <input 
                    type="password" 
                    value={redefinePasswordConfirmValue}
                    onChange={(e) => setRedefinePasswordConfirmValue(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setRedefinePasswordOpen(false);
                      setRedefinePasswordUser(null);
                      setRedefinePasswordValue("");
                      setRedefinePasswordConfirmValue("");
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button"
                    onClick={handleRedefinePassword}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
                  >
                    Salvar Nova Senha
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM USER PERMISSIONS MODAL */}
      <AnimatePresence>
        {userPermissionsModalOpen && selectedPermissionUserId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setUserPermissionsModalOpen(false);
                setSelectedPermissionUserId(null);
                setSelectedPermissionUserPerms([]);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Body card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 z-10 space-y-5"
            >
              <div className="space-y-1">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Permissões Personalizadas</span>
                <h3 className="text-xl font-extrabold text-slate-900">Permissões do Usuário</h3>
                <p className="text-slate-400 text-xs">Selecione quais telas e operações o funcionário <strong>{teamUsers.find(u => u.id === selectedPermissionUserId)?.name}</strong> terá acesso direto.</p>
              </div>

              <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3.5 divide-y divide-slate-100">
                {[
                  { id: "view_stats", name: "Painel Principal / Dashboard", desc: "Visualizar métricas financeiras, estatísticas de vendas e gráficos." },
                  { id: "create_sales", name: "Frente de Caixa (PDV) / Abrir & Fechar Caixa", desc: "Registrar vendas, operar o caixa, abrir e fechar sessões." },
                  { id: "view_products", name: "Catálogo de Produtos", desc: "Visualizar produtos, preços de venda e consulta rápida." },
                  { id: "edit_products", name: "Estoque Administrativo & Adição", desc: "Adicionar novos produtos, editar informações e gerenciar estoque administrativo." },
                  { id: "view_sales", name: "Vendas & Relatórios de Faturamento", desc: "Visualizar o histórico detalhado de vendas e gráficos corporativos." },
                  { id: "view_clients", name: "Gerenciamento de Clientes", desc: "Cadastrar, editar e excluir clientes da empresa." },
                  { id: "manage_users", name: "Controle de Acessos & Usuários", desc: "Criar cargos, gerenciar acessos de login e configurar permissões." }
                ].map((perm) => {
                  const isChecked = selectedPermissionUserPerms.includes(perm.id);
                  return (
                    <div key={perm.id} className="flex items-start gap-3 pt-3 first:pt-0">
                      <input 
                        type="checkbox"
                        id={`perm-chk-${perm.id}`}
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            setSelectedPermissionUserPerms(selectedPermissionUserPerms.filter(id => id !== perm.id));
                          } else {
                            setSelectedPermissionUserPerms([...selectedPermissionUserPerms, perm.id]);
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-1 cursor-pointer"
                      />
                      <label htmlFor={`perm-chk-${perm.id}`} className="space-y-0.5 cursor-pointer flex-1">
                        <span className="block text-sm font-bold text-slate-800">{perm.name}</span>
                        <span className="block text-xs text-slate-400">{perm.desc}</span>
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => {
                    setUserPermissionsModalOpen(false);
                    setSelectedPermissionUserId(null);
                    setSelectedPermissionUserPerms([]);
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={handleSaveUserPermissions}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                >
                  Salvar Permissões
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* F. ROLE CREATION & EDIT MODAL */}
      <AnimatePresence>
        {roleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRoleModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Body card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 z-10 space-y-5 overflow-y-auto max-h-[90vh]"
            >
              
              <div className="space-y-1">
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Cargo & Permissões</span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {editingRole ? "Editar Cargo" : "Criar Novo Cargo"}
                </h3>
                <p className="text-slate-400 text-xs">Defina o nome, descrição e ative as permissões para este perfil de acesso.</p>
              </div>

              <form onSubmit={handleCreateOrUpdateRole} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Nome do Cargo</label>
                  <input 
                    type="text" 
                    required
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    placeholder="Ex: Auxiliar Administrativo"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Descrição das Atividades</label>
                  <textarea 
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                    placeholder="Para que serve este cargo na sua empresa..."
                    rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Checklist of permissions */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase block">Atribuir Permissões de Acesso</label>
                  <div className="border border-slate-150 rounded-2xl divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {permissions.map((perm) => {
                      const isChecked = newRole.permissions.includes(perm.id);
                      return (
                        <label 
                          key={perm.id} 
                          className="flex items-start gap-3 p-3.5 hover:bg-slate-50 transition-colors cursor-pointer select-none"
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const updatedPerms = isChecked
                                ? newRole.permissions.filter(p => p !== perm.id)
                                : [...newRole.permissions, perm.id];
                              setNewRole({...newRole, permissions: updatedPerms});
                            }}
                            className="mt-1 w-4 h-4 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="block text-xs font-bold text-slate-800">{perm.name}</span>
                            <span className="block text-[11px] text-slate-400 mt-0.5 leading-normal">{perm.description}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setRoleModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Salvar Cargo
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUPERADMIN MANUAL COMPANY EDIT AND VIEW MODALS */}
      <AnimatePresence>
        {isCompanyEditModalOpen && selectedCompanyForEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCompanyEditModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-lg w-full overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">✏️ Editar Cadastro de Empresa</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ID da Empresa: {selectedCompanyForEdit.id}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsCompanyEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCompanyEdit} className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase block">Nome da Empresa</label>
                  <input 
                    type="text" 
                    required
                    value={selectedCompanyForEdit.name || ""}
                    onChange={(e) => setSelectedCompanyForEdit({...selectedCompanyForEdit, name: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 font-semibold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase block">Responsável</label>
                  <input 
                    type="text" 
                    required
                    value={selectedCompanyForEdit.responsibleName || ""}
                    onChange={(e) => setSelectedCompanyForEdit({...selectedCompanyForEdit, responsibleName: e.target.value})}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase block">E-mail</label>
                    <input 
                      type="email" 
                      required
                      value={selectedCompanyForEdit.email || ""}
                      onChange={(e) => setSelectedCompanyForEdit({...selectedCompanyForEdit, email: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase block">Telefone</label>
                    <input 
                      type="text" 
                      required
                      value={selectedCompanyForEdit.phone || ""}
                      onChange={(e) => setSelectedCompanyForEdit({...selectedCompanyForEdit, phone: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase block text-[10px]">Usuário de Login (Admin)</label>
                    <input 
                      type="text" 
                      required
                      value={selectedCompanyForEdit.username || ""}
                      onChange={(e) => setSelectedCompanyForEdit({...selectedCompanyForEdit, username: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-white focus:ring-1 focus:ring-emerald-500 font-semibold"
                      placeholder="Username do administrador"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase block text-[10px]">Alterar Senha do Admin</label>
                    <input 
                      type="password" 
                      value={selectedCompanyForEdit.password || ""}
                      onChange={(e) => setSelectedCompanyForEdit({...selectedCompanyForEdit, password: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-white focus:ring-1 focus:ring-emerald-500 font-semibold"
                      placeholder="Deixe em branco para não alterar"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase block">Plano de Assinatura</label>
                    <select 
                      value={selectedCompanyForEdit.planId || ""}
                      onChange={(e) => setSelectedCompanyForEdit({...selectedCompanyForEdit, planId: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="">Selecione um plano</option>
                      {saasPlansList.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase block">Status da Empresa</label>
                    <select 
                      value={selectedCompanyForEdit.status || "active"}
                      onChange={(e) => setSelectedCompanyForEdit({...selectedCompanyForEdit, status: e.target.value})}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="active">🟢 Ativa</option>
                      <option value="trial">🟡 Em Teste</option>
                      <option value="pending_payment">🟠 Aguardando Liberação</option>
                      <option value="suspended">🔴 Suspensa</option>
                      <option value="blocked">⚫ Bloqueada</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 flex items-start gap-3">
                  <input 
                    id="edit-use-pdv"
                    type="checkbox" 
                    checked={selectedCompanyForEdit.usePdv !== false}
                    onChange={(e) => setSelectedCompanyForEdit({...selectedCompanyForEdit, usePdv: e.target.checked})}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer mt-0.5"
                  />
                  <div>
                    <label htmlFor="edit-use-pdv" className="font-extrabold text-slate-800 uppercase cursor-pointer block text-xs">Utilizar Frente de Caixa (PDV)</label>
                    <span className="text-[10px] text-slate-500 block font-semibold mt-0.5 leading-relaxed">
                      Se estiver desativado, oculta os módulos de Frente de Caixa, Caixa e Vendas para esta empresa.
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsCompanyEditModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-md shadow-emerald-600/10 cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {isCompanyViewModalOpen && selectedCompanyForView && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCompanyViewModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-lg w-full overflow-hidden z-10 flex flex-col max-h-[90vh]"
            >
              <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider">👁️ Visualizar Detalhes da Empresa</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">ID: {selectedCompanyForView.id}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsCompanyViewModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 font-sans">
                {/* Visual Header card */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-slate-800 text-base leading-tight">{selectedCompanyForView.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block mt-1">Meu Gestor Cliente</span>
                  </div>
                  <div>
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border shadow-sm ${
                      getStatusLabel(selectedCompanyForView.status).color
                    }`}>
                      {getStatusLabel(selectedCompanyForView.status).label}
                    </span>
                  </div>
                </div>

                {/* Company basic info */}
                <div className="space-y-3">
                  <h5 className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Cadastro Geral</h5>
                  <div className="grid grid-cols-2 gap-3 leading-relaxed">
                    <div>
                      <span className="text-slate-400 font-bold block">Responsável</span>
                      <span className="text-slate-800 font-extrabold text-xs">{selectedCompanyForView.responsibleName || selectedCompanyForView.ownerName || "Não informado"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Telefone</span>
                      <span className="text-slate-800 font-extrabold text-xs">{selectedCompanyForView.phone || "Não informado"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">E-mail</span>
                      <span className="text-slate-800 font-extrabold text-xs">{selectedCompanyForView.email || selectedCompanyForView.ownerEmail || "Não informado"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Cadastrada em</span>
                      <span className="text-slate-800 font-extrabold text-xs">
                        {selectedCompanyForView.createdAt ? new Date(selectedCompanyForView.createdAt).toLocaleString("pt-BR") : "Data não disponível"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subscription usage / stats info */}
                <div className="space-y-3">
                  <h5 className="font-black text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Plano e Licença Atuais</h5>

                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 space-y-2 leading-relaxed">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-600">Plano Ativo:</span>
                      <span className="font-extrabold text-emerald-800 uppercase">{selectedCompanyForView.planName || selectedCompanyForView.plan || "Nenhum"}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-600">Vencimento da Licença:</span>
                      <span className="font-bold text-slate-800">
                        {selectedCompanyForView.subscriptionExpiresAt 
                          ? new Date(selectedCompanyForView.subscriptionExpiresAt).toLocaleDateString("pt-BR") 
                          : "Sem prazo"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-600">Liberação Manual por Super Admin:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                        selectedCompanyForView.manualReleased ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                      }`}>
                        {selectedCompanyForView.manualReleased ? "SIM (Sem Cobrança)" : "NÃO"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsCompanyViewModalOpen(false)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-colors text-center block cursor-pointer"
                  >
                    Fechar Visualização
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-md w-full overflow-hidden z-10 p-6 space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase">Confirmar Operação</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">{confirmModal.message}</p>
                </div>
              </div>
              <div className="flex gap-3 pt-2 text-xs">
                <button 
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal(null);
                  }}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-rose-600/10 cursor-pointer"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
