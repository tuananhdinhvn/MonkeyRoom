import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const reports = [
  { id: '1', title: 'Điều hòa phòng bị hỏng', status: 'processing', date: '18/04/2026', icon: '❄️' },
  { id: '2', title: 'Vòi nước bị rỉ', status: 'done', date: '10/04/2026', icon: '🚿' },
  { id: '3', title: 'Bóng đèn phòng tắm cháy', status: 'done', date: '01/04/2026', icon: '💡' },
];

const statusConfig = {
  processing: { label: 'Đang xử lý', color: '#fee140', bg: 'rgba(254,225,64,0.15)' },
  done: { label: 'Đã xong', color: '#43e97b', bg: 'rgba(67,233,123,0.15)' },
};

export default function TenantReportScreen() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
          <Text style={styles.title}>Báo sự cố</Text>
        </LinearGradient>

        {/* New Report */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gửi báo cáo mới</Text>
          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Tiêu đề sự cố</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Điều hòa bị hỏng..."
              placeholderTextColor="#8892b0"
              value={title}
              onChangeText={setTitle}
            />
            <Text style={styles.formLabel}>Mô tả chi tiết</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Mô tả vấn đề bạn gặp phải..."
              placeholderTextColor="#8892b0"
              value={desc}
              onChangeText={setDesc}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.submitBtn}>
              <LinearGradient colors={['#e94560', '#c62a47']} style={styles.submitGradient}>
                <Text style={styles.submitText}>📤 Gửi báo cáo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* History */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Lịch sử báo cáo</Text>
          {reports.map(r => {
            const s = statusConfig[r.status];
            return (
              <View key={r.id} style={styles.reportCard}>
                <Text style={styles.reportIcon}>{r.icon}</Text>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{r.title}</Text>
                  <Text style={styles.reportDate}>📅 {r.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                </View>
              </View>
            );
          })}
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
  formCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  formLabel: { color: '#8892b0', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputMulti: { height: 100, textAlignVertical: 'top' },
  submitBtn: { borderRadius: 12, overflow: 'hidden' },
  submitGradient: { paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 12 },
  reportIcon: { fontSize: 26 },
  reportInfo: { flex: 1 },
  reportTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  reportDate: { color: '#8892b0', fontSize: 12, marginTop: 3 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusText: { fontSize: 11, fontWeight: '700' },
});
