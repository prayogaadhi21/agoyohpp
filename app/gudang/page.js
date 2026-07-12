'use client';

import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function GudangPage() {
    async function handleLogout() {
        await supabase.auth.signOut();
        window.location.href = '/login';
    }

return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
<h1>Dashboard AGOYO STOCK</h1>
<button onClick={handleLogout} style={{ marginBottom: 16 }}>Logout</button>
<p>Kelola stok AGOYO STOCK, PO ke supplier, dan request dari cabang AGOYO.</p>
<ul>
    <li><Link href="/gudang/stok">Stok AGOYO STOCK</Link></li>
    <li><Link href="/gudang/po-eksternal">PO Eksternal</Link></li>
    <li><Link href="/gudang/request">Request dari Cabang</Link></li>
    </ul>
    </main>
);
}
