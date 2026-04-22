import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const staffList = [
  {
    id: '1', name: 'Nguyễn Quản Lý', role: 'admin', phone: '0901 111 222',
    avatar: '👨‍💼', active: true, permissions: ['Xem tất cả', 'Quản lý phòng', 'Quản lý khách', 'Thu tiền', 'Báo cáo']
  },
  {
    id: '2', name: 'Trần Thị Thu', role: 'staff', phone: '0912 333 444',
    avatar: '👩‍💼', active: true, permissions: ['Xem phòng', 'Quản lý khách', 'Thu tiền']
  },
  {
    id: '3', name: 'Lê Văn Bảo', role: 'staff', phone: '0923 555 666',
    avatar: '👨‍🔧', active: false, permissions: ['Xem phòng', 'Bảo trì']
  },
];

const roleConfig = {
  admin: { label: 'Quản lý', color: '#e94560', bg: 'rgba(233,69,96,0.15)', icon: '👑' },
  staff: { label: 'Nhân viên', color: '#4facfe', bg: 'rgba(79,172,254,0.15)', icon: '💼' },
};

export default function StaffScreen() {
  const [staff, setStaff] = useState(staffList);

  const toggleActive = (id) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
          <Text style={styles.title}>Phân quyền nhân viên</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Thêm</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Role Legend */}
        <View style={styles.legendRow}>
          {Object.entries(roleConfig).map(([key, val]) => (
            <View key={key} style={[styles.legendItem, { backgroundColor: val.bg }]}>
              <Text style={styles.legendIcon}>{val.icon}</Text>
              <Text style={[styles.legendText, { color: val.color }]}>{val.label}</Text>
            </View>
          ))}
        </View>

        <FlatList
          data={staff}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const role = roleConfig[item.role];
            return (
              <View style={[styles.card, !item.active && styles.cardInactive]}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>{item.avatar}</Text>
                    <View style={[styles.activeIndicator, item.active && styles.activeGreen]} />
                  </View>
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.phone}>{item.phone}</Text>
                    <View style={[styles.roleBadge, { backgroundColor: role.bg }]}>
                      <Text style={styles.roleIcon}>{role.icon}</Text>
                      <Text style={[styles.roleText, { color: role.color }]}>{role.label}</Text>
                    </View>
                  </View>
                  <View style={styles.activeToggle}>
                    <Text style={styles.activeLabel}>{item.active ? 'Hoạt động' : 'Tắt'}</Text>
                    <Switch
                      value={item.active}
                      onValueChange={() => toggleActive(item.id)}
                      trackColor={{ false: '#333', true: '#e94560' }}
                      thumbColor={item.active ? '#fff' : '#666'}
                    />
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.permTitle}>Quyền truy cập:</Text>
                <View style={styles.permGrid}>
                  {item.permissions.map((perm, i) => (
                    <View key={i} style={styles.permBadge}>
                      <Text style={styles.permCheck}>✓</Text>
                      <Text style={styles.permText}>{perm}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>Chỉnh sửa quyền</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]}>
                    <Text style={styles.actionTextDanger}>Xóa tài khoản</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, paddingTop: 10
  },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  addBtn: { backgroundColor: '#e94560', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  legendRow: { flexDirection: 'row', padding: 16, paddingBottom: 8, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  legendIcon: { fontSize: 14 },
  legendText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 16, paddingTop: 8 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18,
    padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  cardInactive: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  avatarWrap: { position: 'relative', marginRight: 14 },
  avatarText: { fontSize: 36 },
  activeIndicator: {
    position: 'absolute', bottom: 0, right: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#666', borderWidth: 2, borderColor: '#0d0d1a'
  },
  activeGreen: { backgroundColor: '#43e97b' },
  info: { flex: 1 },
  name: { color: '#fff', fontSize: 16, fontWeight: '700' },
  phone: { color: '#8892b0', fontSize: 12, marginTop: 2, marginBottom: 6 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  roleIcon: { fontSize: 12 },
  roleText: { fontSize: 12, fontWeight: '700' },
  activeToggle: { alignItems: 'center' },
  activeLabel: { color: '#8892b0', fontSize: 10, marginBottom: 4 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 14 },
  permTitle: { color: '#8892b0', fontSize: 12, marginBottom: 10 },
  permGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  permBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, gap: 4
  },
  permCheck: { color: '#43e97b', fontSize: 12 },
  permText: { color: '#ccd6f6', fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, borderRadius: 8, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center'
  },
  actionBtnDanger: { borderColor: 'rgba(233,69,96,0.4)' },
  actionText: { color: '#ccd6f6', fontSize: 12, fontWeight: '600' },
  actionTextDanger: { color: '#e94560', fontSize: 12, fontWeight: '600' },
});
