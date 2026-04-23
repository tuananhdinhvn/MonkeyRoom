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
    id: 'b1', name: 'Nhà A - Green Home', address: '12 Nguyễn Trãi, Q.1',
    staff: 'Trần Thị Thu',
    floors: [
      { floor: 1, rooms: [
        { id: '101', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          tenant: 'Nguyễn Văn An', phone: '0912345678', sinceDate: '05/01/2025',
          messages: [{ id: 'm1', text: 'Vòi nước bị nhỏ giọt', time: '20/04/2026 09:12', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: false }, { month: '03/2026', paid: true }],
          currentIssue: null },
        { id: '102', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'urgent',
          tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [],
          currentIssue: { title: 'Trần nhà bị thấm nước nghiêm trọng', reportedAt: '19/04/2026 07:45' } },
        { id: '103', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          tenant: 'Trần Thị Bích', phone: '0987654321', sinceDate: '15/03/2025',
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: '104', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'occupied',
          tenant: 'Vũ Thị Lan', phone: '0966333444', sinceDate: '01/02/2026',
          messages: [{ id: 'm1', text: 'Bồn cầu bị tắc', time: '21/04/2026 22:05', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: false }, { month: '03/2026', paid: true }],
          currentIssue: null },
      ]},
      { floor: 2, rooms: [
        { id: '201', type: 'Studio', area: '35m²', price: '6,000,000', status: 'occupied',
          tenant: 'Lê Minh Tuấn', phone: '0909111222', sinceDate: '20/06/2024',
          messages: [],
          paymentHistory: [{ month: '04/2026', paid: false }, { month: '03/2026', paid: false }],
          currentIssue: null },
        { id: '202', type: 'Phòng đôi', area: '28m²', price: '4,800,000', status: 'maintenance',
          tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [],
          currentIssue: { title: 'Hệ thống điện bị chập — đang thay lại toàn bộ dây', reportedAt: '15/03/2026 08:00' } },
        { id: '203', type: 'Studio', area: '35m²', price: '6,000,000', status: 'empty',
          tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
        { id: '204', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          tenant: 'Đỗ Hữu Nghĩa', phone: '0944222111', sinceDate: '10/08/2025',
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
      ]},
      { floor: 3, rooms: [
        { id: '301', type: 'Phòng đơn', area: '20m²', price: '3,500,000', status: 'occupied',
          tenant: 'Phạm Thu Hà', phone: '0978888999', sinceDate: '05/09/2024',
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: '302', type: 'Phòng VIP', area: '45m²', price: '8,500,000', status: 'occupied',
          tenant: 'Hoàng Đức Minh', phone: '0933222111', sinceDate: '01/11/2024',
          messages: [{ id: 'm1', text: 'Thang máy tầng 3 kêu tiếng lạ', time: '22/04/2026 10:00', resolved: false }],
          paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: '303', type: 'Studio', area: '35m²', price: '6,000,000', status: 'empty',
          tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
      ]},
    ],
  },
  {
    id: 'b2', name: 'Nhà B - Blue Sky', address: '45 Lê Lợi, Q.3',
    staff: 'Nguyễn Văn Bảo',
    floors: [
      { floor: 1, rooms: [
        { id: 'B101', type: 'Phòng đơn', area: '22m²', price: '3,800,000', status: 'occupied',
          tenant: 'Mai Thị Hoa', phone: '0911000111', sinceDate: '10/04/2025',
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: 'B102', type: 'Phòng đôi', area: '30m²', price: '5,000,000', status: 'occupied',
          tenant: 'Bùi Văn Tài', phone: '0922000222', sinceDate: '05/07/2025',
          messages: [], paymentHistory: [{ month: '04/2026', paid: false }],
          currentIssue: null },
        { id: 'B103', type: 'Phòng đơn', area: '22m²', price: '3,800,000', status: 'maintenance',
          tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [],
          currentIssue: { title: 'Sơn lại toàn bộ phòng sau khi khách trả', reportedAt: '20/03/2026 10:00' } },
      ]},
      { floor: 2, rooms: [
        { id: 'B201', type: 'Studio', area: '38m²', price: '6,500,000', status: 'empty',
          tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
        { id: 'B202', type: 'Phòng đôi', area: '30m²', price: '5,000,000', status: 'occupied',
          tenant: 'Ngô Thị Kim', phone: '0955000333', sinceDate: '12/10/2025',
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: 'B203', type: 'Studio', area: '38m²', price: '6,500,000', status: 'empty',
          tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
      ]},
    ],
  },
  {
    id: 'b3', name: 'Nhà C - Sunrise', address: '78 Trần Hưng Đạo, Q.5',
    staff: 'Lê Thị Hương',
    floors: [
      { floor: 1, rooms: [
        { id: 'C101', type: 'Phòng đơn', area: '22m²', price: '3,600,000', status: 'occupied',
          tenant: 'Trịnh Văn Nam', phone: '0933111222', sinceDate: '01/03/2025',
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: 'C102', type: 'Phòng đôi', area: '32m²', price: '5,200,000', status: 'occupied',
          tenant: 'Nguyễn Thị Hằng', phone: '0977888999', sinceDate: '15/06/2025',
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: 'C103', type: 'Studio', area: '40m²', price: '7,000,000', status: 'empty',
          tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [], currentIssue: null },
      ]},
      { floor: 2, rooms: [
        { id: 'C201', type: 'Studio', area: '40m²', price: '7,000,000', status: 'occupied',
          tenant: 'Đỗ Minh Khôi', phone: '0911222333', sinceDate: '22/04/2026',
          messages: [], paymentHistory: [], currentIssue: null },
        { id: 'C202', type: 'Phòng VIP', area: '50m²', price: '9,000,000', status: 'occupied',
          tenant: 'Lê Hoàng Phúc', phone: '0944555666', sinceDate: '01/01/2026',
          messages: [], paymentHistory: [{ month: '04/2026', paid: true }],
          currentIssue: null },
        { id: 'C203', type: 'Phòng đơn', area: '22m²', price: '3,600,000', status: 'maintenance',
          tenant: null, phone: null, sinceDate: null, messages: [], paymentHistory: [],
          currentIssue: { title: 'Lắp đặt máy lạnh mới', reportedAt: '10/04/2026 08:00' } },
      ]},
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────
const STATUS = {
  occupied:    { label: 'Đang thuê', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)',  border: 'rgba(46,204,113,0.35)',  icon: '✅' },
  empty:       { label: 'Trống',     color: '#8892b0', bg: 'rgba(136,146,176,0.1)',  border: 'rgba(136,146,176,0.25)', icon: '🔓' },
  maintenance: { label: 'Bảo trì',   color: '#f1c40f', bg: 'rgba(241,196,15,0.12)',  border: 'rgba(241,196,15,0.35)',  icon: '🔧' },
  urgent:      { label: 'Khẩn cấp',  color: '#e94560', bg: 'rgba(233,69,96,0.12)',   border: 'rgba(233,69,96,0.4)',    icon: '🚨' },
};
const FILTERS    = ['Tất cả', 'Đang thuê', 'Trống', 'Bảo trì', 'Khẩn cấp'];
const FILTER_MAP = { 'Đang thuê': 'occupied', 'Trống': 'empty', 'Bảo trì': 'maintenance', 'Khẩn cấp': 'urgent' };

function countRooms(building) {
  const all = building.floors.flatMap(f => f.rooms);
  return {
    total:       all.length,
    occupied:    all.filter(r => r.status === 'occupied').length,
    empty:       all.filter(r => r.status === 'empty').length,
    maintenance: all.filter(r => r.status === 'maintenance').length,
    urgent:      all.filter(r => r.status === 'urgent').length,
    unpaid:      all.filter(r => (r.paymentHistory || []).some(p => !p.paid)).length,
    messages:    all.reduce((acc, r) => acc + (r.messages || []).filter(m => !m.resolved).length, 0),
  };
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
function BuildingFormModal({ visible, initial, onSave, onClose }) {
  const [name,    setName]    = useState('');
  const [address, setAddress] = useState('');
  const [staff,   setStaff]   = useState(STAFF_LIST[0]);
  const [images,     setImages]     = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      setName(initial?.name || '');
      setAddress(initial?.address || '');
      setStaff(initial?.staff || STAFF_LIST[0]);
      setImages(initial?.images || []);
      setCoverIndex(initial?.coverIndex ?? 0);
    }
  }, [visible, initial]);

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

            <Text style={fm.label}>Địa chỉ</Text>
            <TextInput style={fm.input} value={address} onChangeText={setAddress}
              placeholder="VD: 10 Lý Tự Trọng, Q.1" placeholderTextColor="#8892b0" />

            <Text style={fm.label}>Nhân viên quản lý</Text>
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
                style={[fm.saveBtn, !name.trim() && fm.saveBtnDim]}
                onPress={() => { if (name.trim()) onSave({ name: name.trim(), address: address.trim(), staff, images, coverIndex }); }}
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
function RoomFormModal({ visible, isEdit, initial, onSave, onClose }) {
  const [roomId, setRoomId] = useState('');
  const [floor,  setFloor]  = useState('1');
  const [type,   setType]   = useState(ROOM_TYPES[0]);
  const [area,   setArea]   = useState('');
  const [price,  setPrice]  = useState('');
  const [status, setStatus] = useState('empty');
  const [images,     setImages]     = useState([]);
  const [coverIndex, setCoverIndex] = useState(0);

  useEffect(() => {
    if (visible) {
      setRoomId(initial?.id || '');
      setFloor(String(initial?.floor || 1));
      setType(initial?.type || ROOM_TYPES[0]);
      setArea((initial?.area || '').replace('m²', ''));
      setPrice((initial?.price || '').replace(/,/g, ''));
      setStatus(initial?.status || 'empty');
      setImages(initial?.images || []);
      setCoverIndex(initial?.coverIndex ?? 0);
    }
  }, [visible, initial]);

  const canSave = isEdit || roomId.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={fm.overlay}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
          <View style={fm.sheet}>
            <View style={fm.handle} />
            <Text style={fm.title}>{isEdit ? 'Cập nhật phòng' : 'Thêm phòng mới'}</Text>

            {!isEdit && <>
              <Text style={fm.label}>Mã phòng *</Text>
              <TextInput style={fm.input} value={roomId} onChangeText={setRoomId}
                placeholder="VD: 105" placeholderTextColor="#8892b0" autoCapitalize="characters" />
              <Text style={fm.label}>Tầng *</Text>
              <TextInput style={fm.input} value={floor} onChangeText={setFloor}
                placeholder="VD: 1" placeholderTextColor="#8892b0" keyboardType="number-pad" />
            </>}

            <Text style={fm.label}>Loại phòng</Text>
            <View style={fm.pickerRow}>
              {ROOM_TYPES.map(t => (
                <TouchableOpacity key={t} style={[fm.pickerOpt, type === t && fm.pickerOptActive]} onPress={() => setType(t)}>
                  <Text style={[fm.pickerText, type === t && fm.pickerTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={fm.label}>Diện tích (m²)</Text>
            <TextInput style={fm.input} value={area} onChangeText={setArea}
              placeholder="VD: 25" placeholderTextColor="#8892b0" keyboardType="decimal-pad" />

            <Text style={fm.label}>Giá thuê (₫/tháng)</Text>
            <TextInput style={fm.input} value={price} onChangeText={setPrice}
              placeholder="VD: 3500000" placeholderTextColor="#8892b0" keyboardType="number-pad" />

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
                    id:    isEdit ? initial.id : roomId.trim(),
                    floor: isEdit ? (initial?.floor || 1) : (parseInt(floor, 10) || 1),
                    type,
                    area:  area ? `${area}m²` : (initial?.area || ''),
                    price: priceNum.toLocaleString('en-US'),
                    status,
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

// ─── Room Detail Modal (Admin) ────────────────────────────
function RoomDetailModal({ room, buildingName, staffName, onClose, onEditRoom, onResolveMessage }) {
  const translateY    = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop      = useRef(new Animated.Value(0)).current;
  const openedRoomId  = useRef(null);
  const [visible,      setVisible]      = useState(false);
  const [resolvingId,  setResolvingId]  = useState(null);
  const [resolveType,  setResolveType]  = useState('self');
  const [resolveStaff, setResolveStaff] = useState(STAFF_LIST[0]);

  useEffect(() => {
    if (room) {
      if (room.id !== openedRoomId.current) {
        openedRoomId.current = room.id;
        setResolvingId(null);
        setResolveType('self');
        setResolveStaff(STAFF_LIST[0]);
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

  if (!room && !visible) return null;

  const st          = room ? STATUS[room.status] : STATUS.empty;
  const pendingMsgs = room ? (room.messages || []).filter(m => !m.resolved) : [];
  const unpaidMo    = room ? (room.paymentHistory || []).filter(p => !p.paid).length : 0;

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
              <Text style={md.roomTitle}>Phòng {room.id}</Text>
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

            {/* Alert badges */}
            {(pendingMsgs.length > 0 || unpaidMo > 0 || room.currentIssue) ? (
              <View style={md.alertStrip}>
                {pendingMsgs.length > 0 && (
                  <View style={[md.alertBadge, { borderColor: 'rgba(233,69,96,0.35)', backgroundColor: 'rgba(233,69,96,0.1)' }]}>
                    <Text style={{ color: '#e94560', fontSize: 12, fontWeight: '700' }}>💬 {pendingMsgs.length} tin chờ</Text>
                  </View>
                )}
                {unpaidMo > 0 && (
                  <View style={[md.alertBadge, { borderColor: 'rgba(241,196,15,0.35)', backgroundColor: 'rgba(241,196,15,0.1)' }]}>
                    <Text style={{ color: '#f1c40f', fontSize: 12, fontWeight: '700' }}>💸 {unpaidMo} tháng nợ</Text>
                  </View>
                )}
                {room.currentIssue && (
                  <View style={[md.alertBadge, { borderColor: 'rgba(233,69,96,0.35)', backgroundColor: 'rgba(233,69,96,0.08)' }]}>
                    <Text style={{ color: '#e94560', fontSize: 12, fontWeight: '700' }}>⚠️ Đang có sự cố</Text>
                  </View>
                )}
              </View>
            ) : (
              <View style={md.okStrip}>
                <Text style={md.okText}>✅ Phòng không có vấn đề gì</Text>
              </View>
            )}

            {/* Tenant info */}
            {room.status === 'occupied' && (
              <MdSection title="👤 Khách đang thuê">
                <View style={md.card}>
                  <MdRow label="Tên khách"     value={room.tenant} />
                  <MdRow label="Thuê từ ngày"  value={room.sinceDate} accent />
                  <MdRow label="Số điện thoại" value={room.phone} />
                </View>
                {room.phone && (
                  <TouchableOpacity style={md.callBtn} onPress={() => Linking.openURL(`tel:${room.phone}`)}>
                    <Text style={md.callBtnText}>📞  Gọi điện cho {room.tenant}</Text>
                  </TouchableOpacity>
                )}
              </MdSection>
            )}

            {/* Current issue */}
            {room.currentIssue && (
              <MdSection title="⚠️ Sự cố hiện tại">
                <View style={md.issueCard}>
                  <Text style={md.issueTitle}>{room.currentIssue.title}</Text>
                  <Text style={md.issueMeta}>📅 Ghi nhận: {room.currentIssue.reportedAt}</Text>
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

            {/* Pending messages with resolve */}
            {pendingMsgs.length > 0 && (
              <MdSection title="💬 Tin nhắn chờ xử lý">
                {pendingMsgs.map(msg => (
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
                ))}
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
function FloorDiagram({ floors, onSelectRoom }) {
  return (
    <View style={fd.wrap}>
      {[...floors].sort((a, b) => a.floor - b.floor).map(fl => (
        <View key={fl.floor} style={fd.row}>
          <View style={fd.floorTag}>
            <Text style={fd.floorTagText}>T{fl.floor}</Text>
          </View>
          <View style={fd.rooms}>
            {fl.rooms.map(room => {
              const st = STATUS[room.status];
              return (
                <TouchableOpacity
                  key={room.id}
                  style={[fd.box, { backgroundColor: st.bg, borderColor: st.color + '99' }]}
                  onPress={() => onSelectRoom(room)}
                  activeOpacity={0.75}
                >
                  <Text style={[fd.boxId, { color: st.color }]}>{room.id}</Text>
                  <Text style={fd.boxIcon}>{st.icon}</Text>
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
function Pill({ val, lbl, color }) {
  return (
    <View style={[s.pill, color && { borderColor: color + '44' }]}>
      <Text style={[s.pillVal, color && { color }]}>{val}</Text>
      <Text style={s.pillLbl}>{lbl}</Text>
    </View>
  );
}

// ─── Building Card ────────────────────────────────────────
function BuildingCard({ building, filter, search, onSelectRoom, onEditBuilding, onAddRoom }) {
  const [open, setOpen] = useState(true);
  const cnt = countRooms(building);
  const pct = cnt.total > 0 ? Math.round((cnt.occupied / cnt.total) * 100) : 0;

  const matchRoom = room => {
    const q = search.toLowerCase();
    const matchSrc = !q || room.id.toLowerCase().includes(q)
      || (room.tenant && room.tenant.toLowerCase().includes(q))
      || (room.phone  && room.phone.includes(q));
    const matchFlt = filter === 'Tất cả' || room.status === FILTER_MAP[filter];
    return matchSrc && matchFlt;
  };

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
          <Pill val={cnt.total}    lbl="Tổng" />
          <Pill val={cnt.occupied} lbl="Thuê"   color="#2ecc71" />
          <Pill val={cnt.empty}    lbl="Trống"  color="#8892b0" />
          {cnt.maintenance > 0 && <Pill val={cnt.maintenance} lbl="Bảo trì" color="#f1c40f" />}
          {cnt.urgent      > 0 && <Pill val={cnt.urgent}      lbl="Khẩn"   color="#e94560" />}
          {cnt.unpaid      > 0 && <Pill val={cnt.unpaid}      lbl="Nợ TT"  color="#f39c12" />}
          {cnt.messages    > 0 && <Pill val={cnt.messages}    lbl="Tin"    color="#4facfe" />}
        </View>
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
        {building.floors.length > 0 && <FloorDiagram floors={building.floors} onSelectRoom={onSelectRoom} />}
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
                const st      = STATUS[room.status];
                const pending = (room.messages || []).filter(m => !m.resolved).length;
                const unpaid  = (room.paymentHistory || []).filter(p => !p.paid).length;
                return (
                  <TouchableOpacity
                    key={room.id}
                    style={[s.roomRow, { borderLeftColor: st.color }]}
                    onPress={() => onSelectRoom(room)}
                    activeOpacity={0.75}
                  >
                    <View style={s.roomLeft}>
                      <Text style={s.roomId}>P{room.id}</Text>
                      <Text style={s.roomType}>{room.type}</Text>
                      <Text style={s.roomArea}>{room.area}</Text>
                    </View>
                    <View style={s.roomMid}>
                      {room.tenant
                        ? <Text style={s.tenantName}>👤 {room.tenant}</Text>
                        : <Text style={[s.noTenant, room.status === 'urgent' && { color: '#e94560', fontWeight: '700' }]}>
                            {room.status === 'urgent'       ? '🚨 Cần xử lý khẩn'
                              : room.status === 'maintenance' ? '🔧 Đang bảo trì'
                              : '🔓 Trống'}
                          </Text>
                      }
                      {room.currentIssue && (
                        <Text style={s.issuePeek} numberOfLines={1}>⚠️ {room.currentIssue.title}</Text>
                      )}
                      <View style={s.badgeRow}>
                        {pending > 0 && <View style={s.msgBadge}><Text style={s.msgBadgeText}>💬 {pending}</Text></View>}
                        {unpaid  > 0 && <View style={s.unpaidBadge}><Text style={s.unpaidBadgeText}>💸 {unpaid} nợ</Text></View>}
                      </View>
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

  const allRooms = buildings.flatMap(b => b.floors.flatMap(f => f.rooms));
  const totalOcc = allRooms.filter(r => r.status === 'occupied').length;
  const totalEmp = allRooms.filter(r => r.status === 'empty').length;
  const totalIss = allRooms.filter(r => r.status === 'maintenance' || r.status === 'urgent').length;

  const handleSelectRoom = room => {
    const b = buildings.find(b => b.floors.some(fl => fl.rooms.some(r => r.id === room.id)));
    setSelBuilding(b);
    setSelected(room);
  };

  const handleSaveBuilding = ({ name, address, staff, images, coverIndex }) => {
    if (buildingForm.mode === 'add') {
      setBuildings(prev => [...prev, { id: 'b' + Date.now(), name, address, staff, images: images || [], coverIndex: coverIndex ?? 0, floors: [] }]);
    } else {
      setBuildings(prev => prev.map(b =>
        b.id === buildingForm.building.id ? { ...b, name, address, staff, images: images || [], coverIndex: coverIndex ?? 0 } : b
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

  const handleResolveMessage = (roomId, msgId, resolveData) => {
    const updater = rooms => rooms.map(r => {
      if (r.id !== roomId) return r;
      return { ...r, messages: r.messages.map(m => m.id === msgId ? { ...m, resolved: true, resolvedBy: resolveData } : m) };
    });
    setBuildings(prev => prev.map(b => ({
      ...b, floors: b.floors.map(f => ({ ...f, rooms: updater(f.rooms) })),
    })));
    setSelected(prev => prev?.id === roomId ? updater([prev])[0] : prev);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <RoomDetailModal
        room={selected}
        buildingName={selBuilding?.name}
        staffName={selBuilding?.staff}
        onClose={() => { setSelected(null); setSelBuilding(null); }}
        onEditRoom={room => setRoomForm({ mode: 'edit', building: selBuilding, room })}
        onResolveMessage={handleResolveMessage}
      />

      <BuildingFormModal
        visible={!!buildingForm}
        initial={buildingForm?.building || null}
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
          <TouchableOpacity style={s.sumItem} onPress={() => setFilter('Bảo trì')}>
            <Text style={[s.sumNum, { color: '#e94560' }]}>{totalIss}</Text>
            <Text style={s.sumLbl}>Sự cố</Text>
          </TouchableOpacity>
        </View>

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

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={s.filterScroll} contentContainerStyle={s.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[s.filterBtn, filter === f && s.filterActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[s.filterText, filter === f && s.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

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
  box:         { width: 44, height: 38, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  boxId:       { fontSize: 9, fontWeight: '800' },
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
  infoStripDiv:    { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },
  editBtn:         { marginTop: 12, backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(79,172,254,0.28)' },
  editBtnText:     { color: '#4facfe', fontWeight: '700', fontSize: 13 },
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
  issueCard:       { backgroundColor: 'rgba(233,69,96,0.07)', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(233,69,96,0.25)' },
  issueTitle:      { color: '#e94560', fontSize: 14, fontWeight: '700', marginBottom: 6 },
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
});

// ─── Form Modal styles ────────────────────────────────────
const fm = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:          { backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48 },
  handle:         { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:          { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  label:          { color: '#8892b0', fontSize: 11, fontWeight: '700', marginBottom: 6, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:          { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
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
  roomMid:    { flex: 1, paddingHorizontal: 10 },
  tenantName: { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
  noTenant:   { color: '#8892b0', fontSize: 12 },
  issuePeek:  { color: '#f1c40f', fontSize: 11, marginTop: 3 },
  badgeRow:   { flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  msgBadge:        { backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  msgBadgeText:    { color: '#e94560', fontSize: 10, fontWeight: '700' },
  unpaidBadge:     { backgroundColor: 'rgba(243,156,18,0.15)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  unpaidBadgeText: { color: '#f39c12', fontSize: 10, fontWeight: '700' },
  roomRight:  { alignItems: 'flex-end', gap: 5 },
  statusPill: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  roomPrice:  { color: '#4facfe', fontSize: 12, fontWeight: '700' },
});
