import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions, Modal,
  TextInput, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_W = Dimensions.get('window').width;
const CHART_H  = 120;   // max bar / dot height

// ─── Static data ──────────────────────────────────────────
const STATS = [
  { label: 'Tổng phòng', value: '128', numColor: '#fff',     borderColor: 'rgba(255,255,255,0.12)' },
  { label: 'Đang thuê',  value: '104', numColor: '#2ecc71',  borderColor: 'rgba(46,204,113,0.35)'  },
  { label: 'Trống',      value: '18',  numColor: '#8892b0',  borderColor: 'rgba(136,146,176,0.3)'  },
  { label: 'Sự cố',      value: '6',   numColor: '#e94560',  borderColor: 'rgba(233,69,96,0.35)'   },
];

const ADMIN_BUILDINGS = [
  { name: 'Nhà A - Green Home', address: '12 Nguyễn Trãi, Q.1',   total: 42, occupied: 36, staff: 'Trần Thị Thu'    },
  { name: 'Nhà B - Blue Sky',   address: '45 Lê Lợi, Q.3',        total: 38, occupied: 30, staff: 'Nguyễn Văn Bảo'  },
  { name: 'Nhà C - Sunrise',    address: '78 Trần Hưng Đạo, Q.5', total: 48, occupied: 38, staff: 'Lê Thị Hương'    },
];

const MSG_INIT = [
  { id: 'm1', room: '101',  building: 'Nhà A - Green Home', staff: 'Trần Thị Thu',    tenant: 'Nguyễn Văn An',  phone: '0912345678', text: 'Vòi nước bị nhỏ giọt, phiền anh kiểm tra giúp',  time: '09:12 20/04/2026' },
  { id: 'm2', room: '104',  building: 'Nhà A - Green Home', staff: 'Trần Thị Thu',    tenant: 'Vũ Thị Lan',     phone: '0966333444', text: 'Bồn cầu bị tắc, chị xử lý giúp em với ạ',        time: '22:05 21/04/2026' },
  { id: 'm3', room: '302',  building: 'Nhà A - Green Home', staff: 'Trần Thị Thu',    tenant: 'Hoàng Đức Minh', phone: '0933222111', text: 'Thang máy tầng 3 thỉnh thoảng kêu tiếng lạ',      time: '10:00 22/04/2026' },
  { id: 'm4', room: 'B201', building: 'Nhà B - Blue Sky',   staff: 'Nguyễn Văn Bảo', tenant: 'Bùi Văn Tài',    phone: '0944111222', text: 'Cửa phòng bị hỏng khóa, không đóng được',         time: '14:30 22/04/2026' },
  { id: 'm5', room: 'B105', building: 'Nhà B - Blue Sky',   staff: 'Nguyễn Văn Bảo', tenant: 'Lê Thị Ngọc',    phone: '0955888777', text: 'Máy lạnh không hoạt động, phòng rất nóng',         time: '16:45 22/04/2026' },
  { id: 'm6', room: 'C302', building: 'Nhà C - Sunrise',    staff: 'Lê Thị Hương',   tenant: 'Phạm Minh Đức',  phone: '0977666555', text: 'Bóng đèn phòng khách bị cháy, cần thay gấp',       time: '08:20 23/04/2026' },
];

const RESOLVE_STAFF = [
  { id: 's1', name: 'Trần Thị Thu',    role: 'Nhân viên', building: 'Nhà A' },
  { id: 's2', name: 'Nguyễn Văn Bảo', role: 'Nhân viên', building: 'Nhà B' },
  { id: 's3', name: 'Lê Thị Hương',   role: 'Nhân viên', building: 'Nhà C' },
];

const RESOLVE_TYPES = [
  { key: 'admin',      icon: '🧑‍💼', label: 'Admin tự xử lý',     color: '#a29bfe', bg: 'rgba(162,155,254,0.12)', border: 'rgba(162,155,254,0.35)' },
  { key: 'staff',      icon: '💼',   label: 'Chỉ định nhân viên', color: '#74b9ff', bg: 'rgba(116,185,255,0.12)', border: 'rgba(116,185,255,0.35)' },
  { key: 'contractor', icon: '🔧',   label: 'Thuê thợ bên ngoài', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)',  border: 'rgba(46,204,113,0.35)'  },
];
const STAFF_ACTIVITIES = [
  { name: 'Trần Thị Thu',    building: 'Nhà A', avatar: '👩', action: 'Thu tiền phòng 101, 103, 104',         time: '08:30 23/04/2026' },
  { name: 'Nguyễn Văn Bảo', building: 'Nhà B', avatar: '👨', action: 'Xử lý bảo trì phòng B103',            time: '10:15 23/04/2026' },
  { name: 'Lê Thị Hương',   building: 'Nhà C', avatar: '👩', action: 'Ký hợp đồng mới phòng C201',          time: '14:00 22/04/2026' },
  { name: 'Trần Thị Thu',    building: 'Nhà A', avatar: '👩', action: 'Kiểm tra phòng 203 sau bảo trì',      time: '16:30 22/04/2026' },
  { name: 'Nguyễn Văn Bảo', building: 'Nhà B', avatar: '👨', action: 'Gia hạn hợp đồng khách B202',         time: '09:00 21/04/2026' },
  { name: 'Lê Thị Hương',   building: 'Nhà C', avatar: '👩', action: 'Bàn giao phòng C105 cho khách mới',   time: '15:00 20/04/2026' },
];

const CUSTOMER_ACTIVITIES = [
  { type: 'complaint', name: 'Vũ Thị Lan',      room: '104',  building: 'Nhà A', action: 'Phản ánh bồn cầu bị tắc',        reason: null,                                            time: '22:05 21/04/2026' },
  { type: 'checkin',   name: 'Đỗ Minh Khôi',    room: 'C201', building: 'Nhà C', action: 'Nhận phòng mới',                 reason: null,                                            time: '14:00 22/04/2026' },
  { type: 'checkout',  name: 'Nguyễn Thị Mai',   room: 'B301', building: 'Nhà B', action: 'Thông báo chuyển đi',            reason: 'Chuyển công tác xa, không tiện di chuyển hàng ngày', time: '09:30 20/04/2026' },
  { type: 'birthday',  name: 'Lê Minh Tuấn',    room: '201',  building: 'Nhà A', action: 'Sinh nhật hôm nay',              reason: null,                                            time: '23/04/2026'       },
  { type: 'complaint', name: 'Hoàng Đức Minh',   room: '302',  building: 'Nhà A', action: 'Phản ánh tiếng ồn thang máy',   reason: null,                                            time: '10:00 22/04/2026' },
  { type: 'checkout',  name: 'Trần Văn Hùng',    room: 'C105', building: 'Nhà C', action: 'Thông báo chuyển đi',            reason: 'Mua nhà riêng, không cần thuê nữa',             time: '15:00 19/04/2026' },
  { type: 'checkin',   name: 'Phạm Thị Linh',    room: 'B204', building: 'Nhà B', action: 'Nhận phòng mới',                 reason: null,                                            time: '10:00 18/04/2026' },
];

// ─── Birthday data (day/month matched against today ±1) ───
// Today = 24/04/2026  |  yesterday = 23/04  |  tomorrow = 25/04
const BIRTHDAY_PEOPLE = [
  { name: 'Lê Minh Tuấn',   type: 'customer', sub: 'Phòng 201 · Nhà A - Green Home', dob: '23/04/1990', gender: 'male'   },
  { name: 'Trần Thị Thu',    type: 'staff',    sub: 'S-0912333444 · Nhân viên',        dob: '23/04/1995', gender: 'female' },
  { name: 'Nguyễn Văn An',  type: 'customer', sub: 'Phòng 101 · Nhà A - Green Home', dob: '24/04/1992', gender: 'male'   },
  { name: 'Nguyễn Văn Bảo', type: 'staff',    sub: 'S-0923555666 · Nhân viên',        dob: '24/04/1993', gender: 'male'   },
  { name: 'Phạm Thu Hà',    type: 'customer', sub: 'Phòng 301 · Nhà A - Green Home', dob: '25/04/1997', gender: 'female' },
  { name: 'Nguyễn Quản Lý', type: 'staff',    sub: 'M-0901111222 · Quản lý',          dob: '25/04/1985', gender: 'male'   },
];

const BDAY_GROUPS = [
  { key: 'yesterday', label: 'Hôm qua',  dayOffset: -1, color: '#8892b0', bg: 'rgba(136,146,176,0.1)',  border: 'rgba(136,146,176,0.22)' },
  { key: 'today',     label: 'Hôm nay',  dayOffset:  0, color: '#f1c40f', bg: 'rgba(241,196,15,0.1)',   border: 'rgba(241,196,15,0.28)'  },
  { key: 'tomorrow',  label: 'Ngày mai', dayOffset: +1, color: '#4facfe', bg: 'rgba(79,172,254,0.1)',   border: 'rgba(79,172,254,0.28)'  },
];

function buildBirthdayGroups() {
  const base = new Date(2026, 3, 24); // 24/04/2026
  return BDAY_GROUPS.map(g => {
    const d = new Date(base);
    d.setDate(base.getDate() + g.dayOffset);
    const day = d.getDate(), month = d.getMonth() + 1;
    const people = BIRTHDAY_PEOPLE.filter(p => {
      const [pd, pm] = p.dob.split('/').map(Number);
      return pd === day && pm === month;
    });
    return { ...g, people };
  }).filter(g => g.people.length > 0);
}

// ─── Revenue data ─────────────────────────────────────────
// Week  → actual dates of current week (Mon 21/4 – Sun 27/4/2026)
// Month → 12 months of 2026 (T1–T12)
// Year  → 5 years (2022–2026)
const REVENUE = {
  week: {
    title:  'Doanh thu tuần này',
    total:  '28,450,000 ₫',
    footer: '↑ 8% so với tuần trước',
    bars: [
      { label: '21/4', val: 3200000 },
      { label: '22/4', val: 4100000 },
      { label: '23/4', val: 5800000 },
      { label: '24/4', val: 3800000 },
      { label: '25/4', val: 5200000 },
      { label: '26/4', val: 4350000 },
      { label: '27/4', val: 2000000 },
    ],
  },
  month: {
    title:  'Doanh thu tháng này',
    total:  '124,500,000 ₫',
    footer: '↑ 12% so với T3/2026',
    bars: [
      { label: 'T1',  val: 98000000  },
      { label: 'T2',  val: 105000000 },
      { label: 'T3',  val: 112000000 },
      { label: 'T4',  val: 124500000 },
      { label: 'T5',  val: 0 },
      { label: 'T6',  val: 0 },
      { label: 'T7',  val: 0 },
      { label: 'T8',  val: 0 },
      { label: 'T9',  val: 0 },
      { label: 'T10', val: 0 },
      { label: 'T11', val: 0 },
      { label: 'T12', val: 0 },
    ],
  },
  year: {
    title:  'Doanh thu năm nay',
    total:  '1,248,000,000 ₫',
    footer: '↑ 18% so với năm 2025',
    bars: [
      { label: '2022', val: 820000000  },
      { label: '2023', val: 950000000  },
      { label: '2024', val: 1050000000 },
      { label: '2025', val: 1120000000 },
      { label: '2026', val: 1248000000 },
    ],
  },
};

const PERIODS = [
  { key: 'week',  label: 'Tuần'  },
  { key: 'month', label: 'Tháng' },
  { key: 'year',  label: 'Năm'   },
];

const CHART_TYPES = [
  { key: 'bar',  icon: '▮▮▮' },
  { key: 'line', icon: '╱╲╱' },
];

function fmt(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'T';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + 'K';
  return '0';
}

// ─── Bar Chart ────────────────────────────────────────────
function BarChart({ bars }) {
  const [sel, setSel] = useState(null);

  const nonZero = bars.filter(b => b.val > 0);
  const max     = nonZero.length ? Math.max(...nonZero.map(b => b.val)) : 1;
  const ITEM_W  = Math.max(Math.floor((SCREEN_W - 72) / bars.length), 44);
  const BAR_W   = Math.min(ITEM_W - 14, 30);
  const innerW  = Math.max(ITEM_W * bars.length, SCREEN_W - 72);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ width: innerW }}>

        {/* Grid lines + bars */}
        <View style={{ height: CHART_H + 20, position: 'relative' }}>
          {[0.25, 0.5, 0.75, 1.0].map(r => (
            <View key={r} pointerEvents="none" style={{
              position: 'absolute', left: 0, right: 0,
              bottom: 4 + CHART_H * r, height: 1,
              backgroundColor: 'rgba(255,255,255,0.07)',
            }} />
          ))}

          <View style={{
            flexDirection: 'row', alignItems: 'flex-end',
            position: 'absolute', bottom: 4, left: 0, right: 0,
          }}>
            {bars.map((bar, i) => {
              const h     = bar.val > 0 ? Math.max(Math.round((bar.val / max) * CHART_H), 6) : 4;
              const isSel = sel === i;
              return (
                <TouchableOpacity
                  key={i}
                  style={{ width: ITEM_W, alignItems: 'center', justifyContent: 'flex-end', height: CHART_H + 16 }}
                  onPress={() => setSel(i === sel ? null : i)}
                  activeOpacity={0.75}
                  disabled={bar.val === 0}
                >
                  <Text style={[ch.barVal, { opacity: isSel ? 1 : 0 }]}>{fmt(bar.val)}</Text>
                  <LinearGradient
                    colors={
                      bar.val === 0
                        ? ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.03)']
                        : isSel
                          ? ['#f1c40f', '#e67e22']
                          : ['#4facfe', 'rgba(79,172,254,0.45)']
                    }
                    style={{ width: BAR_W, height: h, borderRadius: 6 }}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Labels */}
        <View style={{ flexDirection: 'row', marginTop: 2 }}>
          {bars.map((bar, i) => (
            <Text key={i} style={[ch.barLabel, { width: ITEM_W }, sel === i && ch.barLabelSel]}>
              {bar.label}
            </Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Line Chart ───────────────────────────────────────────
function LineChart({ bars }) {
  const [sel, setSel] = useState(null);

  const activeBars = bars.filter(b => b.val > 0);
  if (activeBars.length < 2) return <BarChart bars={bars} />;  // fallback

  const maxVal  = Math.max(...activeBars.map(b => b.val));
  const minVal  = Math.min(...activeBars.map(b => b.val)) * 0.85;
  const range   = maxVal - minVal || 1;
  const ITEM_W  = Math.max(Math.floor((SCREEN_W - 72) / bars.length), 44);
  const innerW  = Math.max(ITEM_W * bars.length, SCREEN_W - 72);
  const DOT_R   = 5;

  const getPx = i  => ITEM_W * i + ITEM_W / 2;
  const getPy = v  => v > 0 ? CHART_H - Math.round(((v - minVal) / range) * (CHART_H - 16)) + 8 : -999;

  const pts = bars.map((bar, i) => ({
    x: getPx(i), y: bar.val > 0 ? getPy(bar.val) : null,
    val: bar.val, label: bar.label,
  }));

  // Build segments only between consecutive non-zero points
  const segments = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (a.y !== null && b.y !== null) segments.push({ a, b, i });
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ width: innerW, height: CHART_H + 40 }}>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1.0].map(r => (
          <View key={r} pointerEvents="none" style={{
            position: 'absolute', left: 0, right: 0,
            top: 8 + CHART_H * (1 - r), height: 1,
            backgroundColor: 'rgba(255,255,255,0.07)',
          }} />
        ))}

        {/* Line segments */}
        {segments.map(({ a, b, i }) => {
          const dx  = b.x - a.x, dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ang = Math.atan2(dy, dx) * 180 / Math.PI;
          const cx  = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
          return (
            <View key={i} pointerEvents="none" style={{
              position: 'absolute',
              width: len, height: 2,
              backgroundColor: '#4facfe',
              left: cx - len / 2, top: cy - 1,
              transform: [{ rotate: `${ang}deg` }],
              borderRadius: 1,
            }} />
          );
        })}

        {/* Dots + tooltips */}
        {pts.map((pt, i) => {
          if (pt.y === null) return null;
          const isSel = sel === i;
          return (
            <TouchableOpacity
              key={i}
              style={{
                position: 'absolute',
                left: pt.x - DOT_R - 10, top: pt.y - DOT_R - 18,
                width: DOT_R * 2 + 20, height: DOT_R * 2 + 20,
                alignItems: 'center',
              }}
              onPress={() => setSel(i === sel ? null : i)}
              activeOpacity={0.8}
            >
              {isSel && (
                <Text style={ch.lineVal}>{fmt(pt.val)}</Text>
              )}
              <View style={{
                width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
                backgroundColor: isSel ? '#f1c40f' : '#1a1a2e',
                borderWidth: 2, borderColor: isSel ? '#f1c40f' : '#4facfe',
                marginTop: isSel ? 2 : 14,
              }} />
            </TouchableOpacity>
          );
        })}

        {/* X-axis labels */}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row' }}>
          {bars.map((bar, i) => (
            <Text key={i} style={[ch.barLabel, { width: ITEM_W }, sel === i && ch.barLabelSel]}>
              {bar.label}
            </Text>
          ))}
        </View>

      </View>
    </ScrollView>
  );
}

// ─── Message Detail Modal ────────────────────────────────
function MessageDetailModal({ visible, message: msg, onClose, onResolve }) {
  if (!msg) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={md.overlay}>
        <TouchableOpacity style={md.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={md.sheet}>
          <View style={md.handle} />
          <Text style={md.title}>Chi tiết phản ánh</Text>

          <View style={md.infoBlock}>
            {[
              { label: 'Phòng',      value: msg.room,     color: '#4facfe' },
              { label: 'Tòa nhà',    value: msg.building, color: '#ccd6f6' },
              { label: 'Khách thuê', value: msg.tenant,   color: '#fff'    },
              { label: 'Nhân viên',  value: msg.staff,    color: '#f1c40f' },
              { label: 'Thời gian',  value: msg.time,     color: '#8892b0' },
            ].map(({ label, value, color }) => (
              <View key={label} style={md.infoRow}>
                <Text style={md.infoLabel}>{label}</Text>
                <Text style={[md.infoValue, { color }]}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={md.msgBox}>
            <Text style={md.msgBoxLabel}>Nội dung phản ánh</Text>
            <Text style={md.msgBoxText}>"{msg.text}"</Text>
          </View>

          <View style={md.actions}>
            <TouchableOpacity
              style={md.callBtn}
              onPress={() => Linking.openURL(`tel:${msg.phone}`)}
            >
              <Text style={md.callBtnText}>📞  Gọi điện</Text>
            </TouchableOpacity>
            <TouchableOpacity style={md.resolveBtn} onPress={onResolve}>
              <Text style={md.resolveBtnText}>✅  Xác nhận xử lý</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={md.closeBtn} onPress={onClose}>
            <Text style={md.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Resolve Modal ────────────────────────────────────────
function ResolveModal({ visible, message: msg, onConfirm, onClose }) {
  const [resolveType,     setResolveType]     = useState('admin');
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [contractorName,  setContractorName]  = useState('');

  React.useEffect(() => {
    if (visible) { setResolveType('admin'); setSelectedStaffId(null); setContractorName(''); }
  }, [visible]);

  const canConfirm =
    resolveType === 'admin' ||
    (resolveType === 'staff' && selectedStaffId) ||
    (resolveType === 'contractor' && contractorName.trim().length > 0);

  const handleConfirm = () => {
    if (!canConfirm) return;
    let resolvedBy = { type: resolveType, name: '' };
    if (resolveType === 'admin') {
      resolvedBy.name = 'Admin';
    } else if (resolveType === 'staff') {
      resolvedBy.name = RESOLVE_STAFF.find(s => s.id === selectedStaffId)?.name || '';
    } else {
      resolvedBy.name = contractorName.trim();
    }
    onConfirm(resolvedBy);
  };

  if (!msg) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={rv.overlay}>
        <TouchableOpacity style={rv.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={rv.sheet}>
          <View style={rv.handle} />
          <Text style={rv.title}>Xác nhận xử lý sự cố</Text>
          <Text style={rv.sub}>Phòng {msg.room} · {msg.tenant}</Text>

          <Text style={rv.label}>Hướng xử lý</Text>
          <View style={rv.typeRow}>
            {RESOLVE_TYPES.map(rt => (
              <TouchableOpacity
                key={rt.key}
                style={[rv.typeOpt, resolveType === rt.key && { borderColor: rt.border, backgroundColor: rt.bg }]}
                onPress={() => { setResolveType(rt.key); setSelectedStaffId(null); }}
              >
                <Text style={rv.typeIcon}>{rt.icon}</Text>
                <Text style={[rv.typeLabel, resolveType === rt.key && { color: rt.color, fontWeight: '700' }]}>
                  {rt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {resolveType === 'staff' && (
            <>
              <Text style={rv.label}>Chọn nhân viên xử lý</Text>
              {RESOLVE_STAFF.map(st => (
                <TouchableOpacity
                  key={st.id}
                  style={[rv.staffRow, selectedStaffId === st.id && rv.staffRowActive]}
                  onPress={() => setSelectedStaffId(st.id)}
                >
                  <Text style={rv.staffIcon}>💼</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={rv.staffName}>{st.name}</Text>
                    <Text style={rv.staffSub}>{st.role} · {st.building}</Text>
                  </View>
                  {selectedStaffId === st.id && <Text style={rv.staffCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </>
          )}

          {resolveType === 'contractor' && (
            <>
              <Text style={rv.label}>Thông tin thợ / đơn vị</Text>
              <TextInput
                style={rv.input}
                value={contractorName}
                onChangeText={setContractorName}
                placeholder="Tên thợ hoặc công ty sửa chữa"
                placeholderTextColor="#8892b0"
              />
            </>
          )}

          <View style={rv.btnRow}>
            <TouchableOpacity style={rv.cancelBtn} onPress={onClose}>
              <Text style={rv.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[rv.confirmBtn, !canConfirm && rv.confirmDim]}
              onPress={handleConfirm}
            >
              <Text style={rv.confirmText}>✅  Xác nhận xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Birthday Panel ───────────────────────────────────────
function BirthdayPanel({ visible, groups, onClose }) {
  const total = groups.reduce((sum, g) => sum + g.people.length, 0);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={bp.overlay}>
        <TouchableOpacity style={bp.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={bp.sheet}>
          <View style={bp.handle} />
          <View style={bp.titleRow}>
            <Text style={bp.title}>🎂 Sinh nhật sắp tới</Text>
            <View style={bp.totalBadge}>
              <Text style={bp.totalText}>{total} người</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {groups.length === 0 ? (
              <View style={bp.emptyBox}>
                <Text style={bp.emptyIcon}>🎂</Text>
                <Text style={bp.emptyText}>Không có sinh nhật trong 3 ngày này</Text>
              </View>
            ) : groups.map(group => (
              <View key={group.key} style={[bp.group, { borderColor: group.border }]}>
                <View style={[bp.groupHeader, { backgroundColor: group.bg }]}>
                  <Text style={[bp.groupLabel, { color: group.color }]}>
                    {group.key === 'today' ? '🎉' : '📅'}  {group.label}
                  </Text>
                  <Text style={[bp.groupCount, { color: group.color }]}>
                    {group.people.length} người
                  </Text>
                </View>
                {group.people.map((person, i) => {
                  const avatar = person.type === 'staff'
                    ? (person.gender === 'female' ? '👩‍💼' : '👨‍💼')
                    : (person.gender === 'female' ? '👩' : '👨');
                  const isLast = i === group.people.length - 1;
                  return (
                    <View key={i} style={[bp.personRow, !isLast && bp.personRowBorder]}>
                      <View style={[bp.personAvatar, { backgroundColor: group.bg }]}>
                        <Text style={bp.personAvatarIcon}>{avatar}</Text>
                      </View>
                      <View style={bp.personInfo}>
                        <Text style={bp.personName}>{person.name}</Text>
                        <Text style={bp.personSub}>{person.sub}</Text>
                        <Text style={[bp.personDob, { color: group.color }]}>🎂 {person.dob}</Text>
                      </View>
                      <View style={[bp.typeBadge, { backgroundColor: group.bg, borderColor: group.border }]}>
                        <Text style={[bp.typeText, { color: group.color }]}>
                          {person.type === 'staff' ? '💼 NV' : '👤 KH'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={bp.closeBtn} onPress={onClose}>
            <Text style={bp.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────
const ACT_TYPE = {
  complaint: { icon: '📢', color: '#e94560', bg: 'rgba(233,69,96,0.12)',  label: 'Phản ánh'    },
  checkin:   { icon: '🏠', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)', label: 'Nhận phòng'  },
  checkout:  { icon: '🚚', color: '#f1c40f', bg: 'rgba(241,196,15,0.12)', label: 'Chuyển đi'   },
  birthday:  { icon: '🎂', color: '#f39c12', bg: 'rgba(243,156,18,0.12)', label: 'Sinh nhật'   },
};

export default function DashboardScreen() {
  const [period,         setPeriod]         = useState('month');
  const [chartType,      setChartType]      = useState('bar');
  const [activityTab,    setActivityTab]    = useState('staff');
  const [bdayPanelOpen,  setBdayPanelOpen]  = useState(false);
  const [messages,       setMessages]       = useState(MSG_INIT);
  const [selectedMsg,    setSelectedMsg]    = useState(null);
  const [detailVisible,  setDetailVisible]  = useState(false);
  const [resolveVisible, setResolveVisible] = useState(false);
  const [resolvedHistory, setResolvedHistory] = useState([]);

  const rev        = REVENUE[period];
  const bdayGroups = buildBirthdayGroups();
  const bdayTotal  = bdayGroups.reduce((sum, g) => sum + g.people.length, 0);

  const openDetail = msg => { setSelectedMsg(msg); setDetailVisible(true); };

  const openResolve = () => { setDetailVisible(false); setResolveVisible(true); };

  const handleResolved = resolvedBy => {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const resolvedAt = `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;
    setResolvedHistory(prev => [{ ...selectedMsg, resolvedBy, resolvedAt }, ...prev]);
    setMessages(prev => prev.filter(m => m.id !== selectedMsg.id));
    setResolveVisible(false);
    setSelectedMsg(null);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <BirthdayPanel
        visible={bdayPanelOpen}
        groups={bdayGroups}
        onClose={() => setBdayPanelOpen(false)}
      />
      <MessageDetailModal
        visible={detailVisible}
        message={selectedMsg}
        onClose={() => { setDetailVisible(false); setSelectedMsg(null); }}
        onResolve={openResolve}
      />
      <ResolveModal
        visible={resolveVisible}
        message={selectedMsg}
        onConfirm={handleResolved}
        onClose={() => { setResolveVisible(false); setSelectedMsg(null); }}
      />

      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.greeting}>Xin chào 👋</Text>
              <Text style={s.ownerName}>Nguyễn Chủ Nhà</Text>
            </View>
            <TouchableOpacity style={s.notifBtn} onPress={() => setBdayPanelOpen(true)}>
              <Text style={s.notifIcon}>🎂</Text>
              {bdayTotal > 0 && (
                <View style={s.notifBadge}><Text style={s.notifBadgeText}>{bdayTotal}</Text></View>
              )}
            </TouchableOpacity>
          </View>
          <Text style={s.dateText}>Thứ Năm, 24 tháng 4 năm 2026</Text>
        </LinearGradient>

        {/* ── Revenue card (green) ── */}
        <View style={s.section}>
          <LinearGradient colors={['rgba(46,204,113,0.5)', 'rgba(22,160,133,0.5)']} style={s.revenueCard}>
            <View style={s.periodRow}>
              {PERIODS.map(p => (
                <TouchableOpacity
                  key={p.key}
                  style={[s.periodBtn, period === p.key && s.periodBtnActive]}
                  onPress={() => { setPeriod(p.key); }}
                >
                  <Text style={[s.periodBtnText, period === p.key && s.periodBtnTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={s.revenueLabel}>{rev.title}</Text>
            <Text style={s.revenueValue}>{rev.total}</Text>
            <View style={s.revenueRow}>
              <Text style={s.revenueChange}>{rev.footer}</Text>
              <Text style={s.revenueIcon}>💰</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── Chart ── */}
        <View style={s.section}>
          <View style={s.chartCard}>
            <View style={s.chartHeader}>
              <Text style={s.chartTitle}>📈 Biến động doanh thu</Text>
              <View style={s.chartTypeRow}>
                {CHART_TYPES.map(ct => (
                  <TouchableOpacity
                    key={ct.key}
                    style={[s.chartTypeBtn, chartType === ct.key && s.chartTypeBtnActive]}
                    onPress={() => setChartType(ct.key)}
                  >
                    <Text style={[s.chartTypeTxt, chartType === ct.key && s.chartTypeTxtActive]}>
                      {ct.icon}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {chartType === 'bar'
              ? <BarChart  bars={rev.bars} key={`bar-${period}`}  />
              : <LineChart bars={rev.bars} key={`line-${period}`} />
            }
          </View>
        </View>

        {/* Tổng quan phòng — 3 phần */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Tổng quan phòng</Text>
          <View style={s.ovPanel}>

            {/* Phần 1: Nhà đang quản lý */}
            <Text style={s.ovSubTitle}>🏢 Nhà đang quản lý</Text>
            {ADMIN_BUILDINGS.map((b, i) => {
              const pct = Math.round(b.occupied / b.total * 100);
              return (
                <View key={i} style={s.ovBuildingRow}>
                  <View style={s.ovBuildingIcon}><Text style={{ fontSize: 18 }}>🏢</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.ovBuildingName}>{b.name}</Text>
                    <Text style={s.ovBuildingMeta}>📍 {b.address}</Text>
                    <Text style={s.ovBuildingStaff}>👤 {b.staff}</Text>
                    <View style={s.ovOccRow}>
                      <View style={s.ovOccBar}>
                        <View style={[s.ovOccFill, { width: `${pct}%` }]} />
                      </View>
                      <Text style={s.ovOccPct}>{pct}% ({b.occupied}/{b.total})</Text>
                    </View>
                  </View>
                  <View style={s.ovRoomBadge}>
                    <Text style={s.ovRoomBadgeNum}>{b.total}</Text>
                    <Text style={s.ovRoomBadgeLbl}>phòng</Text>
                  </View>
                </View>
              );
            })}

            <View style={s.ovDivider} />

            {/* Phần 2: Tổng quan tình trạng phòng */}
            <Text style={s.ovSubTitle}>📊 Tình trạng phòng</Text>
            <View style={s.ovStatRow}>
              {STATS.map((stat, i) => (
                <View key={i} style={[s.ovStatCard, { borderColor: stat.borderColor }]}>
                  <Text style={[s.ovStatNum, { color: stat.numColor }]}>{stat.value}</Text>
                  <Text style={s.ovStatLbl}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <View style={s.ovDivider} />

            {/* Phần 3: Tin nhắn khách hàng */}
            <View style={s.ovMsgHeader}>
              <Text style={s.ovSubTitle}>💬 Tin nhắn khách hàng</Text>
              {messages.length > 0 && (
                <View style={s.ovMsgCountBadge}>
                  <Text style={s.ovMsgCountText}>{messages.length} chờ xử lý</Text>
                </View>
              )}
            </View>
            {messages.length === 0 ? (
              <View style={s.ovNoMsgBox}>
                <Text style={s.ovNoMsgText}>✅ Hiện không có tin nhắn chờ của khách</Text>
              </View>
            ) : (
              <>
                <ScrollView
                  nestedScrollEnabled
                  style={s.ovMsgScroll}
                  showsVerticalScrollIndicator={messages.length > 4}
                >
                  {messages.map((msg) => (
                    <TouchableOpacity
                      key={msg.id}
                      style={s.ovMsgRow}
                      onPress={() => openDetail(msg)}
                      activeOpacity={0.75}
                    >
                      <View style={s.ovMsgLeft}>
                        <Text style={s.ovMsgRoom}>Phòng {msg.room}</Text>
                        <Text style={s.ovMsgBuilding}>{msg.building}</Text>
                        <Text style={s.ovMsgStaff}>💼 {msg.staff}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.ovMsgTenant}>👤 {msg.tenant}</Text>
                        <Text style={s.ovMsgText} numberOfLines={2}>"{msg.text}"</Text>
                        <Text style={s.ovMsgTime}>🕐 {msg.time}</Text>
                      </View>
                      <Text style={s.ovMsgArrow}>›</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {messages.length > 4 && (
                  <View style={s.ovScrollHint}>
                    <Text style={s.ovScrollHintText}>↕  Kéo để xem thêm {messages.length - 4} tin nhắn</Text>
                  </View>
                )}
              </>
            )}

          </View>
        </View>

        {/* Hoạt động gần đây — 2 tab */}
        <View style={[s.section, { marginBottom: 32 }]}>
          <Text style={s.sectionTitle}>Hoạt động gần đây</Text>

          {/* Tab switcher */}
          <View style={s.actTabRow}>
            <TouchableOpacity
              style={[s.actTabBtn, activityTab === 'staff' && s.actTabActive]}
              onPress={() => setActivityTab('staff')}
            >
              <Text style={[s.actTabText, activityTab === 'staff' && s.actTabTextActive]}>💼 Nhân viên</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actTabBtn, activityTab === 'customer' && s.actTabActive]}
              onPress={() => setActivityTab('customer')}
            >
              <Text style={[s.actTabText, activityTab === 'customer' && s.actTabTextActive]}>👥 Khách hàng</Text>
            </TouchableOpacity>
          </View>

          {/* Staff activities */}
          {activityTab === 'staff' && (
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator={STAFF_ACTIVITIES.length > 5}
              style={STAFF_ACTIVITIES.length > 5 ? s.actScrollArea : undefined}
            >
              {STAFF_ACTIVITIES.map((act, i) => (
                <View key={i} style={s.activityCard}>
                  <View style={s.activityAvatar}>
                    <Text style={s.activityAvatarText}>{act.avatar}</Text>
                  </View>
                  <View style={s.activityInfo}>
                    <View style={s.actRow1}>
                      <Text style={s.activityName}>{act.name}</Text>
                      <Text style={s.actTimeText}>{act.time}</Text>
                    </View>
                    <View style={[s.actBuildingTag, { alignSelf: 'flex-start', marginTop: 5 }]}>
                      <Text style={s.actBuildingText}>🏢 {act.building}</Text>
                    </View>
                    <Text style={s.activityAction}>{act.action}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Customer activities */}
          {activityTab === 'customer' && (
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator={CUSTOMER_ACTIVITIES.length > 5}
              style={CUSTOMER_ACTIVITIES.length > 5 ? s.actScrollArea : undefined}
            >
              {CUSTOMER_ACTIVITIES.map((act, i) => {
                const cfg = ACT_TYPE[act.type];
                return (
                  <View key={i} style={[s.activityCard, { borderLeftWidth: 3, borderLeftColor: cfg.color }]}>
                    <View style={[s.actCustTypeBox, { backgroundColor: cfg.bg }]}>
                      <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
                    </View>
                    <View style={s.activityInfo}>
                      <View style={s.actRow1}>
                        <Text style={s.activityName}>{act.name}</Text>
                        <Text style={s.actTimeText}>{act.time}</Text>
                      </View>
                      <View style={s.actRow2}>
                        <View style={[s.actTypeTag, { backgroundColor: cfg.bg }]}>
                          <Text style={[s.actTypeText, { color: cfg.color }]}>{cfg.label}</Text>
                        </View>
                        <Text style={s.actRoomLine}>🏢 {act.building} · Phòng {act.room}</Text>
                      </View>
                      {act.type === 'birthday'
                        ? <Text style={[s.activityAction, { color: cfg.color }]}>🎉 {act.action}</Text>
                        : <Text style={s.activityAction}>{act.action}</Text>
                      }
                      {act.reason && (
                        <Text style={s.actReason}>📝 Lý do: {act.reason}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Message Detail styles ────────────────────────────────
const md = StyleSheet.create({
  overlay:       { flex: 1, justifyContent: 'flex-end' },
  backdrop:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet:         { backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle:        { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:         { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16 },

  infoBlock:     { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoLabel:     { color: '#8892b0', fontSize: 13, fontWeight: '600' },
  infoValue:     { fontSize: 13, fontWeight: '700', maxWidth: '62%', textAlign: 'right' },

  msgBox:        { backgroundColor: 'rgba(233,69,96,0.06)', borderRadius: 12, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: 'rgba(233,69,96,0.18)' },
  msgBoxLabel:   { color: '#8892b0', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  msgBoxText:    { color: '#ccd6f6', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },

  actions:       { flexDirection: 'row', gap: 10, marginBottom: 12 },
  callBtn:       { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: 'rgba(46,204,113,0.12)', borderWidth: 1, borderColor: 'rgba(46,204,113,0.35)' },
  callBtnText:   { color: '#2ecc71', fontWeight: '800', fontSize: 14 },
  resolveBtn:    { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: 'rgba(162,155,254,0.15)', borderWidth: 1, borderColor: 'rgba(162,155,254,0.4)' },
  resolveBtnText:{ color: '#a29bfe', fontWeight: '800', fontSize: 14 },

  closeBtn:      { borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText:  { color: '#8892b0', fontWeight: '700', fontSize: 14 },
});

// ─── Resolve Modal styles ─────────────────────────────────
const rv = StyleSheet.create({
  overlay:    { flex: 1, justifyContent: 'flex-end' },
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet:      { backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle:     { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:      { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  sub:        { color: '#8892b0', fontSize: 13, marginBottom: 4 },
  label:      { color: '#8892b0', fontSize: 11, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  typeRow:    { gap: 8 },
  typeOpt:    { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 13 },
  typeIcon:   { fontSize: 20 },
  typeLabel:  { color: '#8892b0', fontSize: 14 },

  staffRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 8 },
  staffRowActive: { backgroundColor: 'rgba(116,185,255,0.1)', borderColor: 'rgba(116,185,255,0.35)' },
  staffIcon:  { fontSize: 20 },
  staffName:  { color: '#fff', fontSize: 14, fontWeight: '700' },
  staffSub:   { color: '#8892b0', fontSize: 12, marginTop: 2 },
  staffCheck: { color: '#74b9ff', fontSize: 18, fontWeight: '800' },

  input:      { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },

  btnRow:     { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn:  { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelText: { color: '#8892b0', fontWeight: '700', fontSize: 14 },
  confirmBtn: { flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#a29bfe' },
  confirmDim: { opacity: 0.35 },
  confirmText:{ color: '#fff', fontWeight: '800', fontSize: 14 },
});

// ─── Birthday Panel styles ────────────────────────────────
const bp = StyleSheet.create({
  overlay:    { flex: 1, justifyContent: 'flex-end' },
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet:      { backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  handle:     { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },

  titleRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title:      { color: '#fff', fontSize: 18, fontWeight: '800' },
  totalBadge: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  totalText:  { color: '#ccd6f6', fontSize: 12, fontWeight: '700' },

  group:       { borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  groupLabel:  { fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  groupCount:  { fontSize: 12, fontWeight: '700' },

  personRow:       { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  personRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  personAvatar:    { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  personAvatarIcon:{ fontSize: 22 },
  personInfo:      { flex: 1 },
  personName:      { color: '#fff', fontSize: 14, fontWeight: '700' },
  personSub:       { color: '#8892b0', fontSize: 11, marginTop: 2 },
  personDob:       { fontSize: 11, fontWeight: '700', marginTop: 3 },
  typeBadge:       { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  typeText:        { fontSize: 11, fontWeight: '700' },

  emptyBox:  { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { color: '#8892b0', fontSize: 13 },

  closeBtn:     { marginTop: 16, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText: { color: '#8892b0', fontWeight: '700', fontSize: 14 },
});

// ─── Chart styles ─────────────────────────────────────────
const ch = StyleSheet.create({
  barVal:       { color: '#f1c40f', fontSize: 9, fontWeight: '800', marginBottom: 3, textAlign: 'center' },
  barLabel:     { color: '#8892b0', fontSize: 11, textAlign: 'center' },
  barLabelSel:  { color: '#f1c40f', fontWeight: '700' },
  lineVal:      { color: '#f1c40f', fontSize: 9, fontWeight: '800', textAlign: 'center' },
});

// ─── Screen styles ────────────────────────────────────────
const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header:    { padding: 20, paddingTop: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting:  { color: '#8892b0', fontSize: 14 },
  ownerName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  notifBtn:  { position: 'relative', padding: 8 },
  notifIcon: { fontSize: 24 },
  notifBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: '#e94560', borderRadius: 10,
    width: 18, height: 18, justifyContent: 'center', alignItems: 'center',
  },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  dateText: { color: '#8892b0', fontSize: 12 },
  section:      { padding: 20, paddingBottom: 0 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 12 },

  // Revenue card — green
  revenueCard:         { borderRadius: 20, padding: 22 },
  periodRow:           { flexDirection: 'row', gap: 6, marginBottom: 16 },
  periodBtn:           { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  periodBtnActive:     { backgroundColor: '#fff' },
  periodBtnText:       { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700' },
  periodBtnTextActive: { color: '#16a085' },
  revenueLabel:  { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  revenueValue:  { color: '#fff', fontSize: 32, fontWeight: '800', marginVertical: 8 },
  revenueRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  revenueChange: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  revenueIcon:   { fontSize: 24 },

  // Chart card
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  chartHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle:        { color: '#fff', fontSize: 14, fontWeight: '700' },
  chartTypeRow:      { flexDirection: 'row', gap: 6 },
  chartTypeBtn:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chartTypeBtnActive:{ backgroundColor: 'rgba(79,172,254,0.2)', borderColor: '#4facfe' },
  chartTypeTxt:      { color: '#8892b0', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  chartTypeTxtActive:{ color: '#4facfe' },

  // Overview panel (3-section room overview)
  ovPanel:        { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  ovSubTitle:     { color: '#fff', fontSize: 13, fontWeight: '800', marginBottom: 12, letterSpacing: 0.3 },
  ovDivider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 16 },
  ovBuildingRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  ovBuildingIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(79,172,254,0.1)', justifyContent: 'center', alignItems: 'center' },
  ovBuildingName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  ovBuildingMeta: { color: '#8892b0', fontSize: 11, marginTop: 1 },
  ovBuildingStaff:{ color: '#4facfe', fontSize: 11, marginTop: 2, fontWeight: '600' },
  ovOccRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  ovOccBar:       { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  ovOccFill:      { height: 4, backgroundColor: '#2ecc71', borderRadius: 2 },
  ovOccPct:       { color: '#2ecc71', fontSize: 10, fontWeight: '700', width: 86 },
  ovRoomBadge:    { alignItems: 'center', backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(79,172,254,0.25)' },
  ovRoomBadgeNum: { color: '#4facfe', fontSize: 18, fontWeight: '900' },
  ovRoomBadgeLbl: { color: '#4facfe', fontSize: 9, fontWeight: '600', marginTop: 1 },
  ovStatRow:      { flexDirection: 'row', gap: 8 },
  ovStatCard:     { flex: 1, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)', paddingVertical: 10, alignItems: 'center' },
  ovStatNum:      { fontSize: 22, fontWeight: '900' },
  ovStatLbl:      { color: '#8892b0', fontSize: 10, marginTop: 2, fontWeight: '600', textAlign: 'center' },
  ovNoMsgBox:     { backgroundColor: 'rgba(46,204,113,0.07)', borderRadius: 10, padding: 12, alignItems: 'center' },
  ovNoMsgText:    { color: '#2ecc71', fontSize: 12, fontWeight: '600' },
  ovMsgHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  ovMsgCountBadge:{ backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(233,69,96,0.3)' },
  ovMsgCountText: { color: '#e94560', fontSize: 11, fontWeight: '700' },
  ovMsgScroll:    { maxHeight: 344 },
  ovMsgRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(233,69,96,0.05)', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(233,69,96,0.2)' },
  ovMsgLeft:      { width: 96, flexShrink: 0 },
  ovMsgRoom:      { color: '#4facfe', fontSize: 13, fontWeight: '800' },
  ovMsgBuilding:  { color: '#8892b0', fontSize: 10, marginTop: 2, fontWeight: '600' },
  ovMsgStaff:     { color: '#f1c40f', fontSize: 10, marginTop: 3, fontWeight: '600' },
  ovMsgTenant:    { color: '#ccd6f6', fontSize: 12, fontWeight: '700', marginBottom: 3 },
  ovMsgText:      { color: '#8892b0', fontSize: 11, fontStyle: 'italic', lineHeight: 17 },
  ovMsgTime:      { color: '#4facfe', fontSize: 10, marginTop: 5 },
  ovScrollHint:   { alignItems: 'center', paddingVertical: 7, backgroundColor: 'rgba(79,172,254,0.07)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(79,172,254,0.18)', marginTop: 2 },
  ovScrollHintText:{ color: '#4facfe', fontSize: 11, fontWeight: '700' },
  ovMsgArrow:     { color: '#4facfe', fontSize: 20, fontWeight: '700', alignSelf: 'center', marginLeft: 4 },

  // Activity tabs
  actTabRow:        { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.025)', borderRadius: 14, padding: 4, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  actTabBtn:        { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 11 },
  actTabActive:     { backgroundColor: 'rgba(233,69,96,0.5)' },
  actTabText:       { color: '#8892b0', fontSize: 13, fontWeight: '700' },
  actTabTextActive: { color: '#fff' },

  // Activity cards — shared
  activityCard:       { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, marginBottom: 10 },
  activityAvatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(46,204,113,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14, flexShrink: 0 },
  activityAvatarText: { fontSize: 22 },
  activityInfo:       { flex: 1 },
  actRow1:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actRow2:            { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' },
  activityName:       { color: '#fff', fontWeight: '700', fontSize: 14, flex: 1, marginRight: 8 },
  actTimeText:        { color: '#fff', fontSize: 11, fontWeight: '800', flexShrink: 0 },
  actBuildingTag:     { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  actBuildingText:    { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  activityAction:     { color: '#8892b0', fontSize: 12, marginTop: 6, lineHeight: 18 },
  activityTime:       { color: '#8892b0', fontSize: 10, flexShrink: 0 },

  // Customer activity extras
  actCustTypeBox:  { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14, flexShrink: 0 },
  actTypeTag:      { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  actTypeText:     { fontSize: 11, fontWeight: '700' },
  actRoomLine:     { color: '#8892b0', fontSize: 11, flexShrink: 1 },
  actReason:       { color: '#f1c40f', fontSize: 11, marginTop: 5, fontStyle: 'italic', lineHeight: 17 },
  actScrollArea:   { maxHeight: 5 * 104 },
});
