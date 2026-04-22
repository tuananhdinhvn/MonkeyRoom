import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const rooms = [
  { id: '101', floor: 1, type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied', tenant: 'Nguyễn Văn An' },
  { id: '102', floor: 1, type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'empty', tenant: null },
  { id: '103', floor: 1, type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied', tenant: 'Trần Thị Bích' },
  { id: '201', floor: 2, type: 'Studio', area: '35m²', price: '6,000,000', status: 'occupied', tenant: 'Lê Minh Tuấn' },
  { id: '202', floor: 2, type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'maintenance', tenant: null },
  { id: '203', floor: 2, type: 'Studio', area: '35m²', price: '6,000,000', status: 'empty', tenant: null },
  { id: '301', floor: 3, type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied', tenant: 'Phạm Thu Hà' },
  { id: '302', floor: 3, type: 'Phòng VIP', area: '45m²', price: '8,500,000', status: 'occupied', tenant: 'Hoàng Đức Minh' },
];

const statusConfig = {
  occupied: { label: 'Đang thuê', color: '#4facfe', bg: 'rgba(79,172,254,0.15)', icon: '✅' },
  empty: { label: 'Trống', color: '#43e97b', bg: 'rgba(67,233,123,0.15)', icon: '🔓' },
  maintenance: { label: 'Bảo trì', color: '#fee140', bg: 'rgba(254,225,64,0.15)', icon: '🔧' },
};

const filters = ['Tất cả', 'Đang thuê', 'Trống', 'Bảo trì'];

export default function RoomsScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  const filtered = rooms.filter(r => {
    const matchSearch = r.id.includes(search) || (r.tenant && r.tenant.toLowerCase().includes(search.toLowerCase()));
    const matchFilter =
      activeFilter === 'Tất cả' ||
      (activeFilter === 'Đang thuê' && r.status === 'occupied') ||
      (activeFilter === 'Trống' && r.status === 'empty') ||
      (activeFilter === 'Bảo trì' && r.status === 'maintenance');
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Header */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
          <Text style={styles.title}>Quản lý phòng</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Thêm phòng</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm phòng, tên khách..."
            placeholderTextColor="#8892b0"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Room List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const s = statusConfig[item.status];
            return (
              <TouchableOpacity style={styles.roomCard}>
                <View style={styles.roomHeader}>
                  <View style={styles.roomNumberBox}>
                    <Text style={styles.roomNumber}>P{item.id}</Text>
                    <Text style={styles.roomFloor}>Tầng {item.floor}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                    <Text style={styles.statusIcon}>{s.icon}</Text>
                    <Text style={[styles.statusText, { color: s.color }]}>{s.label}</Text>
                  </View>
                </View>

                <View style={styles.roomDetails}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Loại phòng</Text>
                    <Text style={styles.detailValue}>{item.type}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Diện tích</Text>
                    <Text style={styles.detailValue}>{item.area}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Giá thuê</Text>
                    <Text style={[styles.detailValue, styles.priceText]}>{item.price} ₫</Text>
                  </View>
                </View>

                {item.tenant && (
                  <View style={styles.tenantRow}>
                    <Text style={styles.tenantIcon}>👤</Text>
                    <Text style={styles.tenantName}>{item.tenant}</Text>
                  </View>
                )}

                <View style={styles.roomActions}>
                  <TouchableOpacity style={styles.actionBtn}>
                    <Text style={styles.actionText}>Chi tiết</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]}>
                    <Text style={[styles.actionText, styles.actionTextPrimary]}>Chỉnh sửa</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
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
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  addBtn: {
    backgroundColor: '#e94560', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    margin: 16, borderRadius: 12, paddingHorizontal: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12, fontSize: 14 },
  filterRow: { paddingHorizontal: 16, marginBottom: 12 },
  filterBtn: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  filterBtnActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  filterText: { color: '#8892b0', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16, paddingTop: 4 },
  roomCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  roomHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  roomNumberBox: {},
  roomNumber: { color: '#fff', fontSize: 20, fontWeight: '800' },
  roomFloor: { color: '#8892b0', fontSize: 12 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusIcon: { fontSize: 12, marginRight: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  roomDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailItem: {},
  detailLabel: { color: '#8892b0', fontSize: 11, marginBottom: 2 },
  detailValue: { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
  priceText: { color: '#4facfe' },
  tenantRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8,
    padding: 10, marginBottom: 12
  },
  tenantIcon: { fontSize: 14, marginRight: 8 },
  tenantName: { color: '#ccd6f6', fontSize: 13 },
  roomActions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1, borderRadius: 8, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center'
  },
  actionBtnPrimary: { backgroundColor: '#e94560', borderColor: '#e94560' },
  actionText: { color: '#8892b0', fontSize: 13, fontWeight: '600' },
  actionTextPrimary: { color: '#fff' },
});
