'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function RequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

async function loadRequests() {
  setLoading(true);
  const { data, error: fetchError } = await supabase
  .from('internal_request')
  .select('id, status, created_at, branch_id, branches(name), internal_request_items(id, quantity_requested, quantity_approved, product_id, products(name, unit))')
  .order('created_at', { ascending: false });

  if (fetchError) {
    setError(fetchError.message);
  } else {
    setRequests(data);
  }
  setLoading(false);
}

useEffect(() => {
  loadRequests();
}, []);

async function handleApproveAndSend(request) {
  setProcessingId(request.id);
  setError('');

  try {
    const { data: transfer, error: transferError } = await supabase
    .from('stock_transfer')
    .insert({
      to_branch_id: request.branch_id,
      internal_request_id: request.id,
      status: 'dikirim',
    })
    .select()
    .single();

  if (transferError) throw transferError;

  for (const item of request.internal_request_items) {
    const qty = item.quantity_approved || item.quantity_requested;

    await supabase.from('stock_transfer_items').insert({
      stock_transfer_id: transfer.id,
      product_id: item.product_id,
      quantity: qty,
    });

    const { data: warehouseRow } = await supabase
    .from('warehouse_stock')
    .select('id, quantity')
    .eq('product_id', item.product_id)
    .single();

    if (warehouseRow) {
      await supabase
      .from('warehouse_stock')
      .update({ quantity: warehouseRow.quantity - qty, updated_at: new Date().toISOString() })
      .eq('id', warehouseRow.id);
    }

    const { data: branchRow } = await supabase
    .from('branch_stock')
    .select('id, quantity')
    .eq('branch_id', request.branch_id)
    .eq('product_id', item.product_id)
    .single();

    if (branchRow) {
      await supabase
      .from('branch_stock')
      .update({ quantity: branchRow.quantity + qty, updated_at: new Date().toISOString() })
      .eq('id', branchRow.id);
    } else {
      await supabase.from('branch_stock').insert({
        branch_id: request.branch_id,
        product_id: item.product_id,
        quantity: qty,
      });
    }
  }

  await supabase
    .from('internal_request')
    .update({ status: 'dikirim' })
    .eq('id', request.id);

  await loadRequests();
  } catch (err) {
    setError(err.message);
  } finally {
    setProcessingId(null);
  }
}

return (
  <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
<p><Link href="/gudang">Kembali ke Dashboard Gudang</Link></p>
  <h1>Request dari Cabang</h1>
{loading && <p>Memuat data...</p>}
 {error && <p style={{ color: 'red' }}>{error}</p>}
 {!loading && requests.map((request) => (
   <div key={request.id} style={{ border: '1px solid #ccc', padding: 16, marginBottom: 16 }}>
<p><strong>Cabang:</strong> {request.branches?.name}</p>
  <p><strong>Status:</strong> {request.status}</p>
  <p><strong>Tanggal:</strong> {new Date(request.created_at).toLocaleString('id-ID')}</p>
  <ul>
{request.internal_request_items?.map((item) => (
  <li key={item.id}>
  {item.products?.name}: {item.quantity_requested} {item.products?.unit}
</li>
))}
</ul>
{request.status === 'pending' && (
  <button
 onClick={() => handleApproveAndSend(request)}
 disabled={processingId === request.id}
   >
 {processingId === request.id ? 'Memproses...' : 'Setujui dan Kirim'}
 </button>
 )}
</div>
))}
  </main>
);
}
