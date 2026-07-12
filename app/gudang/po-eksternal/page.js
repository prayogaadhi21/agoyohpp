'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function PoEksternalPage() {
  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

useEffect(() => {
  loadPo();
}, []);

async function loadPo() {
  setLoading(true);
  const { data, error: fetchError } = await supabase
  .from('external_po')
  .select('id, po_number, supplier_name, status, created_at')
  .order('created_at', { ascending: false });

  if (fetchError) {
    setError(fetchError.message);
  } else {
    setPoList(data);
  }
  setLoading(false);
}

async function handleReceive(poId) {
  const confirmReceive = window.confirm('Yakin barang untuk PO ini sudah diterima? Stok gudang akan otomatis bertambah.');
  if (!confirmReceive) return;

  setProcessingId(poId);
  setError('');

  const { data: items, error: itemsError } = await supabase
  .from('external_po_items')
  .select('id, product_id, quantity')
  .eq('external_po_id', poId);

  if (itemsError) {
    setError(itemsError.message);
    setProcessingId(null);
    return;
  }

  for (const item of items) {
    const { data: existingStock } = await supabase
    .from('warehouse_stock')
    .select('id, quantity')
    .eq('product_id', item.product_id)
    .maybeSingle();

  if (existingStock) {
    const { error: updateStockError } = await supabase
    .from('warehouse_stock')
    .update({ quantity: existingStock.quantity + item.quantity, updated_at: new Date().toISOString() })
    .eq('id', existingStock.id);

    if (updateStockError) {
      setError(updateStockError.message);
      setProcessingId(null);
      return;
    }
  } else {
    const { error: insertStockError } = await supabase
    .from('warehouse_stock')
    .insert({ product_id: item.product_id, quantity: item.quantity });

    if (insertStockError) {
      setError(insertStockError.message);
      setProcessingId(null);
      return;
    }
  }

  await supabase
    .from('external_po_items')
    .update({ received_quantity: item.quantity })
    .eq('id', item.id);
  }

  const { error: poUpdateError } = await supabase
  .from('external_po')
  .update({ status: 'diterima' })
  .eq('id', poId);

  if (poUpdateError) {
    setError(poUpdateError.message);
  }

  setProcessingId(null);
  loadPo();
}

return (
  <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
<p><Link href="/gudang">Kembali ke Dashboard AGOYO STOCK</Link></p>
  <h1>PO Eksternal</h1>
<p><Link href="/gudang/po-eksternal/baru">Buat PO Baru</Link></p>
{loading && <p>Memuat data...</p>}
{error && <p style={{ color: 'red' }}>{error}</p>}
{!loading && !error && (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
<thead>
  <tr>
  <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>No. PO</th>
<th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Supplier</th>
<th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Status</th>
<th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Tanggal Dibuat</th>
<th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Aksi</th>
  </tr>
  </thead>
<tbody>
{poList.map((po) => (
  <tr key={po.id}>
  <td>{po.po_number}</td>
            <td>{po.supplier_name}</td>
            <td>{po.status}</td>
            <td>{new Date(po.created_at).toLocaleString('id-ID')}</td>
<td>
{(po.status === 'draft' || po.status === 'dipesan') && (
  <button
onClick={() => handleReceive(po.id)}
disabled={processingId === po.id}
  style={{ padding: '4px 12px' }}
>
{processingId === po.id ? 'Memproses...' : 'Terima Barang'}
</button>
)}
</td>
  </tr>
))}
  </tbody>
  </table>
)}
</main>
);
}
