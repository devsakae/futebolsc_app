import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  FlatList,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Crown, LogIn, LogOut, User, Search, X, ChevronDown, Save } from 'lucide-react-native';
import { verifyUser, getMatchesByTeam, getTeams, updateUserTeam } from '../services/api';
import MatchCard from '../components/MatchCard';

WebBrowser.maybeCompleteAuthSession();

const PremiumScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  
  // Selection States
  const [allTeams, setAllTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null); // Local selection before save
  const [isSaving, setIsSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef(null);

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
      
      handleUserLoggedIn(verifiedUser);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserLoggedIn = (userData) => {
    setUser(userData);
    if (userData.plan === 1) {
      // Load available teams for the selector
      fetchAvailableTeams();
      
      // If user already has a saved team, load its calendar
      if (userData.selected_team) {
        setSelectedTeam(userData.selected_team);
        fetchTeamCalendar(userData.selected_team.name);
      }
    }
  };

  const fetchAvailableTeams = async () => {
    try {
      const data = await getTeams();
      setAllTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const fetchTeamCalendar = async (teamName) => {
    try {
      setMatchesLoading(true);
      const data = await getMatchesByTeam(teamName);
      setMatches(data);
      
      // Auto-scroll to nearest match
      setTimeout(() => {
        const index = findNearestMatchIndex(data);
        if (listRef.current && data.length > 0) {
          listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }
      }, 500);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setMatchesLoading(false);
    }
  };

  const findNearestMatchIndex = (matchList) => {
    if (!matchList || matchList.length === 0) return 0;
    const now = new Date();
    let nearestIndex = 0;
    let smallestDiff = Infinity;
    matchList.forEach((match, index) => {
      const [day, month, year] = match.date.split('/');
      const matchDate = new Date(year, month - 1, day);
      const diff = Math.abs(matchDate.getTime() - now.getTime());
      if (diff < smallestDiff) {
        smallestDiff = diff;
        nearestIndex = index;
      }
    });
    return nearestIndex;
  };

  const handleSaveSelection = async () => {
    if (!selectedTeam) return;
    
    try {
      setIsSaving(true);
      await updateUserTeam(user.email, selectedTeam);
      
      // Update local user state
      setUser(prev => ({ ...prev, selected_team: selectedTeam }));
      
      // Refresh calendar
      fetchTeamCalendar(selectedTeam.name);
      
      Alert.alert('Sucesso', 'Seleção de time salva com sucesso!');
    } catch (error) {
      console.error('Error saving team:', error);
      Alert.alert('Erro', 'Não foi possível salvar sua seleção.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setMatches([]);
    setSelectedTeam(null);
  };

  const mockLogin = async () => {
    setLoading(true);
    setTimeout(async () => {
      const mockData = {
        email: 'premium@devsakae.com.br',
        name: 'Usuário Premium (Demo)',
        avatar: '',
        plan: 1,
        selected_team: null
      };
      const verified = await verifyUser(mockData);
      handleUserLoggedIn(verified);
      setLoading(false);
    }, 800);
  };

  const filteredTeamsList = allTeams.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>PROCESSANDO...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.hero}>
          <Crown size={64} color={Colors.primary} />
          <Text style={styles.heroTitle}>FUTEBOL SC PREMIUM</Text>
          <Text style={styles.heroSubtitle}>Seu calendário personalizado em um só lugar.</Text>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={() => promptAsync()} disabled={!request}>
          <LogIn size={20} color={Colors.black} />
          <Text style={styles.loginButtonText}>ENTRAR COM GOOGLE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.mockButton} onPress={mockLogin}>
          <Text style={styles.mockButtonText}>Pular login (Usar Demo)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (user.plan !== 1) {
    return (
      <View style={styles.container}>
        <View style={styles.profileHeader}>
          {user.avatar ? <Image source={{ uri: user.avatar }} style={styles.avatar} /> : 
          <View style={[styles.avatar, styles.avatarPlaceholder]}><User size={40} color={Colors.primary} /></View>}
          <Text style={styles.userName}>{user.name}</Text>
          <View style={styles.badgeFree}><Text style={styles.badgeText}>PLANO FREE</Text></View>
        </View>
        <View style={styles.promoCard}>
          <Crown size={32} color={Colors.primary} />
          <Text style={styles.promoTitle}>ÁREA EXCLUSIVA</Text>
          <Text style={styles.promoText}>Acesse seu calendário personalizado tornando-se Premium.</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={18} color={Colors.onSurfaceVariant} /><Text style={styles.logoutText}>SAIR</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Premium UI Header */}
      <View style={styles.premiumHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.premiumTitle}>PREMIUM</Text>
          <Text style={styles.premiumSubtitle}>Escolha seu time oficial</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <LogOut size={20} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      </View>

      {/* Team Selection Area */}
      <View style={styles.selectionRow}>
        <TouchableOpacity 
          style={styles.selector} 
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.selectorText} numberOfLines={1}>
            {selectedTeam?.name || 'SELECIONE UM TIME'}
          </Text>
          <ChevronDown size={18} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.saveButton, !selectedTeam && styles.saveButtonDisabled]} 
          onPress={handleSaveSelection}
          disabled={!selectedTeam || isSaving}
        >
          {isSaving ? <ActivityIndicator size="small" color={Colors.black} /> : <Save size={20} color={Colors.black} />}
          <Text style={styles.saveButtonText}>SALVAR</Text>
        </TouchableOpacity>
      </View>

      {/* Personalized Calendar */}
      {matchesLoading ? (
        <View style={styles.matchesCenter}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : matches.length > 0 ? (
        <FlatList
          ref={listRef}
          data={matches}
          renderItem={({ item }) => <MatchCard match={item} />}
          keyExtractor={(item, index) => `${item.match_id}-${item.tournament}-${index}`}
          contentContainerStyle={styles.list}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => listRef.current?.scrollToIndex({ index: info.index, animated: true }), 500);
          }}
        />
      ) : (
        <View style={styles.emptyContainer}>
           <Info size={32} color={Colors.onSurfaceVariant} />
           <Text style={styles.emptyText}>
             {selectedTeam ? 'Nenhum jogo encontrado para este time.' : 'Selecione e salve um time para visualizar seu calendário exclusivo.'}
           </Text>
        </View>
      )}

      {/* Team Selector Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.safeAreaModal}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>TIME OFICIAL</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color={Colors.onSurface} /></TouchableOpacity>
              </View>
              <View style={styles.searchContainer}>
                <Search size={18} color={Colors.onSurfaceVariant} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar time..."
                  placeholderTextColor={Colors.onSurfaceVariant}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
              </View>
              <FlatList
                data={filteredTeamsList}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.teamItem} onPress={() => { setSelectedTeam(item); setModalVisible(false); setSearchQuery(''); }}>
                    <Text style={styles.teamItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  matchesCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...Typography.labelLg, color: Colors.primary, marginTop: 12, letterSpacing: 2 },
  hero: { alignItems: 'center', marginTop: 40, marginBottom: 40 },
  heroTitle: { ...Typography.displayLg, color: Colors.primary, fontSize: 28, marginTop: 20 },
  heroSubtitle: { ...Typography.bodyLg, color: Colors.onSurface, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  loginButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 30, gap: 12 },
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
  premiumHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  premiumTitle: { ...Typography.displayLg, color: Colors.primary, fontSize: 24 },
  premiumSubtitle: { ...Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: -4 },
  selectionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  selector: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surfaceContainerLow, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(153, 144, 119, 0.4)' },
  selectorText: { color: Colors.onSurface, fontSize: 14, fontWeight: '600' },
  saveButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, paddingHorizontal: 16, borderRadius: 8, gap: 8 },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: Colors.black, fontWeight: 'bold', fontSize: 12 },
  list: { paddingBottom: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { color: Colors.onSurfaceVariant, textAlign: 'center', marginTop: 16, ...Typography.bodyMd },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  safeAreaModal: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surfaceContainerHigh, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '90%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { ...Typography.headlineSm, color: Colors.primary, letterSpacing: 2 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLow, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  searchInput: { flex: 1, height: 48, color: Colors.onSurface, ...Typography.bodyLg },
  teamItem: { paddingVertical: 16 },
  teamItemText: { ...Typography.bodyLg, color: Colors.onSurface },
  separator: { height: 1, backgroundColor: 'rgba(153, 144, 119, 0.1)' },
});

export default PremiumScreen;
