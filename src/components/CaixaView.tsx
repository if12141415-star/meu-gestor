import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash, 
  DollarSign, 
  CreditCard, 
  QrCode, 
  Layers, 
  FileText, 
  Printer, 
  AlertTriangle, 
  Check, 
  X, 
  ArrowRight, 
  User, 
  Calendar, 
  Clock, 
  Lock, 
  Unlock 
} from "lucide-react";
import { Product, Client } from "../types.ts";

interface CaixaViewProps {
  token: string;
  user: any;
  company: any;
  allProducts: Product[];
  allClients: Client[];
  onSaleComplete: () => void;
  allowNegativeStock: boolean;
  transactions: any[];
  setTransactions: React.Dispatch<React.SetStateAction<any[]>>;
}

interface RegisterSession {
  isOpen: boolean;
  openedAt: string;
  openedBy: string;
  initialAmount: number;
  sales: {
    id: string;
    total: number;
    profit: number;
    items: any[];
    paymentMethod: string;
    paymentBreakdown?: { dinero: number; pix: number; card: number };
    createdAt: string;
  }[];
}

export default function CaixaView({
  token,
  user,
  company,
  allProducts,
  allClients,
  onSaleComplete,
  allowNegativeStock,
  transactions,
  setTransactions,
}: CaixaViewProps) {
  // Cash Register Session
  const [session, setSession] = useState<RegisterSession>({
    isOpen: false,
    openedAt: "",
    openedBy: "",
    initialAmount: 0,
    sales: []
  });

  // Fetch cashier session from server on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/caixa/session", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        }
      } catch (err) {
        console.error("Erro ao carregar sessão do caixa do servidor:", err);
      }
    };
    if (token) {
      fetchSession();
    }
  }, [token]);

  // Sync session changes to server
  useEffect(() => {
    const syncSession = async () => {
      if (!token || !session.openedAt) return; // Only sync valid active or closed sessions
      try {
        await fetch("/api/caixa/session", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ session })
        });
      } catch (err) {
        console.error("Erro ao sincronizar sessão do caixa no servidor:", err);
      }
    };
    syncSession();
  }, [session, token]);

  // Abertura de Caixa state
  const [openingAmount, setOpeningAmount] = useState<string>("0.00");
  const [openingOperator, setOpeningOperator] = useState<string>(user?.name || "Operador");

  // Fechamento de Caixa state
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [operatorEnteredAmount, setOperatorEnteredAmount] = useState<string>("");
  const [closingSummary, setClosingSummary] = useState<any | null>(null);

  // Cart/PDV Active Sale State
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("c_generic");
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "pix" | "cartao" | "misto">("dinheiro");
  
  // Mixed Payment Breakdown
  const [mixedDinero, setMixedDinero] = useState("");
  const [mixedPix, setMixedPix] = useState("");
  const [mixedCard, setMixedCard] = useState("");

  // Cash change calculation
  const [cashGiven, setCashGiven] = useState("");

  // Simulated Thermal Receipt Modal
  const [receiptSale, setReceiptSale] = useState<any | null>(null);

  // Toast / Status state local to PDV
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showLocalToast = (msg: string, type: "success" | "error" = "success") => {
    if (type === "success") {
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Open the register
  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(openingAmount) || 0;
    if (amount < 0) {
      showLocalToast("O fundo inicial do caixa não pode ser negativo.", "error");
      return;
    }
    setSession({
      isOpen: true,
      openedAt: new Date().toISOString(),
      openedBy: openingOperator,
      initialAmount: amount,
      sales: []
    });
    showLocalToast("Caixa aberto com sucesso! Bom expediente.");
  };

  // Filter products by Name, SKU, or Barcode
  const filteredProducts = allProducts.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return p.status !== "inactive";
    return (
      (p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query) ||
      (p.barcode && p.barcode.toLowerCase().includes(query))) &&
      p.status !== "inactive"
    );
  });

  // Quick Barcode Scanning listener (if user types exact code and presses enter or searches)
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) return;

    // Check if there is an EXACT barcode match or exact SKU match
    const exactMatch = allProducts.find(
      p => (p.barcode === query || p.sku === query) && p.status !== "inactive"
    );

    if (exactMatch) {
      addToCart(exactMatch);
      setSearchQuery(""); // Clear search automatically for next barcode scan
      showLocalToast(`Produto "${exactMatch.name}" adicionado via código!`);
    }
  }, [searchQuery, allProducts]);

  // Add Product to Cart
  const addToCart = (product: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const currentQty = prev[idx].quantity;
        // Verify stock check if not allow negative stock
        if (!allowNegativeStock && product.stock <= currentQty) {
          showLocalToast(`Estoque esgotado para "${product.name}". (Disponível: ${product.stock})`, "error");
          return prev;
        }
        const updated = [...prev];
        updated[idx] = { ...prev[idx], quantity: currentQty + 1 };
        return updated;
      } else {
        if (!allowNegativeStock && product.stock <= 0) {
          showLocalToast(`Estoque esgotado para "${product.name}".`, "error");
          return prev;
        }
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  // Decrease / Remove from Cart
  const decreaseQuantity = (productId: string) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === productId);
      if (idx === -1) return prev;
      if (prev[idx].quantity <= 1) {
        return prev.filter(item => item.product.id !== productId);
      } else {
        const updated = [...prev];
        updated[idx] = { ...prev[idx], quantity: prev[idx].quantity - 1 };
        return updated;
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cancelSale = () => {
    if (cart.length === 0) return;
    setShowCancelConfirm(true);
  };

  const confirmCancelSale = () => {
    setCart([]);
    setCashGiven("");
    setSearchQuery("");
    setShowCancelConfirm(false);
    showLocalToast("Venda cancelada.", "error");
  };

  // Computation of Totals
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalCost = cart.reduce((sum, item) => sum + (item.product.costPrice * item.quantity), 0);
  const totalProfit = totalAmount - totalCost;

  // Change Troco Calculation
  const parsedCashGiven = Number(cashGiven) || 0;
  const changeDue = parsedCashGiven > totalAmount ? parsedCashGiven - totalAmount : 0;

  // Complete/Finalize Sale
  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      showLocalToast("Adicione produtos ao carrinho antes de finalizar.", "error");
      return;
    }

    // Validation for mixed payments
    let finalBreakdown = { dinero: 0, pix: 0, card: 0 };
    if (paymentMethod === "misto") {
      const dineroVal = Number(mixedDinero) || 0;
      const pixVal = Number(mixedPix) || 0;
      const cardVal = Number(mixedCard) || 0;
      const sum = dineroVal + pixVal + cardVal;

      if (Math.abs(sum - totalAmount) > 0.05) {
        showLocalToast(`Valores mistos incorretos. A soma é R$ ${sum.toFixed(2)}, mas o total da venda é R$ ${totalAmount.toFixed(2)}.`, "error");
        return;
      }
      finalBreakdown = { dinero: dineroVal, pix: pixVal, card: cardVal };
    }

    try {
      const clientName = allClients.find(c => c.id === selectedClient)?.name || "Consumidor Final";

      // 1. Post to Server to register the sale and update stock
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: selectedClient,
          clientName,
          total: totalAmount,
          profit: totalProfit,
          itemsCount: totalItemsCount,
          status: "completed",
          items: cart.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price
          })),
          allowNegativeStock,
          paymentMethod
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao registrar a venda.");
      }

      // 2. Add transaction to finance ledger globally & locally
      try {
        const txRes = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            description: `PDV Venda #${data.id.split("_")[1]} - ${clientName}`,
            type: "income",
            category: "Vendas (PDV)",
            amount: totalAmount,
            status: "paid"
          })
        });
        if (txRes.ok) {
          const txData = await txRes.json();
          setTransactions(prev => [txData.transaction, ...prev]);
        }
      } catch (txErr) {
        console.error("Erro ao sincronizar transação de PDV:", txErr);
      }

      // 3. Register sale inside active cash session
      const completedSale = {
        id: data.id,
        total: totalAmount,
        profit: totalProfit,
        items: cart.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.product.price * item.quantity
        })),
        paymentMethod,
        paymentBreakdown: paymentMethod === "misto" ? finalBreakdown : undefined,
        createdAt: new Date().toISOString()
      };

      setSession(prev => ({
        ...prev,
        sales: [...prev.sales, completedSale]
      }));

      // 4. Trigger printer receipt modal
      setReceiptSale(completedSale);

      // 5. Success cleanup
      setCart([]);
      setCashGiven("");
      setMixedDinero("");
      setMixedPix("");
      setMixedCard("");
      showLocalToast("Venda realizada e estoque atualizado com sucesso!");
      
      // Refresh general lists & stats
      onSaleComplete();

    } catch (err: any) {
      showLocalToast(err.message || "Erro ao finalizar a venda.", "error");
    }
  };

  // Close Register Session Calculation
  const handleCalculateCloseSession = () => {
    const initialFloat = session.initialAmount;
    
    // Sum sales inside this session
    let totalSold = 0;
    let dineroSum = 0;
    let pixSum = 0;
    let cardSum = 0;

    session.sales.forEach(sale => {
      totalSold += sale.total;
      
      if (sale.paymentMethod === "dinheiro") {
        dineroSum += sale.total;
      } else if (sale.paymentMethod === "pix") {
        pixSum += sale.total;
      } else if (sale.paymentMethod === "cartao") {
        cardSum += sale.total;
      } else if (sale.paymentMethod === "misto" && sale.paymentBreakdown) {
        dineroSum += sale.paymentBreakdown.dinero;
        pixSum += sale.paymentBreakdown.pix;
        cardSum += sale.paymentBreakdown.card;
      }
    });

    const expectedInDrawer = initialFloat + dineroSum; // float + cash sales

    setClosingSummary({
      openedAt: session.openedAt,
      openedBy: session.openedBy,
      closedAt: new Date().toISOString(),
      initialFloat,
      totalSold,
      dineroSum,
      pixSum,
      cardSum,
      expectedInDrawer
    });

    setOperatorEnteredAmount(expectedInDrawer.toFixed(2));
    setShowCloseModal(true);
  };

  const handleFinalizeCloseRegister = () => {
    if (!closingSummary) return;

    const entered = Number(operatorEnteredAmount) || 0;
    const difference = entered - closingSummary.expectedInDrawer;

    // Create a closing log or receipt
    const finalReport = {
      ...closingSummary,
      enteredAmount: entered,
      difference,
      salesCount: session.sales.length
    };

    // Save final report to browser download or print
    alert(`Fechamento Realizado!\n\nOperador: ${finalReport.openedBy}\nFaturamento Total: R$ ${finalReport.totalSold.toFixed(2)}\nDiferença de Caixa: R$ ${finalReport.difference.toFixed(2)}`);

    // Reset session in state
    setSession({
      isOpen: false,
      openedAt: "",
      openedBy: "",
      initialAmount: 0,
      sales: []
    });

    setShowCloseModal(false);
    setClosingSummary(null);
    showLocalToast("Caixa fechado com sucesso!");
  };

  // Pre-fill opening operator if changed
  useEffect(() => {
    if (user?.name) {
      setOpeningOperator(user.name);
    }
  }, [user]);

  // View Opening Register form if closed
  if (!session.isOpen) {
    return (
      <div className="flex items-center justify-center min-h-[500px] p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        >
          <div className="bg-slate-900 px-6 py-8 text-center text-white relative">
            <div className="absolute top-4 right-4 bg-red-500/20 text-red-400 border border-red-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
              CAIXA FECHADO
            </div>
            <div className="w-16 h-16 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black tracking-tight">Frente de Caixa (PDV)</h2>
            <p className="text-xs text-slate-400 mt-1">Abra uma nova sessão de caixa para iniciar as vendas integradas ao estoque.</p>
          </div>

          <form onSubmit={handleOpenRegister} className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase block">Operador Responsável</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="text"
                  required
                  value={openingOperator}
                  onChange={(e) => setOpeningOperator(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase block">Fundo de Caixa Inicial (Troco)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-500">Valor de moedas/cédulas deixados na gaveta para troco.</p>
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/15 cursor-pointer transition-colors"
            >
              <Unlock className="w-4 h-4" />
              Abrir Caixa e Iniciar Expediente
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header Status */}
      <div className="bg-slate-900 rounded-2xl p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black">CAIXA ABERTO</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[9px] font-extrabold uppercase">ATIVO</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Operador: <span className="text-white font-semibold">{session.openedBy}</span> | Abertura: <span className="text-white font-semibold">{new Date(session.openedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span> | Fundo Inicial: <span className="text-emerald-400 font-bold">R$ {session.initialAmount.toFixed(2)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700/50 text-right">
            <span className="block text-[9px] text-slate-400 font-bold uppercase">Vendas na Sessão</span>
            <span className="text-sm font-black text-emerald-400">{session.sales.length} vendas (R$ {session.sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)})</span>
          </div>

          <button 
            onClick={handleCalculateCloseSession}
            className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-lg shadow-red-600/10"
          >
            <Lock className="w-3.5 h-3.5" />
            Fechar Caixa
          </button>
        </div>
      </div>

      {/* Local Toast Messages */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-xs flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Catalog & Searching (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm space-y-4">
            
            {/* Search inputs */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Pesquisar por Nome, Código SKU ou ler Código de Barras..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Custom stock indicator */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>Preço em Reais (BRL)</span>
              </div>
              <div>
                <span>Estoque negativo: </span>
                <span className={`font-bold ${allowNegativeStock ? "text-emerald-600" : "text-amber-600"}`}>
                  {allowNegativeStock ? "HABILITADO" : "BLOQUEADO"}
                </span>
              </div>
            </div>

            {/* Products grid */}
            <div className="max-h-[500px] overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 space-y-2">
                  <Layers className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">Nenhum produto ativo encontrado.</p>
                </div>
              ) : (
                filteredProducts.map(p => {
                  const isLowStock = p.stock <= p.minStock;
                  return (
                    <div 
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className={`group p-3 rounded-xl border transition-all cursor-pointer select-none text-left flex flex-col justify-between h-32 hover:border-emerald-500 hover:shadow-md ${
                        isLowStock 
                          ? "bg-amber-50/20 border-amber-200" 
                          : "bg-white border-slate-200/70"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-slate-800 text-xs line-clamp-2 leading-tight group-hover:text-emerald-600">
                            {p.name}
                          </span>
                          {p.category && (
                            <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-semibold uppercase flex-shrink-0">
                              {p.category}
                            </span>
                          )}
                        </div>
                        <span className="block text-[10px] text-slate-400 mt-1 font-mono">
                          SKU: {p.sku} {p.barcode ? `| CB: ${p.barcode}` : ""}
                        </span>
                      </div>

                      <div className="flex items-end justify-between pt-2">
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold leading-none">Estoque</span>
                          <span className={`text-xs font-bold leading-none ${
                            p.stock <= 0 
                              ? "text-red-500" 
                              : isLowStock 
                                ? "text-amber-600" 
                                : "text-slate-600"
                          }`}>
                            {p.stock} un {isLowStock && p.stock > 0 && "⚠️"}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black text-slate-900">
                            R$ {p.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Cart / Sale Summary / Payment Terminal (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-sm flex flex-col h-[670px] justify-between">
            
            {/* Header & Client selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  Cupom de Venda Ativo
                </h3>
                <span className="px-2 py-0.5 bg-slate-100 rounded-full text-slate-500 text-[10px] font-bold">
                  {cart.length} itens
                </span>
              </div>

              {/* Client select */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Cliente da Venda</label>
                <select 
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                >
                  <option value="c_generic">Consumidor Final (Sem CPF/CNPJ)</option>
                  {allClients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.document ? `(${c.document})` : ""}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cart list (flex-1 scroll) */}
            <div className="flex-1 my-4 overflow-y-auto space-y-2.5 pr-1">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 text-center">
                  <ShoppingCart className="w-12 h-12 text-slate-200 mb-3" />
                  <p className="text-xs">Carrinho Vazio.</p>
                  <p className="text-[10px] text-slate-500 mt-1">Selecione produtos no painel ao lado para registrar a compra.</p>
                </div>
              ) : (
                cart.map(item => (
                  <motion.div 
                    layout
                    key={item.product.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="block font-bold text-slate-800 text-xs truncate">{item.product.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">R$ {item.product.price.toFixed(2)}/un</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button 
                        onClick={() => decreaseQuantity(item.product.id)}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                      <button 
                        onClick={() => addToCart(item.product)}
                        className="p-1 rounded bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-black text-slate-900 w-16 block">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Totalizer & Payment selection */}
            <div className="space-y-4 pt-3 border-t border-slate-100">
              
              {/* Grand Total display */}
              <div className="bg-slate-950 p-4 rounded-xl text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Total do Cupom</span>
                  <span className="text-xs font-bold text-emerald-400">{totalItemsCount} produtos selecionados</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">R$ {totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment methods list */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Forma de Pagamento</label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: "dinheiro", label: "Dinheiro", icon: DollarSign },
                    { id: "pix", label: "PIX", icon: QrCode },
                    { id: "cartao", label: "Cartão", icon: CreditCard },
                    { id: "misto", label: "Misto", icon: Layers }
                  ].map(m => {
                    const isSelected = paymentMethod === m.id;
                    const Icon = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`py-2 px-1 rounded-lg border text-center flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                          isSelected 
                            ? "bg-emerald-600 border-emerald-600 text-white shadow" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[9px] font-bold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Payment Details Panel */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/50 space-y-2 text-xs">
                {paymentMethod === "dinheiro" && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1 text-left">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Valor Recebido</label>
                      <input 
                        type="number"
                        placeholder="R$ 0,00"
                        value={cashGiven}
                        onChange={(e) => setCashGiven(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none"
                      />
                    </div>
                    {parsedCashGiven > 0 && (
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Troco Devido</span>
                        <span className="text-lg font-black text-emerald-600">R$ {changeDue.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === "pix" && (
                  <div className="flex items-center gap-2.5 text-[10px] text-slate-500 text-left">
                    <QrCode className="w-5 h-5 text-emerald-600 flex-shrink-0 animate-pulse" />
                    <p>O cliente pagará escaneando o QR Code estático do estabelecimento. O saldo PIX cairá na conta imediatamente.</p>
                  </div>
                )}

                {paymentMethod === "cartao" && (
                  <div className="flex items-center gap-2.5 text-[10px] text-slate-500 text-left">
                    <CreditCard className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <p>Insira ou aproxime o cartão de débito/crédito do cliente no terminal POS de sua preferência.</p>
                  </div>
                )}

                {paymentMethod === "misto" && (
                  <div className="space-y-2 text-left">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block leading-none">Preencha os Valores Divididos</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 font-bold">💵 Dinheiro</span>
                        <input 
                          type="number" 
                          placeholder="R$ 0,00"
                          value={mixedDinero}
                          onChange={(e) => setMixedDinero(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 font-bold">⚡ PIX</span>
                        <input 
                          type="number" 
                          placeholder="R$ 0,00"
                          value={mixedPix}
                          onChange={(e) => setMixedPix(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-slate-500 font-bold">💳 Cartão</span>
                        <input 
                          type="number" 
                          placeholder="R$ 0,00"
                          value={mixedCard}
                          onChange={(e) => setMixedCard(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-white border border-slate-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Final actions */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  type="button"
                  onClick={cancelSale}
                  disabled={cart.length === 0}
                  className="py-3 px-4 rounded-xl border border-slate-200 text-slate-500 font-bold text-xs cursor-pointer hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar Venda
                </button>

                <button 
                  type="button"
                  onClick={handleFinalizeSale}
                  disabled={cart.length === 0}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Finalizar Venda
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* MODAL 1: FECHAMENTO DE CAIXA */}
      {showCloseModal && closingSummary && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden text-left"
          >
            <div className="bg-red-600 text-white px-6 py-5 flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Lock className="w-5 h-5" /> Encerramento de Caixa
              </h3>
              <button onClick={() => setShowCloseModal(false)} className="p-1 rounded-lg hover:bg-red-700 text-white/80">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Data Abertura</span>
                  <span className="text-xs text-slate-800 font-bold">{new Date(closingSummary.openedAt).toLocaleDateString()}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/50">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Operador</span>
                  <span className="text-xs text-slate-800 font-bold">{closingSummary.openedBy}</span>
                </div>
              </div>

              {/* Financial Breakdowns */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wide">Relatório Detalhado</h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-600">💵 Fundo de Caixa Inicial:</span>
                    <span className="font-bold text-slate-800">R$ {closingSummary.initialFloat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-600">💵 Vendas em Dinheiro:</span>
                    <span className="font-bold text-slate-800">R$ {closingSummary.dineroSum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-600">⚡ Vendas em PIX:</span>
                    <span className="font-bold text-slate-800">R$ {closingSummary.pixSum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-dashed border-slate-200">
                    <span className="text-slate-600">💳 Vendas em Cartão:</span>
                    <span className="font-bold text-slate-800">R$ {closingSummary.cardSum.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-800 font-bold border-b border-slate-200">
                    <span>🛍 Total Geral Vendido:</span>
                    <span className="text-emerald-600">R$ {closingSummary.totalSold.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-lg text-slate-900 font-black text-sm mt-3 border border-emerald-200">
                    <span>💰 Total Esperado em Gaveta (Fundo + Dinheiro):</span>
                    <span className="text-emerald-700">R$ {closingSummary.expectedInDrawer.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Operator entered amount input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-slate-700 block uppercase">Informe o valor real contado na gaveta</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">R$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    value={operatorEnteredAmount}
                    onChange={(e) => setOperatorEnteredAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
                {(() => {
                  const diff = (Number(operatorEnteredAmount) || 0) - closingSummary.expectedInDrawer;
                  return (
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span>Diferença:</span>
                      {Math.abs(diff) < 0.05 ? (
                        <span className="text-emerald-600 font-bold">✅ Caixa Correto (Sem diferença)</span>
                      ) : diff > 0 ? (
                        <span className="text-blue-600 font-bold">Sobra de Caixa: R$ {diff.toFixed(2)}</span>
                      ) : (
                        <span className="text-red-600 font-bold">Falta de Caixa: R$ {Math.abs(diff).toFixed(2)}</span>
                      )}
                    </div>
                  );
                })()}
              </div>

              <button 
                type="button"
                onClick={handleFinalizeCloseRegister}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-red-600/10 cursor-pointer transition-colors text-center"
              >
                Confirmar Fechamento e Encerra Expediente
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL 2: simulated THERMAL INVOICE RECEIPT */}
      {receiptSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden text-slate-800 text-left border border-slate-200"
          >
            <div className="bg-slate-950 text-white p-4 flex items-center justify-between">
              <span className="font-extrabold text-xs tracking-wider">COMPROVANTE FISCAL</span>
              <button 
                onClick={() => setReceiptSale(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated thermal receipt body */}
            <div className="p-6 bg-amber-50/10 font-mono text-xs space-y-4 border-b border-dashed border-slate-300">
              <div className="text-center space-y-1">
                <h3 className="font-black text-sm tracking-tight text-slate-950 uppercase">{company?.name || "MEU GESTOR CORP"}</h3>
                <p className="text-[10px] text-slate-500">CNPJ: 12.345.678/0001-99</p>
                <p className="text-[10px] text-slate-500">RUA DO COMERCIO, 100 - SAO PAULO - SP</p>
                <p className="text-[10px] text-slate-500">TELEFONE: (11) 98888-7777</p>
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-2 text-[10px] text-slate-500 space-y-0.5">
                <p>CUPOM: #{receiptSale.id.split("_")[1].toUpperCase()}</p>
                <p>DATA: {new Date(receiptSale.createdAt).toLocaleDateString()} HORA: {new Date(receiptSale.createdAt).toLocaleTimeString()}</p>
                <p>OPERADOR: {session.openedBy}</p>
                <p>CLIENTE: {allClients.find(c => c.id === selectedClient)?.name || "CONSUMIDOR FINAL"}</p>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex text-[10px] text-slate-500 font-bold border-b border-slate-200 pb-1">
                  <span className="flex-1 text-left">ITEM</span>
                  <span className="w-10 text-center">QTD</span>
                  <span className="w-14 text-right">UN</span>
                  <span className="w-16 text-right">TOTAL</span>
                </div>
                <div className="space-y-1.5 text-[10px]">
                  {receiptSale.items.map((item: any, i: number) => (
                    <div key={i} className="flex">
                      <span className="flex-1 text-left truncate uppercase">{item.name}</span>
                      <span className="w-10 text-center">{item.quantity}</span>
                      <span className="w-14 text-right">R$ {item.price.toFixed(2)}</span>
                      <span className="w-16 text-right font-black">R$ {item.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>TOTAL CUPOM:</span>
                  <span>R$ {receiptSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>MEIO DE PAGAMENTO:</span>
                  <span className="uppercase">{receiptSale.paymentMethod === "cartao" ? "CARTÃO" : receiptSale.paymentMethod}</span>
                </div>
              </div>

              <div className="text-center pt-4 text-[9px] text-slate-400 border-t border-slate-100">
                <p>OBRIGADO PELA PREFERENCIA!</p>
                <p>SISTEMA ERP MEU GESTOR</p>
              </div>
            </div>

            {/* Print trigger button */}
            <div className="p-4 bg-slate-50 flex gap-2">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs cursor-pointer shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Cupom
              </button>
              <button 
                onClick={() => setReceiptSale(null)}
                className="flex-1 inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-xl text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCancelConfirm(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-150 max-w-md w-full overflow-hidden z-10 p-6 space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-left">
                <h4 className="font-extrabold text-sm text-slate-900 uppercase">Cancelar Venda</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">Tem certeza que deseja cancelar a venda atual? Todo o carrinho será limpo.</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2 text-xs">
              <button 
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Não, Continuar Venda
              </button>
              <button 
                type="button"
                onClick={confirmCancelSale}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-md shadow-rose-600/10 cursor-pointer"
              >
                Sim, Cancelar Venda
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
