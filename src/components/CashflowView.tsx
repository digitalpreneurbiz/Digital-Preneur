import React, { useMemo, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Plus,
  Minus,
  Search,
  Receipt,
  Trash2,
  X,
  Wallet,
} from 'lucide-react';
import { CashflowEntry, CashflowType, PaymentMethod, ShiftState, StoreSettings } from '../types/finance';
import { exportCashflowCSV, formatDateTime, formatIDR } from '../data/seedData';

interface CashflowViewProps {
  entries: CashflowEntry[];
  shift: ShiftState;
  settings: StoreSettings;
  onOpenEntryModal: (defaultType: CashflowType) => void;
  onViewReceipt: (entry: CashflowEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const CashflowView: React.FC<CashflowViewProps> = ({
  entries,
  shift,
  settings,
  onOpenEntryModal,
  onViewReceipt,
  onDeleteEntry,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CashflowType>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethod>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let cashIn = 0;
    let cashOut = 0;

    entries.forEach((e) => {
      if (e.type === 'income') {
        totalIncome += e.amount;
        if (e.paymentMethod === 'Tunai') cashIn += e.amount;
      } else {
        totalExpense += e.amount;
        if (e.paymentMethod === 'Tunai') cashOut += e.amount;
      }
    });

    const expectedDrawerCash = shift.openingCash + cashIn - cashOut;

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      expectedDrawerCash,
    };
  }, [entries, shift.openingCash]);

  const filteredEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      if (methodFilter !== 'all' && e.paymentMethod !== methodFilter) return false;
      if (!q) return true;
      return (
        e.description.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        (e.receiptNo || '').toLowerCase().includes(q) ||
        (e.customerName || '').toLowerCase().includes(q)
      );
    });
  }, [entries, search, typeFilter, methodFilter]);

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <section className="bg-[#14534B] text-white rounded-b-[28px] lg:rounded-3xl px-4 py-5 sm:px-6 sm:py-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <p className="text-xs text-white/75 font-medium">
              Buku Kas & Arus Keuangan
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums mt-1">
              {formatIDR(summary.netBalance)}
            </h1>
            <p className="text-xs text-white/80 mt-1">
              Saldo kas bersih dari {entries.length} pencatatan transaksi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenEntryModal('income')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white text-[#14534B] text-xs font-bold hover:bg-[#F2F6F5] transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              Catat Pemasukan
            </button>
            <button
              type="button"
              onClick={() => onOpenEntryModal('expense')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-colors whitespace-nowrap shrink-0"
            >
              <Minus className="w-4 h-4" />
              Catat Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => exportCashflowCSV(filteredEntries, settings.storeName)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              Ekspor CSV
            </button>
          </div>
        </div>

        {/* 3 Compact Financial Figures */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <ArrowDownLeft className="w-3.5 h-3.5 text-[#86EFAC]" />
              <span>Total Pemasukan</span>
            </div>
            <p className="font-mono text-base sm:text-lg font-bold text-white tabular-nums mt-1">
              {formatIDR(summary.totalIncome)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#FCA5A5]" />
              <span>Total Pengeluaran</span>
            </div>
            <p className="font-mono text-base sm:text-lg font-bold text-white tabular-nums mt-1">
              {formatIDR(summary.totalExpense)}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <Wallet className="w-3.5 h-3.5 text-[#FDE68A]" />
              <span>Estimasi Kas Tunai Laci</span>
            </div>
            <p className="font-mono text-base sm:text-lg font-bold text-white tabular-nums mt-1">
              {formatIDR(summary.expectedDrawerCash)}
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Search Bar */}
      <section className="px-4 lg:px-0 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#647471] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. struk, keterangan, atau kategori..."
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

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-[#E6EBE9]">
              {(
                [
                  { id: 'all', label: 'Semua' },
                  { id: 'income', label: 'Pemasukan' },
                  { id: 'expense', label: 'Pengeluaran' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    typeFilter === tab.id
                      ? 'bg-[#14534B] text-white'
                      : 'text-[#52605D] hover:text-[#111C1A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as 'all' | PaymentMethod)}
              aria-label="Filter metode pembayaran"
              className="h-9 px-3 rounded-xl bg-white border border-[#E6EBE9] text-xs font-semibold text-[#111C1A] focus:outline-none focus:border-[#14534B]"
            >
              <option value="all">Semua Metode</option>
              <option value="Tunai">Tunai</option>
              <option value="QRIS">QRIS</option>
              <option value="Transfer">Transfer Bank</option>
              <option value="Kartu">Kartu</option>
            </select>
          </div>
        </div>

        {/* Ledger List / Table */}
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E6EBE9] p-10 text-center">
            <p className="text-sm font-bold text-[#111C1A]">
              Belum ada catatan arus kas
            </p>
            <p className="text-xs text-[#647471] mt-1 mb-4">
              Catat pemasukan atau pengeluaran operasional untuk mulai melacak saldo usaha.
            </p>
            <button
              type="button"
              onClick={() => onOpenEntryModal('expense')}
              className="px-4 py-2 rounded-xl bg-[#14534B] text-white text-xs font-semibold"
            >
              Catat Transaksi Pertama
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E6EBE9] overflow-hidden shadow-[0_2px_10px_rgba(17,28,26,0.02)]">
            <div className="divide-y divide-[#F0F3F2]">
              {filteredEntries.map((entry) => {
                const isIncome = entry.type === 'income';
                const isConfirming = confirmDeleteId === entry.id;

                return (
                  <div
                    key={entry.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 hover:bg-[#FAFBFB] transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-[#ECFDF5] text-[#15803D]'
                            : 'bg-[#FEF2F2] text-[#DC2626]'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#111C1A] leading-snug">
                          {entry.description}
                        </p>
                        <p className="text-xs text-[#647471] mt-0.5 tabular-nums flex flex-wrap items-center gap-x-1.5">
                          <span className="font-semibold text-[#111C1A]/80">
                            {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{entry.category}</span>
                          <span aria-hidden="true">·</span>
                          <span>{entry.paymentMethod}</span>
                          {entry.receiptNo && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">{entry.receiptNo}</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span>{formatDateTime(entry.timestamp)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pl-13 sm:pl-0 shrink-0">
                      <span
                        className={`font-mono text-sm sm:text-base font-bold tabular-nums ${
                          isIncome ? 'text-[#15803D]' : 'text-[#DC2626]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatIDR(entry.amount)}
                      </span>

                      <div className="flex items-center gap-1">
                        {entry.items && entry.items.length > 0 && (
                          <button
                            type="button"
                            onClick={() => onViewReceipt(entry)}
                            title="Lihat Struk"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#F2F6F5] hover:bg-[#E1ECE8] text-[#14534B] text-xs font-semibold transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Struk</span>
                          </button>
                        )}

                        {isConfirming ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteEntry(entry.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-[#DC2626] text-white text-xs font-semibold"
                            >
                              Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1.5 rounded-lg bg-[#F2F6F5] text-[#52605D] text-xs font-semibold"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(entry.id)}
                            aria-label="Hapus catatan"
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
