-- Skema database untuk sistem gudang + POS coffee shop (agoyohpp)
-- Dijalankan di Supabase SQL Editor

create extension if not exists "pgcrypto";

-- Master data
create table branches (id uuid primary key default gen_random_uuid(), name text not null, type text not null check (type in ('warehouse','branch')), address text, created_at timestamptz default now());

create table products (id uuid primary key default gen_random_uuid(), name text not null, unit text not null, category text, created_at timestamptz default now());

create table users (id uuid primary key default gen_random_uuid(), auth_user_id uuid references auth.users(id), name text not null, role text not null check (role in ('admin','gudang','kasir','staff')), branch_id uuid references branches(id), created_at timestamptz default now());

-- Stok
create table warehouse_stock (id uuid primary key default gen_random_uuid(), product_id uuid references products(id), quantity numeric not null default 0, updated_at timestamptz default now());

create table branch_stock (id uuid primary key default gen_random_uuid(), branch_id uuid references branches(id), product_id uuid references products(id), quantity numeric not null default 0, updated_at timestamptz default now());

-- PO Eksternal (gudang ke supplier)
create table external_po (id uuid primary key default gen_random_uuid(), po_number text not null, supplier_name text not null, status text not null default 'draft' check (status in ('draft','dipesan','diterima','dibatalkan')), created_by uuid references users(id), created_at timestamptz default now());

create table external_po_items (id uuid primary key default gen_random_uuid(), external_po_id uuid references external_po(id) on delete cascade, product_id uuid references products(id), quantity numeric not null, price numeric, received_quantity numeric default 0);

-- Request Internal (cabang ke gudang)
create table internal_request (id uuid primary key default gen_random_uuid(), branch_id uuid references branches(id), requested_by uuid references users(id), status text not null default 'pending' check (status in ('pending','disetujui','dikirim','ditolak')), created_at timestamptz default now());

create table internal_request_items (id uuid primary key default gen_random_uuid(), internal_request_id uuid references internal_request(id) on delete cascade, product_id uuid references products(id), quantity_requested numeric not null, quantity_approved numeric);

-- Transfer stok gudang -> cabang
create table stock_transfer (id uuid primary key default gen_random_uuid(), from_branch_id uuid references branches(id), to_branch_id uuid references branches(id), internal_request_id uuid references internal_request(id), status text not null default 'dikirim' check (status in ('dikirim','diterima')), created_by uuid references users(id), created_at timestamptz default now());

create table stock_transfer_items (id uuid primary key default gen_random_uuid(), stock_transfer_id uuid references stock_transfer(id) on delete cascade, product_id uuid references products(id), quantity numeric not null);

-- Menu & resep (bill of materials)
create table menu_items (id uuid primary key default gen_random_uuid(), name text not null, price numeric not null, category text, is_active boolean default true, created_at timestamptz default now());

create table recipes (id uuid primary key default gen_random_uuid(), menu_item_id uuid references menu_items(id) on delete cascade, product_id uuid references products(id), quantity_used numeric not null);

-- Transaksi kasir/POS
create table pos_transactions (id uuid primary key default gen_random_uuid(), branch_id uuid references branches(id), cashier_id uuid references users(id), total_amount numeric not null default 0, payment_method text, created_at timestamptz default now());

create table pos_transaction_items (id uuid primary key default gen_random_uuid(), pos_transaction_id uuid references pos_transactions(id) on delete cascade, menu_item_id uuid references menu_items(id), quantity numeric not null, price numeric not null);
