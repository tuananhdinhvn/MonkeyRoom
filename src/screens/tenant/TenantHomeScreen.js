import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Modal, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotifications } from '../../context/NotificationsContext';
import NotificationPanel from '../../components/NotificationPanel';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const HOTLINE = '0901234567';

const ROOMMATES = [
  { id: 'r1', name: 'Trần Thị Bích', cccd: '079295012345', phone: '0912 111 222' },
  { id: 'r2', name: 'Lê Văn Cường',  cccd: '001299876543', phone: '0987 333 444' },
];

// ─── Roommate Detail Modal ────────────────────────────────
function RoommateDetailModal({ roommate, onClose }) {
  const { t } = useLanguage();
  if (!roommate) return null;
  return (
    <Modal visible={!!roommate} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={rm.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={rm.sheet}>
          <View style={rm.handle} />
          <Text style={rm.title}>{t('home.roommateDetail')}</Text>
          <View style={rm.avatarWrap}>
            <View style={rm.avatar}><Text style={{ fontSize: 32 }}>👤</Text></View>
          </View>
          <View style={rm.infoCard}>
            <View style={rm.infoRow}>
              <Text style={rm.infoIcon}>👤</Text>
              <View style={{ flex: 1 }}>
                <Text style={rm.infoLabel}>{t('home.fullName')}</Text>
                <Text style={rm.infoValue}>{roommate.name}</Text>
              </View>
            </View>
            <View style={rm.divider} />
            <View style={rm.infoRow}>
              <Text style={rm.infoIcon}>🪪</Text>
              <View style={{ flex: 1 }}>
                <Text style={rm.infoLabel}>{t('home.idCard')}</Text>
                <Text style={rm.infoValue}>{roommate.cccd}</Text>
              </View>
            </View>
            <View style={rm.divider} />
            <View style={rm.infoRow}>
              <Text style={rm.infoIcon}>📞</Text>
              <View style={{ flex: 1 }}>
                <Text style={rm.infoLabel}>{t('home.phone')}</Text>
                <Text style={rm.infoValue}>{roommate.phone}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={rm.closeBtn} onPress={onClose}>
            <Text style={rm.closeBtnText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Announcement Detail Modal ───────────────────────────
function AnnouncementDetailModal({ ann, onClose }) {
  const { t } = useLanguage();
  if (!ann) return null;
  const isWarning = ann.type === 'warning';
  const accentColor  = isWarning ? '#fee140' : '#4facfe';
  const accentBg     = isWarning ? 'rgba(254,225,64,0.1)'  : 'rgba(79,172,254,0.1)';
  const accentBorder = isWarning ? 'rgba(254,225,64,0.35)' : 'rgba(79,172,254,0.35)';
  return (
    <Modal visible={!!ann} transparent animationType="slide" onRequestClose={onClose}>
      <View style={an.overlay}>
        <View style={an.sheet}>
          <View style={an.handle} />
          <View style={[an.header, { backgroundColor: accentBg, borderColor: accentBorder }]}>
            <Text style={an.headerIcon}>{ann.icon}</Text>
            <Text style={[an.headerTitle, { color: accentColor }]}>{ann.title}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={an.infoCard}>
              <View style={an.infoRow}>
                <Text style={an.infoIcon}>📅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={an.infoLabel}>{t('notif.date')}</Text>
                  <Text style={an.infoValue}>{ann.date}</Text>
                </View>
              </View>
              <View style={an.divider} />
              <View style={an.infoRow}>
                <Text style={an.infoIcon}>🕐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={an.infoLabel}>{t('notif.time')}</Text>
                  <Text style={an.infoValue}>{ann.from} – {ann.to}</Text>
                </View>
              </View>
              <View style={an.divider} />
              <View style={an.infoRow}>
                <Text style={an.infoIcon}>📢</Text>
                <View style={{ flex: 1 }}>
                  <Text style={an.infoLabel}>{t('notif.content')}</Text>
                  <Text style={[an.infoValue, { lineHeight: 22 }]}>{ann.detail}</Text>
                </View>
              </View>
              <View style={an.divider} />
              <View style={an.infoRow}>
                <Text style={an.infoIcon}>👤</Text>
                <View style={{ flex: 1 }}>
                  <Text style={an.infoLabel}>{t('notif.postedBy')}</Text>
                  <Text style={an.infoValue}>{ann.postedBy}</Text>
                  <Text style={an.infoSub}>🕐 {ann.postedAt}</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 8 }} />
          </ScrollView>
          <TouchableOpacity style={an.closeBtn} onPress={onClose}>
            <Text style={an.closeBtnText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Contract Modal ───────────────────────────────────────
function ContractModal({ visible, onClose }) {
  const { t } = useLanguage();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={ct.overlay}>
        <View style={ct.sheet}>
          <View style={ct.handle} />
          <Text style={ct.title}>{t('contract.title')}</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={ct.docCard}>
              <Text style={ct.docHeader}>{t('contract.header1')}{'\n'}{t('contract.header2')}</Text>
              <Text style={ct.docTitle}>{t('contract.title2')}</Text>
              <Text style={ct.docSub}>{t('contract.number')} 2025/HĐTP-GH-101</Text>

              <View style={ct.sectionRow}><Text style={ct.sectionHead}>{t('contract.partyA')}</Text></View>
              {[
                [t('contract.fullName'), 'Nguyễn Thị Quản Lý'],
                [t('contract.address'),  '12 Nguyễn Trãi, Quận 1, TP.HCM'],
                [t('contract.phone'),    '0901 234 567'],
              ].map(([l, v]) => (
                <View key={l} style={ct.fieldRow}>
                  <Text style={ct.fieldLabel}>{l}:</Text>
                  <Text style={ct.fieldValue}>{v}</Text>
                </View>
              ))}

              <View style={ct.sectionRow}><Text style={ct.sectionHead}>{t('contract.partyB')}</Text></View>
              {[
                [t('contract.fullName'), 'Nguyễn Văn An'],
                [t('contract.cccd'),     '079292012345'],
                [t('contract.phone'),    '0912 345 678'],
              ].map(([l, v]) => (
                <View key={l} style={ct.fieldRow}>
                  <Text style={ct.fieldLabel}>{l}:</Text>
                  <Text style={ct.fieldValue}>{v}</Text>
                </View>
              ))}

              <View style={ct.sectionRow}><Text style={ct.sectionHead}>{t('contract.info')}</Text></View>
              {[
                [t('contract.room'),      'Phòng 101 – Nhà A Green Home'],
                [t('contract.area'),      '20 m²'],
                [t('contract.rent'),      '3,500,000 ₫ / tháng'],
                [t('contract.startDate'), '01/01/2025'],
                [t('contract.duration'),  '12 tháng'],
                [t('contract.endDate'),   '31/12/2025'],
              ].map(([l, v]) => (
                <View key={l} style={ct.fieldRow}>
                  <Text style={ct.fieldLabel}>{l}:</Text>
                  <Text style={ct.fieldValue}>{v}</Text>
                </View>
              ))}

              <View style={ct.signRow}>
                <View style={ct.signBox}>
                  <Text style={ct.signLabel}>{t('contract.signA')}</Text>
                  <Text style={ct.signName}>Nguyễn Thị Quản Lý</Text>
                </View>
                <View style={ct.signBox}>
                  <Text style={ct.signLabel}>{t('contract.signB')}</Text>
                  <Text style={ct.signName}>Nguyễn Văn An</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 8 }} />
          </ScrollView>
          <TouchableOpacity style={ct.closeBtn} onPress={onClose}>
            <Text style={ct.closeBtnText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function TenantHomeScreen({ navigation }) {
  const now       = new Date();
  const billMonth = `${now.getMonth() + 1}/${now.getFullYear()}`;

  const { announcements, unreadCount } = useNotifications();
  const { t } = useLanguage();

  const [selectedRM,      setSelectedRM]      = useState(null);
  const [contractVisible, setContractVisible] = useState(false);
  const [selectedAnn,     setSelectedAnn]     = useState(null);
  const [notifVisible,    setNotifVisible]    = useState(false);

  const QUICK_ACTIONS = [
    {
      icon: '💳', label: t('home.payment'), color: '#e94560',
      onPress: () => navigation.navigate('TenantPayment'),
    },
    {
      icon: '🔧', label: t('home.reportIssue'), color: '#fee140',
      onPress: () => navigation.navigate('TenantReport'),
    },
    {
      icon: '📄', label: t('home.contract'), color: '#4facfe',
      onPress: () => setContractVisible(true),
    },
    {
      icon: '📞', label: t('home.hotline'), color: '#43e97b',
      onPress: () => Linking.openURL(`tel:${HOTLINE}`),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <RoommateDetailModal roommate={selectedRM} onClose={() => setSelectedRM(null)} />
      <ContractModal visible={contractVisible} onClose={() => setContractVisible(false)} />
      <AnnouncementDetailModal ann={selectedAnn} onClose={() => setSelectedAnn(null)} />
      <NotificationPanel visible={notifVisible} onClose={() => setNotifVisible(false)} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={['#1a1a2e', '#0f3460']} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{t('tenant.greeting')}</Text>
              <Text style={styles.tenantName}>Nguyễn Văn An</Text>
            </View>
            <View style={styles.headerRight}>
              <LanguageSwitcher />
              <TouchableOpacity style={styles.notifBtn} onPress={() => setNotifVisible(true)}>
                <Text style={styles.notifIcon}>🔔</Text>
                {unreadCount > 0 && (
                  <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>
                )}
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.roomInfoCard}>
            <View style={styles.roomInfoLeft}>
              <Text style={styles.roomLabel}>{t('tenant.myRoom')}</Text>
              <Text style={styles.roomNumber}>Phòng 101</Text>
              <Text style={styles.roomAddress}>Tòa nhà Green Home, Tầng 1</Text>
            </View>
            <View style={styles.roomInfoRight}>
              <View style={styles.roomStatusBadge}>
                <Text style={styles.roomStatusText}>{t('tenant.renting')}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action, i) => (
              <TouchableOpacity key={i} style={styles.actionBtn} onPress={action.onPress} activeOpacity={0.75}>
                <View style={[styles.actionIconBox, { backgroundColor: action.color + '22' }]}>
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Bill */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.billMonth')} {billMonth}</Text>
          <View style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>{t('home.roomFee')}</Text>
              <Text style={styles.billValue}>3,500,000 ₫</Text>
            </View>
            <View style={styles.billRowStack}>
              <View style={styles.billRowTop}>
                <Text style={styles.billLabel}>{t('home.electricity')}</Text>
                <Text style={styles.billValue}>360,000 ₫</Text>
              </View>
              <View style={styles.meterTable}>
                <View style={styles.meterHeaderRow}>
                  <Text style={styles.meterHeaderCell}>{t('home.oldMeter')}</Text>
                  <Text style={styles.meterHeaderCell}>{t('home.newMeter')}</Text>
                  <Text style={styles.meterHeaderCell}>{t('home.consumption')}</Text>
                </View>
                <View style={styles.meterDataRow}>
                  <Text style={styles.meterDataCell}>1234</Text>
                  <Text style={styles.meterDataCell}>1354</Text>
                  <Text style={styles.meterDataCell}>120 số</Text>
                </View>
              </View>
            </View>
            <View style={styles.billRowStack}>
              <View style={styles.billRowTop}>
                <Text style={styles.billLabel}>{t('home.water')}</Text>
                <Text style={styles.billValue}>75,000 ₫</Text>
              </View>
              <View style={styles.meterTable}>
                <View style={styles.meterHeaderRow}>
                  <Text style={styles.meterHeaderCell}>{t('home.oldMeter')}</Text>
                  <Text style={styles.meterHeaderCell}>{t('home.newMeter')}</Text>
                  <Text style={styles.meterHeaderCell}>{t('home.consumption')}</Text>
                </View>
                <View style={styles.meterDataRow}>
                  <Text style={styles.meterDataCell}>40</Text>
                  <Text style={styles.meterDataCell}>45</Text>
                  <Text style={styles.meterDataCell}>5 khối</Text>
                </View>
              </View>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>{t('home.internet')}</Text>
              <Text style={styles.billValue}>100,000 ₫</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>{t('home.service')}</Text>
              <Text style={styles.billValue}>120,000 ₫</Text>
            </View>
            <View style={styles.billDivider} />
            <View style={styles.billRow}>
              <Text style={styles.billTotal}>{t('home.total')}</Text>
              <Text style={styles.billTotalValue}>4,155,000 ₫</Text>
            </View>
            <View style={styles.unpaidBadge}>
              <Text style={styles.unpaidText}>{t('home.payBefore')} 05/05/2026</Text>
            </View>
            <TouchableOpacity style={styles.payBtn} onPress={() => navigation.navigate('TenantPayment')}>
              <LinearGradient colors={['#e94560', '#c62a47']} style={styles.payGradient}>
                <Text style={styles.payText}>{t('home.payNow')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Roommates */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>{t('home.roommates')}</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{ROOMMATES.length} {t('home.roommatesCount')}</Text>
            </View>
          </View>
          {ROOMMATES.length === 0 ? (
            <View style={styles.roommateEmpty}>
              <Text style={styles.roommateEmptyText}>{t('home.noRoommates')}</Text>
            </View>
          ) : (
            <View style={styles.roommateCard}>
              {ROOMMATES.map((r, i) => (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roommateRow, i < ROOMMATES.length - 1 && styles.roommateRowBorder]}
                  onPress={() => setSelectedRM(r)}
                  activeOpacity={0.75}
                >
                  <View style={styles.roommateAvatar}>
                    <Text style={{ fontSize: 20 }}>👤</Text>
                  </View>
                  <Text style={styles.roommateName}>{r.name}</Text>
                  <Text style={styles.roommateChevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Announcements */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>{t('home.announcements')}</Text>
          {announcements.map(a => (
            <TouchableOpacity
              key={a.id}
              style={[styles.announcementCard, a.type === 'warning' && styles.announcementWarning]}
              onPress={() => setSelectedAnn(a)}
              activeOpacity={0.75}
            >
              <Text style={styles.announcementIcon}>{a.icon}</Text>
              <View style={styles.announcementInfo}>
                <Text style={styles.announcementTitle}>{a.title}</Text>
                <Text style={styles.announcementTime}>🕐 {a.time}</Text>
              </View>
              <Text style={styles.announcementChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#1a1a2e' },
  container:         { flex: 1, backgroundColor: '#0d0d1a' },
  header:            { padding: 20, paddingTop: 10, paddingBottom: 24 },
  headerTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting:          { color: '#8892b0', fontSize: 14 },
  tenantName:        { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerRight:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifBtn:          { position: 'relative', padding: 8 },
  notifIcon:         { fontSize: 24 },
  notifBadge:        { position: 'absolute', top: 4, right: 4, backgroundColor: '#e94560', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText:    { color: '#fff', fontSize: 10, fontWeight: '700' },
  roomInfoCard:      { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 18, flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  roomInfoLeft:      {},
  roomLabel:         { color: '#8892b0', fontSize: 12, marginBottom: 4 },
  roomNumber:        { color: '#fff', fontSize: 26, fontWeight: '800' },
  roomAddress:       { color: '#8892b0', fontSize: 12, marginTop: 4 },
  roomInfoRight:     { alignItems: 'flex-end', justifyContent: 'space-between' },
  roomStatusBadge:   { backgroundColor: 'rgba(67,233,123,0.2)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  roomStatusText:    { color: '#43e97b', fontSize: 12, fontWeight: '700' },
  roomArea:          { color: '#8892b0', fontSize: 13 },

  section:           { padding: 20, paddingBottom: 0 },
  sectionTitle:      { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 14 },
  sectionTitleRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },

  actionsGrid:       { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn:         { alignItems: 'center', flex: 1 },
  actionIconBox:     { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionIcon:        { fontSize: 26 },
  actionLabel:       { color: '#ccd6f6', fontSize: 12, fontWeight: '600' },

  billCard:          { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  billRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  billLabel:         { color: '#8892b0', fontSize: 14 },
  billDetail:        { color: 'rgba(136,146,176,0.7)', fontSize: 11, marginTop: 3 },
  billValue:         { color: '#ccd6f6', fontSize: 14, fontWeight: '600' },
  billRowStack:      { marginBottom: 12 },
  billRowTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  meterTable:        { borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  meterHeaderRow:    { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)' },
  meterHeaderCell:   { flex: 1, color: '#8892b0', fontSize: 11, fontWeight: '700', paddingVertical: 6, paddingHorizontal: 8, textAlign: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)' },
  meterDataRow:      { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)' },
  meterDataCell:     { flex: 1, color: '#ccd6f6', fontSize: 13, fontWeight: '600', paddingVertical: 7, paddingHorizontal: 8, textAlign: 'center', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.08)' },

  billDivider:       { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 },
  billTotal:         { color: '#fff', fontSize: 15, fontWeight: '700' },
  billTotalValue:    { color: '#4facfe', fontSize: 18, fontWeight: '800' },
  unpaidBadge:       { backgroundColor: 'rgba(254,225,64,0.1)', borderRadius: 10, padding: 10, marginTop: 12, marginBottom: 14 },
  unpaidText:        { color: '#fee140', fontSize: 13, textAlign: 'center' },
  payBtn:            { borderRadius: 12, overflow: 'hidden' },
  payGradient:       { paddingVertical: 14, alignItems: 'center' },
  payText:           { color: '#fff', fontWeight: '800', fontSize: 15 },

  countBadge:        { backgroundColor: 'rgba(79,172,254,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(79,172,254,0.3)' },
  countBadgeText:    { color: '#4facfe', fontSize: 12, fontWeight: '700' },
  roommateCard:      { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  roommateRow:       { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  roommateRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  roommateAvatar:    { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(79,172,254,0.1)', justifyContent: 'center', alignItems: 'center' },
  roommateName:      { color: '#fff', fontSize: 14, fontWeight: '700', flex: 1 },
  roommateChevron:   { color: '#8892b0', fontSize: 22, fontWeight: '300' },
  roommateEmpty:     { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', alignItems: 'center' },
  roommateEmptyText: { color: '#8892b0', fontSize: 13 },

  announcementCard:     { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: '#4facfe', gap: 14 },
  announcementWarning:  { borderLeftColor: '#fee140' },
  announcementIcon:     { fontSize: 24 },
  announcementInfo:     { flex: 1 },
  announcementTitle:    { color: '#fff', fontSize: 14, fontWeight: '600' },
  announcementTime:     { color: '#8892b0', fontSize: 12, marginTop: 3 },
  announcementChevron:  { color: '#8892b0', fontSize: 22 },
});

// ─── Roommate Modal Styles ────────────────────────────────
const rm = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#16213e', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12 },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 20 },
  title:      { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  avatarWrap: { alignItems: 'center', marginBottom: 20 },
  avatar:     { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(79,172,254,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(79,172,254,0.35)' },
  infoCard:   { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 20 },
  infoRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  divider:    { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 },
  infoIcon:   { fontSize: 20 },
  infoLabel:  { color: '#8892b0', fontSize: 11, fontWeight: '600', marginBottom: 3 },
  infoValue:  { color: '#fff', fontSize: 15, fontWeight: '700' },
  closeBtn:   { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText: { color: '#ccd6f6', fontSize: 15, fontWeight: '700' },
});

// ─── Contract Modal Styles ────────────────────────────────
const ct = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#16213e', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, maxHeight: '90%' },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 16 },
  title:      { color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  docCard:    { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  docHeader:  { color: '#8892b0', fontSize: 11, textAlign: 'center', lineHeight: 18, marginBottom: 12 },
  docTitle:   { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  docSub:     { color: '#8892b0', fontSize: 12, textAlign: 'center', marginBottom: 18 },
  sectionRow: { backgroundColor: 'rgba(79,172,254,0.1)', borderRadius: 8, padding: 8, marginBottom: 10, marginTop: 4, borderLeftWidth: 3, borderLeftColor: '#4facfe' },
  sectionHead:{ color: '#4facfe', fontSize: 12, fontWeight: '800' },
  fieldRow:   { flexDirection: 'row', marginBottom: 8, gap: 8 },
  fieldLabel: { color: '#8892b0', fontSize: 13, width: 100 },
  fieldValue: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },
  signRow:    { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  signBox:    { alignItems: 'center', gap: 6 },
  signLabel:  { color: '#8892b0', fontSize: 12 },
  signName:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  closeBtn:   { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText: { color: '#ccd6f6', fontSize: 15, fontWeight: '700' },
});

// ─── Announcement Detail Modal Styles ────────────────────
const an = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: '#16213e', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, maxHeight: '88%' },
  handle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 16 },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 16, borderWidth: 1 },
  headerIcon: { fontSize: 26 },
  headerTitle:{ fontSize: 15, fontWeight: '800', flex: 1 },
  infoCard:   { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 6 },
  infoRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14 },
  divider:    { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 14 },
  infoIcon:   { fontSize: 20, marginTop: 2 },
  infoLabel:  { color: '#8892b0', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  infoValue:  { color: '#fff', fontSize: 14, fontWeight: '600' },
  infoSub:    { color: '#8892b0', fontSize: 12, marginTop: 4 },
  closeBtn:   { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText: { color: '#ccd6f6', fontSize: 15, fontWeight: '700' },
});
