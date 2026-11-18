import { CashflowEntry, Product, ShiftState, StoreSettings } from '../types/finance';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Kopi & Ritel Senja',
  branchName: 'Cabang Kemang, JKT',
  cashierName: 'Raka Pratama',
  address: 'Jl. Kemang Raya No. 42, Jakarta Selatan',
  phone: '0812-8890-4410',
  taxPercent: 0,
  dailyTarget: 2500000,
  receiptFooter: 'Terima kasih sudah berbelanja! Simpan struk ini sebagai bukti pembayaran sah.',
};

export const INITIAL_SHIFT: ShiftState = {
  shiftName: 'Shift Pagi (08:00 - 16:00)',
  openedAt: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
  openingCash: 500000,
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'MNM-001',
    name: 'Kopi Susu Gula Aren',
    category: 'Minuman',
    costPrice: 9500,
    sellPrice: 24000,
    stock: 42,
    unit: 'cup',
    icon: 'coffee',
    popular: true,
  },
  {
    id: 'prod-2',
    sku: 'MNM-002',
    name: 'Matcha Latte Dingin',
    category: 'Minuman',
    costPrice: 12000,
    sellPrice: 28000,
    stock: 28,
    unit: 'cup',
    icon: 'cup',
    popular: true,
  },
  {
    id: 'prod-3',
    sku: 'MNM-003',
    name: 'Americano House Blend',
    category: 'Minuman',
    costPrice: 6500,
    sellPrice: 20000,
    stock: 36,
    unit: 'cup',
    icon: 'coffee',
  },
  {
    id: 'prod-4',
    sku: 'MKN-001',
    name: 'Croissant Butter Klasik',
    category: 'Makanan',
    costPrice: 11000,
    sellPrice: 26000,
    stock: 14,
    unit: 'pcs',
    icon: 'croissant',
    popular: true,
  },
  {
    id: 'prod-5',
    sku: 'MKN-002',
    name: 'Rice Bowl Ayam Teriyaki',
    category: 'Makanan',
    costPrice: 18500,
    sellPrice: 38000,
    stock: 19,
    unit: 'porsi',
    icon: 'utensils',
    popular: true,
  },
  {
    id: 'prod-6',
    sku: 'MKN-003',
    name: 'Toast Cokelat Keju',
    category: 'Makanan',
    costPrice: 9000,
    sellPrice: 22000,
    stock: 4,
    unit: 'porsi',
    icon: 'croissant',
  },
  {
    id: 'prod-7',
    sku: 'RTL-001',
    name: 'Biji Kopi Arabika 250g',
    category: 'Retail',
    costPrice: 52000,
    sellPrice: 95000,
    stock: 11,
    unit: 'pack',
    icon: 'package',
    popular: true,
  },
  {
    id: 'prod-8',
    sku: 'RTL-002',
    name: 'Tumbler Stainless 500ml',
    category: 'Retail',
    costPrice: 65000,
    sellPrice: 125000,
    stock: 3,
    unit: 'pcs',
    icon: 'bag',
  },
  {
    id: 'prod-9',
    sku: 'JSA-001',
    name: 'Sewa Ruang Meeting 2 Jam',
    category: 'Jasa',
    costPrice: 15000,
    sellPrice: 150000,
    stock: 99,
    unit: 'sesi',
    icon: 'sparkles',
  },
  {
    id: 'prod-10',
    sku: 'JSA-002',
    name: 'Jasa Giling Kopi Halus',
    category: 'Jasa',
    costPrice: 1000,
    sellPrice: 10000,
    stock: 99,
    unit: 'layanan',
    icon: 'wrench',
  },
];

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

function daysAgoAt(days: number, hour: number, minute = 15): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export function createInitialCashflow(): CashflowEntry[] {
  return [
    {
      id: 'trx-101',
      receiptNo: 'INV-261118-01',
      timestamp: hoursAgo(0.6),
      type: 'income',
      source: 'pos',
      category: 'Penjualan POS',
      description: '2x Kopi Susu Gula Aren, 1x Croissant Butter Klasik',
      customerName: 'Andi Wijaya',
      paymentMethod: 'QRIS',
      amount: 74000,
      subtotal: 74000,
      discount: 0,
      tax: 0,
      totalCost: 30000,
      items: [
        {
          productId: 'prod-1',
          sku: 'MNM-001',
          name: 'Kopi Susu Gula Aren',
          quantity: 2,
          unitPrice: 24000,
          costPrice: 9500,
          totalPrice: 48000,
        },
        {
          productId: 'prod-4',
          sku: 'MKN-001',
          name: 'Croissant Butter Klasik',
          quantity: 1,
          unitPrice: 26000,
          costPrice: 11000,
          totalPrice: 26000,
        },
      ],
    },
    {
      id: 'trx-102',
      receiptNo: 'INV-261118-02',
      timestamp: hoursAgo(1.4),
      type: 'income',
      source: 'pos',
      category: 'Penjualan POS',
      description: '1x Rice Bowl Ayam Teriyaki, 1x Matcha Latte Dingin',
      customerName: 'Nadia Putri',
      paymentMethod: 'Tunai',
      amount: 66000,
      subtotal: 66000,
      discount: 0,
      tax: 0,
      cashPaid: 100000,
      changeAmount: 34000,
      totalCost: 30500,
      items: [
        {
          productId: 'prod-5',
          sku: 'MKN-002',
          name: 'Rice Bowl Ayam Teriyaki',
          quantity: 1,
          unitPrice: 38000,
          costPrice: 18500,
          totalPrice: 38000,
        },
        {
          productId: 'prod-2',
          sku: 'MNM-002',
          name: 'Matcha Latte Dingin',
          quantity: 1,
          unitPrice: 28000,
          costPrice: 12000,
          totalPrice: 28000,
        },
      ],
    },
    {
      id: 'trx-103',
      timestamp: hoursAgo(2.2),
      type: 'expense',
      source: 'manual',
      category: 'Bahan Baku',
      description: 'Beli Susu Segar UHT 12 Liter & Es Batu',
      paymentMethod: 'Tunai',
      amount: 215000,
    },
    {
      id: 'trx-104',
      receiptNo: 'INV-261118-03',
      timestamp: hoursAgo(3.1),
      type: 'income',
      source: 'pos',
      category: 'Penjualan POS',
      description: '2x Biji Kopi Arabika 250g, 1x Sewa Ruang Meeting 2 Jam',
      customerName: 'PT Kreatif Nusantara',
      paymentMethod: 'Transfer',
      amount: 340000,
      subtotal: 340000,
      discount: 0,
      tax: 0,
      totalCost: 119000,
      items: [
        {
          productId: 'prod-7',
          sku: 'RTL-001',
          name: 'Biji Kopi Arabika 250g',
          quantity: 2,
          unitPrice: 95000,
          costPrice: 52000,
          totalPrice: 190000,
        },
        {
          productId: 'prod-9',
          sku: 'JSA-001',
          name: 'Sewa Ruang Meeting 2 Jam',
          quantity: 1,
          unitPrice: 150000,
          costPrice: 15000,
          totalPrice: 150000,
        },
      ],
    },
    {
      id: 'trx-105',
      receiptNo: 'INV-261117-14',
      timestamp: daysAgoAt(1, 15, 40),
      type: 'income',
      source: 'pos',
      category: 'Penjualan POS',
      description: '4x Kopi Susu Gula Aren, 2x Rice Bowl Ayam Teriyaki',
      paymentMethod: 'QRIS',
      amount: 172000,
      subtotal: 172000,
      totalCost: 75000,
    },
    {
      id: 'trx-106',
      timestamp: daysAgoAt(1, 11, 20),
      type: 'expense',
      source: 'manual',
      category: 'Operasional',
      description: 'Pembayaran Tagihan WiFi & Listrik Mingguan',
      paymentMethod: 'Transfer',
      amount: 320000,
    },
    {
      id: 'trx-107',
      receiptNo: 'INV-261116-09',
      timestamp: daysAgoAt(2, 14, 10),
      type: 'income',
      source: 'pos',
      category: 'Penjualan POS',
      description: '3x Tumbler Stainless 500ml, 3x Americano',
      paymentMethod: 'Kartu',
      amount: 435000,
      subtotal: 435000,
      totalCost: 214500,
    },
    {
      id: 'trx-108',
      receiptNo: 'INV-261115-05',
      timestamp: daysAgoAt(3, 16, 30),
      type: 'income',
      source: 'pos',
      category: 'Penjualan POS',
      description: '5x Kopi Susu Gula Aren, 4x Croissant Butter',
      paymentMethod: 'Tunai',
      amount: 224000,
      subtotal: 224000,
      totalCost: 91500,
    },
    {
      id: 'trx-109',
      timestamp: daysAgoAt(3, 9, 45),
      type: 'expense',
      source: 'manual',
      category: 'Kemasan & Perlengkapan',
      description: 'Restock Cup 16oz, Sedotan Kertas & Paper Bag',
      paymentMethod: 'Transfer',
      amount: 185000,
    },
    {
      id: 'trx-110',
      receiptNo: 'INV-261114-12',
      timestamp: daysAgoAt(4, 13, 50),
      type: 'income',
      source: 'pos',
      category: 'Penjualan POS',
      description: '2x Sewa Ruang Meeting 2 Jam, 6x Matcha Latte Dingin',
      paymentMethod: 'Transfer',
      amount: 468000,
      subtotal: 468000,
      totalCost: 102000,
    },
    {
      id: 'trx-111',
      receiptNo: 'INV-261113-07',
      timestamp: daysAgoAt(5, 17, 15),
      type: 'income',
      source: 'pos',
      category: 'Penjualan POS',
      description: '3x Rice Bowl Ayam Teriyaki, 3x Kopi Susu Gula Aren',
      paymentMethod: 'QRIS',
      amount: 186000,
      subtotal: 186000,
      totalCost: 84000,
    },
    {
      id: 'trx-112',
      timestamp: daysAgoAt(5, 10, 0),
      type: 'expense',
      source: 'manual',
      category: 'Gaji & Honor',
      description: 'Insentif Barista Shift Akhir Pekan',
      paymentMethod: 'Tunai',
      amount: 150000,
    },
  ];
}

export function formatIDR(value: number): string {
  const absVal = Math.round(Math.abs(value));
  const formatted = new Intl.NumberFormat('id-ID').format(absVal);
  return value < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

export function formatCompactIDR(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}Rp ${(abs / 1_000_000).toFixed(1).replace('.', ',')} jt`;
  }
  if (abs >= 1_000) {
    return `${sign}Rp ${Math.round(abs / 1_000)} rb`;
  }
  return formatIDR(value);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function isSameLocalDay(isoA: string, dateB: Date = new Date()): boolean {
  const a = new Date(isoA);
  return (
    a.getFullYear() === dateB.getFullYear() &&
    a.getMonth() === dateB.getMonth() &&
    a.getDate() === dateB.getDate()
  );
}

export function exportCashflowCSV(entries: CashflowEntry[], storeName: string): void {
  const headers = [
    'Tanggal & Waktu',
    'No Struk / ID',
    'Tipe',
    'Kategori',
    'Keterangan',
    'Pelanggan',
    'Metode Bayar',
    'Nominal (IDR)',
  ];

  const rows = entries.map((e) => [
    formatDateTime(e.timestamp),
    e.receiptNo || e.id,
    e.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    e.category,
    `"${e.description.replace(/"/g, '""')}"`,
    `"${(e.customerName || '-').replace(/"/g, '""')}"`,
    e.paymentMethod,
    e.type === 'income' ? e.amount : -e.amount,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `arus-kas-${storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
