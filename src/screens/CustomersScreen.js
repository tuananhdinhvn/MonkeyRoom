import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Modal, Animated, ScrollView, Alert, Image,
  Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const SCREEN_H = Dimensions.get('window').height;

const BUILDINGS_ROOMS = [
  { name: 'Nhà A - Green Home', rooms: ['101','102','103','104','201','202','203','204','301','302','303'] },
  { name: 'Nhà B - Blue Sky',   rooms: ['B101','B102','B103','B201','B202','B203'] },
  { name: 'Nhà C - Sunrise',    rooms: ['C101','C102','C103','C201','C202','C203'] },
];

const MONTHS_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                   'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const DAYS_VI   = ['CN','T2','T3','T4','T5','T6','T7'];

// ─── Date Picker Modal ────────────────────────────────────
function DatePickerModal({ visible, value, onConfirm, onClose }) {
  const parseInitial = () => {
    if (value) {
      const p = value.split('/');
      if (p.length === 3) {
        const d = parseInt(p[0]), m = parseInt(p[1]) - 1, y = parseInt(p[2]);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y > 1900) return { d, m, y };
      }
    }
    return { d: 1, m: 0, y: 1990 };
  };

  const [navM,  setNavM]  = useState(0);
  const [navY,  setNavY]  = useState(1990);
  const [selD,  setSelD]  = useState(null);
  const [selM,  setSelM]  = useState(null);
  const [selY,  setSelY]  = useState(null);

  useEffect(() => {
    if (visible) {
      const { d, m, y } = parseInitial();
      setNavM(m); setNavY(y);
      setSelD(d); setSelM(m); setSelY(y);
    }
  }, [visible]);

  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const firstDOW    = (m, y) => new Date(y, m, 1).getDay(); // 0=Sun

  const prevMonth = () => { if (navM === 0) { setNavM(11); setNavY(y => y - 1); } else setNavM(m => m - 1); };
  const nextMonth = () => { if (navM === 11) { setNavM(0);  setNavY(y => y + 1); } else setNavM(m => m + 1); };

  const cells = () => {
    const blanks = Array(firstDOW(navM, navY)).fill(null);
    const days   = Array.from({ length: daysInMonth(navM, navY) }, (_, i) => i + 1);
    return [...blanks, ...days];
  };

  const handleConfirm = () => {
    if (selD != null && selM != null && selY != null) {
      const dd = String(selD).padStart(2, '0');
      const mm = String(selM + 1).padStart(2, '0');
      onConfirm(`${dd}/${mm}/${selY}`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={dp.overlay}>
        <View style={dp.sheet}>
          <View style={dp.handle} />
          <Text style={dp.title}>Chọn ngày sinh</Text>

          {/* Month navigation */}
          <View style={dp.navRow}>
            <TouchableOpacity style={dp.navBtn} onPress={prevMonth}>
              <Text style={dp.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={dp.navLabel}>{MONTHS_VI[navM]}</Text>
            <TouchableOpacity style={dp.navBtn} onPress={nextMonth}>
              <Text style={dp.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Year navigation */}
          <View style={dp.yearRow}>
            <TouchableOpacity style={dp.yearBtn} onPress={() => setNavY(y => y - 1)}>
              <Text style={dp.yearArrow}>◂</Text>
            </TouchableOpacity>
            <Text style={dp.yearLabel}>{navY}</Text>
            <TouchableOpacity style={dp.yearBtn} onPress={() => setNavY(y => y + 1)}>
              <Text style={dp.yearArrow}>▸</Text>
            </TouchableOpacity>
          </View>

          {/* Day-of-week headers */}
          <View style={dp.dowRow}>
            {DAYS_VI.map(d => (
              <View key={d} style={dp.dowCell}>
                <Text style={[dp.dowText, d === 'CN' && { color: '#e94560' }]}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={dp.grid}>
            {cells().map((day, i) => {
              const isSelected = day && day === selD && navM === selM && navY === selY;
              const isSunday   = i % 7 === 0;
              return (
                <TouchableOpacity
                  key={i}
                  style={[dp.cell, isSelected && dp.cellSelected]}
                  onPress={() => { if (day) { setSelD(day); setSelM(navM); setSelY(navY); }}}
                  activeOpacity={day ? 0.7 : 1}
                >
                  <Text style={[
                    dp.cellText,
                    !day      && { color: 'transparent' },
                    isSunday  && day && { color: '#e94560' },
                    isSelected && dp.cellTextSelected,
                  ]}>
                    {day ?? ' '}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected date display */}
          <View style={dp.selectedBox}>
            {selD != null ? (
              <Text style={dp.selectedText}>
                Ngày đã chọn: {String(selD).padStart(2,'0')}/{String((selM ?? 0) + 1).padStart(2,'0')}/{selY}
              </Text>
            ) : (
              <Text style={dp.selectedPlaceholder}>Chưa chọn ngày</Text>
            )}
          </View>

          {/* Confirm / Cancel */}
          <View style={dp.btnRow}>
            <TouchableOpacity style={dp.cancelBtn} onPress={onClose}>
              <Text style={dp.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dp.confirmBtn, selD == null && { opacity: 0.4 }]}
              onPress={handleConfirm}
              disabled={selD == null}
            >
              <Text style={dp.confirmText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const INIT_CUSTOMERS = [
  { id: '1', name: 'Nguyễn Văn An',  phone: '0912 345 678', email: 'an.nguyen@gmail.com',
    dob: '15/03/1992', building: 'Nhà A - Green Home', room: '101', since: '01/01/2025',
    paid: true,  amount: '3,500,000', avatar: { type: 'male'   }, idFront: null, idBack: null },
  { id: '2', name: 'Trần Thị Bích',  phone: '0987 654 321', email: 'bich.tran@gmail.com',
    dob: '22/07/1995', building: 'Nhà A - Green Home', room: '103', since: '15/03/2025',
    paid: true,  amount: '3,500,000', avatar: { type: 'female' }, idFront: null, idBack: null },
  { id: '3', name: 'Lê Minh Tuấn',   phone: '0909 111 222', email: 'tuan.le@gmail.com',
    dob: '08/11/1990', building: 'Nhà A - Green Home', room: '201', since: '20/06/2024',
    paid: false, amount: '6,000,000', avatar: { type: 'male'   }, idFront: null, idBack: null },
  { id: '4', name: 'Phạm Thu Hà',    phone: '0978 888 999', email: 'ha.pham@gmail.com',
    dob: '30/04/1997', building: 'Nhà A - Green Home', room: '301', since: '05/09/2024',
    paid: true,  amount: '3,500,000', avatar: { type: 'female' }, idFront: null, idBack: null },
  { id: '5', name: 'Hoàng Đức Minh', phone: '0933 222 111', email: 'minh.hoang@gmail.com',
    dob: '14/09/1988', building: 'Nhà A - Green Home', room: '302', since: '01/11/2024',
    paid: false, amount: '8,500,000', avatar: { type: 'male'   }, idFront: null, idBack: null },
  { id: '6', name: 'Vũ Thị Lan',     phone: '0966 333 444', email: 'lan.vu@gmail.com',
    dob: '05/12/1993', building: 'Nhà A - Green Home', room: '104', since: '01/02/2026',
    paid: true,  amount: '4,800,000', avatar: { type: 'female' }, idFront: null, idBack: null },
];

// ─── Avatar helpers ───────────────────────────────────────
const AVATAR_ICONS = {
  male:   { icon: '👨', color: 'rgba(79,172,254,0.2)',   label: 'Nam' },
  female: { icon: '👩', color: 'rgba(233,69,96,0.2)',    label: 'Nữ'  },
  custom: { icon: '📷', color: 'rgba(46,204,113,0.15)',  label: 'Ảnh' },
};

function AvatarDisplay({ avatar, size = 48 }) {
  const r = size / 2;
  if (avatar?.type === 'custom' && avatar?.uri) {
    return <Image source={{ uri: avatar.uri }} style={{ width: size, height: size, borderRadius: r }} />;
  }
  const cfg = AVATAR_ICONS[avatar?.type] || AVATAR_ICONS.male;
  return (
    <View style={{ width: size, height: size, borderRadius: r, backgroundColor: cfg.color, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: size * 0.48 }}>{cfg.icon}</Text>
    </View>
  );
}

// ─── ID Card Picker ───────────────────────────────────────
function IdCardPicker({ label, uri, onPick }) {
  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh trong Cài đặt.');
      return;
    }
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9,
    });
    if (!r.canceled) onPick(r.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập máy ảnh trong Cài đặt.');
      return;
    }
    const r = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9,
    });
    if (!r.canceled) onPick(r.assets[0].uri);
  };

  return (
    <View style={cf.idBox}>
      {uri ? (
        <>
          <Image source={{ uri }} style={cf.idImg} />
          <View style={cf.idLabel}>
            <Text style={cf.idLabelText}>{label}</Text>
          </View>
          <TouchableOpacity style={cf.idChangeBtn} onPress={pickFromLibrary}>
            <Text style={cf.idChangeBtnText}>✏️ Đổi ảnh</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={cf.idEmpty}>
          <Text style={cf.idEmptyText}>🪪  {label}</Text>
          <View style={cf.idBtnRow}>
            <TouchableOpacity style={cf.idPickBtn} onPress={pickFromLibrary}>
              <Text style={cf.idPickIcon}>🖼</Text>
              <Text style={cf.idPickText}>Thư viện</Text>
            </TouchableOpacity>
            <TouchableOpacity style={cf.idPickBtn} onPress={pickFromCamera}>
              <Text style={cf.idPickIcon}>📷</Text>
              <Text style={cf.idPickText}>Chụp ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Customer Form Modal ──────────────────────────────────
function CustomerFormModal({ visible, initial, onSave, onClose }) {
  const isEdit = !!initial;
  const [avatarType, setAvatarType] = useState('male');
  const [avatarUri,  setAvatarUri]  = useState(null);
  const [idFront,    setIdFront]    = useState(null);
  const [idBack,     setIdBack]     = useState(null);
  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [email,    setEmail]    = useState('');
  const [dob,            setDob]            = useState('');
  const [dobPickerOpen,  setDobPickerOpen]  = useState(false);
  const [building, setBuilding] = useState('');
  const [room,     setRoom]     = useState('');

  useEffect(() => {
    if (visible) {
      setAvatarType(initial?.avatar?.type || 'male');
      setAvatarUri(initial?.avatar?.uri   || null);
      setIdFront(initial?.idFront || null);
      setIdBack(initial?.idBack   || null);
      setName(initial?.name    || '');
      setPhone(initial?.phone   || '');
      setEmail(initial?.email   || '');
      setDob(initial?.dob     || '');
      setBuilding(initial?.building || '');
      setRoom(initial?.room    || '');
    }
  }, [visible, initial]);

  const pickAvatar = async () => {
    Alert.alert('Ảnh đại diện', 'Chọn nguồn ảnh', [
      { text: 'Thư viện', onPress: async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.85 });
        if (!r.canceled) { setAvatarType('custom'); setAvatarUri(r.assets[0].uri); }
      }},
      { text: 'Chụp ảnh', onPress: async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;
        const r = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.85 });
        if (!r.canceled) { setAvatarType('custom'); setAvatarUri(r.assets[0].uri); }
      }},
      { text: 'Hủy', style: 'cancel' },
    ]);
  };

  const roomsForBuilding = BUILDINGS_ROOMS.find(b => b.name === building)?.rooms || [];

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id:       initial?.id || String(Date.now()),
      name:     name.trim(),
      phone:    phone.trim(),
      email:    email.trim(),
      dob:      dob.trim(),
      building, room,
      since:    initial?.since || new Date().toLocaleDateString('vi-VN'),
      paid:     initial?.paid  ?? false,
      amount:   initial?.amount || '0',
      avatar:   avatarType === 'custom'
                  ? { type: 'custom', uri: avatarUri }
                  : { type: avatarType },
      idFront, idBack,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={cf.overlay}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={cf.sheet}>
            <View style={cf.handle} />
            <Text style={cf.title}>{isEdit ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}</Text>

            {/* ── Avatar ── */}
            <Text style={cf.label}>Ảnh đại diện</Text>
            <View style={cf.avatarRow}>
              {(['male', 'female'] ).map(t => {
                const cfg = AVATAR_ICONS[t];
                return (
                  <TouchableOpacity
                    key={t}
                    style={[cf.avatarOpt, avatarType === t && cf.avatarOptActive]}
                    onPress={() => { setAvatarType(t); setAvatarUri(null); }}
                  >
                    <Text style={cf.avatarOptIcon}>{cfg.icon}</Text>
                    <Text style={[cf.avatarOptLabel, avatarType === t && { color: '#4facfe' }]}>{cfg.label}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[cf.avatarOpt, avatarType === 'custom' && cf.avatarOptActive]}
                onPress={pickAvatar}
              >
                {avatarType === 'custom' && avatarUri
                  ? <Image source={{ uri: avatarUri }} style={cf.avatarCustomImg} />
                  : <Text style={cf.avatarOptIcon}>📷</Text>
                }
                <Text style={[cf.avatarOptLabel, avatarType === 'custom' && { color: '#2ecc71' }]}>
                  {avatarType === 'custom' && avatarUri ? 'Đổi ảnh' : 'Tải ảnh'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── CCCD ── */}
            <Text style={cf.label}>Căn cước công dân</Text>
            <View style={cf.idRow}>
              <IdCardPicker label="Mặt trước" uri={idFront} onPick={setIdFront} />
              <IdCardPicker label="Mặt sau"   uri={idBack}  onPick={setIdBack}  />
            </View>

            {/* ── Thông tin cơ bản ── */}
            <Text style={cf.label}>Họ và tên *</Text>
            <TextInput style={cf.input} value={name} onChangeText={setName}
              placeholder="VD: Nguyễn Văn A" placeholderTextColor="#8892b0" />

            <Text style={cf.label}>Số điện thoại</Text>
            <TextInput style={cf.input} value={phone} onChangeText={setPhone}
              placeholder="VD: 0912 345 678" placeholderTextColor="#8892b0" keyboardType="phone-pad" />

            <Text style={cf.label}>Email</Text>
            <TextInput style={cf.input} value={email} onChangeText={setEmail}
              placeholder="VD: email@gmail.com" placeholderTextColor="#8892b0" keyboardType="email-address" autoCapitalize="none" />

            <Text style={cf.label}>Ngày sinh</Text>
            <TouchableOpacity style={cf.dobBtn} onPress={() => setDobPickerOpen(true)}>
              <Text style={[cf.dobBtnText, !dob && cf.dobBtnPlaceholder]}>
                {dob ? `🎂  ${dob}` : '📅  Chọn ngày sinh'}
              </Text>
              <Text style={cf.dobBtnArrow}>›</Text>
            </TouchableOpacity>

            <DatePickerModal
              visible={dobPickerOpen}
              value={dob}
              onConfirm={date => { setDob(date); setDobPickerOpen(false); }}
              onClose={() => setDobPickerOpen(false)}
            />

            {/* ── Nhà thuê ── */}
            <Text style={cf.label}>Nhà thuê</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={cf.pickerRow}>
                {BUILDINGS_ROOMS.map(b => (
                  <TouchableOpacity
                    key={b.name}
                    style={[cf.pickerOpt, building === b.name && cf.pickerOptActive]}
                    onPress={() => { setBuilding(b.name); setRoom(''); }}
                  >
                    <Text style={[cf.pickerText, building === b.name && cf.pickerTextActive]}>
                      🏢 {b.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* ── Phòng thuê ── */}
            {building !== '' && (
              <>
                <Text style={cf.label}>Phòng thuê</Text>
                <View style={cf.roomGrid}>
                  {roomsForBuilding.map(r => (
                    <TouchableOpacity
                      key={r}
                      style={[cf.roomOpt, room === r && cf.roomOptActive]}
                      onPress={() => setRoom(r)}
                    >
                      <Text style={[cf.roomOptText, room === r && cf.roomOptTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* ── Buttons ── */}
            <View style={cf.btnRow}>
              <TouchableOpacity style={cf.cancelBtn} onPress={onClose}>
                <Text style={cf.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[cf.saveBtn, !canSave && cf.saveBtnDim]}
                onPress={handleSave}
              >
                <Text style={cf.saveText}>{isEdit ? 'Cập nhật' : 'Thêm mới'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Customer Detail Modal ────────────────────────────────
function CustomerDetailModal({ customer, onClose, onEdit }) {
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;
  const openedId   = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (customer && customer.id !== openedId.current) {
      openedId.current = customer.id;
      setVisible(true);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 130 }),
        Animated.timing(backdrop,   { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [customer]);

  const handleClose = () => {
    openedId.current = null;
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 300, useNativeDriver: true }),
      Animated.timing(backdrop,   { toValue: 0,        duration: 250, useNativeDriver: true }),
    ]).start(() => { setVisible(false); onClose(); });
  };

  if (!customer && !visible) return null;
  const c = customer;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[dt.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[dt.sheet, { transform: [{ translateY }] }]}>
        <View style={dt.handle} />
        {c && (
          <>
            {/* Header */}
            <View style={dt.header}>
              <AvatarDisplay avatar={c.avatar} size={60} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={dt.name}>{c.name}</Text>
                <View style={dt.badgeRow}>
                  {c.building ? (
                    <View style={dt.buildingBadge}>
                      <Text style={dt.buildingBadgeText}>🏢 {c.building.split(' - ')[0]}</Text>
                    </View>
                  ) : null}
                  {c.room ? (
                    <View style={dt.roomBadge}>
                      <Text style={dt.roomBadgeText}>P{c.room}</Text>
                    </View>
                  ) : null}
                  <View style={[dt.paidBadge, !c.paid && dt.unpaidBadge]}>
                    <Text style={[dt.paidText, !c.paid && dt.unpaidText]}>
                      {c.paid ? '✅ Đã đóng' : '❌ Nợ tiền'}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={dt.closeBtn} onPress={handleClose}>
                <Text style={dt.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={dt.scroll} showsVerticalScrollIndicator={false}>

              {/* Edit button */}
              <TouchableOpacity style={dt.editBtn} onPress={() => { handleClose(); onEdit(c); }}>
                <Text style={dt.editBtnText}>✏️  Chỉnh sửa thông tin</Text>
              </TouchableOpacity>

              {/* Contact info */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>📋 Thông tin cá nhân</Text>
                <View style={dt.card}>
                  <DtRow label="Họ và tên"      value={c.name} />
                  <DtRow label="Số điện thoại"  value={c.phone} />
                  <DtRow label="Email"           value={c.email} />
                  <DtRow label="Ngày sinh"       value={c.dob} accent />
                </View>
              </View>

              {/* Rental info */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>🏠 Thông tin thuê phòng</Text>
                <View style={dt.card}>
                  <DtRow label="Tòa nhà"      value={c.building || '—'} />
                  <DtRow label="Số phòng"     value={c.room    ? `Phòng ${c.room}` : '—'} accent />
                  <DtRow label="Thuê từ ngày" value={c.since   || '—'} />
                  <DtRow label="Tiền thuê/tháng" value={c.amount ? `${c.amount} ₫` : '—'} />
                </View>
              </View>

              {/* ID Card */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>🪪 Căn cước công dân</Text>
                <View style={dt.idCardRow}>
                  <View style={dt.idCardBox}>
                    {c.idFront
                      ? <Image source={{ uri: c.idFront }} style={dt.idCardImg} />
                      : <View style={dt.idCardEmpty}>
                          <Text style={dt.idCardEmptyIcon}>🪪</Text>
                          <Text style={dt.idCardEmptyText}>Chưa có ảnh mặt trước</Text>
                        </View>
                    }
                    <View style={dt.idCardLabel}><Text style={dt.idCardLabelText}>Mặt trước</Text></View>
                  </View>
                  <View style={dt.idCardBox}>
                    {c.idBack
                      ? <Image source={{ uri: c.idBack }} style={dt.idCardImg} />
                      : <View style={dt.idCardEmpty}>
                          <Text style={dt.idCardEmptyIcon}>🪪</Text>
                          <Text style={dt.idCardEmptyText}>Chưa có ảnh mặt sau</Text>
                        </View>
                    }
                    <View style={dt.idCardLabel}><Text style={dt.idCardLabelText}>Mặt sau</Text></View>
                  </View>
                </View>
              </View>

              <View style={{ height: 40 }} />
            </ScrollView>
          </>
        )}
      </Animated.View>
    </Modal>
  );
}

function DtRow({ label, value, accent }) {
  return (
    <View style={dt.row}>
      <Text style={dt.rowLabel}>{label}</Text>
      <Text style={[dt.rowValue, accent && { color: '#4facfe' }]} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function CustomersScreen() {
  const [customers,       setCustomers]       = useState(INIT_CUSTOMERS);
  const [search,          setSearch]          = useState('');
  const [activeFilter,    setActiveFilter]    = useState('Tất cả');
  const [formVisible,     setFormVisible]     = useState(false);
  const [editCustomer,    setEditCustomer]    = useState(null);
  const [detailCustomer,  setDetailCustomer]  = useState(null);

  const filtered = customers
    .filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q
        || c.name.toLowerCase().includes(q)
        || c.phone.includes(q)
        || (c.room && c.room.toLowerCase().includes(q))
        || (c.email && c.email.toLowerCase().includes(q));
      const matchFilter = activeFilter === 'Tất cả'
        || (activeFilter === 'Đã thanh toán'  && c.paid)
        || (activeFilter === 'Chưa thanh toán' && !c.paid);
      return matchSearch && matchFilter;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const handleSave = data => {
    if (editCustomer) {
      setCustomers(prev => prev.map(c => c.id === data.id ? data : c));
    } else {
      setCustomers(prev => [...prev, data]);
    }
    setFormVisible(false);
    setEditCustomer(null);
  };

  const openAdd  = () => { setEditCustomer(null); setFormVisible(true); };
  const openEdit = c   => { setEditCustomer(c);   setFormVisible(true); };

  const totalPaid   = customers.filter(c => c.paid).length;
  const totalUnpaid = customers.filter(c => !c.paid).length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <CustomerFormModal
        visible={formVisible}
        initial={editCustomer}
        onSave={handleSave}
        onClose={() => { setFormVisible(false); setEditCustomer(null); }}
      />

      <CustomerDetailModal
        customer={detailCustomer}
        onClose={() => setDetailCustomer(null)}
        onEdit={c => { setDetailCustomer(null); openEdit(c); }}
      />

      <View style={s.container}>
        {/* Header */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.header}>
          <View>
            <Text style={s.title}>Khách hàng</Text>
            <Text style={s.subtitle}>23/04/2026 · {customers.length} khách đang thuê</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={openAdd}>
            <Text style={s.addBtnText}>＋ Thêm mới</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Summary strip */}
        <View style={s.summaryStrip}>
          <View style={s.sumItem}>
            <Text style={s.sumNum}>{customers.length}</Text>
            <Text style={s.sumLbl}>Tổng khách</Text>
          </View>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('Đã thanh toán')}>
            <Text style={[s.sumNum, { color: '#2ecc71' }]}>{totalPaid}</Text>
            <Text style={s.sumLbl}>Đã đóng tiền</Text>
          </TouchableOpacity>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('Chưa thanh toán')}>
            <Text style={[s.sumNum, { color: '#e94560' }]}>{totalUnpaid}</Text>
            <Text style={s.sumLbl}>Chưa đóng</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Tìm tên, SĐT, email, phòng..."
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

        {/* Filter */}
        <View style={s.filterRow}>
          {['Tất cả', 'Đã thanh toán', 'Chưa thanh toán'].map(f => (
            <TouchableOpacity
              key={f}
              style={[s.filterBtn, activeFilter === f && s.filterActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[s.filterText, activeFilter === f && s.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>Không tìm thấy khách hàng nào</Text>
            </View>
          }
          renderItem={({ item: c }) => (
            <TouchableOpacity style={s.card} onPress={() => setDetailCustomer(c)} activeOpacity={0.8}>
              <AvatarDisplay avatar={c.avatar} size={50} />
              <View style={s.cardInfo}>
                <Text style={s.cardName}>{c.name}</Text>
                <Text style={s.cardPhone}>{c.phone}</Text>
                <View style={s.cardMeta}>
                  {c.building ? (
                    <View style={s.buildingBadge}>
                      <Text style={s.buildingBadgeText}>{c.building.split(' - ')[0]}</Text>
                    </View>
                  ) : null}
                  {c.room ? (
                    <View style={s.roomBadge}>
                      <Text style={s.roomBadgeText}>P{c.room}</Text>
                    </View>
                  ) : null}
                  {c.since ? <Text style={s.since}>Từ {c.since}</Text> : null}
                </View>
              </View>
              <View style={s.cardRight}>
                <View style={[s.paidBadge, !c.paid && s.unpaidBadge]}>
                  <Text style={[s.paidText, !c.paid && s.unpaidText]}>
                    {c.paid ? '✅ Đã đóng' : '❌ Chưa đóng'}
                  </Text>
                </View>
                <Text style={s.amount}>{c.amount} ₫</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Customer Form styles ─────────────────────────────────
const cf = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:    { backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48 },
  handle:   { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:    { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  label:    { color: '#8892b0', fontSize: 11, fontWeight: '700', marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:    { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },

  // Avatar
  avatarRow:      { flexDirection: 'row', gap: 10 },
  avatarOpt:      { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)' },
  avatarOptActive:{ borderColor: '#4facfe', backgroundColor: 'rgba(79,172,254,0.1)' },
  avatarOptIcon:  { fontSize: 28, marginBottom: 4 },
  avatarOptLabel: { color: '#8892b0', fontSize: 12, fontWeight: '700' },
  avatarCustomImg:{ width: 36, height: 36, borderRadius: 18, marginBottom: 4 },

  // ID Card
  idRow:        { flexDirection: 'column', gap: 12 },
  idBox:        { width: '100%', height: 140, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)', overflow: 'hidden' },
  idImg:        { width: '100%', height: '100%' },
  idLabel:      { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 5, alignItems: 'center' },
  idLabelText:  { color: '#fff', fontSize: 11, fontWeight: '700' },
  idChangeBtn:  { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(79,172,254,0.75)', paddingVertical: 7, alignItems: 'center' },
  idChangeBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  idEmpty:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  idEmptyText:  { color: '#ccd6f6', fontSize: 13, fontWeight: '700' },
  idBtnRow:     { flexDirection: 'row', gap: 10, width: '100%' },
  idPickBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  idPickIcon:   { fontSize: 18 },
  idPickText:   { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },

  // DOB button
  dobBtn:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 14 },
  dobBtnText:        { color: '#fff', fontSize: 14 },
  dobBtnPlaceholder: { color: '#8892b0' },
  dobBtnArrow:       { color: '#4facfe', fontSize: 18, fontWeight: '700' },

  // Building/Room picker
  pickerRow:       { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  pickerOpt:       { borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 14, paddingVertical: 9 },
  pickerOptActive: { backgroundColor: 'rgba(79,172,254,0.15)', borderColor: 'rgba(79,172,254,0.5)' },
  pickerText:      { color: '#8892b0', fontSize: 13 },
  pickerTextActive:{ color: '#4facfe', fontWeight: '700' },
  roomGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  roomOpt:         { borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 12, paddingVertical: 7 },
  roomOptActive:   { backgroundColor: 'rgba(46,204,113,0.15)', borderColor: 'rgba(46,204,113,0.45)' },
  roomOptText:     { color: '#8892b0', fontSize: 13, fontWeight: '600' },
  roomOptTextActive:{ color: '#2ecc71', fontWeight: '700' },

  // Buttons
  btnRow:    { flexDirection: 'row', gap: 10, marginTop: 24 },
  cancelBtn: { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelText:{ color: '#8892b0', fontWeight: '700', fontSize: 14 },
  saveBtn:   { flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#e94560' },
  saveBtnDim:{ opacity: 0.4 },
  saveText:  { color: '#fff', fontWeight: '800', fontSize: 14 },
});

// ─── Detail Modal styles ──────────────────────────────────
const dt = StyleSheet.create({
  backdrop:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet:        { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', paddingTop: 12 },
  handle:       { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  name:         { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  badgeRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  buildingBadge:{ backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  buildingBadgeText: { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  roomBadge:    { backgroundColor: 'rgba(46,204,113,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  roomBadgeText:{ color: '#2ecc71', fontSize: 11, fontWeight: '700' },
  paidBadge:    { backgroundColor: 'rgba(46,204,113,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  unpaidBadge:  { backgroundColor: 'rgba(233,69,96,0.15)' },
  paidText:     { color: '#2ecc71', fontSize: 11, fontWeight: '700' },
  unpaidText:   { color: '#e94560' },
  closeBtn:     { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  closeBtnText: { color: '#8892b0', fontSize: 14 },
  scroll:       { paddingHorizontal: 20 },
  editBtn:      { marginTop: 14, backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(79,172,254,0.28)' },
  editBtnText:  { color: '#4facfe', fontWeight: '700', fontSize: 13 },
  section:      { marginTop: 20 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 10 },
  card:         { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  row:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel:     { color: '#8892b0', fontSize: 13, flex: 1 },
  rowValue:     { color: '#ccd6f6', fontSize: 13, fontWeight: '600', flex: 2, textAlign: 'right' },
  idCardRow:    { flexDirection: 'column', gap: 12 },
  idCardBox:    { width: '100%', height: 140, borderRadius: 12, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  idCardImg:    { width: '100%', height: '100%' },
  idCardEmpty:  { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 4 },
  idCardEmptyIcon: { fontSize: 24 },
  idCardEmptyText: { color: '#8892b0', fontSize: 11, textAlign: 'center', paddingHorizontal: 8 },
  idCardLabel:  { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 4, alignItems: 'center' },
  idCardLabelText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});

// ─── Screen styles ────────────────────────────────────────
const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },

  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 30, paddingBottom: 20 },
  title:    { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#8892b0', fontSize: 13, marginTop: 4 },
  addBtn:   { backgroundColor: 'rgba(233,69,96,0.85)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: 'rgba(233,69,96,0.5)' },
  addBtnText:{ color: '#fff', fontWeight: '800', fontSize: 13 },

  summaryStrip: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 4 },
  sumItem:  { flex: 1, alignItems: 'center' },
  sumNum:   { color: '#fff', fontSize: 22, fontWeight: '900' },
  sumLbl:   { color: '#8892b0', fontSize: 10, marginTop: 2, fontWeight: '600', textAlign: 'center' },
  sumDiv:   { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },

  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', margin: 16, marginBottom: 10, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12, fontSize: 14 },

  filterRow:   { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  filterBtn:   { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterActive:{ backgroundColor: '#e94560', borderColor: '#e94560' },
  filterText:  { color: '#8892b0', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#fff' },

  list:  { padding: 16, paddingTop: 6 },
  emptyWrap: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#8892b0', fontSize: 14 },

  // Customer card
  card:        { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 12 },
  cardInfo:    { flex: 1 },
  cardName:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardPhone:   { color: '#8892b0', fontSize: 12, marginTop: 2 },
  cardMeta:    { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6, flexWrap: 'wrap' },
  buildingBadge:     { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  buildingBadgeText: { color: '#4facfe', fontSize: 10, fontWeight: '700' },
  roomBadge:         { backgroundColor: 'rgba(46,204,113,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  roomBadgeText:     { color: '#2ecc71', fontSize: 10, fontWeight: '700' },
  since:       { color: '#8892b0', fontSize: 11 },
  cardRight:   { alignItems: 'flex-end', gap: 4 },
  paidBadge:   { backgroundColor: 'rgba(46,204,113,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  unpaidBadge: { backgroundColor: 'rgba(233,69,96,0.15)' },
  paidText:    { color: '#2ecc71', fontSize: 11, fontWeight: '600' },
  unpaidText:  { color: '#e94560' },
  amount:      { color: '#4facfe', fontSize: 12, fontWeight: '700' },
});

// ─── Date Picker styles ───────────────────────────────────
const dp = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle:      { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  title:       { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 16 },

  navRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  navBtn:      { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.07)' },
  navArrow:    { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 28 },
  navLabel:    { flex: 1, textAlign: 'center', color: '#fff', fontSize: 16, fontWeight: '700' },

  yearRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 16 },
  yearBtn:     { backgroundColor: 'rgba(79,172,254,0.12)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(79,172,254,0.25)' },
  yearArrow:   { color: '#4facfe', fontSize: 15, fontWeight: '800' },
  yearLabel:   { color: '#4facfe', fontSize: 18, fontWeight: '900', minWidth: 56, textAlign: 'center' },

  dowRow:      { flexDirection: 'row', marginBottom: 4 },
  dowCell:     { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dowText:     { color: '#8892b0', fontSize: 12, fontWeight: '700' },

  grid:        { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  cell:        { width: '14.285714%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  cellSelected:{ backgroundColor: '#e94560' },
  cellText:    { color: '#ccd6f6', fontSize: 14 },
  cellTextSelected: { color: '#fff', fontWeight: '800' },

  selectedBox:      { backgroundColor: 'rgba(233,69,96,0.08)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(233,69,96,0.2)' },
  selectedText:     { color: '#e94560', fontSize: 14, fontWeight: '700' },
  selectedPlaceholder: { color: '#8892b0', fontSize: 13 },

  btnRow:      { flexDirection: 'row', gap: 10 },
  cancelBtn:   { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelText:  { color: '#8892b0', fontWeight: '700', fontSize: 14 },
  confirmBtn:  { flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#e94560' },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
