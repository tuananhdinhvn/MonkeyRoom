import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Switch, Modal, ScrollView, TextInput, StatusBar, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useBuildings } from '../context/BuildingsContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { supabase } from '../lib/supabase';

// ─── Constants ────────────────────────────────────────────
const ALL_PERMISSIONS = [
  { tKey: 'perm.viewAll' },
  { tKey: 'perm.manageRooms' },
  { tKey: 'perm.manageCustomers' },
  { tKey: 'perm.collectPayment' },
  { tKey: 'perm.report' },
  { tKey: 'perm.viewRooms' },
  { tKey: 'perm.maintenance' },
];

const ROLE_CONFIG = {
  manager: { tKey: 'staff.manager', color: '#a29bfe', bg: 'rgba(162,155,254,0.15)', icon: '👑' },
  staff:   { tKey: 'staff.employee', color: '#74b9ff', bg: 'rgba(116,185,255,0.15)', icon: '💼' },
};

const MGR_COLOR   = '#c084fc';
const STAFF_COLOR = '#38bdf8';

const GENDERS = [
  { key: 'male',   icon: '👨‍💼', tKey: 'staff.male' },
  { key: 'female', icon: '👩‍💼', tKey: 'staff.female' },
];

function getStaffId(role, phone) {
  const prefix = role === 'manager' ? 'M' : 'S';
  return `${prefix}-${phone.replace(/\D/g, '')}`;
}

function getGenderIcon(member) {
  if (member.avatar) return null;
  return GENDERS.find(g => g.key === member.gender)?.icon || '👤';
}

function dbToApp(row, allPerms) {
  const perms = allPerms.filter(p => p.staff_id === row.id).map(p => p.permission);
  return {
    id:          row.id,
    name:        row.name,
    phone:       row.phone,
    role:        row.role,
    dob:         row.dob,
    idCard:      row.id_card,
    gender:      row.gender,
    avatar:      row.avatar_url ?? null,
    active:      row.active,
    managerId:   row.manager_id ?? null,
    permissions: perms,
  };
}

function appToDb(data) {
  return {
    name:       data.name,
    phone:      data.phone,
    role:       data.role,
    dob:        data.dob,
    id_card:    data.idCard,
    gender:     data.gender,
    active:     data.active ?? true,
    manager_id: data.managerId ?? null,
    owner_id:   'owner-001',
  };
}

const INIT_STAFF = [
  {
    id: '1', name: 'Nguyễn Quản Lý', role: 'manager', phone: '0901111222',
    dob: '15/03/1985', idCard: '012345678901',
    gender: 'male', avatar: null, active: true, managerId: null,
    permissions: ['perm.viewAll', 'perm.manageRooms', 'perm.manageCustomers', 'perm.collectPayment', 'perm.report'],
  },
  {
    id: '2', name: 'Trần Thị Thu', role: 'staff', phone: '0912333444',
    dob: '20/07/1995', idCard: '098765432109',
    gender: 'female', avatar: null, active: true, managerId: '1',
    permissions: ['perm.viewRooms', 'perm.manageCustomers', 'perm.collectPayment'],
  },
  {
    id: '3', name: 'Nguyễn Văn Bảo', role: 'staff', phone: '0923555666',
    dob: '10/12/1993', idCard: '087654321098',
    gender: 'male', avatar: null, active: true, managerId: '1',
    permissions: ['perm.viewRooms', 'perm.manageCustomers', 'perm.collectPayment'],
  },
  {
    id: '4', name: 'Lê Thị Hương', role: 'staff', phone: '0934777888',
    dob: '05/06/1997', idCard: '076543210987',
    gender: 'female', avatar: null, active: false, managerId: null,
    permissions: ['perm.viewRooms', 'perm.maintenance'],
  },
];

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

  const [navM, setNavM] = useState(0);
  const [navY, setNavY] = useState(1990);
  const [selD, setSelD] = useState(null);
  const [selM, setSelM] = useState(null);
  const [selY, setSelY] = useState(null);

  useEffect(() => {
    if (visible) {
      const { d, m, y } = parseInitial();
      setNavM(m); setNavY(y);
      setSelD(d); setSelM(m); setSelY(y);
    }
  }, [visible]);

  const daysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const firstDOW    = (m, y) => new Date(y, m, 1).getDay();

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
          <Text style={dp.title}>{t('staff.pickDate')}</Text>

          <View style={dp.navRow}>
            <TouchableOpacity style={dp.navBtn} onPress={prevMonth}>
              <Text style={dp.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={dp.navLabel}>{MONTHS[navM]}</Text>
            <TouchableOpacity style={dp.navBtn} onPress={nextMonth}>
              <Text style={dp.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={dp.yearRow}>
            <TouchableOpacity style={dp.yearBtn} onPress={() => setNavY(y => y - 1)}>
              <Text style={dp.yearArrow}>◂</Text>
            </TouchableOpacity>
            <Text style={dp.yearLabel}>{navY}</Text>
            <TouchableOpacity style={dp.yearBtn} onPress={() => setNavY(y => y + 1)}>
              <Text style={dp.yearArrow}>▸</Text>
            </TouchableOpacity>
          </View>

          <View style={dp.dowRow}>
            {DAYS.map((d, idx) => (
              <View key={d} style={dp.dowCell}>
                <Text style={[dp.dowText, idx === 0 && { color: '#e94560' }]}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={dp.grid}>
            {cells().map((day, i) => {
              const isSelected = day && day === selD && navM === selM && navY === selY;
              const isSunday   = i % 7 === 0;
              return (
                <TouchableOpacity
                  key={i}
                  style={[dp.cell, isSelected && dp.cellSelected]}
                  onPress={() => { if (day) { setSelD(day); setSelM(navM); setSelY(navY); } }}
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

          <View style={dp.selectedBox}>
            {selD != null ? (
              <Text style={dp.selectedText}>
                {t('customers.dateSelected')} {String(selD).padStart(2,'0')}/{String((selM ?? 0) + 1).padStart(2,'0')}/{selY}
              </Text>
            ) : (
              <Text style={dp.selectedPlaceholder}>{t('customers.noDateSelected')}</Text>
            )}
          </View>

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

// ─── Confirm Delete Modal ─────────────────────────────────
function ConfirmDeleteModal({ visible, staffName, onConfirm, onClose }) {
  const { t } = useLanguage();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={cd.overlay}>
        <View style={cd.box}>
          <Text style={cd.icon}>🗑️</Text>
          <Text style={cd.title}>{t('staff.deleteTitle')}</Text>
          <Text style={cd.message}>
            {t('staff.deleteConfirm')}{'\n'}
            <Text style={cd.nameHighlight}>"{staffName}"</Text>
            {'\n'}{t('staff.deleteMsgSuffix')}
          </Text>
          <View style={cd.btnRow}>
            <TouchableOpacity style={cd.cancelBtn} onPress={onClose}>
              <Text style={cd.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={cd.deleteBtn} onPress={onConfirm}>
              <Text style={cd.deleteText}>{t('staff.deleteBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Staff Form Modal ─────────────────────────────────────
function StaffFormModal({ visible, initial, managers, onSave, onClose }) {
  const { t } = useLanguage();
  const isEdit = !!initial;
  const [gender,         setGender]         = useState('male');
  const [name,           setName]           = useState('');
  const [phone,          setPhone]          = useState('');
  const [dob,            setDob]            = useState('');
  const [idCard,         setIdCard]         = useState('');
  const [role,           setRole]           = useState('staff');
  const [managerId,      setManagerId]      = useState(null);
  const [permissions,    setPermissions]    = useState([]);
  const [dobPickerOpen,  setDobPickerOpen]  = useState(false);

  useEffect(() => {
    if (visible) {
      setGender(initial?.gender      || 'male');
      setName(initial?.name          || '');
      setPhone(initial?.phone        || '');
      setDob(initial?.dob            || '');
      setIdCard(initial?.idCard      || '');
      setRole(initial?.role          || 'staff');
      setManagerId(initial?.managerId || null);
      setPermissions(initial?.permissions || []);
      setDobPickerOpen(false);
    }
  }, [visible, initial]);

  const togglePerm = perm =>
    setPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);

  const canSave = name.trim() && phone.trim() && dob.trim() && idCard.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      gender,
      name:      name.trim(),
      phone:     phone.trim(),
      dob:       dob.trim(),
      idCard:    idCard.trim(),
      role,
      managerId: role === 'staff' ? managerId : null,
      permissions,
    });
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={sf.overlay}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={sf.sheet}>
              <View style={sf.handle} />
              <Text style={sf.title}>{isEdit ? t('staff.editTitle') : t('staff.createTitle')}</Text>

              {/* Gender */}
              <Text style={sf.label}>{t('staff.genderTitle')}</Text>
              <View style={sf.genderRow}>
                {GENDERS.map(g => (
                  <TouchableOpacity
                    key={g.key}
                    style={[sf.genderOpt, gender === g.key && sf.genderOptActive]}
                    onPress={() => setGender(g.key)}
                  >
                    <Text style={sf.genderIcon}>{g.icon}</Text>
                    <Text style={[sf.genderLabel, gender === g.key && sf.genderLabelActive]}>{t(g.tKey)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={sf.avatarNote}>{t('staff.avatarNote')}</Text>

              {/* Name */}
              <Text style={sf.label}>{t('staff.name')}</Text>
              <TextInput
                style={sf.input} value={name} onChangeText={setName}
                placeholder={t('staff.namePh')} placeholderTextColor="#8892b0"
              />

              {/* Phone */}
              <Text style={sf.label}>{t('staff.phone')}</Text>
              <TextInput
                style={sf.input} value={phone} onChangeText={setPhone}
                placeholder={t('staff.phonePh')} placeholderTextColor="#8892b0"
                keyboardType="phone-pad"
              />

              {/* DOB — calendar picker */}
              <Text style={sf.label}>{t('staff.birthdayLabel')}</Text>
              <TouchableOpacity style={sf.dateBtn} onPress={() => setDobPickerOpen(true)}>
                <Text style={sf.dateBtnIcon}>📅</Text>
                <Text style={[sf.dateBtnText, !dob && { color: '#8892b0' }]}>
                  {dob || t('staff.pickDate')}
                </Text>
              </TouchableOpacity>

              {/* ID Card */}
              <Text style={sf.label}>{t('staff.idLabel')}</Text>
              <TextInput
                style={sf.input} value={idCard} onChangeText={setIdCard}
                placeholder={t('staff.idPh')} placeholderTextColor="#8892b0"
                keyboardType="numeric" maxLength={12}
              />

              {/* Role */}
              <Text style={sf.label}>{t('staff.role')}</Text>
              <View style={sf.roleRow}>
                {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                  <TouchableOpacity
                    key={key}
                    style={[sf.roleOpt, role === key && { backgroundColor: cfg.bg, borderColor: cfg.color }]}
                    onPress={() => setRole(key)}
                  >
                    <Text style={sf.roleOptIcon}>{cfg.icon}</Text>
                    <Text style={[sf.roleOptText, role === key && { color: cfg.color, fontWeight: '700' }]}>
                      {t(cfg.tKey)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Manager selection (staff only) */}
              {role === 'staff' && (
                <>
                  <Text style={sf.label}>{t('staff.reportTo')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                      <TouchableOpacity
                        style={[sf.mgrChip, managerId === null && sf.mgrChipActive]}
                        onPress={() => setManagerId(null)}
                      >
                        <Text style={[sf.mgrChipText, managerId === null && sf.mgrChipTextActive]}>
                          {t('staff.unassigned')}
                        </Text>
                      </TouchableOpacity>
                      {managers.map(m => (
                        <TouchableOpacity
                          key={m.id}
                          style={[sf.mgrChip, managerId === m.id && sf.mgrChipActive]}
                          onPress={() => setManagerId(m.id)}
                        >
                          <Text style={sf.mgrChipIcon}>{getGenderIcon(m)}</Text>
                          <Text style={[sf.mgrChipText, managerId === m.id && sf.mgrChipTextActive]}>
                            {m.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {/* Permissions */}
              <Text style={sf.label}>{t('staff.permsLabel')}</Text>
              <View style={sf.permGrid}>
                {ALL_PERMISSIONS.map(perm => {
                  const active = permissions.includes(perm.tKey);
                  return (
                    <TouchableOpacity
                      key={perm.tKey}
                      style={[sf.permOpt, active && sf.permOptActive]}
                      onPress={() => togglePerm(perm.tKey)}
                    >
                      <Text style={sf.permCheck}>{active ? '✓' : '○'}</Text>
                      <Text style={[sf.permText, active && sf.permTextActive]}>{t(perm.tKey)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={sf.reqNote}>{t('staff.required')}</Text>

              <View style={sf.btnRow}>
                <TouchableOpacity style={sf.cancelBtn} onPress={onClose}>
                  <Text style={sf.cancelText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[sf.saveBtn, !canSave && sf.saveBtnDim]}
                  onPress={handleSave}
                >
                  <Text style={sf.saveText}>{isEdit ? t('common.update') : t('common.add')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <DatePickerModal
        visible={dobPickerOpen}
        value={dob}
        onConfirm={val => { setDob(val); setDobPickerOpen(false); }}
        onClose={() => setDobPickerOpen(false)}
      />
    </>
  );
}

// ─── Assign Staff Modal ───────────────────────────────────
function AssignStaffModal({ visible, manager, allStaff, onAssign, onClose }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (visible && manager) {
      setSelected(allStaff.filter(s => s.managerId === manager.id).map(s => s.id));
    }
  }, [visible, manager]);

  const toggle = id =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const eligibleStaff = allStaff.filter(s => s.role === 'staff');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sf.overlay}>
        <View style={[sf.sheet, { maxHeight: '70%' }]}>
          <View style={sf.handle} />
          <Text style={sf.title}>{t('staff.assignTitle')}</Text>
          <Text style={sf.sheetSub}>{t('staff.assignSelect')} {manager?.name}</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
            {eligibleStaff.length === 0 ? (
              <Text style={sm.empty}>{t('staff.noStaffSys')}</Text>
            ) : (
              eligibleStaff.map(member => {
                const isSelected = selected.includes(member.id);
                const icon = getGenderIcon(member);
                return (
                  <TouchableOpacity
                    key={member.id}
                    style={[sm.row, isSelected && sm.rowActive]}
                    onPress={() => toggle(member.id)}
                  >
                    <Text style={sm.icon}>{member.avatar ? '📷' : icon}</Text>
                    <View style={sm.info}>
                      <Text style={sm.name}>{member.name}</Text>
                      <Text style={sm.sub}>{getStaffId('staff', member.phone)}</Text>
                      {member.managerId && member.managerId !== manager?.id && (
                        <Text style={sm.warn}>{t('staff.otherMgr')}</Text>
                      )}
                    </View>
                    <View style={[sm.checkbox, isSelected && sm.checkboxOn]}>
                      {isSelected && <Text style={sm.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          <View style={[sf.btnRow, { marginTop: 16 }]}>
            <TouchableOpacity style={sf.cancelBtn} onPress={onClose}>
              <Text style={sf.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sf.saveBtn} onPress={() => onAssign(manager.id, selected)}>
              <Text style={sf.saveText}>{t('common.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Change Manager Modal ─────────────────────────────────
function ChangeManagerModal({ visible, staffMember, managers, onConfirm, onClose }) {
  const { t } = useLanguage();
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (visible) setSelectedId(staffMember?.managerId || null);
  }, [visible, staffMember]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sf.overlay}>
        <View style={[sf.sheet, { maxHeight: '60%' }]}>
          <View style={sf.handle} />
          <Text style={sf.title}>{t('staff.changeMgrTitle')}</Text>
          <Text style={sf.sheetSub}>{t('staff.selectMgrFor')} {staffMember?.name}</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
            <TouchableOpacity
              style={[sm.row, selectedId === null && sm.rowActive]}
              onPress={() => setSelectedId(null)}
            >
              <Text style={sm.icon}>➖</Text>
              <View style={sm.info}>
                <Text style={sm.name}>{t('staff.noAssign')}</Text>
              </View>
              <View style={[sm.checkbox, selectedId === null && sm.checkboxOn]}>
                {selectedId === null && <Text style={sm.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>

            {managers.map(m => {
              const isSelected = selectedId === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[sm.row, isSelected && sm.rowActive]}
                  onPress={() => setSelectedId(m.id)}
                >
                  <Text style={sm.icon}>{m.avatar ? '📷' : getGenderIcon(m)}</Text>
                  <View style={sm.info}>
                    <Text style={sm.name}>{m.name}</Text>
                    <Text style={sm.sub}>{getStaffId('manager', m.phone)}</Text>
                  </View>
                  <View style={[sm.checkbox, isSelected && sm.checkboxOn]}>
                    {isSelected && <Text style={sm.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[sf.btnRow, { marginTop: 16 }]}>
            <TouchableOpacity style={sf.cancelBtn} onPress={onClose}>
              <Text style={sf.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sf.saveBtn} onPress={() => onConfirm(staffMember.id, selectedId)}>
              <Text style={sf.saveText}>{t('common.confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function StaffScreen() {
  const { t } = useLanguage();
  const { buildings } = useBuildings();
  const [staff,            setStaff]            = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [formVisible,      setFormVisible]      = useState(false);
  const [editTarget,       setEditTarget]       = useState(null);
  const [assignVisible,    setAssignVisible]    = useState(false);
  const [assignManager,    setAssignManager]    = useState(null);
  const [changeMgrVisible, setChangeMgrVisible] = useState(false);
  const [changeMgrTarget,  setChangeMgrTarget]  = useState(null);
  const [deleteTarget,     setDeleteTarget]     = useState(null);

  // ── Load từ Supabase ──
  const loadStaff = async () => {
    const [{ data: rows, error: rErr }, { data: perms, error: pErr }] = await Promise.all([
      supabase.from('staff').select('*').order('id'),
      supabase.from('staff_permissions').select('*'),
    ]);
    if (rErr || pErr) { Alert.alert('Lỗi', 'Không tải được danh sách nhân viên'); return; }
    setStaff((rows ?? []).map(r => dbToApp(r, perms ?? [])));
  };

  useEffect(() => {
    loadStaff().finally(() => setLoading(false));
  }, []);

  const managers = staff.filter(s => s.role === 'manager');

  const staffBuildingsMap = useMemo(() => {
    const map = {};
    buildings.forEach(b => {
      const member = staff.find(s => s.name === b.staff);
      if (!member) return;
      if (!map[member.id]) map[member.id] = [];
      map[member.id].push({ name: b.name, code: b.code });
    });
    return map;
  }, [buildings, staff]);

  const managerBuildingsMap = useMemo(() => {
    const map = {};
    managers.forEach(mgr => {
      const subIds = staff.filter(s => s.managerId === mgr.id).map(s => s.id);
      const bldgs = [];
      buildings.forEach(b => {
        const member = staff.find(s => s.name === b.staff);
        if (member && subIds.includes(member.id)) bldgs.push({ name: b.name, code: b.code });
      });
      map[mgr.id] = bldgs;
    });
    return map;
  }, [buildings, staff, managers]);

  const toggleActive = async id => {
    const target = staff.find(s => s.id === id);
    if (!target) return;
    const newActive = !target.active;
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: newActive } : s));
    const { error } = await supabase.from('staff').update({ active: newActive }).eq('id', id);
    if (error) {
      setStaff(prev => prev.map(s => s.id === id ? { ...s, active: target.active } : s));
      Alert.alert('Lỗi', 'Không cập nhật được trạng thái');
    }
  };

  const handleSave = async data => {
    if (editTarget) {
      // ── Cập nhật ──
      setStaff(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...data } : s));
      setFormVisible(false);
      setEditTarget(null);
      const { error } = await supabase.from('staff').update(appToDb(data)).eq('id', editTarget.id);
      if (error) { Alert.alert('Lỗi', 'Không lưu được thông tin'); await loadStaff(); return; }
      await supabase.from('staff_permissions').delete().eq('staff_id', editTarget.id);
      if (data.permissions.length > 0) {
        await supabase.from('staff_permissions').insert(
          data.permissions.map(p => ({ staff_id: editTarget.id, permission: p }))
        );
      }
    } else {
      // ── Thêm mới ──
      const newId = `S-${Date.now()}`;
      const newMember = { id: newId, active: true, avatar: null, ...data };
      setStaff(prev => [...prev, newMember]);
      setFormVisible(false);
      const { error } = await supabase.from('staff').insert([{ id: newId, ...appToDb(data) }]);
      if (error) { Alert.alert('Lỗi', 'Không thêm được nhân viên'); await loadStaff(); return; }
      if (data.permissions.length > 0) {
        await supabase.from('staff_permissions').insert(
          data.permissions.map(p => ({ staff_id: newId, permission: p }))
        );
      }
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id   = deleteTarget.id;
    const role = deleteTarget.role;

    // Optimistic UI update
    setStaff(prev => {
      const filtered = prev.filter(s => s.id !== id);
      return role === 'manager'
        ? filtered.map(s => s.managerId === id ? { ...s, managerId: null } : s)
        : filtered;
    });
    setDeleteTarget(null);

    // Xoá tất cả tham chiếu FK trước để tránh constraint error
    await Promise.all([
      supabase.from('buildings').update({ staff_id: null }).eq('staff_id', id),
      supabase.from('staff').update({ manager_id: null }).eq('manager_id', id),
      supabase.from('messages').update({ resolved_by: null }).eq('resolved_by', id),
      supabase.from('payments').update({ collected_by: null }).eq('collected_by', id),
      supabase.from('notifications').update({ sender_id: null }).eq('sender_id', id),
    ]);

    const { error } = await supabase.from('staff').delete().eq('id', id);
    if (error) {
      Alert.alert('Lỗi', 'Không xoá được nhân viên: ' + error.message);
      await loadStaff();
    }
  };

  const handleAssignStaff = async (managerId, staffIds) => {
    setStaff(prev => prev.map(s => {
      if (s.role !== 'staff') return s;
      if (staffIds.includes(s.id)) return { ...s, managerId };
      if (s.managerId === managerId) return { ...s, managerId: null };
      return s;
    }));
    setAssignVisible(false);
    setAssignManager(null);
    const toAssign   = staffIds;
    const toUnassign = staff.filter(s => s.role === 'staff' && s.managerId === managerId && !staffIds.includes(s.id)).map(s => s.id);
    await Promise.all([
      ...toAssign.map(id => supabase.from('staff').update({ manager_id: managerId }).eq('id', id)),
      ...toUnassign.map(id => supabase.from('staff').update({ manager_id: null }).eq('id', id)),
    ]);
  };

  const handleChangeManager = async (staffId, newManagerId) => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, managerId: newManagerId } : s));
    setChangeMgrVisible(false);
    setChangeMgrTarget(null);
    const { error } = await supabase.from('staff').update({ manager_id: newManagerId }).eq('id', staffId);
    if (error) { Alert.alert('Lỗi', 'Không cập nhật được quản lý'); await loadStaff(); }
  };

  const openAdd       = ()     => { setEditTarget(null); setFormVisible(true); };
  const openEdit      = item   => { setEditTarget(item); setFormVisible(true); };
  const openAssign    = mgr    => { setAssignManager(mgr); setAssignVisible(true); };
  const openChangeMgr = member => { setChangeMgrTarget(member); setChangeMgrVisible(true); };
  const openDelete    = item   => setDeleteTarget(item);

  const totalManagers = managers.length;
  const totalActive   = staff.filter(s => s.active).length;
  const totalInactive = staff.filter(s => !s.active).length;

  if (loading) {
    return (
      <SafeAreaView style={s.safe}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#8892b0', fontSize: 16 }}>Đang tải...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      <ConfirmDeleteModal
        visible={!!deleteTarget}
        staffName={deleteTarget?.name || ''}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
      <StaffFormModal
        visible={formVisible}
        initial={editTarget}
        managers={managers}
        onSave={handleSave}
        onClose={() => { setFormVisible(false); setEditTarget(null); }}
      />
      <AssignStaffModal
        visible={assignVisible}
        manager={assignManager}
        allStaff={staff}
        onAssign={handleAssignStaff}
        onClose={() => { setAssignVisible(false); setAssignManager(null); }}
      />
      <ChangeManagerModal
        visible={changeMgrVisible}
        staffMember={changeMgrTarget}
        managers={managers}
        onConfirm={handleChangeManager}
        onClose={() => { setChangeMgrVisible(false); setChangeMgrTarget(null); }}
      />

      <View style={s.container}>
        <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.header}>
          <View>
            <Text style={s.title}>{t('staff.title')}</Text>
            <Text style={s.subtitle}>{staff.length} {t('staff.memberCount')}</Text>
          </View>
          <View style={s.headerRight}>
            <LanguageSwitcher />
            <TouchableOpacity style={s.addBtn} onPress={openAdd}>
              <Text style={s.addBtnText}>{t('staff.addNew')}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={s.summaryStrip}>
          <View style={s.sumItem}>
            <Text style={s.sumNum}>{staff.length}</Text>
            <Text style={s.sumLbl}>{t('staff.summary.total')}</Text>
          </View>
          <View style={s.sumDiv} />
          <View style={s.sumItem}>
            <Text style={[s.sumNum, { color: MGR_COLOR }]}>{totalManagers}</Text>
            <Text style={s.sumLbl}>{t('staff.summary.manager')}</Text>
          </View>
          <View style={s.sumDiv} />
          <View style={s.sumItem}>
            <Text style={[s.sumNum, { color: '#00f593' }]}>{totalActive}</Text>
            <Text style={s.sumLbl}>{t('staff.summary.active')}</Text>
          </View>
          <View style={s.sumDiv} />
          <View style={s.sumItem}>
            <Text style={[s.sumNum, { color: '#8892b0' }]}>{totalInactive}</Text>
            <Text style={s.sumLbl}>{t('staff.summary.inactive')}</Text>
          </View>
        </View>

        <FlatList
          data={staff}
          keyExtractor={item => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>👥</Text>
              <Text style={s.emptyText}>{t('staff.noStaff')}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isManager  = item.role === 'manager';
            const accent     = isManager ? MGR_COLOR : STAFF_COLOR;
            const roleCfg    = ROLE_CONFIG[item.role];
            const genderIcon = getGenderIcon(item);
            const staffId    = getStaffId(item.role, item.phone);

            const subordinates = isManager ? staff.filter(s => s.managerId === item.id) : [];
            const myManager    = !isManager ? staff.find(s => s.id === item.managerId) : null;
            const myBuildings  = isManager
              ? (managerBuildingsMap[item.id] || [])
              : (staffBuildingsMap[item.id] || []);

            return (
              <View style={[
                s.card,
                { borderColor: isManager ? 'rgba(192,132,252,0.3)' : 'rgba(56,189,248,0.2)' },
                !item.active && s.cardInactive,
              ]}>

                {/* Role accent bar */}
                <View style={[s.accentBar, { backgroundColor: accent }]} />

                {/* Card header */}
                <View style={s.cardTop}>
                  {/* Avatar */}
                  <View style={[s.avatarWrap, { borderColor: accent + '66' }]}>
                    {item.avatar
                      ? <Image source={{ uri: item.avatar }} style={s.avatarImg} />
                      : <Text style={s.avatarIcon}>{genderIcon}</Text>
                    }
                    <View style={[s.onlineDot, { backgroundColor: item.active ? '#00f593' : '#636e72' }]} />
                  </View>

                  {/* Name + ID + phone */}
                  <View style={s.nameBlock}>
                    <Text style={s.name}>{item.name}</Text>
                    <Text style={[s.staffId, { color: accent }]}>{staffId}</Text>
                    <Text style={s.phone}>📱 {item.phone}</Text>
                  </View>

                  {/* Role badge + status pill stacked */}
                  <View style={s.rightBlock}>
                    <View style={[s.roleBadge, { backgroundColor: roleCfg.bg, borderColor: accent + '55' }]}>
                      <Text style={s.roleIcon}>{roleCfg.icon}</Text>
                      <Text style={[s.roleText, { color: accent }]}>{t(roleCfg.tKey)}</Text>
                    </View>
                    <View style={[s.statusPill, { backgroundColor: item.active ? 'rgba(0,245,147,0.15)' : 'rgba(99,110,114,0.18)', borderColor: item.active ? '#00f593' : '#636e72' }]}>
                      <View style={[s.statusDot, { backgroundColor: item.active ? '#00f593' : '#636e72' }]} />
                      <Text style={[s.statusText, { color: item.active ? '#00f593' : '#636e72' }]}>
                        {item.active ? t('status.active') : t('status.inactive')}
                      </Text>
                    </View>
                    <Switch
                      value={item.active}
                      onValueChange={() => toggleActive(item.id)}
                      trackColor={{ false: 'rgba(255,255,255,0.12)', true: accent + '88' }}
                      thumbColor={item.active ? accent : 'rgba(255,255,255,0.4)'}
                      ios_backgroundColor="rgba(255,255,255,0.12)"
                      style={{ transform: [{ scaleX: 0.82 }, { scaleY: 0.82 }] }}
                    />
                  </View>
                </View>

                {/* Personal info chips */}
                <View style={s.infoRow}>
                  <View style={s.infoItem}>
                    <Text style={s.infoLabel}>{t('staff.birthday')}</Text>
                    <Text style={s.infoValue}>{item.dob || '—'}</Text>
                  </View>
                  <View style={s.infoItem}>
                    <Text style={s.infoLabel}>{t('staff.idCard')}</Text>
                    <Text style={s.infoValue}>{item.idCard || '—'}</Text>
                  </View>
                </View>

                <View style={s.divider} />

                {/* Buildings section */}
                <Text style={s.sectionLabel}>
                  {isManager ? t('staff.buildings') : t('staff.managedBuildings')}
                </Text>
                {myBuildings.length === 0
                  ? <Text style={s.emptySmall}>{t('staff.noBuildings')}</Text>
                  : <View style={s.buildingChips}>
                      {myBuildings.map(b => (
                        <View key={b.code} style={[s.buildingChip, { borderColor: accent + '55', backgroundColor: accent + '18' }]}>
                          <Text style={[s.buildingCode, { color: accent }]}>{b.code}</Text>
                          <Text style={s.buildingName} numberOfLines={1}>
                            {b.name.includes(' - ') ? b.name.split(' - ')[1] : b.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                }

                <View style={s.divider} />

                {/* Manager / Staff relationship */}
                {isManager ? (
                  <View>
                    <View style={s.relHeader}>
                      <Text style={s.sectionLabel}>{t('staff.subordinates')} ({subordinates.length})</Text>
                      <TouchableOpacity
                        style={[s.actionChip, { borderColor: MGR_COLOR + '55', backgroundColor: MGR_COLOR + '18' }]}
                        onPress={() => openAssign(item)}
                      >
                        <Text style={[s.actionChipText, { color: MGR_COLOR }]}>{t('staff.assign')}</Text>
                      </TouchableOpacity>
                    </View>
                    {subordinates.length === 0
                      ? <Text style={s.emptySmall}>{t('staff.noSubordinates')}</Text>
                      : subordinates.map(sub => (
                        <View key={sub.id} style={[s.subRow, { borderColor: 'rgba(192,132,252,0.12)' }]}>
                          <Text style={s.subIcon}>{sub.avatar ? '📷' : getGenderIcon(sub)}</Text>
                          <View style={s.subInfo}>
                            <Text style={s.subName}>{sub.name}</Text>
                            <Text style={s.subId}>{getStaffId('staff', sub.phone)}</Text>
                          </View>
                          <View style={[s.subDot, { backgroundColor: sub.active ? '#00f593' : '#636e72' }]} />
                        </View>
                      ))
                    }
                  </View>
                ) : (
                  <View>
                    <View style={s.relHeader}>
                      <Text style={s.sectionLabel}>{t('staff.directMgr')}</Text>
                      <TouchableOpacity
                        style={[s.actionChip, { borderColor: STAFF_COLOR + '55', backgroundColor: STAFF_COLOR + '18' }]}
                        onPress={() => openChangeMgr(item)}
                      >
                        <Text style={[s.actionChipText, { color: STAFF_COLOR }]}>{t('staff.changeMgr')}</Text>
                      </TouchableOpacity>
                    </View>
                    {myManager ? (
                      <View style={[s.managerBox, { borderColor: MGR_COLOR + '44', backgroundColor: MGR_COLOR + '0e' }]}>
                        <Text style={s.managerIcon}>{myManager.avatar ? '📷' : getGenderIcon(myManager)}</Text>
                        <View style={s.managerInfo}>
                          <Text style={[s.managerName, { color: MGR_COLOR }]}>{myManager.name}</Text>
                          <Text style={s.managerId}>{getStaffId('manager', myManager.phone)}</Text>
                        </View>
                        <Text style={{ fontSize: 18 }}>👑</Text>
                      </View>
                    ) : (
                      <Text style={s.emptySmall}>{t('staff.noMgr')}</Text>
                    )}
                  </View>
                )}

                <View style={s.divider} />

                {/* Permissions */}
                <Text style={s.sectionLabel}>{t('staff.permissions')}</Text>
                <View style={s.permGrid}>
                  {item.permissions.length === 0
                    ? <Text style={s.emptySmall}>{t('staff.noPermissions')}</Text>
                    : item.permissions.map((perm, i) => (
                      <View key={i} style={[s.permBadge, { borderColor: accent + '44', backgroundColor: accent + '12' }]}>
                        <Text style={[s.permCheck, { color: accent }]}>✓</Text>
                        <Text style={s.permText}>{t(perm)}</Text>
                      </View>
                    ))
                  }
                </View>

                {/* Actions */}
                <View style={s.actions}>
                  <TouchableOpacity
                    style={[s.actionEdit, { borderColor: accent + '55', backgroundColor: accent + '14' }]}
                    onPress={() => openEdit(item)}
                  >
                    <Text style={[s.actionEditText, { color: accent }]}>{t('staff.editBtn')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actionDelete} onPress={() => openDelete(item)}>
                    <Text style={s.actionDeleteText}>🗑</Text>
                  </TouchableOpacity>
                </View>

              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

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
  yearBtn:     { backgroundColor: 'rgba(162,155,254,0.12)', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(162,155,254,0.25)' },
  yearArrow:   { color: '#a29bfe', fontSize: 15, fontWeight: '800' },
  yearLabel:   { color: '#a29bfe', fontSize: 18, fontWeight: '900', minWidth: 56, textAlign: 'center' },

  dowRow:      { flexDirection: 'row', marginBottom: 4 },
  dowCell:     { flex: 1, alignItems: 'center', paddingVertical: 4 },
  dowText:     { color: '#8892b0', fontSize: 12, fontWeight: '700' },

  grid:        { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  cell:        { width: '14.285714%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  cellSelected:{ backgroundColor: '#a29bfe' },
  cellText:    { color: '#ccd6f6', fontSize: 14 },
  cellTextSelected: { color: '#fff', fontWeight: '800' },

  selectedBox:         { backgroundColor: 'rgba(162,155,254,0.08)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(162,155,254,0.2)' },
  selectedText:        { color: '#a29bfe', fontSize: 14, fontWeight: '700' },
  selectedPlaceholder: { color: '#8892b0', fontSize: 13 },

  btnRow:      { flexDirection: 'row', gap: 10 },
  cancelBtn:   { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelText:  { color: '#8892b0', fontWeight: '700', fontSize: 14 },
  confirmBtn:  { flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#a29bfe' },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 14 },
});

// ─── Confirm Delete styles ────────────────────────────────
const cd = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 32 },
  box:           { backgroundColor: '#111827', borderRadius: 24, padding: 28, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: 'rgba(255,118,117,0.2)' },
  icon:          { fontSize: 40, marginBottom: 12 },
  title:         { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  message:       { color: '#8892b0', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  nameHighlight: { color: '#fff', fontWeight: '700' },
  btnRow:        { flexDirection: 'row', gap: 10, width: '100%' },
  cancelBtn:     { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelText:    { color: '#8892b0', fontWeight: '700', fontSize: 14 },
  deleteBtn:     { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,118,117,0.15)', borderWidth: 1, borderColor: 'rgba(255,118,117,0.4)' },
  deleteText:    { color: '#ff7675', fontWeight: '800', fontSize: 14 },
});

// ─── Selection Modal styles ───────────────────────────────
const sm = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  rowActive:  { backgroundColor: 'rgba(116,185,255,0.1)', borderColor: 'rgba(116,185,255,0.35)' },
  icon:       { fontSize: 26, marginRight: 12 },
  info:       { flex: 1 },
  name:       { color: '#fff', fontSize: 14, fontWeight: '700' },
  sub:        { color: '#8892b0', fontSize: 12, marginTop: 2 },
  warn:       { color: '#f1c40f', fontSize: 11, marginTop: 2 },
  empty:      { color: '#8892b0', textAlign: 'center', paddingVertical: 20, fontSize: 13 },
  checkbox:   { width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  checkboxOn: { backgroundColor: '#74b9ff', borderColor: '#74b9ff' },
  checkmark:  { color: '#fff', fontSize: 14, fontWeight: '800' },
});

// ─── Form Modal styles ────────────────────────────────────
const sf = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  sheet:     { backgroundColor: '#111827', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48 },
  handle:    { width: 40, height: 4, backgroundColor: '#333', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  title:     { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  sheetSub:  { color: '#8892b0', fontSize: 13, marginBottom: 4 },
  label:     { color: '#8892b0', fontSize: 11, fontWeight: '700', marginBottom: 8, marginTop: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  input:     { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },

  dateBtn:       { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 13 },
  dateBtnIcon:   { fontSize: 18 },
  dateBtnText:   { color: '#fff', fontSize: 14, fontWeight: '600' },

  genderRow:         { flexDirection: 'row', gap: 12 },
  genderOpt:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', gap: 6 },
  genderOptActive:   { borderColor: '#74b9ff', backgroundColor: 'rgba(116,185,255,0.12)' },
  genderIcon:        { fontSize: 30 },
  genderLabel:       { color: '#8892b0', fontSize: 13, fontWeight: '700' },
  genderLabelActive: { color: '#74b9ff' },
  avatarNote:        { color: '#8892b0', fontSize: 11, marginTop: 8, fontStyle: 'italic' },

  roleRow:     { flexDirection: 'row', gap: 10 },
  roleOpt:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', paddingVertical: 12 },
  roleOptIcon: { fontSize: 18 },
  roleOptText: { color: '#8892b0', fontSize: 14 },

  mgrChip:           { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 14, paddingVertical: 8 },
  mgrChipActive:     { borderColor: '#a29bfe', backgroundColor: 'rgba(162,155,254,0.12)' },
  mgrChipIcon:       { fontSize: 16 },
  mgrChipText:       { color: '#8892b0', fontSize: 13, fontWeight: '600' },
  mgrChipTextActive: { color: '#a29bfe' },

  permGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  permOpt:        { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.04)', paddingHorizontal: 12, paddingVertical: 8 },
  permOptActive:  { borderColor: 'rgba(116,185,255,0.45)', backgroundColor: 'rgba(116,185,255,0.1)' },
  permCheck:      { color: '#8892b0', fontSize: 13, fontWeight: '700', width: 14 },
  permText:       { color: '#8892b0', fontSize: 13 },
  permTextActive: { color: '#74b9ff', fontWeight: '600' },

  reqNote:    { color: '#8892b0', fontSize: 11, marginTop: 14, fontStyle: 'italic' },
  btnRow:     { flexDirection: 'row', gap: 10, marginTop: 24 },
  cancelBtn:  { flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelText: { color: '#8892b0', fontWeight: '700', fontSize: 14 },
  saveBtn:    { flex: 2, borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: '#a29bfe' },
  saveBtnDim: { opacity: 0.35 },
  saveText:   { color: '#fff', fontWeight: '800', fontSize: 14 },
});

// ─── Screen styles ────────────────────────────────────────
const s = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#0d0d1a' },

  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 30, paddingBottom: 20 },
  title:       { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle:    { color: '#8892b0', fontSize: 13, marginTop: 4 },
  headerRight: { flexDirection: 'column', alignItems: 'flex-end', gap: 8 },
  addBtn:      { backgroundColor: 'rgba(192,132,252,0.18)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: 'rgba(192,132,252,0.5)' },
  addBtnText:  { color: MGR_COLOR, fontWeight: '800', fontSize: 13 },

  summaryStrip: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 8 },
  sumItem: { flex: 1, alignItems: 'center' },
  sumNum:  { color: '#fff', fontSize: 22, fontWeight: '900' },
  sumLbl:  { color: '#8892b0', fontSize: 10, marginTop: 2, fontWeight: '600', textAlign: 'center' },
  sumDiv:  { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },

  list:       { padding: 16, paddingTop: 8 },
  emptyWrap:  { alignItems: 'center', paddingTop: 60 },
  emptyIcon:  { fontSize: 40, marginBottom: 10 },
  emptyText:  { color: '#8892b0', fontSize: 14 },
  emptySmall: { color: '#8892b0', fontSize: 12, fontStyle: 'italic', paddingVertical: 4, paddingHorizontal: 14 },

  card:         { backgroundColor: '#111827', borderRadius: 20, overflow: 'hidden', marginBottom: 14, borderWidth: 1 },
  cardInactive: { opacity: 0.52 },

  accentBar: { height: 4, width: '100%' },

  cardTop:   { flexDirection: 'row', alignItems: 'flex-start', padding: 14, paddingBottom: 10 },

  avatarWrap: { position: 'relative', marginRight: 12, width: 52, height: 52, borderRadius: 16, borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  avatarIcon: { fontSize: 38 },
  avatarImg:  { width: 48, height: 48, borderRadius: 14 },
  onlineDot:  { position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#111827' },

  nameBlock: { flex: 1 },
  name:      { color: '#fff', fontSize: 16, fontWeight: '800' },
  staffId:   { fontSize: 12, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
  phone:     { color: '#8892b0', fontSize: 12, marginTop: 3 },

  rightBlock:  { alignItems: 'flex-end', gap: 6 },
  roleBadge:   { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4, gap: 4, borderWidth: 1 },
  roleIcon:    { fontSize: 12 },
  roleText:    { fontSize: 12, fontWeight: '700' },
  statusPill:  { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3, gap: 5, borderWidth: 1 },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusText:  { fontSize: 10, fontWeight: '700' },

  infoRow:   { flexDirection: 'row', gap: 10, marginTop: 4, marginHorizontal: 14, marginBottom: 14 },
  infoItem:  { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  infoLabel: { color: '#8892b0', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  infoValue: { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },

  divider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 14, marginVertical: 12 },
  sectionLabel: { color: '#8892b0', fontSize: 11, fontWeight: '700', marginBottom: 8, marginHorizontal: 14, textTransform: 'uppercase', letterSpacing: 0.5 },

  buildingChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, marginBottom: 2 },
  buildingChip:  { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6, gap: 6 },
  buildingCode:  { fontSize: 13, fontWeight: '800' },
  buildingName:  { color: '#ccd6f6', fontSize: 12, fontWeight: '500' },

  permGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 7, paddingHorizontal: 14, marginBottom: 2 },
  permBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, gap: 4, borderWidth: 1 },
  permCheck: { fontSize: 11, fontWeight: '800' },
  permText:  { color: '#ccd6f6', fontSize: 12 },

  relHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 14 },
  actionChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  actionChipText: { fontSize: 11, fontWeight: '700' },

  subRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 14, borderBottomWidth: 1 },
  subIcon:   { fontSize: 22, marginRight: 10 },
  subInfo:   { flex: 1 },
  subName:   { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
  subId:     { color: '#8892b0', fontSize: 11, marginTop: 2 },
  subDot:    { width: 9, height: 9, borderRadius: 5 },

  managerBox:  { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, borderRadius: 12, borderWidth: 1, padding: 12, gap: 10 },
  managerIcon: { fontSize: 28 },
  managerInfo: { flex: 1 },
  managerName: { fontSize: 14, fontWeight: '800' },
  managerId:   { color: '#8892b0', fontSize: 11, marginTop: 2 },

  actions:          { flexDirection: 'row', gap: 8, margin: 14, marginTop: 14 },
  actionEdit:       { flex: 1, borderRadius: 12, paddingVertical: 11, alignItems: 'center', borderWidth: 1 },
  actionEditText:   { fontSize: 13, fontWeight: '700' },
  actionDelete:     { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,118,117,0.1)', borderWidth: 1, borderColor: 'rgba(255,118,117,0.35)' },
  actionDeleteText: { fontSize: 17 },
});
