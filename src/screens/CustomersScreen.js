import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const customers = [
  { id: '1', name: 'Nguyễn Văn An', phone: '0912 345 678', room: 'P101', since: '01/2025', paid: true, avatar: '👨', amount: '3,500,000' },
  { id: '2', name: 'Trần Thị Bích', phone: '0987 654 321', room: 'P103', since: '03/2025', paid: true, avatar: '👩', amount: '3,500,000' },
  { id: '3', name: 'Lê Minh Tuấn', phone: '0909 111 222', room: 'P201', since: '06/2024', paid: false, avatar: '🧑', amount: '6,000,000' },
  { id: '4', name: 'Phạm Thu Hà', phone: '0978 888 999', room: 'P301', since: '09/2024', paid: true, avatar: '👩', amount: '3,500,000' },
  { id: '5', name: 'Hoàng Đức Minh', phone: '0933 222 111', room: 'P302', since: '11/2024', paid: false, avatar: '👨', amount: '8,500,000' },
  { id: '6', name: 'Vũ Thị Lan', phone: '0966 333 444', room: 'P104', since: '02/2026', paid: true, avatar: '👩', amount: '4,800,000' },
];

export default function CustomersScreen() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.room.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === 'Tất cả' || (activeFilter === 'Đã thanh toán' && c.paid) || (activeFilter === 'Chưa thanh toán' && !c.paid);
    return matchSearch && matchFilter;
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
          <Text style={styles.title}>Khách hàng</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Thêm mới</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{customers.length}</Text>
            <Text style={styles.summaryLabel}>Tổng khách</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: '#43e97b' }]}>
            <Text style={[styles.summaryValue, { color: '#43e97b' }]}>{customers.filter(c => c.paid).length}</Text>
            <Text style={styles.summaryLabel}>Đã thanh toán</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: '#e94560' }]}>
            <Text style={[styles.summaryValue, { color: '#e94560' }]}>{customers.filter(c => !c.paid).length}</Text>
            <Text style={styles.summaryLabel}>Chưa thanh toán</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên, SĐT, số phòng..."
            placeholderTextColor="#8892b0"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter */}
        <View style={styles.filterRow}>
          {['Tất cả', 'Đã thanh toán', 'Chưa thanh toán'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.avatar}</Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.phone}>{item.phone}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.roomBadge}>
                      <Text style={styles.roomBadgeText}>{item.room}</Text>
                    </View>
                    <Text style={styles.since}>Từ {item.since}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardRight}>
                <View style={[styles.paidBadge, !item.paid && styles.unpaidBadge]}>
                  <Text style={[styles.paidText, !item.paid && styles.unpaidText]}>
                    {item.paid ? '✅ Đã đóng' : '❌ Chưa đóng'}
                  </Text>
                </View>
                <Text style={styles.amount}>{item.amount} ₫</Text>
              </View>
            </TouchableOpacity>
          )}
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
  addBtn: { backgroundColor: '#e94560', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  summaryRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  summaryCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  summaryValue: { color: '#4facfe', fontSize: 22, fontWeight: '800' },
  summaryLabel: { color: '#8892b0', fontSize: 11, marginTop: 4, textAlign: 'center' },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    margin: 16, marginBottom: 12, borderRadius: 12,
    paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12, fontSize: 14 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  filterBtnActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  filterText: { color: '#8892b0', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  list: { padding: 16, paddingTop: 8 },
  card: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)'
  },
  cardLeft: { flexDirection: 'row', flex: 1 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(233,69,96,0.2)', justifyContent: 'center',
    alignItems: 'center', marginRight: 12
  },
  avatarText: { fontSize: 24 },
  info: { flex: 1 },
  name: { color: '#fff', fontSize: 15, fontWeight: '700' },
  phone: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  roomBadge: { backgroundColor: 'rgba(79,172,254,0.2)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  roomBadgeText: { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  since: { color: '#8892b0', fontSize: 11 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center' },
  paidBadge: {
    backgroundColor: 'rgba(67,233,123,0.15)', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6
  },
  unpaidBadge: { backgroundColor: 'rgba(233,69,96,0.15)' },
  paidText: { color: '#43e97b', fontSize: 11, fontWeight: '600' },
  unpaidText: { color: '#e94560' },
  amount: { color: '#4facfe', fontSize: 12, fontWeight: '700' },
});
