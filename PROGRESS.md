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

Modul Gudang sudah lengkap, terdiri dari: app/gudang/page.js (dashboard dengan navigasi ke 3 sub halaman dan tombol Logout), app/gudang/stok/page.js (tampilan stock gudang read-only, join warehouse_stock dengan products, menampilkan nama produk, kategori, jumlah, satuan, dan terakhir update), app/gudang/po-eksternal/page.js (daftar PO Eksternal), app/gudang/po-eksternal/baru/page.js (form membuat PO Eksternal baru dengan multi item), dan app/gudang/request/page.js (daftar request/PO Internal dari cabang dengan tombol "Setujui dan Kirim" yang otomatis membuat stock_transfer, mengurangi warehouse_stock, menambah branch_stock, dan update status request).

Modul Kasir/POS sudah lengkap di app/kasir/page.js: menampilkan menu dari menu_items (yang aktif saja), kasir bisa klik menu untuk menambah ke keranjang, atur jumlah tiap item, lihat total harga, lalu klik "Proses Transaksi". Saat transaksi diproses: sistem menyimpan data ke pos_transactions dan pos_transaction_items, lalu otomatis membaca resep tiap menu dari tabel recipes dan mengurangi branch_stock cabang tempat kasir bertugas sesuai takaran resep dikali jumlah terjual. Profil kasir (nama, id, dan cabang) diambil otomatis dari akun yang sedang login lewat tabel users. Halaman ini juga sudah punya tombol Logout.

Modul Staff sudah lengkap di app/staff/page.js: menampilkan stock cabang tempat staff bertugas secara read-only (produk, kategori, jumlah, satuan, terakhir update), dan tombol Logout.

Modul Admin sudah lengkap di app/admin/page.js: menampilkan ringkasan seluruh data (stock gudang, stock tiap cabang, PO Eksternal terbaru, request dari cabang terbaru, dan transaksi kasir terbaru dengan total pendapatan), dan tombol Logout.

Semua role sekarang sudah punya user dan sudah dites login: admin (prayogaadhidewabrata@gmail.com), gudang (boya@boya.com, tidak terikat cabang tertentu), kasir (cahyani@sri.com, terikat ke cabang AGOYO Coffee - Kemang), dan staff (rafasya@hayyan.com, terikat ke cabang AGOYO Coffee - Kelapa Gading). Setiap user dibuat lewat Supabase Authentication (Add user) oleh owner sendiri, lalu baris terkait di-insert ke tabel users dengan auth_user_id yang sama dan role/branch_id yang sesuai.

Data menu dan resep juga sudah diisi supaya modul Kasir bisa dites transaksinya: 5 baris di menu_items (Espresso, Cappuccino, Cafe Latte, Kopi Susu Gula Aren, Chocolate) dan 15 baris di recipes yang menghubungkan tiap menu ke bahan baku serta jumlah yang terpakai per porsi.

Deploy ke Vercel sudah selesai dan berhasil: project agoyohpp sudah di-import ke akun Vercel owner (team/namespace "agoyo") lewat GitHub App yang sudah terpasang. Environment variable NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY sudah diisi dengan nilai asli dari dashboard Supabase (Settings > API Keys > Legacy anon key), dan build berhasil tanpa error. Aplikasi sudah live dan bisa diakses di https://agoyohpp.vercel.app.

=== PENGUJIAN END-TO-END (SUDAH SELESAI) ===

Seluruh role sudah dites langsung di https://agoyohpp.vercel.app dengan login sungguhan oleh owner.

Role Gudang (boya@boya.com): dashboard tampil benar, halaman Stok AGOYO STOCK menampilkan 8 produk dengan jumlah dan satuan yang benar, halaman PO Eksternal berhasil menampilkan daftar dan berhasil membuat PO baru (contoh: PO-TEST-001), dan halaman Request dari Cabang tampil benar (kosong karena belum ada request masuk).

Role Kasir (cahyani@sri.com): berhasil menambah item ke keranjang dan memproses transaksi setelah dua bug diperbaiki (lihat bagian Bug di bawah). Transaksi berhasil tersimpan dan stock cabang otomatis berkurang sesuai resep.

Role Staff (rafasya@hayyan.com): dashboard menampilkan nama staff, cabang (AGOYO Coffee - Kelapa Gading), dan tabel stock cabang read-only. Tabel kosong karena cabang ini belum menerima stock transfer, ini bukan bug.

Role Admin (prayogaadhidewabrata@gmail.com): dashboard ringkasan menampilkan data stock gudang, PO Eksternal terbaru, request dari cabang, dan transaksi kasir terbaru dengan benar dan konsisten dengan pengujian role lain.

=== BUG YANG DITEMUKAN DAN SUDAH DIPERBAIKI ===

Saat pengujian role Kasir, ditemukan dua bug terkait ketidakcocokan nama kolom antara kode dan skema database. Pertama, saat insert ke tabel pos_transactions, kode mencoba menyimpan kolom "status" yang tidak ada di skema, dan memakai nama "total" padahal kolom sebenarnya bernama "total_amount". Sudah diperbaiki di commit 397c55b. Kedua, saat membaca resep dari tabel recipes untuk mengurangi stock cabang, kode memakai nama kolom "quantity" padahal kolom sebenarnya bernama "quantity_used". Sudah diperbaiki di commit 6afc519.

Setelah kedua perbaikan ini, transaksi kasir sudah diuji ulang dan berhasil sepenuhnya (transaksi tersimpan dan stock cabang berkurang otomatis).

=== FITUR TAMBAHAN: TOMBOL LOGOUT ===

Saat pengujian, ditemukan bahwa tidak ada satupun halaman (admin/gudang/kasir/staff) yang punya tombol logout. Fitur ini sudah ditambahkan ke keempat halaman dashboard tersebut (memanggil supabase.auth.signOut() lalu redirect ke halaman /login), sudah di-deploy dan diuji berhasil.

=== CATATAN TEKNIS YANG PERLU DIPERBAIKI NANTI (TIDAK MENDESAK) ===

Logika transfer stock di app/gudang/request/page.js dan logika pengurangan stock di app/kasir/page.js masih berupa beberapa query Supabase berurutan, belum atomic transaction/RPC. Ini aman untuk versi awal, tapi sebaiknya diperbaiki nanti supaya lebih tahan terhadap error di tengah proses (misalnya kalau koneksi terputus di tengah transaksi).

Catatan penting soal .env.local: saat proses deploy ditemukan bahwa file .env.local di komputer owner ternyata masih berisi teks placeholder/contoh untuk NEXT_PUBLIC_SUPABASE_ANON_KEY (bukan key asli). Environment variable di Vercel sendiri sudah benar dan tidak terpengaruh masalah ini, tapi owner perlu memperbarui file .env.local di lokal dengan anon key asli dari dashboard Supabase (Settings > API Keys > tab "Legacy anon, service_role API keys") kalau suatu saat ingin menjalankan development lokal (npm run dev). Owner sudah mengonfirmasi bahwa file .env.local di lokal sudah diperbarui dengan URL dan anon key asli dari Supabase, jadi masalah ini sudah selesai diperbaiki.

=== MODUL YANG BELUM DIKERJAKAN ===

Tidak ada modul besar yang belum dikerjakan. Semua fitur inti (Gudang, Kasir, Staff, Admin, login, logout) sudah selesai, di-deploy, dan diuji end-to-end berhasil.

=== LANGKAH SELANJUTNYA (OPSIONAL) ===

Beberapa hal opsional yang bisa dikerjakan berikutnya kalau owner mau: pertimbangkan mengubah logika transfer stock dan transaksi kasir jadi atomic transaction/RPC di Supabase, dan tambahkan lebih banyak data produk/menu/resep sesuai kebutuhan bisnis nyata.

=== CARA MELANJUTKAN PROJECT INI DI LAIN WAKTU ===

Repo ini (prayogaadhi21/agoyohpp) adalah satu-satunya sumber kebenaran untuk kode project. Kapanpun, dengan Claude versi apapun (Claude Code, Claude di browser, atau developer lain), cukup buka repo ini dan baca file PROGRESS.md ini untuk tahu persis apa yang sudah selesai dan apa langkah selanjutnya, tanpa perlu mengulang dari awal.
