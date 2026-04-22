import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const announcements = [
  { id: '1', title: 'Cắt điện bảo trì tầng 2', time: 'Ngày mai 8:00 - 12:00', icon: '⚡', type: 'warning' },
  { id: '2', title: 'Vệ sinh khu vực chung', time: 'Thứ 7, 14/04/2026', icon: '🧹', type: 'info' },
];

export default function TenantHomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
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

          {/* Room Info Card */}
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
            {[
              { icon: '💳', label: 'Thanh toán', color: '#e94560' },
              { icon: '🔧', label: 'Báo sự cố', color: '#fee140' },
              { icon: '📄', label: 'Hợp đồng', color: '#4facfe' },
              { icon: '📞', label: 'Liên hệ', color: '#43e97b' },
            ].map((action, i) => (
              <TouchableOpacity key={i} style={styles.actionBtn}>
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
          <Text style={styles.sectionTitle}>Hóa đơn tháng này</Text>
          <View style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Tiền phòng</Text>
              <Text style={styles.billValue}>3,500,000 ₫</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Điện (120 số)</Text>
              <Text style={styles.billValue}>360,000 ₫</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Nước (5 khối)</Text>
              <Text style={styles.billValue}>75,000 ₫</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Internet</Text>
              <Text style={styles.billValue}>100,000 ₫</Text>
            </View>
            <View style={styles.billDivider} />
            <View style={styles.billRow}>
              <Text style={styles.billTotal}>Tổng cộng</Text>
              <Text style={styles.billTotalValue}>4,035,000 ₫</Text>
            </View>
            <View style={styles.unpaidBadge}>
              <Text style={styles.unpaidText}>⏳ Chưa thanh toán — Hạn: 05/05/2026</Text>
            </View>
            <TouchableOpacity style={styles.payBtn}>
              <LinearGradient colors={['#e94560', '#c62a47']} style={styles.payGradient}>
                <Text style={styles.payText}>💳 Thanh toán ngay</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { padding: 20, paddingTop: 10, paddingBottom: 24 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { color: '#8892b0', fontSize: 14 },
  tenantName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  notifBtn: { position: 'relative', padding: 8 },
  notifIcon: { fontSize: 24 },
  notifBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#e94560', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  roomInfoCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 18, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  roomInfoLeft: {},
  roomLabel: { color: '#8892b0', fontSize: 12, marginBottom: 4 },
  roomNumber: { color: '#fff', fontSize: 26, fontWeight: '800' },
  roomAddress: { color: '#8892b0', fontSize: 12, marginTop: 4 },
  roomInfoRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  roomStatusBadge: { backgroundColor: 'rgba(67,233,123,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  roomStatusText: { color: '#43e97b', fontSize: 12, fontWeight: '700' },
  roomArea: { color: '#8892b0', fontSize: 13 },
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 14 },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionIconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionIcon: { fontSize: 26 },
  actionLabel: { color: '#ccd6f6', fontSize: 12, fontWeight: '600' },
  billCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { color: '#8892b0', fontSize: 14 },
  billValue: { color: '#ccd6f6', fontSize: 14, fontWeight: '600' },
  billDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
  billTotal: { color: '#fff', fontSize: 15, fontWeight: '700' },
  billTotalValue: { color: '#4facfe', fontSize: 18, fontWeight: '800' },
  unpaidBadge: { backgroundColor: 'rgba(254,225,64,0.1)', borderRadius: 10, padding: 10, marginTop: 12, marginBottom: 14, alignItems: 'center' },
  unpaidText: { color: '#fee140', fontSize: 13 },
  payBtn: { borderRadius: 12, overflow: 'hidden' },
  payGradient: { paddingVertical: 14, alignItems: 'center' },
  payText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  announcementCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#4facfe', gap: 14 },
  announcementWarning: { borderLeftColor: '#fee140' },
  announcementIcon: { fontSize: 24 },
  announcementInfo: {},
  announcementTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  announcementTime: { color: '#8892b0', fontSize: 12, marginTop: 3 },
});
