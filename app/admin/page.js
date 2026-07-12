'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminPage() {
    const [warehouseStock, setWarehouseStock] = useState([]);
    const [branchStock, setBranchStock] = useState([]);
    const [externalPo, setExternalPo] = useState([]);
    const [internalRequest, setInternalRequest] = useState([]);
    const [posTransactions, setPosTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = '/login';
    }

useEffect(() => {
    loadData();
}, []);

async function loadData() {
    setLoading(true);
    setError('');

    const [warehouseRes, branchRes, poRes, requestRes, posRes] = await Promise.all([
        supabase.from('warehouse_stock').select('id, quantity, updated_at, products(name, unit)').order('updated_at', { ascending: false }),
        supabase.from('branch_stock').select('id, quantity, updated_at, branches(name), products(name, unit)').order('updated_at', { ascending: false }),
        supabase.from('external_po').select('id, po_number, supplier_name, status, created_at').order('created_at', { ascending: false }).limit(10),
        supabase.from('internal_request').select('id, status, created_at, branches(name)').order('created_at', { ascending: false }).limit(10),
        supabase.from('pos_transactions').select('id, total_amount, payment_method, created_at, branches(name)').order('created_at', { ascending: false }).limit(10),
        ]);

    if (warehouseRes.error) setError(warehouseRes.error.message);
    else setWarehouseStock(warehouseRes.data);

    if (branchRes.error) setError(branchRes.error.message);
    else setBranchStock(branchRes.data);

    if (poRes.error) setError(poRes.error.message);
    else setExternalPo(poRes.data);

    if (requestRes.error) setError(requestRes.error.message);
    else setInternalRequest(requestRes.data);

    if (posRes.error) setError(posRes.error.message);
    else setPosTransactions(posRes.data);

    setLoading(false);
}

const totalRevenue = posTransactions.reduce((sum, trx) => sum + Number(trx.total_amount || 0), 0);

return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
<h1>Dashboard Admin</h1>
<p>Ringkasan seluruh data AGOYO STOCK dan cabang AGOYO.</p>
<button onClick={handleLogout} style={{ marginBottom: 16 }}>Logout</button>
{loading && <p>Memuat data...</p>}
 {error && <p style={{ color: 'red' }}>{error}</p>}

 {!loading && (
     <>
     <section style={sectionStyle}>
     <h2>Stok AGOYO STOCK (Gudang)</h2>
  <table style={tableStyle}>
     <thead>
     <tr>
     <th style={thStyle}>Produk</th>
  <th style={thStyle}>Jumlah</th>
  <th style={thStyle}>Satuan</th>
     </tr>
     </thead>
  <tbody>
 {warehouseStock.length === 0 && (
     <tr><td colSpan={3} style={tdStyle}>Belum ada data.</td></tr>
     )}
 {warehouseStock.map((item) => (
     <tr key={item.id}>
     <td style={tdStyle}>{item.products?.name}</td>
                     <td style={tdStyle}>{item.quantity}</td>
                     <td style={tdStyle}>{item.products?.unit}</td>
                     </tr>
                     ))}
 </tbody>
     </table>
     </section>

<section style={sectionStyle}>
     <h2>Stok Cabang</h2>
 <table style={tableStyle}>
     <thead>
     <tr>
     <th style={thStyle}>Cabang</th>
 <th style={thStyle}>Produk</th>
 <th style={thStyle}>Jumlah</th>
 <th style={thStyle}>Satuan</th>
     </tr>
     </thead>
 <tbody>
 {branchStock.length === 0 && (
     <tr><td colSpan={4} style={tdStyle}>Belum ada data.</td></tr>
     )}
{branchStock.map((item) => (
    <tr key={item.id}>
<td style={tdStyle}>{item.branches?.name}</td>
<td style={tdStyle}>{item.products?.name}</td>
<td style={tdStyle}>{item.quantity}</td>
                 <td style={tdStyle}>{item.products?.unit}</td>
                 </tr>
                 ))}
</tbody>
    </table>
    </section>

<section style={sectionStyle}>
    <h2>PO Eksternal Terbaru</h2>
<table style={tableStyle}>
    <thead>
    <tr>
    <th style={thStyle}>No. PO</th>
<th style={thStyle}>Supplier</th>
<th style={thStyle}>Status</th>
<th style={thStyle}>Tanggal</th>
    </tr>
    </thead>
<tbody>
{externalPo.length === 0 && (
    <tr><td colSpan={4} style={tdStyle}>Belum ada data.</td></tr>
    )}
{externalPo.map((po) => (
    <tr key={po.id}>
    <td style={tdStyle}>{po.po_number}</td>
                <td style={tdStyle}>{po.supplier_name}</td>
                <td style={tdStyle}>{po.status}</td>
                <td style={tdStyle}>{new Date(po.created_at).toLocaleString('id-ID')}</td>
    </tr>
))}
    </tbody>
    </table>
    </section>

<section style={sectionStyle}>
    <h2>Request dari Cabang Terbaru</h2>
<table style={tableStyle}>
    <thead>
    <tr>
    <th style={thStyle}>Cabang</th>
<th style={thStyle}>Status</th>
<th style={thStyle}>Tanggal</th>
    </tr>
    </thead>
<tbody>
{internalRequest.length === 0 && (
    <tr><td colSpan={3} style={tdStyle}>Belum ada data.</td></tr>
    )}
{internalRequest.map((req) => (
    <tr key={req.id}>
    <td style={tdStyle}>{req.branches?.name}</td>
                     <td style={tdStyle}>{req.status}</td>
                     <td style={tdStyle}>{new Date(req.created_at).toLocaleString('id-ID')}</td>
    </tr>
))}
    </tbody>
    </table>
    </section>

<section style={sectionStyle}>
    <h2>Transaksi Kasir Terbaru</h2>
<p>Total {posTransactions.length} transaksi terbaru senilai Rp{totalRevenue.toLocaleString('id-ID')}.</p>
<table style={tableStyle}>
    <thead>
    <tr>
    <th style={thStyle}>Cabang</th>
<th style={thStyle}>Total</th>
<th style={thStyle}>Metode Bayar</th>
<th style={thStyle}>Tanggal</th>
    </tr>
    </thead>
<tbody>
{posTransactions.length === 0 && (
    <tr><td colSpan={4} style={tdStyle}>Belum ada data.</td></tr>
    )}
{posTransactions.map((trx) => (
    <tr key={trx.id}>
    <td style={tdStyle}>{trx.branches?.name}</td>
                     <td style={tdStyle}>Rp{Number(trx.total_amount).toLocaleString('id-ID')}</td>
<td style={tdStyle}>{trx.payment_method || '-'}</td>
<td style={tdStyle}>{new Date(trx.created_at).toLocaleString('id-ID')}</td>
    </tr>
))}
    </tbody>
    </table>
    </section>
    </>
)}
</main>
);
}

const sectionStyle = { marginTop: 32 };
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: 8 };
const thStyle = { textAlign: 'left', borderBottom: '2px solid #333', padding: 8 };
const tdStyle = { borderBottom: '1px solid #ddd', padding: 8 };
