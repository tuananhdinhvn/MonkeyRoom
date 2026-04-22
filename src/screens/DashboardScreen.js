import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const stats = [
  { label: 'Tổng phòng', value: '128', icon: '🏠', color: ['#667eea', '#764ba2'] },
  { label: 'Đang thuê', value: '104', icon: '✅', color: ['#f093fb', '#f5576c'] },
  { label: 'Còn trống', value: '18', icon: '🔓', color: ['#4facfe', '#00f2fe'] },
  { label: 'Bảo trì', value: '6', icon: '🔧', color: ['#fa709a', '#fee140'] },
];

const recentActivities = [
  { name: 'Nguyễn Văn An', action: 'Nhận phòng 201', time: '10 phút trước', avatar: '👨' },
  { name: 'Trần Thị Bích', action: 'Gia hạn hợp đồng P105', time: '1 giờ trước', avatar: '👩' },
  { name: 'Lê Minh Tuấn', action: 'Thanh toán tháng 4', time: '2 giờ trước', avatar: '🧑' },
  { name: 'Phạm Thu Hà', action: 'Trả phòng 308', time: '5 giờ trước', avatar: '👩' },
];

const alerts = [
  { text: '3 phòng sắp hết hợp đồng trong 7 ngày', type: 'warning', icon: '⚠️' },
  { text: '5 khách chưa thanh toán tháng này', type: 'danger', icon: '💸' },
  { text: 'Phòng 205 cần bảo trì điện', type: 'info', icon: 'ℹ️' },
];

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Xin chào 👋</Text>
              <Text style={styles.ownerName}>Nguyễn Chủ Nhà</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>5</Text></View>
            </TouchableOpacity>
          </View>
          <Text style={styles.dateText}>Thứ Ba, 22 tháng 4 năm 2026</Text>
        </LinearGradient>

        {/* Revenue Card */}
        <View style={styles.section}>
          <LinearGradient colors={['#e94560', '#c62a47']} style={styles.revenueCard}>
            <Text style={styles.revenueLabel}>Doanh thu tháng này</Text>
            <Text style={styles.revenueValue}>124,500,000 ₫</Text>
            <View style={styles.revenueRow}>
              <Text style={styles.revenueChange}>↑ 12% so với tháng trước</Text>
              <Text style={styles.revenueIcon}>💰</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng quan phòng</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, i) => (
              <LinearGradient key={i} colors={stat.color} style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cảnh báo</Text>
          {alerts.map((a, i) => (
            <View key={i} style={[styles.alertCard, a.type === 'danger' && styles.alertDanger, a.type === 'warning' && styles.alertWarning]}>
              <Text style={styles.alertIcon}>{a.icon}</Text>
              <Text style={styles.alertText}>{a.text}</Text>
            </View>
          ))}
        </View>

        {/* Recent Activities */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          {recentActivities.map((act, i) => (
            <View key={i} style={styles.activityCard}>
              <View style={styles.activityAvatar}>
                <Text style={styles.activityAvatarText}>{act.avatar}</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{act.name}</Text>
                <Text style={styles.activityAction}>{act.action}</Text>
              </View>
              <Text style={styles.activityTime}>{act.time}</Text>
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
  header: { padding: 20, paddingTop: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting: { color: '#8892b0', fontSize: 14 },
  ownerName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  notifBtn: { position: 'relative', padding: 8 },
  notifIcon: { fontSize: 24 },
  notifBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: '#e94560', borderRadius: 10, width: 18, height: 18,
    justifyContent: 'center', alignItems: 'center'
  },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  dateText: { color: '#8892b0', fontSize: 12 },
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  revenueCard: { borderRadius: 20, padding: 24 },
  revenueLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  revenueValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginVertical: 8 },
  revenueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  revenueChange: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  revenueIcon: { fontSize: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%', borderRadius: 16, padding: 18, alignItems: 'center'
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { color: '#fff', fontSize: 26, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderLeftWidth: 4, borderLeftColor: '#4facfe'
  },
  alertDanger: { borderLeftColor: '#e94560' },
  alertWarning: { borderLeftColor: '#fee140' },
  alertIcon: { fontSize: 18, marginRight: 12 },
  alertText: { color: '#ccd6f6', fontSize: 13, flex: 1 },
  activityCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, padding: 14, marginBottom: 10
  },
  activityAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(233,69,96,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 14
  },
  activityAvatarText: { fontSize: 22 },
  activityInfo: { flex: 1 },
  activityName: { color: '#fff', fontWeight: '600', fontSize: 14 },
  activityAction: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  activityTime: { color: '#8892b0', fontSize: 11 },
});
