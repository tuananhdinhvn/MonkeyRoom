-- ============================================================
-- SCHEMA: Quản lý phòng trọ
-- Chạy file này trong Supabase → SQL Editor
-- ============================================================

-- ── 1. CHỦ NHÀ ───────────────────────────────────────────
create table if not exists owners (
  id         text primary key default 'owner-001',
  name       text not null,
  phone      text,
  email      text,
  created_at timestamptz default now()
);

-- ── 2. NHÂN VIÊN ─────────────────────────────────────────
create table if not exists staff (
  id         text primary key,     -- '1', '2', '3', '4'
  owner_id   text references owners(id) on delete cascade,
  name       text not null,
  phone      text,
  role       text check (role in ('manager','staff')) default 'staff',
  dob        text,
  id_card    text,
  gender     text check (gender in ('male','female')),
  avatar_url text,
  active     boolean default true,
  manager_id text references staff(id),
  created_at timestamptz default now()
);

create table if not exists staff_permissions (
  staff_id   text references staff(id) on delete cascade,
  permission text not null,
  primary key (staff_id, permission)
);

-- ── 3. TÒA NHÀ ───────────────────────────────────────────
create table if not exists buildings (
  id         text primary key,     -- 'b1', 'b2', 'b3', 'b4'
  owner_id   text references owners(id) on delete cascade,
  staff_id   text references staff(id),
  name       text not null,
  code       text not null,        -- 'GHA', 'BLS', 'SRH', 'OVD'
  address    text,
  images     text[],
  created_at timestamptz default now()
);

-- ── 4. PHÒNG ─────────────────────────────────────────────
create table if not exists rooms (
  id          text primary key,    -- 'b1-1-101', 'b2-3-302'
  building_id text references buildings(id) on delete cascade,
  floor       int  not null,
  room_number text not null,       -- '101', '202' (hiển thị)
  type        text,
  area_m2     int,
  price       int  not null default 0,
  status      text default 'empty'
              check (status in ('occupied','empty','maintenance','urgent')),
  empty_since text,
  images      text[],
  created_at  timestamptz default now()
);

-- ── 5. KHÁCH THUÊ ────────────────────────────────────────
create table if not exists tenants (
  id          uuid primary key default gen_random_uuid(),
  room_id     text references rooms(id) on delete set null,
  name        text not null,
  phone       text,
  cccd        text,
  dob         text,
  email       text,
  gender      text,
  since_date  text,
  cccd_images text[],
  created_at  timestamptz default now()
);

create table if not exists roommates (
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id) on delete cascade,
  name      text not null,
  cccd      text
);

-- ── 6. TIN NHẮN / SỰ CỐ ─────────────────────────────────
create table if not exists messages (
  id           uuid primary key default gen_random_uuid(),
  room_id      text references rooms(id) on delete cascade,
  tenant_id    uuid references tenants(id),
  text         text not null,
  sent_at      text,
  resolved     boolean default false,
  resolved_at  text,
  resolved_by  text references staff(id),
  resolve_type text check (resolve_type in ('self','contractor','staff')),
  resolve_note text
);

create table if not exists issues (
  id          uuid primary key default gen_random_uuid(),
  room_id     text references rooms(id) on delete cascade,
  message_id  uuid references messages(id),
  title       text not null,
  reported_at text,
  resolved    boolean default false
);

-- ── 7. THANH TOÁN ────────────────────────────────────────
create table if not exists payments (
  id           uuid primary key default gen_random_uuid(),
  room_id      text references rooms(id) on delete cascade,
  tenant_id    uuid references tenants(id),
  month        text not null,      -- '04/2026'
  amount       int,
  paid         boolean default false,
  paid_at      text,
  method       text,
  collected_by text references staff(id),
  unique (room_id, month)          -- mỗi phòng chỉ có 1 bản ghi/tháng
);

-- ── 8. LỊCH SỬ KHÁCH CŨ ─────────────────────────────────
create table if not exists tenant_history (
  id               uuid primary key default gen_random_uuid(),
  room_id          text references rooms(id),
  building_id      text references buildings(id),
  tenant_name      text,
  tenant_phone     text,
  tenant_cccd      text,
  since_date       text,
  move_out_date    text,
  move_out_reason  text,
  created_at       timestamptz default now()
);

-- ── 9. THÔNG BÁO ─────────────────────────────────────────
create table if not exists notifications (
  id        uuid primary key default gen_random_uuid(),
  sender_id text references staff(id),
  title     text not null,
  content   text not null,
  target    text check (target in ('all','building','room')),
  target_id text,
  sent_at   timestamptz default now()
);

-- ============================================================
-- BẬT REAL-TIME
-- ============================================================
alter publication supabase_realtime add table buildings;
alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table tenants;
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table issues;
alter publication supabase_realtime add table payments;
alter publication supabase_realtime add table notifications;

-- ============================================================
-- TẮT RLS (Row Level Security) cho môi trường dev
-- ⚠️  Bật lại và cấu hình policies trước khi lên production
-- ============================================================
alter table owners           disable row level security;
alter table staff            disable row level security;
alter table staff_permissions disable row level security;
alter table buildings        disable row level security;
alter table rooms            disable row level security;
alter table tenants          disable row level security;
alter table roommates        disable row level security;
alter table messages         disable row level security;
alter table issues           disable row level security;
alter table payments         disable row level security;
alter table tenant_history   disable row level security;
alter table notifications    disable row level security;
