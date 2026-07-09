'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../../lib/supabaseClient';

export default function PoEksternalBaruPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [poNumber, setPoNumber] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: '', price: '' }]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

useEffect(() => {
  async function loadProducts() {
    const { data } = await supabase.from('products').select('id, name, unit').order('name');
    setProducts(data || []);
  }
  loadProducts();
}, []);

function updateItem(index, field, value) {
  const newItems = [...items];
  newItems[index][field] = value;
  setItems(newItems);
}

function addItemRow() {
  setItems([...items, { product_id: '', quantity: '', price: '' }]);
}

function removeItemRow(index) {
  setItems(items.filter((_, i) => i !== index));
}

async function handleSubmit(e) {
  e.preventDefault();
  setError('');
  setSaving(true);

  const { data: po, error: poError } = await supabase
  .from('external_po')
  .insert({ po_number: poNumber, supplier_name: supplierName, status: 'draft' })
  .select()
  .single();

  if (poError) {
    setError(poError.message);
    setSaving(false);
    return;
  }

  const itemsToInsert = items
  .filter((item) => item.product_id && item.quantity)
  .map((item) => ({
    external_po_id: po.id,
    product_id: item.product_id,
    quantity: Number(item.quantity),
    price: item.price ? Number(item.price) : null,
  }));

  const { error: itemsError } = await supabase.from('external_po_items').insert(itemsToInsert);

  setSaving(false);

  if (itemsError) {
    setError(itemsError.message);
    return;
  }

  router.push('/gudang/po-eksternal');
}

return (
  <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
<p><Link href="/gudang/po-eksternal">Kembali ke Daftar PO Eksternal</Link></p>
  <h1>Buat PO Eksternal Baru</h1>
<form onSubmit={handleSubmit}>
  <div style={{ marginBottom: 12 }}>
<label>Nomor PO</label>
<input
type="text"
              value={poNumber}
onChange={(e) => setPoNumber(e.target.value)}
required
style={{ width: '100%', padding: 8 }}
/>
  </div>
<div style={{ marginBottom: 12 }}>
<label>Nama Supplier</label>
<input
type="text"
value={supplierName}
onChange={(e) => setSupplierName(e.target.value)}
required
style={{ width: '100%', padding: 8 }}
/>
  </div>
<h3>Daftar Barang</h3>
{items.map((item, index) => (
  <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
<select
value={item.product_id}
onChange={(e) => updateItem(index, 'product_id', e.target.value)}
style={{ flex: 2, padding: 8 }}
>
<option value="">Pilih produk</option>
{products.map((p) => (
<option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
  ))}
</select>
  <input
  type="number"
placeholder="Jumlah"
           value={item.quantity}
  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
  style={{ flex: 1, padding: 8 }}
           />
  <input
type="number"
  placeholder="Harga"
    value={item.price}
           onChange={(e) => updateItem(index, 'price', e.target.value)}
  style={{ flex: 1, padding: 8 }}
  />
  <button type="button" onClick={() => removeItemRow(index)}>Hapus</button>
</div>
  ))}
    <button type="button" onClick={addItemRow} style={{ marginBottom: 16 }}>Tambah Barang</button>
  {error && <p style={{ color: 'red' }}>{error}</p>}
    <div>
    <button type="submit" disabled={saving} style={{ padding: 10 }}>
{saving ? 'Menyimpan...' : 'Simpan PO'}
</button>
  </div>
  </form>
  </main>
);
}
