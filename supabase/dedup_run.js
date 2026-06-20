/**
 * Dọn dữ liệu khách hàng cũ bị trùng với khách đang thuê
 * Chạy: node supabase/dedup_run.js
 */
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gkyjbonuahvpgkknzchh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWpib251YWh2cGdra256Y2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MzkzMTksImV4cCI6MjA5MzIxNTMxOX0.6oaleTXCvAoSpwtOWvslZt28g0BaCO3oJCNy0Lmg5gw'
);

async function run() {
  console.log('═══════════════════════════════════════════');
  console.log('  Dọn dữ liệu khách hàng trùng lặp');
  console.log('═══════════════════════════════════════════\n');

  // 1. Lấy toàn bộ khách đang thuê
  const { data: activeTenants, error: e1 } = await supabase
    .from('tenants')
    .select('id, name, phone, cccd');
  if (e1) { console.error('Lỗi lấy tenants:', e1.message); process.exit(1); }

  const activePhones = new Set(activeTenants.map(t => t.phone).filter(Boolean));
  const activeCccds  = new Set(activeTenants.map(t => t.cccd).filter(Boolean));

  console.log(`✅ Khách đang thuê: ${activeTenants.length} người`);
  console.log(`   SĐT đang dùng: ${activePhones.size} | CCCD đang dùng: ${activeCccds.size}\n`);

  // 2. Lấy toàn bộ lịch sử khách cũ
  const { data: history, error: e2 } = await supabase
    .from('tenant_history')
    .select('id, tenant_name, tenant_phone, tenant_cccd');
  if (e2) { console.error('Lỗi lấy tenant_history:', e2.message); process.exit(1); }

  console.log(`📋 Khách hàng cũ (lịch sử): ${history.length} bản ghi\n`);

  // 3. Tìm các bản ghi lịch sử bị trùng
  const toDelete = history.filter(h => {
    const phoneMatch = h.tenant_phone && activePhones.has(h.tenant_phone);
    const cccdMatch  = h.tenant_cccd  && activeCccds.has(h.tenant_cccd);
    return phoneMatch || cccdMatch;
  });

  if (toDelete.length === 0) {
    console.log('✨ Không có dữ liệu trùng lặp. Dữ liệu đã sạch!\n');
    return;
  }

  console.log(`⚠️  Tìm thấy ${toDelete.length} bản ghi lịch sử bị trùng với khách đang thuê:\n`);
  toDelete.forEach(h => {
    const reason = [];
    if (h.tenant_phone && activePhones.has(h.tenant_phone)) reason.push(`SĐT: ${h.tenant_phone}`);
    if (h.tenant_cccd  && activeCccds.has(h.tenant_cccd))  reason.push(`CCCD: ${h.tenant_cccd}`);
    console.log(`  - ${h.tenant_name || '(không tên)'} | ${reason.join(' | ')}`);
  });

  // 4. Xóa các bản ghi trùng
  console.log('\n🗑  Đang xóa...');
  const idsToDelete = toDelete.map(h => h.id);

  // Xóa theo từng batch 100 cái để tránh URL quá dài
  const batchSize = 100;
  let deleted = 0;
  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batch = idsToDelete.slice(i, i + batchSize);
    const { error: delErr } = await supabase
      .from('tenant_history')
      .delete()
      .in('id', batch);
    if (delErr) {
      console.error('Lỗi xóa batch:', delErr.message);
      process.exit(1);
    }
    deleted += batch.length;
  }

  console.log(`✅ Đã xóa ${deleted} bản ghi trùng lặp.\n`);

  // 5. Kiểm tra kết quả
  const { count } = await supabase
    .from('tenant_history')
    .select('*', { count: 'exact', head: true });
  console.log(`📊 Còn lại trong tenant_history: ${count} bản ghi`);
  console.log('\n═══════════════════════════════════════════');
  console.log('  Hoàn tất!');
  console.log('═══════════════════════════════════════════\n');
}

run().catch(err => {
  console.error('Lỗi không xác định:', err);
  process.exit(1);
});
