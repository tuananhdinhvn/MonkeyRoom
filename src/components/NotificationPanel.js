import React, { useState } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { useNotifications } from '../context/NotificationsContext';
import { useLanguage } from '../context/LanguageContext';

// ─── Detail Modal ──────────────────────────────────────────
function DetailModal({ ann, onClose }) {
  const { t } = useLanguage();
  if (!ann) return null;
  const isWarning    = ann.type === 'warning';
  const accentColor  = isWarning ? '#fee140' : '#4facfe';
  const accentBg     = isWarning ? 'rgba(254,225,64,0.1)'  : 'rgba(79,172,254,0.1)';
  const accentBorder = isWarning ? 'rgba(254,225,64,0.35)' : 'rgba(79,172,254,0.35)';
  return (
    <Modal visible={!!ann} transparent animationType="slide" onRequestClose={onClose}>
      <View style={dm.overlay}>
        <View style={dm.sheet}>
          <View style={dm.handle} />
          <View style={[dm.header, { backgroundColor: accentBg, borderColor: accentBorder }]}>
            <Text style={dm.headerIcon}>{ann.icon}</Text>
            <Text style={[dm.headerTitle, { color: accentColor }]}>{ann.title}</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={dm.infoCard}>
              <View style={dm.infoRow}>
                <Text style={dm.infoIcon}>📅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={dm.infoLabel}>{t('notif.date')}</Text>
                  <Text style={dm.infoValue}>{ann.date}</Text>
                </View>
              </View>
              <View style={dm.divider} />
              <View style={dm.infoRow}>
                <Text style={dm.infoIcon}>🕐</Text>
                <View style={{ flex: 1 }}>
                  <Text style={dm.infoLabel}>{t('notif.time')}</Text>
                  <Text style={dm.infoValue}>{ann.from} – {ann.to}</Text>
                </View>
              </View>
              <View style={dm.divider} />
              <View style={dm.infoRow}>
                <Text style={dm.infoIcon}>📢</Text>
                <View style={{ flex: 1 }}>
                  <Text style={dm.infoLabel}>{t('notif.content')}</Text>
                  <Text style={[dm.infoValue, { lineHeight: 22 }]}>{ann.detail}</Text>
                </View>
              </View>
              <View style={dm.divider} />
              <View style={dm.infoRow}>
                <Text style={dm.infoIcon}>👤</Text>
                <View style={{ flex: 1 }}>
                  <Text style={dm.infoLabel}>{t('notif.postedBy')}</Text>
                  <Text style={dm.infoValue}>{ann.postedBy}</Text>
                  <Text style={dm.infoSub}>🕐 {ann.postedAt}</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 8 }} />
          </ScrollView>
          <TouchableOpacity style={dm.closeBtn} onPress={onClose}>
            <Text style={dm.closeBtnText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Notification Panel ────────────────────────────────────
export default function NotificationPanel({ visible, onClose }) {
  const { announcements, readIds, markRead, markAllRead, unreadCount } = useNotifications();
  const { t } = useLanguage();
  const [detailAnn, setDetailAnn] = useState(null);

  const handleSelect = (ann) => {
    markRead(ann.id);
    setDetailAnn(ann);
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={np.overlay}>
          <View style={np.sheet}>
            <View style={np.handle} />

            <View style={np.header}>
              <Text style={np.title}>{t('notif.title')}</Text>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllRead}>
                  <Text style={np.markAllBtn}>{t('notif.markAllRead')}</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {announcements.length === 0 ? (
                <View style={np.empty}>
                  <Text style={np.emptyText}>{t('notif.empty')}</Text>
                </View>
              ) : (
                announcements.map(ann => {
                  const isRead    = readIds.includes(ann.id);
                  const isWarning = ann.type === 'warning';
                  const accentBg  = isWarning ? 'rgba(254,225,64,0.15)' : 'rgba(79,172,254,0.15)';
                  return (
                    <TouchableOpacity
                      key={ann.id}
                      style={[np.item, !isRead && np.itemUnread]}
                      onPress={() => handleSelect(ann)}
                      activeOpacity={0.75}
                    >
                      <View style={[np.iconWrap, { backgroundColor: accentBg }]}>
                        <Text style={np.itemIcon}>{ann.icon}</Text>
                      </View>
                      <View style={np.itemBody}>
                        <Text style={[np.itemTitle, !isRead && np.itemTitleUnread]}>{ann.title}</Text>
                        <Text style={np.itemTime}>🕐 {ann.time}</Text>
                        <Text style={np.itemPosted}>{ann.postedAt}</Text>
                      </View>
                      {!isRead && <View style={np.unreadDot} />}
                    </TouchableOpacity>
                  );
                })
              )}
              <View style={{ height: 8 }} />
            </ScrollView>

            <TouchableOpacity style={np.closeBtn} onPress={onClose}>
              <Text style={np.closeBtnText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DetailModal ann={detailAnn} onClose={() => setDetailAnn(null)} />
    </>
  );
}

const np = StyleSheet.create({
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:            { backgroundColor: '#16213e', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingTop: 12, maxHeight: '85%' },
  handle:           { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 18 },
  header:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:            { color: '#fff', fontSize: 17, fontWeight: '800' },
  markAllBtn:       { color: '#4facfe', fontSize: 12, fontWeight: '600' },

  empty:            { alignItems: 'center', padding: 24 },
  emptyText:        { color: '#8892b0', fontSize: 14 },

  item:             { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  itemUnread:       { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.14)' },
  iconWrap:         { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  itemIcon:         { fontSize: 22 },
  itemBody:         { flex: 1 },
  itemTitle:        { color: '#8892b0', fontSize: 14, fontWeight: '600' },
  itemTitleUnread:  { color: '#fff' },
  itemTime:         { color: '#8892b0', fontSize: 12, marginTop: 3 },
  itemPosted:       { color: 'rgba(136,146,176,0.55)', fontSize: 11, marginTop: 2 },
  unreadDot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4facfe', flexShrink: 0 },

  closeBtn:         { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  closeBtnText:     { color: '#ccd6f6', fontSize: 15, fontWeight: '700' },
});

const dm = StyleSheet.create({
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
