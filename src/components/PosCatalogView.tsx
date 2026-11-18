import React, { useMemo, useState } from 'react';
import {
  MapPin,
  ChevronDown,
  Bell,
  Search,
  X,
  ChevronRight,
  Coffee,
  UtensilsCrossed,
  Package,
  Sparkles,
  Plus,
  Minus,
  AlertTriangle,
  Wallet,
  BarChart3,
} from 'lucide-react';
import {
  CartItem,
  CashflowEntry,
  Product,
  ProductCategory,
  ShiftState,
  StoreSettings,
  TabId,
} from '../types/finance';
import { formatIDR, isSameLocalDay } from '../data/seedData';
import { HeroIllustration } from './HeroIllustration';
import { ProductIconBox } from './ProductIconBox';

interface PosCatalogViewProps {
  products: Product[];
  cart: CartItem[];
  cashflow: CashflowEntry[];
  settings: StoreSettings;
  shift: ShiftState;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: ProductCategory | 'Semua';
  onSelectCategory: (cat: ProductCategory | 'Semua') => void;
  onAddToCart: (product: Product) => void;
  onUpdateCartQty: (productId: string, delta: number) => void;
  onOpenExpenseModal: () => void;
  onOpenShiftModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenAddProductModal: () => void;
  onNavigateTab: (tab: TabId) => void;
}

const CATEGORY_CARDS: {
  id: ProductCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: 'Minuman', label: 'Minuman', icon: <Coffee className="w-6 h-6" strokeWidth={1.75} /> },
  { id: 'Makanan', label: 'Makanan', icon: <UtensilsCrossed className="w-6 h-6" strokeWidth={1.75} /> },
  { id: 'Retail', label: 'Produk Ritel', icon: <Package className="w-6 h-6" strokeWidth={1.75} /> },
  { id: 'Jasa', label: 'Jasa & Sewa', icon: <Sparkles className="w-6 h-6" strokeWidth={1.75} /> },
];

export const PosCatalogView: React.FC<PosCatalogViewProps> = ({
  products,
  cart,
  cashflow,
  settings,
  shift,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  onUpdateCartQty,
  onOpenExpenseModal,
  onOpenShiftModal,
  onOpenSettingsModal,
  onOpenAddProductModal,
  onNavigateTab,
}) => {
  const [alertsOpen, setAlertsOpen] = useState(false);

  const todayStats = useMemo(() => {
    const todayEntries = cashflow.filter((e) => isSameLocalDay(e.timestamp));
    const income = todayEntries
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    const expense = todayEntries
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    const trxCount = todayEntries.filter((e) => e.source === 'pos').length;
    return {
      income,
      expense,
      net: income - expense,
      trxCount,
    };
  }, [cashflow]);

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stock <= 5),
    [products]
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      Minuman: 0,
      Makanan: 0,
      Retail: 0,
      Jasa: 0,
    };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    cart.forEach((item) => map.set(item.product.id, item.quantity));
    return map;
  }, [cart]);

  const initials = settings.cashierName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const targetProgress = Math.min(
    100,
    Math.round((todayStats.income / Math.max(1, settings.dailyTarget)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Signature Deep Forest Teal Hero Block */}
      <section className="relative bg-[#14534B] text-white rounded-b-[28px] lg:rounded-3xl px-4 pt-4 pb-6 sm:px-6 sm:pt-5 sm:pb-7 shadow-sm">
        {/* Header Bar inside Teal Surface */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            type="button"
            onClick={onOpenShiftModal}
            className="flex items-center gap-2.5 text-left min-h-[44px] pr-2 rounded-xl hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <div className="w-9 h-9 rounded-xl bg-white/12 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-white/75 leading-tight">
                {shift.shiftName}
              </p>
              <div className="flex items-center gap-1 text-sm font-semibold text-white truncate">
                <span className="truncate">{settings.storeName}</span>
                <ChevronDown className="w-4 h-4 text-white/80 shrink-0" />
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2.5 shrink-0 relative">
            <button
              type="button"
              onClick={() => setAlertsOpen((v) => !v)}
              aria-label="Notifikasi Stok & Target"
              className="relative w-11 h-11 rounded-xl bg-white/12 hover:bg-white/20 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <Bell className="w-5 h-5 text-white" />
              {lowStockProducts.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F59E0B] text-[#111C1A] text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {lowStockProducts.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenSettingsModal}
              aria-label="Pengaturan Toko & Kasir"
              className="w-11 h-11 rounded-xl bg-white/15 border border-white/30 hover:bg-white/25 flex items-center justify-center text-sm font-bold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              {initials || 'KS'}
            </button>

            {/* Alerts Popover */}
            {alertsOpen && (
              <div className="absolute right-0 top-13 z-40 w-80 bg-white text-[#111C1A] rounded-2xl shadow-xl border border-[#E6EBE9] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold">Peringatan Operasional</h4>
                  <button
                    type="button"
                    onClick={() => setAlertsOpen(false)}
                    className="p-1 rounded-lg text-[#647471] hover:bg-[#F2F6F5]"
                    aria-label="Tutup peringatan"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F5F7F6]">
                    <div className="flex items-center justify-between font-medium text-[#111C1A] mb-1">
                      <span>Target Omzet Hari Ini</span>
                      <span className="font-mono tabular-nums text-[#14534B]">
                        {targetProgress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#DCE4E1] overflow-hidden">
                      <div
                        className="h-full bg-[#14534B] rounded-full transition-all"
                        style={{ width: `${targetProgress}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[#647471] tabular-nums">
                      {formatIDR(todayStats.income)} dari {formatIDR(settings.dailyTarget)}
                    </p>
                  </div>

                  {lowStockProducts.length === 0 ? (
                    <p className="text-[#647471] py-2">Semua stok produk dalam kondisi aman.</p>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="font-semibold text-[#B45309] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Stok Menipis ({lowStockProducts.length} produk)
                      </p>
                      {lowStockProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between py-1 border-b border-[#EEF2F0] last:border-0"
                        >
                          <span className="truncate pr-2">{p.name}</span>
                          <span className="font-mono tabular-nums font-semibold text-[#B45309] shrink-0">
                            Sisa {p.stock} {p.unit}
                          </span>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setAlertsOpen(false);
                          onNavigateTab('inventory');
                        }}
                        className="w-full mt-2 py-2 rounded-lg bg-[#14534B] text-white font-semibold hover:bg-[#10423B] transition-colors"
                      >
                        Kelola Stok Produk
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Crisp White Search Bar */}
        <div className="relative mb-5">
          <Search className="w-4.5 h-4.5 text-[#647471] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari menu, produk, atau kode SKU..."
            className="w-full h-12 pl-11 pr-10 rounded-2xl bg-white text-[#111C1A] placeholder:text-[#647471] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-[#647471] hover:bg-[#F2F6F5]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Hero Banner Spotlight with Bespoke Isometric Illustration */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_195px] items-center gap-4">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-white/80 mb-1">
                Ringkasan Kasir Hari Ini · {todayStats.trxCount} transaksi
              </p>
              <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight leading-tight text-white">
                {formatIDR(todayStats.income)}
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1 tabular-nums">
                Kas bersih {formatIDR(todayStats.net)} · Pengeluaran {formatIDR(todayStats.expense)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={onOpenExpenseModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#14534B] text-xs sm:text-sm font-bold hover:bg-[#F2F6F5] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Wallet className="w-4 h-4" />
                Catat Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('reports')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/12 text-white text-xs sm:text-sm font-semibold hover:bg-white/20 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <BarChart3 className="w-4 h-4" />
                Laba Rugi
              </button>
            </div>
          </div>

          <div className="hidden sm:flex justify-end">
            <HeroIllustration className="w-48 h-40 drop-shadow-sm" />
          </div>
        </div>
      </section>

      {/* 2x2 Category Quick Grid (Matching Reference Card Anatomy) */}
      <section className="px-4 lg:px-0">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-base sm:text-lg font-bold text-[#111C1A]">
            Kategori Kasir
          </h2>
          <button
            type="button"
            onClick={() => onSelectCategory('Semua')}
            className="inline-flex items-center gap-0.5 text-xs sm:text-sm font-semibold text-[#14534B] hover:underline whitespace-nowrap shrink-0"
          >
            Lihat semua
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {CATEGORY_CARDS.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  onSelectCategory(isActive ? 'Semua' : cat.id)
                }
                className={`group flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl text-left transition-all border ${
                  isActive
                    ? 'bg-[#EAF3F0] border-[#14534B]/40 shadow-sm'
                    : 'bg-white border-[#E6EBE9] hover:border-[#14534B]/30 shadow-[0_2px_10px_rgba(17,28,26,0.03)]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-[#14534B] text-white'
                        : 'bg-[#F2F6F5] text-[#14534B] group-hover:bg-[#E4EFEA]'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#111C1A] truncate">
                      {cat.label}
                    </p>
                    <p className="text-xs text-[#647471] tabular-nums">
                      {categoryCounts[cat.id]} item
                    </p>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive
                      ? 'text-[#14534B] translate-x-0.5'
                      : 'text-[#899794] group-hover:text-[#14534B]'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* Product & Menu Grid ("Produk & Layanan") */}
      <section className="px-4 lg:px-0 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#111C1A]">
              {selectedCategory === 'Semua'
                ? 'Semua Produk & Layanan'
                : `Kategori ${selectedCategory}`}
            </h2>
            <p className="text-xs text-[#647471]">
              Ketuk produk untuk menambahkan langsung ke keranjang kasir
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAddProductModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#DCE4E1] text-xs font-semibold text-[#14534B] hover:bg-[#F2F6F5] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Produk Baru
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
          {(['Semua', 'Minuman', 'Makanan', 'Retail', 'Jasa'] as const).map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#14534B] text-white'
                    : 'bg-white text-[#52605D] border border-[#E6EBE9] hover:text-[#111C1A]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E6EBE9] p-8 text-center">
            <p className="text-sm font-semibold text-[#111C1A]">
              Produk tidak ditemukan
            </p>
            <p className="text-xs text-[#647471] mt-1 mb-4">
              Coba kata kunci lain atau tambahkan produk baru ke katalog kasir.
            </p>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('Semua');
              }}
              className="px-4 py-2 rounded-xl bg-[#14534B] text-white text-xs font-semibold"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const inCartQty = cartQtyMap.get(product.id) || 0;
              const outOfStock = product.stock <= 0;
              const lowStock = product.stock > 0 && product.stock <= 5;
              const maxReached = inCartQty >= product.stock;

              return (
                <div
                  key={product.id}
                  className={`flex flex-col justify-between p-3.5 rounded-2xl bg-white border transition-all ${
                    inCartQty > 0
                      ? 'border-[#14534B] shadow-[0_2px_12px_rgba(20,83,75,0.08)]'
                      : 'border-[#E6EBE9] hover:border-[#14534B]/40 shadow-[0_2px_8px_rgba(17,28,26,0.02)]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <ProductIconBox icon={product.icon} category={product.category} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-bold text-[#111C1A] leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#647471] mt-0.5 tabular-nums truncate">
                        {product.sku} ·{' '}
                        <span
                          className={
                            outOfStock
                              ? 'text-[#DC2626] font-semibold'
                              : lowStock
                                ? 'text-[#B45309] font-semibold'
                                : ''
                          }
                        >
                          {outOfStock
                            ? 'Stok Habis'
                            : `Stok ${product.stock} ${product.unit}`}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#F0F3F2]">
                    <span className="font-mono text-sm font-bold text-[#14534B] tabular-nums">
                      {formatIDR(product.sellPrice)}
                    </span>

                    {inCartQty > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onUpdateCartQty(product.id, -1)}
                          aria-label={`Kurangi ${product.name}`}
                          className="w-8 h-8 rounded-lg bg-[#F2F6F5] text-[#14534B] hover:bg-[#E1ECE8] flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center font-mono text-xs font-bold tabular-nums">
                          {inCartQty}
                        </span>
                        <button
                          type="button"
                          disabled={maxReached}
                          onClick={() => onUpdateCartQty(product.id, 1)}
                          aria-label={`Tambah ${product.name}`}
                          className="w-8 h-8 rounded-lg bg-[#14534B] text-white hover:bg-[#10423B] disabled:opacity-40 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={outOfStock}
                        onClick={() => onAddToCart(product)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F2F6F5] hover:bg-[#14534B] text-[#14534B] hover:text-white disabled:opacity-40 disabled:pointer-events-none text-xs font-bold transition-colors whitespace-nowrap shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
