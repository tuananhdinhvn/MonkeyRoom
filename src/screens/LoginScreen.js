import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, Image, Alert, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';

export default function LoginScreen({ navigation }) {
  const [account,  setAccount]  = useState('');
  const [password, setPassword] = useState('');
  const [bioAvail, setBioAvail] = useState(false);

  useEffect(() => {
    (async () => {
      const hasHw  = await LocalAuthentication.hasHardwareAsync();
      const enroll = await LocalAuthentication.isEnrolledAsync();
      setBioAvail(hasHw && enroll);
    })();
  }, []);

  const handleBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Đăng nhập MonkeyRoom',
      cancelLabel: 'Hủy',
      disableDeviceFallback: false,
    });
    if (result.success) {
      navigation.replace('StaffMain');
    } else if (result.error !== 'user_cancel' && result.error !== 'system_cancel') {
      Alert.alert('Xác thực thất bại', 'Không nhận diện được vân tay. Vui lòng thử lại hoặc dùng mật khẩu.');
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImg}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>MonkeyRoom</Text>
            <Text style={styles.tagline}>Quản lý phòng cho thuê thông minh</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>Đăng nhập</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email hoặc Số điện thoại</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email hoặc số điện thoại"
                  placeholderTextColor="#aaa"
                  value={account}
                  onChangeText={setAccount}
                  keyboardType="default"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#aaa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.replace('AdminMain')}
            >
              <LinearGradient colors={['#e94560', '#c62a47']} style={styles.loginGradient}>
                <Text style={styles.loginText}>ĐĂNG NHẬP</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Biometric button */}
            {bioAvail && (
              <TouchableOpacity style={styles.bioBtn} onPress={handleBiometric}>
                <Text style={styles.bioIcon}>👆</Text>
                <Text style={styles.bioText}>Đăng nhập bằng vân tay</Text>
              </TouchableOpacity>
            )}

            {/* Demo section */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>— Xem demo theo vai trò —</Text>
              <View style={styles.demoRow}>
                <TouchableOpacity
                  style={[styles.demoBtn, { borderColor: '#e94560' }]}
                  onPress={() => navigation.replace('AdminMain')}
                >
                  <Text style={styles.demoBtnIcon}>👑</Text>
                  <Text style={[styles.demoBtnText, { color: '#e94560' }]}>Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.demoBtn, { borderColor: '#4facfe' }]}
                  onPress={() => navigation.replace('StaffMain')}
                >
                  <Text style={styles.demoBtnIcon}>💼</Text>
                  <Text style={[styles.demoBtnText, { color: '#4facfe' }]}>Nhân viên</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.demoBtn, { borderColor: '#43e97b' }]}
                  onPress={() => navigation.replace('TenantMain')}
                >
                  <Text style={styles.demoBtnIcon}>🏠</Text>
                  <Text style={[styles.demoBtnText, { color: '#43e97b' }]}>Khách thuê</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },

  // Logo
  logoContainer: { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 100, height: 100, borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#e94560', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 10,
  },
  logoImg: { width: 100, height: 100 },
  appName: { fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  tagline: { fontSize: 13, color: '#8892b0', marginTop: 5 },

  // Card
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 24 },

  // Inputs
  inputGroup: { marginBottom: 16 },
  label: { color: '#8892b0', fontSize: 13, marginBottom: 8, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, color: '#fff', paddingVertical: 14, fontSize: 15 },

  // Forgot
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#e94560', fontSize: 13 },

  // Login button
  loginBtn: { borderRadius: 12, overflow: 'hidden', marginBottom: 14 },
  loginGradient: { paddingVertical: 16, alignItems: 'center' },
  loginText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 },

  // Biometric button
  bioBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(79,172,254,0.45)',
    backgroundColor: 'rgba(79,172,254,0.08)',
    paddingVertical: 13, marginBottom: 20, gap: 8,
  },
  bioIcon: { fontSize: 22 },
  bioText: { color: '#4facfe', fontSize: 14, fontWeight: '700' },

  // Demo
  demoSection: { alignItems: 'center' },
  demoTitle: { color: '#8892b0', fontSize: 12, marginBottom: 12 },
  demoRow: { flexDirection: 'row', gap: 10, width: '100%' },
  demoBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1.5,
    paddingVertical: 10, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  demoBtnIcon: { fontSize: 18, marginBottom: 4 },
  demoBtnText: { fontSize: 12, fontWeight: '700' },
});
