import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  FlatList,
  Platform
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Crown, LogIn, LogOut, User } from 'lucide-react-native';
import { verifyUser, getMatchesByTeam } from '../services/api';
import MatchCard from '../components/MatchCard';

WebBrowser.maybeCompleteAuthSession();

const PremiumScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '809569883997-7ua6trnib1kr2tur02dd2182htnn6ihv.apps.googleusercontent.com',
    webClientId: '809569883997-chubonpl6rtkaiu6hjffn8ng7t1t73o4.apps.googleusercontent.com',
  }, {
    scheme: 'futebolsc',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      fetchUserInfo(authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    try {
      setLoading(true);
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const googleUser = await res.json();
      
      const verifiedUser = await verifyUser({
        email: googleUser.email,
        name: googleUser.name,
        avatar: googleUser.picture
      });
      
      setUser(verifiedUser);
      if (isPremium(verifiedUser)) {
        fetchPremiumCalendar();
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isPremium = (userData) => {
    // Flat structure: plan is a root level key (0: free, 1: premium)
    return userData?.plan === 1;
  };

  const fetchPremiumCalendar = async () => {
    try {
      setMatchesLoading(true);
      const data = await getMatchesByTeam('CRICIÚMA');
      setMatches(data);
    } catch (error) {
      console.error('Error loading premium matches:', error);
    } finally {
      setMatchesLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMatches([]);
  };

  const mockLogin = async () => {
    setLoading(true);
    setTimeout(async () => {
      const mockData = {
        email: 'premium@devsakae.com.br',
        name: 'Usuário Premium (Demo)',
        avatar: 'https://via.placeholder.com/150',
        start_date: '2026-05-10',
        plan: 1 // Root level plan
      };
      const verified = await verifyUser(mockData);
      setUser(verified);
      setLoading(false);
      fetchPremiumCalendar();
    }, 800);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>AUTENTICANDO...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.hero}>
          <Crown size={64} color={Colors.primary} />
          <Text style={styles.heroTitle}>FUTEBOL SC PREMIUM</Text>
          <Text style={styles.heroSubtitle}>
            Acesse calendários personalizados e recursos exclusivos.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={() => promptAsync()}
          disabled={!request}
        >
          <LogIn size={20} color={Colors.black} />
          <Text style={styles.loginButtonText}>ENTRAR COM GOOGLE</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mockButton} onPress={mockLogin}>
          <Text style={styles.mockButtonText}>TESTAR COMO PREMIUM (DEMO)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!isPremium(user)) {
    return (
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
               <User size={40} color={Colors.primary} />
            </View>
          )}
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.badgeFree}>
            <Text style={styles.badgeText}>PLANO FREE</Text>
          </View>
        </View>

        <View style={styles.promoCard}>
          <Crown size={32} color={Colors.primary} />
          <Text style={styles.promoTitle}>TORNE-SE PREMIUM</Text>
          <Text style={styles.promoText}>
            Seu plano atual não possui acesso a esta área. Entre em contato para realizar o upgrade.
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={18} color={Colors.onSurfaceVariant} />
          <Text style={styles.logoutText}>SAIR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.premiumHeader}>
        <View style={styles.headerInfo}>
          <Text style={styles.premiumTitle}>MEU CALENDÁRIO</Text>
          <Text style={styles.premiumSubtitle}>Criciúma • Todas as competições</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <LogOut size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {matchesLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={({ item }) => <MatchCard match={item} />}
          keyExtractor={(item, index) => `${item.match_id}-${item.tournament}-${index}`}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum jogo encontrado para sua seleção.</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { ...Typography.labelLg, color: Colors.primary, marginTop: 12, letterSpacing: 2 },
  hero: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  heroTitle: { ...Typography.displayLg, color: Colors.primary, fontSize: 28, marginTop: 20 },
  heroSubtitle: { ...Typography.bodyLg, color: Colors.onSurface, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  loginButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: Colors.primary, 
    paddingVertical: 16, 
    borderRadius: 30, 
    gap: 12 
  },
  loginButtonText: { ...Typography.labelLg, color: Colors.black, fontWeight: '800' },
  mockButton: { marginTop: 20, alignItems: 'center' },
  mockButtonText: { color: Colors.onSurfaceVariant, fontSize: 12, textDecorationLine: 'underline' },
  profileHeader: { alignItems: 'center', marginTop: 20, marginBottom: 30 },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12, borderWidth: 2, borderColor: Colors.primary },
  avatarPlaceholder: { backgroundColor: Colors.surfaceContainerHigh, justifyContent: 'center', alignItems: 'center' },
  userName: { ...Typography.headlineSm, color: Colors.onSurface },
  badgeFree: { backgroundColor: Colors.surfaceContainerHigh, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  badgeText: { color: Colors.onSurfaceVariant, fontSize: 10, fontWeight: 'bold' },
  promoCard: { backgroundColor: Colors.surfaceContainerLow, padding: 30, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
  promoTitle: { ...Typography.headlineSm, color: Colors.primary, marginTop: 16 },
  promoText: { ...Typography.bodyMd, color: Colors.onSurface, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 'auto', marginBottom: 20, gap: 8 },
  logoutText: { color: Colors.onSurfaceVariant, fontSize: 14 },
  premiumHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  premiumTitle: { ...Typography.headlineSm, color: Colors.primary, letterSpacing: 1 },
  premiumSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant },
  list: { paddingBottom: 20 },
  emptyText: { color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 40 }
});

export default PremiumScreen;
