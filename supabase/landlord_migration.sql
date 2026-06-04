-- ============================================================
-- MIGRATION: Quản lý tiền thuê nhà từ chủ nhà
-- Chạy file này trong Supabase → SQL Editor
-- ============================================================

-- Hợp đồng thuê nhà từ chủ nhà (1 contract per building)
create table if not exists landlord_contracts (
  id            uuid primary key default gen_random_uuid(),
  building_id   text references buildings(id) on delete cascade,
  start_date    text,
  end_date      text,
  monthly_rent  bigint default 0,
  deposit       bigint default 0,
  payment_day   int default 1,
  pay_frequency text default 'monthly' check (pay_frequency in ('monthly', 'quarterly', 'biannual')),
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Lịch sử thanh toán cho chủ nhà
create table if not exists landlord_payments (
  id           uuid primary key default gen_random_uuid(),
  contract_id  uuid references landlord_contracts(id) on delete cascade,
  building_id  text references buildings(id) on delete cascade,
  period_label text not null,
  period_from  text,
  period_to    text,
  amount       bigint not null,
  due_date     text,
  paid_date    text,
  paid         boolean default false,
  notes        text,
  created_at   timestamptz default now()
);

-- Chi phí đầu tư / cải tạo
create table if not exists building_investments (
  id          uuid primary key default gen_random_uuid(),
  building_id text references buildings(id) on delete cascade,
  inv_date    text not null,
  category    text default 'other',
  description text not null,
  amount      bigint not null,
  created_at  timestamptz default now()
);

alter table landlord_contracts disable row level security;
alter table landlord_payments disable row level security;
alter table building_investments disable row level security;
