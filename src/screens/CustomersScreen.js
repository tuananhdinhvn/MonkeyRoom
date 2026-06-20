import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useBuildings } from '../context/BuildingsContext';
import { supabase } from '../lib/supabase';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Modal, Animated, ScrollView, Alert, Image,
  Dimensions, StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const SCREEN_H = Dimensions.get('window').height;

function formatMoney(n) {
  if (!n && n !== 0) return '—';
  return Number(n).toLocaleString('vi-VN') + ' ₫';
}

// ─── Date Picker Modal ────────────────────────────────────
function DatePickerModal({ visible, value, onConfirm, onClose }) {
  const { t } = useLanguage();
  const MONTHS = t('date.months');
  const DAYS   = t('date.days');
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
          <Text style={dp.title}>{t('customers.datePicker')}</Text>

          {/* Month navigation */}
          <View style={dp.navRow}>
            <TouchableOpacity style={dp.navBtn} onPress={prevMonth}>
              <Text style={dp.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={dp.navLabel}>{MONTHS[navM]}</Text>
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
            {DAYS.map((d, idx) => (
              <View key={d} style={dp.dowCell}>
                <Text style={[dp.dowText, idx === 0 && { color: '#e94560' }]}>{d}</Text>
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
                {t('customers.dateSelected')} {String(selD).padStart(2,'0')}/{String((selM ?? 0) + 1).padStart(2,'0')}/{selY}
              </Text>
            ) : (
              <Text style={dp.selectedPlaceholder}>{t('customers.noDateSelected')}</Text>
            )}
          </View>

          {/* Confirm / Cancel */}
          <View style={dp.btnRow}>
            <TouchableOpacity style={dp.cancelBtn} onPress={onClose}>
              <Text style={dp.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dp.confirmBtn, selD == null && { opacity: 0.4 }]}
              onPress={handleConfirm}
              disabled={selD == null}
            >
              <Text style={dp.confirmText}>{t('common.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}


// ─── Building & Status helpers ────────────────────────────
const BUILDING_CODES = {
  'Nhà A - Green Home':  'GHA',
  'Nhà B - Blue Sky':    'BLS',
  'Nhà C - Sunrise':     'SRH',
  'Nhà D - Ocean View':  'OVD',
};

function getRoomCode(building, room) {
  const code = BUILDING_CODES[building] || 'UNK';
  if (!room || room === '—') return '—';
  // DB room_id có thể dạng "4-2-203" hoặc "b1-1-1234-101" → chỉ lấy phần cuối
  const parts = String(room).split('-');
  const num = parts.length >= 2
    ? parts[parts.length - 1]
    : parts[0].replace(/^[A-Za-z](?=\d)/, '');
  return `${code}-${num}`;
}

const STATUS_CFG = {
  ok:      { icon: '✅', color: '#2ecc71', tKey: 'status.normal' },
  warning: { icon: '⚠️', color: '#f1c40f', tKey: 'status.issue'  },
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
  const { t } = useLanguage();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdrop   = useRef(new Animated.Value(0)).current;
  const openedId   = useRef(null);
  const [visible,        setVisible]        = useState(false);
  const [stayHistory,    setStayHistory]    = useState([]);
  const [expandedStayId, setExpandedStayId] = useState(null);

  useEffect(() => {
    if (!customer) { setStayHistory([]); return; }
    const cccd  = customer.cccd;
    const phone = customer.phone;
    if (!cccd && !phone) { setStayHistory([]); return; }
    setExpandedStayId(null);
    const conds = [
      cccd  ? `tenant_cccd.eq.${cccd}`   : null,
      phone ? `tenant_phone.eq.${phone}` : null,
    ].filter(Boolean).join(',');
    supabase
      .from('tenant_history')
      .select('*, buildings(name, code)')
      .or(conds)
      .order('move_out_date', { ascending: false })
      .then(({ data }) => { if (data) setStayHistory(data); });
  }, [customer?.id]);

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
                          <Text style={dt.formerBadgeText}>🚪 {t('customers.leftBadge')} · {c.moveOutDate}</Text>
                        </View>
                      ) : (
                        <View style={[dt.statusBadge, { backgroundColor: `${stCfg.color}22`, borderColor: `${stCfg.color}55` }]}>
                          <Text style={[dt.statusText, { color: stCfg.color }]}>
                            {stCfg.icon} {t(stCfg.tKey)}
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
                <Text style={dt.callBtnText}>{t('customers.call')}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={dt.scroll} showsVerticalScrollIndicator={false}>

              {/* Personal info */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>{t('customers.personalInfo')}</Text>
                <View style={dt.card}>
                  <DtRow label={t('customers.customerId')}  value={getCustomerId(c.phone)} accent />
                  <DtRow label={t('customers.fullName')}    value={c.name} />
                  <DtRow label={t('customers.phone')}       value={c.phone} />
                  <DtRow label="Số CCCD"                    value={c.cccd || '—'} />
                  <DtRow label={t('customers.email')}       value={c.email} />
                  <DtRow label={t('customers.birthday')}    value={c.dob} />
                </View>
              </View>

              {/* CCCD — moved below personal info */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>{t('customers.idCard')}</Text>
                <View style={dt.idCardRow}>
                  <View style={dt.idCardBox}>
                    {c.idFront
                      ? <Image source={{ uri: c.idFront }} style={dt.idCardImg} />
                      : <View style={dt.idCardEmpty}>
                          <Text style={dt.idCardEmptyIcon}>🪪</Text>
                          <Text style={dt.idCardEmptyText}>{t('customers.noIdFront')}</Text>
                        </View>
                    }
                    <View style={dt.idCardLabel}><Text style={dt.idCardLabelText}>{t('customers.idFront')}</Text></View>
                  </View>
                  <View style={dt.idCardBox}>
                    {c.idBack
                      ? <Image source={{ uri: c.idBack }} style={dt.idCardImg} />
                      : <View style={dt.idCardEmpty}>
                          <Text style={dt.idCardEmptyIcon}>🪪</Text>
                          <Text style={dt.idCardEmptyText}>{t('customers.noIdBack')}</Text>
                        </View>
                    }
                    <View style={dt.idCardLabel}><Text style={dt.idCardLabelText}>{t('customers.idBack')}</Text></View>
                  </View>
                </View>
              </View>

              {/* Rental info */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>{t('customers.rentalInfo')}</Text>
                <View style={dt.card}>
                  <DtRow label={t('customers.roomCode')}     value={(c.building && c.room) ? getRoomCode(c.building, c.room) : '—'} accent />
                  <DtRow label={t('customers.buildingLabel')} value={c.building || '—'} />
                  <DtRow label={t('customers.sinceDate')}    value={c.since    || '—'} />
                  <DtRow label={t('customers.rentPerMonth')} value={c.amount   ? `${c.amount} ₫` : '—'} />
                  {c.hasMoveout && (
                    <View style={dt.row}>
                      <Text style={dt.rowLabel}>{t('customers.requests')}</Text>
                      <Text style={[dt.rowValue, { color: '#f1c40f', fontWeight: '700' }]}>
                        {t('customers.moveOut')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Payment history */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>{t('customers.payHistory')}</Text>
                {(!c.paymentHistory || c.paymentHistory.length === 0) ? (
                  <View style={dt.emptyBox}>
                    <Text style={dt.emptyText}>{t('customers.noPayHistory')}</Text>
                  </View>
                ) : (
                  <View style={dt.historyTable}>
                    <View style={dt.historyHeader}>
                      <Text style={[dt.historyCell, dt.historyCellHead, { flex: 1.2 }]}>{t('customers.month')}</Text>
                      <Text style={[dt.historyCell, dt.historyCellHead, { flex: 1.6 }]}>{t('customers.amount')}</Text>
                      <Text style={[dt.historyCell, dt.historyCellHead, { flex: 1.4 }]}>{t('customers.payDate')}</Text>
                      <Text style={[dt.historyCell, dt.historyCellHead, { flex: 1.4 }]}>{t('customers.method')}</Text>
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
                <Text style={dt.sectionTitle}>{t('customers.incidentHistory')}</Text>
                {(!c.incidentHistory || c.incidentHistory.length === 0) ? (
                  <View style={dt.emptyBox}>
                    <Text style={dt.emptyText}>{t('customers.noIncident')}</Text>
                  </View>
                ) : (
                  c.incidentHistory.map((inc, i) => (
                    <View key={i} style={dt.incidentRow}>
                      <View style={dt.incidentLeft}>
                        <Text style={dt.incidentIssue}>{inc.issue}</Text>
                        <Text style={dt.incidentBy}>{t('customers.resolvedBy')} {inc.resolvedBy}</Text>
                      </View>
                      <Text style={dt.incidentTime}>{inc.resolvedAt}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Rental history */}
              <View style={dt.section}>
                <Text style={dt.sectionTitle}>{t('customers.rentalHistory')}</Text>

                {/* Phòng hiện tại (đang ở) hoặc phòng gần nhất (khách cũ) */}
                {c.building && c.room && (
                  <View style={dt.stayCard}>
                    <View style={dt.stayCardHeader}>
                      <View style={dt.stayCardLeft}>
                        <Text style={dt.stayRoomCode}>{getRoomCode(c.building, c.room)}</Text>
                        <Text style={dt.stayBuilding}>{c.building}</Text>
                        <Text style={dt.stayDates}>
                          {c.isFormer
                            ? `${c.since || '?'} → ${c.moveOutDate || '?'}`
                            : `Từ ${c.since || '?'}`}
                        </Text>
                        {/* Tóm tắt thanh toán phòng hiện tại (active tenant) */}
                        {!c.isFormer && c.paymentHistory && c.paymentHistory.length > 0 && (() => {
                          const paidN = c.paymentHistory.filter(p => p.paid).length;
                          const total = c.paymentHistory.length;
                          return (
                            <Text style={dt.stayPayLine}>
                              {paidN}/{total} tháng đã đóng
                              {paidN < total ? ' · Còn nợ' : ' · Đầy đủ ✓'}
                            </Text>
                          );
                        })()}
                        {/* Tóm tắt thanh toán phòng cuối (former) */}
                        {c.isFormer && c.paymentSummary && (
                          <Text style={dt.stayPayLine}>
                            {c.paymentSummary.paid_count}/{c.paymentSummary.total_months} tháng đã đóng
                            {c.paymentSummary.total_unpaid > 0
                              ? ` · Nợ ${formatMoney(c.paymentSummary.total_unpaid)}`
                              : ' · Đầy đủ ✓'}
                          </Text>
                        )}
                      </View>
                      <View style={[dt.stayBadge, c.isFormer ? dt.stayBadgeLast : dt.stayBadgeCurrent]}>
                        <Text style={dt.stayBadgeText}>{c.isFormer ? 'Đã ở' : 'Đang ở ✓'}</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Lịch sử các phòng đã từng ở (từ tenant_history) */}
                {stayHistory
                  .filter(h => c.isFormer ? h.id !== c.id : true)
                  .map((h) => {
                    const isExp   = expandedStayId === h.id;
                    const bName   = h.buildings?.name || h.building_id || '—';
                    const code    = getRoomCode(bName, h.room_id);
                    const ps      = h.payment_summary;
                    return (
                      <View key={h.id} style={dt.stayCard}>
                        <TouchableOpacity
                          style={dt.stayCardHeader}
                          onPress={() => setExpandedStayId(isExp ? null : h.id)}
                          activeOpacity={0.7}
                        >
                          <View style={dt.stayCardLeft}>
                            <Text style={dt.stayRoomCode}>{code}</Text>
                            <Text style={dt.stayBuilding}>{bName}</Text>
                            <Text style={dt.stayDates}>
                              {h.since_date || '?'} → {h.move_out_date || '?'}
                            </Text>
                            {ps
                              ? <Text style={dt.stayPayLine}>
                                  {ps.paid_count}/{ps.total_months} tháng đã đóng
                                  {ps.total_unpaid > 0
                                    ? ` · Nợ ${formatMoney(ps.total_unpaid)}`
                                    : ' · Đầy đủ ✓'}
                                </Text>
                              : <Text style={[dt.stayPayLine, { fontStyle: 'italic' }]}>Chưa có dữ liệu thanh toán</Text>
                            }
                          </View>
                          <View style={{ alignItems: 'flex-end', gap: 6 }}>
                            <View style={dt.stayBadgePast}><Text style={dt.stayBadgeText}>Đã ở</Text></View>
                            {ps?.records?.length > 0 && (
                              <Text style={dt.stayDetailBtn}>{isExp ? 'Ẩn ▴' : 'Chi tiết ▾'}</Text>
                            )}
                          </View>
                        </TouchableOpacity>

                        {/* Bảng chi tiết thanh toán */}
                        {isExp && ps?.records && (
                          <View style={dt.stayPayTable}>
                            <View style={dt.stayPayTableHead}>
                              <Text style={[dt.stayPayCell, dt.stayPayCellHead, { flex: 1.2 }]}>Tháng</Text>
                              <Text style={[dt.stayPayCell, dt.stayPayCellHead, { flex: 1.6 }]}>Số tiền</Text>
                              <Text style={[dt.stayPayCell, dt.stayPayCellHead, { flex: 1.3 }]}>Ngày đóng</Text>
                              <Text style={[dt.stayPayCell, dt.stayPayCellHead, { flex: 1 }]}>TT</Text>
                            </View>
                            {ps.records.map((p, j) => (
                              <View key={j} style={[dt.stayPayTableRow, j % 2 === 0 && dt.stayPayTableRowAlt]}>
                                <Text style={[dt.stayPayCell, { flex: 1.2 }]}>{p.month || '—'}</Text>
                                <Text style={[dt.stayPayCell, { flex: 1.6 }]}>{p.amount ? formatMoney(p.amount) : '—'}</Text>
                                <Text style={[dt.stayPayCell, { flex: 1.3 }]}>{p.paid_at || '—'}</Text>
                                <Text style={[dt.stayPayCell, { flex: 1, fontWeight: '700', color: p.paid ? '#2ecc71' : '#e94560' }]}>
                                  {p.paid ? '✓' : '✗ Nợ'}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })
                }

                {stayHistory.length === 0 && !c.building && !c.room && (
                  <View style={dt.emptyBox}>
                    <Text style={dt.emptyText}>{t('customers.noRentalHist')}</Text>
                  </View>
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

// ─── Main Screen ──────────────────────────────────────────
export default function CustomersScreen() {
  const { buildings } = useBuildings();
  const { t } = useLanguage();
  const [search,           setSearch]           = useState('');
  const [activeFilter,     setActiveFilter]     = useState('Tất cả');
  const [detailCustomer,   setDetailCustomer]   = useState(null);
  const [formerCustomers,  setFormerCustomers]  = useState([]);

  useEffect(() => {
    supabase.from('tenant_history').select('*, buildings(name, code)').then(({ data, error }) => {
      if (error) { console.warn('[CustomersScreen] tenant_history error:', error.message); return; }
      if (!data) return;
      setFormerCustomers(data.map(th => ({
        id:             th.id,
        name:           th.tenant_name  || '—',
        phone:          th.tenant_phone || '',
        cccd:           th.tenant_cccd  || '',
        email:          th.tenant_email || '',
        dob:            th.tenant_dob   || '',
        paymentSummary: th.payment_summary || null,
        roomPrice:      th.room_price      || null,
        building:       th.buildings?.name || th.building_id || '—',
        room:           th.room_id || '—',
        since:          th.since_date || '',
        paid:           true,
        amount:         '',
        avatar:         { type: 'male' },
        idFront:        null,
        idBack:         null,
        isFormer:       true,
        moveOutDate:    th.move_out_date || '',
        moveOutReason:  th.move_out_reason || '',
        daysUntilDue:   0,
        hasRequest:     false,
        hasMoveout:     false,
        hasUrgent:      false,
        paymentHistory: [],
        incidentHistory:[],
        rentalHistory:  [],
      })));
    });
  }, [buildings]);

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
              paid:   p.paid,
              amount: p.amount || r.price,
              paidAt: p.paidAt,
              method: p.method,
            })),
            incidentHistory: (r.messages || [])
              .filter(m => m.resolved)
              .map(m => ({ issue: m.text, resolvedBy: m.resolvedBy || '—', resolvedAt: m.time })),
            cccd: r.tenantCccd || '', email: '', dob: r.tenantDob || '', isFormer: false,
            hasRequest: false, hasMoveout: false, hasUrgent: false,
          });
        });
      });
    });
    return tenants;
  }, [buildings]);

  const byName = (a, b) => a.name.localeCompare(b.name, 'vi');
  const matchSearch = c => {
    const q = search.toLowerCase();
    const fullCode = (c.building && c.room)
      ? getRoomCode(c.building, c.room).toLowerCase() : '';
    return !q
      || c.name.toLowerCase().includes(q)
      || (c.phone && c.phone.includes(q))
      || (c.cccd  && c.cccd.includes(q))
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
          <View style={s.headerInner}>
            <View>
              <Text style={s.title}>{t('customers.title')}</Text>
              <Text style={s.subtitle}>{t('customers.headerSub', { n: activeTenants.length, m: formerCustomers.length })}</Text>
            </View>
            <LanguageSwitcher />
          </View>
        </LinearGradient>

        {/* Summary strip */}
        <View style={s.summaryStrip}>
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('Tất cả')}>
            <Text style={s.sumNum}>{activeTenants.length}</Text>
            <Text style={s.sumLbl}>{t('customers.summary.total')}</Text>
          </TouchableOpacity>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('Tốt')}>
            <Text style={[s.sumNum, { color: '#2ecc71' }]}>{totalOk}</Text>
            <Text style={s.sumLbl}>{t('customers.summary.good')}</Text>
          </TouchableOpacity>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('Sự cố')}>
            <Text style={[s.sumNum, { color: '#f1c40f' }]}>{totalWarning}</Text>
            <Text style={s.sumLbl}>{t('customers.summary.issue')}</Text>
          </TouchableOpacity>
          <View style={s.sumDiv} />
          <TouchableOpacity style={s.sumItem} onPress={() => setActiveFilter('Khách cũ')}>
            <Text style={[s.sumNum, { color: '#8892b0' }]}>{formerCustomers.length}</Text>
            <Text style={s.sumLbl}>{t('customers.summary.old')}</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder={t('customers.searchPh')}
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
              <Text style={s.emptyText}>{t('customers.noFound')}</Text>
            </View>
          }
          renderItem={({ item: c }) => {
            if (c.isDivider) {
              return (
                <View style={s.listDivider}>
                  <View style={s.listDividerLine} />
                  <Text style={s.listDividerText}>{t('customers.oldTenants')}</Text>
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
                      ? <Text style={s.moveOutDate}>{t('customers.leftOn')} {c.moveOutDate}</Text>
                      : c.since ? <Text style={s.since}>{t('customers.from')} {c.since}</Text> : null
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

  // Stay history cards
  stayCard:           { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 10, overflow: 'hidden' },
  stayCardHeader:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', padding: 14 },
  stayCardLeft:       { flex: 1, marginRight: 10 },
  stayRoomCode:       { color: '#4facfe', fontSize: 14, fontWeight: '800', letterSpacing: 0.4 },
  stayBuilding:       { color: '#8892b0', fontSize: 12, marginTop: 2 },
  stayDates:          { color: '#ccd6f6', fontSize: 12, marginTop: 3 },
  stayPayLine:        { color: '#8892b0', fontSize: 11, marginTop: 4 },
  stayBadge:          { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  stayBadgeCurrent:   { backgroundColor: 'rgba(46,204,113,0.15)', borderColor: 'rgba(46,204,113,0.35)' },
  stayBadgeLast:      { backgroundColor: 'rgba(136,146,176,0.12)', borderColor: 'rgba(136,146,176,0.3)' },
  stayBadgePast:      { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  stayBadgeText:      { fontSize: 11, fontWeight: '700', color: '#ccd6f6' },
  stayDetailBtn:      { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  stayPayTable:       { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' },
  stayPayTableHead:   { flexDirection: 'row', backgroundColor: 'rgba(79,172,254,0.1)', paddingVertical: 7, paddingHorizontal: 12 },
  stayPayTableRow:    { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12 },
  stayPayTableRowAlt: { backgroundColor: 'rgba(255,255,255,0.03)' },
  stayPayCell:        { color: '#ccd6f6', fontSize: 11, flex: 1 },
  stayPayCellHead:    { color: '#8892b0', fontWeight: '700', fontSize: 10 },

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

  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 30, paddingBottom: 20 },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flex: 1 },
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
