import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Globe, User, Send } from 'lucide-react-native';

const AboutScreen = () => {
  const visitWebsite = () => {
    Linking.openURL('https://devsakae.com.br');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* APP SECTION */}
        <View style={styles.section}>
          <Text style={styles.header}>FUTEBOL SC</Text>
          <Text style={styles.text}>
            Um calendário simplificado para o futebol catarinense. Acompanhe datas, horários e locais dos jogos em um visual direto e moderno.
          </Text>
          <Text style={styles.text}>
            Dados coletados de fontes oficiais da FCF e APIs esportivas globais.
          </Text>
        </View>

        {/* PROFILE SECTION */}
        <View style={styles.profileSection}>
          <View style={styles.iconCircle}>
            <User size={32} color={Colors.primary} />
          </View>
          <Text style={styles.devName}>devsakae</Text>
          <Text style={styles.devBio}>Fullstack Developer</Text>
          
          <TouchableOpacity style={styles.button} onPress={visitWebsite}>
            <Globe size={18} color={Colors.black} />
            <Text style={styles.buttonText}>PORTFOLIO</Text>
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.version}>v1.0.0 • 2026</Text>
          <TouchableOpacity onPress={() => Linking.openURL('mailto:contato@devsakae.com.br')}>
            <Text style={styles.contactEmail}>contato@devsakae.com.br</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  section: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.1)',
  },
  header: {
    ...Typography.displayLg,
    color: Colors.primary,
    fontSize: 28,
    marginBottom: 12,
  },
  text: {
    ...Typography.bodyLg,
    color: Colors.onSurface,
    lineHeight: 22,
    marginBottom: 12,
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  devName: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
    fontSize: 20,
    marginBottom: 4,
  },
  devBio: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 10,
  },
  buttonText: {
    ...Typography.labelLg,
    color: Colors.black,
    fontWeight: '800',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  version: {
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    opacity: 0.5,
  },
  contactEmail: {
    color: Colors.primary,
    fontSize: 12,
    marginTop: 8,
    textDecorationLine: 'underline',
  }
});

export default AboutScreen;
