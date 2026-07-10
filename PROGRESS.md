PROGRESS PROJECT - Gudang & Kasir Coffee Shop

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

Modul Gudang sudah lengkap, terdiri dari: app/gudang/page.js (dashboard dengan navigasi ke 3 sub halaman), app/gudang/po-eksternal/page.js (daftar PO Eksternal), app/gudang/po-eksternal/baru/page.js (form membuat PO Eksternal baru dengan multi item), dan app/gudang/request/page.js (daftar request/PO Internal dari cabang dengan tombol "Setujui dan Kirim" yang otomatis membuat stock_transfer, mengurangi warehouse_stock, menambah branch_stock, dan update status request).

Modul Kasir/POS sudah lengkap di app/kasir/page.js: menampilkan menu dari menu_items (yang aktif saja), kasir bisa klik menu untuk menambah ke keranjang, atur jumlah tiap item, lihat total harga, lalu klik "Proses Transaksi". Saat transaksi diproses: sistem menyimpan data ke pos_transactions dan pos_transaction_items, lalu otomatis membaca resep tiap menu dari tabel recipes dan mengurangi branch_stock cabang tempat kasir bertugas sesuai takaran resep dikali jumlah terjual. Profil kasir (nama, id, dan cabang) diambil otomatis dari akun yang sedang login lewat tabel users.

Modul Staff sudah selesai di app/staff/page.js: menampilkan profil staff (nama dan cabang) yang diambil otomatis dari akun yang sedang login lewat tabel users, lalu menampilkan stock cabang tersebut (join branch_stock dengan products) dalam bentuk tabel read-only. Staff tidak bisa mengubah data apapun di halaman ini.

Modul Admin sudah selesai di app/admin/page.js: dashboard ringkasan yang menampilkan lima bagian sekaligus, yaitu stock gudang (warehouse_stock join products), stock semua cabang (branch_stock join branches dan products), 10 PO Eksternal terbaru, 10 request/PO Internal dari cabang terbaru, dan 10 transaksi kasir terbaru lengkap dengan total pendapatan dari transaksi yang ditampilkan. Semua data diambil paralel dengan Promise.all supaya loading lebih cepat.

Setup Supabase project oleh owner sudah selesai: owner membuat project bernama AGOYO (region Tokyo, free tier) di alamat gwqveulolefenfseopda.supabase.co, lalu seluruh isi supabase/schema.sql sudah dijalankan lewat SQL Editor sehingga 15 tabel sudah tersedia di database sungguhan. Owner juga sudah install Git dan Node.js di komputernya, clone repo ke lokal, jalankan npm install, dan membuat file .env.local berisi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sesuai project AGOYO tersebut. Server lokal (npm run dev) sudah berhasil jalan.

Data awal (seed data) sudah diisi ke database lewat SQL Editor: 4 baris di tabel branches (1 gudang pusat "AGOYO STOCK Pusat" bertipe warehouse, dan 3 cabang coffee shop bertipe branch: Kemang, Kelapa Gading, BSD), 8 baris di tabel products (bahan baku seperti Kopi Arabika, Kopi Robusta, Susu UHT, Gula Aren, Sirup Vanilla, Bubuk Coklat, serta kemasan Cup 12oz dan Cup 16oz), dan 8 baris di tabel warehouse_stock (stock awal gudang untuk masing-masing produk tersebut). Stock cabang (branch_stock) sengaja dibiarkan kosong dulu karena secara bisnis stock baru berpindah ke cabang lewat proses transfer, bukan diisi langsung.

Semua role sekarang sudah punya user dan sudah dites login: admin (prayogaadhidewabrata@gmail.com, sudah berhasil masuk ke dashboard /admin), gudang (boya@boya.com, tidak terikat cabang tertentu), kasir (cahyani@sri.com, terikat ke cabang AGOYO Coffee - Kemang), dan staff (rafasya@hayyan.com, terikat ke cabang AGOYO Coffee - Kelapa Gading). Setiap user dibuat lewat Supabase Authentication (Add user) oleh owner sendiri, lalu baris terkait di-insert ke tabel users dengan auth_user_id yang sama dan role/branch_id yang sesuai.

Data menu dan resep juga sudah diisi supaya modul Kasir bisa dites transaksinya: 5 baris di menu_items (Espresso, Cappuccino, Cafe Latte, Kopi Susu Gula Aren, Chocolate) dan 15 baris di recipes yang menghubungkan tiap menu ke bahan baku serta jumlah yang terpakai per porsi.

Catatan teknis yang perlu diperbaiki nanti: logika transfer stock di app/gudang/request/page.js dan logika pengurangan stock di app/kasir/page.js masih berupa beberapa query Supabase berurutan, belum atomic transaction/RPC. Ini aman untuk versi awal, tapi sebaiknya diperbaiki nanti supaya lebih tahan terhadap error di tengah proses (misalnya kalau koneksi terputus di tengah transaksi).

Catatan tambahan: link "Stok AGOYO STOCK" di dashboard Gudang (app/gudang/page.js) mengarah ke app/gudang/stok/page.js, namun file tersebut belum pernah dibuat di repo ini sehingga saat ini akan menampilkan halaman 404. Ini perlu dibuat menyusul.

Proses deploy ke Vercel sudah dimulai: owner sudah membuat akun Vercel (namespace "agoyo", masuk masa Pro Trial) menggunakan login GitHub. Owner sedang dalam proses instalasi GitHub App Vercel (klik "Install" di halaman vercel.com/new) supaya Vercel bisa mengakses repo agoyohpp untuk diimport. Proses import project, pengisian environment variable (NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY), dan klik Deploy belum dilakukan karena masih menunggu instalasi GitHub App tersebut selesai.

=== MODUL YANG BELUM DIKERJAKAN ===

Halaman app/gudang/stok/page.js (tampilan stock gudang) belum ada, padahal sudah ada link ke halaman itu dari dashboard Gudang.

Pengujian end-to-end untuk role gudang, kasir, dan staff (login sungguhan dan mencoba fitur masing-masing seperti membuat PO Eksternal, memproses transaksi kasir, atau melihat stock cabang) belum dilakukan, meskipun user dan data pendukungnya sudah siap.

Deploy ke Vercel belum selesai, masih menunggu instalasi GitHub App Vercel oleh owner, lalu import project, isi environment variables, dan klik Deploy.

=== LANGKAH SELANJUTNYA ===

Ada beberapa opsi yang bisa dipilih untuk dilanjutkan: melanjutkan proses deploy ke Vercel (lanjut dari instalasi GitHub App), melakukan pengujian end-to-end tiap role (login sebagai gudang/kasir/staff dan mencoba fitur masing-masing), atau membuat halaman app/gudang/stok/page.js yang masih hilang.

=== CARA MELANJUTKAN PROJECT INI DI LAIN WAKTU ===

Repo ini (prayogaadhi21/agoyohpp) adalah satu-satunya sumber kebenaran untuk kode project. Kapanpun, dengan Claude versi apapun (Claude Code, Claude di browser, atau developer lain), cukup buka repo ini dan baca file PROGRESS.md ini untuk tahu persis apa yang sudah selesai dan apa langkah selanjutnya, tanpa perlu mengulang dari awal.
