import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, StatusBar, Modal, Animated, Linking, Dimensions,
  LayoutAnimation, Platform, UIManager
} from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_H = Dimensions.get('window').height;

// ─── Dữ liệu khách hàng ──────────────────────────────────
const buildings = [
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
          { id: 'm2', text: 'Cửa sổ phòng em bị kẹt không mở được', time: '18/04/2026 08:30', resolved: true },
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
        notes: '',
      },
    ],
  },
];

const FILTERS = ['Tất cả', 'Đã thanh toán', 'Chưa thanh toán', 'Sắp hết HĐ'];
const DEMO_NOW = new Date(2026, 3, 22);

function daysBetween(dateStr1, dateStr2) {
  const parse = s => { const [d,m,y] = s.split('/').map(Number); return new Date(y,m-1,d); };
  return Math.floor((parse(dateStr2) - parse(dateStr1)) / 86400000);
}

function isExpiringSoon(contractEnd) {
  const [d,m,y] = contractEnd.split('/').map(Number);
  const end = new Date(y, m-1, d);
  const diff = (end - DEMO_NOW) / 86400000;
  return diff >= 0 && diff <= 30;
}

function isExpired(contractEnd) {
  const [d,m,y] = contractEnd.split('/').map(Number);
  return new Date(y, m-1, d) < DEMO_NOW;
}

function countCustomers(customers) {
  return {
    total:    customers.length,
    paid:     customers.filter(c => c.paid).length,
    unpaid:   customers.filter(c => !c.paid).length,
    expiring: customers.filter(c => isExpiringSoon(c.contractEnd)).length,
  };
}

// ─── Animated Bottom Sheet Modal ─────────────────────────
function CustomerDetailModal({ customer, onClose }) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (customer) {
      setVisible(true);
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

  if (!customer && !visible) return null;

  const expiring = customer && isExpiringSoon(customer.contractEnd);
  const expired  = customer && isExpired(customer.contractEnd);
  const pendingMsg = customer ? (customer.messages || []).filter(m => !m.resolved) : [];
  const rentedDays = customer ? daysBetween(customer.contractStart, '22/04/2026') : 0;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      {/* Backdrop */}
      <Animated.View style={[md.backdrop, { opacity }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View style={[md.sheet, { transform: [{ translateY }] }]}>
        <View style={md.handle} />

        {customer && <>
          {/* ── Tên & trạng thái ── */}
          <View style={md.headerRow}>
            <View style={md.avatarBox}><Text style={md.avatarText}>{customer.avatar}</Text></View>
            <View style={md.headerInfo}>
              <Text style={md.customerName}>{customer.name}</Text>
              <Text style={md.customerRoom}>Phòng {customer.room} · Tầng {customer.floor}</Text>
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

            {/* ── Gọi điện & nhắn tin ── */}
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

            {/* ── Thông tin hợp đồng ── */}
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

            {/* ── Tin nhắn cần xử lý ── */}
            {(customer.messages || []).length > 0 && (
              <Section title="💬 Tin nhắn từ khách" badge={pendingMsg.length > 0 ? `${pendingMsg.length} chờ xử lý` : null}>
                {customer.messages.map(msg => (
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
                    {!msg.resolved && (
                      <TouchableOpacity style={md.callBackBtn} onPress={() => Linking.openURL(`tel:${customer.phone}`)}>
                        <Text style={md.callBackText}>📞 Gọi lại để xử lý</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </Section>
            )}

            {/* ── Lịch sử vấn đề tại phòng ── */}
            <Section title="🔧 Lịch sử vấn đề phòng">
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
              {/* Phòng hiện tại */}
              <View style={[md.prevRoomCard, md.prevRoomCardCurrent]}>
                <View style={md.prevRoomHeader}>
                  <Text style={md.prevRoomIcon}>📍</Text>
                  <View>
                    <Text style={[md.prevRoomName, { color: '#2ecc71' }]}>Phòng {customer.room} (hiện tại)</Text>
                    <Text style={md.prevRoomBuilding}>{buildings.find(b => b.customers.some(c => c.id === customer.id))?.name}</Text>
                  </View>
                </View>
                <Text style={md.prevRoomDate}>📅 Từ {customer.contractStart} · {rentedDays} ngày đã ở</Text>
              </View>
            </Section>

            {/* ── Ghi chú ── */}
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

// ─── Building Stats Modal ────────────────────────────────
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
  if (data.type === 'total') {
    list.forEach(c => { if (!byFloor[c.floor]) byFloor[c.floor] = []; byFloor[c.floor].push(c); });
  }

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
            <Text style={md.customerRoom}>🏢 {data.buildingName}</Text>
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
          ) : data.type === 'total' ? (
            Object.entries(byFloor).sort(([a],[b]) => Number(a) - Number(b)).map(([floor, floorCustomers]) => (
              <View key={floor} style={{ marginTop: 16 }}>
                <View style={bs.floorBar}>
                  <Text style={bs.floorBarText}>Tầng {floor}</Text>
                  <Text style={bs.floorBarCount}>{floorCustomers.length} phòng có khách</Text>
                </View>
                {floorCustomers.map(c => (
                  <TouchableOpacity key={c.id} style={bs.card} onPress={() => goToCustomer(c)} activeOpacity={0.75}>
                    <View style={bs.cardAvatar}><Text style={{ fontSize: 22 }}>{c.avatar}</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={bs.cardName}>{c.name}</Text>
                      <Text style={bs.cardSub}>Phòng {c.room} · {c.phone}</Text>
                      <Text style={bs.cardDate}>Thuê từ {c.contractStart} · {c.amount} ₫/tháng</Text>
                    </View>
                    <Text style={bs.arrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))
          ) : (
            Object.entries(
              list.reduce((acc, c) => {
                if (!acc[c.floor]) acc[c.floor] = [];
                acc[c.floor].push(c);
                return acc;
              }, {})
            ).sort(([a],[b]) => Number(a) - Number(b)).map(([floor, floorList]) => (
              <View key={floor} style={{ marginTop: 16 }}>
                <View style={bs.floorBar}>
                  <Text style={bs.floorBarText}>Tầng {floor}</Text>
                  <Text style={bs.floorBarCount}>{floorList.length} khách</Text>
                </View>
                {floorList.map(c => {
                  const expired  = isExpired(c.contractEnd);
                  return (
                    <TouchableOpacity key={c.id} style={bs.card} onPress={() => goToCustomer(c)} activeOpacity={0.75}>
                      <View style={bs.cardAvatar}><Text style={{ fontSize: 22 }}>{c.avatar}</Text></View>
                      <View style={{ flex: 1 }}>
                        <Text style={bs.cardName}>{c.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <View style={bs.roomTag}>
                            <Text style={bs.roomTagText}>Phòng {c.room}</Text>
                          </View>
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
                          <Text style={{ color: expired ? '#e94560' : '#f1c40f', fontSize: 11, marginTop: 4, fontWeight: '700' }}>
                            {expired
                              ? `🔴 Hết hạn ${Math.abs(daysBetween(c.contractEnd, '22/04/2026'))} ngày trước`
                              : `⚠️ Còn ${daysBetween('22/04/2026', c.contractEnd)} ngày`
                            }
                          </Text>
                        )}
                        <Text style={bs.cardDate}>HĐ: {c.contractStart} → {c.contractEnd}</Text>
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

// ─── Main Screen ──────────────────────────────────────────
export default function StaffCustomersScreen() {
  const [search,     setSearch]     = useState('');
  const [filter,     setFilter]     = useState('Tất cả');
  const [collapsed,  setCollapsed]  = useState({});
  const [selected,   setSelected]   = useState(null);
  const [statsModal, setStatsModal] = useState(null);

  const toggleBuilding = id => {
    LayoutAnimation.configureNext({
      duration: 280,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.75 },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    setCollapsed(p => ({ ...p, [id]: !p[id] }));
  };

  const matchCustomer = c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.room.toLowerCase().includes(q);
    const matchFilter =
      filter === 'Tất cả' ||
      (filter === 'Đã thanh toán'   && c.paid) ||
      (filter === 'Chưa thanh toán' && !c.paid) ||
      (filter === 'Sắp hết HĐ'     && (isExpiringSoon(c.contractEnd) || isExpired(c.contractEnd)));
    return matchSearch && matchFilter;
  };

  const groupByFloor = customers => {
    const map = {};
    customers.forEach(c => { if (!map[c.floor]) map[c.floor] = []; map[c.floor].push(c); });
    return Object.entries(map).sort(([a],[b]) => Number(a) - Number(b));
  };

  const allCustomers  = buildings.flatMap(b => b.customers);
  const totalUnpaid   = allCustomers.filter(c => !c.paid).length;
  const totalExpiring = allCustomers.filter(c => isExpiringSoon(c.contractEnd) || isExpired(c.contractEnd)).length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <CustomerDetailModal customer={selected} onClose={() => setSelected(null)} />

      {statsModal && (
        <BuildingStatsModal
          data={statsModal}
          onClose={() => setStatsModal(null)}
          onSelectCustomer={c => { setStatsModal(null); setSelected(c); }}
        />
      )}

      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.header}>
          <Text style={s.title}>Khách hàng</Text>
        </LinearGradient>

        {/* Alert bar */}
        {(totalUnpaid > 0 || totalExpiring > 0) && (
          <View style={s.alertBar}>
            {totalUnpaid   > 0 && <Text style={s.alertItem}>💸 {totalUnpaid} khách chưa đóng tiền</Text>}
            {totalExpiring > 0 && <Text style={s.alertItem}>📅 {totalExpiring} HĐ sắp/đã hết hạn</Text>}
          </View>
        )}

        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Tìm tên, SĐT, số phòng..."
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
                <TouchableOpacity style={[s.pill,{borderColor:'#2ecc7144'}]} onPress={() => setStatsModal({ type: 'paid', customers: building.customers, buildingName: building.name })}>
                  <Text style={[s.pillVal,{color:'#2ecc71'}]}>{counts.paid}</Text>
                  <Text style={s.pillLbl}>Đã đóng ›</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.pill,{borderColor:'#e9456044'}]} onPress={() => setStatsModal({ type: 'unpaid', customers: building.customers, buildingName: building.name })}>
                  <Text style={[s.pillVal,{color:'#e94560'}]}>{counts.unpaid}</Text>
                  <Text style={s.pillLbl}>Chưa đóng ›</Text>
                </TouchableOpacity>
                {counts.expiring > 0 && (
                  <TouchableOpacity style={[s.pill,{borderColor:'#f1c40f44'}]} onPress={() => setStatsModal({ type: 'expiring', customers: building.customers, buildingName: building.name })}>
                    <Text style={[s.pillVal,{color:'#f1c40f'}]}>{counts.expiring}</Text>
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
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[s.customerRow, !c.paid && s.borderRed, expiring && s.borderYellow, expired && s.borderRed]}
                        onPress={() => setSelected(c)}
                      >
                        <View style={s.avatar}><Text style={{ fontSize: 22 }}>{c.avatar}</Text></View>
                        <View style={s.custMid}>
                          <Text style={s.custName}>{c.name}</Text>
                          <Text style={s.custSub}>P{c.room} · {c.phone}</Text>
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

// ─── List Styles ─────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { padding: 20, paddingTop: 10 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  alertBar: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, backgroundColor: 'rgba(233,69,96,0.08)', borderBottomWidth: 1, borderColor: 'rgba(233,69,96,0.2)', paddingHorizontal: 16, paddingVertical: 10 },
  alertItem: { color: '#e94560', fontSize: 13, fontWeight: '600' },
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
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  custMid: { flex: 1 },
  custName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  custSub: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  custTagRow: { marginTop: 3 },
  custDate: { color: '#8892b0', fontSize: 11 },
  expireWarn: { color: '#f1c40f', fontSize: 11, marginTop: 3, fontWeight: '600' },
  msgBadge: { backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  msgBadgeText: { color: '#e94560', fontSize: 10, fontWeight: '700' },
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
  customerRoom: { color: '#8892b0', fontSize: 13, marginTop: 2, marginBottom: 8 },
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
  msgCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  msgCardPending: { borderColor: 'rgba(233,69,96,0.35)', backgroundColor: 'rgba(233,69,96,0.04)' },
  msgTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  msgTime: { color: '#8892b0', fontSize: 12 },
  msgTag: { backgroundColor: 'rgba(241,196,15,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  msgTagDone: { backgroundColor: 'rgba(46,204,113,0.15)' },
  msgTagText: { color: '#f1c40f', fontSize: 11, fontWeight: '600' },
  msgText: { color: '#ccd6f6', fontSize: 13, fontStyle: 'italic', lineHeight: 20 },
  callBackBtn: { marginTop: 10, backgroundColor: 'rgba(46,204,113,0.12)', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)' },
  callBackText: { color: '#2ecc71', fontSize: 12, fontWeight: '700' },
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
