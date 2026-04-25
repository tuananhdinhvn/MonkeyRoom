import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, StatusBar, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const STATUS_CFG = {
  processing: { label: 'Đang xử lý', color: '#fee140', bg: 'rgba(254,225,64,0.15)', border: 'rgba(254,225,64,0.3)' },
  done:       { label: 'Đã xong',    color: '#43e97b', bg: 'rgba(67,233,123,0.15)',  border: 'rgba(67,233,123,0.3)' },
};

const REPORTS = [
  {
    id: '1', icon: '❄️', status: 'processing',
    title: 'Điều hòa phòng bị hỏng',
    desc:  'Điều hòa không hoạt động, phòng rất nóng. Đã thử tắt bật nhiều lần nhưng không lên.',
    date:  '18/04/2026',
    resolver: null,
  },
  {
    id: '2', icon: '🚿', status: 'done',
    title: 'Vòi nước bị rỉ',
    desc:  'Vòi nước phòng bếp bị rỉ nước liên tục, gây hao nước và ẩm nền.',
    date:  '10/04/2026',
    resolvedDate: '12/04/2026',
    resolver: { name: 'Nguyễn Văn Bình', role: 'Thợ sửa chữa', note: 'Đã thay ron và siết lại khớp nối vòi nước.' },
  },
  {
    id: '3', icon: '💡', status: 'done',
    title: 'Bóng đèn phòng tắm cháy',
    desc:  'Bóng đèn phòng tắm bị cháy, không có ánh sáng.',
    date:  '01/04/2026',
    resolvedDate: '02/04/2026',
    resolver: { name: 'Trần Thị Thu', role: 'Nhân viên quản lý', note: 'Đã thay bóng đèn LED 12W mới.' },
  },
];

// ─── Report Detail Modal ──────────────────────────────────
function ReportDetailModal({ report, onClose }) {
  if (!report) return null;
  const s = STATUS_CFG[report.status];
  return (
    <Modal visible={!!report} transparent animationType="slide" onRequestClose={onClose}>
      <View style={rd.overlay}>
        <View style={rd.sheet}>
          <View style={rd.handle} />
          <Text style={rd.title}>Chi tiết sự cố</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Status badge */}
            <View style={[rd.statusBadge, { backgroundColor: s.bg, borderColor: s.border }]}>
              <Text style={[rd.statusText, { color: s.color }]}>{s.label}</Text>
            </View>

            {/* Main info */}
            <View style={rd.infoCard}>
              <View style={rd.infoRow}>
                <Text style={rd.infoIcon}>{report.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={rd.infoLabel}>Tên sự cố</Text>
                  <Text style={rd.infoValue}>{report.title}</Text>
                </View>
              </View>
              <View style={rd.divider} />
              <View style={rd.infoRow}>
                <Text style={rd.infoIcon}>📅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={rd.infoLabel}>Ngày báo cáo</Text>
                  <Text style={rd.infoValue}>{report.date}</Text>
                </View>
              </View>
              <View style={rd.divider} />
              <View style={rd.infoRow}>
                <Text style={rd.infoIcon}>📝</Text>
                <View style={{ flex: 1 }}>
                  <Text style={rd.infoLabel}>Mô tả</Text>
                  <Text style={rd.infoValue}>{report.desc}</Text>
                </View>
              </View>
            </View>

            {/* Resolver info (if done) */}
            {report.status === 'done' && report.resolver && (
              <>
                <Text style={rd.sectionLabel}>👷 Thông tin người giải quyết</Text>
                <View style={rd.resolverCard}>
                  <View style={rd.resolverAvatarRow}>
                    <View style={rd.resolverAvatar}>
                      <Text style={{ fontSize: 26 }}>👷</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={rd.resolverName}>{report.resolver.name}</Text>
                      <Text style={rd.resolverRole}>{report.resolver.role}</Text>
                    </View>
                    <View style={rd.doneBadge}>
                      <Text style={rd.doneBadgeText}>✅ Hoàn thành</Text>
                    </View>
                  </View>
                  <View style={rd.divider} />
                  <View style={rd.infoRow}>
                    <Text style={rd.infoIcon}>📅</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={rd.infoLabel}>Ngày hoàn thành</Text>
                      <Text style={rd.infoValue}>{report.resolvedDate}</Text>
                    </View>
                  </View>
                  <View style={rd.divider} />
                  <View style={rd.infoRow}>
                    <Text style={rd.infoIcon}>🔧</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={rd.infoLabel}>Ghi chú xử lý</Text>
                      <Text style={rd.infoValue}>{report.resolver.note}</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            <View style={{ height: 8 }} />
          </ScrollView>

          <TouchableOpacity style={rd.closeBtn} onPress={onClose}>
            <Text style={rd.closeBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function TenantReportScreen() {
  const [title,          setTitle]          = useState('');
  const [desc,           setDesc]           = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />

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

        {/* Send message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gửi tin nhắn cho quản lý toà nhà</Text>
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
                <Text style={styles.submitText}>📤 Gửi tin</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* History */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Lịch sử giải quyết sự cố</Text>
          {REPORTS.map(r => {
            const s = STATUS_CFG[r.status];
            return (
              <TouchableOpacity
                key={r.id}
                style={styles.reportCard}
                onPress={() => setSelectedReport(r)}
                activeOpacity={0.75}
              >
                <Text style={styles.reportIcon}>{r.icon}</Text>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{r.title}</Text>
                  <Text style={styles.reportDate}>📅 {r.date}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
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

  section:        { padding: 20, paddingBottom: 0 },
  sectionTitle:   { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  formCard:       { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  formLabel:      { color: '#8892b0', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input:          { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  inputMulti:     { height: 100, textAlignVertical: 'top' },
  submitBtn:      { borderRadius: 12, overflow: 'hidden' },
  submitGradient: { paddingVertical: 14, alignItems: 'center' },
  submitText:     { color: '#fff', fontWeight: '800', fontSize: 15 },

  reportCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 12 },
  reportIcon:   { fontSize: 26 },
  reportInfo:   { flex: 1 },
  reportTitle:  { color: '#fff', fontSize: 14, fontWeight: '600' },
  reportDate:   { color: '#8892b0', fontSize: 12, marginTop: 3 },
  statusBadge:  { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  statusText:   { fontSize: 11, fontWeight: '700' },
});

// ─── Report Detail Modal Styles ───────────────────────────
const rd = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#16213e', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, maxHeight: '88%' },
  handle:      { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 18 },
  title:       { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 16 },

  statusBadge: { borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'center', marginBottom: 16, borderWidth: 1 },
  statusText:  { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  infoCard:    { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 16 },
  infoRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14 },
  divider:     { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 14 },
  infoIcon:    { fontSize: 20, marginTop: 2 },
  infoLabel:   { color: '#8892b0', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  infoValue:   { color: '#fff', fontSize: 14, fontWeight: '600', lineHeight: 20 },

  sectionLabel:       { color: '#8892b0', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  resolverCard:       { backgroundColor: 'rgba(67,233,123,0.06)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(67,233,123,0.2)', overflow: 'hidden', marginBottom: 16 },
  resolverAvatarRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  resolverAvatar:     { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(67,233,123,0.15)', justifyContent: 'center', alignItems: 'center' },
  resolverName:       { color: '#fff', fontSize: 15, fontWeight: '700' },
  resolverRole:       { color: '#8892b0', fontSize: 12, marginTop: 2 },
  doneBadge:          { backgroundColor: 'rgba(67,233,123,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  doneBadgeText:      { color: '#43e97b', fontSize: 11, fontWeight: '700' },

  closeBtn:     { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText: { color: '#ccd6f6', fontSize: 15, fontWeight: '700' },
});
