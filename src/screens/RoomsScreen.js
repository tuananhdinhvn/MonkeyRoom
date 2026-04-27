import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, StatusBar, Modal, Animated, Linking, Alert, Image,
  Dimensions, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const SCREEN_H   = Dimensions.get('window').height;
const STAFF_LIST = ['Trần Thị Thu', 'Nguyễn Văn Bảo', 'Lê Thị Hương'];
const ROOM_TYPES = ['Phòng đơn', 'Phòng đôi', 'Studio', 'Phòng VIP'];
const STATUS_KEYS = ['occupied', 'empty', 'maintenance', 'urgent'];

// ─── Data ─────────────────────────────────────────────────
const INIT_BUILDINGS = [
  {
    id: 'b1', name: 'Nhà A - Green Home', code: 'GHA', address: '12 Nguyễn Trãi, Q.1',
    staff: 'Trần Thị Thu',
    floors: [
      { floor: 1, rooms: [
        { id: '101', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          residents: 1, tenant: 'Nguyễn Văn An', tenantCccd: '052198001234', phone: '0912345678', sinceDate: '05/01/2025',
          roommates: [], cccdImages: [],
          messages: [{ id: 'm1', text: 'Vòi nước bị nhỏ giọt', time: '20/04/2026 09:12', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: false }, { month: '03/2026', paid: true }],
          currentIssue: null },
        { id: '102', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'urgent',
          residents: 1, tenant: 'Trương Văn Hải', tenantCccd: '077196034567', phone: '0977112233', sinceDate: '20/11/2025',
          roommates: [], cccdImages: [],
          messages: [{ id: 'm1', text: 'Trần nhà đang chảy nước, mưa vào phòng rất nhiều', time: '19/04/2026 07:30', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }],
          currentIssue: { title: 'Trần nhà bị thấm nước nghiêm trọng', reportedAt: '19/04/2026 07:45' } },
        { id: '103', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          residents: 1, tenant: 'Trần Thị Bích', tenantCccd: '079199054321', phone: '0987654321', sinceDate: '15/03/2025',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: '104', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'occupied',
          residents: 2, tenant: 'Vũ Thị Lan', tenantCccd: '066198055678', phone: '0966333444', sinceDate: '01/02/2026',
          roommates: [{ id: 'rm1', name: 'Nguyễn Văn Tâm', cccd: '079201012345' }], cccdImages: [],
          messages: [{ id: 'm1', text: 'Bồn cầu bị tắc', time: '21/04/2026 22:05', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: false }, { month: '03/2026', paid: true }],
          currentIssue: null },
      ]},
      { floor: 2, rooms: [
        { id: '201', type: 'Studio', area: '35m²', price: '6,000,000', status: 'occupied',
          residents: 1, tenant: 'Lê Minh Tuấn', tenantCccd: '075196078901', phone: '0909111222', sinceDate: '20/06/2024',
          roommates: [], cccdImages: [],
          messages: [],
          paymentHistory: [{ month: '04/2026', paid: false }, { month: '03/2026', paid: false }],
          currentIssue: null },
        { id: '202', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'maintenance',
          residents: 1, tenant: 'Phan Thị Thu', tenantCccd: '034199012345', phone: '0966444555', sinceDate: '05/06/2025',
          roommates: [], cccdImages: [],
          messages: [{ id: 'm1', text: 'Điện trong phòng bị chập, đèn đột ngột tắt hết', time: '15/03/2026 07:45', resolved: false }],
          paymentHistory: [{ month: '03/2026', paid: true }, { month: '02/2026', paid: true }],
          currentIssue: { title: 'Hệ thống điện bị chập — đang thay lại toàn bộ dây', reportedAt: '15/03/2026 08:00' } },
        { id: '203', type: 'Studio', area: '35m²', price: '6,000,000', status: 'empty',
          emptySince: '01/02/2026', tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
        { id: '204', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          residents: 1, tenant: 'Đỗ Hữu Nghĩa', tenantCccd: '033200034567', phone: '0944222111', sinceDate: '10/08/2025',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
      ]},
      { floor: 3, rooms: [
        { id: '301', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          residents: 1, tenant: 'Phạm Thu Hà', tenantCccd: '001199067890', phone: '0978888999', sinceDate: '05/09/2024',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: '302', type: 'Phòng VIP', area: '45m²', price: '8,500,000', status: 'occupied',
          residents: 2, tenant: 'Hoàng Đức Minh', tenantCccd: '001197043210', phone: '0933222111', sinceDate: '01/11/2024',
          roommates: [{ id: 'rm1', name: 'Lê Thị Ngọc', cccd: '001201056789' }], cccdImages: [],
          messages: [{ id: 'm1', text: 'Thang máy tầng 3 kêu tiếng lạ', time: '22/04/2026 10:00', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: '303', type: 'Studio', area: '35m²', price: '6,000,000', status: 'empty',
          emptySince: '15/01/2026', tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
      ]},
    ],
  },

  // ─── Nhà B - Blue Sky ─────────────────────────────────────
  {
    id: 'b2', name: 'Nhà B - Blue Sky', code: 'BLS', address: '45 Lê Lợi, Q.3',
    staff: 'Nguyễn Văn Bảo',
    floors: [
      { floor: 1, rooms: [
        { id: '101', type: 'Phòng đơn', area: '22m²', price: '3,800,000', status: 'occupied',
          residents: 1, tenant: 'Ngô Thanh Bình', tenantCccd: '079199001122', phone: '0901234567', sinceDate: '10/03/2025',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }],
          currentIssue: null },
        { id: '102', type: 'Phòng đôi', area: '30m²', price: '5,200,000', status: 'occupied',
          residents: 2, tenant: 'Đinh Thị Lan', tenantCccd: '034200023456', phone: '0912111222', sinceDate: '01/07/2025',
          roommates: [{ id: 'rm1', name: 'Trần Quốc Huy', cccd: '079202034567' }], cccdImages: [],
          messages: [{ id: 'm1', text: 'Điều hoà phòng bị hỏng, không mát được', time: '21/04/2026 14:30', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: false }, { month: '03/2026', paid: true }],
          currentIssue: null },
        { id: '103', type: 'Phòng đơn', area: '22m²', price: '3,800,000', status: 'empty',
          emptySince: '05/04/2026', tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
        { id: '104', type: 'Studio', area: '38m²', price: '6,200,000', status: 'occupied',
          residents: 1, tenant: 'Lương Minh Phát', tenantCccd: '052198045678', phone: '0933456789', sinceDate: '15/01/2025',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }, { month: '02/2026', paid: true }],
          currentIssue: null },
      ]},
      { floor: 2, rooms: [
        { id: '201', type: 'Phòng đôi', area: '30m²', price: '5,200,000', status: 'occupied',
          residents: 1, tenant: 'Bùi Thị Hồng', tenantCccd: '060199056789', phone: '0944567890', sinceDate: '20/09/2025',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: false }],
          currentIssue: null },
        { id: '202', type: 'Phòng đơn', area: '22m²', price: '3,800,000', status: 'maintenance',
          residents: 1, tenant: 'Cao Văn Dũng', tenantCccd: '048200067890', phone: '0955678901', sinceDate: '10/11/2025',
          roommates: [], cccdImages: [],
          messages: [{ id: 'm1', text: 'Ống nước trong phòng tắm bị vỡ, nước chảy ra sàn', time: '22/04/2026 06:15', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }],
          currentIssue: { title: 'Vỡ ống nước phòng tắm — đang thay ống mới', reportedAt: '22/04/2026 07:00' } },
        { id: '203', type: 'Studio', area: '38m²', price: '6,200,000', status: 'empty',
          emptySince: '01/03/2026', tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
      ]},
      { floor: 3, rooms: [
        { id: '301', type: 'Phòng VIP', area: '48m²', price: '8,800,000', status: 'occupied',
          residents: 2, tenant: 'Phan Hoàng Long', tenantCccd: '001198078901', phone: '0966789012', sinceDate: '05/05/2024',
          roommates: [{ id: 'rm1', name: 'Vũ Thị Thu', cccd: '001201089012' }], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }],
          currentIssue: null },
        { id: '302', type: 'Phòng đơn', area: '22m²', price: '3,800,000', status: 'urgent',
          residents: 1, tenant: 'Trịnh Công Sơn', tenantCccd: '079197090123', phone: '0977890123', sinceDate: '01/08/2025',
          roommates: [], cccdImages: [],
          messages: [{ id: 'm1', text: 'Cửa phòng bị hỏng khóa, không khoá được từ bên trong', time: '23/04/2026 22:00', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }],
          currentIssue: { title: 'Khóa cửa phòng hỏng — cần thay khóa khẩn cấp', reportedAt: '23/04/2026 22:10' } },
        { id: '303', type: 'Studio', area: '38m²', price: '6,200,000', status: 'empty',
          emptySince: '20/02/2026', tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
      ]},
    ],
  },

  // ─── Nhà C - Sunrise ──────────────────────────────────────
  {
    id: 'b3', name: 'Nhà C - Sunrise', code: 'SRH', address: '78 Trần Hưng Đạo, Q.5',
    staff: 'Lê Thị Hương',
    floors: [
      { floor: 1, rooms: [
        { id: '101', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          residents: 1, tenant: 'Nguyễn Thị Mai', tenantCccd: '075200101234', phone: '0988012345', sinceDate: '01/04/2025',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }],
          currentIssue: null },
        { id: '102', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'occupied',
          residents: 2, tenant: 'Hoàng Văn Khải', tenantCccd: '036199112345', phone: '0912345678', sinceDate: '15/06/2025',
          roommates: [{ id: 'rm1', name: 'Lê Thị Phương', cccd: '036201123456' }], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: false }, { month: '03/2026', paid: true }],
          currentIssue: null },
        { id: '103', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'empty',
          emptySince: '10/04/2026', tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
        { id: '104', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'occupied',
          residents: 1, tenant: 'Đặng Thị Tuyết', tenantCccd: '001200134567', phone: '0933234567', sinceDate: '20/02/2026',
          roommates: [], cccdImages: [],
          messages: [{ id: 'm1', text: 'Wifi phòng bị ngắt liên tục, không thể làm việc online', time: '20/04/2026 19:45', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }],
          currentIssue: null },
      ]},
      { floor: 2, rooms: [
        { id: '201', type: 'Studio', area: '35m²', price: '6,000,000', status: 'occupied',
          residents: 1, tenant: 'Lý Hồng Phúc', tenantCccd: '079200145678', phone: '0944345678', sinceDate: '01/10/2024',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }, { month: '02/2026', paid: true }],
          currentIssue: null },
        { id: '202', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'maintenance',
          residents: 1, tenant: 'Vương Thị Linh', tenantCccd: '048199156789', phone: '0955456789', sinceDate: '05/03/2026',
          roommates: [], cccdImages: [],
          messages: [{ id: 'm1', text: 'Bóng đèn phòng ngủ bị cháy hết, phòng tối hoàn toàn', time: '22/04/2026 20:30', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: { title: 'Hệ thống đèn hỏng — đang thay bóng và kiểm tra điện', reportedAt: '22/04/2026 21:00' } },
        { id: '203', type: 'Studio', area: '35m²', price: '6,000,000', status: 'occupied',
          residents: 1, tenant: 'Tô Minh Tuấn', tenantCccd: '052198167890', phone: '0966567890', sinceDate: '10/12/2024',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: false }, { month: '03/2026', paid: false }],
          currentIssue: null },
        { id: '204', type: 'Phòng VIP', area: '50m²', price: '9,500,000', status: 'empty',
          emptySince: '15/03/2026', tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
      ]},
    ],
  },

  // ─── Nhà D - Ocean View ───────────────────────────────────
  {
    id: 'b4', name: 'Nhà D - Ocean View', code: 'OVD', address: '22 Võ Văn Tần, Q.3',
    staff: 'Trần Thị Thu',
    floors: [
      { floor: 1, rooms: [
        { id: '101', type: 'Phòng đơn', area: '18m²', price: '3,200,000', status: 'occupied',
          residents: 1, tenant: 'Phạm Văn Toàn', tenantCccd: '060199178901', phone: '0977678901', sinceDate: '01/02/2025',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }],
          currentIssue: null },
        { id: '102', type: 'Phòng đôi', area: '26m²', price: '4,500,000', status: 'occupied',
          residents: 2, tenant: 'Nguyễn Quang Vinh', tenantCccd: '034201189012', phone: '0988789012', sinceDate: '10/05/2025',
          roommates: [{ id: 'rm1', name: 'Trần Thị Nga', cccd: '034201190123' }], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }],
          currentIssue: null },
        { id: '103', type: 'Phòng đơn', area: '18m²', price: '3,200,000', status: 'empty',
          emptySince: '01/04/2026', tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
      ]},
      { floor: 2, rooms: [
        { id: '201', type: 'Phòng đôi', area: '26m²', price: '4,500,000', status: 'urgent',
          residents: 1, tenant: 'Dương Thị Hoa', tenantCccd: '075199201234', phone: '0901890123', sinceDate: '15/08/2025',
          roommates: [], cccdImages: [],
          messages: [{ id: 'm1', text: 'Trần phòng bị nứt lớn, lo ngại sập xuống bất cứ lúc nào', time: '23/04/2026 08:00', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }],
          currentIssue: { title: 'Trần phòng bị nứt — đang kiểm tra kết cấu khẩn', reportedAt: '23/04/2026 08:30' } },
        { id: '202', type: 'Studio', area: '36m²', price: '6,500,000', status: 'occupied',
          residents: 1, tenant: 'Lê Bá Tùng', tenantCccd: '001197212345', phone: '0912901234', sinceDate: '01/09/2024',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }, { month: '02/2026', paid: true }],
          currentIssue: null },
        { id: '203', type: 'Phòng đôi', area: '26m²', price: '4,500,000', status: 'occupied',
          residents: 1, tenant: 'Chu Thị Bảo', tenantCccd: '079200223456', phone: '0933012345', sinceDate: '20/11/2025',
          roommates: [], cccdImages: [],
          messages: [{ id: 'm1', text: 'Vòi nước nóng lạnh bị hỏng, chỉ có nước lạnh', time: '21/04/2026 07:00', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: false }, { month: '03/2026', paid: true }],
          currentIssue: null },
        { id: '204', type: 'Phòng đơn', area: '18m²', price: '3,200,000', status: 'empty',
          emptySince: '25/03/2026', tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
      ]},
      { floor: 3, rooms: [
        { id: '301', type: 'Phòng VIP', area: '55m²', price: '10,000,000', status: 'occupied',
          residents: 2, tenant: 'Võ Thanh Hải', tenantCccd: '048198234567', phone: '0944123456', sinceDate: '01/01/2025',
          roommates: [{ id: 'rm1', name: 'Ngô Thị Xuân', cccd: '048201245678' }], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }, { month: '03/2026', paid: true }],
          currentIssue: null },
        { id: '302', type: 'Studio', area: '36m²', price: '6,500,000', status: 'occupied',
          residents: 1, tenant: 'Trần Ngọc Ánh', tenantCccd: '052200256789', phone: '0955234567', sinceDate: '10/04/2025',
          roommates: [], cccdImages: [],
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: '303', type: 'Phòng đôi', area: '26m²', price: '4,500,000', status: 'empty',
          emptySince: '08/04/2026', tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
      ]},
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────
const STATUS = {
  occupied:    { label: 'Đang thuê', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)',  border: 'rgba(46,204,113,0.35)',  icon: '✅' },
  empty:       { label: 'Trống',     color: '#8892b0', bg: 'rgba(136,146,176,0.1)',  border: 'rgba(136,146,176,0.25)', icon: '🔓' },
  maintenance: { label: 'Sự cố',     color: '#f1c40f', bg: 'rgba(241,196,15,0.12)',  border: 'rgba(241,196,15,0.35)',  icon: '🔧' },
  urgent:      { label: 'Sự cố',     color: '#f1c40f', bg: 'rgba(241,196,15,0.12)',  border: 'rgba(241,196,15,0.35)',  icon: '🚨' },
};
const FILTERS    = ['Tất cả', 'Đang thuê', 'Trống', 'Sự cố'];
const FILTER_MAP = { 'Đang thuê': 'occupied', 'Trống': 'empty' };

function countRooms(building) {
  const all = building.floors.flatMap(f => f.rooms);
  const hasPending = r => (r.messages || []).some(m => !m.resolved);
  return {
    total:         all.length,
    occupied:      all.filter(r => r.tenant).length,                   // tất cả phòng có khách (kể cả sự cố)
    occupiedClean: all.filter(r => r.status === 'occupied' && !hasPending(r)).length,
    empty:         all.filter(r => r.status === 'empty').length,
    maintenance:   all.filter(r => r.status === 'maintenance').length,
    urgent:        all.filter(r => r.status === 'urgent').length,
    issues:        all.filter(r => r.status === 'maintenance' || r.status === 'urgent' || (r.status === 'occupied' && hasPending(r))).length,
    unpaid:        all.filter(r => (r.paymentHistory || []).some(p => !p.paid)).length,
  };
}

function daysFromDate(ddmmyyyy) {
  if (!ddmmyyyy) return 0;
  const [d, m, y] = ddmmyyyy.split('/').map(Number);
  const then = new Date(y, m - 1, d);
  return Math.max(0, Math.floor((Date.now() - then.getTime()) / 86400000));
}

// ─── Image Picker Section ─────────────────────────────────
function ImagePickerSection({ images, onChange, coverIndex, onCoverChange, label = 'Hình ảnh' }) {
  const MAX = 5;

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh trong Cài đặt.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, MAX - images.length),
      quality: 0.85,
    });
    if (!result.canceled) {
      const newUris = result.assets.map(a => a.uri);
      const merged  = [...images, ...newUris].slice(0, MAX);
      onChange(merged);
      if (images.length === 0 && merged.length > 0) onCoverChange(0);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập máy ảnh trong Cài đặt.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled) {
      const merged = [...images, result.assets[0].uri].slice(0, MAX);
      onChange(merged);
      if (images.length === 0) onCoverChange(0);
    }
  };

  const removeImage = idx => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
    if (next.length === 0) {
      onCoverChange(0);
    } else if (idx === coverIndex) {
      onCoverChange(0);
    } else if (idx < coverIndex) {
      onCoverChange(coverIndex - 1);
    }
  };

  return (
    <View>
      <Text style={fm.label}>{label} ({images.length}/{MAX})</Text>
      {images.length > 0 && (
        <Text style={fm.imgHint}>Nhấn vào ảnh để chọn làm ảnh đại diện</Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 2 }}>
        <View style={fm.imgRow}>
          {images.map((uri, i) => {
            const isCover = i === coverIndex;
            return (
              <TouchableOpacity
                key={i}
                style={[fm.imgWrap, isCover && fm.imgWrapCover]}
                onPress={() => onCoverChange(i)}
                activeOpacity={0.85}
              >
                <Image source={{ uri }} style={[fm.imgThumb, isCover && fm.imgThumbCover]} />
                {isCover && (
                  <View style={fm.coverBadge}>
                    <Text style={fm.coverBadgeText}>⭐ Đại diện</Text>
                  </View>
                )}
                <TouchableOpacity style={fm.imgRemove} onPress={() => removeImage(i)}>
                  <Text style={fm.imgRemoveText}>✕</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
          {images.length < MAX && (
            <View style={fm.imgBtnGroup}>
              <TouchableOpacity style={fm.imgAddBtn} onPress={pickFromLibrary}>
                <Text style={fm.imgAddIcon}>🖼</Text>
                <Text style={fm.imgAddText}>Thư viện</Text>
              </TouchableOpacity>
              <TouchableOpacity style={fm.imgAddBtn} onPress={pickFromCamera}>
                <Text style={fm.imgAddIcon}>📷</Text>
                <Text style={fm.imgAddText}>Chụp ảnh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Building Form Modal ───────────────────────────────────
function BuildingFormModal({ visible, initial, existingCodes, onSave, onClose }) {
  const [name,    setName]    = useState('');
  const [code,    setCode]    = useState('');
  const [address, setAddress] = useState('');
  const [staff,   setStaff]   = useState(STAFF_LIST[0]);
  const [images,     setImages]     = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      setName(initial?.name || '');
      setCode(initial?.code || '');
      setAddress(initial?.address || '');
      setStaff(initial?.staff || STAFF_LIST[0]);
      setImages(initial?.images || []);
      setCoverIndex(initial?.coverIndex ?? 0);
    }
  }, [visible, initial]);

  const codeVal    = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
  const codeTaken  = codeVal.length === 3 && (existingCodes || [])
    .filter(c => c !== initial?.code)
    .includes(codeVal);
  const codeValid  = codeVal.length === 3 && !codeTaken;
  const canSave    = name.trim() && codeValid && address.trim() && staff;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={fm.overlay}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
          <View style={fm.sheet}>
            <View style={fm.handle} />
            <Text style={fm.title}>{initial ? 'Cập nhật tòa nhà' : 'Thêm tòa nhà mới'}</Text>

            <Text style={fm.label}>Tên tòa nhà *</Text>
            <TextInput style={fm.input} value={name} onChangeText={setName}
              placeholder="VD: Nhà D - Ocean View" placeholderTextColor="#8892b0" />

            <Text style={fm.label}>Mã tòa nhà *</Text>
            <View>
              <TextInput
                style={[fm.input, fm.codeInput,
                  codeVal.length === 3 && (codeTaken ? fm.inputError : fm.inputOk)
                ]}
                value={codeVal}
                onChangeText={v => setCode(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3))}
                placeholder="VD: GHB"
                placeholderTextColor="#8892b0"
                maxLength={3}
                autoCapitalize="characters"
              />
              {codeVal.length > 0 && codeVal.length < 3 && (
                <Text style={fm.codeHint}>Cần đúng 3 ký tự ({3 - codeVal.length} ký tự còn lại)</Text>
              )}
              {codeVal.length === 3 && codeTaken && (
                <Text style={fm.codeError}>⚠️ Mã "{codeVal}" đã tồn tại — vui lòng chọn mã khác</Text>
              )}
              {codeVal.length === 3 && !codeTaken && (
                <Text style={fm.codeOk}>✓ Mã hợp lệ</Text>
              )}
            </View>

            <Text style={fm.label}>Địa chỉ *</Text>
            <TextInput style={fm.input} value={address} onChangeText={setAddress}
              placeholder="VD: 10 Lý Tự Trọng, Q.1" placeholderTextColor="#8892b0" />

            <Text style={fm.label}>Nhân viên quản lý *</Text>
            <View style={fm.pickerCol}>
              {STAFF_LIST.map(sv => (
                <TouchableOpacity
                  key={sv}
                  style={[fm.pickerOpt, staff === sv && fm.pickerOptActive]}
                  onPress={() => setStaff(sv)}
                >
                  <View style={[fm.radio, staff === sv && fm.radioActive]}>
                    {staff === sv && <View style={fm.radioDot} />}
                  </View>
                  <Text style={[fm.pickerText, staff === sv && fm.pickerTextActive]}>👤 {sv}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ImagePickerSection
              images={images} onChange={setImages}
              coverIndex={coverIndex} onCoverChange={setCoverIndex}
              label="Hình ảnh tòa nhà"
            />

            <View style={fm.btnRow}>
              <TouchableOpacity style={fm.cancelBtn} onPress={onClose}>
                <Text style={fm.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[fm.saveBtn, !canSave && fm.saveBtnDim]}
                onPress={() => { if (canSave) onSave({ name: name.trim(), code: codeVal, address: address.trim(), staff, images, coverIndex }); }}
              >
                <Text style={fm.saveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Room Form Modal ───────────────────────────────────────
const FLOOR_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

function RoomFormModal({ visible, isEdit, initial, onSave, onClose }) {
  const [roomId,       setRoomId]       = useState('');
  const [floor,        setFloor]        = useState(1);
  const [floorOpen,    setFloorOpen]    = useState(false);
  const [type,         setType]         = useState(ROOM_TYPES[0]);
  const [area,         setArea]         = useState('');
  const [price,        setPrice]        = useState('');
  const [status,       setStatus]       = useState('empty');
  const [images,       setImages]       = useState([]);
  const [coverIndex,   setCoverIndex]   = useState(0);

  useEffect(() => {
    if (visible) {
      setRoomId(initial?.id || '');
      setFloor(initial?.floor || 1);
      setFloorOpen(false);
      setType(initial?.type || ROOM_TYPES[0]);
      setArea((initial?.area || '').replace('m²', ''));
      setPrice((initial?.price || '').replace(/,/g, ''));
      setStatus(initial?.status || 'empty');
      setImages(initial?.images || []);
      setCoverIndex(initial?.coverIndex ?? 0);
    }
  }, [visible, initial]);

  const roomIdVal = roomId.replace(/\D/g, '').slice(0, 3);
  const roomIdValid = roomIdVal.length === 3;
  const canSave = isEdit
    ? (type && area.trim() && price.trim())
    : (roomIdValid && floor && type && area.trim() && price.trim());

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={fm.overlay}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
          <View style={fm.sheet}>
            <View style={fm.handle} />
            <Text style={fm.title}>{isEdit ? 'Cập nhật phòng' : 'Thêm phòng mới'}</Text>

            {!isEdit && <>
              <Text style={fm.label}>Mã phòng * <Text style={{ color: '#8892b0', textTransform: 'none', fontSize: 10 }}>(đúng 3 chữ số)</Text></Text>
              <View>
                <TextInput
                  style={[fm.input, fm.codeInput,
                    roomIdVal.length === 3 ? fm.inputOk : roomIdVal.length > 0 ? fm.inputError : null
                  ]}
                  value={roomIdVal}
                  onChangeText={v => setRoomId(v.replace(/\D/g, '').slice(0, 3))}
                  placeholder="VD: 105"
                  placeholderTextColor="#8892b0"
                  keyboardType="number-pad"
                  maxLength={3}
                />
                {roomIdVal.length > 0 && roomIdVal.length < 3 && (
                  <Text style={fm.codeHint}>Cần đúng 3 chữ số ({3 - roomIdVal.length} số còn lại)</Text>
                )}
                {roomIdVal.length === 3 && (
                  <Text style={fm.codeOk}>✓ Mã hợp lệ</Text>
                )}
              </View>

              <Text style={fm.label}>Tầng *</Text>
              <TouchableOpacity
                style={[fm.input, fm.dropdownTrigger]}
                onPress={() => setFloorOpen(o => !o)}
                activeOpacity={0.7}
              >
                <Text style={fm.dropdownValue}>Tầng {floor}</Text>
                <Text style={fm.dropdownArrow}>{floorOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {floorOpen && (
                <View style={fm.dropdownList}>
                  {FLOOR_OPTIONS.map(f => (
                    <TouchableOpacity
                      key={f}
                      style={[fm.dropdownItem, floor === f && fm.dropdownItemActive]}
                      onPress={() => { setFloor(f); setFloorOpen(false); }}
                    >
                      <Text style={[fm.dropdownItemText, floor === f && fm.dropdownItemTextActive]}>
                        Tầng {f}
                      </Text>
                      {floor === f && <Text style={{ color: '#4facfe' }}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>}

            <Text style={fm.label}>Loại phòng *</Text>
            <View style={fm.pickerRow}>
              {ROOM_TYPES.map(t => (
                <TouchableOpacity key={t} style={[fm.pickerOpt, type === t && fm.pickerOptActive]} onPress={() => setType(t)}>
                  <Text style={[fm.pickerText, type === t && fm.pickerTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={fm.label}>Diện tích (m²) *</Text>
            <TextInput style={fm.input} value={area} onChangeText={setArea}
              placeholder="VD: 25" placeholderTextColor="#8892b0" keyboardType="decimal-pad" />

            <Text style={fm.label}>Giá thuê (₫/tháng) *</Text>
            <TextInput style={fm.input} value={price} onChangeText={setPrice}
              placeholder="VD: 3500000" placeholderTextColor="#8892b0" keyboardType="number-pad" />

            {isEdit && <>
              <Text style={fm.label}>Tình trạng</Text>
              <View style={fm.pickerRow}>
                {STATUS_KEYS.map(k => {
                  const st = STATUS[k];
                  return (
                    <TouchableOpacity
                      key={k}
                      style={[fm.pickerOpt, status === k && { backgroundColor: st.bg, borderColor: st.color }]}
                      onPress={() => setStatus(k)}
                    >
                      <Text style={[fm.pickerText, status === k && { color: st.color, fontWeight: '700' }]}>
                        {st.icon} {st.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>}
            {!isEdit && (
              <View style={fm.newRoomStatus}>
                <Text style={fm.newRoomStatusText}>🔓 Phòng mới tạo mặc định là phòng trống</Text>
              </View>
            )}

            <ImagePickerSection
              images={images} onChange={setImages}
              coverIndex={coverIndex} onCoverChange={setCoverIndex}
              label="Hình ảnh phòng"
            />

            <View style={fm.btnRow}>
              <TouchableOpacity style={fm.cancelBtn} onPress={onClose}>
                <Text style={fm.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[fm.saveBtn, !canSave && fm.saveBtnDim]}
                onPress={() => {
                  if (!canSave) return;
                  const priceNum = parseInt(price.replace(/\D/g, ''), 10) || 0;
                  onSave({
                    id:    isEdit ? initial.id : roomIdVal,
                    floor: isEdit ? (initial?.floor || 1) : floor,
                    type,
                    area:  area ? `${area}m²` : (initial?.area || ''),
                    price: priceNum.toLocaleString('en-US'),
                    status: isEdit ? status : 'empty',
                    images,
                    coverIndex,
                  });
                }}
              >
                <Text style={fm.saveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Broadcast Modal ─────────────────────────────────────
function BroadcastModal({ visible, recipientCount, onClose, buildingName }) {
  const isBuilding = !!buildingName;
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;
  const inputRef   = useRef(null);

  const [title,     setTitle]     = useState('');
  const [content,   setContent]   = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [sent,      setSent]      = useState(false);

  useEffect(() => {
    if (visible) {
      setSent(false); setTitle(''); setContent('');
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0,   useNativeDriver: true, damping: 20, stiffness: 180 }),
        Animated.timing(backdropOp, { toValue: 1,   useNativeDriver: true, duration: 250 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: SCREEN_H, useNativeDriver: true, duration: 220 }),
        Animated.timing(backdropOp, { toValue: 0,         useNativeDriver: true, duration: 200 }),
      ]).start();
    }
  }, [visible]);

  const applyFormat = (prefix, suffix) => {
    const { start, end } = selection;
    const before   = content.slice(0, start);
    const selected = content.slice(start, end);
    const after    = content.slice(end);
    const next = before + prefix + selected + suffix + after;
    setContent(next);
    const cursor = start + prefix.length + selected.length + suffix.length;
    setTimeout(() => {
      inputRef.current?.setNativeProps({ selection: { start: cursor, end: cursor } });
    }, 10);
  };

  const applyBullet = () => {
    const lines = content.split('\n');
    const pos   = content.slice(0, selection.start).split('\n').length - 1;
    lines[pos]  = lines[pos].startsWith('• ') ? lines[pos].slice(2) : '• ' + lines[pos];
    setContent(lines.join('\n'));
  };

  const handleSend = () => {
    if (!title.trim() || !content.trim()) return;
    setSent(true);
    setTimeout(() => { onClose(); }, 1800);
  };

  const FmtBtn = ({ label, onPress, hint }) => (
    <TouchableOpacity style={bc.fmtBtn} onPress={onPress} activeOpacity={0.7}>
      <Text style={bc.fmtBtnText}>{label}</Text>
      {hint && <Text style={bc.fmtHint}>{hint}</Text>}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[bc.backdrop, { opacity: backdropOp }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[bc.sheet, { transform: [{ translateY }] }]}>
        <View style={bc.handle} />

        {/* Header */}
        <View style={[bc.header, isBuilding && bc.headerBuilding]}>
          <View style={[bc.headerIcon, isBuilding && bc.headerIconBuilding]}>
            <Text style={{ fontSize: 20 }}>{isBuilding ? '🏢' : '📢'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={bc.headerTitle}>{isBuilding ? `Thông báo · ${buildingName}` : 'Thông báo toàn hệ thống'}</Text>
            <Text style={bc.headerSub}>Gửi đến {recipientCount} khách hàng{isBuilding ? ' trong tòa nhà' : ''}</Text>
          </View>
          <TouchableOpacity style={bc.closeBtn} onPress={onClose}>
            <Text style={{ color: '#8892b0', fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={bc.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Title */}
          <Text style={bc.label}>Tiêu đề</Text>
          <TextInput
            style={bc.titleInput}
            placeholder="Nhập tiêu đề thông báo..."
            placeholderTextColor="#8892b0"
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />

          {/* Content label + char count */}
          <View style={bc.contentLabelRow}>
            <Text style={bc.label}>Nội dung thông báo</Text>
            <Text style={bc.charCount}>{content.length} ký tự</Text>
          </View>

          {/* Formatting toolbar */}
          <View style={bc.toolbar}>
            <FmtBtn label="B"  hint="đậm"     onPress={() => applyFormat('**', '**')} />
            <FmtBtn label="I"  hint="nghiêng" onPress={() => applyFormat('_', '_')} />
            <FmtBtn label="U"  hint="gạch chân" onPress={() => applyFormat('__', '__')} />
          </View>

          {/* Content input */}
          <TextInput
            ref={inputRef}
            style={bc.contentInput}
            placeholder="Nhập nội dung thông báo..."
            placeholderTextColor="#8892b0"
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            onSelectionChange={e => setSelection(e.nativeEvent.selection)}
          />

          {/* Preview hint */}
          <View style={bc.previewHint}>
            <Text style={bc.previewHintText}>💡 Hỗ trợ định dạng: **đậm**, _nghiêng_, __gạch chân__, • danh sách</Text>
          </View>

          {/* Send button */}
          {sent ? (
            <View style={bc.sentBanner}>
              <Text style={bc.sentText}>✅ Đã gửi đến {recipientCount} khách hàng{isBuilding ? ` · ${buildingName}` : ''}!</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[bc.sendBtn, isBuilding && bc.sendBtnBuilding, (!title.trim() || !content.trim()) && (isBuilding ? bc.sendBtnBuildingDisabled : bc.sendBtnDisabled)]}
              onPress={handleSend}
              activeOpacity={0.8}
            >
              <Text style={[bc.sendBtnText, isBuilding && { color: '#fff' }]}>📤  Gửi thông báo</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const bc = StyleSheet.create({
  backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet:       { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: SCREEN_H * 0.9, backgroundColor: '#16213e', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  handle:      { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  headerBuilding:     { borderBottomColor: 'rgba(79,172,254,0.15)' },
  headerIcon:         { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(241,196,15,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerIconBuilding: { backgroundColor: 'rgba(79,172,254,0.12)' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  headerSub:   { color: '#8892b0', fontSize: 12, marginTop: 2 },
  closeBtn:    { padding: 6 },
  body:        { paddingHorizontal: 20, paddingTop: 16 },
  label:       { color: '#8892b0', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  titleInput:  { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#ccd6f6', fontSize: 15, fontWeight: '600', paddingHorizontal: 14, paddingVertical: 12, marginBottom: 20 },
  contentLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  charCount:   { color: '#8892b0', fontSize: 11 },
  toolbar:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 6, marginBottom: 8, flexWrap: 'wrap' },
  fmtBtn:      { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.06)', flexDirection: 'row', alignItems: 'center', gap: 3 },
  fmtBtnText:  { color: '#ccd6f6', fontSize: 13, fontWeight: '800' },
  fmtHint:     { color: '#8892b0', fontSize: 10 },
  toolbarDiv:  { width: 1, height: 22, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 2 },
  contentInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#ccd6f6', fontSize: 14, lineHeight: 22, paddingHorizontal: 14, paddingVertical: 12, minHeight: 160, marginBottom: 12 },
  previewHint: { backgroundColor: 'rgba(79,172,254,0.07)', borderRadius: 10, padding: 10, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(79,172,254,0.15)' },
  previewHintText: { color: '#4facfe', fontSize: 11 },
  sendBtn:             { backgroundColor: '#f1c40f', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 8 },
  sendBtnDisabled:     { backgroundColor: 'rgba(241,196,15,0.3)' },
  sendBtnBuilding:     { backgroundColor: '#4facfe' },
  sendBtnBuildingDisabled: { backgroundColor: 'rgba(79,172,254,0.3)' },
  sendBtnText:         { color: '#1a1a2e', fontSize: 15, fontWeight: '800' },
  sentBanner:  { backgroundColor: 'rgba(46,204,113,0.12)', borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)', marginBottom: 8 },
  sentText:    { color: '#2ecc71', fontSize: 14, fontWeight: '700' },
});

// ─── Date Picker Modal ────────────────────────────────────
const VI_MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const VI_DAYS   = ['CN','T2','T3','T4','T5','T6','T7'];

function parseDDMMYYYY(str) {
  if (!str) return null;
  const [d, m, y] = str.split('/').map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}
function formatDDMMYYYY(date) {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

function DatePickerModal({ visible, value, onSelect, onClose }) {
  const today   = new Date();
  const initDate = parseDDMMYYYY(value) || new Date(2000, 0, 1);
  const [viewYear,  setViewYear]  = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [selected,  setSelected]  = useState(parseDDMMYYYY(value));
  const [yearMode,  setYearMode]  = useState(false);

  useEffect(() => {
    if (visible) {
      const d = parseDDMMYYYY(value) || new Date(2000, 0, 1);
      setViewYear(d.getFullYear()); setViewMonth(d.getMonth());
      setSelected(parseDDMMYYYY(value)); setYearMode(false);
    }
  }, [visible]);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSelected = d => d && selected && selected.getDate() === d && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear;
  const isToday    = d => d && today.getDate() === d && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  const isFuture   = d => d && new Date(viewYear, viewMonth, d) > today;

  const yearRange = Array.from({ length: 100 }, (_, i) => today.getFullYear() - i);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={dp.overlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View style={dp.card}>
          {/* Month / Year nav */}
          {!yearMode ? (
            <View style={dp.nav}>
              <TouchableOpacity style={dp.navBtn} onPress={prevMonth}><Text style={dp.navArrow}>‹</Text></TouchableOpacity>
              <TouchableOpacity style={dp.navCenter} onPress={() => setYearMode(true)}>
                <Text style={dp.navTitle}>{VI_MONTHS[viewMonth]} {viewYear}</Text>
                <Text style={dp.navHint}>▼</Text>
              </TouchableOpacity>
              <TouchableOpacity style={dp.navBtn} onPress={nextMonth}><Text style={dp.navArrow}>›</Text></TouchableOpacity>
            </View>
          ) : (
            <View style={dp.nav}>
              <Text style={dp.navTitle}>Chọn năm</Text>
              <TouchableOpacity style={dp.navBtn} onPress={() => setYearMode(false)}><Text style={dp.navArrow}>✕</Text></TouchableOpacity>
            </View>
          )}

          {yearMode ? (
            <ScrollView style={dp.yearList} showsVerticalScrollIndicator={false}>
              {yearRange.map(y => (
                <TouchableOpacity key={y} style={[dp.yearItem, y === viewYear && dp.yearItemActive]}
                  onPress={() => { setViewYear(y); setYearMode(false); }}>
                  <Text style={[dp.yearText, y === viewYear && dp.yearTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <>
              {/* Day headers */}
              <View style={dp.weekRow}>
                {VI_DAYS.map(d => <Text key={d} style={dp.weekDay}>{d}</Text>)}
              </View>
              {/* Day grid */}
              <View style={dp.grid}>
                {cells.map((d, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[dp.cell, isSelected(d) && dp.cellSelected, isToday(d) && !isSelected(d) && dp.cellToday]}
                    onPress={() => d && !isFuture(d) && setSelected(new Date(viewYear, viewMonth, d))}
                    activeOpacity={d && !isFuture(d) ? 0.7 : 1}
                  >
                    <Text style={[dp.cellText, isSelected(d) && dp.cellTextSelected, isToday(d) && !isSelected(d) && dp.cellTextToday, isFuture(d) && dp.cellTextFuture, !d && { opacity: 0 }]}>
                      {d || 0}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Actions */}
          <View style={dp.actions}>
            <TouchableOpacity style={dp.cancelBtn} onPress={onClose}><Text style={dp.cancelText}>Hủy</Text></TouchableOpacity>
            <TouchableOpacity
              style={[dp.confirmBtn, !selected && dp.confirmBtnDisabled]}
              onPress={() => { if (selected) { onSelect(formatDDMMYYYY(selected)); onClose(); } }}
            >
              <Text style={dp.confirmText}>{selected ? `Chọn ${formatDDMMYYYY(selected)}` : 'Chưa chọn ngày'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={{ flex: 0.2 }} onPress={onClose} />
      </View>
    </Modal>
  );
}

const dp = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 20 },
  card:       { backgroundColor: '#16213e', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16 },
  nav:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  navBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  navArrow:   { color: '#ccd6f6', fontSize: 20, fontWeight: '600' },
  navCenter:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navTitle:   { color: '#fff', fontSize: 15, fontWeight: '800' },
  navHint:    { color: '#8892b0', fontSize: 10 },
  weekRow:    { flexDirection: 'row', marginBottom: 6 },
  weekDay:    { flex: 1, textAlign: 'center', color: '#8892b0', fontSize: 11, fontWeight: '700' },
  grid:       { flexDirection: 'row', flexWrap: 'wrap' },
  cell:       { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 100 },
  cellSelected: { backgroundColor: '#4facfe' },
  cellToday:    { borderWidth: 1.5, borderColor: '#4facfe' },
  cellText:     { color: '#ccd6f6', fontSize: 13, fontWeight: '500' },
  cellTextSelected: { color: '#fff', fontWeight: '800' },
  cellTextToday:    { color: '#4facfe', fontWeight: '800' },
  cellTextFuture:   { color: 'rgba(136,146,176,0.35)' },
  yearList:   { maxHeight: 220 },
  yearItem:   { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  yearItemActive: { backgroundColor: 'rgba(79,172,254,0.15)' },
  yearText:       { color: '#ccd6f6', fontSize: 14, textAlign: 'center' },
  yearTextActive: { color: '#4facfe', fontWeight: '800' },
  actions:    { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn:  { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelText: { color: '#8892b0', fontWeight: '700', fontSize: 13 },
  confirmBtn: { flex: 2, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#4facfe' },
  confirmBtnDisabled: { backgroundColor: 'rgba(79,172,254,0.3)' },
  confirmText: { color: '#1a1a2e', fontWeight: '800', fontSize: 13 },
});

// ─── Check-In Modal ───────────────────────────────────────
function CheckInModal({ visible, room, buildingCode, existingTenants, onClose, onCheckIn }) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;

  const [mode,        setMode]        = useState('new'); // 'new' | 'returning'
  const [searchQ,     setSearchQ]     = useState('');
  const [showResults, setShowResults] = useState(false);
  const [name,          setName]          = useState('');
  const [dob,           setDob]           = useState('');
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [cccd,          setCccd]          = useState('');
  const [phone,       setPhone]       = useState('');
  const [email,       setEmail]       = useState('');
  const [cccdFront,   setCccdFront]   = useState(null);
  const [cccdBack,    setCccdBack]    = useState(null);
  const [roommates,   setRoommates]   = useState([]);

  const resetForm = () => {
    setMode('new'); setSearchQ(''); setShowResults(false);
    setName(''); setDob(''); setCccd(''); setPhone(''); setEmail('');
    setCccdFront(null); setCccdBack(null); setRoommates([]);
  };

  useEffect(() => {
    if (visible) {
      resetForm();
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 180 }),
        Animated.timing(backdropOp, { toValue: 1, useNativeDriver: true, duration: 250 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: SCREEN_H, useNativeDriver: true, duration: 220 }),
        Animated.timing(backdropOp, { toValue: 0,         useNativeDriver: true, duration: 200 }),
      ]).start();
    }
  }, [visible]);

  const searchResults = searchQ.length > 1
    ? existingTenants.filter(t =>
        t.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        (t.cccd && t.cccd.includes(searchQ))
      ).slice(0, 6)
    : [];

  const fillFromExisting = t => {
    setName(t.name); setCccd(t.cccd || ''); setPhone(t.phone || '');
    setDob(t.dob || ''); setEmail(t.email || '');
    setSearchQ(t.name); setShowResults(false);
  };

  const pickCccdPhoto = async side => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      side === 'front' ? setCccdFront(uri) : setCccdBack(uri);
    }
  };

  const addRoommate = () => setRoommates(p => [...p, { id: 'rm' + Date.now(), name: '', cccd: '' }]);
  const removeRoommate = id => setRoommates(p => p.filter(r => r.id !== id));
  const updateRoommate = (id, field, val) => setRoommates(p => p.map(r => r.id === id ? { ...r, [field]: val } : r));

  const roommatesValid = roommates.every(r => r.name.trim() && r.cccd.trim());
  const canSubmit = name.trim() && dob.trim() && cccd.trim() && phone.trim() && roommatesValid;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onCheckIn({
      name: name.trim(), dob: dob.trim(), cccd: cccd.trim(),
      phone: phone.trim(), email: email.trim(),
      cccdFront, cccdBack,
      roommates: roommates.filter(r => r.name.trim()),
    });
    onClose();
  };

  const roomCode = room ? (buildingCode ? `${buildingCode}-${room.id}` : room.id) : '';

  const CiField = ({ label, value, onChange, placeholder, keyboardType, required }) => (
    <View style={ci.fieldWrap}>
      <Text style={ci.fieldLabel}>{label}{required && <Text style={{ color: '#e74c3c' }}> *</Text>}</Text>
      <TextInput
        style={ci.fieldInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#8892b0"
        keyboardType={keyboardType || 'default'}
      />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[ci.backdrop, { opacity: backdropOp }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[ci.sheet, { transform: [{ translateY }] }]}>
        <View style={ci.handle} />

        {/* Header */}
        <View style={ci.header}>
          <View style={ci.headerIcon}><Text style={{ fontSize: 20 }}>🏠</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={ci.headerTitle}>Khách nhận phòng</Text>
            <Text style={ci.headerSub}>Phòng {roomCode}</Text>
          </View>
          <TouchableOpacity style={ci.closeBtn} onPress={onClose}>
            <Text style={{ color: '#8892b0', fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={ci.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* New / Returning toggle */}
          <View style={ci.toggleRow}>
            {['new', 'returning'].map(m => (
              <TouchableOpacity
                key={m}
                style={[ci.toggleBtn, mode === m && ci.toggleBtnActive]}
                onPress={() => { setMode(m); resetForm(); setMode(m); }}
                activeOpacity={0.7}
              >
                <Text style={[ci.toggleText, mode === m && ci.toggleTextActive]}>
                  {m === 'new' ? '👤 Khách mới' : '🔄 Khách cũ'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Returning customer search */}
          {mode === 'returning' && (
            <View style={ci.searchSection}>
              <Text style={ci.sectionTitle}>Tìm kiếm khách hàng</Text>
              <View style={ci.searchBox}>
                <Text style={{ fontSize: 15, marginRight: 8 }}>🔍</Text>
                <TextInput
                  style={ci.searchInput}
                  value={searchQ}
                  onChangeText={v => { setSearchQ(v); setShowResults(true); }}
                  onFocus={() => setShowResults(true)}
                  placeholder="Nhập tên hoặc số CCCD..."
                  placeholderTextColor="#8892b0"
                />
                {searchQ.length > 0 && (
                  <TouchableOpacity onPress={() => { setSearchQ(''); setShowResults(false); }}>
                    <Text style={{ color: '#8892b0', paddingHorizontal: 4 }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
              {showResults && searchResults.length > 0 && (
                <View style={ci.resultList}>
                  {searchResults.map(t => (
                    <TouchableOpacity key={t.id} style={ci.resultItem} onPress={() => fillFromExisting(t)} activeOpacity={0.7}>
                      <Text style={ci.resultName}>{t.name}</Text>
                      <Text style={ci.resultMeta}>{t.cccd} · {t.phone}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {showResults && searchQ.length > 1 && searchResults.length === 0 && (
                <View style={ci.resultEmpty}>
                  <Text style={ci.resultEmptyText}>Không tìm thấy khách hàng</Text>
                </View>
              )}
            </View>
          )}

          {/* Tenant info form */}
          <Text style={ci.sectionTitle}>Thông tin khách thuê</Text>
          <CiField label="Họ và tên"              value={name}  onChange={setName}  placeholder="Nguyễn Văn A"     required />
          <View style={ci.fieldWrap}>
            <Text style={ci.fieldLabel}>Ngày sinh<Text style={{ color: '#e74c3c' }}> *</Text></Text>
            <TouchableOpacity style={[ci.fieldInput, ci.dobBtn]} onPress={() => setShowDobPicker(true)} activeOpacity={0.7}>
              <Text style={dob ? ci.dobValue : ci.dobPlaceholder}>{dob || 'Chọn ngày sinh...'}</Text>
              <Text style={ci.dobIcon}>📅</Text>
            </TouchableOpacity>
          </View>
          <DatePickerModal visible={showDobPicker} value={dob} onSelect={setDob} onClose={() => setShowDobPicker(false)} />
          <CiField label="Số căn cước công dân"    value={cccd}  onChange={setCccd}  placeholder="0xx xxx xxx xxx" keyboardType="numeric" required />
          <CiField label="Số điện thoại"           value={phone} onChange={setPhone} placeholder="09xx xxx xxx"   keyboardType="phone-pad" required />
          <CiField label="Email"                   value={email} onChange={setEmail} placeholder="example@email.com" keyboardType="email-address" />

          {/* CCCD photos */}
          <Text style={[ci.sectionTitle, { marginTop: 20 }]}>Ảnh căn cước công dân</Text>
          <View style={ci.cccdRow}>
            {[{ key: 'front', label: 'Mặt trước', val: cccdFront, set: setCccdFront },
              { key: 'back',  label: 'Mặt sau',   val: cccdBack,  set: setCccdBack }].map(side => (
              <TouchableOpacity key={side.key} style={ci.cccdSlot} onPress={() => pickCccdPhoto(side.key)} activeOpacity={0.75}>
                {side.val
                  ? <Image source={{ uri: side.val }} style={ci.cccdImg} />
                  : <View style={ci.cccdEmpty}>
                      <Text style={{ fontSize: 28, marginBottom: 6 }}>📷</Text>
                      <Text style={ci.cccdEmptyLabel}>{side.label}</Text>
                    </View>
                }
                {side.val && (
                  <TouchableOpacity style={ci.cccdRemove} onPress={() => side.set(null)}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✕</Text>
                  </TouchableOpacity>
                )}
                <Text style={ci.cccdSlotLabel}>{side.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Roommates */}
          <View style={ci.roommateHeader}>
            <Text style={ci.sectionTitle}>Người ở cùng</Text>
            <TouchableOpacity style={ci.addRmBtn} onPress={addRoommate} activeOpacity={0.7}>
              <Text style={ci.addRmText}>＋ Thêm</Text>
            </TouchableOpacity>
          </View>
          {roommates.length === 0 && (
            <Text style={ci.rmEmpty}>Chưa có người ở cùng</Text>
          )}
          {roommates.map((rm, i) => (
            <View key={rm.id} style={ci.rmCard}>
              <View style={ci.rmCardHeader}>
                <Text style={ci.rmCardNum}>Người {i + 1}</Text>
                <TouchableOpacity onPress={() => removeRoommate(rm.id)}>
                  <Text style={ci.rmRemove}>✕ Xoá</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={ci.rmInput}
                value={rm.name}
                onChangeText={v => updateRoommate(rm.id, 'name', v)}
                placeholder="Họ và tên..."
                placeholderTextColor="#8892b0"
              />
              <TextInput
                style={[ci.rmInput, { marginTop: 8 }]}
                value={rm.cccd}
                onChangeText={v => updateRoommate(rm.id, 'cccd', v)}
                placeholder="Số CCCD..."
                placeholderTextColor="#8892b0"
                keyboardType="numeric"
              />
            </View>
          ))}

          {/* Submit */}
          {!canSubmit && (
            <Text style={ci.required}>
              {!roommatesValid
                ? '* Vui lòng điền đầy đủ họ tên và CCCD cho tất cả người ở cùng'
                : '* Họ tên, ngày sinh, CCCD và số điện thoại là bắt buộc'}
            </Text>
          )}
          <TouchableOpacity
            style={[ci.submitBtn, !canSubmit && ci.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <Text style={ci.submitText}>✅  Xác nhận nhận phòng</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const ci = StyleSheet.create({
  backdrop:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet:       { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: SCREEN_H * 0.95, backgroundColor: '#16213e', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  handle:      { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  headerIcon:  { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(46,204,113,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  headerSub:   { color: '#8892b0', fontSize: 12, marginTop: 2 },
  closeBtn:    { padding: 6 },
  body:        { paddingHorizontal: 20, paddingTop: 16 },

  toggleRow:       { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  toggleBtn:       { flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: 'rgba(79,172,254,0.18)', borderWidth: 1, borderColor: 'rgba(79,172,254,0.4)' },
  toggleText:      { color: '#8892b0', fontSize: 13, fontWeight: '600' },
  toggleTextActive:{ color: '#4facfe', fontWeight: '800' },

  searchSection: { marginBottom: 20 },
  searchBox:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchInput:   { flex: 1, color: '#fff', paddingVertical: 12, fontSize: 14 },
  resultList:    { marginTop: 6, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  resultItem:    { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  resultName:    { color: '#ccd6f6', fontSize: 14, fontWeight: '700' },
  resultMeta:    { color: '#8892b0', fontSize: 12, marginTop: 2 },
  resultEmpty:   { marginTop: 6, padding: 12, alignItems: 'center' },
  resultEmptyText: { color: '#8892b0', fontSize: 13 },

  sectionTitle:  { color: '#8892b0', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 },
  fieldWrap:     { marginBottom: 14 },
  fieldLabel:    { color: '#ccd6f6', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  fieldInput:    { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, paddingHorizontal: 14, paddingVertical: 11 },
  dobBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dobValue:      { color: '#fff', fontSize: 14 },
  dobPlaceholder:{ color: '#8892b0', fontSize: 14 },
  dobIcon:       { fontSize: 16 },

  cccdRow:       { flexDirection: 'row', gap: 12, marginBottom: 20 },
  cccdSlot:      { flex: 1, borderRadius: 12, overflow: 'visible' },
  cccdImg:       { width: '100%', aspectRatio: 1.6, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)' },
  cccdEmpty:     { width: '100%', aspectRatio: 1.6, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)' },
  cccdEmptyLabel:{ color: '#8892b0', fontSize: 12, fontWeight: '600' },
  cccdRemove:    { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#e94560', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  cccdSlotLabel: { color: '#8892b0', fontSize: 11, textAlign: 'center', marginTop: 6 },

  roommateHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, marginTop: 8 },
  addRmBtn:       { backgroundColor: 'rgba(46,204,113,0.1)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)' },
  addRmText:      { color: '#2ecc71', fontSize: 12, fontWeight: '700' },
  rmEmpty:        { color: '#8892b0', fontSize: 13, marginBottom: 16, fontStyle: 'italic' },
  rmCard:         { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  rmCardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  rmCardNum:      { color: '#4facfe', fontSize: 12, fontWeight: '700' },
  rmRemove:       { color: '#e94560', fontSize: 12, fontWeight: '600' },
  rmInput:        { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, paddingHorizontal: 12, paddingVertical: 10 },

  required:        { color: '#e74c3c', fontSize: 11, marginBottom: 12, marginTop: 4 },
  submitBtn:       { backgroundColor: '#2ecc71', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled: { backgroundColor: 'rgba(46,204,113,0.3)' },
  submitText:      { color: '#1a1a2e', fontSize: 15, fontWeight: '800' },
});

// ─── Room Detail Modal (Admin) ────────────────────────────
function RoomDetailModal({ room, buildingName, buildingCode, staffName, onClose, onEditRoom, onResolveMessage, onSaveCccdImages, onCheckout, onStartCheckIn }) {
  const translateY    = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop      = useRef(new Animated.Value(0)).current;
  const openedRoomId  = useRef(null);
  const [visible,       setVisible]      = useState(false);
  const [resolvingId,   setResolvingId]  = useState(null);
  const [resolveType,   setResolveType]  = useState('self');
  const [resolveStaff,  setResolveStaff] = useState(STAFF_LIST[0]);
  const [cccdImgs,      setCccdImgs]     = useState([]);
  const [checkoutStep,  setCheckoutStep] = useState(null); // null | 'confirm'

  useEffect(() => {
    if (room) {
      if (room.id !== openedRoomId.current) {
        openedRoomId.current = room.id;
        setResolvingId(null);
        setResolveType('self');
        setResolveStaff(STAFF_LIST[0]);
        setCccdImgs(room.cccdImages || []);
        setCheckoutStep(null);
        setVisible(true);
        Animated.parallel([
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 130 }),
          Animated.timing(backdrop,   { toValue: 1, duration: 250, useNativeDriver: true }),
        ]).start();
      }
    }
  }, [room]);

  const handleClose = () => {
    openedRoomId.current = null;
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 300, useNativeDriver: true }),
      Animated.timing(backdrop,   { toValue: 0,        duration: 250, useNativeDriver: true }),
    ]).start(() => { setVisible(false); onClose(); });
  };

  const pickCccdImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh trong Cài đặt.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: Math.max(1, 4 - cccdImgs.length),
      quality: 0.85,
    });
    if (!result.canceled) {
      const next = [...cccdImgs, ...result.assets.map(a => a.uri)].slice(0, 4);
      setCccdImgs(next);
      if (onSaveCccdImages && room) onSaveCccdImages(room.id, next);
    }
  };

  const removeCccdImg = idx => {
    const next = cccdImgs.filter((_, i) => i !== idx);
    setCccdImgs(next);
    if (onSaveCccdImages && room) onSaveCccdImages(room.id, next);
  };

  if (!room && !visible) return null;

  const pendingMsgs  = room ? (room.messages || []).filter(m => !m.resolved) : [];
  const unpaidMo     = room ? (room.paymentHistory || []).filter(p => !p.paid).length : 0;
  const isIssueSt    = room && (room.status === 'maintenance' || room.status === 'urgent');
  const hasPendingOcc = room && room.status === 'occupied' && pendingMsgs.length > 0;
  const st           = room
    ? (hasPendingOcc ? STATUS.maintenance : STATUS[room.status])
    : STATUS.empty;
  const showTenant   = room && room.tenant && (room.status === 'occupied' || isIssueSt);
  const roommates    = room ? (room.roommates || []) : [];
  const canCheckout  = room && room.status === 'occupied' && pendingMsgs.length === 0 && !room.currentIssue;

  const handleConfirmResolve = () => {
    const data = { type: resolveType, staff: resolveType === 'staff' ? resolveStaff : null };
    onResolveMessage(room.id, resolvingId, data);
    setResolvingId(null);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[md.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[md.sheet, { transform: [{ translateY }] }]}>
        <View style={md.handle} />
        {room && <>
          {/* Header */}
          <View style={[md.header, { borderLeftColor: st.color, borderLeftWidth: 4 }]}>
            <View style={[md.statusIcon, { backgroundColor: st.bg }]}>
              <Text style={{ fontSize: 22 }}>{st.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={md.roomTitle}>{buildingCode ? `${buildingCode}-${room.id}` : `Phòng ${room.id}`}</Text>
              <Text style={md.roomSub}>{room.type} · {room.area} · {room.price} ₫/tháng</Text>
            </View>
            <View style={[md.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
              <Text style={[md.statusBadgeText, { color: st.color }]}>{st.label}</Text>
            </View>
            <TouchableOpacity style={md.closeBtn} onPress={handleClose}>
              <Text style={md.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={md.scroll} showsVerticalScrollIndicator={false}>

            {/* Building + Staff strip */}
            <View style={md.infoStrip}>
              <View style={md.infoStripItem}>
                <Text style={md.infoStripLabel}>🏢 Tòa nhà</Text>
                <Text style={md.infoStripValue}>{buildingName}</Text>
                {buildingCode && <Text style={md.infoStripCode}>#{buildingCode}</Text>}
              </View>
              <View style={md.infoStripDiv} />
              <View style={md.infoStripItem}>
                <Text style={md.infoStripLabel}>👤 Nhân viên</Text>
                <Text style={md.infoStripValue}>{staffName}</Text>
              </View>
            </View>

            {/* Edit room button */}
            <TouchableOpacity style={md.editBtn} onPress={() => { onEditRoom(room); handleClose(); }}>
              <Text style={md.editBtnText}>✏️  Cập nhật thông tin phòng</Text>
            </TouchableOpacity>

            {/* Check-in button — only for empty rooms */}
            {room.status === 'empty' && (
              <TouchableOpacity style={md.checkInBtn} onPress={() => { handleClose(); setTimeout(() => onStartCheckIn(room), 350); }} activeOpacity={0.8}>
                <Text style={md.checkInBtnText}>🏠  Khách nhận phòng</Text>
              </TouchableOpacity>
            )}

            {/* Checkout button */}
            {canCheckout && checkoutStep === null && (
              <TouchableOpacity style={md.checkoutBtn} onPress={() => setCheckoutStep('confirm')} activeOpacity={0.8}>
                <Text style={md.checkoutBtnText}>🚪  Trả phòng</Text>
              </TouchableOpacity>
            )}

            {/* Checkout confirmation panel */}
            {canCheckout && checkoutStep === 'confirm' && (
              <View style={md.checkoutPanel}>
                <Text style={md.checkoutPanelTitle}>Xác nhận trả phòng</Text>
                <Text style={md.checkoutPanelSub}>Vui lòng xác nhận tình trạng phòng trước khi hoàn tất:</Text>
                <View style={md.checkoutChecklist}>
                  {['Phòng sạch sẽ, không hư hỏng', 'Không mất mát tài sản', 'Thiết bị hoạt động bình thường'].map((item, i) => (
                    <View key={i} style={md.checkoutCheckItem}>
                      <Text style={md.checkoutCheckIcon}>✅</Text>
                      <Text style={md.checkoutCheckText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <View style={md.checkoutActions}>
                  <TouchableOpacity style={md.checkoutCancel} onPress={() => setCheckoutStep(null)} activeOpacity={0.7}>
                    <Text style={md.checkoutCancelText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={md.checkoutConfirm}
                    activeOpacity={0.8}
                    onPress={() => { onCheckout(room.id); handleClose(); }}
                  >
                    <Text style={md.checkoutConfirmText}>Xác nhận trả phòng</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Unified messages section — shown for all rooms with tenant */}
            {showTenant && (
              <MdSection title="💬 Tin nhắn từ khách">
                {pendingMsgs.length > 0 ? pendingMsgs.map(msg => (
                  <View key={msg.id}>
                    <View style={md.msgCard}>
                      <Text style={md.msgTime}>{msg.time}</Text>
                      <Text style={md.msgText}>"{msg.text}"</Text>
                      {resolvingId !== msg.id && (
                        <TouchableOpacity
                          style={md.resolveToggle}
                          onPress={() => { setResolvingId(msg.id); setResolveType('self'); setResolveStaff(STAFF_LIST[0]); }}
                        >
                          <Text style={md.resolveToggleText}>Xác nhận giải quyết ▼</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {resolvingId === msg.id && (
                      <View style={md.resolveBox}>
                        <Text style={md.resolveLabel}>Hình thức xử lý:</Text>
                        {[
                          { key: 'self',       icon: '🔧', label: 'Tự xử lý' },
                          { key: 'contractor', icon: '👷', label: 'Thợ bên ngoài' },
                          { key: 'staff',      icon: '👤', label: 'Nhân viên trong hệ thống' },
                        ].map(opt => (
                          <TouchableOpacity
                            key={opt.key}
                            style={[md.resolveOpt, resolveType === opt.key && md.resolveOptActive]}
                            onPress={() => setResolveType(opt.key)}
                          >
                            <View style={[md.resolveRadio, resolveType === opt.key && md.resolveRadioActive]}>
                              {resolveType === opt.key && <View style={md.resolveRadioDot} />}
                            </View>
                            <Text style={[md.resolveOptText, resolveType === opt.key && { color: '#fff' }]}>
                              {opt.icon}  {opt.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                        {resolveType === 'staff' && (
                          <View style={md.staffPickerWrap}>
                            <Text style={md.staffPickerLabel}>Chọn nhân viên:</Text>
                            {STAFF_LIST.map(sv => (
                              <TouchableOpacity
                                key={sv}
                                style={[md.staffOpt, resolveStaff === sv && md.staffOptActive]}
                                onPress={() => setResolveStaff(sv)}
                              >
                                <Text style={[md.staffOptText, resolveStaff === sv && { color: '#4facfe', fontWeight: '700' }]}>
                                  {resolveStaff === sv ? '✔  ' : '     '}{sv}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                        <View style={md.resolveBtnRow}>
                          <TouchableOpacity style={md.resolveCancelBtn} onPress={() => setResolvingId(null)}>
                            <Text style={md.resolveCancelText}>Hủy</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={md.resolveConfirmBtn} onPress={handleConfirmResolve}>
                            <Text style={md.resolveConfirmText}>✓  Xác nhận OK</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )) : (
                  <View style={md.normalState}>
                    <Text style={md.normalStateText}>🟢  Phòng hiện tại đang hoạt động bình thường</Text>
                  </View>
                )}
              </MdSection>
            )}

            {/* Tenant info */}
            {showTenant && (
              <MdSection title="👤 Khách đang thuê">
                <View style={[md.card, isIssueSt && md.cardIssue]}>
                  <MdRow label="Tên khách"     value={room.tenant} />
                  {room.tenantCccd && <MdRow label="CCCD" value={room.tenantCccd} />}
                  <MdRow label="Thuê từ ngày"  value={room.sinceDate} accent />
                  <MdRow label="Số điện thoại" value={room.phone} />
                </View>
                {room.phone && (
                  <TouchableOpacity
                    style={[md.callBtn, isIssueSt && md.callBtnIssue]}
                    onPress={() => Linking.openURL(`tel:${room.phone}`)}
                  >
                    <Text style={[md.callBtnText, isIssueSt && { color: '#f1c40f' }]}>
                      📞  Gọi điện cho {room.tenant}
                    </Text>
                  </TouchableOpacity>
                )}
              </MdSection>
            )}

            {/* CCCD images */}
            {showTenant && (
              <MdSection title="🪪 Căn cước công dân">
                {cccdImgs.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 10, paddingBottom: 4 }}>
                      {cccdImgs.map((uri, i) => (
                        <View key={i} style={md.cccdImgWrap}>
                          <Image source={{ uri }} style={md.cccdImg} />
                          <TouchableOpacity style={md.cccdRemove} onPress={() => removeCccdImg(i)}>
                            <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {cccdImgs.length < 4 && (
                        <TouchableOpacity style={md.cccdAddBtn} onPress={pickCccdImage}>
                          <Text style={{ fontSize: 20 }}>🪪</Text>
                          <Text style={md.cccdAddText}>Thêm ảnh</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </ScrollView>
                ) : (
                  <View style={md.cccdEmpty}>
                    <Text style={{ fontSize: 28 }}>🪪</Text>
                    <Text style={md.cccdEmptyText}>Chưa có hình ảnh căn cước</Text>
                    <TouchableOpacity style={md.cccdPickBtn} onPress={pickCccdImage}>
                      <Text style={md.cccdPickText}>＋ Thêm ảnh CCCD</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </MdSection>
            )}

            {/* Roommates — only shown when there are actual roommates */}
            {showTenant && roommates.length > 0 && (
              <MdSection title={`👥 Người ở cùng  (${roommates.length} người)`}>
                <View style={md.rmTable}>
                  <View style={md.rmHeader}>
                    <Text style={[md.rmHeaderCell, { flex: 3 }]}>Họ tên</Text>
                    <Text style={[md.rmHeaderCell, { flex: 2 }]}>Số CCCD</Text>
                  </View>
                  {roommates.map((rm, i) => (
                    <View key={rm.id || i} style={[md.rmRow, i % 2 !== 0 && md.rmRowAlt]}>
                      <Text style={[md.rmCell, { flex: 3 }]}>{rm.name}</Text>
                      <Text style={[md.rmCellMono, { flex: 2 }]}>{rm.cccd}</Text>
                    </View>
                  ))}
                </View>
              </MdSection>
            )}

            {/* Payment history */}
            {(room.paymentHistory || []).length > 0 && (
              <MdSection title="💰 Lịch sử thanh toán">
                {room.paymentHistory.map((p, i) => (
                  <View key={i} style={[md.payRow, !p.paid && md.payRowUnpaid]}>
                    <Text style={md.payMonth}>Tháng {p.month}</Text>
                    <View style={[md.payBadge, p.paid ? md.payBadgePaid : md.payBadgeUnpaid]}>
                      <Text style={{ color: p.paid ? '#2ecc71' : '#e94560', fontSize: 11, fontWeight: '700' }}>
                        {p.paid ? '✅ Đã đóng' : '❌ Chưa đóng'}
                      </Text>
                    </View>
                  </View>
                ))}
              </MdSection>
            )}

            {/* Issue history */}
            {room.currentIssue && (
              <MdSection title="🔧 Lịch sử giải quyết sự cố">
                <View style={md.issueCard}>
                  <Text style={md.issueTitle}>{room.currentIssue.title}</Text>
                  <Text style={md.issueMeta}>📅 Ghi nhận: {room.currentIssue.reportedAt}</Text>
                </View>
              </MdSection>
            )}

            <View style={{ height: 48 }} />
          </ScrollView>
        </>}
      </Animated.View>
    </Modal>
  );
}

function MdSection({ title, children }) {
  return (
    <View style={md.section}>
      <Text style={md.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function MdRow({ label, value, accent }) {
  return (
    <View style={md.row}>
      <Text style={md.rowLabel}>{label}</Text>
      <Text style={[md.rowValue, accent && { color: '#4facfe' }]}>{value || '—'}</Text>
    </View>
  );
}

// ─── Floor Diagram ────────────────────────────────────────
function FloorDiagram({ floors, buildingCode, onSelectRoom }) {
  return (
    <View style={fd.wrap}>
      {[...floors].sort((a, b) => a.floor - b.floor).map(fl => (
        <View key={fl.floor} style={fd.row}>
          <View style={fd.floorTag}>
            <Text style={fd.floorTagText}>T{fl.floor}</Text>
          </View>
          <View style={fd.rooms}>
            {fl.rooms.map(room => {
              const pending = (room.messages || []).filter(m => !m.resolved).length;
              const st = (pending > 0 && room.status === 'occupied') ? STATUS.maintenance : STATUS[room.status];
              return (
                <TouchableOpacity
                  key={room.id}
                  style={[fd.box, { backgroundColor: st.bg, borderColor: st.color + '99' }]}
                  onPress={() => onSelectRoom(room)}
                  activeOpacity={0.75}
                >
                  <Text style={[fd.boxId, { color: st.color }]}>{room.id}</Text>
                  {room.tenant
                    ? <Text style={[fd.boxSub, { color: st.color }]}>
                        {room.residents ?? 1}👤
                      </Text>
                    : room.status === 'empty'
                    ? <Text style={[fd.boxSub, { color: '#8892b0' }]}>
                        {daysFromDate(room.emptySince)}d
                      </Text>
                    : <Text style={fd.boxIcon}>{st.icon}</Text>
                  }
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Pill ─────────────────────────────────────────────────
function Pill({ val, lbl, color, active, onPress }) {
  return (
    <TouchableOpacity
      style={[s.pill, color && { borderColor: color + '44' }, active && { backgroundColor: (color || '#fff') + '22', borderColor: color || '#fff' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[s.pillVal, color && { color }]}>{val}</Text>
      <Text style={[s.pillLbl, active && { color: color || '#fff' }]}>{lbl}</Text>
    </TouchableOpacity>
  );
}

// ─── Building Card ────────────────────────────────────────
function BuildingCard({ building, filter, search, onSelectRoom, onEditBuilding, onAddRoom, onBroadcast }) {
  const [open, setOpen] = useState(true);
  const [pillFilter, setPillFilter] = useState(null);
  const cnt = countRooms(building);
  const pct = cnt.total > 0 ? Math.round((cnt.occupied / cnt.total) * 100) : 0;

  const hasPending = room => (room.messages || []).some(m => !m.resolved);

  const matchRoom = room => {
    const q = search.toLowerCase().trim();
    const fullCode = building.code ? `${building.code}-${room.id}`.toLowerCase() : room.id.toLowerCase();
    const matchSrc = !q
      || room.id.toLowerCase().includes(q)
      || fullCode.includes(q)
      || (building.code && building.code.toLowerCase().includes(q))
      || (room.tenant && room.tenant.toLowerCase().includes(q))
      || (room.phone  && room.phone.includes(q));
    const matchFlt = filter === 'Tất cả'
      || (filter === 'Sự cố' && (room.status === 'maintenance' || room.status === 'urgent'))
      || (FILTER_MAP[filter] && room.status === FILTER_MAP[filter]);
    const matchPill = !pillFilter || pillFilter === 'Tổng'
      || (pillFilter === 'Thuê'  && room.status === 'occupied' && !hasPending(room))
      || (pillFilter === 'Trống' && room.status === 'empty')
      || (pillFilter === 'Sự cố' && (room.status === 'maintenance' || room.status === 'urgent' || (room.status === 'occupied' && hasPending(room))));
    return matchSrc && matchFlt && matchPill;
  };

  const togglePill = key => setPillFilter(p => p === key ? null : key);

  if (building.floors.length > 0 && !building.floors.some(fl => fl.rooms.some(matchRoom))) return null;

  const toggle = () => {
    LayoutAnimation.configureNext({
      duration: 280,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'spring', springDamping: 0.75 },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    setOpen(o => !o);
  };

  return (
    <View style={s.buildingCard}>

      {/* Card header */}
      <TouchableOpacity style={s.buildingHeader} onPress={toggle} activeOpacity={0.8}>
        <View style={s.buildingIconBox}><Text style={{ fontSize: 20 }}>🏢</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.buildingName}>{building.name}</Text>
          {building.code && <Text style={s.buildingCode}>#{building.code}</Text>}
          <Text style={s.buildingAddr}>📍 {building.address}</Text>
        </View>
        <Text style={s.collapseIcon}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Staff + Occupancy */}
      <View style={s.buildingMetaRow}>
        <View style={s.staffBadge}>
          <Text style={s.staffBadgeText}>👤 {building.staff}</Text>
        </View>
        {cnt.total > 0 && (
          <View style={s.occWrap}>
            <View style={s.occBar}>
              <View style={[s.occFill, { width: `${pct}%` }]} />
            </View>
            <Text style={s.occText}>{pct}% ({cnt.occupied}/{cnt.total})</Text>
          </View>
        )}
      </View>

      {/* Status pills */}
      {cnt.total > 0 && (
        <View style={s.pillRow}>
          <Pill val={cnt.total}         lbl="Tổng"   active={pillFilter === 'Tổng'}   onPress={() => togglePill('Tổng')} />
          <Pill val={cnt.occupiedClean} lbl="Thuê"   color="#2ecc71" active={pillFilter === 'Thuê'}   onPress={() => togglePill('Thuê')} />
          <Pill val={cnt.empty}         lbl="Trống"  color="#8892b0" active={pillFilter === 'Trống'}  onPress={() => togglePill('Trống')} />
          <Pill val={cnt.issues}        lbl="Sự cố"  color="#f1c40f" active={pillFilter === 'Sự cố'}  onPress={() => togglePill('Sự cố')} />
        </View>
      )}

      {/* Building broadcast button */}
      {cnt.total > 0 && cnt.occupied > 0 && (
        <TouchableOpacity style={s.bldBroadcastBtn} onPress={() => onBroadcast(building)} activeOpacity={0.85}>
          <View style={s.bldBroadcastLeft}>
            <Text style={s.bldBroadcastIcon}>🏢</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.bldBroadcastLabel}>THÔNG BÁO TRONG TÒA NHÀ</Text>
            <Text style={s.bldBroadcastTitle}>Gửi đến {building.floors.flatMap(f => f.rooms).filter(r => r.tenant).length} khách hàng</Text>
          </View>
          <View style={s.bldBroadcastTag}>
            <Text style={s.bldBroadcastTagText}>Gửi ›</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Building action buttons */}
      <View style={s.buildingActionRow}>
        <TouchableOpacity style={s.buildingActionBtn} onPress={() => onEditBuilding(building)}>
          <Text style={s.buildingActionText}>✏️  Cập nhật nhà</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.buildingActionBtn, s.buildingActionAccent]} onPress={() => onAddRoom(building)}>
          <Text style={[s.buildingActionText, { color: '#2ecc71' }]}>＋ Thêm phòng mới</Text>
        </TouchableOpacity>
      </View>

      {/* Expanded content */}
      {open && <>
        {building.floors.length > 0 && <FloorDiagram floors={building.floors} buildingCode={building.code} onSelectRoom={onSelectRoom} />}
        {cnt.total === 0 && (
          <View style={s.emptyBuilding}>
            <Text style={s.emptyBuildingText}>Chưa có phòng nào. Nhấn "Thêm phòng mới" để bắt đầu.</Text>
          </View>
        )}

        {building.floors.map(floor => {
          const visible = floor.rooms.filter(matchRoom);
          if (!visible.length) return null;
          return (
            <View key={floor.floor} style={s.floorSection}>
              <View style={s.floorLabel}>
                <Text style={s.floorText}>Tầng {floor.floor}</Text>
                <Text style={s.floorCount}>{visible.length} phòng</Text>
              </View>
              {visible.map(room => {
                const pending  = (room.messages || []).filter(m => !m.resolved).length;
                const unpaid   = (room.paymentHistory || []).filter(p => !p.paid).length;
                const baseSt   = STATUS[room.status];
                const st       = (pending > 0 && room.status === 'occupied') ? STATUS.maintenance : baseSt;
                return (
                  <TouchableOpacity
                    key={room.id}
                    style={[s.roomRow, { borderLeftColor: st.color }]}
                    onPress={() => onSelectRoom(room)}
                    activeOpacity={0.75}
                  >
                    <View style={s.roomLeft}>
                      <Text style={s.roomId}>{building.code ? `${building.code}-${room.id}` : room.id}</Text>
                      <Text style={s.roomType}>{room.type}</Text>
                      <Text style={s.roomArea}>{room.area}</Text>
                    </View>
                    <View style={s.roomMid}>
                      {room.tenant
                        ? <Text style={s.tenantName} numberOfLines={1}>{room.tenant}</Text>
                        : <Text style={[s.noTenant, (room.status === 'urgent' || room.status === 'maintenance') && { color: '#f1c40f', fontWeight: '700' }]}>
                            {room.status === 'urgent'       ? '🚨 Cần xử lý khẩn'
                              : room.status === 'maintenance' ? '🔧 Đang sự cố'
                              : '🔓 Trống'}
                          </Text>
                      }
                      {room.tenant && (
                        <View style={s.roomMidRow2}>
                          <Text style={s.residentCount}>{room.residents ?? 1} 👤</Text>
                          <View style={[s.msgBadge, pending > 0 && s.msgBadgeActive]}>
                            <Text style={[s.msgBadgeText, pending > 0 && s.msgBadgeTextActive]}>{pending} 💬</Text>
                          </View>
                        </View>
                      )}
                    </View>
                    <View style={s.roomRight}>
                      <View style={[s.statusPill, { backgroundColor: st.bg, borderColor: st.border }]}>
                        <Text style={[s.statusText, { color: st.color }]}>{st.icon} {st.label}</Text>
                      </View>
                      <Text style={s.roomPrice}>{room.price} ₫</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
      </>}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function RoomsScreen() {
  const [buildings,    setBuildings]    = useState(INIT_BUILDINGS);
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('Tất cả');
  const [selected,     setSelected]     = useState(null);
  const [selBuilding,  setSelBuilding]  = useState(null);
  const [buildingForm, setBuildingForm] = useState(null); // null | { mode, building? }
  const [roomForm,     setRoomForm]     = useState(null); // null | { mode, building, room? }
  const [broadcastOpen,     setBroadcastOpen]     = useState(false);
  const [broadcastBuilding, setBroadcastBuilding] = useState(null);
  const [checkInRoom,       setCheckInRoom]       = useState(null);

  const allRooms      = buildings.flatMap(b => b.floors.flatMap(f => f.rooms));
  const totalOcc      = allRooms.filter(r => r.status === 'occupied').length;
  const totalEmp      = allRooms.filter(r => r.status === 'empty').length;
  const totalIss      = allRooms.filter(r => r.status === 'maintenance' || r.status === 'urgent').length;
  const recipientCount  = allRooms.filter(r => r.tenant).length;
  const existingTenants = allRooms
    .filter(r => r.tenant)
    .map(r => ({ id: r.id, name: r.tenant, cccd: r.tenantCccd || '', phone: r.phone || '', dob: '', email: '' }));

  const handleSelectRoom = room => {
    const b = buildings.find(b => b.floors.some(fl => fl.rooms.some(r => r.id === room.id)));
    setSelBuilding(b);
    setSelected(room);
  };

  const handleSaveBuilding = ({ name, code, address, staff, images, coverIndex }) => {
    if (buildingForm.mode === 'add') {
      setBuildings(prev => [...prev, { id: 'b' + Date.now(), name, code, address, staff, images: images || [], coverIndex: coverIndex ?? 0, floors: [] }]);
    } else {
      setBuildings(prev => prev.map(b =>
        b.id === buildingForm.building.id ? { ...b, name, code, address, staff, images: images || [], coverIndex: coverIndex ?? 0 } : b
      ));
    }
    setBuildingForm(null);
  };

  const handleSaveRoom = ({ id, floor, type, area, price, status, images, coverIndex }) => {
    if (roomForm.mode === 'add') {
      setBuildings(prev => prev.map(b => {
        if (b.id !== roomForm.building.id) return b;
        const newRoom = { id, type, area, price, status, images: images || [], coverIndex: coverIndex ?? 0, tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null };
        const existFloor = b.floors.find(f => f.floor === floor);
        if (existFloor) {
          return { ...b, floors: b.floors.map(f => f.floor === floor ? { ...f, rooms: [...f.rooms, newRoom] } : f) };
        }
        return { ...b, floors: [...b.floors, { floor, rooms: [newRoom] }].sort((a, c) => a.floor - c.floor) };
      }));
    } else {
      setBuildings(prev => prev.map(b => ({
        ...b,
        floors: b.floors.map(f => ({
          ...f,
          rooms: f.rooms.map(r => r.id === id ? { ...r, type, area, price, status, images: images || [], coverIndex: coverIndex ?? 0 } : r),
        })),
      })));
    }
    setRoomForm(null);
  };

  const handleSaveCccdImages = (roomId, images) => {
    setBuildings(prev => prev.map(b => ({
      ...b,
      floors: b.floors.map(f => ({
        ...f,
        rooms: f.rooms.map(r => r.id === roomId ? { ...r, cccdImages: images } : r),
      })),
    })));
  };

  const handleCheckIn = (roomId, tenantData) => {
    setBuildings(prev => prev.map(b => ({
      ...b,
      floors: b.floors.map(f => ({
        ...f,
        rooms: f.rooms.map(r => r.id === roomId ? {
          ...r,
          status: 'occupied',
          tenant: tenantData.name,
          tenantCccd: tenantData.cccd,
          phone: tenantData.phone,
          sinceDate: new Date().toLocaleDateString('vi-VN'),
          residents: 1 + tenantData.roommates.length,
          roommates: tenantData.roommates,
          cccdImages: [tenantData.cccdFront, tenantData.cccdBack].filter(Boolean),
          emptySince: null,
          messages: [],
          paymentHistory: [],
          currentIssue: null,
        } : r),
      })),
    })));
    setCheckInRoom(null);
  };

  const handleCheckout = roomId => {
    setBuildings(prev => prev.map(b => ({
      ...b,
      floors: b.floors.map(f => ({
        ...f,
        rooms: f.rooms.map(r => r.id === roomId
          ? { ...r, status: 'empty', tenant: null, tenantCccd: null, phone: null, sinceDate: null, residents: null, roommates: [], cccdImages: [], paymentHistory: [], currentIssue: null, emptySince: new Date().toLocaleDateString('vi-VN') }
          : r),
      })),
    })));
  };

  const handleResolveMessage = (roomId, msgId, resolveData) => {
    const updater = rooms => rooms.map(r => {
      if (r.id !== roomId) return r;
      const updatedMessages = r.messages.map(m =>
        m.id === msgId ? { ...m, resolved: true, resolvedBy: resolveData } : m
      );
      const stillPending = updatedMessages.some(m => !m.resolved);
      const newStatus = !stillPending && r.tenant &&
        (r.status === 'maintenance' || r.status === 'urgent')
          ? 'occupied'
          : r.status;
      return { ...r, messages: updatedMessages, status: newStatus, currentIssue: stillPending ? r.currentIssue : null };
    });
    setBuildings(prev => prev.map(b => ({
      ...b, floors: b.floors.map(f => ({ ...f, rooms: updater(f.rooms) })),
    })));
    setSelected(prev => prev?.id === roomId ? updater([prev])[0] : prev);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <BroadcastModal
        visible={broadcastOpen}
        recipientCount={recipientCount}
        onClose={() => setBroadcastOpen(false)}
      />

      <BroadcastModal
        visible={!!broadcastBuilding}
        buildingName={broadcastBuilding?.name}
        recipientCount={broadcastBuilding ? broadcastBuilding.floors.flatMap(f => f.rooms).filter(r => r.tenant).length : 0}
        onClose={() => setBroadcastBuilding(null)}
      />

      <CheckInModal
        visible={!!checkInRoom}
        room={checkInRoom}
        buildingCode={checkInRoom ? buildings.find(b => b.floors.some(f => f.rooms.some(r => r.id === checkInRoom.id)))?.code : null}
        existingTenants={existingTenants}
        onClose={() => setCheckInRoom(null)}
        onCheckIn={(data) => handleCheckIn(checkInRoom.id, data)}
      />

      <RoomDetailModal
        room={selected}
        buildingName={selBuilding?.name}
        buildingCode={selBuilding?.code}
        staffName={selBuilding?.staff}
        onClose={() => { setSelected(null); setSelBuilding(null); }}
        onEditRoom={room => setRoomForm({ mode: 'edit', building: selBuilding, room })}
        onResolveMessage={handleResolveMessage}
        onSaveCccdImages={handleSaveCccdImages}
        onCheckout={handleCheckout}
        onStartCheckIn={room => setCheckInRoom(room)}
      />

      <BuildingFormModal
        visible={!!buildingForm}
        initial={buildingForm?.building || null}
        existingCodes={buildings.map(b => b.code).filter(Boolean)}
        onSave={handleSaveBuilding}
        onClose={() => setBuildingForm(null)}
      />

      <RoomFormModal
        visible={!!roomForm}
        isEdit={roomForm?.mode === 'edit'}
        initial={roomForm?.room || null}
        onSave={handleSaveRoom}
        onClose={() => setRoomForm(null)}
      />

      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.header}>
          <View style={s.headerRow}>
            <View>
              <Text style={s.title}>Quản lý phòng</Text>
              <Text style={s.subtitle}>23/04/2026 · {buildings.length} tòa nhà · {allRooms.length} phòng</Text>
            </View>
            <TouchableOpacity style={s.addBuildingBtn} onPress={() => setBuildingForm({ mode: 'add' })}>
              <Text style={s.addBuildingText}>＋ Thêm nhà</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Summary strip */}
        <View style={s.summaryStrip}>
          <View style={s.sumItem}>
            <Text style={s.sumNum}>{allRooms.length}</Text>
            <Text style={s.sumLbl}>Tổng phòng</Text>
          </View>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setFilter('Đang thuê')}>
            <Text style={[s.sumNum, { color: '#2ecc71' }]}>{totalOcc}</Text>
            <Text style={s.sumLbl}>Đang thuê</Text>
          </TouchableOpacity>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setFilter('Trống')}>
            <Text style={[s.sumNum, { color: '#8892b0' }]}>{totalEmp}</Text>
            <Text style={s.sumLbl}>Trống</Text>
          </TouchableOpacity>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setFilter('Sự cố')}>
            <Text style={[s.sumNum, { color: '#f1c40f' }]}>{totalIss}</Text>
            <Text style={s.sumLbl}>Sự cố</Text>
          </TouchableOpacity>
        </View>

        {/* Broadcast button */}
        <TouchableOpacity style={s.broadcastBtn} onPress={() => setBroadcastOpen(true)} activeOpacity={0.85}>
          <View style={s.broadcastLeft}>
            <View style={s.broadcastDot} />
            <View style={s.broadcastDot} />
            <View style={s.broadcastDot} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.broadcastLabel}>THÔNG BÁO HỆ THỐNG</Text>
            <Text style={s.broadcastTitle}>Gửi thông báo đến toàn bộ khách hàng</Text>
          </View>
          <View style={s.broadcastTag}>
            <Text style={s.broadcastTagText}>{recipientCount} người</Text>
          </View>
        </TouchableOpacity>

        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Tìm mã phòng, tên khách, SĐT..."
            placeholderTextColor="#8892b0"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#8892b0', fontSize: 18, paddingHorizontal: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Building cards */}
        {buildings.map(b => (
          <BuildingCard
            key={b.id}
            building={b}
            filter={filter}
            search={search}
            onSelectRoom={handleSelectRoom}
            onEditBuilding={building => setBuildingForm({ mode: 'edit', building })}
            onAddRoom={building => setRoomForm({ mode: 'add', building })}
            onBroadcast={building => setBroadcastBuilding(building)}
          />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Floor diagram styles ─────────────────────────────────
const fd = StyleSheet.create({
  wrap:        { paddingHorizontal: 4, paddingBottom: 4, marginBottom: 8 },
  row:         { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  floorTag:    { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(79,172,254,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  floorTagText:{ color: '#4facfe', fontSize: 10, fontWeight: '800' },
  rooms:       { flexDirection: 'row', flexWrap: 'wrap', gap: 5, flex: 1 },
  box:         { width: 46, height: 44, borderRadius: 9, borderWidth: 1, justifyContent: 'center', alignItems: 'center', gap: 1 },
  boxId:       { fontSize: 9, fontWeight: '800' },
  boxSub:      { fontSize: 9, fontWeight: '700' },
  boxIcon:     { fontSize: 10 },
});

// ─── Modal styles ─────────────────────────────────────────
const md = StyleSheet.create({
  backdrop:        { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet:           { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', paddingTop: 12 },
  handle:          { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  statusIcon:      { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  roomTitle:       { color: '#fff', fontSize: 22, fontWeight: '800' },
  roomSub:         { color: '#8892b0', fontSize: 12, marginTop: 2 },
  statusBadge:     { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  closeBtn:        { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  closeBtnText:    { color: '#8892b0', fontSize: 14 },
  scroll:          { paddingHorizontal: 20 },
  infoStrip:       { flexDirection: 'row', backgroundColor: 'rgba(79,172,254,0.07)', borderRadius: 14, padding: 14, marginTop: 16, borderWidth: 1, borderColor: 'rgba(79,172,254,0.15)' },
  infoStripItem:   { flex: 1, alignItems: 'center' },
  infoStripLabel:  { color: '#8892b0', fontSize: 11, marginBottom: 4 },
  infoStripValue:  { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  infoStripCode:   { color: '#4facfe', fontSize: 10, fontWeight: '700', letterSpacing: 1, marginTop: 2, textAlign: 'center' },
  infoStripDiv:    { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  editBtn:         { marginTop: 12, backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(79,172,254,0.28)' },
  editBtnText:     { color: '#4facfe', fontWeight: '700', fontSize: 13 },
  checkInBtn:      { marginTop: 10, backgroundColor: 'rgba(46,204,113,0.1)', borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.35)' },
  checkInBtnText:  { color: '#2ecc71', fontWeight: '700', fontSize: 13 },
  checkoutBtn:     { marginTop: 10, backgroundColor: 'rgba(231,76,60,0.08)', borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)' },
  checkoutBtnText: { color: '#e74c3c', fontWeight: '700', fontSize: 13 },
  checkoutPanel:   { marginTop: 10, backgroundColor: 'rgba(231,76,60,0.06)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(231,76,60,0.25)' },
  checkoutPanelTitle: { color: '#e74c3c', fontSize: 15, fontWeight: '800', marginBottom: 6 },
  checkoutPanelSub:   { color: '#8892b0', fontSize: 12, marginBottom: 14 },
  checkoutChecklist:  { gap: 8, marginBottom: 16 },
  checkoutCheckItem:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkoutCheckIcon:  { fontSize: 14 },
  checkoutCheckText:  { color: '#ccd6f6', fontSize: 13 },
  checkoutActions:    { flexDirection: 'row', gap: 10 },
  checkoutCancel:     { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  checkoutCancelText: { color: '#8892b0', fontWeight: '700', fontSize: 13 },
  checkoutConfirm:    { flex: 2, paddingVertical: 11, borderRadius: 10, alignItems: 'center', backgroundColor: '#e74c3c' },
  checkoutConfirmText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  alertStrip:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  alertBadge:      { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  okStrip:         { backgroundColor: 'rgba(46,204,113,0.07)', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 12, borderWidth: 1, borderColor: 'rgba(46,204,113,0.2)' },
  okText:          { color: '#2ecc71', fontSize: 12, fontWeight: '600' },
  section:         { marginTop: 20 },
  sectionTitle:    { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  card:            { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  row:             { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel:        { color: '#8892b0', fontSize: 13 },
  rowValue:        { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
  callBtn:         { marginTop: 10, backgroundColor: 'rgba(46,204,113,0.12)', borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.35)' },
  callBtnText:     { color: '#2ecc71', fontWeight: '800', fontSize: 14 },
  issueCard:       { backgroundColor: 'rgba(241,196,15,0.07)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(241,196,15,0.25)' },
  issueTitle:      { color: '#f1c40f', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  issueMeta:       { color: '#8892b0', fontSize: 12 },
  payRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  payRowUnpaid:    { borderColor: 'rgba(233,69,96,0.25)', backgroundColor: 'rgba(233,69,96,0.04)' },
  payMonth:        { color: '#fff', fontSize: 13, fontWeight: '700' },
  payBadge:        { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  payBadgePaid:    { backgroundColor: 'rgba(46,204,113,0.15)' },
  payBadgeUnpaid:  { backgroundColor: 'rgba(233,69,96,0.15)' },
  msgCard:         { backgroundColor: 'rgba(233,69,96,0.05)', borderRadius: 10, padding: 12, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(233,69,96,0.2)' },
  msgTime:         { color: '#8892b0', fontSize: 11, marginBottom: 4 },
  msgText:         { color: '#ccd6f6', fontSize: 13, fontStyle: 'italic', marginBottom: 8 },
  resolveToggle:   { backgroundColor: 'rgba(233,69,96,0.1)', borderRadius: 8, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(233,69,96,0.28)' },
  resolveToggleText: { color: '#e94560', fontSize: 12, fontWeight: '700' },
  resolveBox:      { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resolveLabel:    { color: '#ccd6f6', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  resolveOpt:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 6, backgroundColor: 'rgba(255,255,255,0.03)' },
  resolveOptActive:{ backgroundColor: 'rgba(79,172,254,0.1)', borderColor: 'rgba(79,172,254,0.35)' },
  resolveRadio:    { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  resolveRadioActive: { borderColor: '#4facfe' },
  resolveRadioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4facfe' },
  resolveOptText:  { color: '#8892b0', fontSize: 13, flex: 1 },
  staffPickerWrap: { backgroundColor: 'rgba(79,172,254,0.05)', borderRadius: 10, padding: 10, marginTop: 4, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(79,172,254,0.15)' },
  staffPickerLabel:{ color: '#8892b0', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  staffOpt:        { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  staffOptActive:  { backgroundColor: 'rgba(79,172,254,0.12)', borderColor: 'rgba(79,172,254,0.3)' },
  staffOptText:    { color: '#ccd6f6', fontSize: 13 },
  resolveBtnRow:   { flexDirection: 'row', gap: 8, marginTop: 8 },
  resolveCancelBtn:{ flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resolveCancelText:{ color: '#8892b0', fontWeight: '700', fontSize: 13 },
  resolveConfirmBtn:{ flex: 2, borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: 'rgba(46,204,113,0.15)', borderWidth: 1, borderColor: 'rgba(46,204,113,0.4)' },
  resolveConfirmText:{ color: '#2ecc71', fontWeight: '800', fontSize: 13 },

  normalState:     { backgroundColor: 'rgba(46,204,113,0.07)', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.2)' },
  normalStateText: { color: '#2ecc71', fontSize: 13, fontWeight: '600' },

  cardIssue:       { borderColor: 'rgba(241,196,15,0.35)', backgroundColor: 'rgba(241,196,15,0.05)' },
  callBtnIssue:    { backgroundColor: 'rgba(241,196,15,0.1)', borderColor: 'rgba(241,196,15,0.35)' },

  rmTable:      { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  rmHeader:     { flexDirection: 'row', backgroundColor: 'rgba(79,172,254,0.12)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  rmHeaderCell: { color: '#4facfe', fontSize: 11, fontWeight: '800', paddingVertical: 9, paddingHorizontal: 14, textTransform: 'uppercase', letterSpacing: 0.4 },
  rmRow:        { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rmRowAlt:     { backgroundColor: 'rgba(255,255,255,0.02)' },
  rmCell:       { color: '#ccd6f6', fontSize: 13, fontWeight: '600', paddingVertical: 11, paddingHorizontal: 14 },
  rmCellMono:   { color: '#8892b0', fontSize: 12, paddingVertical: 11, paddingHorizontal: 14 },
  rmEmpty:      { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  rmEmptyText:  { color: '#8892b0', fontSize: 13 },

  cccdEmpty:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cccdEmptyText:   { color: '#8892b0', fontSize: 13, fontWeight: '600', flex: 1 },
  cccdPickBtn:     { backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 9, paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(79,172,254,0.28)' },
  cccdPickText:    { color: '#4facfe', fontWeight: '700', fontSize: 12 },
  cccdImgWrap:     { width: 120, height: 76, borderRadius: 10, overflow: 'visible' },
  cccdImg:         { width: 120, height: 76, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)' },
  cccdRemove:      { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: '#e94560', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  cccdAddBtn:      { width: 120, height: 76, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center', gap: 4 },
  cccdAddText:     { color: '#8892b0', fontSize: 11, fontWeight: '600' },
});

// ─── Form Modal styles ────────────────────────────────────
const fm = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:          { backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48 },
  handle:         { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:          { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  label:          { color: '#8892b0', fontSize: 11, fontWeight: '700', marginBottom: 6, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:          { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  codeInput:      { letterSpacing: 6, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  inputOk:        { borderColor: 'rgba(46,204,113,0.5)', backgroundColor: 'rgba(46,204,113,0.06)' },
  inputError:     { borderColor: 'rgba(231,76,60,0.5)', backgroundColor: 'rgba(231,76,60,0.06)' },
  codeHint:       { color: '#8892b0', fontSize: 11, marginTop: 5, textAlign: 'center' },
  codeOk:         { color: '#2ecc71', fontSize: 11, fontWeight: '700', marginTop: 5, textAlign: 'center' },
  codeError:      { color: '#e74c3c', fontSize: 11, fontWeight: '600', marginTop: 5 },
  pickerRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerCol:      { gap: 6 },
  pickerOpt:      { borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center' },
  pickerOptActive:{ backgroundColor: 'rgba(79,172,254,0.15)', borderColor: 'rgba(79,172,254,0.5)' },
  pickerText:     { color: '#8892b0', fontSize: 13 },
  pickerTextActive:{ color: '#4facfe', fontWeight: '700' },
  radio:          { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  radioActive:    { borderColor: '#4facfe' },
  radioDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4facfe' },
  btnRow:         { flexDirection: 'row', gap: 10, marginTop: 24 },
  cancelBtn:      { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelText:     { color: '#8892b0', fontWeight: '700', fontSize: 14 },
  saveBtn:        { flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#e94560' },
  saveBtnDim:     { opacity: 0.4 },
  saveText:       { color: '#fff', fontWeight: '800', fontSize: 14 },

  dropdownTrigger:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownValue:        { color: '#fff', fontSize: 14 },
  dropdownArrow:        { color: '#8892b0', fontSize: 12 },
  dropdownList:         { backgroundColor: '#1a2744', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 4, overflow: 'hidden' },
  dropdownItem:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  dropdownItemActive:   { backgroundColor: 'rgba(79,172,254,0.12)' },
  dropdownItemText:     { color: '#ccd6f6', fontSize: 14 },
  dropdownItemTextActive: { color: '#4facfe', fontWeight: '700' },
  newRoomStatus:        { marginTop: 16, backgroundColor: 'rgba(136,146,176,0.1)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(136,146,176,0.2)', alignItems: 'center' },
  newRoomStatusText:    { color: '#8892b0', fontSize: 12, fontWeight: '600' },
  imgHint:        { color: '#8892b0', fontSize: 11, marginBottom: 8, fontStyle: 'italic' },
  imgRow:         { flexDirection: 'row', gap: 10, paddingVertical: 4, paddingRight: 4 },
  imgWrap:        { width: 80, height: 80, borderRadius: 12, overflow: 'visible' },
  imgWrapCover:   { borderWidth: 2, borderColor: '#f1c40f', borderRadius: 12 },
  imgThumb:       { width: 80, height: 80, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)' },
  imgThumbCover:  { borderRadius: 10 },
  coverBadge:     { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(241,196,15,0.88)', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, paddingVertical: 3, alignItems: 'center' },
  coverBadgeText: { color: '#1a1a2e', fontSize: 9, fontWeight: '900' },
  imgRemove:      { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: '#e94560', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  imgRemoveText:  { color: '#fff', fontSize: 9, fontWeight: '900' },
  imgBtnGroup:    { flexDirection: 'row', gap: 8 },
  imgAddBtn:      { width: 80, height: 80, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center', gap: 4 },
  imgAddIcon:     { fontSize: 22 },
  imgAddText:     { color: '#8892b0', fontSize: 10, fontWeight: '600' },
});

// ─── Screen styles ────────────────────────────────────────
const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },

  header:    { padding: 20, paddingTop: 30, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:     { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle:  { color: '#8892b0', fontSize: 13, marginTop: 4 },

  addBuildingBtn:  { backgroundColor: 'rgba(46,204,113,0.15)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: 'rgba(46,204,113,0.4)' },
  addBuildingText: { color: '#2ecc71', fontSize: 13, fontWeight: '800' },

  summaryStrip: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 4 },
  sumItem:  { flex: 1, alignItems: 'center' },
  sumNum:   { color: '#fff', fontSize: 22, fontWeight: '900' },
  sumLbl:   { color: '#8892b0', fontSize: 10, marginTop: 2, fontWeight: '600' },
  sumDiv:   { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },

  broadcastBtn:    { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', marginHorizontal: 16, marginTop: 10, marginBottom: 10, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 14 },
  broadcastLeft:   { flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center' },
  broadcastDot:    { width: 4, height: 4, borderRadius: 2, backgroundColor: '#f1c40f' },
  broadcastLabel:  { color: '#f1c40f', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  broadcastTitle:  { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
  broadcastTag:    { backgroundColor: 'rgba(241,196,15,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(241,196,15,0.25)' },
  broadcastTagText: { color: '#f1c40f', fontSize: 11, fontWeight: '700' },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', margin: 16, marginBottom: 10, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12, fontSize: 14 },

  filterScroll: { paddingLeft: 16, marginBottom: 14 },
  filterRow:    { gap: 8, paddingRight: 16 },
  filterBtn:    { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  filterText:   { color: '#8892b0', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  buildingCard:    { marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  buildingHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  buildingIconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(79,172,254,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  buildingName:    { color: '#fff', fontSize: 15, fontWeight: '800' },
  buildingCode:    { color: '#4facfe', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 1 },
  buildingAddr:    { color: '#8892b0', fontSize: 12, marginTop: 2 },
  collapseIcon:    { color: '#8892b0', fontSize: 12 },

  buildingMetaRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  staffBadge:       { backgroundColor: 'rgba(79,172,254,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(79,172,254,0.25)' },
  staffBadgeText:   { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  occWrap:          { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  occBar:           { flex: 1, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  occFill:          { height: 5, backgroundColor: '#2ecc71', borderRadius: 3 },
  occText:          { color: '#2ecc71', fontSize: 10, fontWeight: '700', width: 80 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
  pill:    { borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingVertical: 6, paddingHorizontal: 8, alignItems: 'center', minWidth: 44 },
  pillVal: { color: '#fff', fontSize: 13, fontWeight: '800' },
  pillLbl: { color: '#8892b0', fontSize: 9, marginTop: 1 },

  bldBroadcastBtn:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(79,172,254,0.06)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: 'rgba(79,172,254,0.2)', gap: 12, marginBottom: 10 },
  bldBroadcastLeft:    { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(79,172,254,0.12)', justifyContent: 'center', alignItems: 'center' },
  bldBroadcastIcon:    { fontSize: 16 },
  bldBroadcastLabel:   { color: '#4facfe', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, marginBottom: 3 },
  bldBroadcastTitle:   { color: '#ccd6f6', fontSize: 12, fontWeight: '600' },
  bldBroadcastTag:     { backgroundColor: 'rgba(79,172,254,0.12)', borderRadius: 7, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(79,172,254,0.28)' },
  bldBroadcastTagText: { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  buildingActionRow:   { flexDirection: 'row', gap: 8, marginBottom: 12 },
  buildingActionBtn:   { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  buildingActionAccent:{ borderColor: 'rgba(46,204,113,0.3)', backgroundColor: 'rgba(46,204,113,0.07)' },
  buildingActionText:  { color: '#ccd6f6', fontSize: 12, fontWeight: '700' },

  emptyBuilding:     { padding: 20, alignItems: 'center' },
  emptyBuildingText: { color: '#8892b0', fontSize: 13, textAlign: 'center' },

  floorSection: { marginTop: 4 },
  floorLabel:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  floorText:    { color: '#4facfe', fontSize: 13, fontWeight: '700' },
  floorCount:   { color: '#8892b0', fontSize: 12 },

  roomRow:    { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, marginBottom: 8, borderLeftWidth: 4 },
  roomLeft:   { width: 72 },
  roomId:     { color: '#fff', fontSize: 14, fontWeight: '800' },
  roomType:   { color: '#8892b0', fontSize: 11, marginTop: 1 },
  roomArea:   { color: '#8892b0', fontSize: 11 },
  roomMid:       { flex: 1, paddingHorizontal: 10 },
  tenantName:    { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
  noTenant:      { color: '#8892b0', fontSize: 12 },
  roomMidRow2:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  residentCount:    { color: '#8892b0', fontSize: 12, fontWeight: '600' },
  msgBadge:         { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  msgBadgeActive:   { backgroundColor: 'rgba(241,196,15,0.12)', borderColor: 'rgba(241,196,15,0.35)' },
  msgBadgeText:     { color: '#8892b0', fontSize: 11, fontWeight: '600' },
  msgBadgeTextActive: { color: '#f1c40f' },
  roomRight:  { alignItems: 'flex-end', gap: 5 },
  statusPill: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  roomPrice:  { color: '#4facfe', fontSize: 12, fontWeight: '700' },
});
