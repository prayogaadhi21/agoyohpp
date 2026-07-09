# Agoyohpp

Sistem manajemen gudang (inbound/outbound) dan kasir (POS) untuk 1 gudang pusat yang melayani 3 cabang coffee shop.

## Stack teknologi

- Next.js (frontend dan backend API dalam satu project)
- Supabase (database PostgreSQL, autentikasi, dan siap untuk fitur realtime)

## Struktur project

- app/login - halaman login dengan pengarahan otomatis sesuai role (admin, gudang, kasir, staff)
- app/admin - dashboard admin (akses penuh)
- app/gudang - dashboard gudang (stok, PO eksternal, request dari cabang)
- app/kasir - dashboard kasir POS
- app/staff - dashboard staff (lihat stok cabang)
- lib/supabaseClient.js - koneksi ke Supabase
- supabase/schema.sql - skema database lengkap (jalankan di SQL Editor Supabase)

## Cara mulai development

1. Buat akun gratis di supabase.com, lalu buat project baru.
2. Di dashboard Supabase, buka SQL Editor lalu jalankan isi file supabase/schema.sql untuk membuat semua tabel.
3. Di dashboard Supabase, buka Project Settings > API untuk menyalin Project URL dan anon public key.
4. Clone repo ini ke komputer, lalu jalankan npm install.
5. Copy file .env.local.example menjadi .env.local, lalu isi dengan Project URL dan anon key dari langkah 3.
6. Jalankan npm run dev untuk menjalankan aplikasi secara lokal di http://localhost:3000
7. Untuk deploy gratis, hubungkan repo ini ke akun Vercel (vercel.com) dan tambahkan environment variable yang sama seperti di .env.local.

## Status pengembangan

Project masih dalam tahap awal. Modul stok, PO eksternal, request internal, transfer antar lokasi, dan transaksi kasir akan dibangun secara bertahap.
