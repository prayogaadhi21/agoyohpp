'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function StaffPage() {
    const [profile, setProfile] = useState(null);
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

useEffect(() => {
    loadData();
}, []);

async function loadData() {
    setLoading(true);
    setError('');

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
        setError('Anda belum login.');
        setLoading(false);
        return;
    }

    const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('id, name, branch_id, branches(name)')
    .eq('auth_user_id', authData.user.id)
    .single();

    if (profileError || !userProfile) {
        setError('Profil staff tidak ditemukan.');
        setLoading(false);
        return;
    }

    setProfile(userProfile);

    if (userProfile.branch_id) {
        const { data: stockData, error: stockError } = await supabase
        .from('branch_stock')
        .select('id, quantity, updated_at, products(name, unit, category)')
        .eq('branch_id', userProfile.branch_id)
        .order('updated_at', { ascending: false });

    if (stockError) {
        setError(stockError.message);
    } else {
        setStock(stockData);
    }
    }

    setLoading(false);
}

return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
<h1>Dashboard Staff</h1>
{profile && (
    <p>
    <strong>{profile.name}</strong> — Cabang: {profile.branches?.name || '-'}
    </p>
 )}
<p>Stok cabang ini bersifat hanya lihat (read-only).</p>
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
     <td colSpan={5} style={tdStyle}>Belum ada data stok untuk cabang ini.</td>
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
