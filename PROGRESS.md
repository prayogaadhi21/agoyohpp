PROGRESS PROJECT - Gudang & Kasir AGOYO

Catatan ini dibuat supaya siapapun (atau Claude versi apapun: Claude Code, Claude di browser, dsb) yang membuka repo ini bisa langsung paham progress project tanpa perlu histori chat sebelumnya.

=== LATAR BELAKANG BISNIS ===

Website ini dibuat untuk kebutuhan: 1 gudang pusat yang melayani 3 cabang coffee shop; pencatatan stock aktual gudang per hari; PO Eksternal yaitu gudang membeli kebutuhan yang berkurang/habis di stock gudang tanpa alur approval terpisah (tim gudang bisa input langsung); PO Internal (Request) yaitu permintaan barang dari coffee shop ke gudang; transfer stock antar gudang ke cabang, di mana begitu dikirim kepemilikan stock pindah dari warehouse_stock ke branch_stock; Kasir/POS untuk penjualan langsung ke pelanggan di tiap cabang; dan saat transaksi kasir, stock cabang otomatis berkurang berdasarkan resep (bill of materials) yang sudah dibakukan per menu.

=== ROLE DAN AKSES ===

Admin memiliki akses penuh ke semua modul. Gudang mengelola stock gudang, PO Eksternal, dan melihat/memproses request dari cabang. Kasir hanya memiliki akses ke menu Kasir POS dan terikat ke satu cabang tertentu. Staff hanya bisa melihat stock di gudang cabang tempat dia bertugas.

Catatan teknis tambahan dari owner project: owner adalah pengguna awam secara teknis, jadi semua penjelasan harus sederhana dan implementasi dikerjakan langsung oleh Claude. Refresh manual (bukan realtime websocket) sudah cukup, tidak perlu infra realtime. Prioritas menggunakan layanan gratis dulu (Supabase free tier dan Vercel free tier).

=== KEPUTUSAN TEKNIS (STACK) ===

Frontend dan backend menggunakan Next.js 14 (App Router). Database dan Auth menggunakan Supabase (Postgres + Auth), free tier. Hosting menggunakan Vercel, free tier. Struktur folder mengikuti pola app/(nama-role)/... untuk tiap dashboard role.

=== STRUKTUR DATABASE (supabase/schema.sql) ===

Tabel yang sudah dibuat: branches, products, users, warehouse_stock, branch_stock, external_po, external_po_items, internal_request, internal_request_items, stock_transfer, stock_transfer_items, menu_items, recipes (bill of materials yang menghubungkan menu_items ke products dengan takaran), pos_transactions, dan pos_transaction_items.

=== MODUL YANG SUDAH SELESAI (sudah di-commit ke repo) ===

Fondasi project yang sudah dibuat: supabase/schema.sql (seluruh skema database), package.json, .gitignore, next.config.js, .env.local.example, lib/supabaseClient.js (koneksi ke Supabase), app/layout.js (root layout), app/page.js (redirect otomatis ke halaman login), app/login/page.js (form login yang mendeteksi role user dan redirect ke dashboard sesuai role), serta README.md (panduan setup Supabase, install, run local, dan deploy ke Vercel).

Dashboard placeholder yang masih berupa halaman kosong (belum ada fitur): app/admin/page.js dan app/staff/page.js.

Modul Gudang sudah lengkap, terdiri dari: app/gudang/page.js (dashboard dengan navigasi ke 3 sub halaman), app/gudang/stok/page.js (tampilan stock gudang, join warehouse_stock dengan products), app/gudang/po-eksternal/page.js (daftar PO Eksternal), app/gudang/po-eksternal/baru/page.js (form membuat PO Eksternal baru dengan multi item), dan app/gudang/request/page.js (daftar request/PO Internal dari cabang dengan tombol "Setujui dan Kirim" yang otomatis membuat stock_transfer, mengurangi warehouse_stock, menambah branch_stock, dan update status request).

Modul Kasir/POS sudah lengkap di app/kasir/page.js: menampilkan menu dari menu_items (yang aktif saja), kasir bisa klik menu untuk menambah ke keranjang, atur jumlah tiap item, lihat total harga, lalu klik "Proses Transaksi". Saat transaksi diproses: sistem menyimpan data ke pos_transactions dan pos_transaction_items, lalu otomatis membaca resep tiap menu dari tabel recipes dan mengurangi branch_stock cabang tempat kasir bertugas sesuai takaran resep dikali jumlah terjual. Profil kasir (nama, id, dan cabang) diambil otomatis dari akun yang sedang login lewat tabel users.

Catatan teknis yang perlu diperbaiki nanti: logika transfer stock di app/gudang/request/page.js dan logika pengurangan stock di app/kasir/page.js masih berupa beberapa query Supabase berurutan, belum atomic transaction/RPC. Ini aman untuk versi awal, tapi sebaiknya diperbaiki nanti supaya lebih tahan terhadap error di tengah proses (misalnya kalau koneksi terputus di tengah transaksi).

=== MODUL YANG BELUM DIKERJAKAN ===

Modul Staff (app/staff/page.js masih placeholder): perlu tampilan stock cabang yang bersifat read-only.

Modul Admin (app/admin/page.js masih placeholder): perlu dashboard ringkasan semua data (stock gudang, stock cabang, PO, request, transaksi kasir).

Setup Supabase project oleh owner (buat akun, jalankan schema.sql, isi .env.local) belum pernah dilakukan dan harus dikerjakan oleh owner sendiri.

Deploy ke Vercel belum dilakukan.

Pengujian end-to-end (login sungguhan, transaksi kasir sungguhan) belum bisa dilakukan karena Supabase belum di-setup.

=== LANGKAH SELANJUTNYA ===

Ada dua opsi yang bisa dipilih untuk dilanjutkan: lanjut membangun modul Staff dan Admin, atau setup Supabase (buat akun, jalankan schema, konfigurasi .env.local) supaya project bisa mulai dites/dijalankan.

=== CARA MELANJUTKAN PROJECT INI DI LAIN WAKTU ===

Repo ini (prayogaadhi21/agoyohpp) adalah satu-satunya sumber kebenaran untuk kode project. Kapanpun, dengan Claude versi apapun (Claude Code, Claude di browser, atau developer lain), cukup buka repo ini dan baca file PROGRESS.md ini untuk tahu persis apa yang sudah selesai dan apa langkah selanjutnya, tanpa perlu mengulang dari awal.
