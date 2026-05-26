import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView,
  Platform, Image, Alert, ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function LoginScreen({ navigation }) {
  const { t } = useLanguage();
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

  const ADMIN_CREDENTIALS = {
    identifiers: ['monkeyroom@gmail.com', '0354990253'],
    password: 'Monkey2026',
    route: 'AdminMain',
  };

  const handleLogin = () => {
    const id = account.trim().toLowerCase();
    if (
      ADMIN_CREDENTIALS.identifiers.some(v => v.toLowerCase() === id) &&
      password === ADMIN_CREDENTIALS.password
    ) {
      navigation.replace('AdminMain');
    } else {
      Alert.alert(t('login.loginFailed'), t('login.loginFailedMsg'));
    }
  };

  const handleBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t('login.biometricPrompt'),
      cancelLabel: t('login.bioCancelLabel'),
      disableDeviceFallback: false,
    });
    if (result.success) {
      navigation.replace('StaffMain');
    } else if (result.error !== 'user_cancel' && result.error !== 'system_cancel') {
      Alert.alert(t('login.bioFailed'), t('login.bioFailedMsg'));
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f3460']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Language switcher */}
          <View style={styles.langRow}>
            <LanguageSwitcher />
          </View>

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
            <Text style={styles.tagline}>{t('login.tagline')}</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.title}>{t('login.title')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('login.email')}</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('login.emailPlaceholder')}
                  placeholderTextColor="#aaa"
                  value={account}
                  onChangeText={setAccount}
                  keyboardType="default"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('login.password')}</Text>
              <View style={styles.inputWrap}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('login.passwordPh')}
                  placeholderTextColor="#aaa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>{t('login.forgot')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => handleLogin()}
            >
              <LinearGradient colors={['#e94560', '#c62a47']} style={styles.loginGradient}>
                <Text style={styles.loginText}>{t('login.btn')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {bioAvail && (
              <TouchableOpacity style={styles.bioBtn} onPress={handleBiometric}>
                <Text style={styles.bioIcon}>👆</Text>
                <Text style={styles.bioText}>{t('login.biometric')}</Text>
              </TouchableOpacity>
            )}

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

  langRow: { alignItems: 'flex-end', marginBottom: 8 },

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

  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 24 },

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

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#e94560', fontSize: 13 },

  loginBtn: { borderRadius: 12, overflow: 'hidden', marginBottom: 14 },
  loginGradient: { paddingVertical: 16, alignItems: 'center' },
  loginText: { color: '#fff', fontWeight: '800', fontSize: 15, letterSpacing: 1 },

  bioBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(79,172,254,0.45)',
    backgroundColor: 'rgba(79,172,254,0.08)',
    paddingVertical: 13, marginBottom: 20, gap: 8,
  },
  bioIcon: { fontSize: 22 },
  bioText: { color: '#4facfe', fontSize: 14, fontWeight: '700' },

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
