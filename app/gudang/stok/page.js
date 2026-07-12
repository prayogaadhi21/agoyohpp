'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function StokGudangPage() {
  const [stock, setStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

const [selectedProductId, setSelectedProductId] = useState('');
  const [quantityInput, setQuantityInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

useEffect(() => {
  loadData();
}, []);

async function loadData() {
  setLoading(true);
  setError('');

  const { data, error: stockError } = await supabase
  .from('warehouse_stock')
  .select('id, product_id, quantity, updated_at, products(name, unit, category)')
  .order('updated_at', { ascending: false });

  if (stockError) {
    setError(stockError.message);
  } else {
    setStock(data);
  }

  const { data: productList } = await supabase
  .from('products')
  .select('id, name, unit')
  .order('name');
  setProducts(productList || []);

  setLoading(false);
}

function handleProductChange(productId) {
  setSelectedProductId(productId);
  const existing = stock.find((item) => item.product_id === productId);
  setQuantityInput(existing ? String(existing.quantity) : '');
}

async function handleSubmit(e) {
  e.preventDefault();
  setFormError('');
  setFormSuccess('');

  if (!selectedProductId || quantityInput === '') {
    setFormError('Pilih produk dan isi jumlah terlebih dahulu.');
    return;
  }

  setSaving(true);

  const existing = stock.find((item) => item.product_id === selectedProductId);

  if (existing) {
    const { error: updateError } = await supabase
    .from('warehouse_stock')
    .update({ quantity: Number(quantityInput), updated_at: new Date().toISOString() })
    .eq('id', existing.id);

  if (updateError) {
    setFormError(updateError.message);
    setSaving(false);
    return;
  }
  } else {
    const { error: insertError } = await supabase
    .from('warehouse_stock')
    .insert({ product_id: selectedProductId, quantity: Number(quantityInput) });

  if (insertError) {
    setFormError(insertError.message);
    setSaving(false);
    return;
  }
  }

  setFormSuccess('Stok berhasil disimpan.');
  setSelectedProductId('');
  setQuantityInput('');
  setSaving(false);
  loadData();
}

return (
  <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
<h1>Stok AGOYO STOCK</h1>
<p><Link href="/gudang">Kembali ke Dashboard AGOYO STOCK</Link></p>
  <p>Daftar stok bahan baku dan kemasan yang ada di gudang pusat.</p>

<div style={{ border: '1px solid #ccc', padding: 16, marginBottom: 24, maxWidth: 500 }}>
<h3>Tambah / Edit Stok</h3>
<form onSubmit={handleSubmit}>
  <div style={{ marginBottom: 12 }}>
<label>Produk</label>
<select
value={selectedProductId}
onChange={(e) => handleProductChange(e.target.value)}
style={{ width: '100%', padding: 8 }}
required
>
  <option value="">Pilih produk</option>
{products.map((p) => (
  <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
))}
  </select>
  </div>
<div style={{ marginBottom: 12 }}>
<label>Jumlah</label>
<input
type="number"
value={quantityInput}
onChange={(e) => setQuantityInput(e.target.value)}
style={{ width: '100%', padding: 8 }}
required
/>
  </div>
{formError && <p style={{ color: 'red' }}>{formError}</p>}
{formSuccess && <p style={{ color: 'green' }}>{formSuccess}</p>}
<button type="submit" disabled={saving} style={{ padding: '8px 16px' }}>
{saving ? 'Menyimpan...' : 'Simpan Stok'}
</button>
  </form>
  </div>

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
