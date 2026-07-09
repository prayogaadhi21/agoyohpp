'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabaseClient';

export default function PoEksternalPage() {
  const [poList, setPoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
  async function loadPo() {
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

          loadPo();
}, []);

return (
  <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
<p><Link href="/gudang">Kembali ke Dashboard Gudang</Link></p>
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
  </tr>
  </thead>
<tbody>
{poList.map((po) => (
  <tr key={po.id}>
  <td>{po.po_number}</td>
            <td>{po.supplier_name}</td>
            <td>{po.status}</td>
            <td>{new Date(po.created_at).toLocaleString('id-ID')}</td>
  </tr>
))}
  </tbody>
  </table>
)}
</main>
);
}
