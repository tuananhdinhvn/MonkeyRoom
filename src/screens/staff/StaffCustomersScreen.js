import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Modal, Animated, ScrollView, Alert, Image,
  Dimensions, StatusBar, Linking, Platform, UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useBuildings } from '../../context/BuildingsContext';
import { useStaff } from '../../context/StaffContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const SCREEN_H = Dimensions.get('window').height;
const STAFF_LIST = ['Trần Thị Thu', 'Nguyễn Văn Bảo', 'Lê Thị Hương'];

// ─── Status helpers ───────────────────────────────────────
const STATUS_CFG = {
  ok:      { icon: '✅', color: '#2ecc71', tKey: 'status.normal' },
  warning: { icon: '⚠️', color: '#f1c40f', tKey: 'status.issue' },
};

function getCustomerStatus(c) { return c.status || 'ok'; }

// ─── Avatar ───────────────────────────────────────────────
const AVATAR_ICONS = {
  male:   { icon: '👨', color: 'rgba(79,172,254,0.2)' },
  female: { icon: '👩', color: 'rgba(233,69,96,0.2)' },
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
function CustomerDetailModal({ customer, onClose, onResolveMessage }) {
  const { t } = useLanguage();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;
  const openedId   = useRef(null);
  const [visible,        setVisible]        = useState(false);
  const [resolvingId,    setResolvingId]    = useState(null);
  const [resolveType,    setResolveType]    = useState('self');
  const [resolveStaff,   setResolveStaff]   = useState(STAFF_LIST[0]);
  const [contractorName, setContractorName] = useState('');
  const [contractorNote, setContractorNote] = useState('');
  const [resolveNote,    setResolveNote]    = useState('');

  useEffect(() => {
    if (customer && customer.id !== openedId.current) {
      openedId.current = customer.id;
      setResolvingId(null); setResolveType('self'); setResolveStaff(STAFF_LIST[0]);
      setContractorName(''); setContractorNote(''); setResolveNote('');
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

  const handleConfirmResolve = () => {
    const data = {
      type:           resolveType,
      staff:          resolveType === 'staff'      ? resolveStaff   : null,
      contractorName: resolveType === 'contractor' ? contractorName : null,
      contractorNote: resolveType === 'contractor' ? contractorNote : null,
      note:           resolveType === 'staff'      ? resolveNote    : null,
    };
    onResolveMessage(resolvingId, data);
    setResolvingId(null);
    setContractorName(''); setContractorNote(''); setResolveNote('');
  };

  if (!customer && !visible) return null;
  const c = customer;
  const pendingMsgs = c ? (c.pendingMessages || []) : [];

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
              const statusKey = getCustomerStatus(c);
              const stCfg     = STATUS_CFG[statusKey];
              return (
                <View style={dt.header}>
                  <AvatarDisplay avatar={c.avatar} size={60} />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={dt.name}>{c.name}</Text>
                    <View style={dt.badgeRow}>
                      {c.roomCode && (
                        <View style={dt.roomCodeBadge}>
                          <Text style={dt.roomCodeText}>🏠 {c.roomCode}</Text>
                        </View>
                      )}
                      <View style={[dt.statusBadge, { backgroundColor: `${stCfg.color}22`, borderColor: `${stCfg.color}55` }]}>
                        <Text style={[dt.statusText, { color: stCfg.color }]}>{stCfg.icon} {t(stCfg.tKey)}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={dt.closeBtn} onPress={handleClose}>
                    <Text style={dt.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}

            {/* Call button */}
            <View style={dt.actionRow}>
              <TouchableOpacity
                style={[dt.callBtn, { flex: 1 }]}
                onPress={() => c.phone && Linking.openURL(`tel:${c.phone.replace(/\D/g, '')}`)}
              >
                <Text style={dt.callBtnText}>📞  Gọi điện</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={dt.scroll} showsVerticalScrollIndicator={false}>

              {/* Issue resolution */}
              {pendingMsgs.length > 0 && (
                <View style={dt.section}>
                  <Text style={dt.sectionTitle}>🔔 Sự cố cần xử lý</Text>
                  {pendingMsgs.map(msg => (
                    <View key={msg.id}>
                      <View style={dt.msgCard}>
                        <Text style={dt.msgTime}>{msg.time}</Text>
                        <Text style={dt.msgText}>"{msg.text}"</Text>
                        {resolvingId !== msg.id && (
                          <TouchableOpacity style={dt.resolveToggle} onPress={() => { setResolvingId(msg.id); setResolveType('self'); setResolveStaff(STAFF_LIST[0]); setContractorName(''); setContractorNote(''); setResolveNote(''); }}>
                            <Text style={dt.resolveToggleText}>Xác nhận giải quyết ▼</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      {resolvingId === msg.id && (
                        <View style={dt.resolveBox}>
                          <Text style={dt.resolveLabel}>Hình thức xử lý:</Text>
                          {[
                            { key: 'self',       icon: '🔧', tKey: 'staffRooms.self'       },
                            { key: 'contractor', icon: '👷', tKey: 'staffRooms.contractor'  },
                            { key: 'staff',      icon: '👤', tKey: 'staffRooms.staffSystem' },
                          ].map(opt => (
                            <TouchableOpacity key={opt.key} style={[dt.resolveOpt, resolveType === opt.key && dt.resolveOptActive]} onPress={() => setResolveType(opt.key)}>
                              <View style={[dt.resolveRadio, resolveType === opt.key && dt.resolveRadioActive]}>
                                {resolveType === opt.key && <View style={dt.resolveRadioDot} />}
                              </View>
                              <Text style={[dt.resolveOptText, resolveType === opt.key && { color: '#fff' }]}>{opt.icon}  {t(opt.tKey)}</Text>
                            </TouchableOpacity>
                          ))}
                          {resolveType === 'contractor' && (
                            <View style={dt.contractorWrap}>
                              <Text style={dt.contractorFieldLabel}>Tên thợ:</Text>
                              <TextInput style={dt.contractorInput} value={contractorName} onChangeText={setContractorName} placeholder="Nhập tên thợ..." placeholderTextColor="#8892b0" />
                              <Text style={[dt.contractorFieldLabel, { marginTop: 10 }]}>Phát sinh / Chi phí (nếu có):</Text>
                              <TextInput style={[dt.contractorInput, dt.contractorInputMulti]} value={contractorNote} onChangeText={setContractorNote} placeholder="VD: 500,000đ – thay ổ khóa..." placeholderTextColor="#8892b0" multiline />
                            </View>
                          )}
                          {resolveType === 'staff' && (
                            <View style={dt.staffPickerWrap}>
                              <Text style={dt.staffPickerLabel}>Chọn nhân viên:</Text>
                              {STAFF_LIST.map(sv => (
                                <TouchableOpacity key={sv} style={[dt.staffOpt, resolveStaff === sv && dt.staffOptActive]} onPress={() => setResolveStaff(sv)}>
                                  <Text style={[dt.staffOptText, resolveStaff === sv && { color: '#4facfe', fontWeight: '700' }]}>
                                    {resolveStaff === sv ? '✔  ' : '     '}{sv}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                              <Text style={[dt.staffPickerLabel, { marginTop: 10 }]}>Ghi chú (nếu có):</Text>
                              <TextInput style={[dt.contractorInput, dt.contractorInputMulti]} value={resolveNote} onChangeText={setResolveNote} placeholder="Ghi chú thêm về việc xử lý..." placeholderTextColor="#8892b0" multiline />
                            </View>
                          )}
                          <View style={dt.resolveBtnRow}>
                            <TouchableOpacity style={dt.resolveCancelBtn} onPress={() => setResolvingId(null)}>
                              <Text style={dt.resolveCancelText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={dt.resolveConfirmBtn} onPress={handleConfirmResolve}>
                              <Text style={dt.resolveConfirmText}>✓  Xác nhận OK</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Personal info */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>📋 Thông tin cá nhân</Text>
                <View style={dt.card}>
                  <DtRow label="Họ và tên"       value={c.name} />
                  <DtRow label="Số điện thoại"   value={c.phone} />
                  <DtRow label="Email"            value={c.email} />
                  <DtRow label="Ngày sinh"        value={c.dob} />
                </View>
              </View>

              {/* CCCD */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>🪪 Căn cước công dân</Text>
                <View style={dt.idCardRow}>
                  {[{ tKey: 'customers.idFront', noPhotoKey: 'customers.noIdFront', uri: c.idFront }, { tKey: 'customers.idBack', noPhotoKey: 'customers.noIdBack', uri: c.idBack }].map(side => (
                    <View key={side.tKey} style={dt.idCardBox}>
                      {side.uri
                        ? <Image source={{ uri: side.uri }} style={dt.idCardImg} />
                        : <View style={dt.idCardEmpty}>
                            <Text style={dt.idCardEmptyIcon}>🪪</Text>
                            <Text style={dt.idCardEmptyText}>{t(side.noPhotoKey)}</Text>
                          </View>
                      }
                      <View style={dt.idCardLabel}><Text style={dt.idCardLabelText}>{t(side.tKey)}</Text></View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Rental info */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>🏠 Thông tin thuê phòng</Text>
                <View style={dt.card}>
                  <DtRow label="Mã phòng"        value={c.roomCode} accent />
                  <DtRow label="Tòa nhà"         value={c.building} />
                  <DtRow label="Nhân viên QL"    value={c.staffName} />
                  <DtRow label="Thuê từ ngày"    value={c.since} />
                  <DtRow label="Tiền thuê/tháng" value={c.price ? `${c.price} ₫` : null} />
                </View>
              </View>

              {/* Payment history */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>💳 Lịch sử thanh toán</Text>
                {(!c.paymentHistory || c.paymentHistory.length === 0) ? (
                  <View style={dt.emptyBox}><Text style={dt.emptyText}>Chưa có lịch sử thanh toán</Text></View>
                ) : (
                  <View style={dt.historyTable}>
                    <View style={dt.historyHeader}>
                      <Text style={[dt.historyCell, dt.historyCellHead, { flex: 1.4 }]}>Tháng</Text>
                      <Text style={[dt.historyCell, dt.historyCellHead, { flex: 2 }]}>Tiền thuê</Text>
                      <Text style={[dt.historyCell, dt.historyCellHead, { flex: 1.8 }]}>Trạng thái</Text>
                    </View>
                    {c.paymentHistory.map((p, i) => (
                      <View key={i} style={[dt.historyRow, i % 2 === 0 && dt.historyRowAlt]}>
                        <Text style={[dt.historyCell, { flex: 1.4 }]}>{p.month}</Text>
                        <Text style={[dt.historyCell, { flex: 2, color: '#2ecc71', fontWeight: '700' }]}>{p.amount} ₫</Text>
                        <Text style={[dt.historyCell, { flex: 1.8, color: p.paid ? '#2ecc71' : '#e94560', fontWeight: '700' }]}>
                          {p.paid ? '✅ Đã đóng' : '❌ Chưa đóng'}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Incident history */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>🔧 Lịch sử sự cố</Text>
                {(!c.incidentHistory || c.incidentHistory.length === 0) ? (
                  <View style={dt.emptyBox}><Text style={dt.emptyText}>Chưa có sự cố nào được ghi nhận</Text></View>
                ) : (
                  c.incidentHistory.map((inc, i) => (
                    <View key={i} style={dt.incidentRow}>
                      <View style={dt.incidentLeft}>
                        <Text style={dt.incidentIssue}>{inc.issue}</Text>
                        {inc.resolvedBy && <Text style={dt.incidentBy}>👤 Xử lý: {inc.resolvedBy}</Text>}
                      </View>
                      <Text style={dt.incidentTime}>{inc.resolvedAt}</Text>
                    </View>
                  ))
                )}
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

// ─── Staff Profile Modal ──────────────────────────────────
function StaffProfileModal({ staff, onClose, onSave }) {
  const { t } = useLanguage();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;
  const [name,     setName]     = useState(staff.name);
  const [phone,    setPhone]    = useState(staff.phone);
  const [gender,   setGender]   = useState(staff.gender || 'female');
  const [photoUri, setPhotoUri] = useState(staff.photoUri || null);

  useEffect(() => {
    setName(staff.name); setPhone(staff.phone);
    setGender(staff.gender || 'female');
    setPhotoUri(staff.photoUri || null);
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 130 }),
      Animated.timing(backdrop,   { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 300, useNativeDriver: true }),
      Animated.timing(backdrop,   { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(onClose);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t('staffCust.needPerm'), t('staffCust.permMsg')); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert(t('staffCust.missingInfo'), t('staffCust.missingName')); return; }
    onSave({ name: name.trim(), phone: phone.trim(), avatar: gender === 'male' ? '👨' : '👩', gender, photoUri });
    handleClose();
  };

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[pf.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[pf.sheet, { transform: [{ translateY }] }]}>
        <View style={pf.handle} />
        <View style={pf.header}>
          <Text style={pf.title}>{t('staffCust.profileTitle')}</Text>
          <TouchableOpacity style={pf.closeBtn} onPress={handleClose}><Text style={{ color: '#8892b0', fontSize: 18 }}>✕</Text></TouchableOpacity>
        </View>
        <ScrollView style={pf.scroll} showsVerticalScrollIndicator={false}>
          <View style={pf.previewRow}>
            <View style={pf.previewBox}>
              {photoUri ? <Image source={{ uri: photoUri }} style={pf.previewPhoto} /> : <Text style={pf.previewEmoji}>{gender === 'male' ? '👨' : '👩'}</Text>}
            </View>
            <View style={pf.previewActions}>
              <Text style={pf.previewName}>{name || t('staffCust.namePh')}</Text>
              <TouchableOpacity style={pf.uploadBtn} onPress={handlePickImage}><Text style={pf.uploadBtnText}>{t('staffCust.uploadPhoto')}</Text></TouchableOpacity>
              {photoUri && <TouchableOpacity style={pf.removePhotoBtn} onPress={() => setPhotoUri(null)}><Text style={pf.removePhotoText}>{t('staffCust.removePhoto')}</Text></TouchableOpacity>}
            </View>
          </View>

          <Text style={pf.label}>{t('staffCust.gender')}</Text>
          <View style={pf.genderRow}>
            {[{ key: 'female', icon: '👩', tKey: 'staffCust.female' }, { key: 'male', icon: '👨', tKey: 'staffCust.male' }].map(g => (
              <TouchableOpacity key={g.key} style={[pf.genderBtn, gender === g.key && pf.genderSelected]} onPress={() => { setGender(g.key); setPhotoUri(null); }}>
                <Text style={pf.genderEmoji}>{g.icon}</Text>
                <Text style={[pf.genderLabel, gender === g.key && { color: '#4facfe' }]}>{t(g.tKey)}</Text>
                {gender === g.key && !photoUri && <View style={pf.genderCheck}><Text style={{ color: '#fff', fontSize: 10 }}>✓</Text></View>}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={pf.label}>{t('staffCust.nameLabel')}</Text>
          <TextInput style={pf.input} value={name} onChangeText={setName} placeholder={t('staffCust.namePh')} placeholderTextColor="#8892b0" />
          <Text style={pf.label}>{t('customers.phone')}</Text>
          <TextInput style={pf.input} value={phone} onChangeText={setPhone} placeholder={t('staffCust.phonePh')} placeholderTextColor="#8892b0" keyboardType="phone-pad" />

          <TouchableOpacity style={pf.saveBtn} onPress={handleSave}>
            <LinearGradient colors={['#4facfe', '#3a8de0']} style={pf.saveGradient}>
              <Text style={pf.saveBtnText}>{t('staffCust.saveBtn')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ height: 32 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function StaffCustomersScreen() {
  const { t } = useLanguage();
  const { buildings, setBuildings } = useBuildings();
  const { staff, updateStaff: setStaff } = useStaff();
  const navigation = useNavigation();
  const [search,         setSearch]         = useState('');
  const [activeFilter,   setActiveFilter]   = useState('all');
  const [detailCustomer, setDetailCustomer] = useState(null);
  const [showProfile,    setShowProfile]    = useState(false);

  const myBuildings = buildings.filter(b => b.staff === staff.name);

  const activeTenants = useMemo(() => {
    const tenants = [];
    myBuildings.forEach(b => {
      b.floors.forEach(f => {
        f.rooms.forEach(r => {
          if (!r.tenant) return;
          const hasPending = (r.messages || []).some(m => !m.resolved);
          const isIssue = r.status === 'maintenance' || r.status === 'urgent' ||
            (r.status === 'occupied' && hasPending);
          tenants.push({
            id:         `${b.id}__${r.id}`,
            buildingId: b.id,
            roomId:     r.id,
            name:       r.tenant,
            phone:      r.phone || '',
            email:      '',
            dob:        '',
            building:   b.name,
            staffName:  b.staff,
            room:       r.id,
            roomCode:   b.code ? `${b.code}-${r.id}` : r.id,
            price:      r.price || '',
            since:      r.sinceDate || '',
            status:     isIssue ? 'warning' : 'ok',
            avatar:     { type: 'male' },
            idFront:    r.cccdImages?.[0] || null,
            idBack:     r.cccdImages?.[1] || null,
            pendingMessages: (r.messages || []).filter(m => !m.resolved),
            paymentHistory: (r.paymentHistory || []).map(p => ({
              month:  p.month,
              amount: r.price || '—',
              paid:   p.paid,
            })),
            incidentHistory: (r.messages || [])
              .filter(m => m.resolved)
              .map(m => ({
                issue:      m.text,
                resolvedBy: m.resolvedBy
                  ? (typeof m.resolvedBy === 'object'
                      ? (m.resolvedBy.contractorName || m.resolvedBy.staff || m.resolvedBy.type || '—')
                      : m.resolvedBy)
                  : '—',
                resolvedAt: m.time,
              })),
          });
        });
      });
    });
    return tenants;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildings, staff.name]);

  const handleLogout = () => {
    Alert.alert(
      t('staffCust.logoutTitle'),
      t('staffCust.logoutMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.confirm'), style: 'destructive',
          onPress: () => navigation.getParent()?.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
          ),
        },
      ]
    );
  };

  const matchSearch = c => {
    const q = search.toLowerCase();
    return !q
      || c.name.toLowerCase().includes(q)
      || (c.phone && c.phone.includes(q))
      || (c.roomCode && c.roomCode.toLowerCase().includes(q))
      || (c.room && c.room.toLowerCase().includes(q));
  };

  const handleResolveMessage = (msgId, resolveData) => {
    if (!detailCustomer) return;
    const { buildingId, roomId } = detailCustomer;
    setBuildings(prev => prev.map(b => {
      if (b.id !== buildingId) return b;
      return {
        ...b,
        floors: b.floors.map(f => ({
          ...f,
          rooms: f.rooms.map(r => {
            if (r.id !== roomId) return r;
            const updatedMessages = r.messages.map(m =>
              m.id === msgId ? { ...m, resolved: true, resolvedBy: resolveData } : m
            );
            const stillPending = updatedMessages.some(m => !m.resolved);
            const newStatus = !stillPending && r.tenant &&
              (r.status === 'maintenance' || r.status === 'urgent') ? 'occupied' : r.status;
            return { ...r, messages: updatedMessages, status: newStatus, currentIssue: stillPending ? r.currentIssue : null };
          }),
        })),
      };
    }));
    // Update detailCustomer to reflect resolved message immediately
    setDetailCustomer(prev => {
      if (!prev) return prev;
      const resolvedMsg = prev.pendingMessages.find(m => m.id === msgId);
      const newPending  = prev.pendingMessages.filter(m => m.id !== msgId);
      const resolvedByStr = resolveData
        ? (typeof resolveData === 'object'
            ? (resolveData.contractorName || resolveData.staff || resolveData.type || '—')
            : resolveData)
        : '—';
      return {
        ...prev,
        pendingMessages: newPending,
        status: newPending.length > 0 ? 'warning' : 'ok',
        incidentHistory: resolvedMsg
          ? [...prev.incidentHistory, { issue: resolvedMsg.text, resolvedBy: resolvedByStr, resolvedAt: resolvedMsg.time }]
          : prev.incidentHistory,
      };
    });
  };

  const filteredTenants = activeTenants
    .filter(c => {
      if (!matchSearch(c)) return false;
      return activeFilter === 'all' || c.status === activeFilter;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const totalOk      = activeTenants.filter(c => c.status === 'ok').length;
  const totalWarning = activeTenants.filter(c => c.status === 'warning').length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <CustomerDetailModal
        customer={detailCustomer}
        onClose={() => setDetailCustomer(null)}
        onResolveMessage={handleResolveMessage}
      />

      {showProfile && (
        <StaffProfileModal
          staff={staff}
          onClose={() => setShowProfile(false)}
          onSave={updated => setStaff(updated)}
        />
      )}

      <View style={s.container}>
        {/* Staff header */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.header}>
          <View style={s.staffCard}>
            <View style={s.staffAvatarBox}>
              {staff.photoUri
                ? <Image source={{ uri: staff.photoUri }} style={s.staffAvatarPhoto} />
                : <Text style={s.staffAvatarEmoji}>{staff.avatar}</Text>
              }
            </View>
            <View style={s.staffInfo}>
              <Text style={s.staffName}>{staff.name}</Text>
              <View style={s.staffRoleBadge}>
                <Text style={s.staffRoleText}>{t('staffCust.roleBadge')}</Text>
              </View>
              <Text style={s.staffPhone}>{staff.phone}</Text>
            </View>
            <View style={s.staffActions}>
              <TouchableOpacity style={s.editBadge} onPress={() => setShowProfile(true)}>
                <Text style={s.editBadgeText}>{t('staffCust.editBtn')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.logoutBadge} onPress={handleLogout}>
                <Text style={s.logoutBadgeText}>{t('staffCust.logoutBtn')}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={s.title}>{t('nav.customers')}</Text>
              <Text style={s.subtitle}>{activeTenants.length} {t('staffCust.subtitle')} {myBuildings.length}</Text>
            </View>
            <LanguageSwitcher />
          </View>
        </LinearGradient>

        {/* Summary strip */}
        <View style={s.summaryStrip}>
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('all')}>
            <Text style={s.sumNum}>{activeTenants.length}</Text>
            <Text style={s.sumLbl}>{t('staffCust.summary.customers')}</Text>
          </TouchableOpacity>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('ok')}>
            <Text style={[s.sumNum, { color: '#2ecc71' }]}>{totalOk}</Text>
            <Text style={s.sumLbl}>{t('staffCust.summary.normal')}</Text>
          </TouchableOpacity>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('warning')}>
            <Text style={[s.sumNum, { color: '#f1c40f' }]}>{totalWarning}</Text>
            <Text style={s.sumLbl}>{t('staffCust.summary.issue')}</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder={t('staffCust.searchPh')}
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
          data={filteredTenants}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>👥</Text>
              <Text style={s.emptyText}>
                {activeTenants.length === 0 ? t('staffCust.noCustomers') : t('staffCust.noFound')}
              </Text>
            </View>
          }
          renderItem={({ item: c }) => {
            const statusKey = getCustomerStatus(c);
            const stCfg     = STATUS_CFG[statusKey];
            return (
              <TouchableOpacity
                style={s.card}
                onPress={() => setDetailCustomer(c)}
                activeOpacity={0.8}
              >
                <AvatarDisplay avatar={c.avatar} size={50} />
                <View style={s.cardInfo}>
                  <Text style={s.cardName}>{c.name}</Text>
                  <Text style={s.cardPhone}>{c.phone}</Text>
                  <View style={s.cardMeta}>
                    {c.roomCode && (
                      <View style={s.roomCodeBadge}>
                        <Text style={s.roomCodeText}>{c.roomCode}</Text>
                      </View>
                    )}
                    {c.since ? <Text style={s.since}>Từ {c.since}</Text> : null}
                  </View>
                  <Text style={s.buildingLine} numberOfLines={1}>🏢 {c.building}</Text>
                </View>
                <View style={s.cardRight}>
                  <Text style={[s.statusIcon, { color: stCfg.color }]}>{stCfg.icon}</Text>
                  <Text style={[s.statusLabel, { color: stCfg.color }]}>{t(stCfg.tKey)}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

// ─── Detail Modal styles ──────────────────────────────────
const dt = StyleSheet.create({
  backdrop:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet:        { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '92%', paddingTop: 12 },
  handle:       { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  name:         { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  badgeRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  roomCodeBadge:{ backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)' },
  roomCodeText: { color: '#4facfe', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  statusBadge:  { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  statusText:   { fontSize: 12, fontWeight: '700' },
  closeBtn:     { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  closeBtnText: { color: '#8892b0', fontSize: 14 },
  actionRow:    { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  callBtn:      { flex: 1, backgroundColor: 'rgba(46,204,113,0.12)', borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.3)' },
  callBtnText:  { color: '#2ecc71', fontWeight: '700', fontSize: 13 },
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
  idCardEmptyIcon:  { fontSize: 24 },
  idCardEmptyText:  { color: '#8892b0', fontSize: 11, textAlign: 'center', paddingHorizontal: 8 },
  idCardLabel:      { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', paddingVertical: 4, alignItems: 'center' },
  idCardLabelText:  { color: '#fff', fontSize: 10, fontWeight: '700' },
  historyTable:     { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  historyHeader:    { flexDirection: 'row', backgroundColor: 'rgba(79,172,254,0.12)', paddingVertical: 8, paddingHorizontal: 10 },
  historyRow:       { flexDirection: 'row', paddingVertical: 9, paddingHorizontal: 10 },
  historyRowAlt:    { backgroundColor: 'rgba(255,255,255,0.03)' },
  historyCell:      { color: '#ccd6f6', fontSize: 11.5, flex: 1 },
  historyCellHead:  { color: '#8892b0', fontWeight: '700', fontSize: 11 },
  incidentRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  incidentLeft:     { flex: 1, marginRight: 8 },
  incidentIssue:    { color: '#ccd6f6', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  incidentBy:       { color: '#8892b0', fontSize: 11 },
  incidentTime:     { color: '#4facfe', fontSize: 11, fontWeight: '600', flexShrink: 0 },
  emptyBox:         { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  emptyText:        { color: '#8892b0', fontSize: 13 },
  // Message & resolve form
  msgCard:          { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  msgTime:          { color: '#8892b0', fontSize: 11, marginBottom: 4 },
  msgText:          { color: '#ccd6f6', fontSize: 13, fontStyle: 'italic', lineHeight: 20, marginBottom: 10 },
  resolveToggle:    { backgroundColor: 'rgba(241,196,15,0.1)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(241,196,15,0.3)' },
  resolveToggleText:{ color: '#f1c40f', fontSize: 12, fontWeight: '700' },
  resolveBox:       { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resolveLabel:     { color: '#8892b0', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  resolveOpt:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 6, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resolveOptActive: { backgroundColor: 'rgba(79,172,254,0.1)', borderColor: 'rgba(79,172,254,0.35)' },
  resolveRadio:     { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  resolveRadioActive:{ borderColor: '#4facfe' },
  resolveRadioDot:  { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4facfe' },
  resolveOptText:   { color: '#8892b0', fontSize: 13, flex: 1 },
  staffPickerWrap:  { backgroundColor: 'rgba(79,172,254,0.05)', borderRadius: 10, padding: 10, marginTop: 4, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(79,172,254,0.15)' },
  staffPickerLabel: { color: '#8892b0', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  staffOpt:         { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  staffOptActive:   { backgroundColor: 'rgba(79,172,254,0.12)', borderColor: 'rgba(79,172,254,0.3)' },
  staffOptText:     { color: '#ccd6f6', fontSize: 13 },
  contractorWrap:       { backgroundColor: 'rgba(241,196,15,0.05)', borderRadius: 10, padding: 10, marginTop: 4, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(241,196,15,0.2)' },
  contractorFieldLabel: { color: '#8892b0', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  contractorInput:      { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, paddingHorizontal: 12, paddingVertical: 9 },
  contractorInputMulti: { minHeight: 64, textAlignVertical: 'top', paddingTop: 9 },
  resolveBtnRow:    { flexDirection: 'row', gap: 8, marginTop: 8 },
  resolveCancelBtn: { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  resolveCancelText:{ color: '#8892b0', fontWeight: '700', fontSize: 13 },
  resolveConfirmBtn: { flex: 2, borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: 'rgba(46,204,113,0.15)', borderWidth: 1, borderColor: 'rgba(46,204,113,0.4)' },
  resolveConfirmText:{ color: '#2ecc71', fontWeight: '800', fontSize: 13 },
});

// ─── Screen styles ────────────────────────────────────────
const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },

  header:          { padding: 20, paddingTop: 10, paddingBottom: 16 },
  staffCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', marginBottom: 14 },
  staffAvatarBox:  { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(79,172,254,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14, overflow: 'hidden' },
  staffAvatarEmoji:{ fontSize: 28 },
  staffAvatarPhoto:{ width: 52, height: 52, borderRadius: 26 },
  staffInfo:       { flex: 1 },
  staffName:       { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.3 },
  staffRoleBadge:  { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4, marginBottom: 4 },
  staffRoleText:   { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  staffPhone:      { color: '#8892b0', fontSize: 12 },
  staffActions:    { gap: 6, justifyContent: 'center' },
  editBadge:       { backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(79,172,254,0.25)' },
  editBadgeText:   { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  logoutBadge:     { backgroundColor: 'rgba(233,69,96,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(233,69,96,0.25)' },
  logoutBadgeText: { color: '#e94560', fontSize: 11, fontWeight: '700' },
  title:           { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle:        { color: '#8892b0', fontSize: 13, marginTop: 4 },

  summaryStrip: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16, marginTop: 8, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 4 },
  sumItem:      { flex: 1, alignItems: 'center' },
  sumNum:       { color: '#fff', fontSize: 18, fontWeight: '900' },
  sumLbl:       { color: '#8892b0', fontSize: 10, marginTop: 2, fontWeight: '600', textAlign: 'center' },
  sumDiv:       { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },

  searchWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', margin: 16, marginBottom: 10, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12, fontSize: 14 },

  filterRow:       { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 10, gap: 8 },
  filterBtn:       { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterActive:    { backgroundColor: '#4facfe', borderColor: '#4facfe' },
  filterText:      { color: '#8892b0', fontSize: 12, fontWeight: '600' },
  filterTextActive:{ color: '#fff' },

  list:     { padding: 16, paddingTop: 6, paddingBottom: 32 },
  emptyWrap:{ alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyIcon:{ fontSize: 40 },
  emptyText:{ color: '#8892b0', fontSize: 14 },

  card:         { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 12 },
  cardInfo:     { flex: 1 },
  cardName:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  cardPhone:    { color: '#8892b0', fontSize: 12, marginTop: 2 },
  cardMeta:     { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6, flexWrap: 'wrap' },
  roomCodeBadge:{ backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)' },
  roomCodeText: { color: '#4facfe', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  since:        { color: '#8892b0', fontSize: 11 },
  buildingLine: { color: '#8892b0', fontSize: 11, marginTop: 4 },
  cardRight:    { alignItems: 'flex-end', gap: 2 },
  statusIcon:   { fontSize: 18 },
  statusLabel:  { fontSize: 10, fontWeight: '700' },
});

// ─── Profile Modal styles ─────────────────────────────────
const pf = StyleSheet.create({
  backdrop:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet:          { position: 'absolute', bottom: 0, left: 0, right: 0, maxHeight: SCREEN_H * 0.78, backgroundColor: '#16213e', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  handle:         { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  title:          { color: '#fff', fontSize: 16, fontWeight: '800' },
  closeBtn:       { padding: 6 },
  scroll:         { paddingHorizontal: 20, paddingTop: 16 },
  previewRow:     { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  previewBox:     { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(79,172,254,0.15)', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(79,172,254,0.3)' },
  previewEmoji:   { fontSize: 38 },
  previewPhoto:   { width: 72, height: 72, borderRadius: 36 },
  previewActions: { flex: 1 },
  previewName:    { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 8 },
  uploadBtn:      { backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 9, paddingVertical: 7, paddingHorizontal: 12, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(79,172,254,0.25)', marginBottom: 6 },
  uploadBtnText:  { color: '#4facfe', fontSize: 12, fontWeight: '700' },
  removePhotoBtn: { paddingVertical: 5, paddingHorizontal: 10 },
  removePhotoText:{ color: '#e94560', fontSize: 12 },
  label:          { color: '#8892b0', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8, marginTop: 4 },
  genderRow:      { flexDirection: 'row', gap: 10, marginBottom: 16 },
  genderBtn:      { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  genderSelected: { backgroundColor: 'rgba(79,172,254,0.1)', borderColor: 'rgba(79,172,254,0.4)' },
  genderEmoji:    { fontSize: 22 },
  genderLabel:    { color: '#8892b0', fontSize: 13, fontWeight: '700' },
  genderCheck:    { position: 'absolute', top: 6, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: '#4facfe', justifyContent: 'center', alignItems: 'center' },
  input:          { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14 },
  saveBtn:        { borderRadius: 14, overflow: 'hidden', marginTop: 8, marginBottom: 8 },
  saveGradient:   { paddingVertical: 15, alignItems: 'center' },
  saveBtnText:    { color: '#fff', fontSize: 15, fontWeight: '800' },
});
