/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, doublePrecision, boolean, index } from "drizzle-orm/pg-core";

// ==========================================================
// 1. TENANCY & SECURITY SYSTEM
// ==========================================================

// Companies Table (Empresas)
export const companies = pgTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  responsibleName: text("responsible_name").notNull(),
  cnpj: text("cnpj"),
  email: text("email").notNull(),
  phone: text("phone"),
  address: text("address"),
  planSelected: text("plan_selected").default("PRO"),
  status: text("status").default("active"), // active, suspended, trialing
  lastAccess: timestamp("last_access"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Custom Roles Table (Perfis / Cargos / RBAC)
export const customRoles = pgTable("custom_roles", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  permissions: text("permissions").notNull(), // JSON array of permission strings stored as text
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_roles_company").on(table.companyId),
  ];
});

// Users Table (Usuários - Auth & Team)
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  uid: text("uid").notNull().unique(), // Firebase Auth UID or Custom login identifier
  companyId: text("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  role: text("role").$type<"admin" | "user">().notNull().default("user"),
  roleId: text("role_id").references(() => customRoles.id),
  photo: text("photo"),
  status: text("status").default("active"), // active, inactive
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_users_company").on(table.companyId),
    index("idx_users_uid").on(table.uid),
    index("idx_users_email").on(table.email),
  ];
});

// User Sessions Table (Sessões / Tokens)
export const userSessions = pgTable("user_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_sessions_user").on(table.userId),
    index("idx_sessions_token").on(table.token),
  ];
});

// ==========================================================
// 2. STORES, PRODUCTS & SUPPLY CHAIN
// ==========================================================

// Categories Table (Categorias de Produtos)
export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_categories_company").on(table.companyId),
  ];
});

// Suppliers Table (Fornecedores)
export const suppliers = pgTable("suppliers", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  cnpj: text("cnpj"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  contactName: text("contact_name"),
  status: text("status").default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_suppliers_company").on(table.companyId),
  ];
});

// Products Table (Produtos)
export const products = pgTable("products", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  sku: text("sku").notNull(),
  barcode: text("barcode"),
  price: doublePrecision("price").notNull(),
  costPrice: doublePrecision("cost_price").notNull(),
  profit: doublePrecision("profit").default(0), // Price - Cost Price margin
  stock: integer("stock").notNull(),
  minStock: integer("min_stock").notNull(),
  category: text("category").notNull(), // Legacy text for quick classification
  categoryId: text("category_id").references(() => categories.id),
  supplierId: text("supplier_id").references(() => suppliers.id),
  description: text("description"),
  image: text("image"),
  status: text("status").default("active"), // active, inactive, discontinued
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_products_company").on(table.companyId),
    index("idx_products_sku").on(table.sku),
    index("idx_products_barcode").on(table.barcode),
  ];
});

// Stock Movements Table (Movimentação de Estoque)
export const stockMovements = pgTable("stock_movements", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  productId: text("product_id").references(() => products.id).notNull(),
  type: text("type").$type<"input" | "output" | "transfer" | "loss" | "inventory">().notNull(),
  quantity: integer("quantity").notNull(),
  reason: text("reason"),
  userId: text("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_stock_mov_product").on(table.productId),
    index("idx_stock_mov_company").on(table.companyId),
  ];
});

// ==========================================================
// 3. SALES & CLIENTS SYSTEM
// ==========================================================

// Clients Table (Clientes)
export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  document: text("document"), // CPF/CNPJ
  address: text("address"),
  city: text("city"),
  state: text("state"),
  observations: text("observations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_clients_company").on(table.companyId),
    index("idx_clients_document").on(table.document),
  ];
});

// Sales Table (Vendas)
export const sales = pgTable("sales", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  clientId: text("client_id").references(() => clients.id),
  clientName: text("client_name").notNull(),
  userId: text("user_id").references(() => users.id),
  total: doublePrecision("total").notNull(),
  profit: doublePrecision("profit").notNull(),
  discount: doublePrecision("discount").default(0),
  paymentMethod: text("payment_method").default("money"), // money, pix, credit, debit
  status: text("status").$type<"completed" | "pending" | "cancelled">().notNull().default("completed"),
  itemsCount: integer("items_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_sales_company").on(table.companyId),
    index("idx_sales_client").on(table.clientId),
  ];
});

// Sale Items Table (Itens da Venda)
export const saleItems = pgTable("sale_items", {
  id: text("id").primaryKey(),
  saleId: text("sale_id").references(() => sales.id).notNull(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  productId: text("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
  subtotal: doublePrecision("subtotal").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_sale_items_sale").on(table.saleId),
    index("idx_sale_items_product").on(table.productId),
  ];
});

// ==========================================================
// 4. FINANCIAL & LEDGER SYSTEM
// ==========================================================

// Cash Registers Table (Caixas)
export const registers = pgTable("registers", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(), // Ex: "Caixa Frente de Loja"
  status: text("status").$type<"open" | "closed">().notNull().default("closed"),
  openedAt: timestamp("opened_at"),
  closedAt: timestamp("closed_at"),
  openedByUserId: text("opened_by_user_id").references(() => users.id),
  closedByUserId: text("closed_by_user_id").references(() => users.id),
  initialAmount: doublePrecision("initial_amount").default(0),
  finalAmount: doublePrecision("final_amount").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_registers_company").on(table.companyId),
  ];
});

// Financial Transactions / Cash Flow Table (Financeiro / Fluxo de Caixa)
export const financialTransactions = pgTable("financial_transactions", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  registerId: text("register_id").references(() => registers.id),
  type: text("type").$type<"income" | "expense">().notNull(),
  category: text("category").notNull(), // General category (Mkt, TI, Sales, Infra)
  amount: doublePrecision("amount").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date"),
  paymentDate: timestamp("payment_date"),
  status: text("status").$type<"paid" | "pending">().notNull().default("paid"),
  costCenter: text("cost_center"), // Centro de Custo
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_finance_company").on(table.companyId),
    index("idx_finance_register").on(table.registerId),
  ];
});

// Accounts Payable Table (Contas a Pagar)
export const accountsPayable = pgTable("accounts_payable", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  description: text("description").notNull(),
  supplierId: text("supplier_id").references(() => suppliers.id),
  amount: doublePrecision("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentDate: timestamp("payment_date"),
  status: text("status").$type<"paid" | "pending">().notNull().default("pending"),
  category: text("category").default("Geral"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_payable_company").on(table.companyId),
    index("idx_payable_due").on(table.dueDate),
  ];
});

// Accounts Receivable Table (Contas a Receber)
export const accountsReceivable = pgTable("accounts_receivable", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  description: text("description").notNull(),
  clientId: text("client_id").references(() => clients.id),
  saleId: text("sale_id").references(() => sales.id),
  amount: doublePrecision("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  paymentDate: timestamp("payment_date"),
  status: text("status").$type<"paid" | "pending">().notNull().default("pending"),
  category: text("category").default("Geral"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_receivable_company").on(table.companyId),
    index("idx_receivable_due").on(table.dueDate),
  ];
});

// ==========================================================
// 5. SAAS GLOBAL & MONETIZATION
// ==========================================================

// Global SaaS Plans Table (Planos)
export const plans = pgTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  price: doublePrecision("price").notNull(),
  maxUsers: integer("max_users").notNull(),
  maxProducts: integer("max_products").notNull(),
  features: text("features").notNull(), // JSON list of features as text
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Company Subscriptions Table (Assinaturas)
export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  planId: text("plan_id").references(() => plans.id).notNull(),
  status: text("status").notNull(), // active, unpaid, cancelled, trialing
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  autoRenew: boolean("auto_renew").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_subs_company").on(table.companyId),
  ];
});

// Payments Table (Histórico de Pagamentos)
export const payments = pgTable("payments", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  subscriptionId: text("subscription_id").references(() => subscriptions.id).notNull(),
  amount: doublePrecision("amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull(), // succeeded, failed, pending
  paidAt: timestamp("paid_at"),
  gatewayTransactionId: text("gateway_transaction_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_payments_company").on(table.companyId),
  ];
});

// ==========================================================
// 6. METADATA, PREFERENCES & ANALYTICS
// ==========================================================

// Reports Configurations Table (Relatórios)
export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // custom, finance, stock, sales
  parameters: text("parameters"), // JSON query parameters stored as text
  createdByUserId: text("created_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_reports_company").on(table.companyId),
  ];
});

// Configurations Table (Configurações do ERP)
export const settings = pgTable("settings", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  theme: text("theme").default("light").notNull(),
  language: text("language").default("pt-BR").notNull(),
  currency: text("currency").default("BRL").notNull(),
  timezone: text("timezone").default("America/Sao_Paulo").notNull(),
  logoUrl: text("logo_url"),
  companyAddress: text("company_address"),
  companyCNPJ: text("company_cnpj"),
  companyPhone: text("company_phone"),
  companyEmail: text("company_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_settings_company").on(table.companyId),
  ];
});

// Notifications Table (Notificações)
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  userId: text("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  type: text("type").default("general").notNull(), // low_stock, billing, action
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_notifications_user").on(table.userId),
    index("idx_notifications_company").on(table.companyId),
  ];
});

// Audit Logs Table (Auditoria de Eventos)
export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // Ex: CREATE_SALE, UPDATE_PRODUCT, LOGIN
  resource: text("resource").notNull(), // Ex: sales, products, auth
  ipAddress: text("ip_address"),
  details: text("details"), // JSON payload or text summary
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_audit_company").on(table.companyId),
    index("idx_audit_user").on(table.userId),
  ];
});

// Backups Table (Backups de Banco)
export const backups = pgTable("backups", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  size: integer("size").notNull(), // Size in bytes
  url: text("url").notNull(),
  status: text("status").default("completed").notNull(), // completed, pending, failed
  createdByUserId: text("created_by_user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return [
    index("idx_backups_company").on(table.companyId),
  ];
});


// ==========================================================
// DRIZZLE ORM RELATIONS DECLARATION
// ==========================================================

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  products: many(products),
  clients: many(clients),
  sales: many(sales),
  customRoles: many(customRoles),
  categories: many(categories),
  suppliers: many(suppliers),
  registers: many(registers),
  financialTransactions: many(financialTransactions),
  accountsPayable: many(accountsPayable),
  accountsReceivable: many(accountsReceivable),
  subscriptions: many(subscriptions),
  payments: many(payments),
  reports: many(reports),
  settings: many(settings),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  backups: many(backups),
}));

export const customRolesRelations = relations(customRoles, ({ one, many }) => ({
  company: one(companies, {
    fields: [customRoles.companyId],
    references: [companies.id],
  }),
  users: many(users),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  customRole: one(customRoles, {
    fields: [users.roleId],
    references: [customRoles.id],
  }),
  sessions: many(userSessions),
  stockMovements: many(stockMovements),
  sales: many(sales),
  registersOpened: many(registers, { relationName: "openedBy" }),
  registersClosed: many(registers, { relationName: "closedBy" }),
  reportsCreated: many(reports),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  backupsCreated: many(backups),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  company: one(companies, {
    fields: [categories.companyId],
    references: [companies.id],
  }),
  products: many(products),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  company: one(companies, {
    fields: [suppliers.companyId],
    references: [companies.id],
  }),
  products: many(products),
  accountsPayable: many(accountsPayable),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  company: one(companies, {
    fields: [products.companyId],
    references: [companies.id],
  }),
  categoryRef: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  stockMovements: many(stockMovements),
  saleItems: many(saleItems),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  company: one(companies, {
    fields: [stockMovements.companyId],
    references: [companies.id],
  }),
  product: one(products, {
    fields: [stockMovements.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [stockMovements.userId],
    references: [users.id],
  }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  company: one(companies, {
    fields: [clients.companyId],
    references: [companies.id],
  }),
  sales: many(sales),
  accountsReceivable: many(accountsReceivable),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  company: one(companies, {
    fields: [sales.companyId],
    references: [companies.id],
  }),
  client: one(clients, {
    fields: [sales.clientId],
    references: [clients.id],
  }),
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
  items: many(saleItems),
  accountsReceivable: many(accountsReceivable),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  company: one(companies, {
    fields: [saleItems.companyId],
    references: [companies.id],
  }),
  product: one(products, {
    fields: [saleItems.productId],
    references: [products.id],
  }),
}));

export const registersRelations = relations(registers, ({ one, many }) => ({
  company: one(companies, {
    fields: [registers.companyId],
    references: [companies.id],
  }),
  openedBy: one(users, {
    fields: [registers.openedByUserId],
    references: [users.id],
    relationName: "openedBy",
  }),
  closedBy: one(users, {
    fields: [registers.closedByUserId],
    references: [users.id],
    relationName: "closedBy",
  }),
  transactions: many(financialTransactions),
}));

export const financialTransactionsRelations = relations(financialTransactions, ({ one }) => ({
  company: one(companies, {
    fields: [financialTransactions.companyId],
    references: [companies.id],
  }),
  register: one(registers, {
    fields: [financialTransactions.registerId],
    references: [registers.id],
  }),
}));

export const accountsPayableRelations = relations(accountsPayable, ({ one }) => ({
  company: one(companies, {
    fields: [accountsPayable.companyId],
    references: [companies.id],
  }),
  supplier: one(suppliers, {
    fields: [accountsPayable.supplierId],
    references: [suppliers.id],
  }),
}));

export const accountsReceivableRelations = relations(accountsReceivable, ({ one }) => ({
  company: one(companies, {
    fields: [accountsReceivable.companyId],
    references: [companies.id],
  }),
  client: one(clients, {
    fields: [accountsReceivable.clientId],
    references: [clients.id],
  }),
  sale: one(sales, {
    fields: [accountsReceivable.saleId],
    references: [sales.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  company: one(companies, {
    fields: [subscriptions.companyId],
    references: [companies.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  company: one(companies, {
    fields: [payments.companyId],
    references: [companies.id],
  }),
  subscription: one(subscriptions, {
    fields: [payments.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  company: one(companies, {
    fields: [reports.companyId],
    references: [companies.id],
  }),
  createdByUser: one(users, {
    fields: [reports.createdByUserId],
    references: [users.id],
  }),
}));

export const settingsRelations = relations(settings, ({ one }) => ({
  company: one(companies, {
    fields: [settings.companyId],
    references: [companies.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  company: one(companies, {
    fields: [notifications.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  company: one(companies, {
    fields: [auditLogs.companyId],
    references: [companies.id],
  }),
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const backupsRelations = relations(backups, ({ one }) => ({
  company: one(companies, {
    fields: [backups.companyId],
    references: [companies.id],
  }),
  createdByUser: one(users, {
    fields: [backups.createdByUserId],
    references: [users.id],
  }),
}));
