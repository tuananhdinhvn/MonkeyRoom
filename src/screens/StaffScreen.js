import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Switch, Modal, ScrollView, TextInput, StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// ─── Constants ────────────────────────────────────────────
const ALL_PERMISSIONS = [
  'Xem tất cả', 'Quản lý phòng', 'Quản lý khách',
  'Thu tiền', 'Báo cáo', 'Xem phòng', 'Bảo trì',
];

const ROLE_CONFIG = {
  manager: { label: 'Quản lý',   color: '#a29bfe', bg: 'rgba(162,155,254,0.15)', icon: '👑' },
  staff:   { label: 'Nhân viên', color: '#74b9ff', bg: 'rgba(116,185,255,0.15)', icon: '💼' },
};

const GENDERS = [
  { key: 'male',   icon: '👨‍💼', label: 'Nam' },
  { key: 'female', icon: '👩‍💼', label: 'Nữ' },
];

const MONTHS_VI = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6',
                   'Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
const DAYS_VI   = ['CN','T2','T3','T4','T5','T6','T7'];

function getStaffId(role, phone) {
  const prefix = role === 'manager' ? 'M' : 'S';
  return `${prefix}-${phone.replace(/\D/g, '')}`;
}

function getGenderIcon(member) {
  if (member.avatar) return null;
  return GENDERS.find(g => g.key === member.gender)?.icon || '👤';
}

const INIT_STAFF = [
  {
    id: '1', name: 'Nguyễn Quản Lý', role: 'manager', phone: '0901111222',
    dob: '15/03/1985', idCard: '012345678901',
    gender: 'male', avatar: null, active: true, managerId: null,
    permissions: ['Xem tất cả', 'Quản lý phòng', 'Quản lý khách', 'Thu tiền', 'Báo cáo'],
  },
  {
    id: '2', name: 'Trần Thị Thu', role: 'staff', phone: '0912333444',
    dob: '20/07/1995', idCard: '098765432109',
    gender: 'female', avatar: null, active: true, managerId: '1',
    permissions: ['Xem phòng', 'Quản lý khách', 'Thu tiền'],
  },
  {
    id: '3', name: 'Nguyễn Văn Bảo', role: 'staff', phone: '0923555666',
    dob: '10/12/1993', idCard: '087654321098',
    gender: 'male', avatar: null, active: true, managerId: '1',
    permissions: ['Xem phòng', 'Quản lý khách', 'Thu tiền'],
  },
  {
    id: '4', name: 'Lê Thị Hương', role: 'staff', phone: '0934777888',
    dob: '05/06/1997', idCard: '076543210987',
    gender: 'female', avatar: null, active: false, managerId: null,
    permissions: ['Xem phòng', 'Bảo trì'],
  },
];

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
          <Text style={dp.title}>Chọn ngày sinh</Text>

          <View style={dp.navRow}>
            <TouchableOpacity style={dp.navBtn} onPress={prevMonth}>
              <Text style={dp.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={dp.navLabel}>{MONTHS_VI[navM]}</Text>
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
            {DAYS_VI.map(d => (
              <View key={d} style={dp.dowCell}>
                <Text style={[dp.dowText, d === 'CN' && { color: '#e94560' }]}>{d}</Text>
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
                Ngày đã chọn: {String(selD).padStart(2,'0')}/{String((selM ?? 0) + 1).padStart(2,'0')}/{selY}
              </Text>
            ) : (
              <Text style={dp.selectedPlaceholder}>Chưa chọn ngày</Text>
            )}
          </View>

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

// ─── Confirm Delete Modal ─────────────────────────────────
function ConfirmDeleteModal({ visible, staffName, onConfirm, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={cd.overlay}>
        <View style={cd.box}>
          <Text style={cd.icon}>🗑️</Text>
          <Text style={cd.title}>Xóa tài khoản nhân viên</Text>
          <Text style={cd.message}>
            Bạn có chắc chắn muốn xóa tài khoản{'\n'}
            <Text style={cd.nameHighlight}>"{staffName}"</Text>
            {'\n'}không? Hành động này không thể hoàn tác.
          </Text>
          <View style={cd.btnRow}>
            <TouchableOpacity style={cd.cancelBtn} onPress={onClose}>
              <Text style={cd.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={cd.deleteBtn} onPress={onConfirm}>
              <Text style={cd.deleteText}>Xóa tài khoản</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Staff Form Modal ─────────────────────────────────────
function StaffFormModal({ visible, initial, managers, onSave, onClose }) {
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
              <Text style={sf.title}>{isEdit ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</Text>

              {/* Gender */}
              <Text style={sf.label}>Giới tính & Avatar *</Text>
              <View style={sf.genderRow}>
                {GENDERS.map(g => (
                  <TouchableOpacity
                    key={g.key}
                    style={[sf.genderOpt, gender === g.key && sf.genderOptActive]}
                    onPress={() => setGender(g.key)}
                  >
                    <Text style={sf.genderIcon}>{g.icon}</Text>
                    <Text style={[sf.genderLabel, gender === g.key && sf.genderLabelActive]}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={sf.avatarNote}>
                💡 Avatar tùy chỉnh chỉ nhân viên tự cập nhật qua tài khoản của họ
              </Text>

              {/* Name */}
              <Text style={sf.label}>Họ và tên *</Text>
              <TextInput
                style={sf.input} value={name} onChangeText={setName}
                placeholder="VD: Nguyễn Văn A" placeholderTextColor="#8892b0"
              />

              {/* Phone */}
              <Text style={sf.label}>Số điện thoại *</Text>
              <TextInput
                style={sf.input} value={phone} onChangeText={setPhone}
                placeholder="VD: 0912345678" placeholderTextColor="#8892b0"
                keyboardType="phone-pad"
              />

              {/* DOB — calendar picker */}
              <Text style={sf.label}>Ngày sinh *</Text>
              <TouchableOpacity style={sf.dateBtn} onPress={() => setDobPickerOpen(true)}>
                <Text style={sf.dateBtnIcon}>📅</Text>
                <Text style={[sf.dateBtnText, !dob && { color: '#8892b0' }]}>
                  {dob || 'Chọn ngày sinh'}
                </Text>
              </TouchableOpacity>

              {/* ID Card */}
              <Text style={sf.label}>Căn cước công dân *</Text>
              <TextInput
                style={sf.input} value={idCard} onChangeText={setIdCard}
                placeholder="12 chữ số" placeholderTextColor="#8892b0"
                keyboardType="numeric" maxLength={12}
              />

              {/* Role */}
              <Text style={sf.label}>Vai trò</Text>
              <View style={sf.roleRow}>
                {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                  <TouchableOpacity
                    key={key}
                    style={[sf.roleOpt, role === key && { backgroundColor: cfg.bg, borderColor: cfg.color }]}
                    onPress={() => setRole(key)}
                  >
                    <Text style={sf.roleOptIcon}>{cfg.icon}</Text>
                    <Text style={[sf.roleOptText, role === key && { color: cfg.color, fontWeight: '700' }]}>
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Manager selection (staff only) */}
              {role === 'staff' && (
                <>
                  <Text style={sf.label}>Thuộc quyền quản lý</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 4 }}>
                      <TouchableOpacity
                        style={[sf.mgrChip, managerId === null && sf.mgrChipActive]}
                        onPress={() => setManagerId(null)}
                      >
                        <Text style={[sf.mgrChipText, managerId === null && sf.mgrChipTextActive]}>
                          Chưa phân công
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
              <Text style={sf.label}>Quyền truy cập</Text>
              <View style={sf.permGrid}>
                {ALL_PERMISSIONS.map(perm => {
                  const active = permissions.includes(perm);
                  return (
                    <TouchableOpacity
                      key={perm}
                      style={[sf.permOpt, active && sf.permOptActive]}
                      onPress={() => togglePerm(perm)}
                    >
                      <Text style={sf.permCheck}>{active ? '✓' : '○'}</Text>
                      <Text style={[sf.permText, active && sf.permTextActive]}>{perm}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={sf.reqNote}>* Bắt buộc điền đầy đủ trước khi lưu</Text>

              <View style={sf.btnRow}>
                <TouchableOpacity style={sf.cancelBtn} onPress={onClose}>
                  <Text style={sf.cancelText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[sf.saveBtn, !canSave && sf.saveBtnDim]}
                  onPress={handleSave}
                >
                  <Text style={sf.saveText}>{isEdit ? 'Cập nhật' : 'Thêm mới'}</Text>
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
          <Text style={sf.title}>Phân công nhân viên</Text>
          <Text style={sf.sheetSub}>Chọn nhân viên trực thuộc {manager?.name}</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
            {eligibleStaff.length === 0 ? (
              <Text style={sm.empty}>Chưa có nhân viên nào trong hệ thống</Text>
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
                        <Text style={sm.warn}>⚠️ Đang thuộc quản lý khác</Text>
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
              <Text style={sf.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sf.saveBtn} onPress={() => onAssign(manager.id, selected)}>
              <Text style={sf.saveText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Change Manager Modal ─────────────────────────────────
function ChangeManagerModal({ visible, staffMember, managers, onConfirm, onClose }) {
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (visible) setSelectedId(staffMember?.managerId || null);
  }, [visible, staffMember]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sf.overlay}>
        <View style={[sf.sheet, { maxHeight: '60%' }]}>
          <View style={sf.handle} />
          <Text style={sf.title}>Đổi quản lý</Text>
          <Text style={sf.sheetSub}>Chọn quản lý cho {staffMember?.name}</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 12 }}>
            <TouchableOpacity
              style={[sm.row, selectedId === null && sm.rowActive]}
              onPress={() => setSelectedId(null)}
            >
              <Text style={sm.icon}>➖</Text>
              <View style={sm.info}>
                <Text style={sm.name}>Chưa phân công</Text>
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
              <Text style={sf.cancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sf.saveBtn} onPress={() => onConfirm(staffMember.id, selectedId)}>
              <Text style={sf.saveText}>Xác nhận</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function StaffScreen() {
  const [staff,            setStaff]            = useState(INIT_STAFF);
  const [formVisible,      setFormVisible]      = useState(false);
  const [editTarget,       setEditTarget]       = useState(null);
  const [assignVisible,    setAssignVisible]    = useState(false);
  const [assignManager,    setAssignManager]    = useState(null);
  const [changeMgrVisible, setChangeMgrVisible] = useState(false);
  const [changeMgrTarget,  setChangeMgrTarget]  = useState(null);
  const [deleteTarget,     setDeleteTarget]     = useState(null); // { id, name }

  const managers = staff.filter(s => s.role === 'manager');

  const toggleActive = id =>
    setStaff(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));

  const handleSave = data => {
    if (editTarget) {
      setStaff(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...data } : s));
    } else {
      setStaff(prev => [...prev, { id: String(Date.now()), active: true, avatar: null, ...data }]);
    }
    setFormVisible(false);
    setEditTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setStaff(prev => {
      const filtered = prev.filter(s => s.id !== deleteTarget.id);
      if (deleteTarget.role === 'manager') {
        return filtered.map(s => s.managerId === deleteTarget.id ? { ...s, managerId: null } : s);
      }
      return filtered;
    });
    setDeleteTarget(null);
  };

  const handleAssignStaff = (managerId, staffIds) => {
    setStaff(prev => prev.map(s => {
      if (s.role !== 'staff') return s;
      if (staffIds.includes(s.id)) return { ...s, managerId };
      if (s.managerId === managerId) return { ...s, managerId: null };
      return s;
    }));
    setAssignVisible(false);
    setAssignManager(null);
  };

  const handleChangeManager = (staffId, newManagerId) => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, managerId: newManagerId } : s));
    setChangeMgrVisible(false);
    setChangeMgrTarget(null);
  };

  const openAdd       = ()     => { setEditTarget(null); setFormVisible(true); };
  const openEdit      = item   => { setEditTarget(item); setFormVisible(true); };
  const openAssign    = mgr    => { setAssignManager(mgr); setAssignVisible(true); };
  const openChangeMgr = member => { setChangeMgrTarget(member); setChangeMgrVisible(true); };
  const openDelete    = item   => setDeleteTarget(item);

  const totalManagers = managers.length;
  const totalActive   = staff.filter(s => s.active).length;
  const totalInactive = staff.filter(s => !s.active).length;

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
            <Text style={s.title}>Phân quyền nhân viên</Text>
            <Text style={s.subtitle}>{staff.length} thành viên</Text>
          </View>
          <TouchableOpacity style={s.addBtn} onPress={openAdd}>
            <Text style={s.addBtnText}>＋ Thêm mới</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={s.summaryStrip}>
          <View style={s.sumItem}>
            <Text style={s.sumNum}>{staff.length}</Text>
            <Text style={s.sumLbl}>Tổng</Text>
          </View>
          <View style={s.sumDiv} />
          <View style={s.sumItem}>
            <Text style={[s.sumNum, { color: '#a29bfe' }]}>{totalManagers}</Text>
            <Text style={s.sumLbl}>Quản lý</Text>
          </View>
          <View style={s.sumDiv} />
          <View style={s.sumItem}>
            <Text style={[s.sumNum, { color: '#74b9ff' }]}>{totalActive}</Text>
            <Text style={s.sumLbl}>Hoạt động</Text>
          </View>
          <View style={s.sumDiv} />
          <View style={s.sumItem}>
            <Text style={[s.sumNum, { color: '#8892b0' }]}>{totalInactive}</Text>
            <Text style={s.sumLbl}>Tạm ngừng</Text>
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
              <Text style={s.emptyText}>Chưa có nhân viên nào</Text>
            </View>
          }
          renderItem={({ item }) => {
            const roleCfg      = ROLE_CONFIG[item.role];
            const genderIcon   = getGenderIcon(item);
            const staffId      = getStaffId(item.role, item.phone);
            const subordinates = item.role === 'manager'
              ? staff.filter(s => s.managerId === item.id)
              : [];
            const myManager = item.role === 'staff'
              ? staff.find(s => s.id === item.managerId)
              : null;

            return (
              <View style={[s.card, !item.active && s.cardInactive]}>

                {/* Header */}
                <View style={s.cardHeader}>
                  <View style={s.avatarWrap}>
                    {item.avatar
                      ? <Image source={{ uri: item.avatar }} style={s.avatarImg} />
                      : <Text style={s.avatarIcon}>{genderIcon}</Text>
                    }
                    <View style={[s.dot, item.active ? s.dotActive : s.dotInactive]} />
                  </View>

                  <View style={s.info}>
                    <Text style={s.name}>{item.name}</Text>
                    <Text style={s.staffId}>{staffId}</Text>
                    <Text style={s.phone}>📱 {item.phone}</Text>
                    <View style={[s.roleBadge, { backgroundColor: roleCfg.bg }]}>
                      <Text style={s.roleIcon}>{roleCfg.icon}</Text>
                      <Text style={[s.roleText, { color: roleCfg.color }]}>{roleCfg.label}</Text>
                    </View>
                  </View>

                  <View style={s.toggleWrap}>
                    <Text style={[s.toggleLabel, item.active ? s.toggleOn : s.toggleOff]}>
                      {item.active ? 'Hoạt\nđộng' : 'Tạm\nngừng'}
                    </Text>
                    <Switch
                      value={item.active}
                      onValueChange={() => toggleActive(item.id)}
                      trackColor={{ false: 'rgba(255,255,255,0.12)', true: 'rgba(116,185,255,0.55)' }}
                      thumbColor={item.active ? '#74b9ff' : 'rgba(255,255,255,0.4)'}
                      ios_backgroundColor="rgba(255,255,255,0.12)"
                    />
                  </View>
                </View>

                {/* Personal info */}
                <View style={s.infoRow}>
                  <View style={s.infoItem}>
                    <Text style={s.infoLabel}>🎂 Ngày sinh</Text>
                    <Text style={s.infoValue}>{item.dob || '—'}</Text>
                  </View>
                  <View style={s.infoItem}>
                    <Text style={s.infoLabel}>🪪 CCCD</Text>
                    <Text style={s.infoValue}>{item.idCard || '—'}</Text>
                  </View>
                </View>

                <View style={s.divider} />

                {/* Permissions */}
                <Text style={s.sectionLabel}>Quyền truy cập</Text>
                <View style={s.permGrid}>
                  {item.permissions.length === 0
                    ? <Text style={s.emptySmall}>Chưa cấp quyền</Text>
                    : item.permissions.map((perm, i) => (
                      <View key={i} style={s.permBadge}>
                        <Text style={s.permCheck}>✓</Text>
                        <Text style={s.permText}>{perm}</Text>
                      </View>
                    ))
                  }
                </View>

                <View style={s.divider} />

                {/* Manager-staff relationship */}
                {item.role === 'manager' ? (
                  <View>
                    <View style={s.relHeader}>
                      <Text style={s.sectionLabel}>Nhân viên trực thuộc ({subordinates.length})</Text>
                      <TouchableOpacity style={s.assignBtn} onPress={() => openAssign(item)}>
                        <Text style={s.assignBtnText}>⚙️ Phân công</Text>
                      </TouchableOpacity>
                    </View>
                    {subordinates.length === 0
                      ? <Text style={s.emptySmall}>Chưa có nhân viên trực thuộc</Text>
                      : subordinates.map(sub => (
                        <View key={sub.id} style={s.subRow}>
                          <Text style={s.subIcon}>{sub.avatar ? '📷' : getGenderIcon(sub)}</Text>
                          <View style={s.subInfo}>
                            <Text style={s.subName}>{sub.name}</Text>
                            <Text style={s.subId}>{getStaffId('staff', sub.phone)}</Text>
                          </View>
                          <View style={[s.statusDot, sub.active ? s.statusOn : s.statusOff]} />
                        </View>
                      ))
                    }
                  </View>
                ) : (
                  <View>
                    <View style={s.relHeader}>
                      <Text style={s.sectionLabel}>Quản lý trực tiếp</Text>
                      <TouchableOpacity style={s.assignBtn} onPress={() => openChangeMgr(item)}>
                        <Text style={s.assignBtnText}>🔀 Đổi quản lý</Text>
                      </TouchableOpacity>
                    </View>
                    {myManager ? (
                      <View style={s.subRow}>
                        <Text style={s.subIcon}>{myManager.avatar ? '📷' : getGenderIcon(myManager)}</Text>
                        <View style={s.subInfo}>
                          <Text style={s.subName}>{myManager.name}</Text>
                          <Text style={s.subId}>{getStaffId('manager', myManager.phone)}</Text>
                        </View>
                      </View>
                    ) : (
                      <Text style={s.emptySmall}>Chưa được phân công quản lý</Text>
                    )}
                  </View>
                )}

                {/* Actions */}
                <View style={s.actions}>
                  <TouchableOpacity style={s.actionEdit} onPress={() => openEdit(item)}>
                    <Text style={s.actionEditText}>✏️  Chỉnh sửa thông tin</Text>
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

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 30, paddingBottom: 20 },
  title:      { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle:   { color: '#8892b0', fontSize: 13, marginTop: 4 },
  addBtn:     { backgroundColor: 'rgba(162,155,254,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: 'rgba(162,155,254,0.45)' },
  addBtnText: { color: '#a29bfe', fontWeight: '800', fontSize: 13 },

  summaryStrip: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 8 },
  sumItem: { flex: 1, alignItems: 'center' },
  sumNum:  { color: '#fff', fontSize: 22, fontWeight: '900' },
  sumLbl:  { color: '#8892b0', fontSize: 10, marginTop: 2, fontWeight: '600', textAlign: 'center' },
  sumDiv:  { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 },

  list:       { padding: 16, paddingTop: 8 },
  emptyWrap:  { alignItems: 'center', paddingTop: 60 },
  emptyIcon:  { fontSize: 40, marginBottom: 10 },
  emptyText:  { color: '#8892b0', fontSize: 14 },
  emptySmall: { color: '#8892b0', fontSize: 12, fontStyle: 'italic', paddingVertical: 4 },

  card:         { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardInactive: { opacity: 0.55 },

  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start' },
  avatarWrap:  { position: 'relative', marginRight: 14 },
  avatarIcon:  { fontSize: 40 },
  avatarImg:   { width: 50, height: 50, borderRadius: 14 },
  dot:         { position: 'absolute', bottom: 0, right: 0, width: 13, height: 13, borderRadius: 7, borderWidth: 2, borderColor: '#0d0d1a' },
  dotActive:   { backgroundColor: '#74b9ff' },
  dotInactive: { backgroundColor: 'rgba(255,255,255,0.25)' },

  info:      { flex: 1 },
  name:      { color: '#fff', fontSize: 16, fontWeight: '700' },
  staffId:   { color: '#a29bfe', fontSize: 12, fontWeight: '700', marginTop: 1, letterSpacing: 0.5 },
  phone:     { color: '#8892b0', fontSize: 12, marginTop: 2, marginBottom: 6 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, gap: 4 },
  roleIcon:  { fontSize: 12 },
  roleText:  { fontSize: 12, fontWeight: '700' },

  toggleWrap:  { alignItems: 'center', gap: 4 },
  toggleLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  toggleOn:    { color: '#74b9ff' },
  toggleOff:   { color: 'rgba(255,255,255,0.3)' },

  infoRow:   { flexDirection: 'row', gap: 10, marginTop: 12 },
  infoItem:  { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  infoLabel: { color: '#8892b0', fontSize: 10, fontWeight: '700', marginBottom: 4 },
  infoValue: { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },

  divider:      { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginVertical: 14 },
  sectionLabel: { color: '#8892b0', fontSize: 12, fontWeight: '700', marginBottom: 10 },

  permGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  permBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(116,185,255,0.08)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, gap: 4, borderWidth: 1, borderColor: 'rgba(116,185,255,0.2)' },
  permCheck: { color: '#74b9ff', fontSize: 12, fontWeight: '700' },
  permText:  { color: '#ccd6f6', fontSize: 12 },

  relHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  assignBtn:      { backgroundColor: 'rgba(162,155,254,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(162,155,254,0.3)' },
  assignBtnText:  { color: '#a29bfe', fontSize: 11, fontWeight: '700' },

  subRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  subIcon:   { fontSize: 22, marginRight: 10 },
  subInfo:   { flex: 1 },
  subName:   { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
  subId:     { color: '#8892b0', fontSize: 11, marginTop: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusOn:  { backgroundColor: '#74b9ff' },
  statusOff: { backgroundColor: 'rgba(255,255,255,0.2)' },

  actions:          { flexDirection: 'row', gap: 8, marginTop: 14 },
  actionEdit:       { flex: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: 'rgba(162,155,254,0.1)', borderWidth: 1, borderColor: 'rgba(162,155,254,0.3)' },
  actionEditText:   { color: '#a29bfe', fontSize: 13, fontWeight: '700' },
  actionDelete:     { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,118,117,0.1)', borderWidth: 1, borderColor: 'rgba(255,118,117,0.3)' },
  actionDeleteText: { fontSize: 17 },
});
