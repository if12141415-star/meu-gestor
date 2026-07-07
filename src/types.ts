/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Company {
  id: string;
  name: string;
  responsibleName: string;
  email: string;
  phone: string;
  status?: 'active' | 'inactive' | 'suspended' | 'pending_payment';
  createdAt: string;
  planId?: string;
  planName?: string;
  planPrice?: number;
  subscriptionExpiresAt?: string;
  nextBillingAt?: string;
  manualReleased?: boolean;
  overdueDays?: number;
  usePdv?: boolean;
  supportAccessAuthorized?: boolean;
  supportAccessExpiresAt?: string;
  supportAccessAuthorizedAt?: string;
  supportAccessRequestedBy?: string;
  modules?: Record<string, any>;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface CustomRole {
  id: string;
  companyId: string;
  name: string;
  description: string;
  permissions: string[]; // List of permission IDs
  createdAt: string;
}

export interface User {
  id: string;
  companyId?: string;
  name: string;
  email: string;
  phone: string;
  username?: string;
  role: 'superadmin' | 'admin' | 'user';
  roleId?: string | null;
  permissions?: string[]; // Computed permissions for frontend
  createdAt: string;
  photo?: string;
  cargo?: string;
  status?: 'active' | 'inactive';
  cpf?: string;
  admissaoDate?: string;
  observacoes?: string;
  hasAccess?: boolean;
  setor?: string;
  lastLogin?: string;
}

export interface DashboardStats {
  billing: number;      // Faturamento
  productsCount: number; // Qtd Produtos
  clientsCount: number;  // Qtd Clientes
  salesCount: number;    // Qtd Vendas
  profit: number;        // Lucro
  stockCount: number;    // Qtd Estoque
  billingGrowth: number; // Crescimento % faturamento
  profitGrowth: number;  // Crescimento % lucro
  stockValue: number;    // Valor total do estoque
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  category: string;
  image?: string;
  status?: string;
  createdAt: string;
  location?: string;
  lot?: string;
  supplier?: string;
  receiptDate?: string;
  invoiceNumber?: string;
  unidade?: string;
  marca?: string;
  descricao?: string;
}

export interface Client {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  document: string; // CPF/CNPJ
  city: string;
  state: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  companyId: string;
  clientId: string;
  clientName: string;
  total: number;
  profit: number;
  status: 'completed' | 'pending' | 'cancelled';
  itemsCount: number;
  createdAt: string;
  userId?: string;
  userName?: string;
  items?: SaleItem[];
}

export interface SaleDetail extends Sale {
  items: SaleItem[];
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface StockNotification {
  id: string;
  companyId: string;
  type: 'low_stock' | 'out_of_stock' | 'fast_seller' | 'idle' | 'near_min' | 'prediction' | 'suggestion';
  severity: 'info' | 'warning' | 'danger' | 'success';
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    productId?: string;
    productName?: string;
    stock?: number;
    minStock?: number;
    whatsappSent?: boolean;
    whatsappMsg?: string;
  };
}

export interface WhatsappConfig {
  companyId: string;
  whatsappEnabled: boolean;
  whatsappPhone: string;
}
