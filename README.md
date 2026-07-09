Agoyohpp

Sistem manajemen AGOYO STOCK (inbound/outbound) dan kasir (POS) untuk 1 AGOYO STOCK pusat yang melayani 3 cabang AGOYO.

STACK TEKNOLOGI

Next.js (frontend dan backend API dalam satu project). Supabase (database PostgreSQL, autentikasi, dan siap untuk fitur realtime).

STRUKTUR PROJECT

app/login: halaman login dengan pengarahan otomatis sesuai role (admin, gudang, kasir, staff). app/admin: dashboard admin (akses penuh). app/gudang: dashboard AGOYO STOCK (stok, PO eksternal, request dari cabang AGOYO). app/kasir: dashboard kasir POS. app/staff: dashboard staff (lihat stok cabang AGOYO). lib/supabaseClient.js: koneksi ke Supabase. supabase/schema.sql: skema database lengkap (jalankan di SQL Editor Supabase).

CARA MULAI DEVELOPMENT

Pertama, buat akun gratis di supabase.com, lalu buat project baru. Kedua, di dashboard Supabase, buka SQL Editor lalu jalankan isi file supabase/schema.sql untuk membuat semua tabel. Ketiga, di dashboard Supabase, buka Project Settings > API untuk menyalin Project URL dan anon public key. Keempat, clone repo ini ke komputer, lalu jalankan npm install. Kelima, copy file .env.local.example menjadi .env.local, lalu isi dengan Project URL dan anon key dari langkah sebelumnya. Keenam, jalankan npm run dev untuk menjalankan aplikasi secara lokal di http://localhost:3000. Ketujuh, untuk deploy gratis, hubungkan repo ini ke akun Vercel (vercel.com) dan tambahkan environment variable yang sama seperti di .env.local.

STATUS PENGEMBANGAN

Project masih dalam tahap awal. Modul stok AGOYO STOCK, PO eksternal, request internal, transfer antar lokasi, dan transaksi kasir AGOYO akan dibangun secara bertahap.
