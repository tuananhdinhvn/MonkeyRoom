import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Modal, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const HOTLINE = '0901234567';

const announcements = [
  { id: '1', title: 'Cắt điện bảo trì tầng 2', time: 'Ngày mai 8:00 - 12:00', icon: '⚡', type: 'warning' },
  { id: '2', title: 'Vệ sinh khu vực chung', time: 'Thứ 7, 14/04/2026', icon: '🧹', type: 'info' },
];

const ROOMMATES = [
  { id: 'r1', name: 'Trần Thị Bích', cccd: '079295012345', phone: '0912 111 222' },
  { id: 'r2', name: 'Lê Văn Cường',  cccd: '001299876543', phone: '0987 333 444' },
];

// ─── Roommate Detail Modal ────────────────────────────────
function RoommateDetailModal({ roommate, onClose }) {
  if (!roommate) return null;
  return (
    <Modal visible={!!roommate} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={rm.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={rm.sheet}>
          <View style={rm.handle} />
          <Text style={rm.title}>Thông tin người ở cùng</Text>
          <View style={rm.avatarWrap}>
            <View style={rm.avatar}><Text style={{ fontSize: 32 }}>👤</Text></View>
          </View>
          <View style={rm.infoCard}>
            <View style={rm.infoRow}>
              <Text style={rm.infoIcon}>👤</Text>
              <View style={{ flex: 1 }}>
                <Text style={rm.infoLabel}>Họ tên</Text>
                <Text style={rm.infoValue}>{roommate.name}</Text>
              </View>
            </View>
            <View style={rm.divider} />
            <View style={rm.infoRow}>
              <Text style={rm.infoIcon}>🪪</Text>
              <View style={{ flex: 1 }}>
                <Text style={rm.infoLabel}>Căn cước công dân</Text>
                <Text style={rm.infoValue}>{roommate.cccd}</Text>
              </View>
            </View>
            <View style={rm.divider} />
            <View style={rm.infoRow}>
              <Text style={rm.infoIcon}>📞</Text>
              <View style={{ flex: 1 }}>
                <Text style={rm.infoLabel}>Số điện thoại</Text>
                <Text style={rm.infoValue}>{roommate.phone}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={rm.closeBtn} onPress={onClose}>
            <Text style={rm.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Contract Modal ───────────────────────────────────────
function ContractModal({ visible, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ct.overlay}>
        <View style={ct.sheet}>
          <View style={ct.handle} />
          <Text style={ct.title}>📄 Hợp đồng thuê phòng</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={ct.docCard}>
              <Text style={ct.docHeader}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM{'\n'}Độc lập – Tự do – Hạnh phúc</Text>
              <Text style={ct.docTitle}>HỢP ĐỒNG THUÊ PHÒNG</Text>
              <Text style={ct.docSub}>Số: 2025/HĐTP-GH-101</Text>

              <View style={ct.sectionRow}><Text style={ct.sectionHead}>BÊN CHO THUÊ (A)</Text></View>
              {[
                ['Họ tên',      'Nguyễn Thị Quản Lý'],
                ['Địa chỉ',     '12 Nguyễn Trãi, Quận 1, TP.HCM'],
                ['Số điện thoại','0901 234 567'],
              ].map(([l, v]) => (
                <View key={l} style={ct.fieldRow}>
                  <Text style={ct.fieldLabel}>{l}:</Text>
                  <Text style={ct.fieldValue}>{v}</Text>
                </View>
              ))}

              <View style={ct.sectionRow}><Text style={ct.sectionHead}>BÊN THUÊ (B)</Text></View>
              {[
                ['Họ tên',       'Nguyễn Văn An'],
                ['CCCD',         '079292012345'],
                ['Số điện thoại','0912 345 678'],
              ].map(([l, v]) => (
                <View key={l} style={ct.fieldRow}>
                  <Text style={ct.fieldLabel}>{l}:</Text>
                  <Text style={ct.fieldValue}>{v}</Text>
                </View>
              ))}

              <View style={ct.sectionRow}><Text style={ct.sectionHead}>THÔNG TIN HỢP ĐỒNG</Text></View>
              {[
                ['Phòng',        'Phòng 101 – Nhà A Green Home'],
                ['Diện tích',    '20 m²'],
                ['Tiền thuê',    '3,500,000 ₫ / tháng'],
                ['Ngày bắt đầu', '01/01/2025'],
                ['Thời hạn',     '12 tháng'],
                ['Ngày kết thúc','31/12/2025'],
              ].map(([l, v]) => (
                <View key={l} style={ct.fieldRow}>
                  <Text style={ct.fieldLabel}>{l}:</Text>
                  <Text style={ct.fieldValue}>{v}</Text>
                </View>
              ))}

              <View style={ct.signRow}>
                <View style={ct.signBox}>
                  <Text style={ct.signLabel}>Bên A</Text>
                  <Text style={ct.signName}>Nguyễn Thị Quản Lý</Text>
                </View>
                <View style={ct.signBox}>
                  <Text style={ct.signLabel}>Bên B</Text>
                  <Text style={ct.signName}>Nguyễn Văn An</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 8 }} />
          </ScrollView>
          <TouchableOpacity style={ct.closeBtn} onPress={onClose}>
            <Text style={ct.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function TenantHomeScreen({ navigation }) {
  const now       = new Date();
  const billMonth = `${now.getMonth() + 1}/${now.getFullYear()}`;

  const [selectedRM,      setSelectedRM]      = useState(null);
  const [contractVisible, setContractVisible] = useState(false);

  const QUICK_ACTIONS = [
    {
      icon: '💳', label: 'Thanh toán', color: '#e94560',
      onPress: () => navigation.navigate('TenantPayment'),
    },
    {
      icon: '🔧', label: 'Báo sự cố', color: '#fee140',
      onPress: () => navigation.navigate('TenantReport'),
    },
    {
      icon: '📄', label: 'Hợp đồng', color: '#4facfe',
      onPress: () => setContractVisible(true),
    },
    {
      icon: '📞', label: 'Hotline', color: '#43e97b',
      onPress: () => Linking.openURL(`tel:${HOTLINE}`),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <RoommateDetailModal roommate={selectedRM} onClose={() => setSelectedRM(null)} />
      <ContractModal visible={contractVisible} onClose={() => setContractVisible(false)} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Xin chào 👋</Text>
              <Text style={styles.tenantName}>Nguyễn Văn An</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>1</Text></View>
            </TouchableOpacity>
          </View>
          <View style={styles.roomInfoCard}>
            <View style={styles.roomInfoLeft}>
              <Text style={styles.roomLabel}>Phòng của tôi</Text>
              <Text style={styles.roomNumber}>Phòng 101</Text>
              <Text style={styles.roomAddress}>Tòa nhà Green Home, Tầng 1</Text>
            </View>
            <View style={styles.roomInfoRight}>
              <View style={styles.roomStatusBadge}>
                <Text style={styles.roomStatusText}>✅ Đang thuê</Text>
              </View>
              <Text style={styles.roomArea}>📐 20m²</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action, i) => (
              <TouchableOpacity key={i} style={styles.actionBtn} onPress={action.onPress} activeOpacity={0.75}>
                <View style={[styles.actionIconBox, { backgroundColor: action.color + '22' }]}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Bill */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hóa đơn tháng {billMonth}</Text>
          <View style={styles.billCard}>
            {/* Room */}
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Tiền phòng</Text>
              <Text style={styles.billValue}>3,500,000 ₫</Text>
            </View>
            {/* Electricity */}
            <View style={styles.billRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.billLabel}>Tiền điện</Text>
                <Text style={styles.billDetail}>Chỉ số 1234 → 1354  (120 số × 3,000 ₫)</Text>
              </View>
              <Text style={styles.billValue}>360,000 ₫</Text>
            </View>
            {/* Water */}
            <View style={styles.billRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.billLabel}>Tiền nước</Text>
                <Text style={styles.billDetail}>Chỉ số 40 → 45  (5 khối × 15,000 ₫)</Text>
              </View>
              <Text style={styles.billValue}>75,000 ₫</Text>
            </View>
            {/* Internet */}
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Internet</Text>
              <Text style={styles.billValue}>100,000 ₫</Text>
            </View>
            {/* Service */}
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Dịch vụ</Text>
              <Text style={styles.billValue}>120,000 ₫</Text>
            </View>
            <View style={styles.billDivider} />
            <View style={styles.billRow}>
              <Text style={styles.billTotal}>Tổng cộng</Text>
              <Text style={styles.billTotalValue}>4,155,000 ₫</Text>
            </View>
            <View style={styles.unpaidBadge}>
              <Text style={styles.unpaidText}>⏳ Vui lòng thanh toán trước ngày: 05/05/2026</Text>
            </View>
            <TouchableOpacity style={styles.payBtn} onPress={() => navigation.navigate('TenantPayment')}>
              <LinearGradient colors={['#e94560', '#c62a47']} style={styles.payGradient}>
                <Text style={styles.payText}>💳 Thanh toán ngay</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Roommates */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>👥 Người ở cùng</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{ROOMMATES.length} người</Text>
            </View>
          </View>
          {ROOMMATES.length === 0 ? (
            <View style={styles.roommateEmpty}>
              <Text style={styles.roommateEmptyText}>Chưa có thông tin người ở cùng</Text>
            </View>
          ) : (
            <View style={styles.roommateCard}>
              {ROOMMATES.map((r, i) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roommateRow, i < ROOMMATES.length - 1 && styles.roommateRowBorder]}
                  onPress={() => setSelectedRM(r)}
                  activeOpacity={0.75}
                >
                  <View style={styles.roommateAvatar}>
                    <Text style={{ fontSize: 20 }}>👤</Text>
                  </View>
                  <Text style={styles.roommateName}>{r.name}</Text>
                  <Text style={styles.roommateChevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Announcements */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Thông báo từ chủ nhà</Text>
          {announcements.map(a => (
            <View key={a.id} style={[styles.announcementCard, a.type === 'warning' && styles.announcementWarning]}>
              <Text style={styles.announcementIcon}>{a.icon}</Text>
              <View style={styles.announcementInfo}>
                <Text style={styles.announcementTitle}>{a.title}</Text>
                <Text style={styles.announcementTime}>🕐 {a.time}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#1a1a2e' },
  container:         { flex: 1, backgroundColor: '#0d0d1a' },
  header:            { padding: 20, paddingTop: 10, paddingBottom: 24 },
  headerTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting:          { color: '#8892b0', fontSize: 14 },
  tenantName:        { color: '#fff', fontSize: 22, fontWeight: '800' },
  notifBtn:          { position: 'relative', padding: 8 },
  notifIcon:         { fontSize: 24 },
  notifBadge:        { position: 'absolute', top: 4, right: 4, backgroundColor: '#e94560', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText:    { color: '#fff', fontSize: 10, fontWeight: '700' },
  roomInfoCard:      { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 18, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  roomInfoLeft:      {},
  roomLabel:         { color: '#8892b0', fontSize: 12, marginBottom: 4 },
  roomNumber:        { color: '#fff', fontSize: 26, fontWeight: '800' },
  roomAddress:       { color: '#8892b0', fontSize: 12, marginTop: 4 },
  roomInfoRight:     { alignItems: 'flex-end', justifyContent: 'space-between' },
  roomStatusBadge:   { backgroundColor: 'rgba(67,233,123,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  roomStatusText:    { color: '#43e97b', fontSize: 12, fontWeight: '700' },
  roomArea:          { color: '#8892b0', fontSize: 13 },

  section:           { padding: 20, paddingBottom: 0 },
  sectionTitle:      { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 14 },
  sectionTitleRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },

  actionsGrid:       { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn:         { alignItems: 'center', flex: 1 },
  actionIconBox:     { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionIcon:        { fontSize: 26 },
  actionLabel:       { color: '#ccd6f6', fontSize: 12, fontWeight: '600' },

  billCard:          { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  billRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  billLabel:         { color: '#8892b0', fontSize: 14 },
  billDetail:        { color: 'rgba(136,146,176,0.7)', fontSize: 11, marginTop: 3 },
  billValue:         { color: '#ccd6f6', fontSize: 14, fontWeight: '600' },
  billDivider:       { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
  billTotal:         { color: '#fff', fontSize: 15, fontWeight: '700' },
  billTotalValue:    { color: '#4facfe', fontSize: 18, fontWeight: '800' },
  unpaidBadge:       { backgroundColor: 'rgba(254,225,64,0.1)', borderRadius: 10, padding: 10, marginTop: 12, marginBottom: 14 },
  unpaidText:        { color: '#fee140', fontSize: 13, textAlign: 'center' },
  payBtn:            { borderRadius: 12, overflow: 'hidden' },
  payGradient:       { paddingVertical: 14, alignItems: 'center' },
  payText:           { color: '#fff', fontWeight: '800', fontSize: 15 },

  countBadge:        { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)' },
  countBadgeText:    { color: '#4facfe', fontSize: 12, fontWeight: '700' },
  roommateCard:      { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  roommateRow:       { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  roommateRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  roommateAvatar:    { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(79,172,254,0.1)', justifyContent: 'center', alignItems: 'center' },
  roommateName:      { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
  roommateChevron:   { color: '#8892b0', fontSize: 22, fontWeight: '300' },
  roommateEmpty:     { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  roommateEmptyText: { color: '#8892b0', fontSize: 13 },

  announcementCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#4facfe', gap: 14 },
  announcementWarning: { borderLeftColor: '#fee140' },
  announcementIcon:    { fontSize: 24 },
  announcementInfo:    {},
  announcementTitle:   { color: '#fff', fontSize: 14, fontWeight: '600' },
  announcementTime:    { color: '#8892b0', fontSize: 12, marginTop: 3 },
});

// ─── Roommate Modal Styles ────────────────────────────────
const rm = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#16213e', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12 },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 20 },
  title:      { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  avatarWrap: { alignItems: 'center', marginBottom: 20 },
  avatar:     { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(79,172,254,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(79,172,254,0.35)' },
  infoCard:   { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 20 },
  infoRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  divider:    { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 },
  infoIcon:   { fontSize: 20 },
  infoLabel:  { color: '#8892b0', fontSize: 11, fontWeight: '600', marginBottom: 3 },
  infoValue:  { color: '#fff', fontSize: 15, fontWeight: '700' },
  closeBtn:   { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText: { color: '#ccd6f6', fontSize: 15, fontWeight: '700' },
});

// ─── Contract Modal Styles ────────────────────────────────
const ct = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#16213e', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, maxHeight: '90%' },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 16 },
  title:      { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  docCard:    { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  docHeader:  { color: '#8892b0', fontSize: 11, textAlign: 'center', lineHeight: 18, marginBottom: 12 },
  docTitle:   { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  docSub:     { color: '#8892b0', fontSize: 12, textAlign: 'center', marginBottom: 18 },
  sectionRow: { backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 8, padding: 8, marginBottom: 10, marginTop: 4, borderLeftWidth: 3, borderLeftColor: '#4facfe' },
  sectionHead:{ color: '#4facfe', fontSize: 12, fontWeight: '800' },
  fieldRow:   { flexDirection: 'row', marginBottom: 8, gap: 8 },
  fieldLabel: { color: '#8892b0', fontSize: 13, width: 100 },
  fieldValue: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },
  signRow:    { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  signBox:    { alignItems: 'center', gap: 6 },
  signLabel:  { color: '#8892b0', fontSize: 12 },
  signName:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  closeBtn:   { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText: { color: '#ccd6f6', fontSize: 15, fontWeight: '700' },
});
