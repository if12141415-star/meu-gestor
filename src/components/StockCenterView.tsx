import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowDownRight, 
  Layers, 
  PlusCircle, 
  MinusCircle, 
  ClipboardCheck, 
  Search, 
  MapPin, 
  Scan, 
  User, 
  Building, 
  Calendar, 
  Package, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Trash2, 
  Edit, 
  Check, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  Eye,
  FileText,
  Bookmark,
  Hash,
  Activity,
  CheckCircle2,
  Filter
} from "lucide-react";
import { Product } from "../types.ts";

interface StockCenterViewProps {
  token: string;
  user: any;
  company: any;
  allProducts: Product[];
  onProductsUpdate: () => void;
  showToast: (message: string, type?: "success" | "error") => void;
  initialTab?: string;
}

export default function StockCenterView({
  token,
  user,
  company,
  allProducts,
  onProductsUpdate,
  showToast,
  initialTab = "recebimento"
}: StockCenterViewProps) {
  // Tabs:
  // "recebimento" | "lote" | "entrada" | "saida" | "inventario" | "consulta" | "localizacao" | "leitor"
  const [activeSubTab, setActiveSubTab] = useState(initialTab);

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
    let allowed = true;
    if (activeSubTab === "localizacao" && !isModuleActive("location_control")) allowed = false;
    if (activeSubTab === "leitor" && !isModuleActive("barcode")) allowed = false;
    if ((activeSubTab === "recebimento" || activeSubTab === "lote") && !isModuleActive("lot_control")) allowed = false;

    if (!allowed) {
      if (isModuleActive("lot_control")) {
        setActiveSubTab("recebimento");
      } else {
        setActiveSubTab("entrada");
      }
    }
  }, [activeSubTab, company]);

  useEffect(() => {
    if (initialTab) {
      setActiveSubTab(initialTab);
    }
  }, [initialTab]);

  // Loading / refreshing state
  const [refreshing, setRefreshing] = useState(false);

  // Auto-generate batch/lot number
  const generateLotNumber = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `LT-${yyyy}${mm}${dd}-${rand}`;
  };

  // ==========================================
  // STATE FOR 1: RECEBIMENTO DE MERCADORIAS
  // ==========================================
  const [recSupplier, setRecSupplier] = useState("");
  const [recInvoice, setRecInvoice] = useState("");
  const [recDate, setRecDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [recLot, setRecLot] = useState(() => generateLotNumber());
  
  // Products inside current receipt
  const [recProducts, setRecProducts] = useState<any[]>([
    { name: "", sku: "", barcode: "", price: "", costPrice: "", stock: "10", category: "Geral", location: "Depósito A, Corredor 01" }
  ]);

  // Regenerate lot number helper
  const handleRegenLot = () => {
    setRecLot(generateLotNumber());
  };

  // ==========================================
  // STATE FOR 2: CADASTRO EM LOTE
  // ==========================================
  const [batchSupplier, setBatchSupplier] = useState("");
  const [batchInvoice, setBatchInvoice] = useState("");
  const [batchDate, setBatchDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [batchLot, setBatchLot] = useState(() => generateLotNumber());
  const [batchItems, setBatchItems] = useState<any[]>([
    { name: "", sku: "", barcode: "", price: "", costPrice: "", stock: "50", category: "Geral", location: "Depósito A, Corredor 01" },
    { name: "", sku: "", barcode: "", price: "", costPrice: "", stock: "50", category: "Geral", location: "Depósito A, Corredor 01" }
  ]);

  const addBatchRow = () => {
    setBatchItems([
      ...batchItems,
      { name: "", sku: "", barcode: "", price: "", costPrice: "", stock: "1", category: "Geral", location: "Depósito A, Corredor 01" }
    ]);
  };

  const removeBatchRow = (index: number) => {
    if (batchItems.length > 1) {
      setBatchItems(batchItems.filter((_, i) => i !== index));
    }
  };

  const handleBatchItemChange = (index: number, field: string, value: string) => {
    const updated = [...batchItems];
    updated[index][field] = value;
    setBatchItems(updated);
  };

  const handleSaveBatch = async () => {
    // Validate
    if (!batchLot) {
      showToast("Por favor, informe ou gere o número do lote.", "error");
      return;
    }
    const validItems = batchItems.filter(item => item.name && item.price && item.stock);
    if (validItems.length === 0) {
      showToast("Adicione pelo menos um produto com Nome, Preço e Estoque preenchidos.", "error");
      return;
    }

    setRefreshing(true);
    try {
      const response = await fetch("/api/products/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          supplier: batchSupplier,
          invoiceNumber: batchInvoice,
          receiptDate: batchDate,
          lot: batchLot,
          products: validItems.map(item => ({
            name: item.name,
            sku: item.sku || "SKU-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
            barcode: item.barcode,
            price: Number(item.price),
            costPrice: Number(item.costPrice || Number(item.price) * 0.6),
            stock: Number(item.stock),
            category: item.category || "Geral",
            location: item.location || "Depósito Geral"
          }))
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erro ao salvar cadastro em lote.");
      }

      showToast(`Sucesso! ${validItems.length} produtos cadastrados no Lote ${batchLot}.`);
      onProductsUpdate();
      // Reset
      setBatchItems([
        { name: "", sku: "", barcode: "", price: "", costPrice: "", stock: "50", category: "Geral", location: "Depósito A, Corredor 01" }
      ]);
      setBatchLot(generateLotNumber());
    } catch (err: any) {
      showToast(err.message || "Erro de conexão ao salvar lote.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // STATE FOR 3 & 4: ENTRADA / SAÍDA DE ESTOQUE
  // ==========================================
  const [movProductId, setMovProductId] = useState("");
  const [movQty, setMovQty] = useState("");
  const [movReason, setMovReason] = useState("Entrada de Recebimento");
  const [movLocation, setMovLocation] = useState("");
  const [movLot, setMovLot] = useState("");
  const [movSearch, setMovSearch] = useState("");

  const filteredMovProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(movSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(movSearch.toLowerCase()) ||
    (p.barcode && p.barcode.includes(movSearch))
  );

  const selectedMovProduct = allProducts.find(p => p.id === movProductId);

  const handleStockMovement = async (type: "entrada" | "saida") => {
    if (!movProductId) {
      showToast("Selecione um produto para a movimentação.", "error");
      return;
    }
    const qty = Number(movQty);
    if (!qty || qty <= 0) {
      showToast("Insira uma quantidade maior que zero.", "error");
      return;
    }

    const prod = selectedMovProduct!;
    let newStock = prod.stock;
    if (type === "entrada") {
      newStock += qty;
    } else {
      newStock -= qty;
      if (newStock < 0) {
        showToast("O estoque final não pode ficar negativo.", "error");
        return;
      }
    }

    setRefreshing(true);
    try {
      const prodRes = await fetch(`/api/products/${prod.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          stock: newStock,
          location: movLocation || prod.location || "",
          lot: movLot || prod.lot || ""
        })
      });

      if (!prodRes.ok) throw new Error("Erro ao atualizar o estoque do produto.");

      // Post audit movement log
      await fetch("/api/stock-movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: type,
          quantity: qty,
          reason: movReason || (type === "entrada" ? "Ajuste de Entrada" : "Ajuste de Saída"),
          operator: user?.name || "Operador de Estoque"
        })
      });

      showToast(`Estoque atualizado! "${prod.name}" agora possui ${newStock} un.`);
      onProductsUpdate();
      setMovQty("");
      setMovReason("");
    } catch (err: any) {
      showToast(err.message || "Erro ao salvar movimentação.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // STATE FOR 5: INVENTÁRIO (CONFERÊNCIA DE ESTOQUE)
  // ==========================================
  const [invSearch, setInvSearch] = useState("");
  const [invCounted, setInvCounted] = useState<Record<string, number>>({});
  const [invDirectBarcode, setInvDirectBarcode] = useState("");

  const handleInvBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const barcode = invDirectBarcode.trim();
    if (!barcode) return;

    const matched = allProducts.find(p => p.barcode === barcode || p.sku === barcode);
    if (matched) {
      setInvCounted(prev => ({
        ...prev,
        [matched.id]: (prev[matched.id] || 0) + 1
      }));
      showToast(`Scanner: +1 unidade de "${matched.name}" contada!`, "success");
    } else {
      showToast(`Nenhum produto com o código "${barcode}" foi encontrado.`, "error");
    }
    setInvDirectBarcode("");
  };

  const handleSaveInventory = async (productId: string) => {
    const count = invCounted[productId];
    if (count === undefined || count < 0) return;

    const prod = allProducts.find(p => p.id === productId);
    if (!prod) return;

    setRefreshing(true);
    try {
      const res = await fetch(`/api/products/${prod.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...prod,
          stock: count
        })
      });

      if (!res.ok) throw new Error("Erro ao salvar nível de estoque.");

      // Save movement
      await fetch("/api/stock-movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: count > prod.stock ? "entrada" : "saida",
          quantity: Math.abs(count - prod.stock),
          reason: "Conferência de Inventário",
          operator: user?.name || "Operador de Estoque"
        })
      });

      showToast(`Inventário de "${prod.name}" ajustado para ${count} un.`, "success");
      onProductsUpdate();
    } catch (err: any) {
      showToast(err.message || "Erro ao salvar inventário.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // STATE FOR 6: CONSULTA DE PRODUTOS
  // ==========================================
  const [querySearch, setQuerySearch] = useState("");
  const [selectedConsultProduct, setSelectedConsultProduct] = useState<Product | null>(null);

  const consultFilteredProducts = allProducts.filter(p =>
    p.name.toLowerCase().includes(querySearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(querySearch.toLowerCase()) ||
    (p.barcode && p.barcode.includes(querySearch)) ||
    (p.lot && p.lot.toLowerCase().includes(querySearch.toLowerCase()))
  );

  // ==========================================
  // STATE FOR 7: LOCALIZAÇÃO DOS PRODUTOS
  // ==========================================
  const [locFilter, setLocFilter] = useState("");
  const [editingLocProduct, setEditingLocProduct] = useState<Product | null>(null);
  const [newLocValue, setNewLocValue] = useState("");

  const handleUpdateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocProduct) return;

    setRefreshing(true);
    try {
      const res = await fetch(`/api/products/${editingLocProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingLocProduct,
          location: newLocValue
        })
      });

      if (!res.ok) throw new Error("Erro ao atualizar localização.");

      showToast(`Localização de "${editingLocProduct.name}" atualizada!`, "success");
      setEditingLocProduct(null);
      setNewLocValue("");
      onProductsUpdate();
    } catch (err: any) {
      showToast(err.message || "Erro de rede.", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================
  // STATE FOR 8: LEITOR DE CÓDIGO DE BARRAS
  // ==========================================
  const [scanInput, setScanInput] = useState("");
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    setIsScanning(true);
    setScannedProduct(null);

    setTimeout(() => {
      const match = allProducts.find(p => p.barcode === scanInput.trim() || p.sku === scanInput.trim());
      setIsScanning(false);
      if (match) {
        setScannedProduct(match);
        showToast("Código lido com sucesso!", "success");
      } else {
        showToast("Nenhum produto correspondente encontrado.", "error");
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Sub-header Navigation for non-Exclusive users */}
      {/* If exclusive, they navigate via the outer sidebar. If admin/gerente, they see this tab selector */}
      <div className="flex overflow-x-auto gap-2 pb-1 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm scrollbar-thin">
        {[
          { id: "recebimento", label: "Recebimento", icon: ArrowDownRight },
          { id: "lote", label: "Cadastro Lote", icon: Layers },
          { id: "entrada", label: "Entrada Estoque", icon: PlusCircle },
          { id: "saida", label: "Saída Estoque", icon: MinusCircle },
          { id: "inventario", label: "Inventário", icon: ClipboardCheck },
          { id: "consulta", label: "Consulta Prod.", icon: Search },
          { id: "localizacao", label: "Localizações", icon: MapPin },
          { id: "leitor", label: "Leitor Barras", icon: Scan },
        ].filter((tab) => {
          if (tab.id === "localizacao") {
            return isModuleActive("location_control");
          }
          if (tab.id === "leitor") {
            return isModuleActive("barcode");
          }
          if (tab.id === "recebimento" || tab.id === "lote") {
            return isModuleActive("lot_control");
          }
          return true;
        }).map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
        >
          {/* ==========================================
              SUB-TAB 1: RECEBIMENTO DE MERCADORIAS
          ========================================== */}
          {activeSubTab === "recebimento" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <ArrowDownRight className="w-5 h-5 text-emerald-600 bg-emerald-50 p-1 rounded-md" />
                  <h2 className="font-extrabold text-slate-900 text-sm">Dados da NF / Recebimento</h2>
                </div>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Fornecedor / Distribuidora</label>
                    <input 
                      type="text" 
                      value={recSupplier}
                      onChange={(e) => setRecSupplier(e.target.value)}
                      placeholder="Ex: Coca-Cola Distribuição S.A"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Número da Nota Fiscal (NF-e)</label>
                    <input 
                      type="text" 
                      value={recInvoice}
                      onChange={(e) => setRecInvoice(e.target.value)}
                      placeholder="Ex: 000.124.582"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Data de Recebimento</label>
                    <input 
                      type="date" 
                      value={recDate}
                      onChange={(e) => setRecDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Número do Lote (Auto Gerado)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly
                        value={recLot}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-emerald-700 font-extrabold"
                      />
                      <button 
                        onClick={handleRegenLot}
                        type="button" 
                        title="Regerar Lote"
                        className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setBatchSupplier(recSupplier);
                      setBatchInvoice(recInvoice);
                      setBatchDate(recDate);
                      setBatchLot(recLot);
                      setActiveSubTab("lote");
                      showToast("Dados copiados para o Cadastro em Lote!", "success");
                    }}
                    className="w-full py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Itens ao Lote
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-emerald-600" />
                      <h2 className="font-extrabold text-slate-900 text-sm">Histórico de Recebimentos / Lotes</h2>
                    </div>
                  </div>

                  {allProducts.filter(p => p.lot).length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm space-y-2 py-16">
                      <Layers className="w-12 h-12 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700">Nenhum lote registrado recentemente.</p>
                      <p className="text-xs">Utilize o "Cadastro em Lote" para vincular produtos a um novo lote físico.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100">
                            <th className="p-3">Código Lote</th>
                            <th className="p-3">Produto</th>
                            <th className="p-3">Fornecedor</th>
                            <th className="p-3">NF-e</th>
                            <th className="p-3">Localização</th>
                            <th className="p-3 text-right">Qtd</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {allProducts.filter(p => p.lot).slice(0, 10).map((prod) => (
                            <tr key={prod.id} className="hover:bg-slate-50/50">
                              <td className="p-3 font-mono text-emerald-700 font-extrabold">{prod.lot}</td>
                              <td className="p-3 font-bold text-slate-900">{prod.name}</td>
                              <td className="p-3">{prod.supplier || "—"}</td>
                              <td className="p-3 font-mono">{prod.invoiceNumber || "—"}</td>
                              <td className="p-3">
                                <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold text-[10px]">
                                  <MapPin className="w-3 h-3 text-emerald-500" />
                                  {prod.location || "Sem Local"}
                                </span>
                              </td>
                              <td className="p-3 text-right font-extrabold text-slate-900">{prod.stock} un</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              SUB-TAB 2: CADASTRO EM LOTE
          ========================================== */}
          {activeSubTab === "lote" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
              
              <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <div className="flex-1">
                  <label className="block text-slate-600 font-extrabold mb-1">Fornecedor</label>
                  <input 
                    type="text" 
                    value={batchSupplier}
                    onChange={(e) => setBatchSupplier(e.target.value)}
                    placeholder="Distribuidor S.A"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div className="w-full md:w-48">
                  <label className="block text-slate-600 font-extrabold mb-1">Nº Nota Fiscal</label>
                  <input 
                    type="text" 
                    value={batchInvoice}
                    onChange={(e) => setBatchInvoice(e.target.value)}
                    placeholder="NF-e"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div className="w-full md:w-44">
                  <label className="block text-slate-600 font-extrabold mb-1">Data Recebimento</label>
                  <input 
                    type="date" 
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div className="w-full md:w-64">
                  <label className="block text-slate-600 font-extrabold mb-1">Código de Lote Único</label>
                  <input 
                    type="text" 
                    readOnly
                    value={batchLot}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono text-emerald-700 font-black"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Layers className="w-4.5 h-4.5 text-emerald-600" />
                    Produtos do Lote
                  </h3>
                  <button
                    onClick={addBatchRow}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Linha
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-left text-xs min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider border-b border-slate-100 text-[10px]">
                        <th className="p-3 w-[25%]">Nome do Produto *</th>
                        <th className="p-3 w-[15%]">Cód. Barras</th>
                        <th className="p-3 w-[12%]">Preço Venda *</th>
                        <th className="p-3 w-[12%]">Preço Custo</th>
                        <th className="p-3 w-[10%]">Estoque *</th>
                        <th className="p-3 w-[20%]">Localização Física (ex: Galpão A, Corredor 3)</th>
                        <th className="p-3 w-[6%] text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {batchItems.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50/40">
                          <td className="p-2">
                            <input 
                              type="text" 
                              required
                              value={item.name}
                              onChange={(e) => handleBatchItemChange(index, "name", e.target.value)}
                              placeholder="Nome do Produto"
                              className="w-full p-2 rounded-lg border border-slate-200"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={item.barcode}
                              onChange={(e) => handleBatchItemChange(index, "barcode", e.target.value)}
                              placeholder="EAN/Cód. Barras"
                              className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              required
                              value={item.price}
                              onChange={(e) => handleBatchItemChange(index, "price", e.target.value)}
                              placeholder="0.00"
                              className="w-full p-2 rounded-lg border border-slate-200"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              value={item.costPrice}
                              onChange={(e) => handleBatchItemChange(index, "costPrice", e.target.value)}
                              placeholder="0.00"
                              className="w-full p-2 rounded-lg border border-slate-200"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              required
                              value={item.stock}
                              onChange={(e) => handleBatchItemChange(index, "stock", e.target.value)}
                              placeholder="1"
                              className="w-full p-2 rounded-lg border border-slate-200 text-center font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={item.location}
                              onChange={(e) => handleBatchItemChange(index, "location", e.target.value)}
                              placeholder="Ex: Galpão B, Rua 10, Box 18"
                              className="w-full p-2 rounded-lg border border-slate-200"
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => removeBatchRow(index)}
                              disabled={batchItems.length <= 1}
                              title="Remover linha"
                              className="text-slate-400 hover:text-rose-600 disabled:opacity-40 p-1 rounded-lg hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveBatch}
                  disabled={refreshing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {refreshing ? "Cadastrando Lote..." : `Cadastrar Lote (${batchItems.length} Itens)`}
                </button>
              </div>

            </div>
          )}

          {/* ==========================================
              SUB-TAB 3: ENTRADA DE ESTOQUE
          ========================================== */}
          {activeSubTab === "entrada" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs font-semibold">
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <PlusCircle className="w-5 h-5 text-emerald-600 bg-emerald-50 p-1 rounded-md" />
                  <h2 className="font-extrabold text-slate-900 text-sm">Registrar Entrada de Estoque</h2>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Buscar Produto</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        value={movSearch}
                        onChange={(e) => setMovSearch(e.target.value)}
                        placeholder="Nome, SKU ou código..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  {movSearch && (
                    <div className="border border-slate-100 rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                      {filteredMovProducts.slice(0, 10).map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setMovProductId(p.id);
                            setMovLocation(p.location || "");
                            setMovLot(p.lot || "");
                            setMovSearch("");
                          }}
                          className="w-full text-left p-2 hover:bg-slate-100 flex justify-between items-center cursor-pointer"
                        >
                          <div>
                            <span className="block font-bold text-slate-800">{p.name}</span>
                            <span className="block text-[10px] text-slate-400">SKU: {p.sku} | EAN: {p.barcode || "—"}</span>
                          </div>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                            Atual: {p.stock} un
                          </span>
                        </button>
                      ))}
                      {filteredMovProducts.length === 0 && (
                        <p className="p-4 text-center text-slate-400 font-normal">Nenhum produto correspondente.</p>
                      )}
                    </div>
                  )}

                  {selectedMovProduct && (
                    <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl space-y-1">
                      <span className="block text-emerald-800 font-black">Selecionado: {selectedMovProduct.name}</span>
                      <span className="block text-[10px] text-slate-500">Saldo Atual: {selectedMovProduct.stock} un | Categoria: {selectedMovProduct.category}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Quantidade Entrando</label>
                    <input 
                      type="number"
                      min="1"
                      value={movQty}
                      onChange={(e) => setMovQty(e.target.value)}
                      placeholder="Ex: 100"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Localização Física no Estoque (Opcional)</label>
                    <input 
                      type="text"
                      value={movLocation}
                      onChange={(e) => setMovLocation(e.target.value)}
                      placeholder="Ex: Depósito A, Corredor 02"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Lote Físico Associado (Opcional)</label>
                    <input 
                      type="text"
                      value={movLot}
                      onChange={(e) => setMovLot(e.target.value)}
                      placeholder="Ex: LT-20260703-9111"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Motivo / Justificativa</label>
                    <input 
                      type="text"
                      value={movReason}
                      onChange={(e) => setMovReason(e.target.value)}
                      placeholder="Ex: Lançamento de Nota Fiscal"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleStockMovement("entrada")}
                    disabled={refreshing}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow disabled:opacity-50"
                  >
                    <PlusCircle className="w-4.5 h-4.5" />
                    Lançar Entrada no Estoque
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4">
                  <Bookmark className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-extrabold text-slate-900 text-sm">Diretrizes de Entrada</h2>
                </div>
                <div className="space-y-4 text-slate-600 font-normal leading-relaxed">
                  <p>As entradas de estoque aumentam o saldo de produtos de forma direta.</p>
                  <div className="p-4 bg-amber-50/50 border border-amber-100 text-amber-900 rounded-2xl space-y-2 text-[11px] font-medium">
                    <p className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      Regra de Rastreabilidade:
                    </p>
                    <p>Sempre que realizar uma entrada que não provenha do Recebimento de Notas, procure referenciar o lote correspondente do fabricante e defina a localização física específica do armazém para evitar perdas ou desorganização.</p>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <span className="block font-bold text-slate-800 uppercase">Sugestão de Endereçamento:</span>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Depósitos:</strong> Galpão principal, Depósito Frio, Prateleiras Externas.</li>
                      <li><strong>Endereço Completo:</strong> Depósito A - Corredor 02 - Prateleira 05 - Box 01.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SUB-TAB 4: SAÍDA DE ESTOQUE
          ========================================== */}
          {activeSubTab === "saida" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs font-semibold">
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MinusCircle className="w-5 h-5 text-rose-600 bg-rose-50 p-1 rounded-md" />
                  <h2 className="font-extrabold text-slate-900 text-sm">Registrar Saída de Estoque</h2>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Buscar Produto</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        value={movSearch}
                        onChange={(e) => setMovSearch(e.target.value)}
                        placeholder="Nome, SKU ou código..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>

                  {movSearch && (
                    <div className="border border-slate-100 rounded-xl max-h-40 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                      {filteredMovProducts.slice(0, 10).map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setMovProductId(p.id);
                            setMovLocation(p.location || "");
                            setMovLot(p.lot || "");
                            setMovSearch("");
                          }}
                          className="w-full text-left p-2 hover:bg-slate-100 flex justify-between items-center cursor-pointer"
                        >
                          <div>
                            <span className="block font-bold text-slate-800">{p.name}</span>
                            <span className="block text-[10px] text-slate-400">SKU: {p.sku} | EAN: {p.barcode || "—"}</span>
                          </div>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                            Atual: {p.stock} un
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedMovProduct && (
                    <div className="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl space-y-1">
                      <span className="block text-rose-800 font-black">Selecionado: {selectedMovProduct.name}</span>
                      <span className="block text-[10px] text-slate-500">Estoque Atual: {selectedMovProduct.stock} un</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Quantidade Retirada</label>
                    <input 
                      type="number"
                      min="1"
                      value={movQty}
                      onChange={(e) => setMovQty(e.target.value)}
                      placeholder="Ex: 5"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">Motivo / Justificativa de Retirada</label>
                    <select
                      value={movReason}
                      onChange={(e) => setMovReason(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium bg-white"
                    >
                      <option value="Ajuste de Estoque">Ajuste / Erro de Lançamento</option>
                      <option value="Avaria / Estragado">Produto com Avaria / Estragado</option>
                      <option value="Produto Vencido">Produto Vencido</option>
                      <option value="Perda / Extravio">Perda ou Extravio</option>
                      <option value="Doação ou Brinde">Doação ou Brinde</option>
                      <option value="Consumo Interno">Consumo Interno da Loja</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleStockMovement("saida")}
                    disabled={refreshing}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow disabled:opacity-50"
                  >
                    <MinusCircle className="w-4.5 h-4.5" />
                    Registrar Saída no Estoque
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 mb-4">
                  <Bookmark className="w-5 h-5 text-rose-600" />
                  <h2 className="font-extrabold text-slate-900 text-sm">Controle de Baixas e Quebras</h2>
                </div>
                <div className="space-y-4 text-slate-600 font-normal leading-relaxed">
                  <p>As baixas manuais registram a saída física de mercadorias que não constituem vendas tributárias normais da Frente de Caixa.</p>
                  <div className="p-4 bg-rose-50/30 border border-rose-100 text-rose-950 rounded-2xl space-y-1.5 text-[11px] font-medium">
                    <p className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      Aviso de Responsabilidade:
                    </p>
                    <p>Qualquer quebra ou descarte por vencimento ou avaria deve ser acompanhado de justificativa formal para fins fiscais e reconciliação financeira do armazém.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SUB-TAB 5: INVENTÁRIO (CONFERÊNCIA)
          ========================================== */}
          {activeSubTab === "inventario" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">Conferência de Inventário</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Utilize o leitor de código de barras ou a busca para auditar e ajustar saldos físicos.</p>
                </div>

                <form onSubmit={handleInvBarcodeSubmit} className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64 text-xs font-semibold">
                    <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600 animate-pulse" />
                    <input 
                      type="text" 
                      value={invDirectBarcode}
                      onChange={(e) => setInvDirectBarcode(e.target.value)}
                      placeholder="Scaneie / digite código..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-emerald-500 bg-emerald-50/10 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-emerald-800"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-slate-900 text-white font-bold text-xs px-4 rounded-xl cursor-pointer"
                  >
                    Contar (+1)
                  </button>
                </form>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={invSearch}
                    onChange={(e) => setInvSearch(e.target.value)}
                    placeholder="Filtrar por nome, SKU ou localização..."
                    className="flex-1 bg-transparent border-none text-xs focus:outline-none font-medium text-slate-800"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100 text-[10px]">
                        <th className="p-3 w-12">Foto</th>
                        <th className="p-3">Produto</th>
                        <th className="p-3">Cód. Barras</th>
                        <th className="p-3">Localização</th>
                        <th className="p-3">Lote</th>
                        <th className="p-3 text-center">Estoque Atual</th>
                        <th className="p-3 text-center">Unidades Contadas</th>
                        <th className="p-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      {allProducts.filter(p => 
                        p.name.toLowerCase().includes(invSearch.toLowerCase()) || 
                        p.sku.toLowerCase().includes(invSearch.toLowerCase()) ||
                        (p.location && p.location.toLowerCase().includes(invSearch.toLowerCase()))
                      ).slice(0, 15).map(prod => {
                        const counted = invCounted[prod.id] !== undefined ? invCounted[prod.id] : prod.stock;
                        const hasDiff = counted !== prod.stock;
                        return (
                          <tr key={prod.id} className={`hover:bg-slate-50/50 transition-colors ${hasDiff ? "bg-amber-50/10" : ""}`}>
                            <td className="p-3">
                              {prod.image ? (
                                <img src={prod.image} alt={prod.name} className="w-9 h-9 rounded-lg object-cover border" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center border text-slate-400">
                                  <Package className="w-4 h-4" />
                                </div>
                              )}
                            </td>
                            <td className="p-3">
                              <span className="block font-bold text-slate-900">{prod.name}</span>
                              <span className="block text-[10px] text-slate-400">SKU: {prod.sku}</span>
                            </td>
                            <td className="p-3 font-mono">{prod.barcode || "—"}</td>
                            <td className="p-3 text-slate-500 font-bold">{prod.location || "—"}</td>
                            <td className="p-3 font-mono text-emerald-700">{prod.lot || "—"}</td>
                            <td className="p-3 text-center font-bold text-slate-800">{prod.stock} un</td>
                            <td className="p-3 text-center">
                              <div className="inline-flex items-center gap-1.5 border border-slate-200 rounded-xl bg-white p-1">
                                <button
                                  onClick={() => setInvCounted(prev => ({ ...prev, [prod.id]: Math.max(0, counted - 1) }))}
                                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
                                >
                                  <MinusCircle className="w-4.5 h-4.5" />
                                </button>
                                <input 
                                  type="number"
                                  value={counted}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setInvCounted(prev => ({ ...prev, [prod.id]: isNaN(val) ? 0 : val }));
                                  }}
                                  className="w-12 text-center font-extrabold text-slate-900 border-none bg-transparent focus:outline-none"
                                />
                                <button
                                  onClick={() => setInvCounted(prev => ({ ...prev, [prod.id]: counted + 1 }))}
                                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"
                                >
                                  <PlusCircle className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              {hasDiff ? (
                                <button
                                  onClick={() => handleSaveInventory(prod.id)}
                                  disabled={refreshing}
                                  className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer mx-auto transition-all"
                                >
                                  <Save className="w-3.5 h-3.5" /> Salvar Ajuste
                                </button>
                              ) : (
                                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full font-extrabold inline-flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Auditado
                                </span>
                              )}
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

          {/* ==========================================
              SUB-TAB 6: CONSULTA DE PRODUTOS
          ========================================== */}
          {activeSubTab === "consulta" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
              
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">Consulta Completa de Produto</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Visualização detalhada e endereçamento do estoque físico.</p>
                </div>

                <div className="relative w-full md:w-96 text-xs font-semibold">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={querySearch}
                    onChange={(e) => setQuerySearch(e.target.value)}
                    placeholder="Busque por Nome, EAN, SKU ou Nº Lote..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {selectedConsultProduct ? (
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-6 relative">
                  <button 
                    onClick={() => setSelectedConsultProduct(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-xl bg-white hover:bg-slate-100 border text-slate-500 flex items-center gap-1 text-xs cursor-pointer font-bold transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar à busca
                  </button>

                  <div className="md:col-span-4 flex flex-col items-center justify-center bg-white p-6 rounded-2xl border border-slate-200/60">
                    {selectedConsultProduct.image ? (
                      <img 
                        src={selectedConsultProduct.image} 
                        alt={selectedConsultProduct.name}
                        className="max-h-56 w-full rounded-xl object-contain shadow"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="h-44 w-full bg-slate-50 rounded-xl flex flex-col items-center justify-center border text-slate-400">
                        <Package className="w-12 h-12 mb-2 stroke-1" />
                        <span className="text-[10px] font-bold">PRODUTO SEM FOTO</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-8 space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {selectedConsultProduct.category}
                      </span>
                      <h1 className="text-lg font-black text-slate-900 mt-2">{selectedConsultProduct.name}</h1>
                      <span className="text-slate-400 font-mono">SKU: {selectedConsultProduct.sku}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-slate-200/60 py-4 font-semibold text-slate-600">
                      <div>
                        <span className="block text-slate-400 text-[10px]">CÓDIGO DE BARRAS</span>
                        <span className="font-mono text-slate-800 font-bold">{selectedConsultProduct.barcode || "Não informado"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px]">SALDO DE ESTOQUE</span>
                        <span className={`font-black text-sm ${selectedConsultProduct.stock <= selectedConsultProduct.minStock ? "text-rose-600" : "text-emerald-600"}`}>
                          {selectedConsultProduct.stock} un
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px]">CÓDIGO DO LOTE</span>
                        <span className="font-mono text-emerald-700 font-extrabold">{selectedConsultProduct.lot || "Não registrado"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px]">FORNECEDOR</span>
                        <span className="text-slate-800 font-bold">{selectedConsultProduct.supplier || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px]">DATA DE ENTRADA</span>
                        <span className="text-slate-800">{selectedConsultProduct.createdAt ? new Date(selectedConsultProduct.createdAt).toLocaleDateString("pt-BR") : "—"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px]">NOTA FISCAL</span>
                        <span className="font-mono text-slate-800 font-bold">{selectedConsultProduct.invoiceNumber || "—"}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                      <span className="block text-emerald-800 font-black text-[10px] uppercase mb-1">LOCALIZAÇÃO FÍSICA NO ESTOQUE</span>
                      <div className="flex items-center gap-2 text-slate-800">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-extrabold">{selectedConsultProduct.location || "Não endereçado"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {consultFilteredProducts.slice(0, 12).map((prod) => (
                    <div 
                      key={prod.id}
                      onClick={() => setSelectedConsultProduct(prod)}
                      className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-2xl cursor-pointer text-xs font-semibold hover:shadow-sm transition-all"
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl border flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Package className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-slate-900 truncate">{prod.name}</h4>
                          <span className="block text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">Lote: {prod.lot || "—"}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex justify-between items-center">
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          {prod.location || "Sem local"}
                        </span>
                        <span className={`font-black ${prod.stock <= prod.minStock ? "text-rose-600" : "text-emerald-600"}`}>
                          {prod.stock} un
                        </span>
                      </div>
                    </div>
                  ))}

                  {consultFilteredProducts.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 font-normal">
                      Nenhum produto correspondente. Procure por outro termo ou cadastre no lote.
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ==========================================
              SUB-TAB 7: LOCALIZAÇÃO DOS PRODUTOS
          ========================================== */}
          {activeSubTab === "localizacao" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">Organização Física de Estoque</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Definição rápida de depósitos, corredores, prateleiras e boxes.</p>
                </div>

                <div className="relative w-full md:w-64 text-xs font-semibold">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    value={locFilter}
                    onChange={(e) => setLocFilter(e.target.value)}
                    placeholder="Filtrar por localização física..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100 text-[10px]">
                      <th className="p-3">Produto</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Localização Atual</th>
                      <th className="p-3">Lote Único</th>
                      <th className="p-3 text-right">Quantidade</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {allProducts.filter(p =>
                      !locFilter || (p.location && p.location.toLowerCase().includes(locFilter.toLowerCase()))
                    ).slice(0, 15).map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-900">{prod.name}</td>
                        <td className="p-3 font-mono text-slate-400">{prod.sku}</td>
                        <td className="p-3">
                          {editingLocProduct?.id === prod.id ? (
                            <form onSubmit={handleUpdateLocation} className="flex gap-2">
                              <input 
                                type="text"
                                value={newLocValue}
                                onChange={(e) => setNewLocValue(e.target.value)}
                                placeholder="Depósito A - Corredor 02..."
                                className="p-1 border rounded-lg text-xs w-48 font-bold"
                              />
                              <button 
                                type="submit" 
                                className="bg-emerald-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold"
                              >
                                Salvar
                              </button>
                            </form>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-emerald-50 text-emerald-900 px-3 py-1 rounded-lg">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              {prod.location || "Não endereçado"}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-emerald-700 font-extrabold">{prod.lot || "—"}</td>
                        <td className="p-3 text-right font-extrabold">{prod.stock} un</td>
                        <td className="p-3 text-center">
                          {editingLocProduct?.id !== prod.id && (
                            <button
                              onClick={() => {
                                setEditingLocProduct(prod);
                                setNewLocValue(prod.location || "");
                              }}
                              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                            >
                              Endereçar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* ==========================================
              SUB-TAB 8: LEITOR DE CÓDIGO DE BARRAS
          ========================================== */}
          {activeSubTab === "leitor" && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
              
              <div className="max-w-md mx-auto text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <Scan className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-base">Leitor de Código de Barras</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Simule a leitura física de um produto por código EAN.</p>
                </div>

                <form onSubmit={handleSimulateScan} className="flex gap-2">
                  <input 
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Código de barras ou SKU..."
                    className="flex-1 p-3 rounded-xl border border-slate-200 font-mono text-center text-sm font-extrabold"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 rounded-xl transition-all cursor-pointer"
                  >
                    Simular Leitura
                  </button>
                </form>

                {/* Simulated laser lines */}
                {isScanning && (
                  <div className="relative h-20 bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
                    <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Leitura em andamento...</span>
                    <div className="absolute left-0 right-0 h-0.5 bg-rose-600 shadow-md shadow-rose-600/80 animate-bounce"></div>
                  </div>
                )}

                {scannedProduct && (
                  <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl text-left text-xs font-semibold space-y-4 shadow-sm animate-fadeIn">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                          {scannedProduct.category}
                        </span>
                        <h4 className="font-black text-slate-900 text-sm mt-1.5">{scannedProduct.name}</h4>
                        <span className="text-slate-400 font-mono text-[10px]">SKU: {scannedProduct.sku}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-400 uppercase">Estoque</span>
                        <span className="text-sm font-black text-emerald-600">{scannedProduct.stock} un</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-200/60 pt-3">
                      <div>
                        <span className="block text-slate-400 text-[10px]">Nº LOTE</span>
                        <span className="font-mono font-extrabold text-emerald-800">{scannedProduct.lot || "Não registrado"}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-[10px]">LOCALIZAÇÃO</span>
                        <span className="text-slate-800 font-bold">{scannedProduct.location || "Não endereçado"}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setSelectedConsultProduct(scannedProduct);
                          setActiveSubTab("consulta");
                        }}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" /> Detalhes Completos
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
