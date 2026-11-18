import React, { useMemo, useState } from 'react';
import { Plus, Minus, Search, Pencil, Trash2, X, AlertTriangle } from 'lucide-react';
import { Product, ProductCategory } from '../types/finance';
import { formatIDR } from '../data/seedData';
import { ProductIconBox } from './ProductIconBox';

interface InventoryViewProps {
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAdjustStock: (productId: string, delta: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'Semua' | ProductCategory>('Semua');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const totalSku = products.length;
    const lowStockCount = products.filter((p) => p.stock <= 5).length;
    const stockModalValue = products.reduce((s, p) => s + p.costPrice * p.stock, 0);
    const potentialRevenue = products.reduce((s, p) => s + p.sellPrice * p.stock, 0);
    return { totalSku, lowStockCount, stockModalValue, potentialRevenue };
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== 'Semua' && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, search, category]);

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <section className="bg-[#14534B] text-white rounded-b-[28px] lg:rounded-3xl px-4 py-5 sm:px-6 sm:py-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs text-white/75 font-medium">
              Inventaris Produk & Harga Modal
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums mt-1">
              {stats.totalSku} Produk Aktif
            </h1>
            <p className="text-xs text-white/80 mt-1 tabular-nums">
              Nilai stok modal {formatIDR(stats.stockModalValue)} · Potensi jual{' '}
              {formatIDR(stats.potentialRevenue)}
            </p>
          </div>

          <button
            type="button"
            onClick={onAddProduct}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-[#14534B] text-xs sm:text-sm font-bold hover:bg-[#F2F6F5] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>

        {stats.lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/40 text-xs text-[#FEF3C7]">
            <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0" />
            <span>
              Terdapat <strong>{stats.lowStockCount} produk</strong> dengan stok menipis
              (5 unit atau kurang). Segera lakukan restock.
            </span>
          </div>
        )}
      </section>

      {/* Search & Category Tabs */}
      <section className="px-4 lg:px-0 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#647471] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama produk atau SKU..."
              className="w-full h-11 pl-10 pr-9 rounded-2xl bg-white border border-[#E6EBE9] text-sm text-[#111C1A] placeholder:text-[#899794] focus:outline-none focus:border-[#14534B]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#647471] hover:bg-[#F2F6F5]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['Semua', 'Minuman', 'Makanan', 'Retail', 'Jasa'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  category === cat
                    ? 'bg-[#14534B] text-white'
                    : 'bg-white text-[#52605D] border border-[#E6EBE9] hover:text-[#111C1A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Table / List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E6EBE9] p-10 text-center">
            <p className="text-sm font-bold text-[#111C1A]">
              Tidak ada produk yang cocok
            </p>
            <p className="text-xs text-[#647471] mt-1 mb-4">
              Tambahkan produk baru atau ubah kata kunci pencarian Anda.
            </p>
            <button
              type="button"
              onClick={onAddProduct}
              className="px-4 py-2 rounded-xl bg-[#14534B] text-white text-xs font-semibold"
            >
              Tambah Produk Baru
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E6EBE9] overflow-hidden shadow-[0_2px_10px_rgba(17,28,26,0.02)]">
            <div className="divide-y divide-[#F0F3F2]">
              {filtered.map((product) => {
                const marginPct =
                  product.sellPrice > 0
                    ? Math.round(
                        ((product.sellPrice - product.costPrice) / product.sellPrice) * 100
                      )
                    : 0;
                const lowStock = product.stock <= 5;
                const isConfirming = confirmDeleteId === product.id;

                return (
                  <div
                    key={product.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3.5 hover:bg-[#FAFBFB] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ProductIconBox icon={product.icon} category={product.category} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111C1A] truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#647471] mt-0.5 tabular-nums">
                          <span className="font-mono">{product.sku}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{product.category}</span>
                          <span aria-hidden="true"> · </span>
                          <span>Modal {formatIDR(product.costPrice)}</span>
                          <span aria-hidden="true"> · </span>
                          <span className="text-[#15803D] font-semibold">
                            Margin {marginPct}%
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 pl-14 md:pl-0 shrink-0">
                      <div className="text-left md:text-right">
                        <p className="font-mono text-sm font-bold text-[#14534B] tabular-nums">
                          {formatIDR(product.sellPrice)}
                        </p>
                        <p
                          className={`text-[11px] font-semibold tabular-nums ${
                            lowStock ? 'text-[#B45309]' : 'text-[#647471]'
                          }`}
                        >
                          {lowStock ? 'Stok menipis' : `Satuan ${product.unit}`}
                        </p>
                      </div>

                      {/* Inline Stock Stepper */}
                      <div className="flex items-center gap-1.5 bg-[#F5F7F6] p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => onAdjustStock(product.id, -1)}
                          aria-label={`Kurangi stok ${product.name}`}
                          className="w-7 h-7 rounded-lg bg-white text-[#14534B] hover:bg-[#E1ECE8] flex items-center justify-center shadow-xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span
                          className={`w-10 text-center font-mono text-xs font-bold tabular-nums ${
                            lowStock ? 'text-[#B45309]' : 'text-[#111C1A]'
                          }`}
                        >
                          {product.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAdjustStock(product.id, 1)}
                          aria-label={`Tambah stok ${product.name}`}
                          className="w-7 h-7 rounded-lg bg-white text-[#14534B] hover:bg-[#E1ECE8] flex items-center justify-center shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Edit & Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onEditProduct(product)}
                          aria-label={`Edit ${product.name}`}
                          className="w-8 h-8 rounded-lg text-[#52605D] hover:text-[#14534B] hover:bg-[#EAF3F0] flex items-center justify-center transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {isConfirming ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteProduct(product.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2 py-1 rounded-lg bg-[#DC2626] text-white text-xs font-semibold"
                            >
                              Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-lg bg-[#F2F6F5] text-[#52605D] text-xs font-semibold"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(product.id)}
                            aria-label={`Hapus ${product.name}`}
                            className="w-8 h-8 rounded-lg text-[#899794] hover:text-[#DC2626] hover:bg-[#FEF2F2] flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
