import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Modal, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const MONTHS_VI  = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                    'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const DAYS_VI    = ['CN','T2','T3','T4','T5','T6','T7'];
const MINUTE_OPTS = ['00','15','30','45'];

// ─── History data ──────────────────────────────────────────
const HISTORY = [
  {
    id: 'h1', month: 'Tháng 3/2026', status: 'paid', date: '02/03/2026',
    method: 'Chuyển khoản', collector: null,
    details: {
      room:        { amount: 3500000 },
      electricity: { from: 1152, to: 1234, usage: 82,  rate: 3000,  amount: 246000 },
      water:       { from: 36,   to: 40,   usage: 4,   rate: 15000, amount: 60000  },
      internet:    { amount: 100000 },
      service:     { amount: 120000 },
    },
  },
  {
    id: 'h2', month: 'Tháng 2/2026', status: 'paid', date: '01/02/2026',
    method: 'Tiền mặt', collector: 'Trần Thị Thu',
    details: {
      room:        { amount: 3500000 },
      electricity: { from: 1077, to: 1152, usage: 75,  rate: 3000,  amount: 225000 },
      water:       { from: 33,   to: 36,   usage: 3,   rate: 15000, amount: 45000  },
      internet:    { amount: 100000 },
      service:     { amount: 120000 },
    },
  },
  {
    id: 'h3', month: 'Tháng 1/2026', status: 'paid', date: '03/01/2026',
    method: 'Chuyển khoản', collector: null,
    details: {
      room:        { amount: 3500000 },
      electricity: { from: 987,  to: 1077, usage: 90,  rate: 3000,  amount: 270000 },
      water:       { from: 28,   to: 33,   usage: 5,   rate: 15000, amount: 75000  },
      internet:    { amount: 100000 },
      service:     { amount: 120000 },
    },
  },
  {
    id: 'h4', month: 'Tháng 12/2025', status: 'paid', date: '02/12/2025',
    method: 'Tiền mặt', collector: 'Trần Thị Thu',
    details: {
      room:        { amount: 3500000 },
      electricity: { from: 919,  to: 987,  usage: 68,  rate: 3000,  amount: 204000 },
      water:       { from: 24,   to: 28,   usage: 4,   rate: 15000, amount: 60000  },
      internet:    { amount: 100000 },
      service:     { amount: 120000 },
    },
  },
];

function billTotal(d) {
  return d.room.amount + d.electricity.amount + d.water.amount + d.internet.amount + d.service.amount;
}

function fmt(n) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

// ─── History Detail Modal ─────────────────────────────────
function HistoryDetailModal({ item, onClose }) {
  if (!item) return null;
  const d     = item.details;
  const total = billTotal(d);

  const rows = [
    { label: 'Tiền phòng', detail: null, amount: d.room.amount },
    {
      label: 'Tiền điện',
      detail: `Chỉ số ${d.electricity.from} → ${d.electricity.to}  (${d.electricity.usage} số × ${(d.electricity.rate).toLocaleString('vi-VN')} ₫)`,
      amount: d.electricity.amount,
    },
    {
      label: 'Tiền nước',
      detail: `Chỉ số ${d.water.from} → ${d.water.to}  (${d.water.usage} khối × ${(d.water.rate).toLocaleString('vi-VN')} ₫)`,
      amount: d.water.amount,
    },
    { label: 'Internet', detail: null, amount: d.internet.amount },
    { label: 'Dịch vụ',  detail: null, amount: d.service.amount  },
  ];

  return (
    <Modal visible={!!item} transparent animationType="slide" onRequestClose={onClose}>
      <View style={hd.overlay}>
        <View style={hd.sheet}>
          <View style={hd.handle} />
          <Text style={hd.title}>Chi tiết hóa đơn {item.month}</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Bill table */}
            <View style={hd.table}>
              {rows.map((r, i) => (
                <View key={i} style={[hd.tableRow, i < rows.length - 1 && hd.tableRowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={hd.rowLabel}>{r.label}</Text>
                    {r.detail && <Text style={hd.rowDetail}>{r.detail}</Text>}
                  </View>
                  <Text style={hd.rowAmount}>{fmt(r.amount)}</Text>
                </View>
              ))}
            </View>

            {/* Total */}
            <View style={hd.totalRow}>
              <Text style={hd.totalLabel}>Tổng cộng</Text>
              <Text style={hd.totalAmount}>{fmt(total)}</Text>
            </View>

            {/* Payment info */}
            <View style={hd.infoCard}>
              <View style={hd.infoRow}>
                <Text style={hd.infoIcon}>📅</Text>
                <View>
                  <Text style={hd.infoLabel}>Ngày thanh toán</Text>
                  <Text style={hd.infoValue}>{item.date}</Text>
                </View>
              </View>
              <View style={hd.infoDivider} />
              <View style={hd.infoRow}>
                <Text style={hd.infoIcon}>
                  {item.method === 'Tiền mặt' ? '💵' : '🏦'}
                </Text>
                <View>
                  <Text style={hd.infoLabel}>Phương thức</Text>
                  <Text style={hd.infoValue}>{item.method}</Text>
                  {item.method === 'Tiền mặt' && item.collector && (
                    <Text style={hd.infoSub}>👤 Người thu: {item.collector}</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={{ height: 8 }} />
          </ScrollView>

          <TouchableOpacity style={hd.closeBtn} onPress={onClose}>
            <Text style={hd.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Cash Appointment Modal ───────────────────────────────
function CashModal({ visible, onConfirm, onClose }) {
  const today   = new Date();
  const [navM,   setNavM]   = useState(today.getMonth());
  const [navY,   setNavY]   = useState(today.getFullYear());
  const [selD,   setSelD]   = useState(null);
  const [selM,   setSelM]   = useState(null);
  const [selY,   setSelY]   = useState(null);
  const [hour,   setHour]   = useState(9);
  const [minute, setMinute] = useState('00');

  useEffect(() => {
    if (visible) {
      const t = new Date();
      setNavM(t.getMonth()); setNavY(t.getFullYear());
      setSelD(null); setSelM(null); setSelY(null);
      setHour(9); setMinute('00');
    }
  }, [visible]);

  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const firstDOW    = (m, y) => new Date(y, m, 1).getDay();
  const prevMonth   = () => { if (navM === 0) { setNavM(11); setNavY(y => y - 1); } else setNavM(m => m - 1); };
  const nextMonth   = () => { if (navM === 11) { setNavM(0);  setNavY(y => y + 1); } else setNavM(m => m + 1); };

  const cells = () => {
    const blanks = Array(firstDOW(navM, navY)).fill(null);
    const days   = Array.from({ length: daysInMonth(navM, navY) }, (_, i) => i + 1);
    return [...blanks, ...days];
  };

  const isPast = (day) => {
    if (!day) return false;
    const d = new Date(navY, navM, day); d.setHours(0, 0, 0, 0);
    const t = new Date(); t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const handleConfirm = () => {
    const dd   = String(selD).padStart(2, '0');
    const mm   = String(selM + 1).padStart(2, '0');
    const hh   = String(hour).padStart(2, '0');
    const date = `${dd}/${mm}/${selY}`;
    const time = `${hh}:${minute}`;
    onConfirm(date, time);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={cm.overlay}>
        <View style={cm.sheet}>
          <View style={cm.handle} />
          <Text style={cm.title}>💵 Đặt lịch thu tiền mặt</Text>

          <Text style={cm.label}>Chọn ngày</Text>
          <View style={cm.calCard}>
            <View style={cm.navRow}>
              <TouchableOpacity style={cm.navBtn} onPress={prevMonth}>
                <Text style={cm.navArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={cm.navLabel}>{MONTHS_VI[navM]} {navY}</Text>
              <TouchableOpacity style={cm.navBtn} onPress={nextMonth}>
                <Text style={cm.navArrow}>›</Text>
              </TouchableOpacity>
            </View>
            <View style={cm.dowRow}>
              {DAYS_VI.map(d => (
                <View key={d} style={cm.dowCell}>
                  <Text style={[cm.dowText, d === 'CN' && { color: '#e94560' }]}>{d}</Text>
                </View>
              ))}
            </View>
            <View style={cm.grid}>
              {cells().map((day, i) => {
                const past       = isPast(day);
                const isSelected = day && day === selD && navM === selM && navY === selY;
                const isSunday   = i % 7 === 0;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[cm.cell, isSelected && cm.cellSelected]}
                    onPress={() => { if (day && !past) { setSelD(day); setSelM(navM); setSelY(navY); } }}
                    activeOpacity={day && !past ? 0.7 : 1}
                  >
                    <Text style={[
                      cm.cellText,
                      !day     && { color: 'transparent' },
                      isSunday && day && !past && { color: '#e94560' },
                      past     && { color: 'rgba(255,255,255,0.18)' },
                      isSelected && cm.cellTextSelected,
                    ]}>
                      {day ?? ' '}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <Text style={cm.label}>Chọn giờ</Text>
          <View style={cm.timeCard}>
            <View style={cm.timePart}>
              <TouchableOpacity style={cm.timeBtn} onPress={() => setHour(h => h < 20 ? h + 1 : h)}>
                <Text style={cm.timeBtnText}>▲</Text>
              </TouchableOpacity>
              <View style={cm.timeDisplay}>
                <Text style={cm.timeValue}>{String(hour).padStart(2, '0')}</Text>
                <Text style={cm.timeUnit}>Giờ</Text>
              </View>
              <TouchableOpacity style={cm.timeBtn} onPress={() => setHour(h => h > 7 ? h - 1 : h)}>
                <Text style={cm.timeBtnText}>▼</Text>
              </TouchableOpacity>
            </View>
            <Text style={cm.timeSep}>:</Text>
            <View style={cm.timePart}>
              <Text style={cm.timeUnit2}>Phút</Text>
              <View style={cm.minuteOpts}>
                {MINUTE_OPTS.map(m => (
                  <TouchableOpacity
                    key={m}
                    style={[cm.minuteBtn, minute === m && cm.minuteBtnActive]}
                    onPress={() => setMinute(m)}
                  >
                    <Text style={[cm.minuteBtnText, minute === m && cm.minuteBtnTextActive]}>{m}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {selD != null && (
            <View style={cm.summary}>
              <Text style={cm.summaryText}>
                📅 {String(selD).padStart(2,'0')}/{String(selM+1).padStart(2,'0')}/{selY}
                {'  '}🕐 {String(hour).padStart(2,'0')}:{minute}
              </Text>
            </View>
          )}

          <View style={cm.btnRow}>
            <TouchableOpacity style={cm.cancelBtn} onPress={onClose}>
              <Text style={cm.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[cm.confirmBtn, selD == null && { opacity: 0.4 }]}
              onPress={handleConfirm}
              disabled={selD == null}
            >
              <LinearGradient colors={['#2ecc71', '#27ae60']} style={cm.confirmGrad}>
                <Text style={cm.confirmText}>Xác nhận</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function TenantPaymentScreen() {
  const [cashVisible,    setCashVisible]    = useState(false);
  const [cashAppt,       setCashAppt]       = useState(null); // { date, time }
  const [selectedHistory, setSelectedHistory] = useState(null);

  const handleCashConfirm = (date, time) => {
    setCashAppt({ date, time });
    setCashVisible(false);
    Alert.alert(
      'Đã gửi yêu cầu',
      `Chủ nhà sẽ đến thu tiền vào lúc ${time} ngày ${date}.\nVui lòng chuẩn bị đúng giờ.`,
      [{ text: 'OK' }]
    );
  };

  const METHODS = [
    { icon: '🏦', label: 'Chuyển khoản ngân hàng', sub: 'VCB - 1234 5678 9012',   onPress: null,                       active: false },
    { icon: '📱', label: 'Ví MoMo',                 sub: '0912 345 678',            onPress: null,                       active: false },
    {
      icon: '💵', label: 'Tiền mặt',
      sub: cashAppt
        ? `Đã đặt lịch thu tiền lúc ${cashAppt.time} ngày ${cashAppt.date}`
        : 'Gặp trực tiếp chủ nhà',
      onPress: () => setCashVisible(true),
      active: !!cashAppt,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <CashModal
        visible={cashVisible}
        onConfirm={handleCashConfirm}
        onClose={() => setCashVisible(false)}
      />
      <HistoryDetailModal
        item={selectedHistory}
        onClose={() => setSelectedHistory(null)}
      />

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
            <View>
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

        {/* Current Bill */}
        <View style={styles.section}>
          <View style={styles.currentBill}>
            <Text style={styles.currentBillLabel}>Cần thanh toán tháng 4/2026</Text>
            <Text style={styles.currentBillAmount}>4,155,000 ₫</Text>
            <Text style={styles.currentBillDue}>⏳ Hạn: 05/05/2026</Text>
            <TouchableOpacity style={styles.payNowBtn}>
              <LinearGradient colors={['#e94560', '#c62a47']} style={styles.payNowGrad}>
                <Text style={styles.payNowText}>💳 Thanh toán ngay</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {METHODS.map((m, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.methodCard, m.active && styles.methodCardActive]}
              onPress={m.onPress}
              activeOpacity={m.onPress ? 0.75 : 1}
            >
              <Text style={styles.methodIcon}>{m.icon}</Text>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodLabel, m.active && styles.methodLabelActive]}>{m.label}</Text>
                <Text style={[styles.methodSub,   m.active && styles.methodSubActive]}>{m.sub}</Text>
              </View>
              <Text style={styles.methodArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Lịch sử thanh toán</Text>
          {HISTORY.map(h => {
            const total = billTotal(h.details);
            return (
              <TouchableOpacity
                key={h.id}
                style={styles.historyCard}
                onPress={() => setSelectedHistory(h)}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyMonth}>{h.month}</Text>
                  <Text style={styles.historyDate}>Ngày TT: {h.date} · {h.method}</Text>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyAmount}>{fmt(total)}</Text>
                  <View style={styles.paidBadge}>
                    <Text style={styles.paidText}>✅ Đã đóng</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#1a1a2e' },
  container:       { flex: 1, backgroundColor: '#0d0d1a' },
  header:          { padding: 20, paddingTop: 10, paddingBottom: 24 },
  headerTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting:        { color: '#8892b0', fontSize: 14 },
  tenantName:      { color: '#fff', fontSize: 22, fontWeight: '800' },
  notifBtn:        { position: 'relative', padding: 8 },
  notifIcon:       { fontSize: 24 },
  notifBadge:      { position: 'absolute', top: 4, right: 4, backgroundColor: '#e94560', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText:  { color: '#fff', fontSize: 10, fontWeight: '700' },
  roomInfoCard:    { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 18, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  roomLabel:       { color: '#8892b0', fontSize: 12, marginBottom: 4 },
  roomNumber:      { color: '#fff', fontSize: 26, fontWeight: '800' },
  roomAddress:     { color: '#8892b0', fontSize: 12, marginTop: 4 },
  roomInfoRight:   { alignItems: 'flex-end', justifyContent: 'space-between' },
  roomStatusBadge: { backgroundColor: 'rgba(67,233,123,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  roomStatusText:  { color: '#43e97b', fontSize: 12, fontWeight: '700' },
  roomArea:        { color: '#8892b0', fontSize: 13 },

  section:           { padding: 20, paddingBottom: 0 },
  sectionTitle:      { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 12 },

  currentBill:       { borderRadius: 20, padding: 24, alignItems: 'center', backgroundColor: 'rgba(52,152,219,0.5)', borderWidth: 1, borderColor: 'rgba(79,172,254,0.35)' },
  currentBillLabel:  { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 8 },
  currentBillAmount: { color: '#fff', fontSize: 34, fontWeight: '800', marginBottom: 8 },
  currentBillDue:    { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 20 },
  payNowBtn:         { borderRadius: 12, overflow: 'hidden', width: '100%' },
  payNowGrad:        { paddingVertical: 13, alignItems: 'center' },
  payNowText:        { color: '#fff', fontWeight: '800', fontSize: 15 },

  methodCard:        { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  methodCardActive:  { backgroundColor: 'rgba(46,204,113,0.1)', borderColor: 'rgba(46,204,113,0.45)' },
  methodIcon:        { fontSize: 26, marginRight: 14 },
  methodInfo:        { flex: 1 },
  methodLabel:       { color: '#fff', fontSize: 14, fontWeight: '600' },
  methodLabelActive: { color: '#2ecc71' },
  methodSub:         { color: '#8892b0', fontSize: 12, marginTop: 2 },
  methodSubActive:   { color: 'rgba(46,204,113,0.8)' },
  methodArrow:       { color: '#8892b0', fontSize: 22 },

  historyCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  historyMonth:  { color: '#fff', fontSize: 14, fontWeight: '600' },
  historyDate:   { color: '#8892b0', fontSize: 12, marginTop: 2 },
  historyRight:  { alignItems: 'flex-end' },
  historyAmount: { color: '#4facfe', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  paidBadge:     { backgroundColor: 'rgba(67,233,123,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  paidText:      { color: '#43e97b', fontSize: 11, fontWeight: '600' },
});

// ─── History Detail Modal Styles ──────────────────────────
const hd = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#16213e', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, maxHeight: '88%' },
  handle:       { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 18 },
  title:        { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 18 },

  table:        { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 12 },
  tableRow:     { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 8 },
  tableRowBorder:{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  rowLabel:     { color: '#ccd6f6', fontSize: 14, fontWeight: '600' },
  rowDetail:    { color: '#8892b0', fontSize: 11, marginTop: 3, lineHeight: 16 },
  rowAmount:    { color: '#fff', fontSize: 14, fontWeight: '700', minWidth: 110, textAlign: 'right' },

  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(79,172,254,0.12)', borderRadius: 14, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)' },
  totalLabel:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  totalAmount:  { color: '#4facfe', fontSize: 20, fontWeight: '800' },

  infoCard:     { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 6 },
  infoRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14 },
  infoDivider:  { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 14 },
  infoIcon:     { fontSize: 22, marginTop: 2 },
  infoLabel:    { color: '#8892b0', fontSize: 11, fontWeight: '600', marginBottom: 3 },
  infoValue:    { color: '#fff', fontSize: 14, fontWeight: '700' },
  infoSub:      { color: '#4facfe', fontSize: 12, marginTop: 4 },

  closeBtn:     { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText: { color: '#ccd6f6', fontSize: 15, fontWeight: '700' },
});

// ─── Cash Modal Styles ─────────────────────────────────────
const cm = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#16213e', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, maxHeight: '92%' },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 18 },
  title:      { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  label:      { color: '#8892b0', fontSize: 13, fontWeight: '700', marginBottom: 10 },

  calCard:    { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 20 },
  navRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  navBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  navArrow:   { color: '#fff', fontSize: 20, fontWeight: '700' },
  navLabel:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  dowRow:     { flexDirection: 'row', marginBottom: 6 },
  dowCell:    { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dowText:    { color: '#8892b0', fontSize: 11, fontWeight: '700' },
  grid:       { flexDirection: 'row', flexWrap: 'wrap' },
  cell:       { width: `${100/7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center' },
  cellSelected:     { backgroundColor: '#2ecc71', borderRadius: 999 },
  cellText:         { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
  cellTextSelected: { color: '#fff', fontWeight: '800' },

  timeCard:    { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 18 },
  timePart:    { alignItems: 'center', gap: 8 },
  timeBtn:     { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  timeBtnText: { color: '#4facfe', fontSize: 16, fontWeight: '800' },
  timeDisplay: { alignItems: 'center' },
  timeValue:   { color: '#fff', fontSize: 36, fontWeight: '800', lineHeight: 42 },
  timeUnit:    { color: '#8892b0', fontSize: 11, fontWeight: '600', marginTop: 2 },
  timeSep:     { color: '#fff', fontSize: 36, fontWeight: '800', marginBottom: 12 },
  timeUnit2:   { color: '#8892b0', fontSize: 11, fontWeight: '600', marginBottom: 8 },
  minuteOpts:  { flexDirection: 'row', gap: 8 },
  minuteBtn:         { width: 46, height: 46, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  minuteBtnActive:   { backgroundColor: 'rgba(46,204,113,0.2)', borderColor: '#2ecc71' },
  minuteBtnText:     { color: '#8892b0', fontSize: 15, fontWeight: '700' },
  minuteBtnTextActive:{ color: '#2ecc71' },

  summary:     { backgroundColor: 'rgba(46,204,113,0.12)', borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 18, borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)' },
  summaryText: { color: '#2ecc71', fontSize: 14, fontWeight: '700' },

  btnRow:      { flexDirection: 'row', gap: 12 },
  cancelBtn:   { flex: 1, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelText:  { color: '#ccd6f6', fontSize: 15, fontWeight: '700' },
  confirmBtn:  { flex: 2, borderRadius: 14, overflow: 'hidden' },
  confirmGrad: { paddingVertical: 14, alignItems: 'center' },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
