import React, { useState, useEffect } from "react";

interface TickerProps {
  products: any[];
  transactions: any[];
  tickerConfig: {
    showDateTime?: boolean;
    showSystemMessages?: boolean;
    showLowStock?: boolean;
    showExpiringProducts?: boolean;
    showAccountsDue?: boolean;
    showSuperAdminAnnouncements?: boolean;
    showMarketNews?: boolean;
    showEconomicIndicators?: boolean;
    tickerSpeed?: "slow" | "normal" | "fast";
    tickerTheme?: "dark" | "light" | "emerald";
  };
  token: string;
}

export function Ticker({ products, transactions, tickerConfig, token }: TickerProps) {
  const [dateTimeStr, setDateTimeStr] = useState("");
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<{ news: any[]; currencies: any; ibovespa: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Live Time Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatOption: Intl.DateTimeFormatOptions = {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "America/Sao_Paulo",
      };
      setDateTimeStr(now.toLocaleDateString("pt-BR", formatOption));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Broadcasts and External Market Data
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch Broadcasts
        const bcRes = await fetch("/api/broadcasts", { headers });
        let bcs = [];
        if (bcRes.ok) {
          bcs = await bcRes.json();
        }

        // Fetch Market Data
        const mdRes = await fetch("/api/external/market-data", { headers });
        let md = null;
        if (mdRes.ok) {
          md = await mdRes.json();
        }

        setBroadcasts(bcs);
        if (md) {
          setMarketData(md);
        }
      } catch (err) {
        console.warn("Ticker background fetch warning (will retry):", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Poll every 3 minutes
    const interval = setInterval(fetchData, 180000);
    return () => clearInterval(interval);
  }, [token]);

  // 3. Compile list of active ticker items based on tickerConfig
  const tickerItems: { id: string; type: string; content: React.ReactNode }[] = [];

  // Configuration values (default to true if undefined)
  const showDateTime = tickerConfig?.showDateTime ?? true;
  const showSystemMessages = tickerConfig?.showSystemMessages ?? true;
  const showLowStock = tickerConfig?.showLowStock ?? true;
  const showExpiringProducts = tickerConfig?.showExpiringProducts ?? true;
  const showAccountsDue = tickerConfig?.showAccountsDue ?? true;
  const showSuperAdminAnnouncements = tickerConfig?.showSuperAdminAnnouncements ?? true;
  const showMarketNews = tickerConfig?.showMarketNews ?? true;
  const showEconomicIndicators = tickerConfig?.showEconomicIndicators ?? true;

  // Fallback Market Data in case API is loading or unavailable (always ensure messages are populated)
  const fallbackMarketData = marketData || {
    news: [
      { title: "Varejo nacional projeta alta de 4.2% no acumulado trimestral", link: "https://g1.globo.com/economia" },
      { title: "Setor de distribuição acelera automação e reduz custos em 15%", link: "https://g1.globo.com/economia" },
      { title: "Novas regras do Pix simplificam fluxo de caixa empresarial", link: "https://g1.globo.com/economia" }
    ],
    currencies: { usd: "5.45", eur: "5.90" },
    ibovespa: "126.020 pts (+0.33%)"
  };

  // Real-time Date and Time
  if (showDateTime && dateTimeStr) {
    tickerItems.push({
      id: "datetime",
      type: "datetime",
      content: (
        <span className="flex items-center gap-1.5 text-slate-700 font-bold">
          <span className="text-sky-500">📅</span>
          <span>{dateTimeStr} (SP)</span>
        </span>
      ),
    });
  }

  // System status/tips messages
  if (showSystemMessages) {
    const now = new Date();
    const dataAtual = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });
    const horaAtual = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });

    const systemMessages = [
      "🟢 Bem-vindo ao Meu Gestor • Sistema funcionando normalmente.",
      `📅 Hoje é ${dataAtual} • 🕒 Horário: ${horaAtual}`,
      "📢 Dica: Faça backup periódico dos seus dados para aumentar a segurança da empresa.",
      "📦 Atenção: Produtos com estoque baixo serão destacados automaticamente no sistema.",
      "💰 Confira diariamente seu fluxo de caixa para manter o financeiro organizado.",
      "📈 Acompanhe os indicadores do mercado para tomar melhores decisões comerciais.",
      "🛒 Mantenha os preços dos produtos sempre atualizados.",
      "📋 Organize os produtos por categorias para facilitar as buscas.",
      "🏷️ Utilize códigos de barras para agilizar o cadastro e a localização dos produtos.",
      "🚚 Controle corretamente os lotes das mercadorias para melhorar a gestão do estoque.",
      "📊 Relatórios atualizados ajudam a identificar oportunidades de crescimento.",
      "🔔 Verifique periodicamente as notificações do sistema.",
      "🔒 Nunca compartilhe sua senha de acesso com terceiros.",
      "💡 Dica: Cadastre corretamente seus fornecedores para facilitar novas compras.",
      "📰 Últimas notícias do setor varejista e de distribuição serão exibidas aqui automaticamente.",
      "💵 Cotação do dólar, euro e outros indicadores econômicos serão atualizados em tempo real.",
      "📈 IBOVESPA atualizado automaticamente durante o horário de funcionamento do mercado.",
      "🚀 Obrigado por utilizar o Meu Gestor. Desejamos excelentes negócios!"
    ];
    systemMessages.forEach((msg, idx) => {
      tickerItems.push({
        id: `sys-${idx}`,
        type: "system",
        content: <span className="text-slate-700 font-medium">{msg}</span>,
      });
    });
  }

  // Low Stock Alerts (Real dynamic data)
  if (showLowStock && products && products.length > 0) {
    const lowStockProds = products.filter((p) => p.quantity <= (p.minStock || 5));
    if (lowStockProds.length > 0) {
      lowStockProds.slice(0, 3).forEach((prod) => {
        tickerItems.push({
          id: `lowstock-${prod.id}`,
          type: "lowstock",
          content: (
            <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
              <span>⚠️ ESTOQUE BAIXO:</span>
              <span className="underline decoration-amber-600/40">{prod.name}</span>
              <span className="text-[13px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                Apenas {prod.quantity} {prod.unit || "un"} restantes
              </span>
            </span>
          ),
        });
      });
    } else {
      tickerItems.push({
        id: "lowstock-clean",
        type: "lowstock",
        content: <span className="text-emerald-700 font-semibold">🟢 Todos os estoques estão em níveis ideais</span>,
      });
    }
  }

  // Near-expiry Products (Real dynamic data with receipt-based expiration computation)
  if (showExpiringProducts && products && products.length > 0) {
    const expiringProds = products.filter((p) => {
      if (!p.receiptDate) return false;
      const receipt = new Date(p.receiptDate);
      const expiration = new Date(receipt.getTime() + 120 * 24 * 60 * 60 * 1000);
      const diffDays = Math.ceil((expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 45;
    });

    if (expiringProds.length > 0) {
      expiringProds.slice(0, 3).forEach((prod) => {
        const receipt = new Date(prod.receiptDate);
        const expiration = new Date(receipt.getTime() + 120 * 24 * 60 * 60 * 1000);
        const diffDays = Math.ceil((expiration.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        tickerItems.push({
          id: `expiry-${prod.id}`,
          type: "expiry",
          content: (
            <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
              <span>⏳ VENCIMENTO PRÓXIMO:</span>
              <span>{prod.name}</span>
              {prod.lot && <span className="text-[13px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Lote: {prod.lot}</span>}
              <span className="text-[13px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">Vence em {diffDays} dias</span>
            </span>
          ),
        });
      });
    } else {
      tickerItems.push({
        id: "expiry-clean",
        type: "expiry",
        content: <span className="text-emerald-700 font-semibold">🛡️ Sem produtos próximos do vencimento em estoque</span>,
      });
    }
  }

  // Accounts Due (Real dynamic ledger data)
  if (showAccountsDue && transactions && transactions.length > 0) {
    const pendingTrans = transactions.filter(
      (t) => t.status === "pending" || t.status === "pendente"
    );
    if (pendingTrans.length > 0) {
      pendingTrans.slice(0, 3).forEach((trans) => {
        const valueFormatted = parseFloat(trans.amount).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });
        const isExpense = trans.type === "expense" || trans.type === "despesa";
        tickerItems.push({
          id: `due-${trans.id}`,
          type: "due",
          content: (
            <span className={`flex items-center gap-1.5 font-bold ${isExpense ? "text-amber-700" : "text-emerald-700"}`}>
              <span>💸 {isExpense ? "DESPESA A VENCER:" : "RECEITA A RECEBER:"}</span>
              <span>{trans.description}</span>
              <span className="text-[13px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">{valueFormatted}</span>
            </span>
          ),
        });
      });
    } else {
      tickerItems.push({
        id: "due-clean",
        type: "due",
        content: <span className="text-emerald-700 font-semibold">✅ Todas as contas financeiras estão liquidadas</span>,
      });
    }
  }

  // Super Admin Announcements
  if (showSuperAdminAnnouncements && broadcasts.length > 0) {
    broadcasts.forEach((bc) => {
      tickerItems.push({
        id: bc.id,
        type: "broadcast",
        content: (
          <span className="flex items-center gap-1.5 text-violet-700 font-bold">
            <span>📢 COMUNICADO:</span>
            <span>{bc.message}</span>
          </span>
        ),
      });
    });
  }

  // Economic Indicators (use fallback if empty to keep bar populated)
  if (showEconomicIndicators) {
    tickerItems.push({
      id: "ibov",
      type: "indicator",
      content: (
        <span className="flex items-center gap-1.5">
          <span className="text-indigo-700 font-bold">📈 IBOVESPA:</span>
          <span className="font-semibold text-indigo-900">{fallbackMarketData.ibovespa}</span>
        </span>
      ),
    });

    tickerItems.push({
      id: "usd",
      type: "indicator",
      content: (
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-700 font-bold">💵 DÓLAR:</span>
          <span className="font-semibold text-emerald-900">R$ {fallbackMarketData.currencies.usd}</span>
        </span>
      ),
    });

    tickerItems.push({
      id: "eur",
      type: "indicator",
      content: (
        <span className="flex items-center gap-1.5">
          <span className="text-blue-700 font-bold">💶 EURO:</span>
          <span className="font-semibold text-blue-900">R$ {fallbackMarketData.currencies.eur}</span>
        </span>
      ),
    });
  }

  // Market News (use fallback if empty to keep bar populated)
  if (showMarketNews) {
    fallbackMarketData.news.slice(0, 3).forEach((article, idx) => {
      tickerItems.push({
        id: `news-${idx}`,
        type: "news",
        content: (
          <a
            href={article.link}
            target="_blank"
            referrerPolicy="no-referrer"
            className="hover:underline flex items-center gap-1.5 text-slate-700 transition-colors hover:text-emerald-600 font-medium"
          >
            <span className="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold">G1 Economia</span>
            <span>{article.title}</span>
          </a>
        ),
      });
    });
  }

  const speed = tickerConfig?.tickerSpeed || "normal";

  // Slowed down by ~40% (meaning durations are increased by ~67%)
  const speedDuration = {
    slow: "100s",
    normal: "65s",
    fast: "35s",
  }[speed];

  // If there are no items to show, provide a clean absolute fallback
  if (tickerItems.length === 0) {
    tickerItems.push({
      id: "absolute-fallback",
      type: "system",
      content: <span className="text-slate-700 font-bold">🟢 Meu Gestor • Sistema operacional funcionando normalmente • Bons negócios!</span>
    });
  }

  return (
    <div
      id="app_header_ticker"
      className="w-full overflow-hidden select-none relative h-10 flex items-center justify-start text-[16px] md:text-[18px] font-semibold font-sans tracking-wide bg-transparent"
      style={{ zIndex: 10 }}
    >
      {/* CSS Animation injection */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-ticker-track {
          display: flex;
          width: max-content;
          animation: ticker-scroll ${speedDuration} linear infinite;
        }
        .animate-ticker-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Decorative gradients on the sides */}
      <div className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none z-10 bg-gradient-to-r from-white to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none z-10 bg-gradient-to-l from-white to-transparent" />

      <div className="animate-ticker-track flex items-center gap-20 py-1 whitespace-nowrap">
        {/* Render twice for seamless, infinite looping scrolling experience */}
        {[1, 2].map((loopIdx) => (
          <div key={loopIdx} className="flex items-center gap-20">
            {tickerItems.map((item, itemIdx) => (
              <div key={`${loopIdx}-${item.id}-${itemIdx}`} className="flex items-center gap-20">
                <div className="flex items-center gap-2.5">{item.content}</div>
                {/* Visual elegant separator dot */}
                <span className="w-2 h-2 rounded-full bg-slate-300 flex-shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
