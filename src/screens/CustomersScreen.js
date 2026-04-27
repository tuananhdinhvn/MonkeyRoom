import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useBuildings } from '../context/BuildingsContext';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Modal, Animated, ScrollView, Alert, Image,
  Dimensions, StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const SCREEN_H = Dimensions.get('window').height;


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

const FORMER_CUSTOMERS = [
  // ── Khách cũ────
  {
    id: 'f1', name: 'Nguyễn Thị Hương', phone: '0912 111 333', email: 'huong.nguyen@gmail.com',
    dob: '15/03/1990', building: 'Nhà A - Green Home', room: '102', since: '01/06/2024',
    paid: true, amount: '3,500,000', avatar: { type: 'female' }, idFront: null, idBack: null,
    isFormer: true, moveOutDate: '31/03/2026', moveOutReason: 'Hết hợp đồng',
    daysUntilDue: 0, hasRequest: false, hasMoveout: false, hasUrgent: false,
    paymentHistory: [
      { month: '03/2026', amount: '3,500,000', date: '03/03/2026', method: 'Chuyển khoản' },
      { month: '02/2026', amount: '3,500,000', date: '05/02/2026', method: 'Chuyển khoản' },
      { month: '01/2026', amount: '3,500,000', date: '04/01/2026', method: 'Chuyển khoản' },
      { month: '12/2025', amount: '3,500,000', date: '02/12/2025', method: 'Tiền mặt'     },
      { month: '11/2025', amount: '3,500,000', date: '03/11/2025', method: 'Chuyển khoản' },
    ],
    incidentHistory: [
      { issue: 'Vòi sen bị hỏng', resolvedBy: 'Thợ Minh Tú', resolvedAt: '10:00 20/01/2026' },
    ],
    rentalHistory: [
      { room: '204', building: 'Nhà A - Green Home', from: '01/01/2024', to: '31/05/2024' },
    ],
  },
  {
    id: 'f2', name: 'Đặng Minh Khoa', phone: '0966 444 555', email: 'khoa.dang@gmail.com',
    dob: '22/08/1993', building: 'Nhà B - Blue Sky', room: 'B102', since: '01/09/2025',
    paid: true, amount: '4,200,000', avatar: { type: 'male' }, idFront: null, idBack: null,
    isFormer: true, moveOutDate: '28/02/2026', moveOutReason: 'Chuyển công tác',
    daysUntilDue: 0, hasRequest: false, hasMoveout: false, hasUrgent: false,
    paymentHistory: [
      { month: '02/2026', amount: '4,200,000', date: '05/02/2026', method: 'Chuyển khoản' },
      { month: '01/2026', amount: '4,200,000', date: '06/01/2026', method: 'Chuyển khoản' },
      { month: '12/2025', amount: '4,200,000', date: '04/12/2025', method: 'Tiền mặt'     },
    ],
    incidentHistory: [],
    rentalHistory: [],
  },
  {
    id: 'f3', name: 'Lưu Thị Ngân', phone: '0933 777 888', email: 'ngan.luu@gmail.com',
    dob: '08/11/1995', building: 'Nhà C - Sunrise', room: 'C103', since: '01/04/2025',
    paid: true, amount: '5,000,000', avatar: { type: 'female' }, idFront: null, idBack: null,
    isFormer: true, moveOutDate: '31/01/2026', moveOutReason: 'Mua nhà riêng',
    daysUntilDue: 0, hasRequest: false, hasMoveout: false, hasUrgent: false,
    paymentHistory: [
      { month: '01/2026', amount: '5,000,000', date: '03/01/2026', method: 'Chuyển khoản' },
      { month: '12/2025', amount: '5,000,000', date: '02/12/2025', method: 'Chuyển khoản' },
      { month: '11/2025', amount: '5,000,000', date: '04/11/2025', method: 'Chuyển khoản' },
      { month: '10/2025', amount: '5,000,000', date: '03/10/2025', method: 'Tiền mặt'     },
    ],
    incidentHistory: [
      { issue: 'Điều hòa bị rỉ nước',      resolvedBy: 'Thợ Tấn Phát',   resolvedAt: '09:00 15/12/2025' },
      { issue: 'Ổ cắm điện không có điện', resolvedBy: 'Thợ điện Hải Đăng', resolvedAt: '14:00 01/11/2025' },
    ],
    rentalHistory: [
      { room: '303', building: 'Nhà A - Green Home', from: '01/10/2024', to: '31/03/2025' },
      { room: '202', building: 'Nhà A - Green Home', from: '01/05/2024', to: '30/09/2024' },
    ],
  },
  {
    id: 'f4', name: 'Vương Tuấn Kiệt', phone: '0901 222 333', email: 'kiet.vuong@gmail.com',
    dob: '05/07/1988', building: 'Nhà A - Green Home', room: '203', since: '01/07/2025',
    paid: true, amount: '6,000,000', avatar: { type: 'male' }, idFront: null, idBack: null,
    isFormer: true, moveOutDate: '15/03/2026', moveOutReason: 'Hết hợp đồng',
    daysUntilDue: 0, hasRequest: false, hasMoveout: false, hasUrgent: false,
    paymentHistory: [
      { month: '03/2026', amount: '6,000,000', date: '05/03/2026', method: 'Chuyển khoản' },
      { month: '02/2026', amount: '6,000,000', date: '06/02/2026', method: 'Chuyển khoản' },
      { month: '01/2026', amount: '6,000,000', date: '07/01/2026', method: 'Chuyển khoản' },
    ],
    incidentHistory: [
      { issue: 'Cánh cửa bị bật bản lề', resolvedBy: 'Nguyễn Văn Bình', resolvedAt: '11:00 20/02/2026' },
    ],
    rentalHistory: [],
  },
  {
    id: 'f5', name: 'Hoàng Thị Yến', phone: '0972 111 222', email: 'yen.hoang@gmail.com',
    dob: '25/04/1992', building: 'Nhà C - Sunrise', room: 'C202', since: '01/05/2025',
    paid: true, amount: '5,000,000', avatar: { type: 'female' }, idFront: null, idBack: null,
    isFormer: true, moveOutDate: '30/04/2026', moveOutReason: 'Chuyển về quê',
    daysUntilDue: 0, hasRequest: false, hasMoveout: false, hasUrgent: false,
    paymentHistory: [
      { month: '04/2026', amount: '5,000,000', date: '02/04/2026', method: 'Chuyển khoản' },
      { month: '03/2026', amount: '5,000,000', date: '03/03/2026', method: 'Chuyển khoản' },
      { month: '02/2026', amount: '5,000,000', date: '04/02/2026', method: 'Chuyển khoản' },
      { month: '01/2026', amount: '5,000,000', date: '05/01/2026', method: 'Tiền mặt'     },
      { month: '12/2025', amount: '5,000,000', date: '04/12/2025', method: 'Chuyển khoản' },
    ],
    incidentHistory: [
      { issue: 'Cửa phòng bị hỏng khoá',  resolvedBy: 'Nguyễn Văn Bình', resolvedAt: '09:00 15/01/2026' },
      { issue: 'Bồn rửa tay bị nghẹt',    resolvedBy: 'Thợ Minh Tú',     resolvedAt: '14:00 10/12/2025' },
    ],
    rentalHistory: [
      { room: 'B103', building: 'Nhà B - Blue Sky',  from: '01/10/2024', to: '30/04/2025' },
      { room: '104',  building: 'Nhà A - Green Home', from: '01/03/2024', to: '30/09/2024' },
    ],
  },
  {
    id: 'f6', name: 'Nguyễn Quốc Hùng', phone: '0903 333 444', email: 'hung.nguyen@gmail.com',
    dob: '16/07/1989', building: 'Nhà A - Green Home', room: '303', since: '01/02/2025',
    paid: true, amount: '3,500,000', avatar: { type: 'male' }, idFront: null, idBack: null,
    isFormer: true, moveOutDate: '31/01/2026', moveOutReason: 'Hết hợp đồng',
    daysUntilDue: 0, hasRequest: false, hasMoveout: false, hasUrgent: false,
    paymentHistory: [
      { month: '01/2026', amount: '3,500,000', date: '04/01/2026', method: 'Chuyển khoản' },
      { month: '12/2025', amount: '3,500,000', date: '03/12/2025', method: 'Chuyển khoản' },
      { month: '11/2025', amount: '3,500,000', date: '04/11/2025', method: 'Tiền mặt'     },
    ],
    incidentHistory: [],
    rentalHistory: [],
  },
  {
    id: 'f7', name: 'Mai Anh Tuấn', phone: '0948 555 666', email: 'tuan.mai@gmail.com',
    dob: '03/12/1991', building: 'Nhà B - Blue Sky', room: 'B202', since: '01/06/2025',
    paid: true, amount: '4,200,000', avatar: { type: 'male' }, idFront: null, idBack: null,
    isFormer: true, moveOutDate: '28/03/2026', moveOutReason: 'Chuyển công ty',
    daysUntilDue: 0, hasRequest: false, hasMoveout: false, hasUrgent: false,
    paymentHistory: [
      { month: '03/2026', amount: '4,200,000', date: '06/03/2026', method: 'Chuyển khoản' },
      { month: '02/2026', amount: '4,200,000', date: '07/02/2026', method: 'Chuyển khoản' },
      { month: '01/2026', amount: '4,200,000', date: '08/01/2026', method: 'Chuyển khoản' },
      { month: '12/2025', amount: '4,200,000', date: '05/12/2025', method: 'Tiền mặt'     },
    ],
    incidentHistory: [
      { issue: 'Điều hòa bị hỏng compressor', resolvedBy: 'Thợ điện Hải Đăng', resolvedAt: '10:00 20/01/2026' },
    ],
    rentalHistory: [
      { room: '204', building: 'Nhà A - Green Home', from: '01/01/2025', to: '31/05/2025' },
    ],
  },
];

// ─── Building & Status helpers ────────────────────────────
const BUILDING_CODES = {
  'Nhà A - Green Home':  'GHA',
  'Nhà B - Blue Sky':    'BLS',
  'Nhà C - Sunrise':     'SRH',
  'Nhà D - Ocean View':  'OVD',
};

function getRoomCode(building, room) {
  const code = BUILDING_CODES[building] || 'UNK';
  const num  = room ? room.replace(/^[A-Za-z](?=\d)/, '') : '—';
  return `${code}-${num}`;
}

const STATUS_CFG = {
  ok:      { icon: '✅', color: '#2ecc71', label: 'Bình thường' },
  warning: { icon: '⚠️', color: '#f1c40f', label: 'Sự cố'       },
};

function getCustomerStatus(c) {
  return c.status || 'ok';
}

function getCustomerId(phone) {
  return `C-${(phone || '').replace(/\D/g, '')}`;
}

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
            {(() => {
              const isFormer  = c.isFormer === true;
              const statusKey = isFormer ? null : getCustomerStatus(c);
              const stCfg     = statusKey ? STATUS_CFG[statusKey] : null;
              const roomCode  = (c.building && c.room) ? getRoomCode(c.building, c.room) : '—';
              return (
                <View style={dt.header}>
                  <AvatarDisplay avatar={c.avatar} size={60} />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={dt.name}>{c.name}</Text>
                    <View style={dt.badgeRow}>
                      {roomCode !== '—' && (
                        <View style={[dt.roomCodeBadge, isFormer && dt.roomCodeBadgeFormer]}>
                          <Text style={[dt.roomCodeText, isFormer && dt.roomCodeTextFormer]}>🏠 {roomCode}</Text>
                        </View>
                      )}
                      {isFormer ? (
                        <View style={dt.formerBadge}>
                          <Text style={dt.formerBadgeText}>🚪 Đã rời · {c.moveOutDate}</Text>
                        </View>
                      ) : (
                        <View style={[dt.statusBadge, { backgroundColor: `${stCfg.color}22`, borderColor: `${stCfg.color}55` }]}>
                          <Text style={[dt.statusText, { color: stCfg.color }]}>
                            {stCfg.icon} {stCfg.label}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity style={dt.closeBtn} onPress={handleClose}>
                    <Text style={dt.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}

            {/* Action buttons — always visible above scroll */}
            <View style={dt.actionRow}>
              <TouchableOpacity
                style={[dt.callBtn, { flex: 1 }]}
                onPress={() => c.phone && Linking.openURL(`tel:${c.phone.replace(/\D/g, '')}`)}
              >
                <Text style={dt.callBtnText}>📞  Gọi điện</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={dt.scroll} showsVerticalScrollIndicator={false}>

              {/* Personal info */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>📋 Thông tin cá nhân</Text>
                <View style={dt.card}>
                  <DtRow label="Mã khách hàng"  value={getCustomerId(c.phone)} accent />
                  <DtRow label="Họ và tên"       value={c.name} />
                  <DtRow label="Số điện thoại"   value={c.phone} />
                  <DtRow label="Email"            value={c.email} />
                  <DtRow label="Ngày sinh"        value={c.dob} />
                </View>
              </View>

              {/* CCCD — moved below personal info */}
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

              {/* Rental info */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>🏠 Thông tin thuê phòng</Text>
                <View style={dt.card}>
                  <DtRow label="Mã phòng"        value={(c.building && c.room) ? getRoomCode(c.building, c.room) : '—'} accent />
                  <DtRow label="Tòa nhà"         value={c.building || '—'} />
                  <DtRow label="Thuê từ ngày"    value={c.since    || '—'} />
                  <DtRow label="Tiền thuê/tháng" value={c.amount   ? `${c.amount} ₫` : '—'} />
                  {c.hasMoveout && (
                    <View style={dt.row}>
                      <Text style={dt.rowLabel}>Yêu cầu</Text>
                      <Text style={[dt.rowValue, { color: '#f1c40f', fontWeight: '700' }]}>
                        🚚 Đăng ký chuyển đi
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Payment history */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>💳 Lịch sử thanh toán</Text>
                {(!c.paymentHistory || c.paymentHistory.length === 0) ? (
                  <View style={dt.emptyBox}>
                    <Text style={dt.emptyText}>Chưa có lịch sử thanh toán</Text>
                  </View>
                ) : (
                  <View style={dt.historyTable}>
                    <View style={dt.historyHeader}>
                      <Text style={[dt.historyCell, dt.historyCellHead, { flex: 1.2 }]}>Tháng</Text>
                      <Text style={[dt.historyCell, dt.historyCellHead, { flex: 1.6 }]}>Số tiền</Text>
                      <Text style={[dt.historyCell, dt.historyCellHead, { flex: 1.4 }]}>Ngày đóng</Text>
                      <Text style={[dt.historyCell, dt.historyCellHead, { flex: 1.4 }]}>Hình thức</Text>
                    </View>
                    {c.paymentHistory.map((p, i) => (
                      <View key={i} style={[dt.historyRow, i % 2 === 0 && dt.historyRowAlt]}>
                        <Text style={[dt.historyCell, { flex: 1.2 }]}>{p.month}</Text>
                        <Text style={[dt.historyCell, { flex: 1.6, color: '#2ecc71', fontWeight: '700' }]}>{p.amount} ₫</Text>
                        <Text style={[dt.historyCell, { flex: 1.4 }]}>{p.date}</Text>
                        <Text style={[dt.historyCell, { flex: 1.4 }]}>{p.method}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Incident history */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>🔧 Lịch sử giải quyết sự cố</Text>
                {(!c.incidentHistory || c.incidentHistory.length === 0) ? (
                  <View style={dt.emptyBox}>
                    <Text style={dt.emptyText}>Chưa có sự cố nào được ghi nhận</Text>
                  </View>
                ) : (
                  c.incidentHistory.map((inc, i) => (
                    <View key={i} style={dt.incidentRow}>
                      <View style={dt.incidentLeft}>
                        <Text style={dt.incidentIssue}>{inc.issue}</Text>
                        <Text style={dt.incidentBy}>👤 Xử lý: {inc.resolvedBy}</Text>
                      </View>
                      <Text style={dt.incidentTime}>{inc.resolvedAt}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Rental history */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>🏘️ Lịch sử thuê phòng</Text>
                {/* Current / last room */}
                {c.building && c.room && (
                  <View style={dt.rentalItem}>
                    <View style={dt.rentalInfo}>
                      <Text style={dt.rentalRoomCode}>{getRoomCode(c.building, c.room)}</Text>
                      <Text style={dt.rentalBuilding}>{c.building}</Text>
                      <Text style={dt.rentalDate}>
                        {c.isFormer ? `${c.since} → ${c.moveOutDate}` : `Từ ${c.since}`}
                      </Text>
                      {c.isFormer && c.moveOutReason && (
                        <Text style={dt.rentalNote}>Lý do: {c.moveOutReason}</Text>
                      )}
                    </View>
                    <View style={[dt.rentalBadge, c.isFormer ? dt.rentalBadgeLast : dt.rentalBadgeCurrent]}>
                      <Text style={dt.rentalBadgeText}>{c.isFormer ? 'Phòng cuối' : 'Đang ở'}</Text>
                    </View>
                  </View>
                )}
                {/* Past rooms */}
                {c.rentalHistory && c.rentalHistory.length > 0
                  ? c.rentalHistory.map((r, i) => (
                      <View key={i} style={dt.rentalItem}>
                        <View style={dt.rentalInfo}>
                          <Text style={dt.rentalRoomCode}>{getRoomCode(r.building, r.room)}</Text>
                          <Text style={dt.rentalBuilding}>{r.building}</Text>
                          <Text style={dt.rentalDate}>{r.from} → {r.to}</Text>
                        </View>
                        <View style={[dt.rentalBadge, dt.rentalBadgePast]}>
                          <Text style={dt.rentalBadgeText}>Đã ở</Text>
                        </View>
                      </View>
                    ))
                  : (!c.building && !c.room) && (
                      <View style={dt.emptyBox}>
                        <Text style={dt.emptyText}>Chưa có lịch sử thuê phòng</Text>
                      </View>
                    )
                }
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
  const { buildings } = useBuildings();
  const [search,         setSearch]         = useState('');
  const [activeFilter,   setActiveFilter]   = useState('Tất cả');
  const [detailCustomer, setDetailCustomer] = useState(null);

  // Derive current tenants from live buildings data
  const activeTenants = useMemo(() => {
    const tenants = [];
    buildings.forEach(b => {
      b.floors.forEach(f => {
        f.rooms.forEach(r => {
          if (!r.tenant) return;
          const hasPending = (r.messages || []).some(m => !m.resolved);
          const isIssue = r.status === 'maintenance' || r.status === 'urgent' ||
            (r.status === 'occupied' && hasPending);
          tenants.push({
            id: `${b.id}-${r.id}`,
            name: r.tenant,
            phone: r.phone || '',
            building: b.name,
            room: r.id,
            since: r.sinceDate || '',
            status: isIssue ? 'warning' : 'ok',
            avatar: { type: 'male' },
            idFront: r.cccdImages?.[0] || null,
            idBack:  r.cccdImages?.[1] || null,
            paymentHistory: (r.paymentHistory || []).map(p => ({
              month:  p.month,
              amount: r.price,
              date:   '—',
              method: p.paid ? 'Đã thanh toán' : 'Chưa thanh toán',
            })),
            incidentHistory: (r.messages || [])
              .filter(m => m.resolved)
              .map(m => ({ issue: m.text, resolvedBy: m.resolvedBy || '—', resolvedAt: m.time })),
            email: '', dob: '', isFormer: false,
            hasRequest: false, hasMoveout: false, hasUrgent: false,
          });
        });
      });
    });
    return tenants;
  }, [buildings]);

  const formerCustomers = FORMER_CUSTOMERS;

  const byName = (a, b) => a.name.localeCompare(b.name, 'vi');
  const matchSearch = c => {
    const q = search.toLowerCase();
    const fullCode = (c.building && c.room)
      ? getRoomCode(c.building, c.room).toLowerCase() : '';
    return !q
      || c.name.toLowerCase().includes(q)
      || (c.phone && c.phone.includes(q))
      || (c.room  && c.room.toLowerCase().includes(q))
      || (fullCode && fullCode.includes(q))
      || (c.email && c.email.toLowerCase().includes(q));
  };

  const STATUS_FILTER = { 'Tốt': 'ok', 'Sự cố': 'warning' };

  const filteredActive = activeTenants
    .filter(c => {
      if (!matchSearch(c)) return false;
      const sf = STATUS_FILTER[activeFilter];
      return !sf || c.status === sf;
    })
    .sort(byName);

  const filteredFormer = formerCustomers.filter(matchSearch).sort(byName);

  const listData = activeFilter === 'Khách cũ'
    ? filteredFormer
    : activeFilter === 'Tất cả'
      ? (filteredFormer.length > 0
          ? [...filteredActive, { id: '__div', isDivider: true }, ...filteredFormer]
          : filteredActive)
      : filteredActive;

  const totalOk      = activeTenants.filter(c => c.status === 'ok').length;
  const totalWarning = activeTenants.filter(c => c.status === 'warning').length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <CustomerDetailModal
        customer={detailCustomer}
        onClose={() => setDetailCustomer(null)}
        onEdit={() => {}}
      />

      <View style={s.container}>
        {/* Header */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.header}>
          <View>
            <Text style={s.title}>Khách hàng</Text>
            <Text style={s.subtitle}>{activeTenants.length} đang thuê · {formerCustomers.length} khách cũ</Text>
          </View>
        </LinearGradient>

        {/* Summary strip */}
        <View style={s.summaryStrip}>
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('Tất cả')}>
            <Text style={s.sumNum}>{activeTenants.length}</Text>
            <Text style={s.sumLbl}>Khách</Text>
          </TouchableOpacity>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('Tốt')}>
            <Text style={[s.sumNum, { color: '#2ecc71' }]}>{totalOk}</Text>
            <Text style={s.sumLbl}>Tốt</Text>
          </TouchableOpacity>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('Sự cố')}>
            <Text style={[s.sumNum, { color: '#f1c40f' }]}>{totalWarning}</Text>
            <Text style={s.sumLbl}>Sự cố</Text>
          </TouchableOpacity>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('Khách cũ')}>
            <Text style={[s.sumNum, { color: '#8892b0' }]}>{formerCustomers.length}</Text>
            <Text style={s.sumLbl}>Khách cũ</Text>
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

        {/* List */}
        <FlatList
          data={listData}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>Không tìm thấy khách hàng nào</Text>
            </View>
          }
          renderItem={({ item: c }) => {
            if (c.isDivider) {
              return (
                <View style={s.listDivider}>
                  <View style={s.listDividerLine} />
                  <Text style={s.listDividerText}>── Khách cũ ──</Text>
                  <View style={s.listDividerLine} />
                </View>
              );
            }
            const isFormer  = c.isFormer === true;
            const statusKey = isFormer ? null : getCustomerStatus(c);
            const stCfg     = statusKey ? STATUS_CFG[statusKey] : null;
            const roomCode  = (c.building && c.room) ? getRoomCode(c.building, c.room) : '—';
            return (
              <TouchableOpacity
                style={[s.card, isFormer && s.cardFormer]}
                onPress={() => setDetailCustomer(c)}
                activeOpacity={0.8}
              >
                <AvatarDisplay avatar={c.avatar} size={50} />
                <View style={s.cardInfo}>
                  <Text style={[s.cardName, isFormer && s.cardNameFormer]}>{c.name}</Text>
                  <Text style={s.cardPhone}>{c.phone}</Text>
                  <View style={s.cardMeta}>
                    {roomCode !== '—' && (
                      <View style={[s.roomCodeBadge, isFormer && s.roomCodeBadgeFormer]}>
                        <Text style={[s.roomCodeText, isFormer && s.roomCodeTextFormer]}>{roomCode}</Text>
                      </View>
                    )}
                    {isFormer
                      ? <Text style={s.moveOutDate}>Rời: {c.moveOutDate}</Text>
                      : c.since ? <Text style={s.since}>Từ {c.since}</Text> : null
                    }
                  </View>
                </View>
                <View style={s.cardRight}>
                  {isFormer
                    ? <Text style={s.formerIcon}>🏠</Text>
                    : <Text style={[s.statusIcon, { color: stCfg.color }]}>{stCfg.icon}</Text>
                  }
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

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
  actionRow:    { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  callBtn:      { flex: 1, backgroundColor: 'rgba(46,204,113,0.12)', borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)' },
  callBtnText:  { color: '#2ecc71', fontWeight: '700', fontSize: 13 },
  editBtn:      { flex: 1, backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(79,172,254,0.28)' },
  editBtnText:  { color: '#4facfe', fontWeight: '700', fontSize: 13 },
  scroll:       { paddingHorizontal: 20 },
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

  // Room code & status badges (new)
  roomCodeBadge:       { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)' },
  roomCodeText:        { color: '#4facfe', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  roomCodeBadgeFormer: { backgroundColor: 'rgba(136,146,176,0.12)', borderColor: 'rgba(136,146,176,0.25)' },
  roomCodeTextFormer:  { color: '#8892b0' },
  statusBadge:   { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusText:    { fontSize: 12, fontWeight: '700' },
  formerBadge:   { backgroundColor: 'rgba(136,146,176,0.12)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(136,146,176,0.25)' },
  formerBadgeText: { color: '#8892b0', fontSize: 12, fontWeight: '700' },

  // Rental history section
  rentalItem:         { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 12 },
  rentalBadge:        { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, minWidth: 72, alignItems: 'center', borderWidth: 1 },
  rentalBadgeCurrent: { backgroundColor: 'rgba(46,204,113,0.15)', borderColor: 'rgba(46,204,113,0.35)' },
  rentalBadgeLast:    { backgroundColor: 'rgba(136,146,176,0.12)', borderColor: 'rgba(136,146,176,0.3)' },
  rentalBadgePast:    { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' },
  rentalBadgeText:    { fontSize: 11, fontWeight: '700', color: '#ccd6f6' },
  rentalInfo:         { flex: 1 },
  rentalRoomCode:     { color: '#4facfe', fontSize: 14, fontWeight: '800', letterSpacing: 0.4 },
  rentalBuilding:     { color: '#8892b0', fontSize: 12, marginTop: 1 },
  rentalDate:         { color: '#ccd6f6', fontSize: 12, marginTop: 3 },
  rentalNote:         { color: '#f1c40f', fontSize: 11, marginTop: 2 },

  // Payment history table (new)
  historyTable:    { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  historyHeader:   { flexDirection: 'row', backgroundColor: 'rgba(79,172,254,0.12)', paddingVertical: 8, paddingHorizontal: 10 },
  historyRow:      { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 10 },
  historyRowAlt:   { backgroundColor: 'rgba(255,255,255,0.03)' },
  historyCell:     { color: '#ccd6f6', fontSize: 11.5, flex: 1 },
  historyCellHead: { color: '#8892b0', fontWeight: '700', fontSize: 11 },

  // Incident history (new)
  incidentRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  incidentLeft:  { flex: 1, marginRight: 8 },
  incidentIssue: { color: '#ccd6f6', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  incidentBy:    { color: '#8892b0', fontSize: 11 },
  incidentTime:  { color: '#4facfe', fontSize: 11, fontWeight: '600', flexShrink: 0 },

  // Empty state (new)
  emptyBox:  { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  emptyText: { color: '#8892b0', fontSize: 13 },
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
  sumNum:   { color: '#fff', fontSize: 18, fontWeight: '900' },
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

  // Room code & status (new)
  roomCodeBadge:       { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)' },
  roomCodeText:        { color: '#4facfe', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  roomCodeBadgeFormer: { backgroundColor: 'rgba(136,146,176,0.1)', borderColor: 'rgba(136,146,176,0.2)' },
  roomCodeTextFormer:  { color: '#8892b0' },
  statusIcon:    { fontSize: 18 },
  statusLabel:   { fontSize: 10, fontWeight: '700', marginTop: -2 },
  formerIcon:    { fontSize: 18, opacity: 0.4 },

  // Former customer card
  cardFormer:    { opacity: 0.7, borderColor: 'rgba(255,255,255,0.05)' },
  cardNameFormer:{ color: '#8892b0' },
  moveOutDate:   { color: '#8892b0', fontSize: 11 },

  // Section divider
  listDivider:     { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginVertical: 8, gap: 10 },
  listDividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  listDividerText: { color: '#8892b0', fontSize: 11, fontWeight: '700' },
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
