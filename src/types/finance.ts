export type TabId = 'pos' | 'cashflow' | 'reports' | 'inventory';

export type ProductCategory = 'Minuman' | 'Makanan' | 'Retail' | 'Jasa';

export type PaymentMethod = 'Tunai' | 'QRIS' | 'Transfer' | 'Kartu';

export type CashflowType = 'income' | 'expense';

export type ProductIconKey =
  | 'coffee'
  | 'cup'
  | 'utensils'
  | 'croissant'
  | 'package'
  | 'bag'
  | 'sparkles'
  | 'wrench';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  costPrice: number;
  sellPrice: number;
  stock: number;
  unit: string;
  icon: ProductIconKey;
  popular?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ReceiptLineItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  totalPrice: number;
}

export interface CashflowEntry {
  id: string;
  receiptNo?: string;
  timestamp: string; // ISO string
  type: CashflowType;
  source: 'pos' | 'manual';
  category: string;
  description: string;
  customerName?: string;
  paymentMethod: PaymentMethod;
  amount: number;
  subtotal?: number;
  discount?: number;
  tax?: number;
  cashPaid?: number;
  changeAmount?: number;
  totalCost?: number; // COGS for POS transactions
  items?: ReceiptLineItem[];
}

export interface StoreSettings {
  storeName: string;
  branchName: string;
  cashierName: string;
  address: string;
  phone: string;
  taxPercent: number;
  dailyTarget: number;
  receiptFooter: string;
}

export interface ShiftState {
  shiftName: string;
  openedAt: string;
  openingCash: number;
}
