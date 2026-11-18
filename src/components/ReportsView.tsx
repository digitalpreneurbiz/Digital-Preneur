import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Award, CreditCard } from 'lucide-react';
import { CashflowEntry, PaymentMethod } from '../types/finance';
import { formatCompactIDR, formatIDR, formatShortDate, isSameLocalDay } from '../data/seedData';

interface ReportsViewProps {
  entries: CashflowEntry[];
}

type PeriodKey = 'today' | '7d' | '30d' | 'all';

export const ReportsView: React.FC<ReportsViewProps> = ({ entries }) => {
  const [period, setPeriod] = useState<PeriodKey>('7d');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const periodEntries = useMemo(() => {
    const now = new Date();
    return entries.filter((e) => {
      if (period === 'all') return true;
      if (period === 'today') return isSameLocalDay(e.timestamp, now);
      const days = period === '7d' ? 7 : 30;
      const cutoff = new Date();
      cutoff.setDate(now.getDate() - (days - 1));
      cutoff.setHours(0, 0, 0, 0);
      return new Date(e.timestamp) >= cutoff;
    });
  }, [entries, period]);

  const pnl = useMemo(() => {
    let posSales = 0;
    let otherIncome = 0;
    let cogs = 0;
    let operationalExpense = 0;

    periodEntries.forEach((e) => {
      if (e.type === 'income') {
        if (e.source === 'pos') {
          posSales += e.amount;
          cogs += e.totalCost || 0;
        } else {
          otherIncome += e.amount;
        }
      } else {
        operationalExpense += e.amount;
      }
    });

    const totalRevenue = posSales + otherIncome;
    const grossProfit = totalRevenue - cogs;
    const netProfit = grossProfit - operationalExpense;
    const netMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    return {
      posSales,
      otherIncome,
      totalRevenue,
      cogs,
      grossProfit,
      operationalExpense,
      netProfit,
      netMargin,
    };
  }, [periodEntries]);

  const paymentBreakdown = useMemo(() => {
    const map: Record<PaymentMethod, { count: number; total: number }> = {
      Tunai: { count: 0, total: 0 },
      QRIS: { count: 0, total: 0 },
      Transfer: { count: 0, total: 0 },
      Kartu: { count: 0, total: 0 },
    };

    periodEntries
      .filter((e) => e.type === 'income')
      .forEach((e) => {
        map[e.paymentMethod].count += 1;
        map[e.paymentMethod].total += e.amount;
      });

    const grand = Object.values(map).reduce((s, v) => s + v.total, 0);

    return (Object.keys(map) as PaymentMethod[]).map((method) => ({
      method,
      count: map[method].count,
      total: map[method].total,
      percent: grand > 0 ? Math.round((map[method].total / grand) * 100) : 0,
    }));
  }, [periodEntries]);

  const topProducts = useMemo(() => {
    const counts = new Map<string, { name: string; qty: number; revenue: number }>();
    periodEntries.forEach((e) => {
      e.items?.forEach((item) => {
        const cur = counts.get(item.productId) || {
          name: item.name,
          qty: 0,
          revenue: 0,
        };
        cur.qty += item.quantity;
        cur.revenue += item.totalPrice;
        counts.set(item.productId, cur);
      });
    });

    return Array.from(counts.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [periodEntries]);

  // Last 7 days daily bar chart data
  const dailySeries = useMemo(() => {
    const days: { label: string; isoDate: string; income: number; expense: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayIncome = entries
        .filter((e) => e.type === 'income' && isSameLocalDay(e.timestamp, d))
        .reduce((s, e) => s + e.amount, 0);
      const dayExpense = entries
        .filter((e) => e.type === 'expense' && isSameLocalDay(e.timestamp, d))
        .reduce((s, e) => s + e.amount, 0);
      days.push({
        label: formatShortDate(d.toISOString()),
        isoDate: d.toISOString().slice(0, 10),
        income: dayIncome,
        expense: dayExpense,
      });
    }
    return days;
  }, [entries]);

  const maxChartVal = Math.max(
    100000,
    ...dailySeries.map((d) => Math.max(d.income, d.expense))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-[#14534B] text-white rounded-b-[28px] lg:rounded-3xl px-4 py-5 sm:px-6 sm:py-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-white/75 font-medium">
              Laporan Keuangan & Laba Rugi
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums mt-1">
              {formatIDR(pnl.netProfit)}
            </h1>
            <p className="text-xs text-white/80 mt-1 flex items-center gap-1.5">
              {pnl.netProfit >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5 text-[#86EFAC]" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-[#FCA5A5]" />
              )}
              <span>
                Laba Bersih · Margin {pnl.netMargin}% dari omzet {formatIDR(pnl.totalRevenue)}
              </span>
            </p>
          </div>

          {/* Period Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/12 self-start">
            {(
              [
                { id: 'today', label: 'Hari Ini' },
                { id: '7d', label: '7 Hari' },
                { id: '30d', label: '30 Hari' },
                { id: 'all', label: 'Semua' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  period === p.id
                    ? 'bg-white text-[#14534B]'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="px-4 lg:px-0 grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Profit & Loss Statement */}
        <section className="xl:col-span-5 bg-white rounded-2xl border border-[#E6EBE9] p-5 shadow-[0_2px_10px_rgba(17,28,26,0.02)]">
          <h2 className="text-base font-bold text-[#111C1A] mb-4">
            Ringkasan Laba Rugi
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#52605D]">Penjualan Kasir (POS)</span>
              <span className="font-mono font-semibold text-[#111C1A] tabular-nums">
                {formatIDR(pnl.posSales)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#52605D]">Pemasukan Lainnya</span>
              <span className="font-mono font-semibold text-[#111C1A] tabular-nums">
                {formatIDR(pnl.otherIncome)}
              </span>
            </div>

            <div className="pt-2.5 border-t border-[#EEF2F0] flex items-center justify-between font-bold">
              <span>Total Pendapatan</span>
              <span className="font-mono text-[#14534B] tabular-nums">
                {formatIDR(pnl.totalRevenue)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#B45309]">
              <span>Harga Pokok Penjualan (HPP)</span>
              <span className="font-mono font-semibold tabular-nums">
                -{formatIDR(pnl.cogs)}
              </span>
            </div>

            <div className="pt-2.5 border-t border-[#EEF2F0] flex items-center justify-between font-bold">
              <span>Laba Kotor</span>
              <span className="font-mono text-[#111C1A] tabular-nums">
                {formatIDR(pnl.grossProfit)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#DC2626]">
              <span>Beban & Pengeluaran Operasional</span>
              <span className="font-mono font-semibold tabular-nums">
                -{formatIDR(pnl.operationalExpense)}
              </span>
            </div>

            <div className="mt-4 pt-3.5 border-t-2 border-[#14534B]/20 flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold text-[#111C1A]">
                  Laba Bersih (Net Profit)
                </p>
                <p className="text-xs text-[#647471] tabular-nums">
                  Margin keuntungan bersih {pnl.netMargin}%
                </p>
              </div>
              <span
                className={`font-mono text-lg font-extrabold tabular-nums ${
                  pnl.netProfit >= 0 ? 'text-[#15803D]' : 'text-[#DC2626]'
                }`}
              >
                {formatIDR(pnl.netProfit)}
              </span>
            </div>
          </div>
        </section>

        {/* 7-Day Cashflow Bar Chart */}
        <section className="xl:col-span-7 bg-white rounded-2xl border border-[#E6EBE9] p-5 shadow-[0_2px_10px_rgba(17,28,26,0.02)] flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-[#111C1A]">
                Arus Kas 7 Hari Terakhir
              </h2>
              <p className="text-xs text-[#647471]">
                Perbandingan pemasukan dan pengeluaran harian
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-[#14534B]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#14534B]" />
                Pemasukan
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#DC2626]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F87171]" />
                Pengeluaran
              </span>
            </div>
          </div>

          {/* Interactive Bar Chart */}
          <div className="relative h-56 flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 border-b border-[#EEF2F0]">
            {dailySeries.map((day, idx) => {
              const incHeight = Math.round((day.income / maxChartVal) * 150);
              const expHeight = Math.round((day.expense / maxChartVal) * 150);
              const isHovered = hoveredDayIndex === idx;

              return (
                <div
                  key={day.isoDate}
                  onMouseEnter={() => setHoveredDayIndex(idx)}
                  onMouseLeave={() => setHoveredDayIndex(null)}
                  className="relative flex-1 flex flex-col items-center h-full justify-end group"
                >
                  {isHovered && (
                    <div className="absolute -top-2 z-20 bg-[#111C1A] text-white text-[11px] rounded-xl px-2.5 py-1.5 shadow-lg whitespace-nowrap pointer-events-none">
                      <p className="font-bold mb-0.5">{day.label}</p>
                      <p className="font-mono text-[#86EFAC] tabular-nums">
                        +{formatCompactIDR(day.income)}
                      </p>
                      <p className="font-mono text-[#FCA5A5] tabular-nums">
                        -{formatCompactIDR(day.expense)}
                      </p>
                    </div>
                  )}

                  <div className="flex items-end gap-1 sm:gap-1.5 h-[150px]">
                    <div
                      className="w-3.5 sm:w-5 rounded-t-md bg-[#14534B] transition-all duration-200 group-hover:bg-[#1C6E63]"
                      style={{ height: `${Math.max(4, incHeight)}px` }}
                      title={`Pemasukan: ${formatIDR(day.income)}`}
                    />
                    <div
                      className="w-3.5 sm:w-5 rounded-t-md bg-[#F87171] transition-all duration-200 group-hover:bg-[#EF4444]"
                      style={{ height: `${Math.max(4, expHeight)}px` }}
                      title={`Pengeluaran: ${formatIDR(day.expense)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between gap-2 sm:gap-4 pt-2.5">
            {dailySeries.map((day) => (
              <span
                key={day.isoDate}
                className="flex-1 text-center text-[11px] font-medium text-[#647471] tabular-nums truncate"
              >
                {day.label}
              </span>
            ))}
          </div>
        </section>

        {/* Payment Method Breakdown */}
        <section className="xl:col-span-6 bg-white rounded-2xl border border-[#E6EBE9] p-5 shadow-[0_2px_10px_rgba(17,28,26,0.02)]">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4.5 h-4.5 text-[#14534B]" />
            <h2 className="text-base font-bold text-[#111C1A]">
              Pemasukan per Metode Bayar
            </h2>
          </div>

          <div className="space-y-3.5">
            {paymentBreakdown.map((item) => (
              <div key={item.method} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#111C1A]">
                    {item.method}{' '}
                    <span className="text-[#647471] font-normal tabular-nums">
                      · {item.count} transaksi
                    </span>
                  </span>
                  <span className="font-mono font-bold text-[#14534B] tabular-nums">
                    {formatIDR(item.total)} ({item.percent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0F4F3] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#14534B] transition-all"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top Selling Products */}
        <section className="xl:col-span-6 bg-white rounded-2xl border border-[#E6EBE9] p-5 shadow-[0_2px_10px_rgba(17,28,26,0.02)]">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4.5 h-4.5 text-[#14534B]" />
            <h2 className="text-base font-bold text-[#111C1A]">
              Produk Terlaris
            </h2>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-xs text-[#647471] py-6 text-center">
              Belum ada rincian penjualan produk pada periode ini.
            </p>
          ) : (
            <div className="divide-y divide-[#F0F3F2]">
              {topProducts.map((prod, idx) => (
                <div
                  key={prod.name}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-[#F2F6F5] text-[#14534B] font-mono text-xs font-bold flex items-center justify-center shrink-0 tabular-nums">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#111C1A] truncate">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-[#647471] tabular-nums">
                        {prod.qty} terjual
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#14534B] tabular-nums shrink-0">
                    {formatIDR(prod.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
