import React, { useState, useMemo, useEffect } from 'react';
import { useBuildings } from '../context/BuildingsContext';
import { supabase } from '../lib/supabase';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions, Modal,
  TextInput, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

const SCREEN_W = Dimensions.get('window').width;
const CHART_H  = 120;

// ─── Static data ──────────────────────────────────────────

const RESOLVE_TYPES = [
  { key: 'admin',      icon: '🧑‍💼', tKey: 'dashboard.resolveAdmin',      color: '#a29bfe', bg: 'rgba(162,155,254,0.12)', border: 'rgba(162,155,254,0.35)' },
  { key: 'staff',      icon: '💼',   tKey: 'dashboard.resolveStaff',      color: '#74b9ff', bg: 'rgba(116,185,255,0.12)', border: 'rgba(116,185,255,0.35)' },
  { key: 'contractor', icon: '🔧',   tKey: 'dashboard.resolveContractor', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)',  border: 'rgba(46,204,113,0.35)'  },
];

const STAFF_ACT_CFG = {
  payment:     { color: '#2ecc71' },
  contract:    { color: '#4facfe' },
  maintenance: { color: '#fee140' },
};

// ─── Birthday data ─────────────────────────────────────────

const BDAY_GROUPS = [
  { key: 'yesterday', tKey: 'dashboard.yesterday', dayOffset: -1, color: '#8892b0', bg: 'rgba(136,146,176,0.1)',  border: 'rgba(136,146,176,0.22)' },
  { key: 'today',     tKey: 'dashboard.today',     dayOffset:  0, color: '#f1c40f', bg: 'rgba(241,196,15,0.1)',   border: 'rgba(241,196,15,0.28)'  },
  { key: 'tomorrow',  tKey: 'dashboard.tomorrow',  dayOffset: +1, color: '#4facfe', bg: 'rgba(79,172,254,0.1)',   border: 'rgba(79,172,254,0.28)'  },
];

// ─── Revenue data computed from Supabase payments ────────

const PERIODS = [
  { key: 'week',  tKey: 'dashboard.week'  },
  { key: 'month', tKey: 'dashboard.month' },
  { key: 'year',  tKey: 'dashboard.year'  },
];

const CHART_TYPES = [
  { key: 'bar',  icon: '▮▮▮' },
  { key: 'line', icon: '╱╲╱' },
];

function fmt(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'T';
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000)         return (n / 1_000).toFixed(0) + 'K';
  return '0';
}

// ─── Horizontal Stacked Bar Chart ────────────────────────
function BarChart({ bars }) {
  const activeBars = bars.filter(b => (b.collected || 0) + (b.overdue || 0) > 0);
  if (activeBars.length === 0) return null;

  const maxTotal = Math.max(...activeBars.map(b => (b.collected || 0) + (b.overdue || 0)));

  return (
    <View>
      {activeBars.map((bar, i) => {
        const total  = (bar.collected || 0) + (bar.overdue || 0);
        const pct    = total > 0 ? Math.round(((bar.collected || 0) / total) * 100) : 0;
        const cW     = (bar.collected || 0) / maxTotal * 100;
        const oW     = (bar.overdue   || 0) / maxTotal * 100;
        const isLast = i === activeBars.length - 1;
        return (
          <View key={i} style={{ marginBottom: isLast ? 0 : 14 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <Text style={ch.hBarLabel}>{bar.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={ch.hBarCollected}>💰 {fmt(bar.collected)}</Text>
                {(bar.overdue || 0) > 0 && <Text style={ch.hBarOverdue}>⏳ {fmt(bar.overdue)}</Text>}
              </View>
            </View>
            <View style={ch.hBarBg}>
              <LinearGradient
                colors={['#4facfe', 'rgba(79,172,254,0.7)']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{
                  height: 8, width: `${cW}%`,
                  borderTopLeftRadius: 4, borderBottomLeftRadius: 4,
                  borderTopRightRadius: oW === 0 ? 4 : 0,
                  borderBottomRightRadius: oW === 0 ? 4 : 0,
                }}
              />
              {oW > 0 && (
                <View style={{ width: `${oW}%`, height: 8, backgroundColor: 'rgba(243,156,18,0.55)', borderTopRightRadius: 4, borderBottomRightRadius: 4 }} />
              )}
            </View>
            <Text style={ch.hBarPct}>{pct}% đã thu</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Dual Line Chart ──────────────────────────────────────
function LineChart({ bars }) {
  const [sel, setSel] = useState(null);

  const activeBars = bars.filter(b => (b.collected || 0) > 0);
  if (activeBars.length < 2) return <BarChart bars={bars} />;

  const allVals = bars.flatMap(b => [b.collected || 0, b.overdue || 0]).filter(v => v > 0);
  const maxVal  = Math.max(...allVals);
  const minVal  = Math.min(...allVals) * 0.85;
  const range   = maxVal - minVal || 1;
  const ITEM_W  = Math.max(Math.floor((SCREEN_W - 72) / bars.length), 44);
  const innerW  = Math.max(ITEM_W * bars.length, SCREEN_W - 72);
  const DOT_R   = 4;

  const getPx = i => ITEM_W * i + ITEM_W / 2;
  const getPy = v => v > 0 ? CHART_H - Math.round(((v - minVal) / range) * (CHART_H - 16)) + 8 : -999;

  const cPts = bars.map((bar, i) => ({ x: getPx(i), y: (bar.collected || 0) > 0 ? getPy(bar.collected) : null, val: bar.collected || 0 }));
  const oPts = bars.map((bar, i) => ({ x: getPx(i), y: (bar.overdue   || 0) > 0 ? getPy(bar.overdue)   : null, val: bar.overdue   || 0 }));

  const mkSegments = (pts, color) => {
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (a.y !== null && b.y !== null) segs.push({ a, b, color });
    }
    return segs;
  };

  const segments = [...mkSegments(cPts, '#4facfe'), ...mkSegments(oPts, '#f39c12')];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ width: innerW, height: CHART_H + 40 }}>
        {[0.25, 0.5, 0.75, 1.0].map(r => (
          <View key={r} pointerEvents="none" style={{
            position: 'absolute', left: 0, right: 0,
            top: 8 + CHART_H * (1 - r), height: 1,
            backgroundColor: 'rgba(255,255,255,0.07)',
          }} />
        ))}
        {segments.map(({ a, b, color }, idx) => {
          const dx = b.x - a.x, dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ang = Math.atan2(dy, dx) * 180 / Math.PI;
          const cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
          return (
            <View key={idx} pointerEvents="none" style={{
              position: 'absolute', width: len, height: 2,
              backgroundColor: color,
              left: cx - len / 2, top: cy - 1,
              transform: [{ rotate: `${ang}deg` }], borderRadius: 1,
            }} />
          );
        })}
        {[
          { pts: cPts, color: '#4facfe' },
          { pts: oPts, color: '#f39c12' },
        ].map(({ pts, color }, si) => pts.map((pt, i) => {
          if (pt.y === null) return null;
          const isSel = sel === i;
          return (
            <TouchableOpacity
              key={`${si}-${i}`}
              style={{ position: 'absolute', left: pt.x - DOT_R - 10, top: pt.y - DOT_R - 18, width: DOT_R * 2 + 20, height: DOT_R * 2 + 20, alignItems: 'center' }}
              onPress={() => setSel(i === sel ? null : i)}
              activeOpacity={0.8}
            >
              {isSel && si === 0 && <Text style={[ch.lineVal, { color }]}>{fmt(pt.val)}</Text>}
              <View style={{ width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R, backgroundColor: isSel ? color : '#1a1a2e', borderWidth: 2, borderColor: color, marginTop: isSel ? 2 : 14 }} />
            </TouchableOpacity>
          );
        }))}
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row' }}>
          {bars.map((bar, i) => (
            <Text key={i} style={[ch.barLabel, { width: ITEM_W }, sel === i && ch.barLabelSel]}>{bar.label}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Message Detail Modal ─────────────────────────────────
function MessageDetailModal({ visible, message: msg, onClose, onResolve }) {
  const { t } = useLanguage();
  if (!msg) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={md.overlay}>
        <TouchableOpacity style={md.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={md.sheet}>
          <View style={md.handle} />
          <Text style={md.title}>{t('dashboard.msgDetailTitle')}</Text>
          <View style={md.infoBlock}>
            {[
              [t('dashboard.roomLabel'),     msg.room,     '#4facfe'],
              [t('dashboard.buildingLabel'), msg.building, '#ccd6f6'],
              [t('dashboard.tenantLabel'),   msg.tenant,   '#fff'   ],
              [t('dashboard.staffLabel'),    msg.staff,    '#f1c40f'],
              [t('dashboard.timeLabel'),     msg.time,     '#8892b0'],
            ].map(([label, value, color]) => (
              <View key={label} style={md.infoRow}>
                <Text style={md.infoLabel}>{label}</Text>
                <Text style={[md.infoValue, { color }]}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={md.msgBox}>
            <Text style={md.msgBoxLabel}>{t('dashboard.msgContent')}</Text>
            <Text style={md.msgBoxText}>"{msg.text}"</Text>
          </View>
          <View style={md.actions}>
            <TouchableOpacity style={md.callBtn} onPress={() => Linking.openURL(`tel:${msg.phone}`)}>
              <Text style={md.callBtnText}>{t('dashboard.callBtn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={md.resolveBtn} onPress={onResolve}>
              <Text style={md.resolveBtnText}>{t('dashboard.confirmResolve')}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={md.closeBtn} onPress={onClose}>
            <Text style={md.closeBtnText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Moveout Detail Modal ─────────────────────────────────
function MoveoutDetailModal({ visible, notice: mo, onClose }) {
  const { t } = useLanguage();
  if (!mo) return null;
  const urgent = mo.daysLeft <= 7;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={md.overlay}>
        <TouchableOpacity style={md.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={md.sheet}>
          <View style={md.handle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Text style={{ fontSize: 22 }}>🚚</Text>
            <Text style={md.title}>{t('dashboard.moveoutTitle')}</Text>
          </View>

          <View style={[mo_s.urgentBanner, { backgroundColor: urgent ? 'rgba(233,69,96,0.1)' : 'rgba(241,196,15,0.08)', borderColor: urgent ? 'rgba(233,69,96,0.3)' : 'rgba(241,196,15,0.25)' }]}>
            <Text style={[mo_s.urgentText, { color: urgent ? '#e94560' : '#f1c40f' }]}>
              {urgent ? '⚠️' : '📅'}  {t('dashboard.moveoutBanner', { n: mo.daysLeft, date: mo.intendedDate })}
            </Text>
          </View>

          <View style={md.infoBlock}>
            {[
              [t('dashboard.roomLabel'),     mo.room,       '#4facfe'],
              [t('dashboard.buildingLabel'), mo.building,   '#ccd6f6'],
              [t('dashboard.tenantLabel'),   mo.tenant,     '#fff'   ],
              [t('dashboard.staffLabel'),    mo.staff,      '#f1c40f'],
              [t('dashboard.reportedAt'),    mo.reportedAt, '#8892b0'],
            ].map(([label, value, color]) => (
              <View key={label} style={md.infoRow}>
                <Text style={md.infoLabel}>{label}</Text>
                <Text style={[md.infoValue, { color }]}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={[md.msgBox, { backgroundColor: 'rgba(241,196,15,0.06)', borderColor: 'rgba(241,196,15,0.18)' }]}>
            <Text style={md.msgBoxLabel}>{t('dashboard.moveoutReason')}</Text>
            <Text style={md.msgBoxText}>"{mo.reason}"</Text>
          </View>

          <TouchableOpacity style={md.callBtn} onPress={() => Linking.openURL(`tel:${mo.phone}`)}>
            <Text style={md.callBtnText}>{t('dashboard.callConfirm')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[md.closeBtn, { marginTop: 10 }]} onPress={onClose}>
            <Text style={md.closeBtnText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Resolve Modal ────────────────────────────────────────
function ResolveModal({ visible, message: msg, staffList, onConfirm, onClose }) {
  const { t } = useLanguage();
  const [resolveType,     setResolveType]     = useState('admin');
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [contractorName,  setContractorName]  = useState('');

  React.useEffect(() => {
    if (visible) { setResolveType('admin'); setSelectedStaffId(null); setContractorName(''); }
  }, [visible]);

  const canConfirm =
    resolveType === 'admin' ||
    (resolveType === 'staff' && selectedStaffId) ||
    (resolveType === 'contractor' && contractorName.trim().length > 0);

  const handleConfirm = () => {
    if (!canConfirm) return;
    let resolvedBy = { type: resolveType, name: '' };
    if (resolveType === 'admin') {
      resolvedBy.name = 'Admin';
    } else if (resolveType === 'staff') {
      const staffMember = staffList.find(s => s.id === selectedStaffId);
      resolvedBy.name = staffMember?.name || '';
      resolvedBy.staffId = selectedStaffId;
    } else {
      resolvedBy.name = contractorName.trim();
    }
    onConfirm(resolvedBy);
  };

  if (!msg) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={rv.overlay}>
        <TouchableOpacity style={rv.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={rv.sheet}>
          <View style={rv.handle} />
          <Text style={rv.title}>{t('dashboard.resolveTitle')}</Text>
          <Text style={rv.sub}>{t('dashboard.roomLabel')} {msg.room} · {msg.tenant}</Text>
          <Text style={rv.label}>{t('dashboard.resolveMethod')}</Text>
          <View style={rv.typeRow}>
            {RESOLVE_TYPES.map(rt => (
              <TouchableOpacity
                key={rt.key}
                style={[rv.typeOpt, resolveType === rt.key && { borderColor: rt.border, backgroundColor: rt.bg }]}
                onPress={() => { setResolveType(rt.key); setSelectedStaffId(null); }}
              >
                <Text style={rv.typeIcon}>{rt.icon}</Text>
                <Text style={[rv.typeLabel, resolveType === rt.key && { color: rt.color, fontWeight: '700' }]}>
                  {t(rt.tKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {resolveType === 'staff' && (
            <>
              <Text style={rv.label}>{t('dashboard.selectStaff')}</Text>
              {staffList.map(st => (
                <TouchableOpacity
                  key={st.id}
                  style={[rv.staffRow, selectedStaffId === st.id && rv.staffRowActive]}
                  onPress={() => setSelectedStaffId(st.id)}
                >
                  <Text style={rv.staffIcon}>💼</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={rv.staffName}>{st.name}</Text>
                    <Text style={rv.staffSub}>{st.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</Text>
                  </View>
                  {selectedStaffId === st.id && <Text style={rv.staffCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </>
          )}
          {resolveType === 'contractor' && (
            <>
              <Text style={rv.label}>{t('dashboard.contractorInfo')}</Text>
              <TextInput
                style={rv.input}
                value={contractorName}
                onChangeText={setContractorName}
                placeholder={t('dashboard.contractorPh')}
                placeholderTextColor="#8892b0"
              />
            </>
          )}
          <View style={rv.btnRow}>
            <TouchableOpacity style={rv.cancelBtn} onPress={onClose}>
              <Text style={rv.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[rv.confirmBtn, !canConfirm && rv.confirmDim]}
              onPress={handleConfirm}
            >
              <Text style={rv.confirmText}>{t('dashboard.confirmDone')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Birthday Panel ───────────────────────────────────────
function BirthdayPanel({ visible, groups, onClose }) {
  const { t } = useLanguage();
  const total = groups.reduce((sum, g) => sum + g.people.length, 0);
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={bp.overlay}>
        <TouchableOpacity style={bp.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={bp.sheet}>
          <View style={bp.handle} />
          <View style={bp.titleRow}>
            <Text style={bp.title}>{t('dashboard.bdayTitle')}</Text>
            <View style={bp.totalBadge}>
              <Text style={bp.totalText}>{t('dashboard.personCount', { n: total })}</Text>
            </View>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {groups.length === 0 ? (
              <View style={bp.emptyBox}>
                <Text style={bp.emptyIcon}>🎂</Text>
                <Text style={bp.emptyText}>{t('dashboard.noBday')}</Text>
              </View>
            ) : groups.map(group => (
              <View key={group.key} style={[bp.group, { borderColor: group.border }]}>
                <View style={[bp.groupHeader, { backgroundColor: group.bg }]}>
                  <Text style={[bp.groupLabel, { color: group.color }]}>
                    {group.key === 'today' ? '🎉' : '📅'}  {t(group.tKey)}
                  </Text>
                  <Text style={[bp.groupCount, { color: group.color }]}>{t('dashboard.personCount', { n: group.people.length })}</Text>
                </View>
                {group.people.map((person, i) => {
                  const avatar = person.type === 'staff'
                    ? (person.gender === 'female' ? '👩‍💼' : '👨‍💼')
                    : (person.gender === 'female' ? '👩' : '👨');
                  const isLast = i === group.people.length - 1;
                  return (
                    <View key={i} style={[bp.personRow, !isLast && bp.personRowBorder]}>
                      <View style={[bp.personAvatar, { backgroundColor: group.bg }]}>
                        <Text style={bp.personAvatarIcon}>{avatar}</Text>
                      </View>
                      <View style={bp.personInfo}>
                        <Text style={bp.personName}>{person.name}</Text>
                        <Text style={bp.personSub}>{person.sub}</Text>
                        <Text style={[bp.personDob, { color: group.color }]}>🎂 {person.dob}</Text>
                      </View>
                      <View style={[bp.typeBadge, { backgroundColor: group.bg, borderColor: group.border }]}>
                        <Text style={[bp.typeText, { color: group.color }]}>
                          {person.type === 'staff' ? '💼 NV' : '👤 KH'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={bp.closeBtn} onPress={onClose}>
            <Text style={bp.closeBtnText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────
const ACT_TYPE = {
  complaint: { icon: '📢', color: '#e94560', bg: 'rgba(233,69,96,0.12)',  tKey: 'dashboard.actComplaint' },
  checkin:   { icon: '🏠', color: '#2ecc71', bg: 'rgba(46,204,113,0.12)', tKey: 'dashboard.actCheckin'   },
  checkout:  { icon: '🚚', color: '#f1c40f', bg: 'rgba(241,196,15,0.12)', tKey: 'dashboard.actCheckout'  },
  birthday:  { icon: '🎂', color: '#f39c12', bg: 'rgba(243,156,18,0.12)', tKey: 'dashboard.actBirthday'  },
};

export default function DashboardScreen() {
  const { buildings, setBuildings } = useBuildings();
  const { t } = useLanguage();

  const [period,          setPeriod]          = useState('month');
  const [chartType,       setChartType]       = useState('bar');
  const [activityTab,     setActivityTab]     = useState('staff');
  const [bdayPanelOpen,   setBdayPanelOpen]   = useState(false);
  const [selectedMsg,     setSelectedMsg]     = useState(null);
  const [detailVisible,   setDetailVisible]   = useState(false);
  const [resolveVisible,  setResolveVisible]  = useState(false);
  const [resolvedHistory, setResolvedHistory] = useState([]);
  const [selectedMo,      setSelectedMo]      = useState(null);
  const [staffPeriod,     setStaffPeriod]     = useState('month');
  const [moDetailVisible, setMoDetailVisible] = useState(false);

  // ── Live data from Supabase ────────────────────────────
  const [payments,      setPayments]      = useState([]);
  const [staffList,     setStaffList]     = useState([]);
  const [tenantHistory, setTenantHistory] = useState([]);
  const [allTenants,    setAllTenants]    = useState([]);

  useEffect(() => {
    const load = async () => {
      const [
        { data: pays },
        { data: staff },
        { data: history },
        { data: tents },
      ] = await Promise.all([
        supabase.from('payments').select('*'),
        supabase.from('staff').select('id, name, phone, role, gender, dob, active').eq('active', true),
        supabase.from('tenant_history').select('*'),
        supabase.from('tenants').select('id, name, dob, gender, room_id, phone, since_date'),
      ]);
      setPayments(pays || []);
      setStaffList(staff || []);
      setTenantHistory(history || []);
      setAllTenants(tents || []);
    };
    load();
  }, []);

  // ── Derive room overview from live buildings data ──────
  const { adminBuildings, stats, pendingMessages } = useMemo(() => {
    const hasPending = r => (r.messages || []).some(m => !m.resolved);

    const adminBuildings = buildings.map(b => {
      const allRooms = b.floors.flatMap(f => f.rooms);
      return {
        name:     b.name,
        code:     b.code,
        address:  b.address,
        staff:    b.staff,
        total:    allRooms.length,
        occupied: allRooms.filter(r => r.tenant).length,
      };
    });

    const allRooms = buildings.flatMap(b => b.floors.flatMap(f => f.rooms));
    const stats = [
      { tKey: 'dashboard.totalRooms', value: String(allRooms.length),
        numColor: '#fff',    borderColor: 'rgba(255,255,255,0.12)' },
      { tKey: 'dashboard.occupied',   value: String(allRooms.filter(r => r.tenant).length),
        numColor: '#2ecc71', borderColor: 'rgba(46,204,113,0.35)'  },
      { tKey: 'dashboard.vacant',     value: String(allRooms.filter(r => r.status === 'empty').length),
        numColor: '#8892b0', borderColor: 'rgba(136,146,176,0.3)'  },
      { tKey: 'dashboard.incident',   value: String(allRooms.filter(r =>
          r.status === 'maintenance' || r.status === 'urgent' ||
          (r.status === 'occupied' && hasPending(r))
        ).length),
        numColor: '#f1c40f', borderColor: 'rgba(241,196,15,0.35)'  },
    ];

    const pendingMessages = [];
    buildings.forEach(b => {
      b.floors.forEach(f => {
        f.rooms.forEach(r => {
          if (!r.tenant) return;
          (r.messages || []).filter(m => !m.resolved).forEach(m => {
            pendingMessages.push({
              id:         `${b.id}-${r.id}-${m.id}`,
              msgId:      m.id,
              roomId:     r.id,
              buildingId: b.id,
              room:       `${b.code}-${r.id}`,
              building:   b.name,
              staff:      b.staff,
              tenant:     r.tenant,
              phone:      r.phone || '',
              text:       m.text,
              time:       m.time,
            });
          });
        });
      });
    });

    return { adminBuildings, stats, pendingMessages };
  }, [buildings]);

  // ── Revenue computation from live payments ─────────────
  const { revenue, staffRevData, moveoutNotices, bdayGroups } = useMemo(() => {
    function sumPayments(pays, field) {
      return pays.reduce((s, p) => s + (p[field] || 0), 0);
    }
    function fmtMoney(n) {
      return n.toLocaleString('vi-VN') + ' ₫';
    }
    function parseMonth(m) {
      const [mm, yy] = m.split('/').map(Number);
      return yy * 100 + mm;
    }

    const allMonths = [...new Set(payments.map(p => p.month))]
      .sort((a, b) => parseMonth(a) - parseMonth(b));

    const now = new Date();
    const curMonth = `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const curYear  = String(now.getFullYear());

    // Month chart: all months
    const monthBars = allMonths.map(m => {
      const mPays = payments.filter(p => p.month === m);
      const [mm] = m.split('/').map(Number);
      return {
        label:     `T${mm}`,
        collected: sumPayments(mPays.filter(p => p.paid),  'amount'),
        overdue:   sumPayments(mPays.filter(p => !p.paid), 'amount'),
      };
    });
    const monthCollected = sumPayments(payments.filter(p => p.paid),  'amount');
    const monthOverdue   = sumPayments(payments.filter(p => !p.paid), 'amount');

    // Year chart: group by year
    const allYears = [...new Set(payments.map(p => p.month.split('/')[1]))].sort();
    const yearBars = allYears.map(y => {
      const yPays = payments.filter(p => p.month.split('/')[1] === y);
      return {
        label:     y,
        collected: sumPayments(yPays.filter(p => p.paid),  'amount'),
        overdue:   sumPayments(yPays.filter(p => !p.paid), 'amount'),
      };
    });
    const yearPays      = payments.filter(p => p.month.split('/')[1] === curYear);
    const yearCollected = sumPayments(yearPays.filter(p => p.paid),  'amount');
    const yearOverdue   = sumPayments(yearPays.filter(p => !p.paid), 'amount');

    // Week chart: current month only
    const weekPays      = payments.filter(p => p.month === curMonth);
    const weekCollected = sumPayments(weekPays.filter(p => p.paid),  'amount');
    const weekOverdue   = sumPayments(weekPays.filter(p => !p.paid), 'amount');
    const weekBars = weekPays.length > 0
      ? [{ label: curMonth, collected: weekCollected, overdue: weekOverdue }]
      : [];

    const revenue = {
      week:  { bars: weekBars,  collected: fmtMoney(weekCollected),  overdue: fmtMoney(weekOverdue),  footer: '' },
      month: { bars: monthBars, collected: fmtMoney(monthCollected), overdue: fmtMoney(monthOverdue), footer: '' },
      year:  { bars: yearBars,  collected: fmtMoney(yearCollected),  overdue: fmtMoney(yearOverdue),  footer: '' },
    };

    // ── Staff revenue by period ──
    const getStaffRevForPeriod = (p) => {
      let filterPays = payments;
      if (p === 'week') filterPays = payments.filter(pay => pay.month === curMonth);
      else if (p === 'month') {
        const last6 = allMonths.slice(-6);
        filterPays = payments.filter(pay => last6.includes(pay.month));
      }
      const map = {};
      filterPays.forEach(pay => {
        const sid = pay.collected_by;
        if (!sid) return;
        if (!map[sid]) map[sid] = { collected: 0, overdue: 0 };
        if (pay.paid) map[sid].collected += pay.amount || 0;
        else map[sid].overdue += pay.amount || 0;
      });
      return Object.entries(map).map(([sid, rev]) => {
        const st = staffList.find(s => s.id === sid);
        return { name: st?.name || sid, avatar: st?.gender === 'female' ? '👩' : '👨', ...rev };
      }).filter(sr => sr.collected + sr.overdue > 0);
    };
    const staffRevData = {
      week:  getStaffRevForPeriod('week'),
      month: getStaffRevForPeriod('month'),
      year:  getStaffRevForPeriod('year'),
    };

    // ── Move-out notices from tenant_history ──
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const moveoutNotices = tenantHistory
      .filter(th => {
        if (!th.move_out_date) return false;
        const [dd, mm, yy] = th.move_out_date.split('/').map(Number);
        if (!dd || !mm || !yy) return false;
        const d = new Date(yy, mm - 1, dd);
        const diff = Math.ceil((d - today) / 86400000);
        return diff >= 0 && diff <= 30;
      })
      .map(th => {
        const [dd, mm, yy] = th.move_out_date.split('/').map(Number);
        const d = new Date(yy, mm - 1, dd);
        const daysLeft = Math.ceil((d - today) / 86400000);
        const bld = buildings.find(b => b.id === th.building_id);
        return {
          id:           th.id,
          room:         th.room_id || '—',
          building:     bld?.name || th.building_id || '—',
          tenant:       th.tenant_name || '—',
          phone:        th.tenant_phone || '',
          intendedDate: th.move_out_date,
          daysLeft,
          reason:       th.move_out_reason || '',
          reportedAt:   th.created_at ? new Date(th.created_at).toLocaleDateString('vi-VN') : '—',
          staff:        bld?.staff || '—',
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    // ── Birthday groups ──
    function matchDob(dob, day, month) {
      if (!dob) return false;
      const parts = dob.split('/');
      return parseInt(parts[0]) === day && parseInt(parts[1]) === month;
    }

    const bdayGroups = BDAY_GROUPS.map(g => {
      const d = new Date(today);
      d.setDate(today.getDate() + g.dayOffset);
      const day = d.getDate(), month = d.getMonth() + 1;

      const tenantBdays = allTenants
        .filter(t => matchDob(t.dob, day, month))
        .map(t => ({ name: t.name, type: 'customer', sub: 'Khách thuê', dob: t.dob, gender: t.gender || 'male' }));
      const staffBdays = staffList
        .filter(s => matchDob(s.dob, day, month))
        .map(s => ({ name: s.name, type: 'staff', sub: `${s.phone || ''} · ${s.role === 'manager' ? 'Quản lý' : 'Nhân viên'}`, dob: s.dob, gender: s.gender || 'male' }));

      return { ...g, people: [...tenantBdays, ...staffBdays] };
    }).filter(g => g.people.length > 0);

    return { revenue, staffRevData, moveoutNotices, bdayGroups };
  }, [payments, staffList, tenantHistory, allTenants, buildings]);

  const rev      = revenue?.[period] ?? { bars: [], collected: '—', overdue: '—', footer: '' };
  const bdayTotal = bdayGroups.reduce((sum, g) => sum + g.people.length, 0);

  const openDetail  = msg => { setSelectedMsg(msg); setDetailVisible(true); };
  const openResolve = ()  => { setDetailVisible(false); setResolveVisible(true); };

  const handleResolved = async (resolvedBy) => {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const resolvedAt = `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()}`;
    const { buildingId, roomId, msgId } = selectedMsg;

    // Optimistic local update
    setBuildings(prev => prev.map(b => {
      if (b.id !== buildingId) return b;
      return {
        ...b,
        floors: b.floors.map(f => ({
          ...f,
          rooms: f.rooms.map(r => {
            if (r.id !== roomId) return r;
            const updatedMessages = (r.messages || []).map(m =>
              m.id === msgId ? { ...m, resolved: true, resolvedBy } : m
            );
            const stillPending = updatedMessages.some(m => !m.resolved);
            const newStatus = !stillPending && r.tenant &&
              (r.status === 'maintenance' || r.status === 'urgent') ? 'occupied' : r.status;
            return { ...r, messages: updatedMessages, status: newStatus, currentIssue: stillPending ? r.currentIssue : null };
          }),
        })),
      };
    }));

    // Write to Supabase
    const resolveType = resolvedBy.type === 'admin' ? 'self' : resolvedBy.type === 'staff' ? 'staff' : 'contractor';
    await supabase.from('messages').update({
      resolved:     true,
      resolved_at:  resolvedAt,
      resolved_by:  resolvedBy.staffId || null,
      resolve_type: resolveType,
      resolve_note: resolvedBy.name,
    }).eq('id', msgId);

    setResolvedHistory(prev => [{ ...selectedMsg, resolvedBy, resolvedAt }, ...prev]);
    setResolveVisible(false);
    setSelectedMsg(null);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <BirthdayPanel
        visible={bdayPanelOpen}
        groups={bdayGroups}
        onClose={() => setBdayPanelOpen(false)}
      />
      <MessageDetailModal
        visible={detailVisible}
        message={selectedMsg}
        onClose={() => { setDetailVisible(false); setSelectedMsg(null); }}
        onResolve={openResolve}
      />
      <ResolveModal
        visible={resolveVisible}
        message={selectedMsg}
        staffList={staffList}
        onConfirm={handleResolved}
        onClose={() => { setResolveVisible(false); setSelectedMsg(null); }}
      />
      <MoveoutDetailModal
        visible={moDetailVisible}
        notice={selectedMo}
        onClose={() => { setMoDetailVisible(false); setSelectedMo(null); }}
      />

      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.greeting}>{t('staffDash.greeting')}</Text>
              <Text style={s.ownerName}>Nguyễn Chủ Nhà</Text>
            </View>
            <View style={s.headerRight}>
              <LanguageSwitcher />
              <TouchableOpacity style={s.notifBtn} onPress={() => setBdayPanelOpen(true)}>
                <Text style={s.notifIcon}>🎂</Text>
                {bdayTotal > 0 && (
                  <View style={s.notifBadge}><Text style={s.notifBadgeText}>{bdayTotal}</Text></View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <Text style={s.dateText}>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </LinearGradient>

        {/* ── Báo cáo doanh thu ── */}
        <View style={s.section}>
          <LinearGradient colors={['rgba(46,204,113,0.5)', 'rgba(22,160,133,0.5)']} style={s.revenueCard}>
            {/* Period tabs */}
            <View style={s.periodRow}>
              {PERIODS.map(p => (
                <TouchableOpacity
                  key={p.key}
                  style={[s.periodBtn, period === p.key && s.periodBtnActive]}
                  onPress={() => setPeriod(p.key)}
                >
                  <Text style={[s.periodBtnText, period === p.key && s.periodBtnTextActive]}>{t(p.tKey)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.revenueLabel}>{t('dashboard.revTitle.' + period)}</Text>

            {/* Two metrics side by side */}
            <View style={s.revMetricRow}>
              <View style={s.revMetricBox}>
                <Text style={s.revMetricLbl}>💰 {t('dashboard.collected')}</Text>
                <Text style={s.revMetricVal}>{rev.collected}</Text>
              </View>
              <View style={s.revMetricDivider} />
              <View style={s.revMetricBox}>
                <Text style={s.revMetricLbl}>⏳ {t('dashboard.overdue')}</Text>
                <Text style={[s.revMetricVal, s.revMetricValOverdue]}>{rev.overdue}</Text>
              </View>
            </View>

            <Text style={s.revenueChange}>{rev.footer}</Text>
          </LinearGradient>
        </View>

        {/* ── Biểu đồ doanh thu ── */}
        <View style={s.section}>
          <View style={s.chartCard}>
            <View style={s.chartHeader}>
              <Text style={s.chartTitle}>📈 {t('dashboard.revenueChart')}</Text>
              <View style={s.chartTypeRow}>
                {CHART_TYPES.map(ct => (
                  <TouchableOpacity
                    key={ct.key}
                    style={[s.chartTypeBtn, chartType === ct.key && s.chartTypeBtnActive]}
                    onPress={() => setChartType(ct.key)}
                  >
                    <Text style={[s.chartTypeTxt, chartType === ct.key && s.chartTypeTxtActive]}>
                      {ct.icon}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Legend */}
            <View style={s.chartLegend}>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: '#4facfe' }]} />
                <Text style={s.legendText}>{t('dashboard.collected')}</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: '#f39c12' }]} />
                <Text style={s.legendText}>{t('dashboard.overdue')}</Text>
              </View>
            </View>
            {chartType === 'bar'
              ? <BarChart  bars={rev.bars} key={`bar-${period}`}  />
              : <LineChart bars={rev.bars} key={`line-${period}`} />
            }
          </View>
        </View>

        {/* ── Doanh thu theo nhân viên ── */}
        <View style={s.section}>
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>👥 {t('dashboard.staffRevenue')}</Text>
          </View>
          <View style={s.staffRevPanel}>
            {/* Period tabs */}
            <View style={s.staffRevTabs}>
              {PERIODS.map(p => (
                <TouchableOpacity
                  key={p.key}
                  style={[s.staffRevTab, staffPeriod === p.key && s.staffRevTabActive]}
                  onPress={() => setStaffPeriod(p.key)}
                >
                  <Text style={[s.staffRevTabText, staffPeriod === p.key && s.staffRevTabTextActive]}>{t(p.tKey)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bars */}
            {(() => {
              const list = staffRevData?.[staffPeriod] ?? [];
              if (list.length === 0) {
                return (
                  <View style={s.emptyBox}>
                    <Text style={s.emptyText}>📊 {t('dashboard.noStaffRev') || 'Chưa có dữ liệu'}</Text>
                  </View>
                );
              }
              const maxTotal = Math.max(...list.map(sr => sr.collected + sr.overdue));
              return list.map((sr, i) => {
                const total  = sr.collected + sr.overdue;
                const pct    = total > 0 ? Math.round((sr.collected / total) * 100) : 0;
                const cW     = maxTotal > 0 ? sr.collected / maxTotal * 100 : 0;
                const oW     = maxTotal > 0 ? sr.overdue   / maxTotal * 100 : 0;
                const isLast = i === list.length - 1;
                return (
                  <View key={i} style={[s.staffRevRow, !isLast && s.staffRevRowBorder]}>
                    <View style={s.staffRevAvatar}>
                      <Text style={{ fontSize: 24 }}>{sr.avatar}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={s.staffRevName}>{sr.name}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 5, marginBottom: 7 }}>
                        <Text style={s.staffRevCollected}>💰 {fmt(sr.collected)}</Text>
                        <Text style={s.staffRevOverdue}>⏳ {fmt(sr.overdue)}</Text>
                      </View>
                      <View style={s.staffRevBarBg}>
                        <View style={[s.staffRevBarFill,    { width: `${cW}%` }]} />
                        <View style={[s.staffRevBarOverdue, { width: `${oW}%` }]} />
                      </View>
                      <Text style={s.staffRevPct}>{pct}{t('dashboard.pctCollected')}</Text>
                    </View>
                  </View>
                );
              });
            })()}
          </View>
        </View>

        {/* ── Tổng quan phòng ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('dashboard.roomOverview')}</Text>
          <View style={s.ovPanel}>

            <Text style={s.ovSubTitle}>🏢 {t('dashboard.managedBldg')}</Text>
            {adminBuildings.map((b, i) => {
              const pct = b.total > 0 ? Math.round(b.occupied / b.total * 100) : 0;
              const accent = '#4facfe';
              return (
                <View key={i} style={[s.ovBuildingCard, { borderColor: `${accent}30` }]}>
                  <View style={[s.ovBuildingAccent, { backgroundColor: accent }]} />
                  <View style={{ flex: 1, padding: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.ovBuildingName}>{b.name}</Text>
                        {b.code && (
                          <View style={[s.ovCodeBadge, { alignSelf: 'flex-start', marginTop: 4, marginBottom: 4, borderColor: `${accent}55`, backgroundColor: `${accent}18` }]}>
                            <Text style={[s.ovCodeText, { color: accent }]}>{b.code}</Text>
                          </View>
                        )}
                        <Text style={s.ovBuildingMeta}>📍 {b.address}</Text>
                        <Text style={s.ovBuildingStaff}>👤 {b.staff}</Text>
                      </View>
                      <View style={[s.ovRoomBadge, { borderColor: `${accent}40`, backgroundColor: `${accent}12` }]}>
                        <Text style={[s.ovRoomBadgeNum, { color: accent }]}>{b.total}</Text>
                        <Text style={[s.ovRoomBadgeLbl, { color: accent }]}>{t('dashboard.roomLabel')}</Text>
                      </View>
                    </View>
                    <View style={s.ovOccRow}>
                      <View style={s.ovOccBar}>
                        <View style={[s.ovOccFill, { width: `${pct}%`, backgroundColor: accent }]} />
                      </View>
                      <Text style={s.ovOccPct}>{pct}% ({b.occupied}/{b.total})</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={s.ovDivider} />

            <Text style={s.ovSubTitle}>📊 {t('dashboard.roomStatus')}</Text>
            <View style={s.ovStatRow}>
              {stats.map((stat, i) => (
                <View key={i} style={[s.ovStatCard, { borderColor: stat.borderColor }]}>
                  <Text style={[s.ovStatNum, { color: stat.numColor }]}>{stat.value}</Text>
                  <Text style={s.ovStatLbl}>{t(stat.tKey)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Tin nhắn sự cố ── */}
        <View style={s.section}>
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>💬 {t('dashboard.incidentMsg')}</Text>
            {pendingMessages.length > 0 && (
              <View style={s.badgeRed}>
                <Text style={s.badgeRedText}>{t('dashboard.pendingCount', { n: pendingMessages.length })}</Text>
              </View>
            )}
          </View>
          <View style={s.notifPanel}>
            {pendingMessages.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>✅ {t('dashboard.noMsg')}</Text>
              </View>
            ) : (
              <>
                <ScrollView nestedScrollEnabled style={s.ovMsgScroll} showsVerticalScrollIndicator={pendingMessages.length > 4}>
                  {pendingMessages.map(msg => (
                    <TouchableOpacity key={msg.id} style={s.ovMsgRow} onPress={() => openDetail(msg)} activeOpacity={0.75}>
                      <View style={s.ovMsgLeft}>
                        <Text style={s.ovMsgRoom}>{msg.room}</Text>
                        <Text style={s.ovMsgBuilding}>{msg.building}</Text>
                        <Text style={s.ovMsgStaff}>💼 {msg.staff}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.ovMsgTenant}>👤 {msg.tenant}</Text>
                        <Text style={s.ovMsgText} numberOfLines={2}>"{msg.text}"</Text>
                        <Text style={s.ovMsgTime}>🕐 {msg.time}</Text>
                      </View>
                      <Text style={s.ovMsgArrow}>›</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        </View>

        {/* ── Thông báo sắp chuyển đi ── */}
        <View style={s.section}>
          <View style={s.sectionTitleRow}>
            <Text style={s.sectionTitle}>🚚 {t('dashboard.moveout')}</Text>
            {moveoutNotices.length > 0 && (
              <View style={s.badgeYellow}>
                <Text style={s.badgeYellowText}>{t('dashboard.roomsBadge', { n: moveoutNotices.length })}</Text>
              </View>
            )}
          </View>
          <View style={s.notifPanel}>
            {moveoutNotices.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>✅ {t('dashboard.noMoveout')}</Text>
              </View>
            ) : moveoutNotices.map(mo => {
              const urgent = mo.daysLeft <= 7;
              return (
                <TouchableOpacity
                  key={mo.id}
                  style={[s.moRow, urgent ? s.moRowUrgent : s.moRowNormal]}
                  onPress={() => { setSelectedMo(mo); setMoDetailVisible(true); }}
                  activeOpacity={0.75}
                >
                  <View style={[s.moIconBox, { backgroundColor: urgent ? 'rgba(233,69,96,0.12)' : 'rgba(241,196,15,0.1)' }]}>
                    <Text style={{ fontSize: 20 }}>🚚</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={s.moTenant}>{mo.tenant}</Text>
                      <View style={[s.moDaysBadge, { backgroundColor: urgent ? 'rgba(233,69,96,0.12)' : 'rgba(241,196,15,0.1)', borderColor: urgent ? 'rgba(233,69,96,0.3)' : 'rgba(241,196,15,0.3)' }]}>
                        <Text style={[s.moDaysText, { color: urgent ? '#e94560' : '#f1c40f' }]}>
                          {t('dashboard.daysLeft', { n: mo.daysLeft })}
                        </Text>
                      </View>
                    </View>
                    <Text style={s.moRoom}>{t('dashboard.roomLabel')} {mo.room} · {mo.building}</Text>
                    <Text style={s.moDate}>📅 {t('dashboard.expectedDate')} {mo.intendedDate}</Text>
                    <Text style={s.moReason} numberOfLines={1}>📝 {mo.reason}</Text>
                  </View>
                  <Text style={s.ovMsgArrow}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Hoạt động gần đây ── */}
        <View style={[s.section, { marginBottom: 32 }]}>
          <Text style={s.sectionTitle}>{t('dashboard.recentActivity')}</Text>

          <View style={s.actTabRow}>
            <TouchableOpacity
              style={[s.actTabBtn, activityTab === 'staff' && s.actTabActive]}
              onPress={() => setActivityTab('staff')}
            >
              <Text style={[s.actTabText, activityTab === 'staff' && s.actTabTextActive]}>💼 {t('nav.staff')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actTabBtn, activityTab === 'customer' && s.actTabActive]}
              onPress={() => setActivityTab('customer')}
            >
              <Text style={[s.actTabText, activityTab === 'customer' && s.actTabTextActive]}>👥 {t('nav.customers')}</Text>
            </TouchableOpacity>
          </View>

          {activityTab === 'staff' && (
            <View style={s.actFixedArea}>
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>📋 {t('dashboard.noStaffActivity') || 'Chưa có nhật ký hoạt động nhân viên'}</Text>
              </View>
            </View>
          )}

          {activityTab === 'customer' && (
            <ScrollView nestedScrollEnabled showsVerticalScrollIndicator style={s.actFixedArea}>
              {(() => {
                const cfg = ACT_TYPE['checkin'];
                const recentCheckins = allTenants
                  .filter(t => t.since_date && t.room_id)
                  .map(t => {
                    const bld = buildings.find(b => b.floors?.some(f => f.rooms?.some(r => r.dbId === t.room_id)));
                    return { name: t.name, room: t.room_id, building: bld?.name || '—', time: t.since_date, type: 'checkin' };
                  })
                  .slice(0, 10);
                if (recentCheckins.length === 0) {
                  return (
                    <View style={s.emptyBox}>
                      <Text style={s.emptyText}>🏠 {t('dashboard.noCheckins') || 'Chưa có khách nhận phòng'}</Text>
                    </View>
                  );
                }
                return recentCheckins.map((act, i) => (
                  <View key={i} style={[s.activityCard, { borderLeftWidth: 3, borderLeftColor: cfg.color }]}>
                    <View style={[s.actCustTypeBox, { backgroundColor: cfg.bg }]}>
                      <Text style={{ fontSize: 20 }}>{cfg.icon}</Text>
                    </View>
                    <View style={s.activityInfo}>
                      <View style={s.actRow1}>
                        <Text style={s.activityName}>{act.name}</Text>
                        <Text style={s.actTimeText}>{act.time}</Text>
                      </View>
                      <View style={s.actRow2}>
                        <View style={[s.actTypeTag, { backgroundColor: cfg.bg }]}>
                          <Text style={[s.actTypeText, { color: cfg.color }]}>{t(cfg.tKey)}</Text>
                        </View>
                        <Text style={s.actRoomLine}>🏢 {act.building} · Phòng {act.room}</Text>
                      </View>
                      <Text style={s.activityAction}>Nhận phòng mới</Text>
                    </View>
                  </View>
                ));
              })()}
            </ScrollView>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Message Detail styles ────────────────────────────────
const md = StyleSheet.create({
  overlay:       { flex: 1, justifyContent: 'flex-end' },
  backdrop:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet:         { backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle:        { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:         { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 0 },

  infoBlock:     { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  infoRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoLabel:     { color: '#8892b0', fontSize: 13, fontWeight: '600' },
  infoValue:     { fontSize: 13, fontWeight: '700', maxWidth: '62%', textAlign: 'right' },

  msgBox:        { backgroundColor: 'rgba(233,69,96,0.06)', borderRadius: 12, padding: 14, marginBottom: 18, borderWidth: 1, borderColor: 'rgba(233,69,96,0.18)' },
  msgBoxLabel:   { color: '#8892b0', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  msgBoxText:    { color: '#ccd6f6', fontSize: 14, lineHeight: 22, fontStyle: 'italic' },

  actions:       { flexDirection: 'row', gap: 10, marginBottom: 12 },
  callBtn:       { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: 'rgba(46,204,113,0.12)', borderWidth: 1, borderColor: 'rgba(46,204,113,0.35)' },
  callBtnText:   { color: '#2ecc71', fontWeight: '800', fontSize: 14 },
  resolveBtn:    { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: 'rgba(162,155,254,0.15)', borderWidth: 1, borderColor: 'rgba(162,155,254,0.4)' },
  resolveBtnText:{ color: '#a29bfe', fontWeight: '800', fontSize: 14 },

  closeBtn:      { borderRadius: 12, paddingVertical: 13, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText:  { color: '#8892b0', fontWeight: '700', fontSize: 14 },
});

// ─── Moveout Modal styles ─────────────────────────────────
const mo_s = StyleSheet.create({
  urgentBanner: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 14 },
  urgentText:   { fontSize: 13, fontWeight: '700' },
});

// ─── Resolve Modal styles ─────────────────────────────────
const rv = StyleSheet.create({
  overlay:    { flex: 1, justifyContent: 'flex-end' },
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet:      { backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle:     { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:      { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  sub:        { color: '#8892b0', fontSize: 13, marginBottom: 4 },
  label:      { color: '#8892b0', fontSize: 11, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  typeRow:    { gap: 8 },
  typeOpt:    { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', padding: 13 },
  typeIcon:   { fontSize: 20 },
  typeLabel:  { color: '#8892b0', fontSize: 14 },

  staffRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 8 },
  staffRowActive: { backgroundColor: 'rgba(116,185,255,0.1)', borderColor: 'rgba(116,185,255,0.35)' },
  staffIcon:  { fontSize: 20 },
  staffName:  { color: '#fff', fontSize: 14, fontWeight: '700' },
  staffSub:   { color: '#8892b0', fontSize: 12, marginTop: 2 },
  staffCheck: { color: '#74b9ff', fontSize: 18, fontWeight: '800' },

  input:      { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },

  btnRow:     { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn:  { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelText: { color: '#8892b0', fontWeight: '700', fontSize: 14 },
  confirmBtn: { flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#a29bfe' },
  confirmDim: { opacity: 0.35 },
  confirmText:{ color: '#fff', fontWeight: '800', fontSize: 14 },
});

// ─── Birthday Panel styles ────────────────────────────────
const bp = StyleSheet.create({
  overlay:    { flex: 1, justifyContent: 'flex-end' },
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet:      { backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  handle:     { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },

  titleRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  title:      { color: '#fff', fontSize: 18, fontWeight: '800' },
  totalBadge: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  totalText:  { color: '#ccd6f6', fontSize: 12, fontWeight: '700' },

  group:       { borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  groupLabel:  { fontSize: 13, fontWeight: '800', letterSpacing: 0.3 },
  groupCount:  { fontSize: 12, fontWeight: '700' },

  personRow:       { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  personRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  personAvatar:    { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  personAvatarIcon:{ fontSize: 22 },
  personInfo:      { flex: 1 },
  personName:      { color: '#fff', fontSize: 14, fontWeight: '700' },
  personSub:       { color: '#8892b0', fontSize: 11, marginTop: 2 },
  personDob:       { fontSize: 11, fontWeight: '700', marginTop: 3 },
  typeBadge:       { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  typeText:        { fontSize: 11, fontWeight: '700' },

  emptyBox:  { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 10 },
  emptyText: { color: '#8892b0', fontSize: 13 },

  closeBtn:     { marginTop: 16, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText: { color: '#8892b0', fontWeight: '700', fontSize: 14 },
});

// ─── Chart styles ─────────────────────────────────────────
const ch = StyleSheet.create({
  barLabel:     { color: '#8892b0', fontSize: 11, textAlign: 'center' },
  barLabelSel:  { color: '#f1c40f', fontWeight: '700' },
  lineVal:      { color: '#f1c40f', fontSize: 9, fontWeight: '800', textAlign: 'center' },

  hBarLabel:     { color: '#fff', fontSize: 12, fontWeight: '700' },
  hBarCollected: { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  hBarOverdue:   { color: '#f39c12', fontSize: 11, fontWeight: '700' },
  hBarPct:       { color: '#8892b0', fontSize: 10, fontWeight: '600', marginTop: 4, textAlign: 'right' },
  hBarBg:        { height: 8, borderRadius: 4, overflow: 'hidden', flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)' },
});

// ─── Screen styles ────────────────────────────────────────
const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },
  header:    { padding: 20, paddingTop: 30 },
  headerTop:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greeting:  { color: '#8892b0', fontSize: 14 },
  ownerName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  notifBtn:  { position: 'relative', padding: 8 },
  notifIcon: { fontSize: 24 },
  notifBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: '#e94560', borderRadius: 10,
    width: 18, height: 18, justifyContent: 'center', alignItems: 'center',
  },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  dateText:     { color: '#8892b0', fontSize: 12 },
  section:      { padding: 20, paddingBottom: 0 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },

  // Revenue card
  revenueCard:         { borderRadius: 20, padding: 22 },
  periodRow:           { flexDirection: 'row', gap: 6, marginBottom: 16 },
  periodBtn:           { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  periodBtnActive:     { backgroundColor: '#fff' },
  periodBtnText:       { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700' },
  periodBtnTextActive: { color: '#16a085' },
  revenueLabel:        { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 14 },
  revenueChange:       { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 14 },

  // Revenue dual metrics
  revMetricRow:        { flexDirection: 'row', gap: 0 },
  revMetricBox:        { flex: 1, alignItems: 'center', paddingVertical: 10, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 14 },
  revMetricDivider:    { width: 10 },
  revMetricLbl:        { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600', marginBottom: 5 },
  revMetricVal:        { color: '#fff', fontSize: 15, fontWeight: '900' },
  revMetricValOverdue: { color: '#f39c12' },

  // Chart card
  chartCard:         { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  chartHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  chartTitle:        { color: '#fff', fontSize: 14, fontWeight: '700' },
  chartTypeRow:      { flexDirection: 'row', gap: 6 },
  chartTypeBtn:      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  chartTypeBtnActive:{ backgroundColor: 'rgba(79,172,254,0.2)', borderColor: '#4facfe' },
  chartTypeTxt:      { color: '#8892b0', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  chartTypeTxtActive:{ color: '#4facfe' },
  chartLegend:       { flexDirection: 'row', gap: 16, marginBottom: 12 },
  legendItem:        { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:         { width: 8, height: 8, borderRadius: 4 },
  legendText:        { color: '#8892b0', fontSize: 11, fontWeight: '600' },

  // Overview panel
  ovPanel:        { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  ovSubTitle:     { color: '#fff', fontSize: 13, fontWeight: '800', marginBottom: 12, letterSpacing: 0.3 },
  ovDivider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 16 },
  ovBuildingRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  ovBuildingCard: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  ovBuildingAccent: { width: 4, borderRadius: 0 },
  ovBuildingIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(79,172,254,0.1)', justifyContent: 'center', alignItems: 'center' },
  ovBuildingName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  ovCodeBadge:    { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: 'rgba(79,172,254,0.35)' },
  ovCodeText:     { color: '#4facfe', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  ovBuildingMeta: { color: '#8892b0', fontSize: 11, marginTop: 1 },
  ovBuildingStaff:{ color: '#4facfe', fontSize: 11, marginTop: 2, fontWeight: '600' },
  ovOccRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  ovOccBar:       { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  ovOccFill:      { height: 4, backgroundColor: '#2ecc71', borderRadius: 2 },
  ovOccPct:       { color: '#2ecc71', fontSize: 10, fontWeight: '700', width: 86 },
  ovRoomBadge:    { alignItems: 'center', backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(79,172,254,0.25)' },
  ovRoomBadgeNum: { color: '#4facfe', fontSize: 18, fontWeight: '900' },
  ovRoomBadgeLbl: { color: '#4facfe', fontSize: 9, fontWeight: '600', marginTop: 1 },
  ovStatRow:      { flexDirection: 'row', gap: 8 },
  ovStatCard:     { flex: 1, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)', paddingVertical: 10, alignItems: 'center' },
  ovStatNum:      { fontSize: 22, fontWeight: '900' },
  ovStatLbl:      { color: '#8892b0', fontSize: 10, marginTop: 2, fontWeight: '600', textAlign: 'center' },

  // Notification panels (messages + moveout)
  notifPanel:      { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  emptyBox:        { paddingVertical: 12, alignItems: 'center' },
  emptyText:       { color: '#2ecc71', fontSize: 12, fontWeight: '600' },
  badgeRed:        { backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(233,69,96,0.3)' },
  badgeRedText:    { color: '#e94560', fontSize: 11, fontWeight: '700' },
  badgeYellow:     { backgroundColor: 'rgba(241,196,15,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(241,196,15,0.3)' },
  badgeYellowText: { color: '#f1c40f', fontSize: 11, fontWeight: '700' },

  // Messages
  ovMsgScroll:    { maxHeight: 344 },
  ovMsgRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(233,69,96,0.05)', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(233,69,96,0.15)' },
  ovMsgLeft:      { width: 96, flexShrink: 0 },
  ovMsgRoom:      { color: '#4facfe', fontSize: 13, fontWeight: '800' },
  ovMsgBuilding:  { color: '#8892b0', fontSize: 10, marginTop: 2, fontWeight: '600' },
  ovMsgStaff:     { color: '#f1c40f', fontSize: 10, marginTop: 3, fontWeight: '600' },
  ovMsgTenant:    { color: '#ccd6f6', fontSize: 12, fontWeight: '700', marginBottom: 3 },
  ovMsgText:      { color: '#8892b0', fontSize: 11, fontStyle: 'italic', lineHeight: 17 },
  ovMsgTime:      { color: '#4facfe', fontSize: 10, marginTop: 5 },
  ovScrollHint:   { alignItems: 'center', paddingVertical: 7, backgroundColor: 'rgba(79,172,254,0.07)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(79,172,254,0.18)', marginTop: 2 },
  ovScrollHintText:{ color: '#4facfe', fontSize: 11, fontWeight: '700' },
  ovMsgArrow:     { color: '#4facfe', fontSize: 20, fontWeight: '700', alignSelf: 'center', marginLeft: 4 },

  // Moveout cards
  moRow:          { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1 },
  moRowUrgent:    { backgroundColor: 'rgba(233,69,96,0.06)', borderColor: 'rgba(233,69,96,0.2)' },
  moRowNormal:    { backgroundColor: 'rgba(241,196,15,0.05)', borderColor: 'rgba(241,196,15,0.18)' },
  moIconBox:      { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  moTenant:       { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
  moRoom:         { color: '#8892b0', fontSize: 11, marginTop: 2 },
  moDate:         { color: '#4facfe', fontSize: 11, marginTop: 3, fontWeight: '600' },
  moReason:       { color: '#8892b0', fontSize: 11, marginTop: 2, fontStyle: 'italic' },
  moDaysBadge:    { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0 },
  moDaysText:     { fontSize: 11, fontWeight: '800' },

  // Staff revenue
  staffRevPanel:      { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  staffRevRow:        { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  staffRevRowBorder:  { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  staffRevAvatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(79,172,254,0.1)', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  staffRevName:       { color: '#fff', fontSize: 14, fontWeight: '700' },
  staffRevBuilding:   { color: '#8892b0', fontSize: 11, fontWeight: '600' },
  staffRevCollected:  { color: '#4facfe', fontSize: 12, fontWeight: '700' },
  staffRevOverdue:    { color: '#f39c12', fontSize: 12, fontWeight: '700' },
  staffRevBarBg:      { height: 6, borderRadius: 3, overflow: 'hidden', flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)' },
  staffRevBarFill:    { height: 6, backgroundColor: '#4facfe' },
  staffRevBarOverdue: { height: 6, backgroundColor: '#f39c12' },
  staffRevPct:        { color: '#8892b0', fontSize: 10, marginTop: 4, fontWeight: '600' },
  staffRevTabs:         { flexDirection: 'row', gap: 6, padding: 12, paddingBottom: 4 },
  staffRevTab:          { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  staffRevTabActive:    { backgroundColor: 'rgba(79,172,254,0.2)', borderColor: '#4facfe' },
  staffRevTabText:      { color: '#8892b0', fontSize: 12, fontWeight: '700' },
  staffRevTabTextActive:{ color: '#4facfe' },

  // Activity tabs
  actTabRow:        { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.025)', borderRadius: 14, padding: 4, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  actTabBtn:        { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 11 },
  actTabActive:     { backgroundColor: 'rgba(233,69,96,0.5)' },
  actTabText:       { color: '#8892b0', fontSize: 13, fontWeight: '700' },
  actTabTextActive: { color: '#fff' },

  // Activity cards
  activityCard:       { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, marginBottom: 10 },
  activityAvatar:     { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(46,204,113,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 14, flexShrink: 0 },
  activityAvatarText: { fontSize: 22 },
  activityInfo:       { flex: 1 },
  actRow1:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actRow2:            { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' },
  activityName:       { color: '#fff', fontWeight: '700', fontSize: 14, flex: 1, marginRight: 8 },
  actTimeText:        { color: '#fff', fontSize: 11, fontWeight: '800', flexShrink: 0 },
  actBuildingTag:     { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  actBuildingText:    { color: '#4facfe', fontSize: 11, fontWeight: '700' },
  activityAction:     { color: '#8892b0', fontSize: 12, marginTop: 6, lineHeight: 18 },
  actCustTypeBox:     { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14, flexShrink: 0 },
  actTypeTag:         { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  actTypeText:        { fontSize: 11, fontWeight: '700' },
  actRoomLine:        { color: '#8892b0', fontSize: 11, flexShrink: 1 },
  actReason:          { color: '#f1c40f', fontSize: 11, marginTop: 5, fontStyle: 'italic', lineHeight: 17 },
  actScrollArea:      { maxHeight: 5 * 104 },
  actFixedArea:       { height: 500 },
});
