import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, StatusBar, Modal, Animated, Linking,
  Dimensions, Alert, Image, LayoutAnimation, Platform, UIManager
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useStaff } from '../../context/StaffContext';
import { useBuildings } from '../../context/BuildingsContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const SCREEN_H = Dimensions.get('window').height;
const DEMO_NOW = '22/04/2026';
const DEMO_NOW_DISPLAY = '22/04/2026 08:00';

// ─── Helpers ──────────────────────────────────────────────
const STATUS = {
  occupied:    { tKey: 'status.occupied',    color: '#2ecc71', bg: 'rgba(46,204,113,0.12)',  border: 'rgba(46,204,113,0.35)',  icon: '✅' },
  empty:       { tKey: 'status.vacant',      color: '#8892b0', bg: 'rgba(136,146,176,0.1)',  border: 'rgba(136,146,176,0.25)', icon: '🔓' },
  maintenance: { tKey: 'status.issue',       color: '#f1c40f', bg: 'rgba(241,196,15,0.12)',  border: 'rgba(241,196,15,0.35)',  icon: '🔧' },
  urgent:      { tKey: 'status.issue',       color: '#f1c40f', bg: 'rgba(241,196,15,0.12)',  border: 'rgba(241,196,15,0.35)',  icon: '🚨' },
};

const FILTERS    = ['all', 'occupied', 'empty', 'incident'];
const FILTER_MAP = { 'occupied': 'occupied', 'empty': 'empty' };
const STAFF_LIST = ['Trần Thị Thu', 'Nguyễn Văn Bảo', 'Lê Thị Hương'];

function daysSince(dateStr) {
  if (!dateStr) return 0;
  const [d, m, y] = dateStr.split('/').map(Number);
  return Math.max(0, Math.floor((Date.now() - new Date(y, m - 1, d).getTime()) / 86400000));
}

function countRooms(building) {
  const all = building.floors.flatMap(f => f.rooms);
  const hasPending = r => (r.messages || []).some(m => !m.resolved);
  return {
    total:         all.length,
    occupied:      all.filter(r => r.tenant).length,
    occupiedClean: all.filter(r => r.status === 'occupied' && !hasPending(r)).length,
    empty:         all.filter(r => r.status === 'empty').length,
    issues:        all.filter(r => r.status === 'maintenance' || r.status === 'urgent' || (r.status === 'occupied' && hasPending(r))).length,
  };
}

// ─── Room Detail Modal ────────────────────────────────────
function RoomDetailModal({ room, buildingName, buildingCode, staffName, onClose, onResolveMessage, onSaveCccdImages, onCheckout, onStartCheckIn }) {
  const { t } = useLanguage();
  const translateY   = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop     = useRef(new Animated.Value(0)).current;
  const openedRoomId = useRef(null);
  const [visible,       setVisible]      = useState(false);
  const [resolvingId,      setResolvingId]      = useState(null);
  const [resolveType,      setResolveType]      = useState('self');
  const [resolveStaff,     setResolveStaff]     = useState(STAFF_LIST[0]);
  const [contractorName,   setContractorName]   = useState('');
  const [contractorNote,   setContractorNote]   = useState('');
  const [resolveNote,      setResolveNote]      = useState('');
  const [cccdImgs,         setCccdImgs]         = useState([]);
  const [checkoutStep,     setCheckoutStep]     = useState(null);

  useEffect(() => {
    if (room) {
      if (room.id !== openedRoomId.current) {
        openedRoomId.current = room.id;
        setResolvingId(null);
        setResolveType('self');
        setResolveStaff(STAFF_LIST[0]);
        setContractorName('');
        setContractorNote('');
        setResolveNote('');
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
      Alert.alert(t('common.permTitle'), t('common.permLibrary'));
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

  const pendingMsgs   = room ? (room.messages || []).filter(m => !m.resolved) : [];
  const isIssueSt     = room && (room.status === 'maintenance' || room.status === 'urgent');
  const hasPendingOcc = room && room.status === 'occupied' && pendingMsgs.length > 0;
  const st            = room ? (hasPendingOcc ? STATUS.maintenance : STATUS[room.status]) : STATUS.empty;
  const showTenant    = room && room.tenant && (room.status === 'occupied' || isIssueSt);
  const roommates     = room ? (room.roommates || []) : [];
  const canCheckout   = room && room.status === 'occupied' && pendingMsgs.length === 0 && !room.currentIssue;

  const handleConfirmResolve = () => {
    const data = {
      type: resolveType,
      staff:          resolveType === 'staff'      ? resolveStaff    : null,
      contractorName: resolveType === 'contractor' ? contractorName  : null,
      contractorNote: resolveType === 'contractor' ? contractorNote  : null,
      note:           resolveType === 'staff'      ? resolveNote     : null,
    };
    onResolveMessage(room.id, resolvingId, data);
    setResolvingId(null);
    setContractorName(''); setContractorNote(''); setResolveNote('');
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
              <Text style={md.roomTitle}>{buildingCode ? `${buildingCode}-${room.id}` : t('rooms.roomTitle').replace('{id}', room.id)}</Text>
              <Text style={md.roomSub}>{room.type} · {room.area} · {room.price} ₫/tháng</Text>
            </View>
            <View style={[md.statusBadge, { backgroundColor: st.bg, borderColor: st.border }]}>
              <Text style={[md.statusBadgeText, { color: st.color }]}>{t(st.tKey)}</Text>
            </View>
            <TouchableOpacity style={md.closeBtn} onPress={handleClose}>
              <Text style={md.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={md.scroll} showsVerticalScrollIndicator={false}>

            {/* Building + Staff strip */}
            <View style={md.infoStrip}>
              <View style={md.infoStripItem}>
                <Text style={md.infoStripLabel}>{t('rooms.stripBuilding')}</Text>
                <Text style={md.infoStripValue}>{buildingName}</Text>
                {buildingCode && <Text style={md.infoStripCode}>#{buildingCode}</Text>}
              </View>
              <View style={md.infoStripDiv} />
              <View style={md.infoStripItem}>
                <Text style={md.infoStripLabel}>{t('rooms.stripStaff')}</Text>
                <Text style={md.infoStripValue}>{staffName}</Text>
              </View>
            </View>

            {/* Check-in button */}
            {room.status === 'empty' && (
              <TouchableOpacity style={md.checkInBtn} onPress={() => { handleClose(); setTimeout(() => onStartCheckIn(room), 350); }} activeOpacity={0.8}>
                <Text style={md.checkInBtnText}>{t('rooms.checkInBtn')}</Text>
              </TouchableOpacity>
            )}

            {/* Checkout button */}
            {canCheckout && checkoutStep === null && (
              <TouchableOpacity style={md.checkoutBtn} onPress={() => setCheckoutStep('confirm')} activeOpacity={0.8}>
                <Text style={md.checkoutBtnText}>{t('rooms.checkoutBtn')}</Text>
              </TouchableOpacity>
            )}

            {/* Checkout confirmation panel */}
            {canCheckout && checkoutStep === 'confirm' && (
              <View style={md.checkoutPanel}>
                <Text style={md.checkoutPanelTitle}>{t('rooms.checkoutConfirmTitle')}</Text>
                <Text style={md.checkoutPanelSub}>{t('rooms.checkoutConfirmSub')}</Text>
                <View style={md.checkoutChecklist}>
                  {[t('rooms.checkoutCheck1'), t('rooms.checkoutCheck2'), t('rooms.checkoutCheck3')].map((item, i) => (
                    <View key={i} style={md.checkoutCheckItem}>
                      <Text style={md.checkoutCheckIcon}>✅</Text>
                      <Text style={md.checkoutCheckText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <View style={md.checkoutActions}>
                  <TouchableOpacity style={md.checkoutCancel} onPress={() => setCheckoutStep(null)} activeOpacity={0.7}>
                    <Text style={md.checkoutCancelText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={md.checkoutConfirm} activeOpacity={0.8} onPress={() => { onCheckout(room.id); handleClose(); }}>
                    <Text style={md.checkoutConfirmText}>{t('rooms.checkoutConfirmTitle')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Messages section */}
            {showTenant && (
              <MdSection title={t('rooms.msgFromTenant')}>
                {pendingMsgs.length > 0 ? pendingMsgs.map(msg => (
                  <View key={msg.id}>
                    <View style={md.msgCard}>
                      <Text style={md.msgTime}>{msg.time}</Text>
                      <Text style={md.msgText}>"{msg.text}"</Text>
                      {resolvingId !== msg.id && (
                        <TouchableOpacity style={md.resolveToggle} onPress={() => { setResolvingId(msg.id); setResolveType('self'); setResolveStaff(STAFF_LIST[0]); setContractorName(''); setContractorNote(''); setResolveNote(''); }}>
                          <Text style={md.resolveToggleText}>{t('staffRooms.resolveToggle')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    {resolvingId === msg.id && (
                      <View style={md.resolveBox}>
                        <Text style={md.resolveLabel}>{t('staffRooms.resolveMethod')}</Text>
                        {[
                          { key: 'self',       icon: '🔧', tKey: 'staffRooms.self'        },
                          { key: 'contractor', icon: '👷', tKey: 'staffRooms.contractor'   },
                          { key: 'staff',      icon: '👤', tKey: 'staffRooms.staffSystem'  },
                        ].map(opt => (
                          <TouchableOpacity key={opt.key} style={[md.resolveOpt, resolveType === opt.key && md.resolveOptActive]} onPress={() => setResolveType(opt.key)}>
                            <View style={[md.resolveRadio, resolveType === opt.key && md.resolveRadioActive]}>
                              {resolveType === opt.key && <View style={md.resolveRadioDot} />}
                            </View>
                            <Text style={[md.resolveOptText, resolveType === opt.key && { color: '#fff' }]}>{opt.icon}  {t(opt.tKey)}</Text>
                          </TouchableOpacity>
                        ))}
                        {resolveType === 'contractor' && (
                          <View style={md.contractorWrap}>
                            <Text style={md.contractorFieldLabel}>{t('staffRooms.contractorName')}</Text>
                            <TextInput
                              style={md.contractorInput}
                              value={contractorName}
                              onChangeText={setContractorName}
                              placeholder={t('staffRooms.contractorNamePh')}
                              placeholderTextColor="#8892b0"
                            />
                            <Text style={[md.contractorFieldLabel, { marginTop: 10 }]}>{t('staffRooms.cost')}</Text>
                            <TextInput
                              style={[md.contractorInput, md.contractorInputMulti]}
                              value={contractorNote}
                              onChangeText={setContractorNote}
                              placeholder={t('staffRooms.costPh')}
                              placeholderTextColor="#8892b0"
                              multiline
                            />
                          </View>
                        )}
                        {resolveType === 'staff' && (
                          <View style={md.staffPickerWrap}>
                            <Text style={md.staffPickerLabel}>{t('staffRooms.selectStaff')}</Text>
                            {STAFF_LIST.map(sv => (
                              <TouchableOpacity key={sv} style={[md.staffOpt, resolveStaff === sv && md.staffOptActive]} onPress={() => setResolveStaff(sv)}>
                                <Text style={[md.staffOptText, resolveStaff === sv && { color: '#4facfe', fontWeight: '700' }]}>
                                  {resolveStaff === sv ? '✔  ' : '     '}{sv}
                                </Text>
                              </TouchableOpacity>
                            ))}
                            <Text style={[md.staffPickerLabel, { marginTop: 10 }]}>{t('staffRooms.note')}</Text>
                            <TextInput
                              style={[md.contractorInput, md.contractorInputMulti]}
                              value={resolveNote}
                              onChangeText={setResolveNote}
                              placeholder={t('staffRooms.notePh')}
                              placeholderTextColor="#8892b0"
                              multiline
                            />
                          </View>
                        )}
                        <View style={md.resolveBtnRow}>
                          <TouchableOpacity style={md.resolveCancelBtn} onPress={() => setResolvingId(null)}>
                            <Text style={md.resolveCancelText}>{t('staffRooms.cancelBtn')}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={md.resolveConfirmBtn} onPress={handleConfirmResolve}>
                            <Text style={md.resolveConfirmText}>{t('staffRooms.confirmBtn')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                )) : (
                  <View style={md.normalState}>
                    <Text style={md.normalStateText}>{t('rooms.normalState')}</Text>
                  </View>
                )}
              </MdSection>
            )}

            {/* Tenant info */}
            {showTenant && (
              <MdSection title={t('rooms.currentTenant')}>
                <View style={[md.card, isIssueSt && md.cardIssue]}>
                  <MdRow label={t('rooms.tenantName')}     value={room.tenant} />
                  {room.tenantCccd && <MdRow label="CCCD" value={room.tenantCccd} />}
                  <MdRow label={t('rooms.sinceDate')}  value={room.sinceDate} accent />
                  <MdRow label={t('rooms.phone')} value={room.phone} />
                </View>
                {room.phone && (
                  <TouchableOpacity style={[md.callBtn, isIssueSt && md.callBtnIssue]} onPress={() => Linking.openURL(`tel:${room.phone}`)}>
                    <Text style={[md.callBtnText, isIssueSt && { color: '#f1c40f' }]}>{t('rooms.callTenant').replace('{name}', room.tenant)}</Text>
                  </TouchableOpacity>
                )}
              </MdSection>
            )}

            {/* CCCD images */}
            {showTenant && (
              <MdSection title={t('staffRooms.idCard')}>
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
                          <Text style={md.cccdAddText}>{t('rooms.cccdAdd')}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </ScrollView>
                ) : (
                  <View style={md.cccdEmpty}>
                    <Text style={{ fontSize: 28 }}>🪪</Text>
                    <Text style={md.cccdEmptyText}>{t('rooms.cccdEmpty')}</Text>
                    <TouchableOpacity style={md.cccdPickBtn} onPress={pickCccdImage}>
                      <Text style={md.cccdPickText}>{t('rooms.cccdAddBtn')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </MdSection>
            )}

            {/* Roommates */}
            {showTenant && roommates.length > 0 && (
              <MdSection title={t('rooms.roommatesTitle').replace('{n}', roommates.length)}>
                <View style={md.rmTable}>
                  <View style={md.rmHeader}>
                    <Text style={[md.rmHeaderCell, { flex: 3 }]}>{t('rooms.rmFullName')}</Text>
                    <Text style={[md.rmHeaderCell, { flex: 2 }]}>{t('rooms.rmCccdNum')}</Text>
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
              <MdSection title={t('rooms.payHistory')}>
                {room.paymentHistory.map((p, i) => (
                  <View key={i} style={[md.payRow, !p.paid && md.payRowUnpaid]}>
                    <Text style={md.payMonth}>{t('rooms.payMonth').replace('{n}', p.month)}</Text>
                    <View style={[md.payBadge, p.paid ? md.payBadgePaid : md.payBadgeUnpaid]}>
                      <Text style={{ color: p.paid ? '#2ecc71' : '#e94560', fontSize: 11, fontWeight: '700' }}>
                        {p.paid ? t('status.paid') : t('status.unpaid')}
                      </Text>
                    </View>
                  </View>
                ))}
              </MdSection>
            )}

            {/* Current issue */}
            {room.currentIssue && (
              <MdSection title={t('rooms.issueHistory')}>
                <View style={md.issueCard}>
                  <Text style={md.issueTitle}>{room.currentIssue.title}</Text>
                  <Text style={md.issueMeta}>{t('rooms.issueRecorded').replace('{date}', room.currentIssue.reportedAt)}</Text>
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

// ─── Building Rooms Modal ─────────────────────────────────
const ROOMS_MODAL_CFG = {
  all:         { tKey: 'staffRooms.cfgAll',         icon: '🏢', color: '#4facfe' },
  occupied:    { tKey: 'staffRooms.cfgOccupied',    icon: '✅', color: '#2ecc71' },
  empty:       { tKey: 'staffRooms.cfgEmpty',       icon: '🔓', color: '#8892b0' },
  maintenance: { tKey: 'staffRooms.cfgMaintenance', icon: '🔧', color: '#f1c40f' },
  urgent:      { tKey: 'staffRooms.cfgUrgent',      icon: '🚨', color: '#e94560' },
};

function BuildingRoomsModal({ data, onClose, onSelectRoom }) {
  const { t } = useLanguage();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  const goToRoom = room => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: SCREEN_H, duration: 220, useNativeDriver: true }),
      Animated.timing(backdrop,   { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => onSelectRoom(room));
  };

  const cfg = ROOMS_MODAL_CFG[data.type];
  const allRooms = data.building.floors.flatMap(f => f.rooms);
  const filtered = data.type === 'all' ? allRooms : allRooms.filter(r => r.status === data.type);

  const byFloor = data.building.floors
    .map(fl => ({ floor: fl.floor, rooms: fl.rooms.filter(r => data.type === 'all' || r.status === data.type) }))
    .filter(fl => fl.rooms.length > 0)
    .sort((a, b) => a.floor - b.floor);

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[md.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[md.sheet, { transform: [{ translateY }], maxHeight: '85%' }]}>
        <View style={md.handle} />
        <View style={[md.header, { borderLeftWidth: 0 }]}>
          <View style={[md.statusIcon, { backgroundColor: cfg.color + '22' }]}>
            <Text style={{ fontSize: 22 }}>{cfg.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={md.roomTitle}>{t(cfg.tKey)}</Text>
            <Text style={md.roomSub}>🏢 {data.building.name} · {t('rooms.floorRooms').replace('{n}', filtered.length)}</Text>
          </View>
          <TouchableOpacity style={md.closeBtn} onPress={handleClose}>
            <Text style={md.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={md.scroll} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 44 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
              <Text style={{ color: '#8892b0', fontSize: 14 }}>{t('rooms.noRooms')}</Text>
            </View>
          ) : (
            byFloor.map(({ floor, rooms }) => (
              <View key={floor} style={{ marginTop: 16 }}>
                <View style={rm.floorBar}>
                  <Text style={rm.floorBarText}>{t('rooms.floorLabel').replace('{n}', floor)}</Text>
                  <Text style={rm.floorBarCount}>{t('rooms.floorRooms').replace('{n}', rooms.length)}</Text>
                </View>
                {rooms.map(room => {
                  const st = STATUS[room.status];
                  const pending = (room.messages || []).filter(m => !m.resolved).length;
                  return (
                    <TouchableOpacity
                      key={room.id}
                      style={[rm.card, { borderLeftColor: st.color }]}
                      onPress={() => goToRoom(room)}
                      activeOpacity={0.75}
                    >
                      <View style={[rm.statusDot, { backgroundColor: st.bg, borderColor: st.border }]}>
                        <Text style={{ fontSize: 14 }}>{st.icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={rm.roomId}>{t('rooms.roomTitle').replace('{id}', room.id)}</Text>
                          <View style={[rm.statusTag, { backgroundColor: st.bg, borderColor: st.border }]}>
                            <Text style={[rm.statusTagText, { color: st.color }]}>{t(st.tKey)}</Text>
                          </View>
                        </View>
                        <Text style={rm.roomMeta}>{room.type} · {room.area} · {room.price} ₫/tháng</Text>
                        {room.tenant && (
                          <Text style={rm.tenantLine}>👤 {room.tenant}  ·  {t('rooms.sinceDate')} {room.sinceDate}</Text>
                        )}
                        {room.currentIssue && (
                          <Text style={rm.issueLine} numberOfLines={1}>⚠️ {room.currentIssue.title}</Text>
                        )}
                        {!room.tenant && room.emptyFrom && (
                          <Text style={rm.emptyLine}>🔓 {t('status.vacant')} {t('staffRooms.emptyFrom')} {room.emptyFrom} · {daysSince(room.emptyFrom)} {t('staffRooms.days')}</Text>
                        )}
                        {pending > 0 && (
                          <Text style={rm.pendingLine}>💬 {pending} {t('staffRooms.pendingMsgs')}</Text>
                        )}
                      </View>
                      <Text style={rm.arrow}>›</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Pending Messages Modal ───────────────────────────────
function PendingMessagesModal({ buildings, onClose, onResolveMessage }) {
  const { t } = useLanguage();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  const pendingList = [];
  buildings.forEach(b => {
    b.floors.forEach(fl => {
      fl.rooms.forEach(r => {
        (r.messages || []).filter(m => !m.resolved).forEach(m => {
          pendingList.push({ ...m, roomId: r.id, tenantName: r.tenant, phone: r.phone, buildingName: b.name });
        });
      });
    });
  });

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[md.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[md.sheet, { transform: [{ translateY }], maxHeight: '85%' }]}>
        <View style={md.handle} />
        <View style={[md.header, { borderLeftWidth: 0 }]}>
          <View style={[md.statusIcon, { backgroundColor: 'rgba(79,172,254,0.12)' }]}>
            <Text style={{ fontSize: 22 }}>💬</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={md.roomTitle}>{t('staffRooms.pendingTitle')}</Text>
            <Text style={md.roomSub}>{pendingList.length} {t('staffRooms.pendingCount')}</Text>
          </View>
          <TouchableOpacity style={md.closeBtn} onPress={handleClose}>
            <Text style={md.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={md.scroll} showsVerticalScrollIndicator={false}>
          {pendingList.length === 0 ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>✅</Text>
              <Text style={{ color: '#2ecc71', fontSize: 14, fontWeight: '700' }}>{t('staffRooms.noPending')}</Text>
            </View>
          ) : (
            pendingList.map((msg, idx) => (
              <View key={`${msg.roomId}-${msg.id}`} style={[md.msgCard, md.msgCardPending, { marginTop: idx === 0 ? 16 : 0 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <View>
                    <Text style={{ color: '#4facfe', fontSize: 13, fontWeight: '700' }}>{t('rooms.roomTitle').replace('{id}', msg.roomId)}</Text>
                    <Text style={{ color: '#8892b0', fontSize: 11, marginTop: 1 }}>🏢 {msg.buildingName}</Text>
                  </View>
                  <Text style={md.msgTime}>{msg.time}</Text>
                </View>
                {msg.tenantName && (
                  <Text style={{ color: '#ccd6f6', fontSize: 12, marginBottom: 8 }}>👤 {msg.tenantName}</Text>
                )}
                <Text style={md.msgText}>"{msg.text}"</Text>
                <View style={md.msgActions}>
                  {msg.phone && (
                    <TouchableOpacity style={md.msgCallBtn} onPress={() => Linking.openURL(`tel:${msg.phone}`)}>
                      <Text style={md.msgCallText}>{t('staffRooms.callHandle')}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={md.msgDoneBtn} onPress={() => onResolveMessage(msg.roomId, msg.id)}>
                    <Text style={md.msgDoneText}>{t('staffRooms.doneBtn')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

// ─── Staff Profile Modal ──────────────────────────────────
function StaffProfileModal({ staff, onClose, onSave }) {
  const { t } = useLanguage();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;
  const [name,      setName]      = useState(staff.name);
  const [phone,     setPhone]     = useState(staff.phone);
  const [gender,    setGender]    = useState(staff.gender || 'female'); // 'male' | 'female'
  const [photoUri,  setPhotoUri]  = useState(staff.photoUri || null);

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
    if (status !== 'granted') {
      Alert.alert(t('staffCust.needPerm'), t('staffCust.permMsg'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleSave = () => {
    if (!name.trim()) { Alert.alert(t('staffCust.missingInfo'), t('staffCust.missingName')); return; }
    const avatar = gender === 'male' ? '👨' : '👩';
    onSave({ name: name.trim(), phone: phone.trim(), avatar, gender, photoUri });
    handleClose();
  };

  const previewAvatar = photoUri ? null : (gender === 'male' ? '👨' : '👩');

  return (
    <Modal visible transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[md.backdrop, { opacity: backdrop }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[md.sheet, { transform: [{ translateY }], maxHeight: '78%' }]}>
        <View style={md.handle} />
        <View style={pf.header}>
          <Text style={pf.title}>{t('staffCust.profileTitle')}</Text>
          <TouchableOpacity style={md.closeBtn} onPress={handleClose}>
            <Text style={md.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={pf.scroll} showsVerticalScrollIndicator={false}>

          {/* Preview avatar */}
          <View style={pf.previewRow}>
            <View style={pf.previewBox}>
              {photoUri
                ? <Image source={{ uri: photoUri }} style={pf.previewPhoto} />
                : <Text style={pf.previewEmoji}>{previewAvatar}</Text>
              }
            </View>
            <View style={pf.previewActions}>
              <Text style={pf.previewName}>{name || t('staffCust.namePh')}</Text>
              <TouchableOpacity style={pf.uploadBtn} onPress={handlePickImage}>
                <Text style={pf.uploadBtnText}>{t('staffCust.uploadPhoto')}</Text>
              </TouchableOpacity>
              {photoUri && (
                <TouchableOpacity style={pf.removePhotoBtn} onPress={() => setPhotoUri(null)}>
                  <Text style={pf.removePhotoText}>{t('staffCust.removePhoto')}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Gender */}
          <Text style={pf.label}>{t('staffCust.gender')}</Text>
          <View style={pf.genderRow}>
            <TouchableOpacity
              style={[pf.genderBtn, gender === 'female' && pf.genderSelected]}
              onPress={() => { setGender('female'); setPhotoUri(null); }}
            >
              <Text style={pf.genderEmoji}>👩</Text>
              <Text style={[pf.genderLabel, gender === 'female' && { color: '#4facfe' }]}>{t('staffCust.female')}</Text>
              {gender === 'female' && !photoUri && <View style={pf.genderCheck}><Text style={{ color: '#fff', fontSize: 10 }}>✓</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity
              style={[pf.genderBtn, gender === 'male' && pf.genderSelected]}
              onPress={() => { setGender('male'); setPhotoUri(null); }}
            >
              <Text style={pf.genderEmoji}>👨</Text>
              <Text style={[pf.genderLabel, gender === 'male' && { color: '#4facfe' }]}>{t('staffCust.male')}</Text>
              {gender === 'male' && !photoUri && <View style={pf.genderCheck}><Text style={{ color: '#fff', fontSize: 10 }}>✓</Text></View>}
            </TouchableOpacity>
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

// ─── Date Picker Helpers ──────────────────────────────────

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

// ─── Date Picker Modal ────────────────────────────────────
function DatePickerModal({ visible, value, onSelect, onClose }) {
  const { t } = useLanguage();
  const MONTHS = t('date.months');
  const DAYS   = t('date.days');
  const today    = new Date();
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
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isSelected = d => d && selected && selected.getDate() === d && selected.getMonth() === viewMonth && selected.getFullYear() === viewYear;
  const isToday    = d => d && today.getDate() === d && today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  const isFuture   = d => d && new Date(viewYear, viewMonth, d) > today;
  const yearRange  = Array.from({ length: 100 }, (_, i) => today.getFullYear() - i);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={dp.overlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
        <View style={dp.card}>
          {!yearMode ? (
            <View style={dp.nav}>
              <TouchableOpacity style={dp.navBtn} onPress={prevMonth}><Text style={dp.navArrow}>‹</Text></TouchableOpacity>
              <TouchableOpacity style={dp.navCenter} onPress={() => setYearMode(true)}>
                <Text style={dp.navTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
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
              <View style={dp.weekRow}>
                {DAYS.map((d, idx) => <Text key={idx} style={[dp.weekDay, idx === 0 && { color: '#e94560' }]}>{d}</Text>)}
              </View>
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
          <View style={dp.actions}>
            <TouchableOpacity style={dp.cancelBtn} onPress={onClose}><Text style={dp.cancelText}>{t('common.cancel')}</Text></TouchableOpacity>
            <TouchableOpacity
              style={[dp.confirmBtn, !selected && dp.confirmBtnDisabled]}
              onPress={() => { if (selected) { onSelect(formatDDMMYYYY(selected)); onClose(); } }}
            >
              <Text style={dp.confirmText}>{selected ? `${t('customers.datePicker')}: ${formatDDMMYYYY(selected)}` : t('customers.noDateSelected')}</Text>
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
  cellSelected:     { backgroundColor: '#4facfe' },
  cellToday:        { borderWidth: 1.5, borderColor: '#4facfe' },
  cellText:         { color: '#ccd6f6', fontSize: 13, fontWeight: '500' },
  cellTextSelected: { color: '#fff', fontWeight: '800' },
  cellTextToday:    { color: '#4facfe', fontWeight: '800' },
  cellTextFuture:   { color: 'rgba(136,146,176,0.35)' },
  yearList:         { maxHeight: 220 },
  yearItem:         { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  yearItemActive:   { backgroundColor: 'rgba(79,172,254,0.15)' },
  yearText:         { color: '#ccd6f6', fontSize: 14, textAlign: 'center' },
  yearTextActive:   { color: '#4facfe', fontWeight: '800' },
  actions:    { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn:  { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelText: { color: '#8892b0', fontWeight: '700', fontSize: 13 },
  confirmBtn: { flex: 2, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: '#4facfe' },
  confirmBtnDisabled: { backgroundColor: 'rgba(79,172,254,0.3)' },
  confirmText: { color: '#1a1a2e', fontWeight: '800', fontSize: 13 },
});

// ─── Check-In Modal ───────────────────────────────────────
function CheckInModal({ visible, room, buildingCode, existingTenants, onClose, onCheckIn }) {
  const { t } = useLanguage();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropOp = useRef(new Animated.Value(0)).current;

  const [mode,          setMode]          = useState('new');
  const [searchQ,       setSearchQ]       = useState('');
  const [showResults,   setShowResults]   = useState(false);
  const [name,          setName]          = useState('');
  const [dob,           setDob]           = useState('');
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [cccd,          setCccd]          = useState('');
  const [phone,         setPhone]         = useState('');
  const [email,         setEmail]         = useState('');
  const [cccdFront,     setCccdFront]     = useState(null);
  const [cccdBack,      setCccdBack]      = useState(null);
  const [roommates,     setRoommates]     = useState([]);

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

  const addRoommate    = () => setRoommates(p => [...p, { id: 'rm' + Date.now(), name: '', cccd: '' }]);
  const removeRoommate = id => setRoommates(p => p.filter(r => r.id !== id));
  const updateRoommate = (id, field, val) => setRoommates(p => p.map(r => r.id === id ? { ...r, [field]: val } : r));

  const roommatesValid = roommates.every(r => r.name.trim() && r.cccd.trim());
  const canSubmit = name.trim() && dob.trim() && cccd.trim() && phone.trim() && roommatesValid;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onCheckIn({ name: name.trim(), dob: dob.trim(), cccd: cccd.trim(), phone: phone.trim(), email: email.trim(), cccdFront, cccdBack, roommates: roommates.filter(r => r.name.trim()) });
    onClose();
  };

  const roomCode = room ? (buildingCode ? `${buildingCode}-${room.id}` : room.id) : '';

  const CiField = ({ label, value, onChange, placeholder, keyboardType, required }) => (
    <View style={ci.fieldWrap}>
      <Text style={ci.fieldLabel}>{label}{required && <Text style={{ color: '#e74c3c' }}> *</Text>}</Text>
      <TextInput style={ci.fieldInput} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#8892b0" keyboardType={keyboardType || 'default'} />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[ci.backdrop, { opacity: backdropOp }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[ci.sheet, { transform: [{ translateY }] }]}>
        <View style={ci.handle} />
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
          <View style={ci.toggleRow}>
            {['new', 'returning'].map(m => (
              <TouchableOpacity key={m} style={[ci.toggleBtn, mode === m && ci.toggleBtnActive]} onPress={() => { setMode(m); resetForm(); setMode(m); }} activeOpacity={0.7}>
                <Text style={[ci.toggleText, mode === m && ci.toggleTextActive]}>{m === 'new' ? `👤 ${t('rooms.tenantInfo')}` : `🔄 ${t('common.search')}`}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'returning' && (
            <View style={ci.searchSection}>
              <Text style={ci.sectionTitle}>{t('rooms.searchCustomer')}</Text>
              <View style={ci.searchBox}>
                <Text style={{ fontSize: 15, marginRight: 8 }}>🔍</Text>
                <TextInput style={ci.searchInput} value={searchQ} onChangeText={v => { setSearchQ(v); setShowResults(true); }} onFocus={() => setShowResults(true)} placeholder={t('rooms.searchCccdPh')} placeholderTextColor="#8892b0" />
                {searchQ.length > 0 && <TouchableOpacity onPress={() => { setSearchQ(''); setShowResults(false); }}><Text style={{ color: '#8892b0', paddingHorizontal: 4 }}>✕</Text></TouchableOpacity>}
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
                <View style={ci.resultEmpty}><Text style={ci.resultEmptyText}>{t('rooms.noCustomerFound')}</Text></View>
              )}
            </View>
          )}

          <Text style={ci.sectionTitle}>{t('rooms.tenantInfoSection')}</Text>
          <CiField label={t('customers.fullName')}                 value={name}  onChange={setName}  placeholder="Nguyễn Văn A"     required />
          <View style={ci.fieldWrap}>
            <Text style={ci.fieldLabel}>{t('rooms.dob')}<Text style={{ color: '#e74c3c' }}> *</Text></Text>
            <TouchableOpacity style={[ci.fieldInput, ci.dobBtn]} onPress={() => setShowDobPicker(true)} activeOpacity={0.7}>
              <Text style={dob ? ci.dobValue : ci.dobPlaceholder}>{dob || t('rooms.dobPh')}</Text>
              <Text style={ci.dobIcon}>📅</Text>
            </TouchableOpacity>
          </View>
          <DatePickerModal visible={showDobPicker} value={dob} onSelect={setDob} onClose={() => setShowDobPicker(false)} />
          <CiField label={t('staff.idLabel').replace(' *', '')}  value={cccd}  onChange={setCccd}  placeholder="0xx xxx xxx xxx" keyboardType="numeric" required />
          <CiField label={t('rooms.phone')}                       value={phone} onChange={setPhone} placeholder="09xx xxx xxx"   keyboardType="phone-pad" required />
          <CiField label="Email"                                  value={email} onChange={setEmail} placeholder="example@email.com" keyboardType="email-address" />

          <Text style={[ci.sectionTitle, { marginTop: 20 }]}>{t('rooms.cccdSection')}</Text>
          <View style={ci.cccdRow}>
            {[{ key: 'front', tKey: 'customers.idFront', val: cccdFront, set: setCccdFront }, { key: 'back', tKey: 'customers.idBack', val: cccdBack, set: setCccdBack }].map(side => (
              <TouchableOpacity key={side.key} style={ci.cccdSlot} onPress={() => pickCccdPhoto(side.key)} activeOpacity={0.75}>
                {side.val
                  ? <Image source={{ uri: side.val }} style={ci.cccdImg} />
                  : <View style={ci.cccdEmpty}><Text style={{ fontSize: 28, marginBottom: 6 }}>📷</Text><Text style={ci.cccdEmptyLabel}>{t(side.tKey)}</Text></View>
                }
                {side.val && <TouchableOpacity style={ci.cccdRemove} onPress={() => side.set(null)}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>✕</Text></TouchableOpacity>}
                <Text style={ci.cccdSlotLabel}>{t(side.tKey)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={ci.roommateHeader}>
            <Text style={ci.sectionTitle}>{t('rooms.roommatesSection')}</Text>
            <TouchableOpacity style={ci.addRmBtn} onPress={addRoommate} activeOpacity={0.7}>
              <Text style={ci.addRmText}>{t('rooms.addRoommate')}</Text>
            </TouchableOpacity>
          </View>
          {roommates.length === 0 && <Text style={ci.rmEmpty}>{t('rooms.noRoommates')}</Text>}
          {roommates.map((rm, i) => (
            <View key={rm.id} style={ci.rmCard}>
              <View style={ci.rmCardHeader}>
                <Text style={ci.rmCardNum}>{t('rooms.roommateN').replace('{n}', i + 1)}</Text>
                <TouchableOpacity onPress={() => removeRoommate(rm.id)}><Text style={ci.rmRemove}>{t('rooms.removeRoommate')}</Text></TouchableOpacity>
              </View>
              <TextInput style={ci.rmInput} value={rm.name} onChangeText={v => updateRoommate(rm.id, 'name', v)} placeholder="Họ và tên..." placeholderTextColor="#8892b0" />
              <TextInput style={[ci.rmInput, { marginTop: 8 }]} value={rm.cccd} onChangeText={v => updateRoommate(rm.id, 'cccd', v)} placeholder="Số CCCD..." placeholderTextColor="#8892b0" keyboardType="numeric" />
            </View>
          ))}

          {!canSubmit && (
            <Text style={ci.required}>
              {!roommatesValid ? t('rooms.reqRoommates') : t('rooms.reqFields')}
            </Text>
          )}
          <TouchableOpacity style={[ci.submitBtn, !canSubmit && ci.submitBtnDisabled]} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={ci.submitText}>✅  {t('common.confirm')} {t('rooms.checkIn')}</Text>
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

// ─── Main Screen ──────────────────────────────────────────
export default function StaffRoomsScreen() {
  const { t } = useLanguage();
  const { buildings, setBuildings } = useBuildings();
  const [search,       setSearch]       = useState('');
  const [filter,       setFilter]       = useState('all');
  const [selected,     setSelected]     = useState(null);
  const [selBuilding,  setSelBuilding]  = useState(null);
  const [showProfile,  setShowProfile]  = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [roomsModal,   setRoomsModal]   = useState(null);
  const [checkInRoom,  setCheckInRoom]  = useState(null);
  const { staff, updateStaff: setStaff } = useStaff();
  const myBuildings = buildings.filter(b => b.staff === staff.name);
  const navigation = useNavigation();

  const handleSelectRoom = room => {
    const b = myBuildings.find(b => b.floors.some(fl => fl.rooms.some(r => r.id === room.id)));
    setSelBuilding(b || null);
    setSelected(room);
  };

  const handleLogout = () => {
    Alert.alert(
      t('staffCust.logoutTitle'),
      t('staffCust.logoutMsg'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: () => navigation.getParent()?.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] })
          ),
        },
      ]
    );
  };

  // ── Đánh dấu tin nhắn đã xử lý ──
  const handleResolveMessage = (roomId, msgId, resolveData) => {
    const updater = rooms => rooms.map(r => {
      if (r.id !== roomId) return r;
      const updatedMessages = r.messages.map(m =>
        m.id === msgId ? { ...m, resolved: true, resolvedBy: resolveData } : m
      );
      const stillPending = updatedMessages.some(m => !m.resolved);
      const newStatus = !stillPending && r.tenant &&
        (r.status === 'maintenance' || r.status === 'urgent') ? 'occupied' : r.status;
      return { ...r, messages: updatedMessages, status: newStatus, currentIssue: stillPending ? r.currentIssue : null };
    });
    setBuildings(prev => prev.map(b => ({
      ...b, floors: b.floors.map(f => ({ ...f, rooms: updater(f.rooms) })),
    })));
    setSelected(prev => prev?.id === roomId ? updater([prev])[0] : prev);
  };

  const handleSaveCccdImages = (roomId, images) => {
    setBuildings(prev => prev.map(b => ({
      ...b, floors: b.floors.map(f => ({
        ...f, rooms: f.rooms.map(r => r.id === roomId ? { ...r, cccdImages: images } : r),
      })),
    })));
  };

  const allRooms   = myBuildings.flatMap(b => b.floors.flatMap(f => f.rooms));
  const hasPendingIssue = r => (r.messages || []).some(m => !m.resolved);
  const issueCount = allRooms.filter(r =>
    r.status === 'urgent' || r.status === 'maintenance' ||
    (r.status === 'occupied' && hasPendingIssue(r))
  ).length;
  const pendingMsgs = allRooms.flatMap(r => (r.messages || []).filter(m => !m.resolved));
  const existingTenants = allRooms
    .filter(r => r.tenant)
    .map(r => ({ id: r.id, name: r.tenant, cccd: r.tenantCccd || '', phone: r.phone || '', dob: '', email: '' }));

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

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <CheckInModal
        visible={!!checkInRoom}
        room={checkInRoom}
        buildingCode={checkInRoom ? myBuildings.find(b => b.floors.some(f => f.rooms.some(r => r.id === checkInRoom.id)))?.code : null}
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
        onResolveMessage={handleResolveMessage}
        onSaveCccdImages={handleSaveCccdImages}
        onCheckout={handleCheckout}
        onStartCheckIn={room => setCheckInRoom(room)}
      />

      {showProfile && (
        <StaffProfileModal
          staff={staff}
          onClose={() => setShowProfile(false)}
          onSave={updated => setStaff(updated)}
        />
      )}

      {roomsModal && (
        <BuildingRoomsModal
          data={roomsModal}
          onClose={() => setRoomsModal(null)}
          onSelectRoom={room => { setRoomsModal(null); handleSelectRoom(room); }}
        />
      )}

      {showMessages && (
        <PendingMessagesModal
          buildings={buildings}
          onClose={() => setShowMessages(false)}
          onResolveMessage={(roomId, msgId) => { handleResolveMessage(roomId, msgId); }}
        />
      )}

      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.header}>
          <View style={s.headerRow}>
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
            <View style={{ alignItems: 'flex-end', paddingTop: 4 }}>
              <LanguageSwitcher />
            </View>
          </View>
          <Text style={s.title}>{t('nav.roomsOverview')}</Text>
          <Text style={s.subtitle}>22/04/2026</Text>
        </LinearGradient>

        {/* ── Tóm tắt công việc ── */}
        {issueCount > 0 && (
          <View style={s.taskPanel}>
            <Text style={s.taskPanelTitle}>{t('staffRooms.todayTasks')}</Text>
            <View style={s.taskRow}>
              <TouchableOpacity style={[s.taskCard, s.taskCardYellow]} onPress={() => setFilter('incident')}>
                <Text style={s.taskCardNum}>{issueCount}</Text>
                <Text style={s.taskCardLabel}>{t('rooms.filterIncident')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder={t('staffRooms.searchPh')}
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

        {/* Buildings */}
        {myBuildings.map(b => (
          <StaffBuildingCard
            key={b.id}
            building={b}
            filter={filter}
            search={search}
            onSelectRoom={handleSelectRoom}
            onRoomsModal={setRoomsModal}
          />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Floor Diagram ────────────────────────────────────────
function FloorDiagram({ floors, buildingCode, onSelectRoom }) {
  const sorted = [...floors].sort((a, b) => a.floor - b.floor);
  return (
    <View style={fd.wrap}>
      {sorted.map(fl => (
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
                    ? <Text style={[fd.boxSub, { color: st.color }]}>{room.residents ?? 1}👤</Text>
                    : room.status === 'empty'
                    ? <Text style={[fd.boxSub, { color: '#8892b0' }]}>{daysSince(room.emptySince || room.emptyFrom)}d</Text>
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

function Pill({ val, lbl, color, active, onPress }) {
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <Wrap
      style={[s.pill, color && { borderColor: color + '44' }, active && color && { backgroundColor: color + '22', borderColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[s.pillVal, color && { color }]}>{val}</Text>
      <Text style={s.pillLbl}>{lbl}</Text>
    </Wrap>
  );
}

// ─── Staff Building Card ──────────────────────────────────
function StaffBuildingCard({ building, filter, search, onSelectRoom, onRoomsModal }) {
  const { t } = useLanguage();
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
    const matchFlt = filter === 'all'
      || (filter === 'incident' && (room.status === 'maintenance' || room.status === 'urgent' || (room.status === 'occupied' && hasPending(room))))
      || (FILTER_MAP[filter] && room.status === FILTER_MAP[filter]);
    const matchPill = !pillFilter || pillFilter === 'total'
      || (pillFilter === 'occupied' && room.status === 'occupied' && !hasPending(room))
      || (pillFilter === 'empty'    && room.status === 'empty')
      || (pillFilter === 'incident' && (room.status === 'maintenance' || room.status === 'urgent' || (room.status === 'occupied' && hasPending(room))));
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

      {/* Occupancy bar */}
      {cnt.total > 0 && (
        <View style={s.occRow}>
          <View style={s.occBar}>
            <View style={[s.occFill, { width: `${pct}%` }]} />
          </View>
          <Text style={s.occText}>{pct}% ({cnt.occupied}/{cnt.total})</Text>
        </View>
      )}

      {/* Status pills */}
      {cnt.total > 0 && (
        <View style={s.pillRow}>
          <Pill val={cnt.total}         lbl={t('rooms.pillTotal')}    active={pillFilter === 'total'}    onPress={() => togglePill('total')} />
          <Pill val={cnt.occupiedClean} lbl={t('rooms.pillOccupied')} color="#2ecc71" active={pillFilter === 'occupied'} onPress={() => togglePill('occupied')} />
          <Pill val={cnt.empty}         lbl={t('rooms.pillEmpty')}    color="#8892b0" active={pillFilter === 'empty'}    onPress={() => togglePill('empty')} />
          <Pill val={cnt.issues}        lbl={t('rooms.pillIncident')} color="#f1c40f" active={pillFilter === 'incident'} onPress={() => togglePill('incident')} />
        </View>
      )}

      {/* Floor diagram */}
      {open && building.floors.length > 0 && (
        <FloorDiagram floors={building.floors} buildingCode={building.code} onSelectRoom={onSelectRoom} />
      )}

      {/* Floor list with room rows */}
      {open && building.floors.map(floor => {
        const visible = floor.rooms.filter(matchRoom);
        if (!visible.length) return null;
        return (
          <View key={floor.floor} style={s.floorSection}>
            <View style={s.floorLabel}>
              <Text style={s.floorText}>{t('rooms.floorLabel').replace('{n}', floor.floor)}</Text>
              <Text style={s.floorCount}>{t('rooms.floorRooms').replace('{n}', visible.length)}</Text>
            </View>
            {visible.map(room => {
              const pending = (room.messages || []).filter(m => !m.resolved).length;
              const baseSt  = STATUS[room.status];
              const st      = (pending > 0 && room.status === 'occupied') ? STATUS.maintenance : baseSt;
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
                          {room.status === 'urgent'       ? t('rooms.statusUrgent')
                            : room.status === 'maintenance' ? t('rooms.statusMaint')
                            : t('rooms.statusEmptyRoom')}
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
                    {room.currentIssue && (
                      <Text style={s.issuePeek} numberOfLines={1}>⚠️ {room.currentIssue.title}</Text>
                    )}
                  </View>
                  <View style={s.roomRight}>
                    <View style={[s.statusPill, { backgroundColor: st.bg, borderColor: st.border }]}>
                      <Text style={[s.statusText, { color: st.color }]}>{st.icon} {t(st.tKey)}</Text>
                    </View>
                    <Text style={s.roomPrice}>{room.price} ₫</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header: { padding: 20, paddingTop: 10, paddingBottom: 16 },
  headerRow: { marginBottom: 14 },
  staffCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  staffAvatarBox: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(79,172,254,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14, position: 'relative', overflow: 'hidden' },
  staffAvatarEmoji: { fontSize: 28 },
  staffAvatarPhoto: { width: 52, height: 52, borderRadius: 26 },
  staffInfo: { flex: 1 },
  staffName: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 0.3 },
  staffRoleBadge: { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4, marginBottom: 4 },
  staffRoleText: { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  staffPhone: { color: '#8892b0', fontSize: 12 },
  staffActions: { gap: 6, justifyContent: 'center' },
  editBadge: { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)', alignItems: 'center' },
  editBadgeText: { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  logoutBadge: { backgroundColor: 'rgba(233,69,96,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(233,69,96,0.3)', alignItems: 'center' },
  logoutBadgeText: { color: '#e94560', fontSize: 11, fontWeight: '700' },
  title: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 14 },
  subtitle: { color: '#8892b0', fontSize: 13, marginTop: 6, marginBottom: 4 },
  taskPanel: { margin: 16, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  taskPanelTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  taskRow: { flexDirection: 'row', gap: 10 },
  taskCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1 },
  taskCardRed:    { backgroundColor: 'rgba(233,69,96,0.1)',  borderColor: 'rgba(233,69,96,0.35)' },
  taskCardYellow: { backgroundColor: 'rgba(241,196,15,0.1)', borderColor: 'rgba(241,196,15,0.35)' },
  taskCardBlue:   { backgroundColor: 'rgba(79,172,254,0.1)', borderColor: 'rgba(79,172,254,0.35)' },
  taskCardNum:   { fontSize: 28, fontWeight: '900', color: '#fff' },
  taskCardLabel: { color: '#ccd6f6', fontSize: 12, fontWeight: '600', marginTop: 2 },
  taskCardHint:  { color: '#8892b0', fontSize: 10, marginTop: 3 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', margin: 16, marginBottom: 10, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#fff', paddingVertical: 12, fontSize: 14 },
  filterScroll: { paddingLeft: 16, marginBottom: 12 },
  filterRow: { gap: 8, paddingRight: 16 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterActive: { backgroundColor: '#e94560', borderColor: '#e94560' },
  filterText: { color: '#8892b0', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  buildingCard:    { marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  buildingHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  buildingIconBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(79,172,254,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  buildingName:    { color: '#fff', fontSize: 15, fontWeight: '800' },
  buildingCode:    { color: '#4facfe', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginTop: 1 },
  buildingAddr:    { color: '#8892b0', fontSize: 12, marginTop: 2 },
  collapseIcon:    { color: '#8892b0', fontSize: 12 },
  occRow:          { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  occBar:          { flex: 1, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  occFill:         { height: 5, backgroundColor: '#2ecc71', borderRadius: 3 },
  occText:         { color: '#2ecc71', fontSize: 10, fontWeight: '700', width: 80 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 10 },
  pill:    { borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingVertical: 6, paddingHorizontal: 8, alignItems: 'center', minWidth: 44 },
  pillVal: { color: '#fff', fontSize: 13, fontWeight: '800' },
  pillLbl: { color: '#8892b0', fontSize: 9, marginTop: 1 },
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
  issuePeek:  { color: '#f1c40f', fontSize: 11, marginTop: 3 },
  roomRight:  { alignItems: 'flex-end', gap: 5 },
  statusPill: { flexDirection: 'row', borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  roomPrice:  { color: '#4facfe', fontSize: 12, fontWeight: '700' },
});

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
  checkInBtn:      { marginTop: 10, backgroundColor: 'rgba(46,204,113,0.1)', borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(46,204,113,0.35)' },
  checkInBtnText:  { color: '#2ecc71', fontWeight: '700', fontSize: 13 },
  checkoutBtn:     { marginTop: 10, backgroundColor: 'rgba(231,76,60,0.08)', borderRadius: 10, paddingVertical: 11, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(231,76,60,0.3)' },
  checkoutBtnText: { color: '#e74c3c', fontWeight: '700', fontSize: 13 },
  checkoutPanel:      { marginTop: 10, backgroundColor: 'rgba(231,76,60,0.06)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(231,76,60,0.25)' },
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
  checkoutConfirmText:{ color: '#fff', fontWeight: '800', fontSize: 13 },
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
  contractorWrap:       { backgroundColor: 'rgba(241,196,15,0.05)', borderRadius: 10, padding: 10, marginTop: 4, marginBottom: 6, borderWidth: 1, borderColor: 'rgba(241,196,15,0.2)' },
  contractorFieldLabel: { color: '#8892b0', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  contractorInput:      { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 13, paddingHorizontal: 12, paddingVertical: 9 },
  contractorInputMulti: { minHeight: 64, textAlignVertical: 'top', paddingTop: 9 },
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
  cccdEmpty:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cccdEmptyText:{ color: '#8892b0', fontSize: 13, fontWeight: '600', flex: 1 },
  cccdPickBtn:  { backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 9, paddingVertical: 7, paddingHorizontal: 12, borderWidth: 1, borderColor: 'rgba(79,172,254,0.28)' },
  cccdPickText: { color: '#4facfe', fontWeight: '700', fontSize: 12 },
  cccdImgWrap:  { width: 120, height: 76, borderRadius: 10, overflow: 'visible' },
  cccdImg:      { width: 120, height: 76, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)' },
  cccdRemove:   { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: '#e94560', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  cccdAddBtn:   { width: 120, height: 76, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderStyle: 'dashed', backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center', gap: 4 },
  cccdAddText:  { color: '#8892b0', fontSize: 11, fontWeight: '600' },
});

const pf = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  scroll: { padding: 20 },
  label: { color: '#8892b0', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  // preview area
  previewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  previewBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(79,172,254,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(79,172,254,0.4)' },
  previewPhoto: { width: 80, height: 80, borderRadius: 40 },
  previewEmoji: { fontSize: 42 },
  previewActions: { flex: 1, gap: 8 },
  previewName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  uploadBtn: { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(79,172,254,0.35)' },
  uploadBtnText: { color: '#4facfe', fontSize: 13, fontWeight: '700' },
  removePhotoBtn: { marginTop: 4, alignSelf: 'flex-start' },
  removePhotoText: { color: '#e94560', fontSize: 12 },
  // gender selection
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  genderBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  genderSelected: { borderColor: '#4facfe', backgroundColor: 'rgba(79,172,254,0.1)' },
  genderEmoji: { fontSize: 36, marginBottom: 6 },
  genderLabel: { color: '#8892b0', fontSize: 14, fontWeight: '700' },
  genderCheck: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, backgroundColor: '#4facfe', justifyContent: 'center', alignItems: 'center' },
  // legacy (kept for safety)
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  avatarOption: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'transparent', position: 'relative' },
  avatarSelected: { borderColor: '#4facfe', backgroundColor: 'rgba(79,172,254,0.15)' },
  avatarEmoji: { fontSize: 26 },
  avatarCheck: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: '#4facfe', justifyContent: 'center', alignItems: 'center' },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, color: '#fff', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  saveBtn: { borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  saveGradient: { paddingVertical: 15, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});

// ─── Building Rooms Modal Styles ─────────────────────────
const rm = StyleSheet.create({
  floorBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(79,172,254,0.2)', marginBottom: 10 },
  floorBarText: { color: '#4facfe', fontSize: 13, fontWeight: '700' },
  floorBarCount: { color: '#8892b0', fontSize: 12 },
  card: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 13, marginBottom: 9, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderLeftWidth: 4 },
  statusDot: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0 },
  roomId: { color: '#fff', fontSize: 14, fontWeight: '800' },
  statusTag: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  statusTagText: { fontSize: 10, fontWeight: '700' },
  roomMeta: { color: '#8892b0', fontSize: 11, marginTop: 3 },
  tenantLine: { color: '#ccd6f6', fontSize: 12, marginTop: 4 },
  issueLine: { color: '#f1c40f', fontSize: 11, marginTop: 3 },
  emptyLine: { color: '#8892b0', fontSize: 11, marginTop: 3 },
  pendingLine: { color: '#e94560', fontSize: 11, marginTop: 3, fontWeight: '700' },
  arrow: { color: '#8892b0', fontSize: 22, marginLeft: 8, alignSelf: 'center' },
});

// ─── Floor Diagram Styles ─────────────────────────────────
const fd = StyleSheet.create({
  wrap: { marginTop: 4, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  floorTag: { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(79,172,254,0.12)', justifyContent: 'center', alignItems: 'center', marginRight: 8, flexShrink: 0 },
  floorTagText: { color: '#4facfe', fontSize: 11, fontWeight: '800' },
  rooms: { flexDirection: 'row', gap: 5, justifyContent: 'flex-start' },
  box: { width: 54, borderRadius: 8, borderWidth: 1, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  boxId:   { fontSize: 10, fontWeight: '800', lineHeight: 13 },
  boxSub:  { fontSize: 9, fontWeight: '700', marginTop: 1 },
  boxIcon: { fontSize: 9, marginTop: 2 },
});
