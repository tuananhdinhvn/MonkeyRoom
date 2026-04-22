import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>

        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>🏢</Text>
          </View>
          <Text style={styles.appName}>RoomManager</Text>
          <Text style={styles.tagline}>Quản lý phòng cho thuê thông minh</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Đăng nhập</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập email của bạn"
                placeholderTextColor="#aaa"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
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

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.replace('AdminMain')}
          >
            <LinearGradient colors={['#e94560', '#c62a47']} style={styles.loginGradient}>
              <Text style={styles.loginText}>ĐĂNG NHẬP</Text>
            </LinearGradient>
          </TouchableOpacity>

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

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: 'rgba(233,69,96,0.2)',
    borderWidth: 2, borderColor: '#e94560',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  logoIcon: { fontSize: 36 },
  appName: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 13, color: '#8892b0', marginTop: 4 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  label: { color: '#8892b0', fontSize: 13, marginBottom: 8, fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, color: '#fff', paddingVertical: 14, fontSize: 15 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#e94560', fontSize: 13 },
  loginBtn: { borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  loginGradient: { paddingVertical: 16, alignItems: 'center' },
  loginText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  demoSection: { alignItems: 'center', marginTop: 4 },
  demoTitle: { color: '#8892b0', fontSize: 12, marginBottom: 12 },
  demoRow: { flexDirection: 'row', gap: 10, width: '100%' },
  demoBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1.5,
    paddingVertical: 10, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)'
  },
  demoBtnIcon: { fontSize: 18, marginBottom: 4 },
  demoBtnText: { fontSize: 12, fontWeight: '700' },
});
