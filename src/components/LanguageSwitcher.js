import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

const LANGS = [
  { code: 'vi', flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [visible, setVisible] = useState(false);

  const current = LANGS.find(l => l.code === language);

  return (
    <>
      <TouchableOpacity style={ls.trigger} onPress={() => setVisible(true)} activeOpacity={0.75}>
        <Text style={ls.flag}>{current.flag}</Text>
        <Text style={ls.code}>{language.toUpperCase()}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={ls.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={ls.sheet}>
            <Text style={ls.title}>{t('lang.title')}</Text>
            {LANGS.map(lang => {
              const active = language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[ls.option, active && ls.optionActive]}
                  onPress={() => { setLanguage(lang.code); setVisible(false); }}
                  activeOpacity={0.75}
                >
                  <Text style={ls.optionFlag}>{lang.flag}</Text>
                  <Text style={[ls.optionLabel, active && ls.optionLabelActive]}>{lang.label}</Text>
                  {active && <Text style={ls.check}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const ls = StyleSheet.create({
  trigger:          { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  flag:             { fontSize: 16 },
  code:             { color: '#ccd6f6', fontSize: 11, fontWeight: '800' },

  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  sheet:            { backgroundColor: '#16213e', borderRadius: 20, padding: 24, width: 260, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  title:            { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 18 },

  option:           { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  optionActive:     { backgroundColor: 'rgba(79,172,254,0.12)', borderColor: 'rgba(79,172,254,0.4)' },
  optionFlag:       { fontSize: 24 },
  optionLabel:      { flex: 1, color: '#8892b0', fontSize: 15, fontWeight: '600' },
  optionLabelActive:{ color: '#fff' },
  check:            { color: '#4facfe', fontSize: 16, fontWeight: '800' },
});
