'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function StokGudangPage() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
  loadData();
}, []);

async function loadData() {
  setLoading(true);
  setError('');

  const { data, error: stockError } = await supabase
  .from('warehouse_stock')
  .select('id, quantity, updated_at, products(name, unit, category)')
  .order('updated_at', { ascending: false });

  if (stockError) {
    setError(stockError.message);
  } else {
    setStock(data);
  }

  setLoading(false);
}

return (
  <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
<h1>Stok AGOYO STOCK</h1>
<p><Link href="/gudang">Kembali ke Dashboard AGOYO STOCK</Link></p>
  <p>Daftar stok bahan baku dan kemasan yang ada di gudang pusat.</p>
{loading && <p>Memuat data...</p>}
 {error && <p style={{ color: 'red' }}>{error}</p>}
 {!loading && !error && (
   <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
<thead>
   <tr>
   <th style={thStyle}>Produk</th>
 <th style={thStyle}>Kategori</th>
 <th style={thStyle}>Jumlah</th>
 <th style={thStyle}>Satuan</th>
 <th style={thStyle}>Terakhir Update</th>
   </tr>
   </thead>
 <tbody>
 {stock.length === 0 && (
   <tr>
   <td colSpan={5} style={tdStyle}>Belum ada data stok gudang.</td>
   </tr>
 )}
{stock.map((item) => (
  <tr key={item.id}>
<td style={tdStyle}>{item.products?.name}</td>
<td style={tdStyle}>{item.products?.category || '-'}</td>
<td style={tdStyle}>{item.quantity}</td>
           <td style={tdStyle}>{item.products?.unit}</td>
<td style={tdStyle}>{new Date(item.updated_at).toLocaleString('id-ID')}</td>
  </tr>
))}
</tbody>
  </table>
)}
</main>
);
}

const thStyle = { textAlign: 'left', borderBottom: '2px solid #333', padding: 8 };
const tdStyle = { borderBottom: '1px solid #ddd', padding: 8 };
