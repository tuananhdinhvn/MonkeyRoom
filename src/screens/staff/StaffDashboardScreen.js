import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dữ liệu nhà + phòng được phân công cho nhân viên này
const assignedBuildings = [
  {
    id: 'b1',
    name: 'Nhà A - Green Home',
    address: '12 Nguyễn Trãi, Q.1',
    floors: [
      {
        floor: 1,
        rooms: [
          { id: '101', status: 'occupied', tenant: 'Nguyễn Văn An' },
          { id: '102', status: 'urgent',   tenant: null },
          { id: '103', status: 'occupied', tenant: 'Trần Thị Bích' },
          { id: '104', status: 'occupied', tenant: 'Vũ Thị Lan' },
        ],
      },
      {
        floor: 2,
        rooms: [
          { id: '201', status: 'occupied',     tenant: 'Lê Minh Tuấn' },
          { id: '202', status: 'maintenance',  tenant: null },
          { id: '203', status: 'empty',        tenant: null },
          { id: '204', status: 'occupied',     tenant: 'Đỗ Hữu Nghĩa' },
        ],
      },
      {
        floor: 3,
        rooms: [
          { id: '301', status: 'occupied', tenant: 'Phạm Thu Hà' },
          { id: '302', status: 'occupied', tenant: 'Hoàng Đức Minh' },
          { id: '303', status: 'empty',    tenant: null },
        ],
      },
    ],
  },
  {
    id: 'b2',
    name: 'Nhà B - Blue Sky',
    address: '45 Lê Lợi, Q.3',
    floors: [
      {
        floor: 1,
        rooms: [
          { id: 'B101', status: 'occupied',    tenant: 'Mai Thị Hoa' },
          { id: 'B102', status: 'occupied',    tenant: 'Bùi Văn Tài' },
          { id: 'B103', status: 'maintenance', tenant: null },
        ],
      },
      {
        floor: 2,
        rooms: [
          { id: 'B201', status: 'empty',    tenant: null },
          { id: 'B202', status: 'occupied', tenant: 'Ngô Thị Kim' },
          { id: 'B203', status: 'empty',    tenant: null },
        ],
      },
    ],
  },
];

const STATUS = {
  occupied:    { label: 'Đang thuê',   color: '#2ecc71', bg: '#2ecc7122', icon: '●' },
  empty:       { label: 'Trống',       color: '#8892b0', bg: '#8892b022', icon: '○' },
  maintenance: { label: 'Bảo trì',     color: '#f1c40f', bg: '#f1c40f22', icon: '▲' },
  urgent:      { label: 'Khẩn cấp',   color: '#e94560', bg: '#e9456022', icon: '✕' },
};

function countStatus(building) {
  let occupied = 0, empty = 0, maintenance = 0, urgent = 0;
  building.floors.forEach(f =>
    f.rooms.forEach(r => {
      if (r.status === 'occupied')         occupied++;
      else if (r.status === 'empty')       empty++;
      else if (r.status === 'maintenance') maintenance++;
      else if (r.status === 'urgent')      urgent++;
    })
  );
  const total = occupied + empty + maintenance + urgent;
  return { occupied, empty, maintenance, urgent, total };
}

function OccupancyBar({ counts }) {
  const { occupied, empty, maintenance, urgent, total } = counts;
  return (
    <View style={bar.wrap}>
      <View style={[bar.seg, { flex: occupied,    backgroundColor: STATUS.occupied.color }]} />
      <View style={[bar.seg, { flex: empty,       backgroundColor: STATUS.empty.color }]} />
      <View style={[bar.seg, { flex: maintenance, backgroundColor: STATUS.maintenance.color }]} />
      <View style={[bar.seg, { flex: urgent,      backgroundColor: STATUS.urgent.color }]} />
      {total < 1 && <View style={[bar.seg, { flex: 1, backgroundColor: '#333' }]} />}
    </View>
  );
}

const bar = StyleSheet.create({
  wrap: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 10, backgroundColor: '#333' },
  seg:  { height: 6 },
});

function RoomCell({ room, onPress }) {
  const s = STATUS[room.status];
  return (
    <TouchableOpacity onPress={() => onPress(room)} style={[cell.wrap, { backgroundColor: s.bg, borderColor: s.color + '55' }]}>
      <Text style={[cell.dot, { color: s.color }]}>{s.icon}</Text>
      <Text style={cell.id}>{room.id}</Text>
    </TouchableOpacity>
  );
}

const cell = StyleSheet.create({
  wrap: { width: 62, height: 56, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center', margin: 4 },
  dot:  { fontSize: 10, marginBottom: 2 },
  id:   { color: '#ccd6f6', fontSize: 12, fontWeight: '700' },
});

function RoomDetailModal({ room, onClose }) {
  if (!room) return null;
  const s = STATUS[room.status];
  return (
    <View style={modal.overlay}>
      <View style={modal.card}>
        <Text style={modal.title}>Phòng {room.id}</Text>
        <View style={[modal.badge, { backgroundColor: s.bg }]}>
          <Text style={[modal.badgeText, { color: s.color }]}>{s.label}</Text>
        </View>
        {room.tenant
          ? <Text style={modal.tenant}>👤 {room.tenant}</Text>
          : <Text style={modal.noTenant}>Không có khách</Text>
        }
        {room.status === 'maintenance' && (
          <View style={modal.alertBox}>
            <Text style={modal.alertText}>⚠️ Phòng đang trong quá trình bảo trì</Text>
          </View>
        )}
        <TouchableOpacity style={modal.closeBtn} onPress={onClose}>
          <Text style={modal.closeText}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const modal = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 99 },
  card: { backgroundColor: '#1a1a2e', borderRadius: 20, padding: 28, width: 280, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', alignItems: 'center' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 12 },
  badge: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 6, marginBottom: 14 },
  badgeText: { fontSize: 14, fontWeight: '700' },
  tenant: { color: '#ccd6f6', fontSize: 15, marginBottom: 8 },
  noTenant: { color: '#8892b0', fontSize: 14, marginBottom: 8 },
  alertBox: { backgroundColor: 'rgba(254,225,64,0.1)', borderRadius: 10, padding: 12, marginBottom: 8, width: '100%', alignItems: 'center' },
  alertText: { color: '#fee140', fontSize: 13 },
  closeBtn: { marginTop: 16, backgroundColor: '#e94560', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 32 },
  closeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});

export default function StaffDashboardScreen() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [expandedBuildings, setExpandedBuildings] = useState({ b1: true, b2: true });

  const toggleBuilding = (id) =>
    setExpandedBuildings(prev => ({ ...prev, [id]: !prev[id] }));

  const totalRooms    = assignedBuildings.reduce((s, b) => s + countStatus(b).total, 0);
  const totalOccupied = assignedBuildings.reduce((s, b) => s + countStatus(b).occupied, 0);
  const totalIssues   = assignedBuildings.reduce((s, b) => s + countStatus(b).maintenance, 0);
  const totalUrgent   = assignedBuildings.reduce((s, b) => s + countStatus(b).urgent, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {selectedRoom && (
        <RoomDetailModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Xin chào 👋</Text>
              <Text style={styles.name}>Trần Thị Thu</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>💼 Nhân viên quản lý</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Text style={{ fontSize: 24 }}>🔔</Text>
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Urgent alert banner */}
        {totalUrgent > 0 && (
          <View style={styles.urgentBanner}>
            <Text style={styles.urgentBannerText}>🚨 {totalUrgent} phòng cần xử lý KHẨN CẤP</Text>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.sumCard}>
            <Text style={styles.sumValue}>{assignedBuildings.length}</Text>
            <Text style={styles.sumLabel}>Nhà quản lý</Text>
          </View>
          <View style={[styles.sumCard, { borderColor: '#2ecc7144' }]}>
            <Text style={[styles.sumValue, { color: '#2ecc71' }]}>{totalOccupied}</Text>
            <Text style={styles.sumLabel}>Đang thuê</Text>
          </View>
          <View style={[styles.sumCard, { borderColor: '#f1c40f44' }]}>
            <Text style={[styles.sumValue, { color: '#f1c40f' }]}>{totalIssues}</Text>
            <Text style={styles.sumLabel}>Bảo trì</Text>
          </View>
          <View style={[styles.sumCard, { borderColor: '#e9456044' }]}>
            <Text style={[styles.sumValue, { color: '#e94560' }]}>{totalUrgent}</Text>
            <Text style={styles.sumLabel}>Khẩn cấp</Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          {Object.entries(STATUS).map(([key, s]) => (
            <View key={key} style={styles.legendItem}>
              <Text style={[styles.legendDot, { color: s.color }]}>{s.icon}</Text>
              <Text style={styles.legendLabel}>{s.label}</Text>
            </View>
          ))}
          <Text style={styles.legendHint}>Nhấn vào phòng để xem chi tiết</Text>
        </View>

        {/* Buildings */}
        {assignedBuildings.map(building => {
          const counts = countStatus(building);
          const isExpanded = expandedBuildings[building.id];
          const occupancyPct = Math.round((counts.occupied / counts.total) * 100);

          return (
            <View key={building.id} style={styles.buildingCard}>

              {/* Building Header */}
              <TouchableOpacity style={styles.buildingHeader} onPress={() => toggleBuilding(building.id)}>
                <View style={styles.buildingIcon}>
                  <Text style={{ fontSize: 22 }}>🏢</Text>
                </View>
                <View style={styles.buildingInfo}>
                  <Text style={styles.buildingName}>{building.name}</Text>
                  <Text style={styles.buildingAddress}>📍 {building.address}</Text>
                </View>
                <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Building Stats */}
              <View style={styles.buildingStats}>
                <View style={styles.statPill}>
                  <Text style={styles.statPillValue}>{counts.total}</Text>
                  <Text style={styles.statPillLabel}>Phòng</Text>
                </View>
                <View style={[styles.statPill, { borderColor: '#2ecc7144' }]}>
                  <Text style={[styles.statPillValue, { color: '#2ecc71' }]}>{counts.occupied}</Text>
                  <Text style={styles.statPillLabel}>Thuê</Text>
                </View>
                <View style={[styles.statPill, { borderColor: '#8892b044' }]}>
                  <Text style={[styles.statPillValue, { color: '#8892b0' }]}>{counts.empty}</Text>
                  <Text style={styles.statPillLabel}>Trống</Text>
                </View>
                {counts.maintenance > 0 && (
                  <View style={[styles.statPill, { borderColor: '#f1c40f44' }]}>
                    <Text style={[styles.statPillValue, { color: '#f1c40f' }]}>{counts.maintenance}</Text>
                    <Text style={styles.statPillLabel}>Bảo trì</Text>
                  </View>
                )}
                {counts.urgent > 0 && (
                  <View style={[styles.statPill, { borderColor: '#e9456044', backgroundColor: 'rgba(233,69,96,0.08)' }]}>
                    <Text style={[styles.statPillValue, { color: '#e94560' }]}>{counts.urgent}</Text>
                    <Text style={styles.statPillLabel}>Khẩn cấp</Text>
                  </View>
                )}
                <View style={styles.occupancyWrap}>
                  <Text style={styles.occupancyPct}>{occupancyPct}%</Text>
                  <Text style={styles.occupancyLabel}>lấp đầy</Text>
                </View>
              </View>

              {/* Occupancy Bar */}
              <OccupancyBar counts={counts} />

              {/* Floor Grid */}
              {isExpanded && (
                <View style={styles.floorsWrap}>
                  {building.floors.map(floor => (
                    <View key={floor.floor} style={styles.floorRow}>
                      <View style={styles.floorLabelWrap}>
                        <Text style={styles.floorLabel}>Tầng</Text>
                        <Text style={styles.floorNumber}>{floor.floor}</Text>
                      </View>
                      <View style={styles.roomsGrid}>
                        {floor.rooms.map(room => (
                          <RoomCell key={room.id} room={room} onPress={setSelectedRoom} />
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              )}

            </View>
          );
        })}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },

  header: { padding: 20, paddingTop: 10 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: '#8892b0', fontSize: 14 },
  name: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  roleBadge: { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  roleText: { color: '#4facfe', fontSize: 12, fontWeight: '700' },
  notifBtn: { padding: 8, position: 'relative' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 10, height: 10, borderRadius: 5, backgroundColor: '#e94560', borderWidth: 2, borderColor: '#1a1a2e' },

  urgentBanner: { backgroundColor: 'rgba(233,69,96,0.12)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(233,69,96,0.35)', paddingVertical: 10, paddingHorizontal: 16 },
  urgentBannerText: { color: '#e94560', fontSize: 13, fontWeight: '800', textAlign: 'center' },

  summaryRow: { flexDirection: 'row', padding: 16, gap: 8 },
  sumCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  sumValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sumLabel: { color: '#8892b0', fontSize: 10, marginTop: 2, textAlign: 'center' },

  legendRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8, flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { fontSize: 12 },
  legendLabel: { color: '#8892b0', fontSize: 12 },
  legendHint: { color: '#8892b0', fontSize: 11, fontStyle: 'italic' },

  buildingCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },

  buildingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  buildingIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(79,172,254,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  buildingInfo: { flex: 1 },
  buildingName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  buildingAddress: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  expandIcon: { color: '#8892b0', fontSize: 12 },

  buildingStats: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  statPill: { borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center' },
  statPillValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  statPillLabel: { color: '#8892b0', fontSize: 10 },
  occupancyWrap: { marginLeft: 'auto', alignItems: 'flex-end' },
  occupancyPct: { color: '#fff', fontSize: 20, fontWeight: '800' },
  occupancyLabel: { color: '#8892b0', fontSize: 10 },

  floorsWrap: { marginTop: 16 },
  floorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  floorLabelWrap: { width: 40, alignItems: 'center', marginRight: 4 },
  floorLabel: { color: '#8892b0', fontSize: 10 },
  floorNumber: { color: '#fff', fontSize: 16, fontWeight: '800' },
  roomsGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap' },
});
