import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, Modal,
  Alert, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useBuildings } from '../context/BuildingsContext';
import { supabase } from '../lib/supabase';

const ACCENT = '#f39c12';

function formatMoney(n) {
  if (!n && n !== 0) return '—';
  return Number(n).toLocaleString('vi-VN') + ' ₫';
}

function getPayFreqLabel(freq) {
  if (freq === 'monthly') return 'Hàng tháng';
  if (freq === 'quarterly') return 'Hàng quý (3 tháng)';
  if (freq === 'biannual') return 'Nửa năm (6 tháng)';
  return freq;
}

function getPaymentStatus(payment) {
  if (payment.paid) return 'paid';
  if (!payment.due_date) return 'pending';
  const today = new Date();
  const due = new Date(payment.due_date.split('/').reverse().join('-'));
  if (isNaN(due)) return 'pending';
  return due < today ? 'overdue' : 'pending';
}

function getPaymentIcon(payment) {
  const status = getPaymentStatus(payment);
  if (status === 'paid') return '✅';
  if (status === 'overdue') return '🔴';
  return '⏳';
}

const INVESTMENT_CATEGORIES = [
  { key: 'renovation', label: 'Cải tạo', icon: '🔨' },
  { key: 'furniture', label: 'Nội thất', icon: '🛋️' },
  { key: 'equipment', label: 'Thiết bị', icon: '⚡' },
  { key: 'repair', label: 'Sửa chữa', icon: '🔧' },
  { key: 'other', label: 'Khác', icon: '📦' },
];

function getCategoryInfo(key) {
  return INVESTMENT_CATEGORIES.find(c => c.key === key) || INVESTMENT_CATEGORIES[4];
}

// ─── ContractModal ────────────────────────────────────────
function ContractModal({ visible, contract, onClose, onSave }) {
  const [form, setForm] = useState({
    start_date: '', end_date: '', monthly_rent: '', deposit: '',
    payment_day: '1', pay_frequency: 'monthly', notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (contract) {
        setForm({
          start_date: contract.start_date || '',
          end_date: contract.end_date || '',
          monthly_rent: contract.monthly_rent ? String(contract.monthly_rent) : '',
          deposit: contract.deposit ? String(contract.deposit) : '',
          payment_day: contract.payment_day ? String(contract.payment_day) : '1',
          pay_frequency: contract.pay_frequency || 'monthly',
          notes: contract.notes || '',
        });
      } else {
        setForm({ start_date: '', end_date: '', monthly_rent: '', deposit: '', payment_day: '1', pay_frequency: 'monthly', notes: '' });
      }
    }
  }, [visible, contract]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.monthly_rent) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiền thuê hàng tháng');
      return;
    }
    setSaving(true);
    await onSave({
      start_date: form.start_date,
      end_date: form.end_date,
      monthly_rent: parseInt(form.monthly_rent.replace(/\D/g, '')) || 0,
      deposit: parseInt(form.deposit.replace(/\D/g, '')) || 0,
      payment_day: parseInt(form.payment_day) || 1,
      pay_frequency: form.pay_frequency,
      notes: form.notes,
    });
    setSaving(false);
  };

  const FREQ_OPTIONS = [
    { key: 'monthly', label: 'Hàng tháng' },
    { key: 'quarterly', label: 'Hàng quý' },
    { key: 'biannual', label: 'Nửa năm' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.modalCard}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{contract ? 'Chỉnh sửa hợp đồng' : 'Thêm hợp đồng'}</Text>
            <TouchableOpacity onPress={onClose}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.fieldLabel}>Ngày bắt đầu</Text>
            <TextInput style={s.input} value={form.start_date} onChangeText={v => set('start_date', v)} placeholder="dd/mm/yyyy" placeholderTextColor="#4a5568" />

            <Text style={s.fieldLabel}>Ngày kết thúc</Text>
            <TextInput style={s.input} value={form.end_date} onChangeText={v => set('end_date', v)} placeholder="dd/mm/yyyy" placeholderTextColor="#4a5568" />

            <Text style={s.fieldLabel}>Tiền thuê hàng tháng (₫)</Text>
            <TextInput style={s.input} value={form.monthly_rent} onChangeText={v => set('monthly_rent', v)} placeholder="VD: 15000000" placeholderTextColor="#4a5568" keyboardType="numeric" />

            <Text style={s.fieldLabel}>Tiền đặt cọc (₫)</Text>
            <TextInput style={s.input} value={form.deposit} onChangeText={v => set('deposit', v)} placeholder="VD: 30000000" placeholderTextColor="#4a5568" keyboardType="numeric" />

            <Text style={s.fieldLabel}>Ngày đóng tiền trong tháng</Text>
            <TextInput style={s.input} value={form.payment_day} onChangeText={v => set('payment_day', v)} placeholder="VD: 5" placeholderTextColor="#4a5568" keyboardType="numeric" />

            <Text style={s.fieldLabel}>Hình thức thanh toán</Text>
            <View style={s.optionRow}>
              {FREQ_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.key}
                  style={[s.optionBtn, form.pay_frequency === opt.key && { borderColor: ACCENT, backgroundColor: 'rgba(243,156,18,0.15)' }]}
                  onPress={() => set('pay_frequency', opt.key)}
                >
                  <Text style={[s.optionBtnText, form.pay_frequency === opt.key && { color: ACCENT }]}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.fieldLabel}>Ghi chú</Text>
            <TextInput style={[s.input, { height: 72, textAlignVertical: 'top' }]} value={form.notes} onChangeText={v => set('notes', v)} placeholder="Ghi chú thêm..." placeholderTextColor="#4a5568" multiline />

            <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Lưu hợp đồng</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── PaymentModal ─────────────────────────────────────────
function PaymentModal({ visible, payment, onClose, onSave }) {
  const [form, setForm] = useState({
    period_label: '', period_from: '', period_to: '',
    amount: '', due_date: '', paid_date: '', paid: false, notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      if (payment) {
        setForm({
          period_label: payment.period_label || '',
          period_from: payment.period_from || '',
          period_to: payment.period_to || '',
          amount: payment.amount ? String(payment.amount) : '',
          due_date: payment.due_date || '',
          paid_date: payment.paid_date || '',
          paid: payment.paid || false,
          notes: payment.notes || '',
        });
      } else {
        setForm({ period_label: '', period_from: '', period_to: '', amount: '', due_date: '', paid_date: '', paid: false, notes: '' });
      }
    }
  }, [visible, payment]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.period_label) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên kỳ thanh toán');
      return;
    }
    if (!form.amount) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền');
      return;
    }
    setSaving(true);
    await onSave({
      period_label: form.period_label,
      period_from: form.period_from,
      period_to: form.period_to,
      amount: parseInt(form.amount.replace(/\D/g, '')) || 0,
      due_date: form.due_date,
      paid_date: form.paid_date,
      paid: form.paid,
      notes: form.notes,
    });
    setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.modalCard}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>{payment ? 'Cập nhật thanh toán' : 'Ghi nhận thanh toán'}</Text>
            <TouchableOpacity onPress={onClose}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.fieldLabel}>Tên kỳ thanh toán *</Text>
            <TextInput style={s.input} value={form.period_label} onChangeText={v => set('period_label', v)} placeholder="VD: Tháng 6/2026" placeholderTextColor="#4a5568" />

            <Text style={s.fieldLabel}>Từ ngày</Text>
            <TextInput style={s.input} value={form.period_from} onChangeText={v => set('period_from', v)} placeholder="dd/mm/yyyy" placeholderTextColor="#4a5568" />

            <Text style={s.fieldLabel}>Đến ngày</Text>
            <TextInput style={s.input} value={form.period_to} onChangeText={v => set('period_to', v)} placeholder="dd/mm/yyyy" placeholderTextColor="#4a5568" />

            <Text style={s.fieldLabel}>Số tiền (₫) *</Text>
            <TextInput style={s.input} value={form.amount} onChangeText={v => set('amount', v)} placeholder="VD: 15000000" placeholderTextColor="#4a5568" keyboardType="numeric" />

            <Text style={s.fieldLabel}>Ngày đến hạn</Text>
            <TextInput style={s.input} value={form.due_date} onChangeText={v => set('due_date', v)} placeholder="dd/mm/yyyy" placeholderTextColor="#4a5568" />

            <Text style={s.fieldLabel}>Ngày đã trả</Text>
            <TextInput style={s.input} value={form.paid_date} onChangeText={v => set('paid_date', v)} placeholder="dd/mm/yyyy" placeholderTextColor="#4a5568" />

            <TouchableOpacity style={[s.toggleRow]} onPress={() => set('paid', !form.paid)}>
              <Text style={s.fieldLabel}>Đã thanh toán</Text>
              <View style={[s.toggleBox, form.paid && { backgroundColor: ACCENT, borderColor: ACCENT }]}>
                {form.paid && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>}
              </View>
            </TouchableOpacity>

            <Text style={s.fieldLabel}>Ghi chú</Text>
            <TextInput style={[s.input, { height: 60, textAlignVertical: 'top' }]} value={form.notes} onChangeText={v => set('notes', v)} placeholder="Ghi chú..." placeholderTextColor="#4a5568" multiline />

            <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Lưu</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── InvestmentModal ──────────────────────────────────────
function InvestmentModal({ visible, onClose, onSave }) {
  const [form, setForm] = useState({ inv_date: '', category: 'other', description: '', amount: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm({ inv_date: '', category: 'other', description: '', amount: '' });
    }
  }, [visible]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.inv_date) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày');
      return;
    }
    if (!form.description) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả');
      return;
    }
    if (!form.amount) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền');
      return;
    }
    setSaving(true);
    await onSave({
      inv_date: form.inv_date,
      category: form.category,
      description: form.description,
      amount: parseInt(form.amount.replace(/\D/g, '')) || 0,
    });
    setSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.modalCard}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Thêm chi phí đầu tư</Text>
            <TouchableOpacity onPress={onClose}><Text style={s.modalClose}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={s.fieldLabel}>Ngày *</Text>
            <TextInput style={s.input} value={form.inv_date} onChangeText={v => set('inv_date', v)} placeholder="dd/mm/yyyy" placeholderTextColor="#4a5568" />

            <Text style={s.fieldLabel}>Danh mục</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {INVESTMENT_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[s.catBtn, form.category === cat.key && { borderColor: ACCENT, backgroundColor: 'rgba(243,156,18,0.15)' }]}
                  onPress={() => set('category', cat.key)}
                >
                  <Text style={{ fontSize: 16 }}>{cat.icon}</Text>
                  <Text style={[s.catBtnText, form.category === cat.key && { color: ACCENT }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={s.fieldLabel}>Mô tả *</Text>
            <TextInput style={[s.input, { height: 72, textAlignVertical: 'top' }]} value={form.description} onChangeText={v => set('description', v)} placeholder="Mô tả chi phí..." placeholderTextColor="#4a5568" multiline />

            <Text style={s.fieldLabel}>Số tiền (₫) *</Text>
            <TextInput style={s.input} value={form.amount} onChangeText={v => set('amount', v)} placeholder="VD: 5000000" placeholderTextColor="#4a5568" keyboardType="numeric" />

            <TouchableOpacity style={[s.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveBtnText}>Lưu chi phí</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────
export default function LandlordScreen() {
  const { buildings } = useBuildings();
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const [contract, setContract] = useState(null);
  const [payments, setPayments] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [contractModalVisible, setContractModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [investmentModalVisible, setInvestmentModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    if (buildings && buildings.length > 0 && !selectedBuilding) {
      setSelectedBuilding(buildings[0]);
    }
  }, [buildings]);

  const fetchAll = useCallback(async (buildingId) => {
    if (!buildingId) return;
    setLoading(true);
    try {
      const [contractRes, paymentsRes, investmentsRes] = await Promise.all([
        supabase.from('landlord_contracts').select('*').eq('building_id', buildingId).maybeSingle(),
        supabase.from('landlord_payments').select('*').eq('building_id', buildingId).order('created_at', { ascending: false }),
        supabase.from('building_investments').select('*').eq('building_id', buildingId).order('inv_date', { ascending: false }),
      ]);
      if (contractRes.error) throw contractRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      if (investmentsRes.error) throw investmentsRes.error;
      setContract(contractRes.data || null);
      setPayments(paymentsRes.data || []);
      setInvestments(investmentsRes.data || []);
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedBuilding) {
      fetchAll(selectedBuilding.id);
    }
  }, [selectedBuilding, fetchAll]);

  const handleSaveContract = async (data) => {
    try {
      if (contract) {
        const { error } = await supabase
          .from('landlord_contracts')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', contract.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('landlord_contracts')
          .insert({ ...data, building_id: selectedBuilding.id });
        if (error) throw error;
      }
      setContractModalVisible(false);
      fetchAll(selectedBuilding.id);
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không lưu được hợp đồng');
    }
  };

  const handleSavePayment = async (data) => {
    try {
      const payload = {
        ...data,
        building_id: selectedBuilding.id,
        contract_id: contract?.id || null,
      };
      if (selectedPayment) {
        const { error } = await supabase.from('landlord_payments').update(payload).eq('id', selectedPayment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('landlord_payments').insert(payload);
        if (error) throw error;
      }
      setPaymentModalVisible(false);
      setSelectedPayment(null);
      fetchAll(selectedBuilding.id);
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không lưu được thanh toán');
    }
  };

  const handleDeletePayment = (payment) => {
    Alert.alert(
      'Xoá thanh toán',
      `Xoá kỳ "${payment.period_label}"?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá', style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('landlord_payments').delete().eq('id', payment.id);
              if (error) throw error;
              fetchAll(selectedBuilding.id);
            } catch (err) {
              Alert.alert('Lỗi', err.message || 'Không xoá được');
            }
          },
        },
      ]
    );
  };

  const handleSaveInvestment = async (data) => {
    try {
      const { error } = await supabase.from('building_investments').insert({ ...data, building_id: selectedBuilding.id });
      if (error) throw error;
      setInvestmentModalVisible(false);
      fetchAll(selectedBuilding.id);
    } catch (err) {
      Alert.alert('Lỗi', err.message || 'Không lưu được chi phí');
    }
  };

  const handleDeleteInvestment = (inv) => {
    Alert.alert(
      'Xoá chi phí',
      `Xoá "${inv.description}"?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá', style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('building_investments').delete().eq('id', inv.id);
              if (error) throw error;
              fetchAll(selectedBuilding.id);
            } catch (err) {
              Alert.alert('Lỗi', err.message || 'Không xoá được');
            }
          },
        },
      ]
    );
  };

  const totalPaid = payments.filter(p => p.paid).reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalUnpaid = payments.filter(p => !p.paid).reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalInvestment = investments.reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e']} style={s.flex1}>
      <SafeAreaView style={s.flex1}>
        <StatusBar barStyle="light-content" />

        <View style={s.header}>
          <Text style={s.headerTitle}>🏡 Quản lý chủ nhà</Text>
        </View>

        {/* Building Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.buildingScroll} contentContainerStyle={s.buildingScrollContent}>
          {(buildings || []).map(b => {
            const active = selectedBuilding?.id === b.id;
            return (
              <TouchableOpacity
                key={b.id}
                style={[s.buildingChip, active && { backgroundColor: ACCENT, borderColor: ACCENT }]}
                onPress={() => setSelectedBuilding(b)}
              >
                <Text style={[s.buildingChipText, active && { color: '#1a1a2e', fontWeight: '700' }]}>{b.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator color={ACCENT} size="large" />
            <Text style={s.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <ScrollView style={s.flex1} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

            {/* ── Section 1: Hợp đồng ─────────────────────────── */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>📋 Hợp đồng</Text>
                <TouchableOpacity
                  style={s.sectionBtn}
                  onPress={() => setContractModalVisible(true)}
                >
                  <Text style={s.sectionBtnText}>{contract ? 'Chỉnh sửa' : '+ Thêm'}</Text>
                </TouchableOpacity>
              </View>

              {contract ? (
                <View style={s.card}>
                  <View style={s.contractRow}>
                    <Text style={s.contractLabel}>Bắt đầu</Text>
                    <Text style={s.contractValue}>{contract.start_date || '—'}</Text>
                  </View>
                  <View style={s.contractRow}>
                    <Text style={s.contractLabel}>Kết thúc</Text>
                    <Text style={s.contractValue}>{contract.end_date || '—'}</Text>
                  </View>
                  <View style={[s.contractRow, s.contractHighlight]}>
                    <Text style={s.contractLabel}>Tiền thuê / tháng</Text>
                    <Text style={[s.contractValue, { color: ACCENT, fontWeight: '700' }]}>{formatMoney(contract.monthly_rent)}</Text>
                  </View>
                  <View style={s.contractRow}>
                    <Text style={s.contractLabel}>Tiền đặt cọc</Text>
                    <Text style={s.contractValue}>{formatMoney(contract.deposit)}</Text>
                  </View>
                  <View style={s.contractRow}>
                    <Text style={s.contractLabel}>Ngày đóng tiền</Text>
                    <Text style={s.contractValue}>Ngày {contract.payment_day} hàng tháng</Text>
                  </View>
                  <View style={s.contractRow}>
                    <Text style={s.contractLabel}>Hình thức</Text>
                    <Text style={s.contractValue}>{getPayFreqLabel(contract.pay_frequency)}</Text>
                  </View>
                  {contract.notes ? (
                    <View style={[s.contractRow, { borderBottomWidth: 0 }]}>
                      <Text style={s.contractLabel}>Ghi chú</Text>
                      <Text style={[s.contractValue, { flex: 1, textAlign: 'right' }]}>{contract.notes}</Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                <View style={s.emptyCard}>
                  <Text style={s.emptyIcon}>📋</Text>
                  <Text style={s.emptyText}>Chưa có hợp đồng</Text>
                  <Text style={s.emptySubText}>Nhấn "+ Thêm" để tạo hợp đồng đầu tiên</Text>
                </View>
              )}
            </View>

            {/* ── Section 2: Lịch thanh toán ──────────────────── */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>💰 Lịch thanh toán</Text>
                <TouchableOpacity
                  style={s.sectionBtn}
                  onPress={() => { setSelectedPayment(null); setPaymentModalVisible(true); }}
                >
                  <Text style={s.sectionBtnText}>+ Ghi nhận</Text>
                </TouchableOpacity>
              </View>

              <View style={s.summaryRow}>
                <View style={s.summaryItem}>
                  <Text style={s.summaryLabel}>Đã đóng</Text>
                  <Text style={[s.summaryValue, { color: '#2ecc71' }]}>{formatMoney(totalPaid)}</Text>
                </View>
                <View style={s.summaryDivider} />
                <View style={s.summaryItem}>
                  <Text style={s.summaryLabel}>Còn nợ</Text>
                  <Text style={[s.summaryValue, { color: '#e74c3c' }]}>{formatMoney(totalUnpaid)}</Text>
                </View>
              </View>

              {payments.length === 0 ? (
                <View style={s.emptyCard}>
                  <Text style={s.emptyIcon}>💸</Text>
                  <Text style={s.emptyText}>Chưa có kỳ thanh toán</Text>
                  <Text style={s.emptySubText}>Nhấn "+ Ghi nhận" để thêm kỳ đầu tiên</Text>
                </View>
              ) : (
                payments.map(payment => {
                  const icon = getPaymentIcon(payment);
                  const status = getPaymentStatus(payment);
                  return (
                    <TouchableOpacity
                      key={payment.id}
                      style={s.paymentCard}
                      onPress={() => { setSelectedPayment(payment); setPaymentModalVisible(true); }}
                      onLongPress={() => handleDeletePayment(payment)}
                    >
                      <View style={s.paymentLeft}>
                        <Text style={{ fontSize: 20 }}>{icon}</Text>
                        <View style={{ marginLeft: 10, flex: 1 }}>
                          <Text style={s.paymentLabel}>{payment.period_label}</Text>
                          {payment.due_date ? <Text style={s.paymentSub}>Hạn: {payment.due_date}</Text> : null}
                          {payment.paid && payment.paid_date ? <Text style={[s.paymentSub, { color: '#2ecc71' }]}>Đã trả: {payment.paid_date}</Text> : null}
                          {payment.notes ? <Text style={s.paymentSub}>{payment.notes}</Text> : null}
                        </View>
                      </View>
                      <View style={s.paymentRight}>
                        <Text style={[s.paymentAmount, status === 'overdue' && { color: '#e74c3c' }, status === 'paid' && { color: '#2ecc71' }]}>
                          {formatMoney(payment.amount)}
                        </Text>
                        <View style={[s.paymentBadge,
                          status === 'paid' && { backgroundColor: 'rgba(46,204,113,0.2)' },
                          status === 'overdue' && { backgroundColor: 'rgba(231,76,60,0.2)' },
                          status === 'pending' && { backgroundColor: 'rgba(243,156,18,0.2)' },
                        ]}>
                          <Text style={[s.paymentBadgeText,
                            status === 'paid' && { color: '#2ecc71' },
                            status === 'overdue' && { color: '#e74c3c' },
                            status === 'pending' && { color: ACCENT },
                          ]}>
                            {status === 'paid' ? 'Đã đóng' : status === 'overdue' ? 'Quá hạn' : 'Chờ đóng'}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* ── Section 3: Đầu tư & Cải tạo ─────────────────── */}
            <View style={[s.section, { marginBottom: 32 }]}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>🏗️ Đầu tư & Cải tạo</Text>
                <TouchableOpacity style={s.sectionBtn} onPress={() => setInvestmentModalVisible(true)}>
                  <Text style={s.sectionBtnText}>+ Thêm</Text>
                </TouchableOpacity>
              </View>

              <View style={[s.summaryRow, { marginBottom: 12 }]}>
                <View style={s.summaryItem}>
                  <Text style={s.summaryLabel}>Tổng đầu tư</Text>
                  <Text style={[s.summaryValue, { color: ACCENT }]}>{formatMoney(totalInvestment)}</Text>
                </View>
              </View>

              {investments.length === 0 ? (
                <View style={s.emptyCard}>
                  <Text style={s.emptyIcon}>🏗️</Text>
                  <Text style={s.emptyText}>Chưa có chi phí đầu tư</Text>
                  <Text style={s.emptySubText}>Nhấn "+ Thêm" để ghi nhận chi phí</Text>
                </View>
              ) : (
                investments.map(inv => {
                  const cat = getCategoryInfo(inv.category);
                  return (
                    <TouchableOpacity
                      key={inv.id}
                      style={s.investCard}
                      onLongPress={() => handleDeleteInvestment(inv)}
                    >
                      <View style={s.investIconWrap}>
                        <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={s.investDesc}>{inv.description}</Text>
                        <Text style={s.investMeta}>{cat.label}  ·  {inv.inv_date}</Text>
                      </View>
                      <Text style={[s.investAmount, { color: ACCENT }]}>{formatMoney(inv.amount)}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

          </ScrollView>
        )}

        <ContractModal
          visible={contractModalVisible}
          contract={contract}
          onClose={() => setContractModalVisible(false)}
          onSave={handleSaveContract}
        />
        <PaymentModal
          visible={paymentModalVisible}
          payment={selectedPayment}
          onClose={() => { setPaymentModalVisible(false); setSelectedPayment(null); }}
          onSave={handleSavePayment}
        />
        <InvestmentModal
          visible={investmentModalVisible}
          onClose={() => setInvestmentModalVisible(false)}
          onSave={handleSaveInvestment}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  flex1: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ccd6f6',
    letterSpacing: 0.3,
  },
  buildingScroll: { flexGrow: 0 },
  buildingScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexDirection: 'row',
  },
  buildingChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  buildingChipText: {
    color: '#8892b0',
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { color: '#8892b0', fontSize: 14 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ccd6f6',
  },
  sectionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(243,156,18,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(243,156,18,0.4)',
  },
  sectionBtnText: {
    color: ACCENT,
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  contractRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  contractHighlight: {
    backgroundColor: 'rgba(243,156,18,0.06)',
  },
  contractLabel: { color: '#8892b0', fontSize: 13 },
  contractValue: { color: '#ccd6f6', fontSize: 13, fontWeight: '600' },
  emptyCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { color: '#ccd6f6', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  emptySubText: { color: '#8892b0', fontSize: 12, textAlign: 'center' },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 10,
    overflow: 'hidden',
  },
  summaryItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 8,
  },
  summaryLabel: { color: '#8892b0', fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 15, fontWeight: '700' },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 8,
  },
  paymentLeft: { flexDirection: 'row', flex: 1, alignItems: 'flex-start' },
  paymentLabel: { color: '#ccd6f6', fontSize: 14, fontWeight: '600' },
  paymentSub: { color: '#8892b0', fontSize: 12, marginTop: 2 },
  paymentRight: { alignItems: 'flex-end', gap: 6 },
  paymentAmount: { color: '#ccd6f6', fontSize: 14, fontWeight: '700' },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  paymentBadgeText: { fontSize: 11, fontWeight: '700' },
  investCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 8,
  },
  investIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(243,156,18,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  investDesc: { color: '#ccd6f6', fontSize: 13, fontWeight: '600', marginBottom: 3 },
  investMeta: { color: '#8892b0', fontSize: 12 },
  investAmount: { fontSize: 14, fontWeight: '700' },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1e2a45',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { color: '#ccd6f6', fontSize: 17, fontWeight: '800' },
  modalClose: { color: '#8892b0', fontSize: 20, paddingHorizontal: 4 },
  fieldLabel: { color: '#8892b0', fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#ccd6f6',
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 12,
  },
  optionRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  optionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  optionBtnText: { color: '#8892b0', fontSize: 12, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 8,
    gap: 6,
  },
  catBtnText: { color: '#8892b0', fontSize: 12, fontWeight: '600' },
  saveBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  saveBtnText: { color: '#1a1a2e', fontSize: 15, fontWeight: '800' },
});
