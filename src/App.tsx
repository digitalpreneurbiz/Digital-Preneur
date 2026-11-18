import React, { useEffect, useState } from 'react';
import {
  Store,
  Wallet,
  BarChart3,
  Package,
  ShoppingBag,
  Settings,
  Clock,
} from 'lucide-react';
import {
  CartItem,
  CashflowEntry,
  CashflowType,
  PaymentMethod,
  Product,
  ProductCategory,
  ShiftState,
  StoreSettings,
  TabId,
} from './types/finance';
import {
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
  INITIAL_SHIFT,
  createInitialCashflow,
  formatIDR,
} from './data/seedData';
import { PosCatalogView } from './components/PosCatalogView';
import { CartSidebar } from './components/CartSidebar';
import { CashflowView } from './components/CashflowView';
import { ReportsView } from './components/ReportsView';
import { InventoryView } from './components/InventoryView';
import {
  ProductFormModal,
  ReceiptModal,
  ShiftModal,
  StoreSettingsModal,
  TransactionEntryModal,
} from './components/Modals';

const STORAGE_KEYS = {
  products: 'kasirkita_products_v1',
  cashflow: 'kasirkita_cashflow_v1',
  settings: 'kasirkita_settings_v1',
  shift: 'kasirkita_shift_v1',
};

function loadStored<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback();
    return JSON.parse(raw) as T;
  } catch {
    return fallback();
  }
}

const NAV_ITEMS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'pos', label: 'Kasir', icon: <Store className="w-5 h-5" /> },
  { id: 'cashflow', label: 'Arus Kas', icon: <Wallet className="w-5 h-5" /> },
  { id: 'reports', label: 'Laporan', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'inventory', label: 'Produk', icon: <Package className="w-5 h-5" /> },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('pos');
  const [products, setProducts] = useState<Product[]>(() =>
    loadStored(STORAGE_KEYS.products, () => INITIAL_PRODUCTS)
  );
  const [cashflow, setCashflow] = useState<CashflowEntry[]>(() =>
    loadStored(STORAGE_KEYS.cashflow, createInitialCashflow)
  );
  const [settings, setSettings] = useState<StoreSettings>(() =>
    loadStored(STORAGE_KEYS.settings, () => INITIAL_SETTINGS)
  );
  const [shift, setShift] = useState<ShiftState>(() =>
    loadStored(STORAGE_KEYS.shift, () => INITIAL_SHIFT)
  );

  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'Semua'>('Semua');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

  // Modals State
  const [receiptEntry, setReceiptEntry] = useState<CashflowEntry | null>(null);
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entryModalType, setEntryModalType] = useState<CashflowType>('expense');
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
    } catch {
      // ignore storage quota errors
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.cashflow, JSON.stringify(cashflow));
    } catch {
      // ignore
    }
  }, [cashflow]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.shift, JSON.stringify(shift));
    } catch {
      // ignore
    }
  }, [shift]);

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id !== productId) return item;
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          if (nextQty > item.product.stock) return item;
          return { ...item, quantity: nextQty };
        })
        .filter((x): x is CartItem => x !== null)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = (payload: {
    customerName: string;
    discount: number;
    applyTax: boolean;
    paymentMethod: PaymentMethod;
    cashPaid: number;
  }) => {
    if (cart.length === 0) return;

    const subtotal = cart.reduce(
      (sum, item) => sum + item.product.sellPrice * item.quantity,
      0
    );
    const totalCost = cart.reduce(
      (sum, item) => sum + item.product.costPrice * item.quantity,
      0
    );
    const afterDiscount = Math.max(0, subtotal - payload.discount);
    const tax =
      payload.applyTax && settings.taxPercent > 0
        ? Math.round((afterDiscount * settings.taxPercent) / 100)
        : 0;
    const grandTotal = afterDiscount + tax;
    const changeAmount =
      payload.paymentMethod === 'Tunai' ? Math.max(0, payload.cashPaid - grandTotal) : 0;

    const now = new Date();
    const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
    const seq = String(cashflow.filter((c) => c.source === 'pos').length + 1).padStart(2, '0');
    const receiptNo = `INV-${yymmdd}-${seq}`;

    const summaryDesc = cart
      .map((i) => `${i.quantity}x ${i.product.name}`)
      .join(', ');

    const newEntry: CashflowEntry = {
      id: `trx-${Date.now()}`,
      receiptNo,
      timestamp: now.toISOString(),
      type: 'income',
      source: 'pos',
      category: 'Penjualan POS',
      description: summaryDesc,
      customerName: payload.customerName || undefined,
      paymentMethod: payload.paymentMethod,
      amount: grandTotal,
      subtotal,
      discount: payload.discount,
      tax,
      cashPaid: payload.cashPaid,
      changeAmount,
      totalCost,
      items: cart.map((i) => ({
        productId: i.product.id,
        sku: i.product.sku,
        name: i.product.name,
        quantity: i.quantity,
        unitPrice: i.product.sellPrice,
        costPrice: i.product.costPrice,
        totalPrice: i.product.sellPrice * i.quantity,
      })),
    };

    // Deduct stock
    setProducts((prev) =>
      prev.map((prod) => {
        const ordered = cart.find((i) => i.product.id === prod.id);
        if (!ordered) return prod;
        return { ...prod, stock: Math.max(0, prod.stock - ordered.quantity) };
      })
    );

    setCashflow((prev) => [newEntry, ...prev]);
    setCart([]);
    setMobileCartOpen(false);
    setReceiptEntry(newEntry);
  };

  // Manual Cashflow Entry
  const handleSaveManualEntry = (
    entry: Omit<CashflowEntry, 'id' | 'timestamp' | 'source'>
  ) => {
    const created: CashflowEntry = {
      ...entry,
      id: `man-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'manual',
    };
    setCashflow((prev) => [created, ...prev]);
  };

  const handleDeleteCashflow = (id: string) => {
    setCashflow((prev) => prev.filter((e) => e.id !== id));
  };

  // Product Management
  const handleSaveProduct = (data: Omit<Product, 'id'>, existingId?: string) => {
    if (existingId) {
      setProducts((prev) =>
        prev.map((p) => (p.id === existingId ? { ...data, id: existingId } : p))
      );
      setCart((prev) =>
        prev.map((c) =>
          c.product.id === existingId
            ? { ...c, product: { ...data, id: existingId } }
            : c
        )
      );
    } else {
      const created: Product = { ...data, id: `prod-${Date.now()}` };
      setProducts((prev) => [created, ...prev]);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const handleAdjustStock = (productId: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p
      )
    );
  };

  const handleResetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCashflow(createInitialCashflow());
    setSettings(INITIAL_SETTINGS);
    setShift(INITIAL_SHIFT);
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.sellPrice * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#F5F7F6] text-[#111C1A] flex flex-col lg:flex-row">
      {/* Desktop Left Navigation Rail */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-[#E6EBE9] sticky top-0 h-screen justify-between p-5">
        <div className="space-y-8">
          {/* Brand Wordmark */}
          <div className="px-2 pt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#14534B] text-white flex items-center justify-center font-extrabold text-sm">
                KK
              </div>
              <span className="text-lg font-extrabold tracking-tight text-[#111C1A] whitespace-nowrap">
                KasirKita
              </span>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1.5" aria-label="Navigasi Utama">
            {NAV_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-[#14534B] text-white shadow-xs'
                      : 'text-[#52605D] hover:bg-[#F2F6F5] hover:text-[#111C1A]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Shift & Settings Quick Controls */}
        <div className="space-y-2 pt-4 border-t border-[#EEF2F0]">
          <button
            type="button"
            onClick={() => setShiftModalOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-[#52605D] hover:bg-[#F2F6F5] hover:text-[#111C1A] transition-colors"
          >
            <Clock className="w-4 h-4 text-[#14534B] shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-[#111C1A] truncate">{shift.shiftName}</p>
              <p className="text-[11px] text-[#647471] tabular-nums">
                Modal: {formatIDR(shift.openingCash)}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-semibold text-[#52605D] hover:bg-[#F2F6F5] hover:text-[#111C1A] transition-colors"
          >
            <Settings className="w-4 h-4 text-[#14534B] shrink-0" />
            <span className="truncate">Pengaturan Toko</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`flex-1 min-w-0 lg:p-6 ${
          cartCount > 0 && activeTab === 'pos' ? 'pb-36 lg:pb-6' : 'pb-24 lg:pb-6'
        }`}
      >
        <div className="max-w-[1280px] mx-auto">
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 xl:col-span-8 min-w-0">
                <PosCatalogView
                  products={products}
                  cart={cart}
                  cashflow={cashflow}
                  settings={settings}
                  shift={shift}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onAddToCart={handleAddToCart}
                  onUpdateCartQty={handleUpdateCartQty}
                  onOpenExpenseModal={() => {
                    setEntryModalType('expense');
                    setEntryModalOpen(true);
                  }}
                  onOpenShiftModal={() => setShiftModalOpen(true)}
                  onOpenSettingsModal={() => setSettingsModalOpen(true)}
                  onOpenAddProductModal={() => {
                    setEditingProduct(null);
                    setProductModalOpen(true);
                  }}
                  onNavigateTab={setActiveTab}
                />
              </div>

              {/* Desktop Sticky Cart Column */}
              <div className="hidden lg:block lg:col-span-5 xl:col-span-4 sticky top-6">
                <CartSidebar
                  cart={cart}
                  taxPercent={settings.taxPercent}
                  onUpdateQty={handleUpdateCartQty}
                  onRemoveItem={handleRemoveCartItem}
                  onClearCart={() => setCart([])}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          )}

          {activeTab === 'cashflow' && (
            <CashflowView
              entries={cashflow}
              shift={shift}
              settings={settings}
              onOpenEntryModal={(type) => {
                setEntryModalType(type);
                setEntryModalOpen(true);
              }}
              onViewReceipt={(entry) => setReceiptEntry(entry)}
              onDeleteEntry={handleDeleteCashflow}
            />
          )}

          {activeTab === 'reports' && <ReportsView entries={cashflow} />}

          {activeTab === 'inventory' && (
            <InventoryView
              products={products}
              onAddProduct={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onEditProduct={(prod) => {
                setEditingProduct(prod);
                setProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onAdjustStock={handleAdjustStock}
            />
          )}
        </div>
      </main>

      {/* Mobile Floating Cart Trigger Bar (only when items in cart on POS tab) */}
      {activeTab === 'pos' && cartCount > 0 && !mobileCartOpen && (
        <div className="lg:hidden fixed bottom-20 left-4 right-4 z-30">
          <button
            type="button"
            onClick={() => setMobileCartOpen(true)}
            className="w-full h-12 px-4 rounded-2xl bg-[#111C1A] text-white shadow-lg flex items-center justify-between text-xs font-bold"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#86EFAC]" />
              <span className="tabular-nums">{cartCount} item di keranjang</span>
            </span>
            <span className="font-mono text-sm tabular-nums text-[#86EFAC]">
              Bayar {formatIDR(cartTotal)} →
            </span>
          </button>
        </div>
      )}

      {/* Mobile Slide-Up Cart Sheet */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end">
          <div className="w-full max-h-[88vh] rounded-t-3xl overflow-hidden bg-white">
            <CartSidebar
              cart={cart}
              taxPercent={settings.taxPercent}
              onUpdateQty={handleUpdateCartQty}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={() => setCart([])}
              onCheckout={handleCheckout}
              isMobileSheet
              onCloseMobileSheet={() => setMobileCartOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom Navigation Bar (Modeled Directly on Reference Image) */}
      <nav
        aria-label="Navigasi Bawah"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6EBE9] px-3 py-2"
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-1">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-center gap-2 min-h-[44px] transition-all whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#14534B] text-white rounded-full px-4 py-2 font-bold text-xs shadow-xs'
                    : 'text-[#52605D] hover:text-[#111C1A] px-3 py-2 rounded-full'
                }`}
              >
                {item.icon}
                {active && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Modals */}
      <ReceiptModal
        entry={receiptEntry}
        settings={settings}
        onClose={() => setReceiptEntry(null)}
      />

      <TransactionEntryModal
        open={entryModalOpen}
        defaultType={entryModalType}
        onClose={() => setEntryModalOpen(false)}
        onSave={handleSaveManualEntry}
      />

      <ProductFormModal
        open={productModalOpen}
        editingProduct={editingProduct}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      <ShiftModal
        open={shiftModalOpen}
        shift={shift}
        entries={cashflow}
        onClose={() => setShiftModalOpen(false)}
        onUpdateShift={setShift}
      />

      <StoreSettingsModal
        open={settingsModalOpen}
        settings={settings}
        onClose={() => setSettingsModalOpen(false)}
        onSaveSettings={setSettings}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
