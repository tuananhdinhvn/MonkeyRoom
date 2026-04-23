import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, StatusBar, Modal, Animated, Linking, Alert,
  Dimensions, LayoutAnimation, Platform, UIManager, Image
} from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useStaff } from '../../context/StaffContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const SCREEN_H = Dimensions.get('window').height;
const DEMO_NOW_DISPLAY = '22/04/2026 08:00';

// ─── Dữ liệu ──────────────────────────────────────────────
const INITIAL_BUILDINGS = [
  {
    id: 'b1', name: 'Nhà A - Green Home', address: '12 Nguyễn Trãi, Q.1',
    customers: [
      {
        id: 'c1', name: 'Nguyễn Văn An', avatar: '👨',
        phone: '0912345678', email: 'an.nguyen@gmail.com',
        room: '101', floor: 1,
        contractStart: '05/01/2025', contractEnd: '05/01/2026',
        paid: true, amount: '3,500,000', overdue: 0,
        previousRooms: [
          { room: '305', building: 'Nhà C - Sunrise', from: '10/06/2023', to: '31/12/2024', reason: 'Chủ động chuyển phòng rộng hơn' },
        ],
        issueHistory: [
          { id: 'i1', title: 'Máy lạnh không mát', reportedAt: '10/03/2026', resolvedAt: '11/03/2026', resolvedBy: 'Thợ điện lạnh Minh', status: 'done' },
          { id: 'i2', title: 'Bóng đèn phòng tắm cháy', reportedAt: '02/02/2026', resolvedAt: '03/02/2026', resolvedBy: 'NV Bảo', status: 'done' },
        ],
        messages: [
          { id: 'm1', text: 'Anh ơi vòi nước bị nhỏ giọt, phiền anh kiểm tra giúp em', time: '20/04/2026 09:12', resolved: false },
        ],
        paymentHistory: [
          { month: '04/2026', rent: '3,500,000', elecKwh: 45, elecTotal: '135,000', waterM3: 3, waterTotal: '45,000', total: '3,680,000', paid: true, paidAt: '02/04/2026' },
          { month: '03/2026', rent: '3,500,000', elecKwh: 42, elecTotal: '126,000', waterM3: 3, waterTotal: '45,000', total: '3,671,000', paid: true, paidAt: '05/03/2026' },
          { month: '02/2026', rent: '3,500,000', elecKwh: 38, elecTotal: '114,000', waterM3: 2, waterTotal: '30,000', total: '3,644,000', paid: true, paidAt: '03/02/2026' },
        ],
        notes: 'Khách thanh toán đúng hạn, ở sạch sẽ, chưa có vi phạm nội quy.',
      },
      {
        id: 'c2', name: 'Trần Thị Bích', avatar: '👩',
        phone: '0987654321', email: 'bich.tran@gmail.com',
        room: '103', floor: 1,
        contractStart: '15/03/2025', contractEnd: '15/03/2026',
        paid: true, amount: '3,500,000', overdue: 0,
        previousRooms: [],
        issueHistory: [],
        messages: [],
        paymentHistory: [
          { month: '04/2026', rent: '3,500,000', elecKwh: 40, elecTotal: '120,000', waterM3: 2, waterTotal: '30,000', total: '3,650,000', paid: true, paidAt: '02/04/2026' },
          { month: '03/2026', rent: '3,500,000', elecKwh: 38, elecTotal: '114,000', waterM3: 2, waterTotal: '30,000', total: '3,644,000', paid: true, paidAt: '05/03/2026' },
        ],
        notes: 'Khách mới lần đầu thuê.',
      },
      {
        id: 'c3', name: 'Vũ Thị Lan', avatar: '👩',
        phone: '0966333444', email: null,
        room: '104', floor: 1,
        contractStart: '01/02/2026', contractEnd: '01/02/2027',
        paid: false, amount: '4,800,000', overdue: 1,
        previousRooms: [],
        issueHistory: [
          { id: 'i1', title: 'Khóa cửa bị hỏng', reportedAt: '05/03/2026', resolvedAt: '05/03/2026', resolvedBy: 'NV Bảo', status: 'done' },
        ],
        messages: [
          { id: 'm1', text: 'Chị ơi bồn cầu bị tắc, chị xử lý giúp em với ạ', time: '21/04/2026 22:05', resolved: false },
          { id: 'm2', text: 'Cửa sổ phòng em bị kẹt không mở được', time: '18/04/2026 08:30', resolved: true, resolvedBy: 'NV Bảo', resolvedAt: '18/04/2026 14:00', resolveNote: 'Đã tra dầu và chỉnh lại bản lề cửa sổ' },
        ],
        paymentHistory: [
          { month: '04/2026', rent: '4,800,000', elecKwh: 50, elecTotal: '150,000', waterM3: 4, waterTotal: '60,000', total: '5,010,000', paid: false, paidAt: null },
          { month: '03/2026', rent: '4,800,000', elecKwh: 48, elecTotal: '144,000', waterM3: 4, waterTotal: '60,000', total: '5,004,000', paid: true, paidAt: '10/03/2026' },
          { month: '02/2026', rent: '4,800,000', elecKwh: 45, elecTotal: '135,000', waterM3: 3, waterTotal: '45,000', total: '4,980,000', paid: true, paidAt: '05/02/2026' },
        ],
        notes: 'Chưa thanh toán tháng 4. Đã nhắc 1 lần ngày 10/04.',
      },
      {
        id: 'c4', name: 'Lê Minh Tuấn', avatar: '🧑',
        phone: '0909111222', email: 'tuan.le@outlook.com',
        room: '201', floor: 2,
        contractStart: '20/06/2024', contractEnd: '20/06/2026',
        paid: false, amount: '6,000,000', overdue: 2,
        previousRooms: [
          { room: '102', building: 'Nhà A - Green Home', from: '01/01/2023', to: '19/06/2024', reason: 'Nâng cấp lên phòng Studio' },
        ],
        issueHistory: [
          { id: 'i1', title: 'Điều hòa chảy nước', reportedAt: '01/04/2026', resolvedAt: '02/04/2026', resolvedBy: 'Thợ điện lạnh Minh', status: 'done' },
          { id: 'i2', title: 'Wifi chập chờn', reportedAt: '10/01/2026', resolvedAt: '11/01/2026', resolvedBy: 'Kỹ thuật viên ISP', status: 'done' },
        ],
        messages: [],
        paymentHistory: [
          { month: '04/2026', rent: '6,000,000', elecKwh: 80, elecTotal: '240,000', waterM3: 5, waterTotal: '75,000', total: '6,315,000', paid: false, paidAt: null },
          { month: '03/2026', rent: '6,000,000', elecKwh: 75, elecTotal: '225,000', waterM3: 5, waterTotal: '75,000', total: '6,300,000', paid: false, paidAt: null },
          { month: '02/2026', rent: '6,000,000', elecKwh: 70, elecTotal: '210,000', waterM3: 5, waterTotal: '75,000', total: '6,285,000', paid: true, paidAt: '05/02/2026' },
        ],
        notes: 'Nợ 2 tháng tiền thuê. Cần liên hệ khẩn để thu hồi.',
      },
      {
        id: 'c5', name: 'Đỗ Hữu Nghĩa', avatar: '👨',
        phone: '0944222111', email: null,
        room: '204', floor: 2,
        contractStart: '10/08/2025', contractEnd: '10/08/2026',
        paid: true, amount: '3,500,000', overdue: 0,
        previousRooms: [],
        issueHistory: [],
        messages: [],
        paymentHistory: [
          { month: '04/2026', rent: '3,500,000', elecKwh: 40, elecTotal: '120,000', waterM3: 2, waterTotal: '30,000', total: '3,650,000', paid: true, paidAt: '03/04/2026' },
          { month: '03/2026', rent: '3,500,000', elecKwh: 38, elecTotal: '114,000', waterM3: 2, waterTotal: '30,000', total: '3,644,000', paid: true, paidAt: '05/03/2026' },
        ],
        notes: '',
      },
      {
        id: 'c6', name: 'Phạm Thu Hà', avatar: '👩',
        phone: '0978888999', email: 'ha.pham@gmail.com',
        room: '301', floor: 3,
        contractStart: '05/09/2024', contractEnd: '05/09/2025',
        paid: true, amount: '3,500,000', overdue: 0,
        previousRooms: [],
        issueHistory: [
          { id: 'i1', title: 'Bình nóng lạnh hỏng', reportedAt: '20/03/2026', resolvedAt: '21/03/2026', resolvedBy: 'Thợ nước Dũng', status: 'done' },
        ],
        messages: [],
        paymentHistory: [
          { month: '04/2026', rent: '3,500,000', elecKwh: 42, elecTotal: '126,000', waterM3: 3, waterTotal: '45,000', total: '3,671,000', paid: true, paidAt: '04/04/2026' },
          { month: '03/2026', rent: '3,500,000', elecKwh: 40, elecTotal: '120,000', waterM3: 3, waterTotal: '45,000', total: '3,665,000', paid: true, paidAt: '05/03/2026' },
          { month: '02/2026', rent: '3,500,000', elecKwh: 38, elecTotal: '114,000', waterM3: 2, waterTotal: '30,000', total: '3,644,000', paid: true, paidAt: '04/02/2026' },
        ],
        notes: 'Hợp đồng đã hết hạn — cần gia hạn hoặc xác nhận trả phòng.',
      },
      {
        id: 'c7', name: 'Hoàng Đức Minh', avatar: '👨',
        phone: '0933222111', email: 'minh.hoang@company.vn',
        room: '302', floor: 3,
        contractStart: '01/11/2024', contractEnd: '01/05/2026',
        paid: false, amount: '8,500,000', overdue: 0,
        previousRooms: [
          { room: 'A201', building: 'Nhà A - Green Home', from: '15/04/2023', to: '31/10/2024', reason: 'Chuyển lên phòng VIP' },
        ],
        issueHistory: [],
        messages: [
          { id: 'm1', text: 'Thang máy tầng 3 thỉnh thoảng kêu tiếng lạ, anh xem giúp em', time: '22/04/2026 10:00', resolved: false },
        ],
        paymentHistory: [
          { month: '04/2026', rent: '8,500,000', elecKwh: 120, elecTotal: '360,000', waterM3: 8, waterTotal: '120,000', total: '8,980,000', paid: true, paidAt: '02/04/2026' },
          { month: '03/2026', rent: '8,500,000', elecKwh: 115, elecTotal: '345,000', waterM3: 8, waterTotal: '120,000', total: '8,965,000', paid: true, paidAt: '05/03/2026' },
          { month: '02/2026', rent: '8,500,000', elecKwh: 110, elecTotal: '330,000', waterM3: 7, waterTotal: '105,000', total: '8,935,000', paid: true, paidAt: '04/02/2026' },
        ],
        notes: 'Khách doanh nhân, thanh toán qua chuyển khoản. Sắp hết HĐ ngày 01/05.',
      },
    ],
  },
  {
    id: 'b2', name: 'Nhà B - Blue Sky', address: '45 Lê Lợi, Q.3',
    customers: [
      {
        id: 'c8', name: 'Mai Thị Hoa', avatar: '👩',
        phone: '0911000111', email: null,
        room: 'B101', floor: 1,
        contractStart: '10/04/2025', contractEnd: '10/04/2026',
        paid: true, amount: '3,800,000', overdue: 0,
        previousRooms: [],
        issueHistory: [],
        messages: [],
        paymentHistory: [
          { month: '04/2026', rent: '3,800,000', elecKwh: 42, elecTotal: '126,000', waterM3: 3, waterTotal: '45,000', total: '3,971,000', paid: true, paidAt: '03/04/2026' },
          { month: '03/2026', rent: '3,800,000', elecKwh: 40, elecTotal: '120,000', waterM3: 3, waterTotal: '45,000', total: '3,965,000', paid: true, paidAt: '05/03/2026' },
        ],
        notes: '',
      },
      {
        id: 'c9', name: 'Bùi Văn Tài', avatar: '👨',
        phone: '0922000222', email: null,
        room: 'B102', floor: 1,
        contractStart: '05/07/2025', contractEnd: '05/07/2026',
        paid: false, amount: '5,000,000', overdue: 1,
        previousRooms: [],
        issueHistory: [
          { id: 'i1', title: 'Vòi sen bị hỏng', reportedAt: '08/04/2026', resolvedAt: '09/04/2026', resolvedBy: 'Thợ nước Dũng', status: 'done' },
        ],
        messages: [],
        paymentHistory: [
          { month: '04/2026', rent: '5,000,000', elecKwh: 60, elecTotal: '180,000', waterM3: 4, waterTotal: '60,000', total: '5,240,000', paid: false, paidAt: null },
          { month: '03/2026', rent: '5,000,000', elecKwh: 58, elecTotal: '174,000', waterM3: 4, waterTotal: '60,000', total: '5,234,000', paid: true, paidAt: '08/03/2026' },
        ],
        notes: 'Nhắc tiền tháng 4 chưa đóng.',
      },
      {
        id: 'c10', name: 'Ngô Thị Kim', avatar: '👩',
        phone: '0955000333', email: 'kim.ngo@gmail.com',
        room: 'B202', floor: 2,
        contractStart: '12/10/2025', contractEnd: '12/10/2026',
        paid: true, amount: '5,000,000', overdue: 0,
        previousRooms: [],
        issueHistory: [],
        messages: [],
        paymentHistory: [
          { month: '04/2026', rent: '5,000,000', elecKwh: 55, elecTotal: '165,000', waterM3: 4, waterTotal: '60,000', total: '5,225,000', paid: true, paidAt: '04/04/2026' },
          { month: '03/2026', rent: '5,000,000', elecKwh: 52, elecTotal: '156,000', waterM3: 4, waterTotal: '60,000', total: '5,216,000', paid: true, paidAt: '05/03/2026' },
        ],
        notes: '',
      },
    ],
  },
];

const FILTERS = ['Tất cả', 'Đã thanh toán', 'Chưa thanh toán', 'Sắp hết HĐ', 'Có tin nhắn'];
const DEMO_NOW = new Date(2026, 3, 22);

function parseVN(s) { return parseInt(String(s).replace(/,/g, ''), 10) || 0; }
function fmtVN(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

function daysBetween(dateStr1, dateStr2) {
  const parse = s => { const [d, m, y] = s.split('/').map(Number); return new Date(y, m - 1, d); };
  return Math.floor((parse(dateStr2) - parse(dateStr1)) / 86400000);
}

function isExpiringSoon(contractEnd) {
  const [d, m, y] = contractEnd.split('/').map(Number);
  const end = new Date(y, m - 1, d);
  const diff = (end - DEMO_NOW) / 86400000;
  return diff >= 0 && diff <= 30;
}

function isExpired(contractEnd) {
  const [d, m, y] = contractEnd.split('/').map(Number);
  return new Date(y, m - 1, d) < DEMO_NOW;
}

function countCustomers(customers) {
  return {
    total:    customers.length,
    paid:     customers.filter(c => c.paid).length,
    unpaid:   customers.filter(c => !c.paid).length,
    expiring: customers.filter(c => isExpiringSoon(c.contractEnd)).length,
  };
}

// ─── Customer Detail Modal ────────────────────────────────
function CustomerDetailModal({ customer, staff, onClose, onResolveMessage }) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const [visible,        setVisible]        = useState(false);
  const [resolvingMsgId, setResolvingMsgId] = useState(null);
  const [msgResolverType,setMsgResolverType]= useState('self');
  const [msgContractor,  setMsgContractor]  = useState('');
  const [msgNote,        setMsgNote]        = useState('');

  useEffect(() => {
    if (customer) {
      setVisible(true);
      setResolvingMsgId(null);
      setMsgResolverType('self');
      setMsgContractor('');
      setMsgNote('');
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 120 }),
        Animated.timing(opacity,    { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [customer]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 300, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(() => { setVisible(false); onClose(); });
  };

  const handleConfirmMsgResolve = msgId => {
    const resolver = msgResolverType === 'self' ? staff.name : msgContractor.trim();
    if (!resolver) { Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên người xử lý.'); return; }
    onResolveMessage(customer.id, msgId, resolver, msgNote.trim());
    setResolvingMsgId(null);
    setMsgResolverType('self');
    setMsgContractor('');
    setMsgNote('');
  };

  if (!customer && !visible) return null;

  const expiring   = customer && isExpiringSoon(customer.contractEnd);
  const expired    = customer && isExpired(customer.contractEnd);
  const pendingMsg = customer ? (customer.messages || []).filter(m => !m.resolved) : [];
  const rentedDays = customer ? daysBetween(customer.contractStart, '22/04/2026') : 0;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[md.backdrop, { opacity }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      <Animated.View style={[md.sheet, { transform: [{ translateY }] }]}>
        <View style={md.handle} />

        {customer && <>
          {/* ── Header ── */}
          <View style={md.headerRow}>
            <View style={md.avatarBox}><Text style={md.avatarText}>{customer.avatar}</Text></View>
            <View style={md.headerInfo}>
              <Text style={md.customerName}>{customer.name}</Text>
              <View style={md.roomCodeRow}>
                <View style={md.roomCodeTag}>
                  <Text style={md.roomCodeText}>Mã phòng: {customer.room}</Text>
                </View>
                <Text style={md.floorLabel}>  Tầng {customer.floor}</Text>
              </View>
              <View style={md.badgeRow}>
                <View style={[md.payBadge, customer.paid ? md.payBadgePaid : md.payBadgeUnpaid]}>
                  <Text style={[md.payBadgeText, { color: customer.paid ? '#2ecc71' : '#e94560' }]}>
                    {customer.paid ? '✅ Đã đóng tiền' : customer.overdue > 1 ? `❌ Nợ ${customer.overdue} tháng` : '❌ Chưa đóng'}
                  </Text>
                </View>
                {(expiring || expired) && (
                  <View style={[md.expBadge, expired && md.expBadgeRed]}>
                    <Text style={[md.expBadgeText, expired && { color: '#e94560' }]}>
                      {expired ? '🔴 HĐ đã hết hạn' : '🟡 Sắp hết HĐ'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <TouchableOpacity style={md.closeBtn} onPress={handleClose}>
              <Text style={md.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={md.scroll} showsVerticalScrollIndicator={false}>

            {/* ── Gọi điện & Email ── */}
            <View style={md.actionRow}>
              <TouchableOpacity style={md.actionCall} onPress={() => Linking.openURL(`tel:${customer.phone}`)}>
                <Text style={md.actionCallIcon}>📞</Text>
                <Text style={md.actionCallText}>Gọi điện</Text>
                <Text style={md.actionCallSub}>{customer.phone}</Text>
              </TouchableOpacity>
              {customer.email && (
                <TouchableOpacity style={md.actionEmail} onPress={() => Linking.openURL(`mailto:${customer.email}`)}>
                  <Text style={md.actionCallIcon}>✉️</Text>
                  <Text style={md.actionCallText}>Email</Text>
                  <Text style={md.actionCallSub} numberOfLines={1}>{customer.email}</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Hợp đồng ── */}
            <Section title="📄 Thông tin hợp đồng">
              <View style={md.contractCard}>
                <View style={md.contractRow}>
                  <View style={md.contractItem}>
                    <Text style={md.contractLabel}>Ngày bắt đầu thuê</Text>
                    <Text style={md.contractDate}>{customer.contractStart}</Text>
                    <Text style={md.contractSub}>{rentedDays} ngày đã ở</Text>
                  </View>
                  <View style={md.contractArrow}><Text style={{ color: '#8892b0', fontSize: 20 }}>→</Text></View>
                  <View style={md.contractItem}>
                    <Text style={md.contractLabel}>Ngày kết thúc HĐ</Text>
                    <Text style={[md.contractDate, (expiring || expired) && { color: expired ? '#e94560' : '#f1c40f' }]}>
                      {customer.contractEnd}
                    </Text>
                    <Text style={md.contractSub}>
                      {expired
                        ? `Đã hết ${Math.abs(daysBetween(customer.contractEnd, '22/04/2026'))} ngày`
                        : `Còn ${daysBetween('22/04/2026', customer.contractEnd)} ngày`
                      }
                    </Text>
                  </View>
                </View>
                {(expiring || expired) && (
                  <View style={[md.contractAlert, expired && md.contractAlertRed]}>
                    <Text style={[md.contractAlertText, expired && { color: '#e94560' }]}>
                      {expired
                        ? '🔴 Hợp đồng đã hết hạn — cần gia hạn hoặc xác nhận trả phòng ngay'
                        : `⚠️ Hợp đồng sắp hết hạn trong ${daysBetween('22/04/2026', customer.contractEnd)} ngày`
                      }
                    </Text>
                  </View>
                )}
                <View style={md.divider} />
                <Row label="Tiền thuê/tháng" value={`${customer.amount} ₫`} valueColor="#4facfe" />
              </View>
            </Section>

            {/* ── Tin nhắn từ khách (hiện trước thanh toán nếu có tin nhắn) ── */}
            {(customer.messages || []).length > 0 && (
              <Section title="💬 Tin nhắn từ khách" badge={`${(customer.messages || []).length} chờ xử lý`}>
                {customer.messages.map(msg => (
                  <View key={msg.id} style={[md.msgCard, md.msgCardPending]}>
                    <View style={md.msgTop}>
                      <Text style={md.msgTime}>{msg.time}</Text>
                      <View style={md.msgTag}>
                        <Text style={md.msgTagText}>⏳ Chờ xử lý</Text>
                      </View>
                    </View>
                    <Text style={md.msgText}>"{msg.text}"</Text>
                    <View style={md.msgActions}>
                      <TouchableOpacity style={md.msgCallBtn} onPress={() => Linking.openURL(`tel:${customer.phone}`)}>
                        <Text style={md.msgCallText}>📞 Gọi xử lý</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[md.msgDoneBtn, resolvingMsgId === msg.id && md.msgDoneBtnActive]}
                        onPress={() => {
                          if (resolvingMsgId === msg.id) { setResolvingMsgId(null); }
                          else { setResolvingMsgId(msg.id); setMsgResolverType('self'); setMsgContractor(''); setMsgNote(''); }
                        }}
                      >
                        <Text style={md.msgDoneText}>
                          {resolvingMsgId === msg.id ? '▲ Thu gọn' : '✓ Xác nhận đã xử lý'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {resolvingMsgId === msg.id && (
                          <View style={md.msgResolveForm}>
                            <Text style={md.resolveFormLabel}>Người xử lý vấn đề *</Text>
                            <View style={md.dropdownBox}>
                              <TouchableOpacity style={[md.dropdownOption, msgResolverType === 'self' && md.dropdownSelected]} onPress={() => setMsgResolverType('self')}>
                                <View style={[md.radioCircle, msgResolverType === 'self' && md.radioSelected]}>{msgResolverType === 'self' && <View style={md.radioDot} />}</View>
                                <View style={md.dropdownOptionContent}>
                                  <Text style={md.dropdownOptionTitle}>Tự xử lý</Text>
                                  <Text style={md.dropdownOptionSub}>{staff.avatar}  {staff.name}</Text>
                                </View>
                              </TouchableOpacity>
                              <View style={md.dropdownDivider} />
                              <TouchableOpacity style={[md.dropdownOption, msgResolverType === 'contractor' && md.dropdownSelected]} onPress={() => setMsgResolverType('contractor')}>
                                <View style={[md.radioCircle, msgResolverType === 'contractor' && md.radioSelected]}>{msgResolverType === 'contractor' && <View style={md.radioDot} />}</View>
                                <View style={md.dropdownOptionContent}>
                                  <Text style={md.dropdownOptionTitle}>Thợ bên ngoài</Text>
                                  <Text style={md.dropdownOptionSub}>👷  Nhập tên thợ bên dưới</Text>
                                </View>
                              </TouchableOpacity>
                            </View>
                            {msgResolverType === 'contractor' && (
                              <TextInput style={md.resolveInput} placeholder="Tên thợ / đơn vị xử lý..." placeholderTextColor="#8892b0" value={msgContractor} onChangeText={setMsgContractor} />
                            )}
                            <Text style={[md.resolveFormLabel, { marginTop: 12 }]}>Ghi chú kết quả (tùy chọn)</Text>
                            <TextInput style={[md.resolveInput, md.resolveInputMulti]} placeholder="VD: Đã liên hệ khách, vấn đề đã được xử lý..." placeholderTextColor="#8892b0" value={msgNote} onChangeText={setMsgNote} multiline numberOfLines={3} />
                            <View style={md.resolveTimestamp}><Text style={md.resolveTimestampText}>🕐 Thời gian xác nhận: {DEMO_NOW_DISPLAY}</Text></View>
                            <TouchableOpacity style={md.confirmBtn} onPress={() => handleConfirmMsgResolve(msg.id)}>
                              <LinearGradient colors={['#f1c40f', '#f39c12']} style={md.confirmGradient}>
                                <Text style={[md.confirmBtnText, { color: '#1a1a2e' }]}>✓  Xác nhận đã xử lý xong</Text>
                              </LinearGradient>
                            </TouchableOpacity>
                          </View>
                        )}
                  </View>
                ))}
              </Section>
            )}

            {/* ── Lịch sử thanh toán (bảng) ── */}
            {(customer.paymentHistory || []).length > 0 && (
              <Section title="💰 Lịch sử thanh toán">
                {customer.paymentHistory.map((p, idx) => {
                  const grandTotal = parseVN(p.rent) + parseVN(p.elecTotal) + parseVN(p.waterTotal) + 100000 + 150000;
                  return (
                    <View key={idx} style={[md.payCard, !p.paid && md.payCardUnpaid]}>
                      {/* Tháng + trạng thái */}
                      <View style={md.payCardHeader}>
                        <Text style={md.payMonth}>Tháng {p.month}</Text>
                        <View style={[md.payStatusBadge, p.paid ? md.payStatusPaid : md.payStatusUnpaid]}>
                          <Text style={[md.payStatusText, { color: p.paid ? '#2ecc71' : '#e94560' }]}>
                            {p.paid ? '✅ Đã đóng' : '❌ Chưa đóng'}
                          </Text>
                        </View>
                      </View>

                      {/* Bảng chi phí */}
                      <View style={md.tbl}>
                        {/* Header */}
                        <View style={[md.tblRow, md.tblHead]}>
                          <Text style={[md.tblName, md.tblHeadTxt]}>Tên chi phí</Text>
                          <Text style={[md.tblQty,  md.tblHeadTxt]}>Số lượng</Text>
                          <Text style={[md.tblUnit, md.tblHeadTxt]}>Đơn giá</Text>
                          <Text style={[md.tblAmt,  md.tblHeadTxt]}>Thành tiền</Text>
                        </View>
                        {/* Tiền thuê */}
                        <View style={md.tblRow}>
                          <Text style={[md.tblName, md.tblCell]}>Tiền thuê</Text>
                          <Text style={[md.tblQty,  md.tblCell]}>1 tháng</Text>
                          <Text style={[md.tblUnit, md.tblCell]}>{p.rent}</Text>
                          <Text style={[md.tblAmt,  md.tblCell]}>{p.rent}</Text>
                        </View>
                        {/* Điện */}
                        <View style={[md.tblRow, md.tblRowAlt]}>
                          <Text style={[md.tblName, md.tblCell]}>Điện</Text>
                          <Text style={[md.tblQty,  md.tblCell]}>{p.elecKwh} kWh</Text>
                          <Text style={[md.tblUnit, md.tblCell]}>3,000</Text>
                          <Text style={[md.tblAmt,  md.tblCell]}>{p.elecTotal}</Text>
                        </View>
                        {/* Nước */}
                        <View style={md.tblRow}>
                          <Text style={[md.tblName, md.tblCell]}>Nước</Text>
                          <Text style={[md.tblQty,  md.tblCell]}>{p.waterM3} m³</Text>
                          <Text style={[md.tblUnit, md.tblCell]}>15,000</Text>
                          <Text style={[md.tblAmt,  md.tblCell]}>{p.waterTotal}</Text>
                        </View>
                        {/* Dịch vụ */}
                        <View style={[md.tblRow, md.tblRowAlt]}>
                          <Text style={[md.tblName, md.tblCell]}>Dịch vụ</Text>
                          <Text style={[md.tblQty,  md.tblCell]}>1 tháng</Text>
                          <Text style={[md.tblUnit, md.tblCell]}>100,000</Text>
                          <Text style={[md.tblAmt,  md.tblCell]}>100,000</Text>
                        </View>
                        {/* Internet */}
                        <View style={md.tblRow}>
                          <Text style={[md.tblName, md.tblCell]}>Internet</Text>
                          <Text style={[md.tblQty,  md.tblCell]}>1 tháng</Text>
                          <Text style={[md.tblUnit, md.tblCell]}>150,000</Text>
                          <Text style={[md.tblAmt,  md.tblCell]}>150,000</Text>
                        </View>
                        {/* Tổng */}
                        <View style={[md.tblRow, md.tblTotalRow]}>
                          <Text style={[md.tblName, md.tblTotalLabel]}>Tổng cộng</Text>
                          <Text style={md.tblQty} />
                          <Text style={md.tblUnit} />
                          <Text style={[md.tblAmt, md.tblTotalAmt, { color: p.paid ? '#2ecc71' : '#e94560' }]}>
                            {fmtVN(grandTotal)}
                          </Text>
                        </View>
                      </View>

                      {p.paid && p.paidAt && (
                        <Text style={md.payPaidAt}>📅 Ngày đóng: {p.paidAt}</Text>
                      )}
                    </View>
                  );
                })}
              </Section>
            )}

            {/* ── Lịch sử giải quyết sự cố ── */}
            <Section title="🔧 Lịch sử giải quyết sự cố">
              {(customer.issueHistory || []).length === 0 ? (
                <View style={md.emptyBox}>
                  <Text style={md.emptyBoxText}>✅ Chưa có vấn đề nào được ghi nhận</Text>
                </View>
              ) : (
                customer.issueHistory.map((issue, idx) => (
                  <View key={issue.id} style={md.timelineItem}>
                    <View style={md.timelineLeft}>
                      <View style={[md.timelineDot, { backgroundColor: issue.status === 'done' ? '#2ecc71' : '#f1c40f' }]} />
                      {idx < customer.issueHistory.length - 1 && <View style={md.timelineBar} />}
                    </View>
                    <View style={md.timelineContent}>
                      <Text style={md.issueTitle}>{issue.title}</Text>
                      <View style={md.issueDateRow}>
                        <Text style={md.issueDateLabel}>📅 Phản ánh:</Text>
                        <Text style={md.issueDateVal}>{issue.reportedAt}</Text>
                      </View>
                      {issue.resolvedAt && (
                        <View style={md.issueDateRow}>
                          <Text style={md.issueDateLabel}>✅ Xử lý xong:</Text>
                          <Text style={[md.issueDateVal, { color: '#2ecc71' }]}>{issue.resolvedAt}</Text>
                        </View>
                      )}
                      {issue.resolvedBy && (
                        <View style={md.issueDateRow}>
                          <Text style={md.issueDateLabel}>👷 Người xử lý:</Text>
                          <Text style={md.issueDateVal}>{issue.resolvedBy}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}
            </Section>

            {/* ── Lịch sử phòng ── */}
            <Section title="🏠 Lịch sử phòng đã ở">
              {(customer.previousRooms || []).length === 0 ? (
                <View style={md.emptyBox}>
                  <Text style={md.emptyBoxText}>Đây là phòng đầu tiên khách thuê trong hệ thống</Text>
                </View>
              ) : (
                customer.previousRooms.map((pr, idx) => (
                  <View key={idx} style={md.prevRoomCard}>
                    <View style={md.prevRoomHeader}>
                      <Text style={md.prevRoomIcon}>🏠</Text>
                      <View>
                        <Text style={md.prevRoomName}>Phòng {pr.room}</Text>
                        <Text style={md.prevRoomBuilding}>{pr.building}</Text>
                      </View>
                    </View>
                    <View style={md.prevRoomDates}>
                      <Text style={md.prevRoomDate}>📅 {pr.from} → {pr.to}</Text>
                      <Text style={md.prevRoomDays}>({daysBetween(pr.from, pr.to)} ngày)</Text>
                    </View>
                    <View style={md.prevRoomReason}>
                      <Text style={md.prevRoomReasonText}>💬 {pr.reason}</Text>
                    </View>
                  </View>
                ))
              )}
              <View style={[md.prevRoomCard, md.prevRoomCardCurrent]}>
                <View style={md.prevRoomHeader}>
                  <Text style={md.prevRoomIcon}>📍</Text>
                  <View>
                    <Text style={[md.prevRoomName, { color: '#2ecc71' }]}>Phòng {customer.room} (hiện tại)</Text>
                    <Text style={md.prevRoomBuilding}>{INITIAL_BUILDINGS.find(b => b.customers.some(c => c.id === customer.id))?.name}</Text>
                  </View>
                </View>
                <Text style={md.prevRoomDate}>📅 Từ {customer.contractStart} · {rentedDays} ngày đã ở</Text>
              </View>
            </Section>

            {customer.notes ? (
              <Section title="📝 Ghi chú">
                <View style={md.noteCard}>
                  <Text style={md.noteText}>{customer.notes}</Text>
                </View>
              </Section>
            ) : null}

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
      <View style={md.sectionTitleRow}>
        <Text style={md.sectionTitle}>{title}</Text>
        {badge && <View style={md.sectionBadge}><Text style={md.sectionBadgeText}>{badge}</Text></View>}
      </View>
      {children}
    </View>
  );
}

function Row({ label, value, valueColor }) {
  return (
    <View style={md.infoRow}>
      <Text style={md.infoLabel}>{label}</Text>
      <Text style={[md.infoValue, valueColor && { color: valueColor }]}>{value || '—'}</Text>
    </View>
  );
}

// ─── Building Stats Modal ─────────────────────────────────
const STATS_CONFIG = {
  total:    { title: 'Danh sách khách đang thuê', icon: '👥', color: '#4facfe' },
  paid:     { title: 'Đã đóng tiền đúng hạn',    icon: '✅', color: '#2ecc71' },
  unpaid:   { title: 'Chưa đóng tiền',            icon: '❌', color: '#e94560' },
  expiring: { title: 'Sắp / đã hết hạn hợp đồng', icon: '⏰', color: '#f1c40f' },
};

function BuildingStatsModal({ data, onClose, onSelectCustomer }) {
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

  const goToCustomer = c => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 220, useNativeDriver: true }),
      Animated.timing(backdrop,   { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onSelectCustomer(c));
  };

  const cfg = STATS_CONFIG[data.type];
  let list;
  if      (data.type === 'total')    list = data.customers;
  else if (data.type === 'paid')     list = data.customers.filter(c => c.paid);
  else if (data.type === 'unpaid')   list = data.customers.filter(c => !c.paid);
  else if (data.type === 'expiring') list = data.customers.filter(c => isExpiringSoon(c.contractEnd) || isExpired(c.contractEnd));

  const byFloor = {};
  list.forEach(c => { if (!byFloor[c.floor]) byFloor[c.floor] = []; byFloor[c.floor].push(c); });

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[md.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[md.sheet, { transform: [{ translateY }], maxHeight: '85%' }]}>
        <View style={md.handle} />
        <View style={md.headerRow}>
          <View style={[md.avatarBox, { backgroundColor: cfg.color + '22' }]}>
            <Text style={{ fontSize: 24 }}>{cfg.icon}</Text>
          </View>
          <View style={md.headerInfo}>
            <Text style={md.customerName}>{cfg.title}</Text>
            <Text style={md.floorLabel}>🏢 {data.buildingName}</Text>
          </View>
          <View style={[bs.countBadge, { backgroundColor: cfg.color + '18', borderColor: cfg.color + '44' }]}>
            <Text style={[bs.countNum, { color: cfg.color }]}>{list.length}</Text>
            <Text style={bs.countLbl}>khách</Text>
          </View>
          <TouchableOpacity style={md.closeBtn} onPress={handleClose}>
            <Text style={md.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={md.scroll} showsVerticalScrollIndicator={false}>
          {list.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 44 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
              <Text style={{ color: '#8892b0', fontSize: 14 }}>Không có khách trong danh sách này</Text>
            </View>
          ) : (
            Object.entries(byFloor).sort(([a], [b]) => Number(a) - Number(b)).map(([floor, floorList]) => (
              <View key={floor} style={{ marginTop: 16 }}>
                <View style={bs.floorBar}>
                  <Text style={bs.floorBarText}>Tầng {floor}</Text>
                  <Text style={bs.floorBarCount}>{floorList.length} khách</Text>
                </View>
                {floorList.map(c => {
                  const exp = isExpired(c.contractEnd);
                  return (
                    <TouchableOpacity key={c.id} style={bs.card} onPress={() => goToCustomer(c)} activeOpacity={0.75}>
                      <View style={bs.cardAvatar}><Text style={{ fontSize: 22 }}>{c.avatar}</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={bs.cardName}>{c.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <View style={bs.roomTag}><Text style={bs.roomTagText}>Mã: {c.room}</Text></View>
                          <Text style={{ color: '#8892b0', fontSize: 11 }}>{c.phone}</Text>
                        </View>
                        {data.type === 'unpaid' && (
                          <Text style={{ color: '#e94560', fontSize: 11, marginTop: 4, fontWeight: '700' }}>
                            {c.overdue > 1 ? `❌ Nợ ${c.overdue} tháng · ${c.amount} ₫/tháng` : `❌ Chưa đóng tháng này · ${c.amount} ₫`}
                          </Text>
                        )}
                        {data.type === 'paid' && (
                          <Text style={{ color: '#2ecc71', fontSize: 11, marginTop: 4 }}>✅ Đã thanh toán · {c.amount} ₫</Text>
                        )}
                        {data.type === 'expiring' && (
                          <Text style={{ color: exp ? '#e94560' : '#f1c40f', fontSize: 11, marginTop: 4, fontWeight: '700' }}>
                            {exp
                              ? `🔴 Hết hạn ${Math.abs(daysBetween(c.contractEnd, '22/04/2026'))} ngày trước`
                              : `⚠️ Còn ${daysBetween('22/04/2026', c.contractEnd)} ngày`
                            }
                          </Text>
                        )}
                        {data.type === 'total' && (
                          <Text style={bs.cardDate}>Thuê từ {c.contractStart} · {c.amount} ₫/tháng</Text>
                        )}
                        {data.type !== 'total' && (
                          <Text style={bs.cardDate}>HĐ: {c.contractStart} → {c.contractEnd}</Text>
                        )}
                      </View>
                      <Text style={bs.arrow}>›</Text>
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

// ─── Staff Profile Modal ──────────────────────────────────
function StaffProfileModal({ staff, onClose, onSave }) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;
  const [name,     setName]     = useState(staff.name);
  const [phone,    setPhone]    = useState(staff.phone);
  const [gender,   setGender]   = useState(staff.gender || 'female');
  const [photoUri, setPhotoUri] = useState(staff.photoUri || null);

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
export default function StaffCustomersScreen() {
  const [buildings,   setBuildings]   = useState(INITIAL_BUILDINGS);
  const [search,      setSearch]      = useState('');
  const [filter,      setFilter]      = useState('Tất cả');
  const [collapsed,   setCollapsed]   = useState({});
  const [selected,    setSelected]    = useState(null);
  const [statsModal,  setStatsModal]  = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const { staff, updateStaff: setStaff } = useStaff();
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          style: 'destructive',
          onPress: () => navigation.getParent()?.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
          ),
        },
      ]
    );
  };

  const toggleBuilding = id => {
    LayoutAnimation.configureNext({
      duration: 280,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.75 },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    setCollapsed(p => ({ ...p, [id]: !p[id] }));
  };

  const handleResolveMessage = (customerId, msgId, resolverName, note) => {
    const toIssue = msg => ({
      id: `r-${msg.id}`,
      title: msg.text,
      reportedAt: msg.time ? msg.time.split(' ')[0] : DEMO_NOW_DISPLAY.split(' ')[0],
      resolvedAt: DEMO_NOW_DISPLAY.split(' ')[0],
      resolvedBy: resolverName,
      resolveNote: note || null,
      status: 'done',
    });
    const applyToCustomer = c => {
      if (c.id !== customerId) return c;
      const resolved = c.messages.find(m => m.id === msgId);
      return {
        ...c,
        messages: c.messages.filter(m => m.id !== msgId),
        issueHistory: resolved
          ? [...(c.issueHistory || []), toIssue(resolved)]
          : (c.issueHistory || []),
      };
    };
    setBuildings(prev => prev.map(b => ({ ...b, customers: b.customers.map(applyToCustomer) })));
    setSelected(prev => prev ? applyToCustomer(prev) : prev);
  };

  const matchCustomer = c => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || c.name.toLowerCase().includes(q)
      || c.phone.includes(q)
      || c.room.toLowerCase().includes(q);
    const matchFilter =
      filter === 'Tất cả' ||
      (filter === 'Đã thanh toán'   && c.paid) ||
      (filter === 'Chưa thanh toán' && !c.paid) ||
      (filter === 'Sắp hết HĐ'     && (isExpiringSoon(c.contractEnd) || isExpired(c.contractEnd))) ||
      (filter === 'Có tin nhắn'     && (c.messages || []).length > 0);
    return matchSearch && matchFilter;
  };

  const groupByFloor = customers => {
    const map = {};
    customers.forEach(c => { if (!map[c.floor]) map[c.floor] = []; map[c.floor].push(c); });
    return Object.entries(map).sort(([a], [b]) => Number(a) - Number(b));
  };

  const allCustomers    = buildings.flatMap(b => b.customers);
  const totalUnpaid     = allCustomers.filter(c => !c.paid).length;
  const totalExpiring   = allCustomers.filter(c => isExpiringSoon(c.contractEnd) || isExpired(c.contractEnd)).length;
  const totalWithMsgs   = allCustomers.filter(c => (c.messages || []).length > 0).length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <CustomerDetailModal
        customer={selected}
        staff={staff}
        onClose={() => setSelected(null)}
        onResolveMessage={handleResolveMessage}
      />

      {statsModal && (
        <BuildingStatsModal
          data={statsModal}
          onClose={() => setStatsModal(null)}
          onSelectCustomer={c => { setStatsModal(null); setSelected(c); }}
        />
      )}

      {showProfile && (
        <StaffProfileModal
          staff={staff}
          onClose={() => setShowProfile(false)}
          onSave={updated => setStaff(updated)}
        />
      )}

      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.header}>
          <View style={s.headerRow}>
            <View style={s.staffCard}>
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
              <View style={s.staffActions}>
                <TouchableOpacity style={s.editBadge} onPress={() => setShowProfile(true)}>
                  <Text style={s.editBadgeText}>✎  Chỉnh sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.logoutBadge} onPress={handleLogout}>
                  <Text style={s.logoutBadgeText}>⏻  Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text style={s.title}>Khách hàng</Text>
          <Text style={s.subtitle}>22/04/2026</Text>
        </LinearGradient>

        {(totalUnpaid > 0 || totalExpiring > 0 || totalWithMsgs > 0) && (
          <View style={s.taskPanel}>
            <Text style={s.taskPanelTitle}>📊 Tổng quan khách hàng</Text>
            <View style={s.taskRow}>
              {totalUnpaid > 0 && (
                <TouchableOpacity style={[s.taskCard, s.taskCardRed]} onPress={() => setFilter('Chưa thanh toán')}>
                  <Text style={s.taskCardNum}>{totalUnpaid}</Text>
                  <Text style={s.taskCardLabel}>Quá hạn</Text>
                </TouchableOpacity>
              )}
              {totalExpiring > 0 && (
                <TouchableOpacity style={[s.taskCard, s.taskCardYellow]} onPress={() => setFilter('Sắp hết HĐ')}>
                  <Text style={s.taskCardNum}>{totalExpiring}</Text>
                  <Text style={s.taskCardLabel}>Sắp hết HĐ</Text>
                </TouchableOpacity>
              )}
              {totalWithMsgs > 0 && (
                <TouchableOpacity style={[s.taskCard, s.taskCardBlue]} onPress={() => setFilter('Có tin nhắn')}>
                  <Text style={s.taskCardNum}>{totalWithMsgs}</Text>
                  <Text style={s.taskCardLabel}>Tin nhắn</Text>
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
            placeholder="Tìm tên, SĐT, mã phòng..."
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
          const filtered = building.customers.filter(matchCustomer);
          if (filtered.length === 0) return null;
          const counts = countCustomers(building.customers);
          const isOpen = !collapsed[building.id];
          const floors = groupByFloor(filtered);

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
                <TouchableOpacity style={s.pill} onPress={() => setStatsModal({ type: 'total', customers: building.customers, buildingName: building.name })}>
                  <Text style={s.pillVal}>{counts.total}</Text>
                  <Text style={s.pillLbl}>Khách ›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.pill, { borderColor: '#2ecc7144' }]} onPress={() => setStatsModal({ type: 'paid', customers: building.customers, buildingName: building.name })}>
                  <Text style={[s.pillVal, { color: '#2ecc71' }]}>{counts.paid}</Text>
                  <Text style={s.pillLbl}>Đã đóng ›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.pill, { borderColor: '#e9456044' }]} onPress={() => setStatsModal({ type: 'unpaid', customers: building.customers, buildingName: building.name })}>
                  <Text style={[s.pillVal, { color: '#e94560' }]}>{counts.unpaid}</Text>
                  <Text style={s.pillLbl}>Chưa đóng ›</Text>
                </TouchableOpacity>
                {counts.expiring > 0 && (
                  <TouchableOpacity style={[s.pill, { borderColor: '#f1c40f44' }]} onPress={() => setStatsModal({ type: 'expiring', customers: building.customers, buildingName: building.name })}>
                    <Text style={[s.pillVal, { color: '#f1c40f' }]}>{counts.expiring}</Text>
                    <Text style={s.pillLbl}>Sắp hết HĐ ›</Text>
                  </TouchableOpacity>
                )}
              </View>

              {isOpen && floors.map(([floor, customers]) => (
                <View key={floor} style={s.floorSection}>
                  <View style={s.floorLabel}>
                    <Text style={s.floorText}>Tầng {floor}</Text>
                    <Text style={s.floorCount}>{customers.length} khách</Text>
                  </View>
                  {customers.map(c => {
                    const expiring = isExpiringSoon(c.contractEnd);
                    const expired  = isExpired(c.contractEnd);
                    const pending  = (c.messages || []).filter(m => !m.resolved).length;
                    const isRed    = !c.paid || expired;
                    const isYellow = !isRed && (expiring || pending > 0);
                    const isGreen  = !isRed && !isYellow;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[s.customerRow, isRed && s.borderRed, isYellow && s.borderYellow, isGreen && s.borderGreen]}
                        onPress={() => setSelected(c)}
                      >
                        <View style={s.avatar}><Text style={{ fontSize: 22 }}>{c.avatar}</Text></View>
                        <View style={s.custMid}>
                          <Text style={s.custName}>{c.name}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                            <View style={s.roomCodeBadge}>
                              <Text style={s.roomCodeBadgeText}>Mã: {c.room}</Text>
                            </View>
                            <Text style={s.custPhone}>{c.phone}</Text>
                          </View>
                          <View style={s.custTagRow}>
                            <Text style={s.custDate}>HĐ: {c.contractStart} → {c.contractEnd}</Text>
                          </View>
                          {(expiring || expired) && (
                            <Text style={[s.expireWarn, expired && { color: '#e94560' }]}>
                              {expired ? '🔴 HĐ đã hết hạn' : `⚠️ Còn ${daysBetween('22/04/2026', c.contractEnd)} ngày`}
                            </Text>
                          )}
                          {pending > 0 && (
                            <View style={s.msgBadge}>
                              <Text style={s.msgBadgeText}>💬 {pending} tin chờ xử lý</Text>
                            </View>
                          )}
                        </View>
                        <View style={s.custRight}>
                          <View style={[s.payBadge, c.paid ? s.payPaid : s.payUnpaid]}>
                            <Text style={[s.payText, { color: c.paid ? '#2ecc71' : '#e94560' }]}>
                              {c.paid ? '✅ Đã đóng' : c.overdue > 1 ? `❌ Nợ ${c.overdue}T` : '❌ Chưa đóng'}
                            </Text>
                          </View>
                          <Text style={s.custAmount}>{c.amount} ₫</Text>
                          <Text style={s.tapHint}>Nhấn để xem →</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── List Styles ──────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { padding: 20, paddingTop: 10, paddingBottom: 16 },
  headerRow: { marginBottom: 14 },
  staffCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  staffAvatarBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(79,172,254,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14, overflow: 'hidden' },
  staffAvatarEmoji: { fontSize: 28 },
  staffAvatarPhoto: { width: 52, height: 52, borderRadius: 26 },
  staffInfo: { flex: 1 },
  staffName: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.3 },
  staffRoleBadge: { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4, marginBottom: 4 },
  staffRoleText: { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  staffPhone: { color: '#8892b0', fontSize: 12 },
  staffActions: { gap: 6, justifyContent: 'center' },
  editBadge: { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)', alignItems: 'center' },
  editBadgeText: { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  logoutBadge: { backgroundColor: 'rgba(233,69,96,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(233,69,96,0.3)', alignItems: 'center' },
  logoutBadgeText: { color: '#e94560', fontSize: 11, fontWeight: '700' },
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
  taskCardHint:  { color: '#8892b0', fontSize: 10, marginTop: 2 },
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
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  pill: { borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center' },
  pillVal: { color: '#fff', fontSize: 15, fontWeight: '800' },
  pillLbl: { color: '#8892b0', fontSize: 10 },
  floorSection: { marginTop: 4 },
  floorLabel: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  floorText: { color: '#4facfe', fontSize: 13, fontWeight: '700' },
  floorCount: { color: '#8892b0', fontSize: 12 },
  customerRow: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: 'transparent' },
  borderRed:    { borderLeftColor: '#e94560' },
  borderYellow: { borderLeftColor: '#f1c40f' },
  borderGreen:  { borderLeftColor: '#2ecc71' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  custMid: { flex: 1 },
  custName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  custPhone: { color: '#8892b0', fontSize: 12 },
  custTagRow: { marginTop: 3 },
  custDate: { color: '#8892b0', fontSize: 11 },
  expireWarn: { color: '#f1c40f', fontSize: 11, marginTop: 3, fontWeight: '600' },
  msgBadge: { backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  msgBadgeText: { color: '#e94560', fontSize: 10, fontWeight: '700' },
  roomCodeBadge: { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 },
  roomCodeBadgeText: { color: '#4facfe', fontSize: 10, fontWeight: '700' },
  custRight: { alignItems: 'flex-end', gap: 4 },
  payBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  payPaid:   { backgroundColor: 'rgba(46,204,113,0.15)' },
  payUnpaid: { backgroundColor: 'rgba(233,69,96,0.15)' },
  payText: { fontSize: 11, fontWeight: '700' },
  custAmount: { color: '#4facfe', fontSize: 12, fontWeight: '700' },
  tapHint: { color: '#8892b0', fontSize: 10, fontStyle: 'italic' },
});

// ─── Modal Styles ─────────────────────────────────────────
const md = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '93%', paddingTop: 12 },
  handle: { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  avatarBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  avatarText: { fontSize: 28 },
  headerInfo: { flex: 1 },
  customerName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  roomCodeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 6 },
  roomCodeTag: { backgroundColor: 'rgba(79,172,254,0.18)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(79,172,254,0.35)' },
  roomCodeText: { color: '#4facfe', fontSize: 12, fontWeight: '800' },
  floorLabel: { color: '#8892b0', fontSize: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  payBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  payBadgePaid: { backgroundColor: 'rgba(46,204,113,0.15)' },
  payBadgeUnpaid: { backgroundColor: 'rgba(233,69,96,0.15)' },
  payBadgeText: { fontSize: 12, fontWeight: '700' },
  expBadge: { backgroundColor: 'rgba(241,196,15,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  expBadgeRed: { backgroundColor: 'rgba(233,69,96,0.15)' },
  expBadgeText: { color: '#f1c40f', fontSize: 12, fontWeight: '700' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#8892b0', fontSize: 14 },
  scroll: { paddingHorizontal: 20 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 4 },
  actionCall: { flex: 1, backgroundColor: 'rgba(46,204,113,0.1)', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)' },
  actionEmail: { flex: 1, backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)' },
  actionCallIcon: { fontSize: 22, marginBottom: 4 },
  actionCallText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  actionCallSub: { color: '#8892b0', fontSize: 11, marginTop: 2 },
  section: { marginTop: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  sectionBadge: { backgroundColor: 'rgba(233,69,96,0.2)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  sectionBadgeText: { color: '#e94560', fontSize: 11, fontWeight: '700' },
  contractCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  contractRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  contractItem: { flex: 1, alignItems: 'center' },
  contractArrow: { paddingHorizontal: 8 },
  contractLabel: { color: '#8892b0', fontSize: 11, marginBottom: 4 },
  contractDate: { color: '#fff', fontSize: 16, fontWeight: '800' },
  contractSub: { color: '#8892b0', fontSize: 11, marginTop: 3 },
  contractAlert: { backgroundColor: 'rgba(241,196,15,0.1)', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(241,196,15,0.25)' },
  contractAlertRed: { backgroundColor: 'rgba(233,69,96,0.1)', borderColor: 'rgba(233,69,96,0.3)' },
  contractAlertText: { color: '#f1c40f', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  infoLabel: { color: '#8892b0', fontSize: 13 },
  infoValue: { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
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
  // Payment table
  tbl: { borderRadius: 10, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden', marginTop: 4 },
  tblRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.08)' },
  tblHead: { backgroundColor: 'rgba(255,255,255,0.07)' },
  tblRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  tblName: { flex: 4, paddingVertical: 8, paddingHorizontal: 8 },
  tblQty:  { flex: 3, paddingVertical: 8, paddingHorizontal: 4, textAlign: 'center' },
  tblUnit: { flex: 3, paddingVertical: 8, paddingHorizontal: 4, textAlign: 'right' },
  tblAmt:  { flex: 3, paddingVertical: 8, paddingHorizontal: 8, textAlign: 'right' },
  tblHeadTxt: { color: '#8892b0', fontSize: 10, fontWeight: '700' },
  tblCell: { color: '#ccd6f6', fontSize: 12 },
  tblTotalRow: { backgroundColor: 'rgba(79,172,254,0.08)', borderBottomWidth: 0 },
  tblTotalLabel: { color: '#fff', fontSize: 13, fontWeight: '800' },
  tblTotalAmt: { fontSize: 13, fontWeight: '800' },
  // Messages
  msgCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  msgCardPending: { borderColor: 'rgba(233,69,96,0.35)', backgroundColor: 'rgba(233,69,96,0.04)' },
  msgTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  msgTime: { color: '#8892b0', fontSize: 12 },
  msgTag: { backgroundColor: 'rgba(241,196,15,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  msgTagDone: { backgroundColor: 'rgba(46,204,113,0.15)' },
  msgTagText: { color: '#f1c40f', fontSize: 11, fontWeight: '600' },
  msgText: { color: '#ccd6f6', fontSize: 13, fontStyle: 'italic', lineHeight: 20 },
  msgActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  msgCallBtn: { flex: 1, backgroundColor: 'rgba(46,204,113,0.12)', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)' },
  msgCallText: { color: '#2ecc71', fontSize: 12, fontWeight: '700' },
  msgDoneBtn: { flex: 1, backgroundColor: 'rgba(241,196,15,0.12)', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(241,196,15,0.4)' },
  msgDoneBtnActive: { backgroundColor: 'rgba(241,196,15,0.2)', borderColor: '#f1c40f' },
  msgDoneText: { color: '#f1c40f', fontSize: 12, fontWeight: '700' },
  msgResolvedInfo: { marginTop: 10, backgroundColor: 'rgba(46,204,113,0.08)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(46,204,113,0.2)' },
  msgResolvedText: { color: '#2ecc71', fontSize: 12, fontWeight: '600' },
  msgResolvedDate: { color: '#8892b0', fontSize: 11, marginTop: 3 },
  msgResolvedNote: { color: '#ccd6f6', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  // Resolve form
  msgResolveForm: { marginTop: 12, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  resolveFormLabel: { color: '#ccd6f6', fontSize: 13, fontWeight: '600', marginBottom: 10 },
  dropdownBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 4 },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  dropdownSelected: { backgroundColor: 'rgba(79,172,254,0.1)' },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#8892b0', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#4facfe' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4facfe' },
  dropdownOptionContent: { flex: 1 },
  dropdownOptionTitle: { color: '#ccd6f6', fontSize: 14, fontWeight: '600' },
  dropdownOptionSub: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  dropdownDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  resolveInput: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', padding: 12, fontSize: 13, marginTop: 8 },
  resolveInputMulti: { minHeight: 80, textAlignVertical: 'top' },
  resolveTimestamp: { backgroundColor: 'rgba(79,172,254,0.08)', borderRadius: 8, padding: 10, marginTop: 10 },
  resolveTimestampText: { color: '#4facfe', fontSize: 12 },
  confirmBtn: { marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  confirmGradient: { paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  // Issue history
  emptyBox: { backgroundColor: 'rgba(46,204,113,0.06)', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.15)' },
  emptyBoxText: { color: '#8892b0', fontSize: 13 },
  timelineItem: { flexDirection: 'row', marginBottom: 6 },
  timelineLeft: { width: 20, alignItems: 'center', paddingTop: 4 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineBar: { width: 2, flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 4 },
  timelineContent: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginLeft: 10, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  issueTitle: { color: '#ccd6f6', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  issueDateRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  issueDateLabel: { color: '#8892b0', fontSize: 12, width: 110 },
  issueDateVal: { color: '#ccd6f6', fontSize: 12, flex: 1 },
  // Room history
  prevRoomCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  prevRoomCardCurrent: { borderColor: 'rgba(46,204,113,0.3)', backgroundColor: 'rgba(46,204,113,0.05)' },
  prevRoomHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  prevRoomIcon: { fontSize: 24 },
  prevRoomName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  prevRoomBuilding: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  prevRoomDates: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  prevRoomDate: { color: '#8892b0', fontSize: 12 },
  prevRoomDays: { color: '#4facfe', fontSize: 12, fontWeight: '600' },
  prevRoomReason: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10 },
  prevRoomReasonText: { color: '#8892b0', fontSize: 12, fontStyle: 'italic' },
  noteCard: { backgroundColor: 'rgba(254,225,64,0.07)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(254,225,64,0.2)' },
  noteText: { color: '#ccd6f6', fontSize: 13, lineHeight: 20 },
});

// ─── Building Stats Styles ────────────────────────────────
const bs = StyleSheet.create({
  countBadge: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', marginRight: 8 },
  countNum: { fontSize: 20, fontWeight: '900' },
  countLbl: { color: '#8892b0', fontSize: 10, marginTop: 1 },
  floorBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(79,172,254,0.2)', marginBottom: 10 },
  floorBarText: { color: '#4facfe', fontSize: 13, fontWeight: '700' },
  floorBarCount: { color: '#8892b0', fontSize: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 13, marginBottom: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  cardAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 13 },
  cardName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  cardSub: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  cardDate: { color: '#8892b0', fontSize: 11, marginTop: 4 },
  arrow: { color: '#8892b0', fontSize: 22, marginLeft: 6 },
  roomTag: { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  roomTagText: { color: '#4facfe', fontSize: 11, fontWeight: '700' },
});

// ─── Profile Modal Styles ─────────────────────────────────
const pf = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  scroll: { padding: 20 },
  label: { color: '#8892b0', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
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
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  genderBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  genderSelected: { borderColor: '#4facfe', backgroundColor: 'rgba(79,172,254,0.1)' },
  genderEmoji: { fontSize: 36, marginBottom: 6 },
  genderLabel: { color: '#8892b0', fontSize: 14, fontWeight: '700' },
  genderCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: '#4facfe', justifyContent: 'center', alignItems: 'center' },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  saveBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  saveGradient: { paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
