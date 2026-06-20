-- ============================================================
-- DỌN DỮ LIỆU TRÙNG LẶP KHÁCH HÀNG
-- Chạy từng block trong Supabase → SQL Editor
-- Lưu ý: Chạy BƯỚC 1 trước để xem trước, sau đó mới xóa
-- ============================================================

-- BƯỚC 1: Xem trước khách đang ở bị trùng với lịch sử (CCCD hoặc SĐT)
SELECT
  th.id            AS history_id,
  th.tenant_name   AS history_name,
  th.tenant_phone  AS history_phone,
  th.tenant_cccd   AS history_cccd,
  t.name           AS active_name,
  t.phone          AS active_phone,
  t.cccd           AS active_cccd,
  CASE
    WHEN th.tenant_cccd = t.cccd   THEN 'CCCD trùng'
    WHEN th.tenant_phone = t.phone THEN 'SĐT trùng'
  END AS reason
FROM tenant_history th
JOIN tenants t ON (
  (th.tenant_cccd  IS NOT NULL AND th.tenant_cccd  <> '' AND th.tenant_cccd  = t.cccd)
  OR
  (th.tenant_phone IS NOT NULL AND th.tenant_phone <> '' AND th.tenant_phone = t.phone)
);

-- ============================================================
-- BƯỚC 2: Xóa lịch sử của khách đang thuê hiện tại
-- (trùng CCCD HOẶC trùng SĐT với bản ghi trong tenants)
DELETE FROM tenant_history
WHERE id IN (
  SELECT DISTINCT th.id
  FROM tenant_history th
  WHERE
    (th.tenant_cccd IS NOT NULL AND th.tenant_cccd <> '' AND th.tenant_cccd IN (
      SELECT cccd FROM tenants WHERE cccd IS NOT NULL AND cccd <> ''
    ))
    OR
    (th.tenant_phone IS NOT NULL AND th.tenant_phone <> '' AND th.tenant_phone IN (
      SELECT phone FROM tenants WHERE phone IS NOT NULL AND phone <> ''
    ))
);

-- ============================================================
-- BƯỚC 3: Xóa trùng CCCD trong tenant_history (giữ bản mới nhất)
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY tenant_cccd
      ORDER BY created_at DESC NULLS LAST
    ) AS rn
  FROM tenant_history
  WHERE tenant_cccd IS NOT NULL AND tenant_cccd <> ''
)
DELETE FROM tenant_history WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- ============================================================
-- BƯỚC 4: Xóa trùng SĐT trong tenant_history (giữ bản mới nhất)
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY tenant_phone
      ORDER BY created_at DESC NULLS LAST
    ) AS rn
  FROM tenant_history
  WHERE tenant_phone IS NOT NULL AND tenant_phone <> ''
)
DELETE FROM tenant_history WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- ============================================================
-- BƯỚC 5: Xóa trùng CCCD trong tenants (ưu tiên giữ bản có room_id)
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY cccd
      ORDER BY
        CASE WHEN room_id IS NOT NULL THEN 0 ELSE 1 END,
        created_at DESC NULLS LAST
    ) AS rn
  FROM tenants
  WHERE cccd IS NOT NULL AND cccd <> ''
)
DELETE FROM tenants WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- ============================================================
-- BƯỚC 6: Xóa trùng SĐT trong tenants (ưu tiên giữ bản có room_id)
WITH ranked AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY phone
      ORDER BY
        CASE WHEN room_id IS NOT NULL THEN 0 ELSE 1 END,
        created_at DESC NULLS LAST
    ) AS rn
  FROM tenants
  WHERE phone IS NOT NULL AND phone <> ''
)
DELETE FROM tenants WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- ============================================================
-- KIỂM TRA KẾT QUẢ
SELECT 'tenants (đang ở)' AS tbl, count(*) AS so_luong FROM tenants
UNION ALL
SELECT 'tenant_history (khách cũ)', count(*) FROM tenant_history;
