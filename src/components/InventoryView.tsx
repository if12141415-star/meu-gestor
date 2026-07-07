import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Plus, 
  Minus, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  RefreshCw, 
  User, 
  Calendar, 
  ChevronRight,
  ClipboardList
} from "lucide-react";
import { Product } from "../types.ts";

interface InventoryViewProps {
  token: string;
  user: any;
  company: any;
  allProducts: Product[];
  onInventoryUpdate: () => void;
  showToast: (message: string, type?: "success" | "error") => void;
}

interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: "entrada" | "saida";
  quantity: number;
  reason: string;
  date: string;
  operator: string;
}

export default function InventoryView({
  token,
  user,
  company,
  allProducts,
  onInventoryUpdate,
  showToast
}: InventoryViewProps) {
  // Movements audit log (persisted on Server & fallback to localStorage)
  const [movements, setMovements] = useState<InventoryMovement[]>([]);

  // Fetch movements on mount
  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const res = await fetch("/api/stock-movements", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMovements(data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
      } catch (err) {
        console.error("Erro ao carregar movimentações do servidor:", err);
      }
    };
    if (token) {
      fetchMovements();
    }
  }, [token]);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "baixo" | "ok" | "esgotado">("todos");
  const [categoryFilter, setCategoryFilter] = useState("todos");

  // Selection state for quick stock adjusting
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<"entrada" | "saida">("entrada");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("Ajuste de Inventário");
  const [submitting, setSubmitting] = useState(false);

  // List categories dynamically
  const categories = ["todos", ...Array.from(new Set(allProducts.map(p => p.category)))];

  // Filters execution
  const filteredProducts = allProducts.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query) || (p.barcode && p.barcode.toLowerCase().includes(query));
    
    let matchesStatus = true;
    const isLow = p.stock <= p.minStock && p.stock > 0;
    const isOutOfStock = p.stock <= 0;

    if (statusFilter === "baixo") matchesStatus = isLow;
    else if (statusFilter === "ok") matchesStatus = p.stock > p.minStock;
    else if (statusFilter === "esgotado") matchesStatus = isOutOfStock;

    const matchesCategory = categoryFilter === "todos" || p.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Handle Inventory adjustments (Entrada/Saída)
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const qtyValue = Number(adjustQty);
    if (!qtyValue || qtyValue <= 0) {
      showToast("Insira uma quantidade maior que zero.", "error");
      return;
    }

    setSubmitting(true);
    try {
      // Calculate new stock level
      let newStock = selectedProduct.stock;
      if (adjustType === "entrada") {
        newStock += qtyValue;
      } else {
        newStock -= qtyValue;
      }

      if (newStock < 0) {
        showToast("O estoque final não pode ficar negativo.", "error");
        setSubmitting(false);
        return;
      }

      // Update the product on the server
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: selectedProduct.name,
          sku: selectedProduct.sku,
          barcode: selectedProduct.barcode || "",
          price: selectedProduct.price,
          costPrice: selectedProduct.costPrice,
          stock: newStock,
          minStock: selectedProduct.minStock,
          category: selectedProduct.category,
          image: selectedProduct.image || "",
          status: selectedProduct.status || "active"
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao salvar movimentação.");
      }

      // Record server movement audit log
      try {
        const movRes = await fetch("/api/stock-movements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            sku: selectedProduct.sku,
            type: adjustType,
            quantity: qtyValue,
            reason: adjustReason,
            operator: user?.name || "Administrador"
          })
        });
        if (movRes.ok) {
          const movData = await movRes.json();
          setMovements(prev => [movData.movement, ...prev]);
        }
      } catch (movErr) {
        console.error("Erro ao sincronizar movimentação de estoque:", movErr);
      }
      showToast(`Estoque de "${selectedProduct.name}" atualizado com sucesso! Novo saldo: ${newStock} un`);
      
      // Cleanup & trigger parent reload
      setSelectedProduct(null);
      setAdjustQty("");
      setAdjustReason("Ajuste de Inventário");
      onInventoryUpdate();

    } catch (err: any) {
      showToast(err.message || "Erro de rede ao salvar movimentação.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top statistics banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Itens Totais em Estoque</span>
            <span className="text-xl font-black text-slate-900">
              {allProducts.reduce((sum, p) => sum + p.stock, 0)} unidades
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Alerta de Reposição</span>
            <span className="text-xl font-black text-amber-600">
              {allProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length} produtos
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 font-bold uppercase">Produtos Esgotados</span>
            <span className="text-xl font-black text-red-600">
              {allProducts.filter(p => p.stock <= 0).length} produtos
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Inventory Grid & Searching (8 cols) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                Painel do Almoxarifado / Estoque
              </h3>
              
              {/* Filter controls */}
              <div className="flex items-center gap-1.5 self-start md:self-auto">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                >
                  <option value="todos">Todos os níveis</option>
                  <option value="baixo">Baixo Estoque</option>
                  <option value="ok">Estoque Saudável</option>
                  <option value="esgotado">Esgotados</option>
                </select>

                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white uppercase"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === "todos" ? "Todas as Categorias" : cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Filtrar por nome do produto, SKU ou código de barras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Grid display */}
            <div className="max-h-[500px] overflow-y-auto pr-1 space-y-2">
              {allProducts.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Layers className="w-10 h-10 mx-auto text-slate-200" />
                  <p className="text-sm font-bold text-slate-600">Seu estoque está vazio.</p>
                  <p className="text-xs">Cadastre seu primeiro produto para iniciar o controle de estoque.</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Layers className="w-10 h-10 mx-auto text-slate-200" />
                  <p className="text-xs">Nenhum produto correspondente aos filtros.</p>
                </div>
              ) : (
                filteredProducts.map(p => {
                  const isLow = p.stock <= p.minStock && p.stock > 0;
                  const isOutOfStock = p.stock <= 0;
                  
                  return (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className={`p-3.5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-emerald-500 hover:shadow-sm transition-all text-left bg-white ${
                        selectedProduct?.id === p.id 
                          ? "border-emerald-500 bg-emerald-50/5" 
                          : "border-slate-200/60"
                      }`}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-800 text-sm truncate leading-none">
                            {p.name}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold rounded uppercase">
                            {p.category}
                          </span>
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-50 border border-red-200 text-red-700 text-[9px] font-extrabold rounded-full">
                              <XCircle className="w-2.5 h-2.5" /> ESGOTADO
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-extrabold rounded-full">
                              <AlertTriangle className="w-2.5 h-2.5" /> REPOSIÇÃO NECESSÁRIA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-extrabold rounded-full">
                              <CheckCircle2 className="w-2.5 h-2.5" /> ESTOQUE SAUDÁVEL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono">
                          SKU: {p.sku} {p.barcode ? `| Código de Barras: ${p.barcode}` : ""}
                        </p>
                      </div>

                      {/* Stock Details */}
                      <div className="flex items-center gap-6 justify-between md:justify-end">
                        <div className="text-left md:text-right">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase leading-none">Estoque Atual</span>
                          <span className={`text-base font-black ${
                            isOutOfStock 
                              ? "text-red-600 font-black" 
                              : isLow 
                                ? "text-amber-600 font-black" 
                                : "text-slate-800"
                          }`}>
                            {p.stock} un
                          </span>
                        </div>

                        <div className="text-left md:text-right">
                          <span className="block text-[10px] text-slate-400 font-bold uppercase leading-none">Mínimo Crítico</span>
                          <span className="text-xs font-bold text-slate-600">
                            {p.minStock} un
                          </span>
                        </div>

                        <div className="text-right">
                          <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Adjuster & Audit Log (4 cols) */}
        <div className="xl:col-span-4 space-y-4">
          
          {/* Quick stock adjust form */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Lançar Movimentação Manual</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Selecione um produto ao lado para dar entrada ou saída de mercadoria.</p>
            </div>

            {selectedProduct ? (
              <form onSubmit={handleSaveAdjustment} className="space-y-4 text-left">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Produto Selecionado</span>
                  <span className="font-bold text-slate-800 block mt-1 truncate">{selectedProduct.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">SKU: {selectedProduct.sku} | Estoque: {selectedProduct.stock} un</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Lançamento</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setAdjustType("entrada")}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                        adjustType === "entrada" 
                          ? "bg-emerald-600 border-emerald-600 text-white" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" /> Entrada
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAdjustType("saida")}
                      className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                        adjustType === "saida" 
                          ? "bg-amber-600 border-amber-600 text-white" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" /> Saída
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Quantidade do Ajuste</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder="Quantidade"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Motivo da Movimentação</label>
                  <select 
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Ajuste de Inventário">Ajuste de Inventário / Saldo</option>
                    <option value="Compra de Fornecedor">Compra / Reposição de Fornecedor</option>
                    <option value="Perda ou Avaria">Perda / Avaria de Produto</option>
                    <option value="Doação ou Brinde">Doação ou Brinde</option>
                    <option value="Devolução de Cliente">Devolução de Cliente</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs hover:bg-slate-50 text-center"
                  >
                    Cancelar
                  </button>

                  <button 
                    type="submit"
                    disabled={submitting}
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow cursor-pointer text-center disabled:opacity-50"
                  >
                    {submitting ? "Sincronizando..." : "Confirmar Lançamento"}
                  </button>
                </div>

              </form>
            ) : (
              <div className="py-12 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 text-center">
                <ClipboardList className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-xs">Nenhum produto selecionado.</p>
              </div>
            )}
          </div>

          {/* Audit Logs section */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wide">Histórico de Movimentações</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Sessões recentes de entrada e saída auditadas no estoque.</p>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {movements.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">Nenhuma movimentação registrada.</p>
              ) : (
                movements.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2.5 text-left text-xs">
                    <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                      m.type === "entrada" 
                        ? "bg-emerald-100 text-emerald-700" 
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {m.type === "entrada" ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-slate-800 truncate leading-none">
                          {m.productName}
                        </span>
                        <span className={`font-black flex-shrink-0 ${
                          m.type === "entrada" ? "text-emerald-600" : "text-amber-600"
                        }`}>
                          {m.type === "entrada" ? "+" : "-"}{m.quantity} un
                        </span>
                      </div>
                      <span className="block text-[10px] text-slate-400 font-mono leading-none">SKU: {m.sku}</span>
                      <p className="text-[10px] text-slate-600 font-semibold italic">"{m.reason}"</p>
                      
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 leading-none">
                        <span className="flex items-center gap-0.5"><User className="w-2.5 h-2.5" /> {m.operator}</span>
                        <span>{new Date(m.date).toLocaleDateString()} {new Date(m.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
