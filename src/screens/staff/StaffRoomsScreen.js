import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, StatusBar, Modal, Animated, Linking,
  Dimensions, Alert, Image, LayoutAnimation, Platform, UIManager
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_H = Dimensions.get('window').height;
const DEMO_NOW = '22/04/2026';
const DEMO_NOW_DISPLAY = '22/04/2026 08:00';

// ─── Dữ liệu ban đầu ─────────────────────────────────────
const INITIAL_BUILDINGS = [
  {
    id: 'b1', name: 'Nhà A - Green Home', address: '12 Nguyễn Trãi, Q.1',
    floors: [
      { floor: 1, rooms: [
        { id: '101', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          tenant: 'Nguyễn Văn An', phone: '0912345678', sinceDate: '05/01/2025',
          emptyFrom: null, currentIssue: null,
          issueHistory: [
            { id: 'h1', title: 'Máy lạnh không mát', reportedAt: '10/03/2026 08:30', resolvedAt: '11/03/2026 14:00', resolvedBy: 'Thợ điện lạnh Minh' },
            { id: 'h2', title: 'Bóng đèn phòng tắm cháy', reportedAt: '02/02/2026 19:15', resolvedAt: '03/02/2026 10:00', resolvedBy: 'NV Bảo' },
          ],
          messages: [
            { id: 'm1', text: 'Vòi nước bị nhỏ giọt, phiền anh kiểm tra giúp', time: '20/04/2026 09:12', resolved: false },
          ],
          paymentHistory: [
            { month: '04/2026', rent: '3,500,000', elecKwh: 45, elecTotal: '135,000', waterM3: 3, waterTotal: '45,000', total: '3,680,000', paid: true, paidAt: '02/04/2026' },
            { month: '03/2026', rent: '3,500,000', elecKwh: 42, elecTotal: '126,000', waterM3: 3, waterTotal: '45,000', total: '3,671,000', paid: true, paidAt: '05/03/2026' },
            { month: '02/2026', rent: '3,500,000', elecKwh: 38, elecTotal: '114,000', waterM3: 2, waterTotal: '30,000', total: '3,644,000', paid: true, paidAt: '03/02/2026' },
          ],
        },
        { id: '102', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'urgent',
          tenant: null, phone: null, sinceDate: null, emptyFrom: '01/04/2026',
          currentIssue: { title: 'Trần nhà bị thấm nước nghiêm trọng', reportedAt: '19/04/2026 07:45', reportedBy: 'NV Tuấn (phát hiện)' },
          issueHistory: [
            { id: 'h1', title: 'Tường bị ẩm mốc', reportedAt: '10/02/2026 09:00', resolvedAt: '15/02/2026 16:00', resolvedBy: 'Thợ xây Hùng' },
          ],
          messages: [], paymentHistory: [],
        },
        { id: '103', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          tenant: 'Trần Thị Bích', phone: '0987654321', sinceDate: '15/03/2025',
          emptyFrom: null, currentIssue: null, issueHistory: [], messages: [],
          paymentHistory: [
            { month: '04/2026', rent: '3,500,000', elecKwh: 40, elecTotal: '120,000', waterM3: 2, waterTotal: '30,000', total: '3,650,000', paid: true, paidAt: '02/04/2026' },
            { month: '03/2026', rent: '3,500,000', elecKwh: 38, elecTotal: '114,000', waterM3: 2, waterTotal: '30,000', total: '3,644,000', paid: true, paidAt: '05/03/2026' },
          ],
        },
        { id: '104', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'occupied',
          tenant: 'Vũ Thị Lan', phone: '0966333444', sinceDate: '01/02/2026',
          emptyFrom: null, currentIssue: null,
          issueHistory: [
            { id: 'h1', title: 'Khóa cửa bị hỏng', reportedAt: '05/03/2026 11:00', resolvedAt: '05/03/2026 15:30', resolvedBy: 'NV Bảo' },
          ],
          messages: [
            { id: 'm1', text: 'Bồn cầu bị tắc, chị xử lý giúp em với ạ', time: '21/04/2026 22:05', resolved: false },
            { id: 'm2', text: 'Cửa sổ phòng em bị kẹt không mở được', time: '18/04/2026 08:30', resolved: true },
          ],
          paymentHistory: [
            { month: '04/2026', rent: '4,800,000', elecKwh: 50, elecTotal: '150,000', waterM3: 4, waterTotal: '60,000', total: '5,010,000', paid: false, paidAt: null },
            { month: '03/2026', rent: '4,800,000', elecKwh: 48, elecTotal: '144,000', waterM3: 4, waterTotal: '60,000', total: '5,004,000', paid: true, paidAt: '10/03/2026' },
            { month: '02/2026', rent: '4,800,000', elecKwh: 45, elecTotal: '135,000', waterM3: 3, waterTotal: '45,000', total: '4,980,000', paid: true, paidAt: '05/02/2026' },
          ],
        },
      ]},
      { floor: 2, rooms: [
        { id: '201', type: 'Studio', area: '35m²', price: '6,000,000', status: 'occupied',
          tenant: 'Lê Minh Tuấn', phone: '0909111222', sinceDate: '20/06/2024',
          emptyFrom: null, currentIssue: null,
          issueHistory: [
            { id: 'h1', title: 'Điều hòa chảy nước', reportedAt: '01/04/2026 14:00', resolvedAt: '02/04/2026 10:00', resolvedBy: 'Thợ điện lạnh Minh' },
          ],
          messages: [],
          paymentHistory: [
            { month: '04/2026', rent: '6,000,000', elecKwh: 80, elecTotal: '240,000', waterM3: 5, waterTotal: '75,000', total: '6,315,000', paid: false, paidAt: null },
            { month: '03/2026', rent: '6,000,000', elecKwh: 75, elecTotal: '225,000', waterM3: 5, waterTotal: '75,000', total: '6,300,000', paid: false, paidAt: null },
            { month: '02/2026', rent: '6,000,000', elecKwh: 70, elecTotal: '210,000', waterM3: 5, waterTotal: '75,000', total: '6,285,000', paid: true, paidAt: '05/02/2026' },
          ],
        },
        { id: '202', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'maintenance',
          tenant: null, phone: null, sinceDate: null, emptyFrom: '15/03/2026',
          currentIssue: { title: 'Hệ thống điện bị chập — đang thay lại toàn bộ dây', reportedAt: '15/03/2026 08:00', reportedBy: 'Thợ điện Quân' },
          issueHistory: [
            { id: 'h1', title: 'Cầu dao tự động nhảy liên tục', reportedAt: '10/03/2026 18:30', resolvedAt: null, resolvedBy: null },
          ],
          messages: [], paymentHistory: [],
        },
        { id: '203', type: 'Studio', area: '35m²', price: '6,000,000', status: 'empty',
          tenant: null, phone: null, sinceDate: null, emptyFrom: '01/02/2026',
          currentIssue: null, issueHistory: [], messages: [], paymentHistory: [],
        },
        { id: '204', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          tenant: 'Đỗ Hữu Nghĩa', phone: '0944222111', sinceDate: '10/08/2025',
          emptyFrom: null, currentIssue: null, issueHistory: [], messages: [],
          paymentHistory: [
            { month: '04/2026', rent: '3,500,000', elecKwh: 40, elecTotal: '120,000', waterM3: 2, waterTotal: '30,000', total: '3,650,000', paid: true, paidAt: '03/04/2026' },
            { month: '03/2026', rent: '3,500,000', elecKwh: 38, elecTotal: '114,000', waterM3: 2, waterTotal: '30,000', total: '3,644,000', paid: true, paidAt: '05/03/2026' },
          ],
        },
      ]},
      { floor: 3, rooms: [
        { id: '301', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          tenant: 'Phạm Thu Hà', phone: '0978888999', sinceDate: '05/09/2024',
          emptyFrom: null, currentIssue: null,
          issueHistory: [
            { id: 'h1', title: 'Bình nóng lạnh hỏng', reportedAt: '20/03/2026 07:00', resolvedAt: '21/03/2026 11:00', resolvedBy: 'Thợ nước Dũng' },
          ],
          messages: [],
          paymentHistory: [
            { month: '04/2026', rent: '3,500,000', elecKwh: 42, elecTotal: '126,000', waterM3: 3, waterTotal: '45,000', total: '3,671,000', paid: true, paidAt: '04/04/2026' },
            { month: '03/2026', rent: '3,500,000', elecKwh: 40, elecTotal: '120,000', waterM3: 3, waterTotal: '45,000', total: '3,665,000', paid: true, paidAt: '05/03/2026' },
            { month: '02/2026', rent: '3,500,000', elecKwh: 38, elecTotal: '114,000', waterM3: 2, waterTotal: '30,000', total: '3,644,000', paid: true, paidAt: '04/02/2026' },
          ],
        },
        { id: '302', type: 'Phòng VIP', area: '45m²', price: '8,500,000', status: 'occupied',
          tenant: 'Hoàng Đức Minh', phone: '0933222111', sinceDate: '01/11/2024',
          emptyFrom: null, currentIssue: null, issueHistory: [],
          messages: [
            { id: 'm1', text: 'Thang máy tầng 3 thỉnh thoảng kêu tiếng lạ', time: '22/04/2026 10:00', resolved: false },
          ],
          paymentHistory: [
            { month: '04/2026', rent: '8,500,000', elecKwh: 120, elecTotal: '360,000', waterM3: 8, waterTotal: '120,000', total: '8,980,000', paid: true, paidAt: '02/04/2026' },
            { month: '03/2026', rent: '8,500,000', elecKwh: 115, elecTotal: '345,000', waterM3: 8, waterTotal: '120,000', total: '8,965,000', paid: true, paidAt: '05/03/2026' },
            { month: '02/2026', rent: '8,500,000', elecKwh: 110, elecTotal: '330,000', waterM3: 7, waterTotal: '105,000', total: '8,935,000', paid: true, paidAt: '04/02/2026' },
          ],
        },
        { id: '303', type: 'Studio', area: '35m²', price: '6,000,000', status: 'empty',
          tenant: null, phone: null, sinceDate: null, emptyFrom: '10/03/2026',
          currentIssue: null, issueHistory: [], messages: [], paymentHistory: [],
        },
      ]},
    ],
  },
  {
    id: 'b2', name: 'Nhà B - Blue Sky', address: '45 Lê Lợi, Q.3',
    floors: [
      { floor: 1, rooms: [
        { id: 'B101', type: 'Phòng đơn', area: '22m²', price: '3,800,000', status: 'occupied',
          tenant: 'Mai Thị Hoa', phone: '0911000111', sinceDate: '10/04/2025',
          emptyFrom: null, currentIssue: null, issueHistory: [], messages: [],
          paymentHistory: [
            { month: '04/2026', rent: '3,800,000', elecKwh: 42, elecTotal: '126,000', waterM3: 3, waterTotal: '45,000', total: '3,971,000', paid: true, paidAt: '03/04/2026' },
            { month: '03/2026', rent: '3,800,000', elecKwh: 40, elecTotal: '120,000', waterM3: 3, waterTotal: '45,000', total: '3,965,000', paid: true, paidAt: '05/03/2026' },
          ],
        },
        { id: 'B102', type: 'Phòng đôi', area: '30m²', price: '5,000,000', status: 'occupied',
          tenant: 'Bùi Văn Tài', phone: '0922000222', sinceDate: '05/07/2025',
          emptyFrom: null, currentIssue: null,
          issueHistory: [
            { id: 'h1', title: 'Vòi sen bị hỏng', reportedAt: '08/04/2026 08:00', resolvedAt: '09/04/2026 14:00', resolvedBy: 'Thợ nước Dũng' },
          ],
          messages: [],
          paymentHistory: [
            { month: '04/2026', rent: '5,000,000', elecKwh: 60, elecTotal: '180,000', waterM3: 4, waterTotal: '60,000', total: '5,240,000', paid: false, paidAt: null },
            { month: '03/2026', rent: '5,000,000', elecKwh: 58, elecTotal: '174,000', waterM3: 4, waterTotal: '60,000', total: '5,234,000', paid: true, paidAt: '08/03/2026' },
          ],
        },
        { id: 'B103', type: 'Phòng đơn', area: '22m²', price: '3,800,000', status: 'maintenance',
          tenant: null, phone: null, sinceDate: null, emptyFrom: '20/03/2026',
          currentIssue: { title: 'Sơn lại toàn bộ phòng sau khi khách trả', reportedAt: '20/03/2026 10:00', reportedBy: 'NV Thu' },
          issueHistory: [], messages: [], paymentHistory: [],
        },
      ]},
      { floor: 2, rooms: [
        { id: 'B201', type: 'Studio', area: '38m²', price: '6,500,000', status: 'empty',
          tenant: null, phone: null, sinceDate: null, emptyFrom: '15/01/2026',
          currentIssue: null, issueHistory: [], messages: [], paymentHistory: [],
        },
        { id: 'B202', type: 'Phòng đôi', area: '30m²', price: '5,000,000', status: 'occupied',
          tenant: 'Ngô Thị Kim', phone: '0955000333', sinceDate: '12/10/2025',
          emptyFrom: null, currentIssue: null, issueHistory: [], messages: [],
          paymentHistory: [
            { month: '04/2026', rent: '5,000,000', elecKwh: 55, elecTotal: '165,000', waterM3: 4, waterTotal: '60,000', total: '5,225,000', paid: true, paidAt: '04/04/2026' },
            { month: '03/2026', rent: '5,000,000', elecKwh: 52, elecTotal: '156,000', waterM3: 4, waterTotal: '60,000', total: '5,216,000', paid: true, paidAt: '05/03/2026' },
          ],
        },
        { id: 'B203', type: 'Studio', area: '38m²', price: '6,500,000', status: 'empty',
          tenant: null, phone: null, sinceDate: null, emptyFrom: '28/03/2026',
          currentIssue: null, issueHistory: [], messages: [], paymentHistory: [],
        },
      ]},
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────
const STATUS = {
  occupied:    { label: 'Đang thuê', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)',  border: 'rgba(46,204,113,0.35)',  icon: '✅' },
  empty:       { label: 'Trống',     color: '#8892b0', bg: 'rgba(136,146,176,0.1)',  border: 'rgba(136,146,176,0.25)', icon: '🔓' },
  maintenance: { label: 'Bảo trì',   color: '#f1c40f', bg: 'rgba(241,196,15,0.12)',  border: 'rgba(241,196,15,0.35)',  icon: '🔧' },
  urgent:      { label: 'Khẩn cấp', color: '#e94560', bg: 'rgba(233,69,96,0.12)',   border: 'rgba(233,69,96,0.4)',    icon: '🚨' },
};

const FILTERS = ['Tất cả', 'Đang thuê', 'Trống', 'Bảo trì', 'Khẩn cấp'];
const FILTER_MAP = { 'Đang thuê': 'occupied', 'Trống': 'empty', 'Bảo trì': 'maintenance', 'Khẩn cấp': 'urgent' };

function daysSince(dateStr) {
  if (!dateStr) return 0;
  const [d, m, y] = dateStr.split('/').map(Number);
  const diff = new Date(2026, 3, 22) - new Date(y, m - 1, d);
  return Math.max(0, Math.floor(diff / 86400000));
}

function countRooms(building) {
  const all = building.floors.flatMap(f => f.rooms);
  return {
    total: all.length,
    occupied: all.filter(r => r.status === 'occupied').length,
    empty: all.filter(r => r.status === 'empty').length,
    maintenance: all.filter(r => r.status === 'maintenance').length,
    urgent: all.filter(r => r.status === 'urgent').length,
  };
}

// ─── Room Detail Modal ────────────────────────────────────
// resolverType: 'self' | 'contractor'
function RoomDetailModal({ room, staff, onClose, onResolveIssue, onResolveMessage }) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;
  const [visible,        setVisible]       = useState(false);
  const [resolving,      setResolving]     = useState(false);
  const [resolverType,   setResolverType]  = useState('self');
  const [contractorName, setContractorName]= useState('');
  const [resolveNote,    setResolveNote]   = useState('');
  const [confirmed,      setConfirmed]     = useState(false);
  // message resolution state
  const [resolvingMsgId,  setResolvingMsgId]  = useState(null);
  const [msgResolverType, setMsgResolverType] = useState('self');
  const [msgContractor,   setMsgContractor]   = useState('');
  const [msgNote,         setMsgNote]         = useState('');

  useEffect(() => {
    if (room) {
      setVisible(true);
      setResolving(false);
      setResolverType('self');
      setContractorName('');
      setResolveNote('');
      setConfirmed(false);
      setResolvingMsgId(null);
      setMsgResolverType('self');
      setMsgContractor('');
      setMsgNote('');
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 130 }),
        Animated.timing(backdrop,   { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [room]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 300, useNativeDriver: true }),
      Animated.timing(backdrop,   { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => { setVisible(false); onClose(); });
  };

  const handleConfirmResolve = () => {
    const resolverName = resolverType === 'self'
      ? staff.name
      : contractorName.trim();
    if (!resolverName) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên thợ xử lý.');
      return;
    }
    onResolveIssue(room.id, resolverName, resolveNote.trim());
    setConfirmed(true);
    setTimeout(handleClose, 1200);
  };

  const handleConfirmMsgResolve = msgId => {
    const resolver = msgResolverType === 'self' ? staff.name : msgContractor.trim();
    if (!resolver) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên người xử lý.'); return; }
    onResolveMessage(room.id, msgId, resolver, msgNote.trim());
    setResolvingMsgId(null);
    setMsgResolverType('self');
    setMsgContractor('');
    setMsgNote('');
  };

  if (!room && !visible) return null;

  const st           = room ? STATUS[room.status] : STATUS.empty;
  const isIssue      = room && (room.status === 'maintenance' || room.status === 'urgent');
  const isEmpty      = room && room.status === 'empty';
  const vacantDays   = room ? daysSince(room.emptyFrom) : 0;
  const pendingMsgs  = room ? (room.messages || []).filter(m => !m.resolved) : [];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[md.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      <Animated.View style={[md.sheet, { transform: [{ translateY }] }]}>
        <View style={md.handle} />

        {room && <>
          {/* Header */}
          <View style={[md.header, { borderLeftColor: st.color, borderLeftWidth: 4 }]}>
            <View style={[md.statusIcon, { backgroundColor: st.bg }]}>
              <Text style={{ fontSize: 22 }}>{st.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={md.roomTitle}>Phòng {room.id}</Text>
              <Text style={md.roomSub}>{room.type} · {room.area} · {room.price} ₫/tháng</Text>
            </View>
            <View style={[md.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
              <Text style={[md.statusBadgeText, { color: st.color }]}>{st.label}</Text>
            </View>
            <TouchableOpacity style={md.closeBtn} onPress={handleClose}>
              <Text style={md.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={md.scroll} showsVerticalScrollIndicator={false}>

            {/* ── Khách đang thuê ── */}
            {room.status === 'occupied' && (
              <Section title="👤 Khách đang thuê">
                <View style={md.infoCard}>
                  <InfoRow label="Tên khách"     value={room.tenant} />
                  <InfoRow label="Thuê từ ngày"  value={room.sinceDate} accent />
                  <InfoRow label="Số ngày đã ở"  value={`${daysSince(room.sinceDate)} ngày`} />
                  <InfoRow label="Số điện thoại" value={room.phone} />
                </View>
                <TouchableOpacity style={md.callBtn} onPress={() => Linking.openURL(`tel:${room.phone}`)}>
                  <Text style={md.callBtnText}>📞  Gọi điện cho {room.tenant}</Text>
                </TouchableOpacity>
              </Section>
            )}

            {/* ── Lịch sử thanh toán ── */}
            {room.status === 'occupied' && (room.paymentHistory || []).length > 0 && (
              <Section title="💰 Lịch sử thanh toán">
                {room.paymentHistory.map((p, idx) => (
                  <View key={idx} style={[md.payCard, !p.paid && md.payCardUnpaid]}>
                    <View style={md.payCardHeader}>
                      <Text style={md.payMonth}>Tháng {p.month}</Text>
                      <View style={[md.payStatusBadge, p.paid ? md.payStatusPaid : md.payStatusUnpaid]}>
                        <Text style={[md.payStatusText, { color: p.paid ? '#2ecc71' : '#e94560' }]}>
                          {p.paid ? '✅ Đã đóng' : '❌ Chưa đóng'}
                        </Text>
                      </View>
                    </View>
                    <View style={md.payRow}>
                      <Text style={md.payLabel}>Tiền thuê</Text>
                      <Text style={md.payValue}>{p.rent} ₫</Text>
                    </View>
                    <View style={md.payRow}>
                      <Text style={md.payLabel}>Điện ({p.elecKwh} kWh × 3,000)</Text>
                      <Text style={md.payValue}>{p.elecTotal} ₫</Text>
                    </View>
                    <View style={md.payRow}>
                      <Text style={md.payLabel}>Nước ({p.waterM3} m³ × 15,000)</Text>
                      <Text style={md.payValue}>{p.waterTotal} ₫</Text>
                    </View>
                    <View style={md.payDivider} />
                    <View style={md.payRow}>
                      <Text style={md.payTotalLabel}>Tổng cộng</Text>
                      <Text style={[md.payTotalVal, { color: p.paid ? '#2ecc71' : '#e94560' }]}>{p.total} ₫</Text>
                    </View>
                    {p.paid && p.paidAt && (
                      <Text style={md.payPaidAt}>📅 Ngày đóng: {p.paidAt}</Text>
                    )}
                  </View>
                ))}
              </Section>
            )}

            {/* ── Phòng trống ── */}
            {isEmpty && (
              <Section title="🔓 Tình trạng trống">
                <View style={md.vacantCard}>
                  <Text style={md.vacantLabel}>Trống từ ngày</Text>
                  <Text style={md.vacantDate}>{room.emptyFrom}</Text>
                  <View style={md.vacantCountBox}>
                    <Text style={md.vacantCount}>{vacantDays}</Text>
                    <Text style={md.vacantCountLabel}>ngày chưa có khách</Text>
                  </View>
                  {vacantDays > 30 && (
                    <View style={md.vacantAlert}>
                      <Text style={md.vacantAlertText}>⚠️ Trống hơn 30 ngày — cần đăng tin cho thuê</Text>
                    </View>
                  )}
                </View>
              </Section>
            )}

            {/* ── Vấn đề đang xảy ra ── */}
            {isIssue && room.currentIssue && (
              <Section title={room.status === 'urgent' ? '🚨 Vấn đề khẩn cấp' : '🔧 Vấn đề đang xử lý'}>
                <View style={[md.issueCard, room.status === 'urgent' && md.issueCardUrgent]}>
                  <Text style={[md.issueTitleText, room.status === 'urgent' && { color: '#e94560' }]}>
                    {room.currentIssue.title}
                  </Text>
                  <View style={md.issueMetaBox}>
                    <Text style={md.issueMeta}>📅 Phát hiện: {room.currentIssue.reportedAt}</Text>
                    <Text style={md.issueMeta}>👤 Bởi: {room.currentIssue.reportedBy}</Text>
                    {room.emptyFrom && (
                      <Text style={md.issueMeta}>🏠 Phòng dừng cho thuê từ: {room.emptyFrom} ({daysSince(room.emptyFrom)} ngày)</Text>
                    )}
                  </View>
                </View>

                {/* ── Xác nhận xử lý xong ── */}
                {confirmed ? (
                  <View style={md.confirmedBox}>
                    <Text style={md.confirmedText}>✅  Đã xác nhận xử lý xong! Đang cập nhật hệ thống...</Text>
                  </View>
                ) : (
                  <View style={md.resolveBox}>
                    <TouchableOpacity
                      style={md.resolveToggle}
                      onPress={() => setResolving(r => !r)}
                    >
                      <View style={[md.checkbox, resolving && md.checkboxChecked]}>
                        {resolving && <Text style={md.checkmark}>✓</Text>}
                      </View>
                      <Text style={md.resolveToggleText}>Đánh dấu đã xử lý xong vấn đề này</Text>
                    </TouchableOpacity>

                    {resolving && (
                      <View style={md.resolveForm}>
                        {/* Dropdown: người xử lý */}
                        <Text style={md.resolveFormLabel}>Người xử lý vấn đề *</Text>
                        <View style={md.dropdownBox}>
                          <TouchableOpacity
                            style={[md.dropdownOption, resolverType === 'self' && md.dropdownSelected]}
                            onPress={() => setResolverType('self')}
                          >
                            <View style={[md.radioCircle, resolverType === 'self' && md.radioSelected]}>
                              {resolverType === 'self' && <View style={md.radioDot} />}
                            </View>
                            <View style={md.dropdownOptionContent}>
                              <Text style={md.dropdownOptionTitle}>Tự xử lý</Text>
                              <Text style={md.dropdownOptionSub}>{staff.avatar}  {staff.name}</Text>
                            </View>
                          </TouchableOpacity>
                          <View style={md.dropdownDivider} />
                          <TouchableOpacity
                            style={[md.dropdownOption, resolverType === 'contractor' && md.dropdownSelected]}
                            onPress={() => setResolverType('contractor')}
                          >
                            <View style={[md.radioCircle, resolverType === 'contractor' && md.radioSelected]}>
                              {resolverType === 'contractor' && <View style={md.radioDot} />}
                            </View>
                            <View style={md.dropdownOptionContent}>
                              <Text style={md.dropdownOptionTitle}>Thợ bên ngoài</Text>
                              <Text style={md.dropdownOptionSub}>👷  Nhập tên thợ bên dưới</Text>
                            </View>
                          </TouchableOpacity>
                        </View>

                        {resolverType === 'contractor' && (
                          <TextInput
                            style={md.resolveInput}
                            placeholder="Tên thợ / đơn vị thi công..."
                            placeholderTextColor="#8892b0"
                            value={contractorName}
                            onChangeText={setContractorName}
                          />
                        )}

                        <Text style={[md.resolveFormLabel, { marginTop: 12 }]}>Ghi chú kết quả xử lý (tùy chọn)</Text>
                        <TextInput
                          style={[md.resolveInput, md.resolveInputMulti]}
                          placeholder="VD: Đã thay mới ống nước, kiểm tra hoàn tất..."
                          placeholderTextColor="#8892b0"
                          value={resolveNote}
                          onChangeText={setResolveNote}
                          multiline
                          numberOfLines={3}
                        />
                        <View style={md.resolveTimestamp}>
                          <Text style={md.resolveTimestampText}>🕐 Thời gian xác nhận: {DEMO_NOW_DISPLAY}</Text>
                        </View>
                        <TouchableOpacity style={md.confirmBtn} onPress={handleConfirmResolve}>
                          <LinearGradient colors={['#2ecc71', '#27ae60']} style={md.confirmGradient}>
                            <Text style={md.confirmBtnText}>✅  Xác nhận đã xử lý xong</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </Section>
            )}

            {/* ── Tin nhắn từ khách ── */}
            {(room.messages || []).length > 0 && (
              <Section title="💬 Tin nhắn từ khách" badge={pendingMsgs.length > 0 ? `${pendingMsgs.length} chờ xử lý` : null}>
                {room.messages.map(msg => (
                  <View key={msg.id} style={[md.msgCard, !msg.resolved && md.msgCardPending]}>
                    <View style={md.msgTop}>
                      <Text style={md.msgTime}>{msg.time}</Text>
                      <View style={[md.msgTag, msg.resolved && md.msgTagDone]}>
                        <Text style={[md.msgTagText, msg.resolved && { color: '#2ecc71' }]}>
                          {msg.resolved ? '✅ Đã xử lý' : '⏳ Chờ xử lý'}
                        </Text>
                      </View>
                    </View>
                    <Text style={md.msgText}>"{msg.text}"</Text>

                    {/* Resolved info */}
                    {msg.resolved && msg.resolvedBy && (
                      <View style={md.msgResolvedInfo}>
                        <Text style={md.msgResolvedText}>👷 Xử lý bởi: {msg.resolvedBy}</Text>
                        {msg.resolvedAt   && <Text style={md.msgResolvedDate}>🕐 {msg.resolvedAt}</Text>}
                        {msg.resolveNote  && <Text style={md.msgResolvedNote}>📝 {msg.resolveNote}</Text>}
                      </View>
                    )}

                    {/* Action buttons */}
                    {!msg.resolved && (
                      <>
                        <View style={md.msgActions}>
                          {room.phone && (
                            <TouchableOpacity style={md.msgCallBtn} onPress={() => Linking.openURL(`tel:${room.phone}`)}>
                              <Text style={md.msgCallText}>📞 Gọi xử lý</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[md.msgDoneBtn, resolvingMsgId === msg.id && md.msgDoneBtnActive]}
                            onPress={() => {
                              if (resolvingMsgId === msg.id) {
                                setResolvingMsgId(null);
                              } else {
                                setResolvingMsgId(msg.id);
                                setMsgResolverType('self');
                                setMsgContractor('');
                                setMsgNote('');
                              }
                            }}
                          >
                            <Text style={[md.msgDoneText, resolvingMsgId === msg.id && { color: '#f1c40f' }]}>
                              {resolvingMsgId === msg.id ? '▲ Thu gọn' : '✓ Xác nhận đã xử lý'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Inline resolution form */}
                        {resolvingMsgId === msg.id && (
                          <View style={md.msgResolveForm}>
                            <Text style={md.resolveFormLabel}>Người xử lý vấn đề *</Text>
                            <View style={md.dropdownBox}>
                              <TouchableOpacity
                                style={[md.dropdownOption, msgResolverType === 'self' && md.dropdownSelected]}
                                onPress={() => setMsgResolverType('self')}
                              >
                                <View style={[md.radioCircle, msgResolverType === 'self' && md.radioSelected]}>
                                  {msgResolverType === 'self' && <View style={md.radioDot} />}
                                </View>
                                <View style={md.dropdownOptionContent}>
                                  <Text style={md.dropdownOptionTitle}>Tự xử lý</Text>
                                  <Text style={md.dropdownOptionSub}>{staff.avatar}  {staff.name}</Text>
                                </View>
                              </TouchableOpacity>
                              <View style={md.dropdownDivider} />
                              <TouchableOpacity
                                style={[md.dropdownOption, msgResolverType === 'contractor' && md.dropdownSelected]}
                                onPress={() => setMsgResolverType('contractor')}
                              >
                                <View style={[md.radioCircle, msgResolverType === 'contractor' && md.radioSelected]}>
                                  {msgResolverType === 'contractor' && <View style={md.radioDot} />}
                                </View>
                                <View style={md.dropdownOptionContent}>
                                  <Text style={md.dropdownOptionTitle}>Thợ bên ngoài</Text>
                                  <Text style={md.dropdownOptionSub}>👷  Nhập tên thợ bên dưới</Text>
                                </View>
                              </TouchableOpacity>
                            </View>

                            {msgResolverType === 'contractor' && (
                              <TextInput
                                style={md.resolveInput}
                                placeholder="Tên thợ / đơn vị xử lý..."
                                placeholderTextColor="#8892b0"
                                value={msgContractor}
                                onChangeText={setMsgContractor}
                              />
                            )}

                            <Text style={[md.resolveFormLabel, { marginTop: 12 }]}>Ghi chú kết quả (tùy chọn)</Text>
                            <TextInput
                              style={[md.resolveInput, md.resolveInputMulti]}
                              placeholder="VD: Đã liên hệ khách, vấn đề đã được xử lý..."
                              placeholderTextColor="#8892b0"
                              value={msgNote}
                              onChangeText={setMsgNote}
                              multiline
                              numberOfLines={3}
                            />
                            <View style={md.resolveTimestamp}>
                              <Text style={md.resolveTimestampText}>🕐 Thời gian xác nhận: {DEMO_NOW_DISPLAY}</Text>
                            </View>
                            <TouchableOpacity style={md.confirmBtn} onPress={() => handleConfirmMsgResolve(msg.id)}>
                              <LinearGradient colors={['#2ecc71', '#27ae60']} style={md.confirmGradient}>
                                <Text style={md.confirmBtnText}>✅  Xác nhận đã xử lý xong</Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                ))}
              </Section>
            )}

            {/* ── Lịch sử giải quyết sự cố ── */}
            <Section title="📋 Lịch sử giải quyết sự cố">
              {(room.issueHistory || []).length === 0 ? (
                <View style={md.emptyHistory}>
                  <Text style={md.emptyHistoryText}>✅  Chưa có vấn đề nào được ghi nhận</Text>
                </View>
              ) : (
                room.issueHistory.map((issue, idx) => (
                  <View key={issue.id} style={md.timelineRow}>
                    <View style={md.timelineLeft}>
                      <View style={[md.dot, { backgroundColor: issue.resolvedAt ? '#2ecc71' : '#f1c40f' }]} />
                      {idx < room.issueHistory.length - 1 && <View style={md.timelineBar} />}
                    </View>
                    <View style={md.timelineContent}>
                      <Text style={md.historyTitle}>{issue.title}</Text>
                      <HistoryRow label="📅 Phản ánh:"   value={issue.reportedAt} />
                      {issue.resolvedAt
                        ? <HistoryRow label="✅ Xử lý xong:" value={issue.resolvedAt} valueColor="#2ecc71" />
                        : <HistoryRow label="⏳ Trạng thái:" value="Đang xử lý" valueColor="#f1c40f" />
                      }
                      {issue.resolvedBy && <HistoryRow label="👷 Người xử lý:" value={issue.resolvedBy} />}
                    </View>
                  </View>
                ))
              )}
            </Section>

            <View style={{ height: 48 }} />
          </ScrollView>
        </>}
      </Animated.View>
    </Modal>
  );
}

function Section({ title, badge, children }) {
  return (
    <View style={md.section}>
      <View style={md.sectionHeader}>
        <Text style={md.sectionTitle}>{title}</Text>
        {badge && <View style={md.badge}><Text style={md.badgeText}>{badge}</Text></View>}
      </View>
      {children}
    </View>
  );
}

function InfoRow({ label, value, accent }) {
  return (
    <View style={md.infoRow}>
      <Text style={md.infoLabel}>{label}</Text>
      <Text style={[md.infoValue, accent && { color: '#4facfe' }]}>{value || '—'}</Text>
    </View>
  );
}

function HistoryRow({ label, value, valueColor }) {
  return (
    <View style={md.historyMetaRow}>
      <Text style={md.historyMetaLabel}>{label}</Text>
      <Text style={[md.historyMetaVal, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

// ─── Building Rooms Modal ─────────────────────────────────
const ROOMS_MODAL_CFG = {
  all:         { title: 'Tất cả phòng',        icon: '🏢', color: '#4facfe' },
  occupied:    { title: 'Phòng đang cho thuê',  icon: '✅', color: '#2ecc71' },
  empty:       { title: 'Phòng đang trống',     icon: '🔓', color: '#8892b0' },
  maintenance: { title: 'Phòng đang bảo trì',   icon: '🔧', color: '#f1c40f' },
  urgent:      { title: 'Phòng khẩn cấp',       icon: '🚨', color: '#e94560' },
};

function BuildingRoomsModal({ data, onClose, onSelectRoom }) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 130 }),
      Animated.timing(backdrop,   { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 300, useNativeDriver: true }),
      Animated.timing(backdrop,   { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onClose);
  };

  const goToRoom = room => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 220, useNativeDriver: true }),
      Animated.timing(backdrop,   { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onSelectRoom(room));
  };

  const cfg = ROOMS_MODAL_CFG[data.type];
  const allRooms = data.building.floors.flatMap(f => f.rooms);
  const filtered = data.type === 'all' ? allRooms : allRooms.filter(r => r.status === data.type);

  const byFloor = data.building.floors
    .map(fl => ({ floor: fl.floor, rooms: fl.rooms.filter(r => data.type === 'all' || r.status === data.type) }))
    .filter(fl => fl.rooms.length > 0)
    .sort((a, b) => a.floor - b.floor);

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[md.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[md.sheet, { transform: [{ translateY }], maxHeight: '85%' }]}>
        <View style={md.handle} />
        <View style={[md.header, { borderLeftWidth: 0 }]}>
          <View style={[md.statusIcon, { backgroundColor: cfg.color + '22' }]}>
            <Text style={{ fontSize: 22 }}>{cfg.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={md.roomTitle}>{cfg.title}</Text>
            <Text style={md.roomSub}>🏢 {data.building.name} · {filtered.length} phòng</Text>
          </View>
          <TouchableOpacity style={md.closeBtn} onPress={handleClose}>
            <Text style={md.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={md.scroll} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 44 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
              <Text style={{ color: '#8892b0', fontSize: 14 }}>Không có phòng nào trong danh sách này</Text>
            </View>
          ) : (
            byFloor.map(({ floor, rooms }) => (
              <View key={floor} style={{ marginTop: 16 }}>
                <View style={rm.floorBar}>
                  <Text style={rm.floorBarText}>Tầng {floor}</Text>
                  <Text style={rm.floorBarCount}>{rooms.length} phòng</Text>
                </View>
                {rooms.map(room => {
                  const st = STATUS[room.status];
                  const pending = (room.messages || []).filter(m => !m.resolved).length;
                  return (
                    <TouchableOpacity
                      key={room.id}
                      style={[rm.card, { borderLeftColor: st.color }]}
                      onPress={() => goToRoom(room)}
                      activeOpacity={0.75}
                    >
                      <View style={[rm.statusDot, { backgroundColor: st.bg, borderColor: st.border }]}>
                        <Text style={{ fontSize: 14 }}>{st.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={rm.roomId}>Phòng {room.id}</Text>
                          <View style={[rm.statusTag, { backgroundColor: st.bg, borderColor: st.border }]}>
                            <Text style={[rm.statusTagText, { color: st.color }]}>{st.label}</Text>
                          </View>
                        </View>
                        <Text style={rm.roomMeta}>{room.type} · {room.area} · {room.price} ₫/tháng</Text>
                        {room.tenant && (
                          <Text style={rm.tenantLine}>👤 {room.tenant}  ·  Từ {room.sinceDate}</Text>
                        )}
                        {room.currentIssue && (
                          <Text style={rm.issueLine} numberOfLines={1}>⚠️ {room.currentIssue.title}</Text>
                        )}
                        {!room.tenant && room.emptyFrom && (
                          <Text style={rm.emptyLine}>🔓 Trống từ {room.emptyFrom} · {daysSince(room.emptyFrom)} ngày</Text>
                        )}
                        {pending > 0 && (
                          <Text style={rm.pendingLine}>💬 {pending} tin nhắn chờ xử lý</Text>
                        )}
                      </View>
                      <Text style={rm.arrow}>›</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Pending Messages Modal ───────────────────────────────
function PendingMessagesModal({ buildings, onClose, onResolveMessage }) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 130 }),
      Animated.timing(backdrop,   { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 300, useNativeDriver: true }),
      Animated.timing(backdrop,   { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onClose);
  };

  const pendingList = [];
  buildings.forEach(b => {
    b.floors.forEach(fl => {
      fl.rooms.forEach(r => {
        (r.messages || []).filter(m => !m.resolved).forEach(m => {
          pendingList.push({ ...m, roomId: r.id, tenantName: r.tenant, phone: r.phone, buildingName: b.name });
        });
      });
    });
  });

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[md.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[md.sheet, { transform: [{ translateY }], maxHeight: '85%' }]}>
        <View style={md.handle} />
        <View style={[md.header, { borderLeftWidth: 0 }]}>
          <View style={[md.statusIcon, { backgroundColor: 'rgba(79,172,254,0.12)' }]}>
            <Text style={{ fontSize: 22 }}>💬</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={md.roomTitle}>Tin nhắn chờ xử lý</Text>
            <Text style={md.roomSub}>{pendingList.length} tin nhắn cần phản hồi</Text>
          </View>
          <TouchableOpacity style={md.closeBtn} onPress={handleClose}>
            <Text style={md.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={md.scroll} showsVerticalScrollIndicator={false}>
          {pendingList.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
              <Text style={{ color: '#2ecc71', fontSize: 14, fontWeight: '700' }}>Không có tin nhắn chờ xử lý</Text>
            </View>
          ) : (
            pendingList.map((msg, idx) => (
              <View key={`${msg.roomId}-${msg.id}`} style={[md.msgCard, md.msgCardPending, { marginTop: idx === 0 ? 16 : 0 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <View>
                    <Text style={{ color: '#4facfe', fontSize: 13, fontWeight: '700' }}>Phòng {msg.roomId}</Text>
                    <Text style={{ color: '#8892b0', fontSize: 11, marginTop: 1 }}>🏢 {msg.buildingName}</Text>
                  </View>
                  <Text style={md.msgTime}>{msg.time}</Text>
                </View>
                {msg.tenantName && (
                  <Text style={{ color: '#ccd6f6', fontSize: 12, marginBottom: 8 }}>👤 {msg.tenantName}</Text>
                )}
                <Text style={md.msgText}>"{msg.text}"</Text>
                <View style={md.msgActions}>
                  {msg.phone && (
                    <TouchableOpacity style={md.msgCallBtn} onPress={() => Linking.openURL(`tel:${msg.phone}`)}>
                      <Text style={md.msgCallText}>📞 Gọi xử lý</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={md.msgDoneBtn} onPress={() => onResolveMessage(msg.roomId, msg.id)}>
                    <Text style={md.msgDoneText}>✓ Đã xử lý</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Staff Profile Modal ──────────────────────────────────
function StaffProfileModal({ staff, onClose, onSave }) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;
  const [name,      setName]      = useState(staff.name);
  const [phone,     setPhone]     = useState(staff.phone);
  const [gender,    setGender]    = useState(staff.gender || 'female'); // 'male' | 'female'
  const [photoUri,  setPhotoUri]  = useState(staff.photoUri || null);

  useEffect(() => {
    setName(staff.name); setPhone(staff.phone);
    setGender(staff.gender || 'female');
    setPhotoUri(staff.photoUri || null);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 130 }),
      Animated.timing(backdrop,   { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 300, useNativeDriver: true }),
      Animated.timing(backdrop,   { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onClose);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép ứng dụng truy cập thư viện ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập họ tên.'); return; }
    const avatar = gender === 'male' ? '👨' : '👩';
    onSave({ name: name.trim(), phone: phone.trim(), avatar, gender, photoUri });
    handleClose();
  };

  const previewAvatar = photoUri ? null : (gender === 'male' ? '👨' : '👩');

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[md.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[md.sheet, { transform: [{ translateY }], maxHeight: '78%' }]}>
        <View style={md.handle} />
        <View style={pf.header}>
          <Text style={pf.title}>Cập nhật thông tin</Text>
          <TouchableOpacity style={md.closeBtn} onPress={handleClose}>
            <Text style={md.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={pf.scroll} showsVerticalScrollIndicator={false}>

          {/* Preview avatar */}
          <View style={pf.previewRow}>
            <View style={pf.previewBox}>
              {photoUri
                ? <Image source={{ uri: photoUri }} style={pf.previewPhoto} />
                : <Text style={pf.previewEmoji}>{previewAvatar}</Text>
              }
            </View>
            <View style={pf.previewActions}>
              <Text style={pf.previewName}>{name || 'Họ và tên'}</Text>
              <TouchableOpacity style={pf.uploadBtn} onPress={handlePickImage}>
                <Text style={pf.uploadBtnText}>📷  Tải ảnh lên</Text>
              </TouchableOpacity>
              {photoUri && (
                <TouchableOpacity style={pf.removePhotoBtn} onPress={() => setPhotoUri(null)}>
                  <Text style={pf.removePhotoText}>✕ Bỏ ảnh</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Gender */}
          <Text style={pf.label}>Giới tính</Text>
          <View style={pf.genderRow}>
            <TouchableOpacity
              style={[pf.genderBtn, gender === 'female' && pf.genderSelected]}
              onPress={() => { setGender('female'); setPhotoUri(null); }}
            >
              <Text style={pf.genderEmoji}>👩</Text>
              <Text style={[pf.genderLabel, gender === 'female' && { color: '#4facfe' }]}>Nữ</Text>
              {gender === 'female' && !photoUri && <View style={pf.genderCheck}><Text style={{ color: '#fff', fontSize: 10 }}>✓</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[pf.genderBtn, gender === 'male' && pf.genderSelected]}
              onPress={() => { setGender('male'); setPhotoUri(null); }}
            >
              <Text style={pf.genderEmoji}>👨</Text>
              <Text style={[pf.genderLabel, gender === 'male' && { color: '#4facfe' }]}>Nam</Text>
              {gender === 'male' && !photoUri && <View style={pf.genderCheck}><Text style={{ color: '#fff', fontSize: 10 }}>✓</Text></View>}
            </TouchableOpacity>
          </View>

          <Text style={pf.label}>Họ và tên *</Text>
          <TextInput style={pf.input} value={name} onChangeText={setName} placeholder="Nhập họ tên..." placeholderTextColor="#8892b0" />
          <Text style={pf.label}>Số điện thoại</Text>
          <TextInput style={pf.input} value={phone} onChangeText={setPhone} placeholder="Nhập SĐT..." placeholderTextColor="#8892b0" keyboardType="phone-pad" />

          <TouchableOpacity style={pf.saveBtn} onPress={handleSave}>
            <LinearGradient colors={['#4facfe', '#3a8de0']} style={pf.saveGradient}>
              <Text style={pf.saveBtnText}>💾  Lưu thông tin</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function StaffRoomsScreen() {
  const [buildings,    setBuildings]    = useState(INITIAL_BUILDINGS);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('Tất cả');
  const [collapsed,    setCollapsed]    = useState({});
  const [selected,     setSelected]     = useState(null);
  const [showProfile,  setShowProfile]  = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [roomsModal,   setRoomsModal]   = useState(null);
  const [staff, setStaff] = useState({ name: 'Trần Thị Thu', phone: '0912 333 444', avatar: '👩‍💼' });

  const toggleBuilding = id => {
    LayoutAnimation.configureNext({
      duration: 280,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.75 },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    setCollapsed(p => ({ ...p, [id]: !p[id] }));
  };

  // ── Xác nhận xử lý xong vấn đề ──
  const handleResolveIssue = (roomId, staffName, note) => {
    setBuildings(prev => prev.map(b => ({
      ...b,
      floors: b.floors.map(fl => ({
        ...fl,
        rooms: fl.rooms.map(r => {
          if (r.id !== roomId || !r.currentIssue) return r;
          const resolvedEntry = {
            id: `h${Date.now()}`,
            title: r.currentIssue.title,
            reportedAt: r.currentIssue.reportedAt,
            resolvedAt: DEMO_NOW_DISPLAY,
            resolvedBy: staffName + (note ? ` — ${note}` : ''),
          };
          return {
            ...r,
            status: 'empty',
            emptyFrom: DEMO_NOW,
            currentIssue: null,
            issueHistory: [...(r.issueHistory || []), resolvedEntry],
          };
        }),
      })),
    })));
    // Cập nhật selected room để modal phản ánh ngay
    setSelected(prev => {
      if (!prev || prev.id !== roomId) return prev;
      const resolvedEntry = {
        id: `h${Date.now()}`,
        title: prev.currentIssue.title,
        reportedAt: prev.currentIssue.reportedAt,
        resolvedAt: DEMO_NOW_DISPLAY,
        resolvedBy: staffName + (note ? ` — ${note}` : ''),
      };
      return {
        ...prev,
        status: 'empty',
        emptyFrom: DEMO_NOW,
        currentIssue: null,
        issueHistory: [...(prev.issueHistory || []), resolvedEntry],
      };
    });
  };

  // ── Đánh dấu tin nhắn đã xử lý ──
  const handleResolveMessage = (roomId, msgId, resolverName = null, note = null) => {
    const update = m => m.id !== msgId ? m : {
      ...m, resolved: true,
      ...(resolverName && { resolvedBy: resolverName }),
      ...(note         && { resolveNote: note }),
      resolvedAt: DEMO_NOW_DISPLAY,
    };
    setBuildings(prev => prev.map(b => ({
      ...b,
      floors: b.floors.map(fl => ({
        ...fl,
        rooms: fl.rooms.map(r => r.id !== roomId ? r : { ...r, messages: r.messages.map(update) }),
      })),
    })));
    setSelected(prev => prev && prev.id === roomId
      ? { ...prev, messages: prev.messages.map(update) }
      : prev);
  };

  const matchRoom = room => {
    const q = search.toLowerCase();
    const matchSearch = !q || room.id.toLowerCase().includes(q) || (room.tenant && room.tenant.toLowerCase().includes(q));
    const matchFilter = filter === 'Tất cả' || room.status === FILTER_MAP[filter];
    return matchSearch && matchFilter;
  };

  const allRooms    = buildings.flatMap(b => b.floors.flatMap(f => f.rooms));
  const urgentCount = allRooms.filter(r => r.status === 'urgent').length;
  const maintCount  = allRooms.filter(r => r.status === 'maintenance').length;
  const pendingMsgs = allRooms.flatMap(r => (r.messages || []).filter(m => !m.resolved));

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <RoomDetailModal
        room={selected}
        staff={staff}
        onClose={() => setSelected(null)}
        onResolveIssue={handleResolveIssue}
        onResolveMessage={handleResolveMessage}
      />

      {showProfile && (
        <StaffProfileModal
          staff={staff}
          onClose={() => setShowProfile(false)}
          onSave={updated => setStaff(prev => ({ ...prev, ...updated }))}
        />
      )}

      {roomsModal && (
        <BuildingRoomsModal
          data={roomsModal}
          onClose={() => setRoomsModal(null)}
          onSelectRoom={room => { setRoomsModal(null); setSelected(room); }}
        />
      )}

      {showMessages && (
        <PendingMessagesModal
          buildings={buildings}
          onClose={() => setShowMessages(false)}
          onResolveMessage={(roomId, msgId) => { handleResolveMessage(roomId, msgId); }}
        />
      )}

      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.header}>
          <View style={s.headerRow}>
            <TouchableOpacity style={s.staffCard} onPress={() => setShowProfile(true)} activeOpacity={0.8}>
              <View style={s.staffAvatarBox}>
                {staff.photoUri
                  ? <Image source={{ uri: staff.photoUri }} style={s.staffAvatarPhoto} />
                  : <Text style={s.staffAvatarEmoji}>{staff.avatar}</Text>
                }
              </View>
              <View style={s.staffInfo}>
                <Text style={s.staffName}>{staff.name}</Text>
                <View style={s.staffRoleBadge}>
                  <Text style={s.staffRoleText}>💼 Nhân viên quản lý</Text>
                </View>
                <Text style={s.staffPhone}>{staff.phone}</Text>
              </View>
              <View style={s.editBadge}>
                <Text style={s.editBadgeText}>✎  Chỉnh sửa</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={s.title}>Tổng quan phòng</Text>
          <Text style={s.subtitle}>22/04/2026</Text>
        </LinearGradient>

        {/* ── Tóm tắt công việc ── */}
        {(urgentCount > 0 || maintCount > 0 || pendingMsgs.length > 0) && (
          <View style={s.taskPanel}>
            <Text style={s.taskPanelTitle}>⚡ Việc cần xử lý hôm nay</Text>
            <View style={s.taskRow}>
              {urgentCount > 0 && (
                <TouchableOpacity style={[s.taskCard, s.taskCardRed]} onPress={() => setFilter('Khẩn cấp')}>
                  <Text style={s.taskCardNum}>{urgentCount}</Text>
                  <Text style={s.taskCardLabel}>Khẩn cấp</Text>
                  <Text style={s.taskCardHint}>Nhấn để lọc →</Text>
                </TouchableOpacity>
              )}
              {maintCount > 0 && (
                <TouchableOpacity style={[s.taskCard, s.taskCardYellow]} onPress={() => setFilter('Bảo trì')}>
                  <Text style={s.taskCardNum}>{maintCount}</Text>
                  <Text style={s.taskCardLabel}>Bảo trì</Text>
                  <Text style={s.taskCardHint}>Nhấn để lọc →</Text>
                </TouchableOpacity>
              )}
              {pendingMsgs.length > 0 && (
                <TouchableOpacity style={[s.taskCard, s.taskCardBlue]} onPress={() => setShowMessages(true)}>
                  <Text style={s.taskCardNum}>{pendingMsgs.length}</Text>
                  <Text style={s.taskCardLabel}>Tin nhắn</Text>
                  <Text style={s.taskCardHint}>Nhấn xem →</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Tìm số phòng, tên khách..."
            placeholderTextColor="#8892b0"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#8892b0', fontSize: 18, paddingHorizontal: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={s.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} style={[s.filterBtn, filter === f && s.filterActive]} onPress={() => setFilter(f)}>
              <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Buildings */}
        {buildings.map(building => {
          const counts = countRooms(building);
          const isOpen = !collapsed[building.id];
          const pct    = Math.round((counts.occupied / counts.total) * 100);
          const hasMatch = building.floors.some(fl => fl.rooms.some(matchRoom));
          if (!hasMatch) return null;

          return (
            <View key={building.id} style={s.buildingCard}>
              <TouchableOpacity style={s.buildingHeader} onPress={() => toggleBuilding(building.id)}>
                <View style={s.buildingIconBox}><Text style={{ fontSize: 20 }}>🏢</Text></View>
                <View style={s.buildingMeta}>
                  <Text style={s.buildingName}>{building.name}</Text>
                  <Text style={s.buildingAddr}>📍 {building.address}</Text>
                </View>
                <Text style={s.collapseIcon}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              <View style={s.pillRow}>
                <Pill val={counts.total}    lbl="Tổng phòng"
                  onPress={() => setRoomsModal({ type: 'all', building })} />
                <Pill val={counts.occupied} lbl="Cho thuê"  color="#2ecc71"
                  onPress={() => setRoomsModal({ type: 'occupied', building })} />
                <Pill val={counts.empty}    lbl="Trống"     color="#8892b0"
                  onPress={() => setRoomsModal({ type: 'empty', building })} />
                {counts.maintenance > 0 && (
                  <Pill val={counts.maintenance} lbl="Bảo trì"  color="#f1c40f"
                    onPress={() => setRoomsModal({ type: 'maintenance', building })} />
                )}
                {counts.urgent > 0 && (
                  <Pill val={counts.urgent} lbl="Khẩn cấp" color="#e94560" urgent
                    onPress={() => setRoomsModal({ type: 'urgent', building })} />
                )}
              </View>

              <View style={s.pctRow}>
                <View style={s.bar}>
                  <View style={[s.barSeg, { flex: counts.occupied,    backgroundColor: '#2ecc71' }]} />
                  <View style={[s.barSeg, { flex: counts.empty,       backgroundColor: '#333' }]} />
                  <View style={[s.barSeg, { flex: counts.maintenance, backgroundColor: '#f1c40f' }]} />
                  <View style={[s.barSeg, { flex: counts.urgent,      backgroundColor: '#e94560' }]} />
                </View>
                <Text style={s.pctLabel}><Text style={s.pctNum}>{pct}%</Text>  lấp đầy</Text>
              </View>

              {isOpen && <FloorDiagram floors={building.floors} onSelectRoom={setSelected} />}

              {isOpen && building.floors.map(floor => {
                const visible = floor.rooms.filter(matchRoom);
                if (!visible.length) return null;
                return (
                  <View key={floor.floor} style={s.floorSection}>
                    <View style={s.floorLabel}>
                      <Text style={s.floorText}>Tầng {floor.floor}</Text>
                      <Text style={s.floorCount}>{visible.length} phòng</Text>
                    </View>
                    {visible.map(room => {
                      const st = STATUS[room.status];
                      const pending = (room.messages || []).filter(m => !m.resolved).length;
                      return (
                        <TouchableOpacity
                          key={room.id}
                          style={[s.roomRow, { borderLeftColor: st.color }]}
                          onPress={() => setSelected(room)}
                        >
                          <View style={s.roomLeft}>
                            <Text style={s.roomId}>P{room.id}</Text>
                            <Text style={s.roomType}>{room.type}</Text>
                            <Text style={s.roomArea}>{room.area}</Text>
                          </View>
                          <View style={s.roomMid}>
                            {room.tenant
                              ? <>
                                  <Text style={s.tenantName}>👤 {room.tenant}</Text>
                                  <Text style={s.tenantSince}>Từ {room.sinceDate}</Text>
                                </>
                              : <Text style={[s.noTenant, room.status === 'urgent' && { color: '#e94560', fontWeight: '700' }]}>
                                  {room.status === 'urgent' ? '🚨 Cần xử lý khẩn' : room.status === 'maintenance' ? '🔧 Đang bảo trì' : `🔓 Trống ${daysSince(room.emptyFrom)} ngày`}
                                </Text>
                            }
                            {room.currentIssue && (
                              <Text style={s.issuePeek} numberOfLines={1}>⚠️ {room.currentIssue.title}</Text>
                            )}
                            {pending > 0 && (
                              <View style={s.msgBadge}><Text style={s.msgBadgeText}>💬 {pending} tin chờ</Text></View>
                            )}
                          </View>
                          <View style={s.roomRight}>
                            <View style={[s.statusPill, { backgroundColor: st.bg, borderColor: st.border }]}>
                              <Text style={[s.statusText, { color: st.color }]}>{st.icon} {st.label}</Text>
                            </View>
                            <Text style={[s.roomPrice, { color: st.color }]}>{room.price} ₫</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Floor Diagram ────────────────────────────────────────
function FloorDiagram({ floors, onSelectRoom }) {
  const sorted = [...floors].sort((a, b) => a.floor - b.floor);
  return (
    <View style={fd.wrap}>
      {sorted.map(fl => (
        <View key={fl.floor} style={fd.row}>
          <View style={fd.floorTag}>
            <Text style={fd.floorTagText}>T{fl.floor}</Text>
          </View>
          <View style={fd.rooms}>
            {fl.rooms.map(room => {
              const st = STATUS[room.status];
              return (
                <TouchableOpacity
                  key={room.id}
                  style={[fd.box, { backgroundColor: st.bg, borderColor: st.color + '99' }]}
                  onPress={() => onSelectRoom(room)}
                  activeOpacity={0.75}
                >
                  <Text style={[fd.boxId, { color: st.color }]}>{room.id}</Text>
                  <Text style={fd.boxIcon}>{st.icon}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

function Pill({ val, lbl, color, urgent, onPress }) {
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <Wrap
      style={[s.pill, color && { borderColor: color + '44' }, urgent && { backgroundColor: 'rgba(233,69,96,0.08)' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[s.pillVal, color && { color }]}>{val}</Text>
      <Text style={s.pillLbl}>{lbl}</Text>
    </Wrap>
  );
}

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { padding: 20, paddingTop: 10, paddingBottom: 16 },
  headerRow: { marginBottom: 14 },
  staffCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  staffAvatarBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(79,172,254,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14, position: 'relative', overflow: 'hidden' },
  staffAvatarEmoji: { fontSize: 28 },
  staffAvatarPhoto: { width: 52, height: 52, borderRadius: 26 },
  staffInfo: { flex: 1 },
  staffName: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.3 },
  staffRoleBadge: { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4, marginBottom: 4 },
  staffRoleText: { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  staffPhone: { color: '#8892b0', fontSize: 12 },
  editBadge: { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)', alignSelf: 'center' },
  editBadgeText: { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 14 },
  subtitle: { color: '#8892b0', fontSize: 13, marginTop: 6, marginBottom: 4 },
  taskPanel: { margin: 16, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  taskPanelTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  taskRow: { flexDirection: 'row', gap: 10 },
  taskCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1 },
  taskCardRed:    { backgroundColor: 'rgba(233,69,96,0.1)',  borderColor: 'rgba(233,69,96,0.35)' },
  taskCardYellow: { backgroundColor: 'rgba(241,196,15,0.1)', borderColor: 'rgba(241,196,15,0.35)' },
  taskCardBlue:   { backgroundColor: 'rgba(79,172,254,0.1)', borderColor: 'rgba(79,172,254,0.35)' },
  taskCardNum:   { fontSize: 28, fontWeight: '900', color: '#fff' },
  taskCardLabel: { color: '#ccd6f6', fontSize: 12, fontWeight: '600', marginTop: 2 },
  taskCardHint:  { color: '#8892b0', fontSize: 10, marginTop: 3 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', margin: 16, marginBottom: 10, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12, fontSize: 14 },
  filterScroll: { paddingLeft: 16, marginBottom: 12 },
  filterRow: { gap: 8, paddingRight: 16 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  filterText: { color: '#8892b0', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  buildingCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  buildingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  buildingIconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(79,172,254,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  buildingMeta: { flex: 1 },
  buildingName: { color: '#fff', fontSize: 15, fontWeight: '800' },
  buildingAddr: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  collapseIcon: { color: '#8892b0', fontSize: 12 },
  pillRow: { flexDirection: 'row', alignItems: 'stretch', gap: 5, marginBottom: 10 },
  pill: { flex: 1, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  pillVal: { color: '#fff', fontSize: 14, fontWeight: '800' },
  pillLbl: { color: '#8892b0', fontSize: 9, marginTop: 1 },
  pctRow: { marginBottom: 12, gap: 6 },
  bar: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: '#1e1e2e' },
  barSeg: { height: 6 },
  pctLabel: { color: '#8892b0', fontSize: 11, marginTop: 4 },
  pctNum: { color: '#4facfe', fontWeight: '800', fontSize: 13 },
  floorSection: { marginTop: 4 },
  floorLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  floorText: { color: '#4facfe', fontSize: 13, fontWeight: '700' },
  floorCount: { color: '#8892b0', fontSize: 12 },
  roomRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 4 },
  roomLeft: { width: 72 },
  roomId: { color: '#fff', fontSize: 14, fontWeight: '800' },
  roomType: { color: '#8892b0', fontSize: 11, marginTop: 1 },
  roomArea: { color: '#8892b0', fontSize: 11 },
  roomMid: { flex: 1, paddingHorizontal: 10 },
  tenantName: { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
  tenantSince: { color: '#8892b0', fontSize: 11, marginTop: 2 },
  noTenant: { color: '#8892b0', fontSize: 12 },
  issuePeek: { color: '#f1c40f', fontSize: 11, marginTop: 3 },
  msgBadge: { backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-start' },
  msgBadgeText: { color: '#e94560', fontSize: 10, fontWeight: '700' },
  roomRight: { alignItems: 'flex-end', gap: 5 },
  statusPill: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  roomPrice: { fontSize: 12, fontWeight: '700' },
});

const md = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '93%', paddingTop: 12 },
  handle: { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  statusIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  roomTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  roomSub: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  statusBadge: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#8892b0', fontSize: 14 },
  scroll: { paddingHorizontal: 20 },
  section: { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  badge: { backgroundColor: 'rgba(233,69,96,0.2)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#e94560', fontSize: 11, fontWeight: '700' },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { color: '#8892b0', fontSize: 13 },
  infoValue: { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
  callBtn: { marginTop: 10, backgroundColor: 'rgba(46,204,113,0.12)', borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.35)' },
  callBtnText: { color: '#2ecc71', fontWeight: '800', fontSize: 14 },
  vacantCard: { backgroundColor: 'rgba(136,146,176,0.07)', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(136,146,176,0.15)' },
  vacantLabel: { color: '#8892b0', fontSize: 13, marginBottom: 4 },
  vacantDate: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  vacantCountBox: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 },
  vacantCount: { color: '#fff', fontSize: 44, fontWeight: '900' },
  vacantCountLabel: { color: '#8892b0', fontSize: 13, marginTop: 2 },
  vacantAlert: { marginTop: 14, backgroundColor: 'rgba(254,225,64,0.1)', borderRadius: 10, padding: 12, width: '100%' },
  vacantAlertText: { color: '#f1c40f', fontSize: 12, textAlign: 'center' },
  issueCard: { backgroundColor: 'rgba(241,196,15,0.07)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(241,196,15,0.25)', marginBottom: 12 },
  issueCardUrgent: { backgroundColor: 'rgba(233,69,96,0.07)', borderColor: 'rgba(233,69,96,0.35)' },
  issueTitleText: { color: '#f1c40f', fontSize: 15, fontWeight: '700', marginBottom: 12 },
  issueMetaBox: { gap: 6 },
  issueMeta: { color: '#8892b0', fontSize: 13 },
  resolveBox: { backgroundColor: 'rgba(46,204,113,0.05)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(46,204,113,0.2)' },
  resolveToggle: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#2ecc71', justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#2ecc71' },
  checkmark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  resolveToggleText: { color: '#ccd6f6', fontSize: 14, fontWeight: '600', flex: 1 },
  resolveForm: { marginTop: 16, gap: 8 },
  resolveFormLabel: { color: '#8892b0', fontSize: 12, fontWeight: '600' },
  resolveInput: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 13, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resolveInputMulti: { height: 80, textAlignVertical: 'top' },
  resolveTimestamp: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 10 },
  resolveTimestampText: { color: '#8892b0', fontSize: 12 },
  confirmBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  confirmGradient: { paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  confirmedBox: { backgroundColor: 'rgba(46,204,113,0.15)', borderRadius: 14, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.4)' },
  confirmedText: { color: '#2ecc71', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  msgCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  msgCardPending: { borderColor: 'rgba(233,69,96,0.3)', backgroundColor: 'rgba(233,69,96,0.04)' },
  msgTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  msgTime: { color: '#8892b0', fontSize: 12 },
  msgTag: { backgroundColor: 'rgba(241,196,15,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  msgTagDone: { backgroundColor: 'rgba(46,204,113,0.15)' },
  msgTagText: { color: '#f1c40f', fontSize: 11, fontWeight: '600' },
  msgText: { color: '#ccd6f6', fontSize: 13, fontStyle: 'italic', lineHeight: 20 },
  msgActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  msgCallBtn: { flex: 1, backgroundColor: 'rgba(79,172,254,0.12)', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)' },
  msgCallText: { color: '#4facfe', fontSize: 12, fontWeight: '700' },
  msgDoneBtn: { flex: 1, backgroundColor: 'rgba(46,204,113,0.12)', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)' },
  msgDoneBtnActive: { backgroundColor: 'rgba(241,196,15,0.1)', borderColor: 'rgba(241,196,15,0.35)' },
  msgDoneText: { color: '#2ecc71', fontSize: 12, fontWeight: '700' },
  msgResolveForm: { marginTop: 12, backgroundColor: 'rgba(46,204,113,0.05)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(46,204,113,0.2)', gap: 8 },
  msgResolvedInfo: { marginTop: 10, backgroundColor: 'rgba(46,204,113,0.07)', borderRadius: 10, padding: 10, gap: 3, borderWidth: 1, borderColor: 'rgba(46,204,113,0.2)' },
  msgResolvedText: { color: '#2ecc71', fontSize: 12, fontWeight: '700' },
  msgResolvedDate: { color: '#8892b0', fontSize: 11 },
  msgResolvedNote: { color: '#ccd6f6', fontSize: 12, fontStyle: 'italic' },
  emptyHistory: { backgroundColor: 'rgba(46,204,113,0.07)', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.15)' },
  emptyHistoryText: { color: '#8892b0', fontSize: 13 },
  timelineRow: { flexDirection: 'row', marginBottom: 6 },
  timelineLeft: { width: 20, alignItems: 'center', paddingTop: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  timelineBar: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 4 },
  timelineContent: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginLeft: 10, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  historyTitle: { color: '#ccd6f6', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  historyMetaRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  historyMetaLabel: { color: '#8892b0', fontSize: 12, width: 112 },
  historyMetaVal: { color: '#ccd6f6', fontSize: 12, flex: 1 },
  // dropdown
  dropdownBox: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 10 },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  dropdownSelected: { backgroundColor: 'rgba(46,204,113,0.08)' },
  dropdownDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  dropdownOptionContent: {},
  dropdownOptionTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  dropdownOptionSub: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#8892b0', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#2ecc71' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2ecc71' },
  // Payment history
  payCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  payCardUnpaid: { borderColor: 'rgba(233,69,96,0.3)', backgroundColor: 'rgba(233,69,96,0.03)' },
  payCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  payMonth: { color: '#fff', fontSize: 14, fontWeight: '800' },
  payStatusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  payStatusPaid: { backgroundColor: 'rgba(46,204,113,0.15)' },
  payStatusUnpaid: { backgroundColor: 'rgba(233,69,96,0.15)' },
  payStatusText: { fontSize: 12, fontWeight: '700' },
  payRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  payLabel: { color: '#8892b0', fontSize: 12 },
  payValue: { color: '#ccd6f6', fontSize: 12, fontWeight: '600' },
  payDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 8 },
  payTotalLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  payTotalVal: { fontSize: 14, fontWeight: '800' },
  payPaidAt: { color: '#8892b0', fontSize: 11, marginTop: 6 },
});

const pf = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  scroll: { padding: 20 },
  label: { color: '#8892b0', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  // preview area
  previewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  previewBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(79,172,254,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(79,172,254,0.4)' },
  previewPhoto: { width: 80, height: 80, borderRadius: 40 },
  previewEmoji: { fontSize: 42 },
  previewActions: { flex: 1, gap: 8 },
  previewName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  uploadBtn: { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(79,172,254,0.35)' },
  uploadBtnText: { color: '#4facfe', fontSize: 13, fontWeight: '700' },
  removePhotoBtn: { marginTop: 4, alignSelf: 'flex-start' },
  removePhotoText: { color: '#e94560', fontSize: 12 },
  // gender selection
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  genderBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  genderSelected: { borderColor: '#4facfe', backgroundColor: 'rgba(79,172,254,0.1)' },
  genderEmoji: { fontSize: 36, marginBottom: 6 },
  genderLabel: { color: '#8892b0', fontSize: 14, fontWeight: '700' },
  genderCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: '#4facfe', justifyContent: 'center', alignItems: 'center' },
  // legacy (kept for safety)
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  avatarOption: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  avatarSelected: { borderColor: '#4facfe', backgroundColor: 'rgba(79,172,254,0.15)' },
  avatarEmoji: { fontSize: 26 },
  avatarCheck: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#4facfe', justifyContent: 'center', alignItems: 'center' },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  saveBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  saveGradient: { paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

// ─── Building Rooms Modal Styles ─────────────────────────
const rm = StyleSheet.create({
  floorBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(79,172,254,0.2)', marginBottom: 10 },
  floorBarText: { color: '#4facfe', fontSize: 13, fontWeight: '700' },
  floorBarCount: { color: '#8892b0', fontSize: 12 },
  card: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 13, marginBottom: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderLeftWidth: 4 },
  statusDot: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0 },
  roomId: { color: '#fff', fontSize: 14, fontWeight: '800' },
  statusTag: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  statusTagText: { fontSize: 10, fontWeight: '700' },
  roomMeta: { color: '#8892b0', fontSize: 11, marginTop: 3 },
  tenantLine: { color: '#ccd6f6', fontSize: 12, marginTop: 4 },
  issueLine: { color: '#f1c40f', fontSize: 11, marginTop: 3 },
  emptyLine: { color: '#8892b0', fontSize: 11, marginTop: 3 },
  pendingLine: { color: '#e94560', fontSize: 11, marginTop: 3, fontWeight: '700' },
  arrow: { color: '#8892b0', fontSize: 22, marginLeft: 8, alignSelf: 'center' },
});

// ─── Floor Diagram Styles ─────────────────────────────────
const fd = StyleSheet.create({
  wrap: { marginTop: 4, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  floorTag: { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(79,172,254,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 8, flexShrink: 0 },
  floorTagText: { color: '#4facfe', fontSize: 11, fontWeight: '800' },
  rooms: { flexDirection: 'row', gap: 5, justifyContent: 'flex-start' },
  box: { width: 54, borderRadius: 8, borderWidth: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  boxId: { fontSize: 10, fontWeight: '800', lineHeight: 13 },
  boxIcon: { fontSize: 9, marginTop: 2 },
});
