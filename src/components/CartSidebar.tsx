import React, { useMemo, useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Banknote,
  QrCode,
  Building2,
  CreditCard,
  CheckCircle2,
  X,
} from 'lucide-react';
import { CartItem, PaymentMethod } from '../types/finance';
import { formatIDR } from '../data/seedData';

interface CartSidebarProps {
  cart: CartItem[];
  taxPercent: number;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onCheckout: (payload: {
    customerName: string;
    discount: number;
    applyTax: boolean;
    paymentMethod: PaymentMethod;
    cashPaid: number;
  }) => void;
  isMobileSheet?: boolean;
  onCloseMobileSheet?: () => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: 'Tunai', label: 'Tunai', icon: <Banknote className="w-4 h-4" /> },
  { id: 'QRIS', label: 'QRIS', icon: <QrCode className="w-4 h-4" /> },
  { id: 'Transfer', label: 'Transfer', icon: <Building2 className="w-4 h-4" /> },
  { id: 'Kartu', label: 'Kartu', icon: <CreditCard className="w-4 h-4" /> },
];

export const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  taxPercent,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isMobileSheet = false,
  onCloseMobileSheet,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [applyTax, setApplyTax] = useState(taxPercent > 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [cashInput, setCashInput] = useState('');

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0),
    [cart]
  );

  const parsedDiscount = Math.max(0, Math.min(subtotal, Number(discountInput) || 0));
  const afterDiscount = Math.max(0, subtotal - parsedDiscount);
  const taxAmount = applyTax && taxPercent > 0 ? Math.round((afterDiscount * taxPercent) / 100) : 0;
  const grandTotal = afterDiscount + taxAmount;

  const cashPaidNum = paymentMethod === 'Tunai' ? Number(cashInput) || 0 : grandTotal;
  const changeAmount = paymentMethod === 'Tunai' ? cashPaidNum - grandTotal : 0;
  const canCheckout =
    cart.length > 0 && (paymentMethod !== 'Tunai' || cashPaidNum >= grandTotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCheckout) return;
    onCheckout({
      customerName: customerName.trim(),
      discount: parsedDiscount,
      applyTax,
      paymentMethod,
      cashPaid: cashPaidNum,
    });
    setCustomerName('');
    setDiscountInput('');
    setCashInput('');
  };

  const quickCashOptions = useMemo(() => {
    if (grandTotal <= 0) return [];
    const presets = [grandTotal, 50000, 100000, 200000];
    return Array.from(new Set(presets.filter((v) => v >= grandTotal))).slice(0, 4);
  }, [grandTotal]);

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-[#E6EBE9] shadow-[0_4px_20px_rgba(17,28,26,0.04)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF2F0]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EAF3F0] text-[#14534B] flex items-center justify-center">
            <ShoppingBag className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#111C1A]">Keranjang Kasir</h2>
            <p className="text-xs text-[#647471] tabular-nums">
              {cart.reduce((s, i) => s + i.quantity, 0)} item dipilih
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {cart.length > 0 && (
            <button
              type="button"
              onClick={onClearCart}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
            >
              Kosongkan
            </button>
          )}
          {isMobileSheet && onCloseMobileSheet && (
            <button
              type="button"
              onClick={onCloseMobileSheet}
              aria-label="Tutup keranjang"
              className="w-9 h-9 rounded-xl bg-[#F2F6F5] text-[#111C1A] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5 max-h-[340px] lg:max-h-none">
        {cart.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#F2F6F5] text-[#647471] flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-[#111C1A]">
              Keranjang masih kosong
            </p>
            <p className="text-xs text-[#647471] mt-1 max-w-[220px] mx-auto">
              Pilih produk di katalog sebelah kiri untuk memulai transaksi baru.
            </p>
          </div>
        ) : (
          cart.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex items-center justify-between gap-3 py-2.5 border-b border-[#F2F5F4] last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#111C1A] truncate">
                  {product.name}
                </p>
                <p className="text-[11px] font-mono text-[#647471] tabular-nums mt-0.5">
                  {formatIDR(product.sellPrice)} × {quantity}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onUpdateQty(product.id, -1)}
                  aria-label={`Kurangi ${product.name}`}
                  className="w-7 h-7 rounded-lg bg-[#F2F6F5] text-[#14534B] hover:bg-[#E1ECE8] flex items-center justify-center"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center font-mono text-xs font-bold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stock}
                  onClick={() => onUpdateQty(product.id, 1)}
                  aria-label={`Tambah ${product.name}`}
                  className="w-7 h-7 rounded-lg bg-[#F2F6F5] text-[#14534B] hover:bg-[#E1ECE8] disabled:opacity-40 flex items-center justify-center"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveItem(product.id)}
                  aria-label={`Hapus ${product.name}`}
                  className="w-7 h-7 rounded-lg text-[#899794] hover:text-[#DC2626] hover:bg-[#FEF2F2] flex items-center justify-center ml-0.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Checkout Form */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-[#EEF2F0] bg-[#FAFBFB] px-5 py-4 space-y-3.5"
      >
        {/* Customer & Discount */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-[#52605D] mb-1">
              Nama Pelanggan
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Umum / Walk-in"
              className="w-full h-9 px-3 rounded-xl bg-white border border-[#DCE4E1] text-xs text-[#111C1A] placeholder:text-[#899794] focus:outline-none focus:border-[#14534B]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-[#52605D] mb-1">
              Diskon (Rp)
            </label>
            <input
              type="number"
              min={0}
              max={subtotal}
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="0"
              className="w-full h-9 px-3 rounded-xl bg-white border border-[#DCE4E1] text-xs font-mono tabular-nums text-[#111C1A] placeholder:text-[#899794] focus:outline-none focus:border-[#14534B]"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <span className="block text-[11px] font-semibold text-[#52605D] mb-1.5">
            Metode Pembayaran
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {PAYMENT_METHODS.map((pm) => {
              const active = paymentMethod === pm.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id)}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[11px] font-semibold border transition-colors ${
                    active
                      ? 'bg-[#14534B] text-white border-[#14534B]'
                      : 'bg-white text-[#52605D] border-[#DCE4E1] hover:border-[#14534B]/40'
                  }`}
                >
                  {pm.icon}
                  <span>{pm.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cash Received & Change Calculator */}
        {paymentMethod === 'Tunai' && cart.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-[#52605D]">
                Uang Diterima (Tunai)
              </label>
              {cashInput !== '' && (
                <span
                  className={`text-[11px] font-mono font-bold tabular-nums ${
                    changeAmount >= 0 ? 'text-[#14534B]' : 'text-[#DC2626]'
                  }`}
                >
                  {changeAmount >= 0
                    ? `Kembalian: ${formatIDR(changeAmount)}`
                    : `Kurang: ${formatIDR(Math.abs(changeAmount))}`}
                </span>
              )}
            </div>
            <input
              type="number"
              min={0}
              value={cashInput}
              onChange={(e) => setCashInput(e.target.value)}
              placeholder={`Minimal ${formatIDR(grandTotal)}`}
              className="w-full h-10 px-3 rounded-xl bg-white border border-[#DCE4E1] text-sm font-mono font-semibold tabular-nums text-[#111C1A] focus:outline-none focus:border-[#14534B]"
            />
            <div className="flex flex-wrap gap-1.5">
              {quickCashOptions.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setCashInput(String(amt))}
                  className="px-2.5 py-1 rounded-lg bg-[#EAF3F0] hover:bg-[#D5E7E1] text-[#14534B] text-[11px] font-mono font-semibold tabular-nums transition-colors"
                >
                  {amt === grandTotal ? 'Uang Pas' : formatIDR(amt)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Totals Summary */}
        <div className="space-y-1.5 pt-2 border-t border-[#E6EBE9] text-xs">
          <div className="flex justify-between text-[#647471]">
            <span>Subtotal</span>
            <span className="font-mono tabular-nums">{formatIDR(subtotal)}</span>
          </div>
          {parsedDiscount > 0 && (
            <div className="flex justify-between text-[#16A34A]">
              <span>Diskon</span>
              <span className="font-mono tabular-nums">-{formatIDR(parsedDiscount)}</span>
            </div>
          )}
          {taxPercent > 0 && (
            <div className="flex items-center justify-between text-[#647471]">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyTax}
                  onChange={(e) => setApplyTax(e.target.checked)}
                  className="accent-[#14534B] rounded"
                />
                <span>Pajak PPN ({taxPercent}%)</span>
              </label>
              <span className="font-mono tabular-nums">{formatIDR(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-1.5 text-sm font-extrabold text-[#111C1A]">
            <span>Total Tagihan</span>
            <span className="font-mono text-base text-[#14534B] tabular-nums">
              {formatIDR(grandTotal)}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canCheckout}
          className="w-full h-12 rounded-2xl bg-[#14534B] hover:bg-[#10423B] disabled:bg-[#B8C7C3] disabled:cursor-not-allowed text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <CheckCircle2 className="w-4.5 h-4.5" />
          Bayar & Cetak Struk
        </button>
      </form>
    </div>
  );
};
