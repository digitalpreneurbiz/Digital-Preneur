import React, { useEffect, useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  RotateCcw,
  Wallet,
  Store,
} from 'lucide-react';
import {
  CashflowEntry,
  CashflowType,
  PaymentMethod,
  Product,
  ProductCategory,
  ProductIconKey,
  ShiftState,
  StoreSettings,
} from '../types/finance';
import { formatDateTime, formatIDR } from '../data/seedData';

/* -------------------------------------------------------------------------- */
/* 1. Receipt Modal                                                           */
/* -------------------------------------------------------------------------- */
interface ReceiptModalProps {
  entry: CashflowEntry | null;
  settings: StoreSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  entry,
  settings,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!entry) return null;

  const handleCopy = async () => {
    const lines = [
      settings.storeName.toUpperCase(),
      settings.address,
      `Telp: ${settings.phone}`,
      '--------------------------------',
      `No: ${entry.receiptNo || entry.id}`,
      `Waktu: ${formatDateTime(entry.timestamp)}`,
      `Kasir: ${settings.cashierName}`,
      entry.customerName ? `Pelanggan: ${entry.customerName}` : '',
      '--------------------------------',
      ...(entry.items || []).map(
        (it) => `${it.name} (${it.quantity}x ${formatIDR(it.unitPrice)}) = ${formatIDR(it.totalPrice)}`
      ),
      '--------------------------------',
      `Subtotal: ${formatIDR(entry.subtotal ?? entry.amount)}`,
      entry.discount ? `Diskon: -${formatIDR(entry.discount)}` : '',
      entry.tax ? `Pajak: ${formatIDR(entry.tax)}` : '',
      `TOTAL: ${formatIDR(entry.amount)}`,
      `Bayar (${entry.paymentMethod}): ${formatIDR(entry.cashPaid ?? entry.amount)}`,
      entry.paymentMethod === 'Tunai' && entry.changeAmount !== undefined
        ? `Kembalian: ${formatIDR(entry.changeAmount)}`
        : '',
      '--------------------------------',
      settings.receiptFooter,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border border-[#E6EBE9]">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EEF2F0]">
          <h3 className="text-sm font-bold text-[#111C1A]">Struk Transaksi</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup struk"
            className="w-8 h-8 rounded-lg text-[#647471] hover:bg-[#F2F6F5] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div id="printable-receipt" className="p-5 bg-white text-[#111C1A] text-xs space-y-3">
          <div className="text-center space-y-0.5">
            <p className="text-base font-extrabold tracking-tight">{settings.storeName}</p>
            <p className="text-[11px] text-[#647471]">{settings.branchName}</p>
            <p className="text-[11px] text-[#647471]">{settings.address}</p>
            <p className="text-[11px] text-[#647471]">Telp: {settings.phone}</p>
          </div>

          <div className="border-t border-dashed border-[#CBD5E1] pt-2.5 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#647471]">No. Struk</span>
              <span className="font-mono font-semibold">{entry.receiptNo || entry.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#647471]">Tanggal</span>
              <span className="tabular-nums">{formatDateTime(entry.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#647471]">Kasir</span>
              <span>{settings.cashierName}</span>
            </div>
            {entry.customerName && (
              <div className="flex justify-between">
                <span className="text-[#647471]">Pelanggan</span>
                <span className="font-semibold">{entry.customerName}</span>
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-[#CBD5E1] pt-2.5 space-y-2">
            {(entry.items || []).map((item) => (
              <div key={item.productId} className="flex justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[#111C1A]">{item.name}</p>
                  <p className="text-[11px] font-mono text-[#647471] tabular-nums">
                    {item.quantity} × {formatIDR(item.unitPrice)}
                  </p>
                </div>
                <span className="font-mono font-semibold tabular-nums shrink-0">
                  {formatIDR(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-[#CBD5E1] pt-2.5 space-y-1">
            <div className="flex justify-between text-[#647471]">
              <span>Subtotal</span>
              <span className="font-mono tabular-nums">
                {formatIDR(entry.subtotal ?? entry.amount)}
              </span>
            </div>
            {Boolean(entry.discount) && (
              <div className="flex justify-between text-[#15803D]">
                <span>Diskon</span>
                <span className="font-mono tabular-nums">
                  -{formatIDR(entry.discount || 0)}
                </span>
              </div>
            )}
            {Boolean(entry.tax) && (
              <div className="flex justify-between text-[#647471]">
                <span>Pajak</span>
                <span className="font-mono tabular-nums">
                  {formatIDR(entry.tax || 0)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-[#EEF2F0]">
              <span>Total</span>
              <span className="font-mono text-[#14534B] tabular-nums">
                {formatIDR(entry.amount)}
              </span>
            </div>
            <div className="flex justify-between text-[#52605D]">
              <span>Bayar ({entry.paymentMethod})</span>
              <span className="font-mono tabular-nums">
                {formatIDR(entry.cashPaid ?? entry.amount)}
              </span>
            </div>
            {entry.paymentMethod === 'Tunai' && entry.changeAmount !== undefined && (
              <div className="flex justify-between font-bold text-[#111C1A]">
                <span>Kembalian</span>
                <span className="font-mono tabular-nums">
                  {formatIDR(entry.changeAmount)}
                </span>
              </div>
            )}
          </div>

          <p className="border-t border-dashed border-[#CBD5E1] pt-3 text-center text-[11px] text-[#647471] leading-relaxed">
            {settings.receiptFooter}
          </p>
        </div>

        <div className="flex items-center gap-2 px-5 py-4 bg-[#FAFBFB] border-t border-[#EEF2F0]">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 h-10 rounded-xl bg-white border border-[#DCE4E1] text-xs font-bold text-[#111C1A] hover:bg-[#F2F6F5] flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-4 h-4 text-[#15803D]" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Tersalin' : 'Salin Teks'}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex-1 h-10 rounded-xl bg-[#14534B] text-white text-xs font-bold hover:bg-[#10423B] flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. Manual Cashflow Entry Modal (Pemasukan / Pengeluaran)                   */
/* -------------------------------------------------------------------------- */
interface TransactionEntryModalProps {
  open: boolean;
  defaultType: CashflowType;
  onClose: () => void;
  onSave: (entry: Omit<CashflowEntry, 'id' | 'timestamp' | 'source'>) => void;
}

const EXPENSE_CATEGORIES = [
  'Bahan Baku',
  'Operasional',
  'Kemasan & Perlengkapan',
  'Gaji & Honor',
  'Sewa & Utilitas',
  'Lainnya',
];

const INCOME_CATEGORIES = [
  'Modal Tambahan',
  'Pelunasan Piutang',
  'Pendapatan Lain',
  'Investasi / Top-up Laci',
];

export const TransactionEntryModal: React.FC<TransactionEntryModalProps> = ({
  open,
  defaultType,
  onClose,
  onSave,
}) => {
  const [type, setType] = useState<CashflowType>(defaultType);
  const [category, setCategory] = useState(
    defaultType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]
  );
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    setType(defaultType);
    setCategory(defaultType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }, [defaultType, open]);

  if (!open) return null;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!description.trim() || !numAmount || numAmount <= 0) return;

    onSave({
      type,
      category,
      description: description.trim(),
      paymentMethod,
      amount: numAmount,
    });
    setDescription('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E6EBE9] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF2F0]">
          <h3 className="text-base font-bold text-[#111C1A]">Catat Arus Kas Manual</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form"
            className="w-8 h-8 rounded-lg text-[#647471] hover:bg-[#F2F6F5] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F2F6F5]">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                setCategory(EXPENSE_CATEGORIES[0]);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                type === 'expense'
                  ? 'bg-[#DC2626] text-white'
                  : 'text-[#52605D] hover:text-[#111C1A]'
              }`}
            >
              Pengeluaran (-)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                setCategory(INCOME_CATEGORIES[0]);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-colors ${
                type === 'income'
                  ? 'bg-[#14534B] text-white'
                  : 'text-[#52605D] hover:text-[#111C1A]'
              }`}
            >
              Pemasukan (+)
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#52605D] mb-1">
              Nominal (Rp)
            </label>
            <input
              type="number"
              required
              min={100}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Contoh: 150000"
              className="w-full h-11 px-3.5 rounded-xl border border-[#DCE4E1] font-mono text-base font-bold tabular-nums focus:outline-none focus:border-[#14534B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] text-xs font-semibold bg-white focus:outline-none focus:border-[#14534B]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Akun / Metode
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] text-xs font-semibold bg-white focus:outline-none focus:border-[#14534B]"
              >
                <option value="Tunai">Kas Tunai (Laci)</option>
                <option value="Transfer">Rekening Bank</option>
                <option value="QRIS">Saldo QRIS</option>
                <option value="Kartu">Kartu Debit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#52605D] mb-1">
              Keterangan Transaksi
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                type === 'expense'
                  ? 'Contoh: Beli susu segar & gula aren'
                  : 'Contoh: Tambahan modal kas laci pagi'
              }
              className="w-full h-10 px-3.5 rounded-xl border border-[#DCE4E1] text-sm focus:outline-none focus:border-[#14534B]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-[#F2F6F5] text-xs font-bold text-[#52605D] hover:bg-[#E5ECE9]"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`flex-1 h-11 rounded-xl text-xs font-bold text-white transition-colors ${
                type === 'expense'
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                  : 'bg-[#14534B] hover:bg-[#10423B]'
              }`}
            >
              Simpan Catatan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. Add / Edit Product Modal                                                */
/* -------------------------------------------------------------------------- */
interface ProductFormModalProps {
  open: boolean;
  editingProduct: Product | null;
  onClose: () => void;
  onSave: (productData: Omit<Product, 'id'>, existingId?: string) => void;
}

const ICON_OPTIONS: { id: ProductIconKey; label: string }[] = [
  { id: 'coffee', label: 'Kopi' },
  { id: 'cup', label: 'Minuman Dingin' },
  { id: 'croissant', label: 'Roti / Snack' },
  { id: 'utensils', label: 'Makanan Berat' },
  { id: 'package', label: 'Produk Kemasan' },
  { id: 'bag', label: 'Merchandise' },
  { id: 'sparkles', label: 'Layanan / Sewa' },
  { id: 'wrench', label: 'Jasa Teknis' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  editingProduct,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Minuman');
  const [icon, setIcon] = useState<ProductIconKey>('coffee');
  const [costPrice, setCostPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [stock, setStock] = useState('20');
  const [unit, setUnit] = useState('pcs');

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setSku(editingProduct.sku);
      setCategory(editingProduct.category);
      setIcon(editingProduct.icon);
      setCostPrice(String(editingProduct.costPrice));
      setSellPrice(String(editingProduct.sellPrice));
      setStock(String(editingProduct.stock));
      setUnit(editingProduct.unit);
    } else {
      setName('');
      setSku(`PRD-${Math.floor(100 + Math.random() * 900)}`);
      setCategory('Minuman');
      setIcon('coffee');
      setCostPrice('');
      setSellPrice('');
      setStock('20');
      setUnit('pcs');
    }
  }, [editingProduct, open]);

  if (!open) return null;

  const costNum = Number(costPrice) || 0;
  const sellNum = Number(sellPrice) || 0;
  const marginPct = sellNum > 0 ? Math.round(((sellNum - costNum) / sellNum) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || sellNum <= 0) return;
    onSave(
      {
        name: name.trim(),
        sku: sku.trim() || 'SKU-BARU',
        category,
        icon,
        costPrice: Math.max(0, costNum),
        sellPrice: sellNum,
        stock: Math.max(0, Number(stock) || 0),
        unit: unit.trim() || 'pcs',
      },
      editingProduct?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E6EBE9] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF2F0]">
          <h3 className="text-base font-bold text-[#111C1A]">
            {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form produk"
            className="w-8 h-8 rounded-lg text-[#647471] hover:bg-[#F2F6F5] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#52605D] mb-1">
              Nama Produk / Layanan
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Es Kopi Pandan"
              className="w-full h-10 px-3.5 rounded-xl border border-[#DCE4E1] text-sm focus:outline-none focus:border-[#14534B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Kode SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] font-mono text-xs focus:outline-none focus:border-[#14534B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] text-xs font-semibold bg-white focus:outline-none focus:border-[#14534B]"
              >
                <option value="Minuman">Minuman</option>
                <option value="Makanan">Makanan</option>
                <option value="Retail">Retail</option>
                <option value="Jasa">Jasa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Harga Modal / HPP (Rp)
              </label>
              <input
                type="number"
                min={0}
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="10000"
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] font-mono text-sm tabular-nums focus:outline-none focus:border-[#14534B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Harga Jual (Rp)
              </label>
              <input
                type="number"
                min={100}
                required
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                placeholder="25000"
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] font-mono text-sm font-bold tabular-nums focus:outline-none focus:border-[#14534B]"
              />
            </div>
          </div>

          {sellNum > 0 && (
            <p className="text-xs text-[#647471] bg-[#F5F7F6] px-3 py-2 rounded-xl tabular-nums">
              Estimasi laba per unit:{' '}
              <strong className="text-[#14534B] font-mono">
                {formatIDR(sellNum - costNum)} ({marginPct}%)
              </strong>
            </p>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Stok Awal
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] font-mono text-sm tabular-nums focus:outline-none focus:border-[#14534B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Satuan
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="cup / pcs"
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] text-xs focus:outline-none focus:border-[#14534B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Ikon
              </label>
              <select
                value={icon}
                onChange={(e) => setIcon(e.target.value as ProductIconKey)}
                className="w-full h-10 px-2.5 rounded-xl border border-[#DCE4E1] text-xs font-semibold bg-white focus:outline-none focus:border-[#14534B]"
              >
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-[#F2F6F5] text-xs font-bold text-[#52605D] hover:bg-[#E5ECE9]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-[#14534B] hover:bg-[#10423B] text-xs font-bold text-white transition-colors"
            >
              {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. Shift & Cash Drawer Modal                                               */
/* -------------------------------------------------------------------------- */
interface ShiftModalProps {
  open: boolean;
  shift: ShiftState;
  entries: CashflowEntry[];
  onClose: () => void;
  onUpdateShift: (next: ShiftState) => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  open,
  shift,
  entries,
  onClose,
  onUpdateShift,
}) => {
  const [shiftName, setShiftName] = useState(shift.shiftName);
  const [openingCash, setOpeningCash] = useState(String(shift.openingCash));

  useEffect(() => {
    setShiftName(shift.shiftName);
    setOpeningCash(String(shift.openingCash));
  }, [shift, open]);

  if (!open) return null;

  const cashIn = entries
    .filter((e) => e.type === 'income' && e.paymentMethod === 'Tunai')
    .reduce((s, e) => s + e.amount, 0);
  const cashOut = entries
    .filter((e) => e.type === 'expense' && e.paymentMethod === 'Tunai')
    .reduce((s, e) => s + e.amount, 0);
  const parsedOpening = Number(openingCash) || 0;
  const expectedDrawer = parsedOpening + cashIn - cashOut;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateShift({
      ...shift,
      shiftName: shiftName.trim() || 'Shift Kasir',
      openingCash: Math.max(0, parsedOpening),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E6EBE9] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF2F0]">
          <div className="flex items-center gap-2">
            <Wallet className="w-4.5 h-4.5 text-[#14534B]" />
            <h3 className="text-base font-bold text-[#111C1A]">Shift & Modal Kas Laci</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup shift"
            className="w-8 h-8 rounded-lg text-[#647471] hover:bg-[#F2F6F5] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="rounded-2xl bg-[#F5F7F6] p-4 space-y-2 text-xs">
            <div className="flex justify-between text-[#52605D]">
              <span>Modal Kas Awal</span>
              <span className="font-mono font-semibold tabular-nums">
                {formatIDR(parsedOpening)}
              </span>
            </div>
            <div className="flex justify-between text-[#15803D]">
              <span>Penjualan / Masuk Tunai</span>
              <span className="font-mono font-semibold tabular-nums">
                +{formatIDR(cashIn)}
              </span>
            </div>
            <div className="flex justify-between text-[#DC2626]">
              <span>Pengeluaran Tunai</span>
              <span className="font-mono font-semibold tabular-nums">
                -{formatIDR(cashOut)}
              </span>
            </div>
            <div className="pt-2 border-t border-[#DCE4E1] flex justify-between text-sm font-extrabold text-[#111C1A]">
              <span>Estimasi Tunai di Laci</span>
              <span className="font-mono text-[#14534B] tabular-nums">
                {formatIDR(expectedDrawer)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#52605D] mb-1">
              Nama Shift Aktif
            </label>
            <input
              type="text"
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#DCE4E1] text-sm focus:outline-none focus:border-[#14534B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#52605D] mb-1">
              Modal Kas Awal Laci (Rp)
            </label>
            <input
              type="number"
              min={0}
              value={openingCash}
              onChange={(e) => setOpeningCash(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl border border-[#DCE4E1] font-mono text-sm font-bold tabular-nums focus:outline-none focus:border-[#14534B]"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-[#F2F6F5] text-xs font-bold text-[#52605D]"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-[#14534B] text-white text-xs font-bold hover:bg-[#10423B]"
            >
              Simpan Shift
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. Store & Cashier Settings Modal                                          */
/* -------------------------------------------------------------------------- */
interface StoreSettingsModalProps {
  open: boolean;
  settings: StoreSettings;
  onClose: () => void;
  onSaveSettings: (next: StoreSettings) => void;
  onResetDemoData: () => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  open,
  settings,
  onClose,
  onSaveSettings,
  onResetDemoData,
}) => {
  const [form, setForm] = useState<StoreSettings>(settings);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setForm(settings);
    setConfirmReset(false);
  }, [settings, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#E6EBE9] overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF2F0]">
          <div className="flex items-center gap-2">
            <Store className="w-4.5 h-4.5 text-[#14534B]" />
            <h3 className="text-base font-bold text-[#111C1A]">Pengaturan Toko & Struk</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup pengaturan"
            className="w-8 h-8 rounded-lg text-[#647471] hover:bg-[#F2F6F5] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Nama Usaha
              </label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] text-xs font-semibold focus:outline-none focus:border-[#14534B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Cabang / Outlet
              </label>
              <input
                type="text"
                value={form.branchName}
                onChange={(e) => setForm({ ...form, branchName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] text-xs focus:outline-none focus:border-[#14534B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Nama Kasir
              </label>
              <input
                type="text"
                value={form.cashierName}
                onChange={(e) => setForm({ ...form, cashierName: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] text-xs focus:outline-none focus:border-[#14534B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Telepon Outlet
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] font-mono text-xs focus:outline-none focus:border-[#14534B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#52605D] mb-1">
              Alamat Struk
            </label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] text-xs focus:outline-none focus:border-[#14534B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Pajak PPN (%)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                value={form.taxPercent}
                onChange={(e) => setForm({ ...form, taxPercent: Number(e.target.value) || 0 })}
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] font-mono text-xs tabular-nums focus:outline-none focus:border-[#14534B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52605D] mb-1">
                Target Omzet Harian (Rp)
              </label>
              <input
                type="number"
                min={100000}
                value={form.dailyTarget}
                onChange={(e) => setForm({ ...form, dailyTarget: Number(e.target.value) || 1000000 })}
                className="w-full h-10 px-3 rounded-xl border border-[#DCE4E1] font-mono text-xs tabular-nums focus:outline-none focus:border-[#14534B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#52605D] mb-1">
              Catatan Kaki Struk
            </label>
            <textarea
              rows={2}
              value={form.receiptFooter}
              onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })}
              className="w-full p-3 rounded-xl border border-[#DCE4E1] text-xs focus:outline-none focus:border-[#14534B]"
            />
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2 border-t border-[#EEF2F0]">
            {confirmReset ? (
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#FEF2F2]">
                <span className="text-xs font-semibold text-[#DC2626]">
                  Kembalikan ke data awal?
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onResetDemoData();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#DC2626] text-white text-xs font-bold"
                  >
                    Ya, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-white text-xs font-semibold text-[#52605D]"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#DC2626] hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Data Simulasi Awal
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-[#F2F6F5] text-xs font-bold text-[#52605D]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-[#14534B] text-white text-xs font-bold hover:bg-[#10423B]"
            >
              Simpan Pengaturan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
