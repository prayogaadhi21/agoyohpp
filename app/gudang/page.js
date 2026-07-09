import Link from 'next/link';

export default function GudangPage() {
  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
<h1>Dashboard Gudang</h1>
<p>Kelola stok gudang, PO ke supplier, dan request dari cabang coffee shop.</p>
<ul>
  <li><Link href="/gudang/stok">Stok Gudang</Link></li>
  <li><Link href="/gudang/po-eksternal">PO Eksternal</Link></li>
  <li><Link href="/gudang/request">Request dari Cabang</Link></li>
  </ul>
  </main>
);
}
