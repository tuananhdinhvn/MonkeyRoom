import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const history = [
  { month: 'Tháng 3/2026', amount: '4,010,000', status: 'paid', date: '02/03/2026' },
  { month: 'Tháng 2/2026', amount: '3,980,000', status: 'paid', date: '01/02/2026' },
  { month: 'Tháng 1/2026', amount: '4,050,000', status: 'paid', date: '03/01/2026' },
  { month: 'Tháng 12/2025', amount: '3,900,000', status: 'paid', date: '02/12/2025' },
];

export default function TenantPaymentScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
          <Text style={styles.title}>Thanh toán</Text>
        </LinearGradient>

        {/* Current Bill */}
        <View style={styles.section}>
          <LinearGradient colors={['#e94560', '#c62a47']} style={styles.currentBill}>
            <Text style={styles.currentBillLabel}>Cần thanh toán tháng 4/2026</Text>
            <Text style={styles.currentBillAmount}>4,035,000 ₫</Text>
            <Text style={styles.currentBillDue}>⏳ Hạn: 05/05/2026</Text>
            <TouchableOpacity style={styles.payNowBtn}>
              <Text style={styles.payNowText}>💳 Thanh toán ngay</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          {[
            { icon: '🏦', label: 'Chuyển khoản ngân hàng', sub: 'VCB - 1234 5678 9012' },
            { icon: '📱', label: 'Ví MoMo', sub: '0912 345 678' },
            { icon: '💵', label: 'Tiền mặt', sub: 'Gặp trực tiếp chủ nhà' },
          ].map((m, i) => (
            <TouchableOpacity key={i} style={styles.methodCard}>
              <Text style={styles.methodIcon}>{m.icon}</Text>
              <View style={styles.methodInfo}>
                <Text style={styles.methodLabel}>{m.label}</Text>
                <Text style={styles.methodSub}>{m.sub}</Text>
              </View>
              <Text style={styles.methodArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* History */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Lịch sử thanh toán</Text>
          {history.map((h, i) => (
            <View key={i} style={styles.historyCard}>
              <View>
                <Text style={styles.historyMonth}>{h.month}</Text>
                <Text style={styles.historyDate}>Ngày thanh toán: {h.date}</Text>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyAmount}>{h.amount} ₫</Text>
                <View style={styles.paidBadge}>
                  <Text style={styles.paidText}>✅ Đã đóng</Text>
                </View>
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
  header: { padding: 20, paddingTop: 10 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  currentBill: { borderRadius: 20, padding: 24, alignItems: 'center' },
  currentBillLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 8 },
  currentBillAmount: { color: '#fff', fontSize: 34, fontWeight: '800', marginBottom: 8 },
  currentBillDue: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 20 },
  payNowBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  payNowText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  methodCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  methodIcon: { fontSize: 26, marginRight: 14 },
  methodInfo: { flex: 1 },
  methodLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  methodSub: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  methodArrow: { color: '#8892b0', fontSize: 22 },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  historyMonth: { color: '#fff', fontSize: 14, fontWeight: '600' },
  historyDate: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  historyRight: { alignItems: 'flex-end' },
  historyAmount: { color: '#4facfe', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  paidBadge: { backgroundColor: 'rgba(67,233,123,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  paidText: { color: '#43e97b', fontSize: 11, fontWeight: '600' },
});
