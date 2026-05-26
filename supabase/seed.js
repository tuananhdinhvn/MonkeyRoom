/**
 * SEED SCRIPT — nhập toàn bộ dữ liệu demo vào Supabase
 *
 * Cách chạy:
 *   1. Điền SUPABASE_URL và SUPABASE_KEY bên dưới
 *      (lấy tại: supabase.com → Project Settings → API)
 *   2. node supabase/seed.js
 */

const SUPABASE_URL = 'https://gkyjbonuahvpgkknzchh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWpib251YWh2cGdra256Y2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MzkzMTksImV4cCI6MjA5MzIxNTMxOX0.6oaleTXCvAoSpwtOWvslZt28g0BaCO3oJCNy0Lmg5gw';

// ─── Data (copy từ BuildingsContext + StaffScreen) ────────

const INIT_STAFF = [
  { id:'1', name:'Nguyễn Quản Lý', role:'manager', phone:'0901111222', dob:'15/03/1985', id_card:'012345678901', gender:'male',   active:true,  manager_id:null },
  { id:'2', name:'Trần Thị Thu',   role:'staff',   phone:'0912333444', dob:'20/07/1995', id_card:'098765432109', gender:'female', active:true,  manager_id:'1'  },
  { id:'3', name:'Nguyễn Văn Bảo', role:'staff',   phone:'0923555666', dob:'10/12/1993', id_card:'087654321098', gender:'male',   active:true,  manager_id:'1'  },
  { id:'4', name:'Lê Thị Hương',   role:'staff',   phone:'0934777888', dob:'05/06/1997', id_card:'076543210987', gender:'female', active:false, manager_id:null },
];

const STAFF_PERMS = {
  '1': ['perm.viewAll','perm.manageRooms','perm.manageCustomers','perm.collectPayment','perm.report'],
  '2': ['perm.viewRooms','perm.manageCustomers','perm.collectPayment'],
  '3': ['perm.viewRooms','perm.manageCustomers','perm.collectPayment'],
  '4': ['perm.viewRooms','perm.maintenance'],
};

const STAFF_BY_NAME = { 'Trần Thị Thu':'2', 'Nguyễn Văn Bảo':'3', 'Lê Thị Hương':'4' };

const INIT_BUILDINGS = [
  {
    id:'b1', name:'Nhà A - Green Home', code:'GHA', address:'12 Nguyễn Trãi, Q.1', staff:'Trần Thị Thu',
    floors:[
      { floor:1, rooms:[
        { id:'101', type:'Phòng đơn', area:'20m²', price:'3,500,000', status:'occupied',
          residents:1, tenant:'Nguyễn Văn An', tenantCccd:'052198001234', phone:'0912345678', sinceDate:'05/01/2025',
          roommates:[], cccdImages:[],
          messages:[{ id:'m-b1-1-101-1', text:'Vòi nước bị nhỏ giọt', time:'20/04/2026 09:12', resolved:false }],
          paymentHistory:[{ month:'04/2026', paid:false },{ month:'03/2026', paid:true }], currentIssue:null },
        { id:'102', type:'Phòng đôi', area:'28m²', price:'4,800,000', status:'urgent',
          residents:1, tenant:'Trương Văn Hải', tenantCccd:'077196034567', phone:'0977112233', sinceDate:'20/11/2025',
          roommates:[], cccdImages:[],
          messages:[{ id:'m-b1-1-102-1', text:'Trần nhà đang chảy nước, mưa vào phòng rất nhiều', time:'19/04/2026 07:30', resolved:false }],
          paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true }],
          currentIssue:{ title:'Trần nhà bị thấm nước nghiêm trọng', reportedAt:'19/04/2026 07:45' } },
        { id:'103', type:'Phòng đơn', area:'20m²', price:'3,500,000', status:'occupied',
          residents:1, tenant:'Trần Thị Bích', tenantCccd:'079199054321', phone:'0987654321', sinceDate:'15/03/2025',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true }], currentIssue:null },
        { id:'104', type:'Phòng đôi', area:'28m²', price:'4,800,000', status:'occupied',
          residents:2, tenant:'Vũ Thị Lan', tenantCccd:'066198055678', phone:'0966333444', sinceDate:'01/02/2026',
          roommates:[{ name:'Nguyễn Văn Tâm', cccd:'079201012345' }], cccdImages:[],
          messages:[{ id:'m-b1-1-104-1', text:'Bồn cầu bị tắc', time:'21/04/2026 22:05', resolved:false }],
          paymentHistory:[{ month:'04/2026', paid:false },{ month:'03/2026', paid:true }], currentIssue:null },
      ]},
      { floor:2, rooms:[
        { id:'201', type:'Studio', area:'35m²', price:'6,000,000', status:'occupied',
          residents:1, tenant:'Lê Minh Tuấn', tenantCccd:'075196078901', phone:'0909111222', sinceDate:'20/06/2024',
          roommates:[], cccdImages:[],
          messages:[],
          paymentHistory:[{ month:'04/2026', paid:false },{ month:'03/2026', paid:false }], currentIssue:null },
        { id:'202', type:'Phòng đôi', area:'28m²', price:'4,800,000', status:'maintenance',
          residents:1, tenant:'Phan Thị Thu', tenantCccd:'034199012345', phone:'0966444555', sinceDate:'05/06/2025',
          roommates:[], cccdImages:[],
          messages:[{ id:'m-b1-2-202-1', text:'Điện trong phòng bị chập, đèn đột ngột tắt hết', time:'15/03/2026 07:45', resolved:false }],
          paymentHistory:[{ month:'03/2026', paid:true },{ month:'02/2026', paid:true }],
          currentIssue:{ title:'Hệ thống điện bị chập — đang thay lại toàn bộ dây', reportedAt:'15/03/2026 08:00' } },
        { id:'203', type:'Studio', area:'35m²', price:'6,000,000', status:'empty',
          emptySince:'01/02/2026', tenant:null, phone:null, sinceDate:null,
          roommates:[], cccdImages:[], messages:[], paymentHistory:[], currentIssue:null },
        { id:'204', type:'Phòng đơn', area:'20m²', price:'3,500,000', status:'occupied',
          residents:1, tenant:'Đỗ Hữu Nghĩa', tenantCccd:'033200034567', phone:'0944222111', sinceDate:'10/08/2025',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true }], currentIssue:null },
      ]},
      { floor:3, rooms:[
        { id:'301', type:'Phòng đơn', area:'20m²', price:'3,500,000', status:'occupied',
          residents:1, tenant:'Phạm Thu Hà', tenantCccd:'001199067890', phone:'0978888999', sinceDate:'05/09/2024',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true }], currentIssue:null },
        { id:'302', type:'Phòng VIP', area:'45m²', price:'8,500,000', status:'occupied',
          residents:2, tenant:'Hoàng Đức Minh', tenantCccd:'001197043210', phone:'0933222111', sinceDate:'01/11/2024',
          roommates:[{ name:'Lê Thị Ngọc', cccd:'001201056789' }], cccdImages:[],
          messages:[{ id:'m-b1-3-302-1', text:'Thang máy tầng 3 kêu tiếng lạ', time:'22/04/2026 10:00', resolved:false }],
          paymentHistory:[{ month:'04/2026', paid:true }], currentIssue:null },
        { id:'303', type:'Studio', area:'35m²', price:'6,000,000', status:'empty',
          emptySince:'15/01/2026', tenant:null, phone:null, sinceDate:null,
          roommates:[], cccdImages:[], messages:[], paymentHistory:[], currentIssue:null },
      ]},
    ],
  },
  {
    id:'b2', name:'Nhà B - Blue Sky', code:'BLS', address:'45 Lê Lợi, Q.3', staff:'Nguyễn Văn Bảo',
    floors:[
      { floor:1, rooms:[
        { id:'101', type:'Phòng đơn', area:'22m²', price:'3,800,000', status:'occupied',
          residents:1, tenant:'Ngô Thanh Bình', tenantCccd:'079199001122', phone:'0901234567', sinceDate:'10/03/2025',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true }], currentIssue:null },
        { id:'102', type:'Phòng đôi', area:'30m²', price:'5,200,000', status:'occupied',
          residents:2, tenant:'Đinh Thị Lan', tenantCccd:'034200023456', phone:'0912111222', sinceDate:'01/07/2025',
          roommates:[{ name:'Trần Quốc Huy', cccd:'079202034567' }], cccdImages:[],
          messages:[{ id:'m-b2-1-102-1', text:'Điều hoà phòng bị hỏng, không mát được', time:'21/04/2026 14:30', resolved:false }],
          paymentHistory:[{ month:'04/2026', paid:false },{ month:'03/2026', paid:true }], currentIssue:null },
        { id:'103', type:'Phòng đơn', area:'22m²', price:'3,800,000', status:'empty',
          emptySince:'05/04/2026', tenant:null, phone:null, sinceDate:null,
          roommates:[], cccdImages:[], messages:[], paymentHistory:[], currentIssue:null },
        { id:'104', type:'Studio', area:'38m²', price:'6,200,000', status:'occupied',
          residents:1, tenant:'Lương Minh Phát', tenantCccd:'052198045678', phone:'0933456789', sinceDate:'15/01/2025',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true },{ month:'02/2026', paid:true }], currentIssue:null },
      ]},
      { floor:2, rooms:[
        { id:'201', type:'Phòng đôi', area:'30m²', price:'5,200,000', status:'occupied',
          residents:1, tenant:'Bùi Thị Hồng', tenantCccd:'060199056789', phone:'0944567890', sinceDate:'20/09/2025',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:false }], currentIssue:null },
        { id:'202', type:'Phòng đơn', area:'22m²', price:'3,800,000', status:'maintenance',
          residents:1, tenant:'Cao Văn Dũng', tenantCccd:'048200067890', phone:'0955678901', sinceDate:'10/11/2025',
          roommates:[], cccdImages:[],
          messages:[{ id:'m-b2-2-202-1', text:'Ống nước trong phòng tắm bị vỡ, nước chảy ra sàn', time:'22/04/2026 06:15', resolved:false }],
          paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true }],
          currentIssue:{ title:'Vỡ ống nước phòng tắm — đang thay ống mới', reportedAt:'22/04/2026 07:00' } },
        { id:'203', type:'Studio', area:'38m²', price:'6,200,000', status:'empty',
          emptySince:'01/03/2026', tenant:null, phone:null, sinceDate:null,
          roommates:[], cccdImages:[], messages:[], paymentHistory:[], currentIssue:null },
      ]},
      { floor:3, rooms:[
        { id:'301', type:'Phòng VIP', area:'48m²', price:'8,800,000', status:'occupied',
          residents:2, tenant:'Phan Hoàng Long', tenantCccd:'001198078901', phone:'0966789012', sinceDate:'05/05/2024',
          roommates:[{ name:'Vũ Thị Thu', cccd:'001201089012' }], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true }], currentIssue:null },
        { id:'302', type:'Phòng đơn', area:'22m²', price:'3,800,000', status:'urgent',
          residents:1, tenant:'Trịnh Công Sơn', tenantCccd:'079197090123', phone:'0977890123', sinceDate:'01/08/2025',
          roommates:[], cccdImages:[],
          messages:[{ id:'m-b2-3-302-1', text:'Cửa phòng bị hỏng khóa, không khoá được từ bên trong', time:'23/04/2026 22:00', resolved:false }],
          paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true }],
          currentIssue:{ title:'Khóa cửa phòng hỏng — cần thay khóa khẩn cấp', reportedAt:'23/04/2026 22:10' } },
        { id:'303', type:'Studio', area:'38m²', price:'6,200,000', status:'empty',
          emptySince:'20/02/2026', tenant:null, phone:null, sinceDate:null,
          roommates:[], cccdImages:[], messages:[], paymentHistory:[], currentIssue:null },
      ]},
    ],
  },
  {
    id:'b3', name:'Nhà C - Sunrise', code:'SRH', address:'78 Trần Hưng Đạo, Q.5', staff:'Lê Thị Hương',
    floors:[
      { floor:1, rooms:[
        { id:'101', type:'Phòng đơn', area:'20m²', price:'3,500,000', status:'occupied',
          residents:1, tenant:'Nguyễn Thị Mai', tenantCccd:'075200101234', phone:'0988012345', sinceDate:'01/04/2025',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true }], currentIssue:null },
        { id:'102', type:'Phòng đôi', area:'28m²', price:'4,800,000', status:'occupied',
          residents:2, tenant:'Hoàng Văn Khải', tenantCccd:'036199112345', phone:'0912345678', sinceDate:'15/06/2025',
          roommates:[{ name:'Lê Thị Phương', cccd:'036201123456' }], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:false },{ month:'03/2026', paid:true }], currentIssue:null },
        { id:'103', type:'Phòng đơn', area:'20m²', price:'3,500,000', status:'empty',
          emptySince:'10/04/2026', tenant:null, phone:null, sinceDate:null,
          roommates:[], cccdImages:[], messages:[], paymentHistory:[], currentIssue:null },
        { id:'104', type:'Phòng đôi', area:'28m²', price:'4,800,000', status:'occupied',
          residents:1, tenant:'Đặng Thị Tuyết', tenantCccd:'001200134567', phone:'0933234567', sinceDate:'20/02/2026',
          roommates:[], cccdImages:[],
          messages:[{ id:'m-b3-1-104-1', text:'Wifi phòng bị ngắt liên tục, không thể làm việc online', time:'20/04/2026 19:45', resolved:false }],
          paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true }], currentIssue:null },
      ]},
      { floor:2, rooms:[
        { id:'201', type:'Studio', area:'35m²', price:'6,000,000', status:'occupied',
          residents:1, tenant:'Lý Hồng Phúc', tenantCccd:'079200145678', phone:'0944345678', sinceDate:'01/10/2024',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true },{ month:'02/2026', paid:true }], currentIssue:null },
        { id:'202', type:'Phòng đôi', area:'28m²', price:'4,800,000', status:'maintenance',
          residents:1, tenant:'Vương Thị Linh', tenantCccd:'048199156789', phone:'0955456789', sinceDate:'05/03/2026',
          roommates:[], cccdImages:[],
          messages:[{ id:'m-b3-2-202-1', text:'Bóng đèn phòng ngủ bị cháy hết, phòng tối hoàn toàn', time:'22/04/2026 20:30', resolved:false }],
          paymentHistory:[{ month:'04/2026', paid:true }],
          currentIssue:{ title:'Hệ thống đèn hỏng — đang thay bóng và kiểm tra điện', reportedAt:'22/04/2026 21:00' } },
        { id:'203', type:'Studio', area:'35m²', price:'6,000,000', status:'occupied',
          residents:1, tenant:'Tô Minh Tuấn', tenantCccd:'052198167890', phone:'0966567890', sinceDate:'10/12/2024',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:false },{ month:'03/2026', paid:false }], currentIssue:null },
        { id:'204', type:'Phòng VIP', area:'50m²', price:'9,500,000', status:'empty',
          emptySince:'15/03/2026', tenant:null, phone:null, sinceDate:null,
          roommates:[], cccdImages:[], messages:[], paymentHistory:[], currentIssue:null },
      ]},
    ],
  },
  {
    id:'b4', name:'Nhà D - Ocean View', code:'OVD', address:'22 Võ Văn Tần, Q.3', staff:'Trần Thị Thu',
    floors:[
      { floor:1, rooms:[
        { id:'101', type:'Phòng đơn', area:'18m²', price:'3,200,000', status:'occupied',
          residents:1, tenant:'Phạm Văn Toàn', tenantCccd:'060199178901', phone:'0977678901', sinceDate:'01/02/2025',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true }], currentIssue:null },
        { id:'102', type:'Phòng đôi', area:'26m²', price:'4,500,000', status:'occupied',
          residents:2, tenant:'Nguyễn Quang Vinh', tenantCccd:'034201189012', phone:'0988789012', sinceDate:'10/05/2025',
          roommates:[{ name:'Trần Thị Nga', cccd:'034201190123' }], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true }], currentIssue:null },
        { id:'103', type:'Phòng đơn', area:'18m²', price:'3,200,000', status:'empty',
          emptySince:'01/04/2026', tenant:null, phone:null, sinceDate:null,
          roommates:[], cccdImages:[], messages:[], paymentHistory:[], currentIssue:null },
      ]},
      { floor:2, rooms:[
        { id:'201', type:'Phòng đôi', area:'26m²', price:'4,500,000', status:'urgent',
          residents:1, tenant:'Dương Thị Hoa', tenantCccd:'075199201234', phone:'0901890123', sinceDate:'15/08/2025',
          roommates:[], cccdImages:[],
          messages:[{ id:'m-b4-2-201-1', text:'Trần phòng bị nứt lớn, lo ngại sập xuống bất cứ lúc nào', time:'23/04/2026 08:00', resolved:false }],
          paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true }],
          currentIssue:{ title:'Trần phòng bị nứt — đang kiểm tra kết cấu khẩn', reportedAt:'23/04/2026 08:30' } },
        { id:'202', type:'Studio', area:'36m²', price:'6,500,000', status:'occupied',
          residents:1, tenant:'Lê Bá Tùng', tenantCccd:'001197212345', phone:'0912901234', sinceDate:'01/09/2024',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true },{ month:'02/2026', paid:true }], currentIssue:null },
        { id:'203', type:'Phòng đôi', area:'26m²', price:'4,500,000', status:'occupied',
          residents:1, tenant:'Chu Thị Bảo', tenantCccd:'079200223456', phone:'0933012345', sinceDate:'20/11/2025',
          roommates:[], cccdImages:[],
          messages:[{ id:'m-b4-2-203-1', text:'Vòi nước nóng lạnh bị hỏng, chỉ có nước lạnh', time:'21/04/2026 07:00', resolved:false }],
          paymentHistory:[{ month:'04/2026', paid:false },{ month:'03/2026', paid:true }], currentIssue:null },
        { id:'204', type:'Phòng đơn', area:'18m²', price:'3,200,000', status:'empty',
          emptySince:'25/03/2026', tenant:null, phone:null, sinceDate:null,
          roommates:[], cccdImages:[], messages:[], paymentHistory:[], currentIssue:null },
      ]},
      { floor:3, rooms:[
        { id:'301', type:'Phòng VIP', area:'55m²', price:'10,000,000', status:'occupied',
          residents:2, tenant:'Võ Thanh Hải', tenantCccd:'048198234567', phone:'0944123456', sinceDate:'01/01/2025',
          roommates:[{ name:'Ngô Thị Xuân', cccd:'048201245678' }], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true },{ month:'03/2026', paid:true }], currentIssue:null },
        { id:'302', type:'Studio', area:'36m²', price:'6,500,000', status:'occupied',
          residents:1, tenant:'Trần Ngọc Ánh', tenantCccd:'052200256789', phone:'0955234567', sinceDate:'10/04/2025',
          roommates:[], cccdImages:[],
          messages:[], paymentHistory:[{ month:'04/2026', paid:true }], currentIssue:null },
        { id:'303', type:'Phòng đôi', area:'26m²', price:'4,500,000', status:'empty',
          emptySince:'08/04/2026', tenant:null, phone:null, sinceDate:null,
          roommates:[], cccdImages:[], messages:[], paymentHistory:[], currentIssue:null },
      ]},
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────

function parsePrice(str) {
  return parseInt((str || '0').replace(/,/g, ''), 10) || 0;
}
function parseArea(str) {
  return parseInt(str) || 0;
}
function roomDbId(buildingId, floor, roomId) {
  return `${buildingId}-${floor}-${roomId}`;
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log('🌱 Bắt đầu seed database...\n');

  // 1. Owner
  console.log('👤 Inserting owner...');
  const { error: ownerErr } = await supabase.from('owners').upsert(
    [{ id:'owner-001', name:'Nguyễn Chủ Nhà', phone:'0901000000' }],
    { onConflict:'id' }
  );
  if (ownerErr) { console.error('Owner error:', ownerErr.message); return; }

  // 2. Staff
  console.log('👥 Inserting staff...');
  const { error: staffErr } = await supabase.from('staff').upsert(
    INIT_STAFF.map(s => ({ ...s, owner_id:'owner-001' })),
    { onConflict:'id' }
  );
  if (staffErr) { console.error('Staff error:', staffErr.message); return; }

  // 3. Permissions
  console.log('🔑 Inserting permissions...');
  const permRows = Object.entries(STAFF_PERMS).flatMap(([staffId, perms]) =>
    perms.map(p => ({ staff_id: staffId, permission: p }))
  );
  const { error: permErr } = await supabase.from('staff_permissions').upsert(
    permRows, { onConflict:'staff_id,permission' }
  );
  if (permErr) { console.error('Perm error:', permErr.message); return; }

  // 4. Buildings → Rooms → Tenants → Messages → Payments → Issues
  for (const b of INIT_BUILDINGS) {
    console.log(`\n🏢 Building ${b.name}...`);

    const { error: bErr } = await supabase.from('buildings').upsert([{
      id: b.id, owner_id:'owner-001',
      staff_id: STAFF_BY_NAME[b.staff] ?? null,
      name: b.name, code: b.code, address: b.address,
    }], { onConflict:'id' });
    if (bErr) { console.error('  Building error:', bErr.message); continue; }

    for (const fl of b.floors) {
      for (const r of fl.rooms) {
        const rId = roomDbId(b.id, fl.floor, r.id);

        // Room
        const { error: rErr } = await supabase.from('rooms').upsert([{
          id: rId, building_id: b.id, floor: fl.floor, room_number: r.id,
          type: r.type, area_m2: parseArea(r.area),
          price: parsePrice(r.price), status: r.status, empty_since: r.emptySince ?? null,
        }], { onConflict:'id' });
        if (rErr) { console.error(`  Room ${rId} error:`, rErr.message); continue; }

        // Tenant
        if (r.tenant) {
          const { data: tData, error: tErr } = await supabase.from('tenants').insert([{
            room_id: rId, name: r.tenant, phone: r.phone, cccd: r.tenantCccd,
            since_date: r.sinceDate, cccd_images: r.cccdImages ?? [],
          }]).select('id').single();

          if (tErr) {
            console.error(`  Tenant ${r.tenant} error:`, tErr.message);
          } else if (tData) {
            const tenantId = tData.id;

            // Roommates
            if (r.roommates?.length) {
              await supabase.from('roommates').insert(
                r.roommates.map(rm => ({ tenant_id: tenantId, name: rm.name, cccd: rm.cccd }))
              );
            }

            // Payments
            if (r.paymentHistory?.length) {
              await supabase.from('payments').upsert(
                r.paymentHistory.map(p => ({
                  room_id: rId, tenant_id: tenantId,
                  month: p.month, paid: p.paid,
                  amount: parsePrice(r.price),
                })),
                { onConflict:'room_id,month' }
              );
            }
          }
        }

        // Messages
        if (r.messages?.length) {
          await supabase.from('messages').upsert(
            r.messages.map(m => ({
              id: m.id, room_id: rId,
              text: m.text, sent_at: m.time, resolved: m.resolved,
            })),
            { onConflict:'id' }
          );
        }

        // Current issue
        if (r.currentIssue) {
          const msgId = r.messages?.[0]?.id ?? null;
          await supabase.from('issues').insert([{
            room_id: rId, message_id: msgId,
            title: r.currentIssue.title,
            reported_at: r.currentIssue.reportedAt,
            resolved: false,
          }]);
        }

        process.stdout.write('  ✓ ' + rId + '\n');
      }
    }
  }

  console.log('\n✅ Seed hoàn tất!');
}

main().catch(err => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
