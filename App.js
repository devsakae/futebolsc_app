import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  ActivityIndicator, 
  StatusBar, 
  Text,
  TouchableOpacity,
  Platform
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton';
import { 
  Inter_400Regular, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { Calendar, Users, Trophy, Info, Crown, X, CalendarDays } from 'lucide-react-native';

import Header from './src/components/Header';
import MatchCard from './src/components/MatchCard';
import AboutScreen from './src/screens/AboutScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import TournamentsScreen from './src/screens/TournamentsScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import { Colors } from './src/constants/Colors';
import { getTodayMatches, getMatchesByTeam, getTeams } from './src/services/api';
import { getRouteFromUrl, findMatchingTeam, updateBrowserUrl } from './src/utils/url';

export default function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isTodayOnly, setIsTodayOnly] = useState(false);
  const [teams, setTeams] = useState([]);
  const listRef = useRef(null);

  let [fontsLoaded] = useFonts({
    Anton_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const filterMatchesForToday = (matchList) => {
    if (!matchList || !Array.isArray(matchList)) return [];
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    const todayYear = today.getFullYear();

    return matchList.filter((match) => {
      if (!match || !match.date) return false;
      const parts = match.date.split('/');
      if (parts.length !== 3) return false;
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      return day === todayDay && month === todayMonth && year === todayYear;
    });
  };

  const findNearestMatchIndex = (matchList) => {
    if (!matchList || matchList.length === 0) return 0;
    
    const now = new Date();
    let nearestIndex = 0;
    let smallestDiff = Infinity;

    matchList.forEach((match, index) => {
      if (!match.date) return;
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

  const scrollToNearestMatch = (matchList) => {
    if (!matchList || matchList.length === 0) return;
    setTimeout(() => {
      const index = findNearestMatchIndex(matchList);
      if (listRef.current) {
        listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
      }
    }, 400);
  };

  const fetchMatchesForTeam = async (teamName, todayOnly = false) => {
    try {
      setLoading(true);
      setSelectedTeam(teamName);
      setIsTodayOnly(todayOnly);
      setActiveTab('today');

      const data = await getMatchesByTeam(teamName);
      
      if (todayOnly) {
        const todayData = filterMatchesForToday(data);
        setMatches(todayData);
      } else {
        setMatches(data || []);
        scrollToNearestMatch(data);
      }
    } catch (error) {
      console.error(`Failed to fetch matches for ${teamName}:`, error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayMatches = async () => {
    try {
      setLoading(true);
      setSelectedTeam(null);
      setIsTodayOnly(false);
      setActiveTab('today');
      const data = await getTodayMatches();
      setMatches(data || []);
    } catch (error) {
      console.error('Failed to fetch today matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoute = async (teamsList = teams) => {
    const route = getRouteFromUrl();

    if ((route.type === 'team' || route.type === 'team_today') && route.teamParam) {
      const officialTeamName = findMatchingTeam(teamsList, route.teamParam);
      if (officialTeamName) {
        if (route.isTodayOnly) {
          updateBrowserUrl(`/${encodeURIComponent(officialTeamName)}/hoje`, `Futebol SC - ${officialTeamName} Hoje`);
          await fetchMatchesForTeam(officialTeamName, true);
        } else {
          updateBrowserUrl(`/${encodeURIComponent(officialTeamName)}`, `Futebol SC - ${officialTeamName}`);
          await fetchMatchesForTeam(officialTeamName, false);
        }
        return;
      }
    }

    // Default or static tab routes
    if (route.value === 'today') {
      updateBrowserUrl('/', 'Futebol SC - Hoje');
      await fetchTodayMatches();
    } else {
      setSelectedTeam(null);
      setIsTodayOnly(false);
      setActiveTab(route.value);
      updateBrowserUrl(`/${route.value}`, `Futebol SC - ${route.value.toUpperCase()}`);
    }
  };

  useEffect(() => {
    const init = async () => {
      let loadedTeams = [];
      try {
        loadedTeams = await getTeams({ uf: 'SC' });
        setTeams(loadedTeams || []);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
      await handleRoute(loadedTeams);
    };

    init();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const onPopState = () => {
        handleRoute(teams);
      };
      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
    }
  }, [teams]);

  const handleTabPress = (tabKey) => {
    if (tabKey === 'today') {
      updateBrowserUrl('/', 'Futebol SC - Hoje');
      fetchTodayMatches();
    } else {
      setSelectedTeam(null);
      setIsTodayOnly(false);
      setActiveTab(tabKey);
      updateBrowserUrl(`/${tabKey}`, `Futebol SC - ${tabKey.toUpperCase()}`);
    }
  };

  const handleSelectTeamFromScreen = (teamName) => {
    updateBrowserUrl(`/${encodeURIComponent(teamName)}`, `Futebol SC - ${teamName}`);
    fetchMatchesForTeam(teamName, false);
  };

  const toggleTodayOnlyView = () => {
    if (!selectedTeam) return;
    if (isTodayOnly) {
      updateBrowserUrl(`/${encodeURIComponent(selectedTeam)}`, `Futebol SC - ${selectedTeam}`);
      fetchMatchesForTeam(selectedTeam, false);
    } else {
      updateBrowserUrl(`/${encodeURIComponent(selectedTeam)}/hoje`, `Futebol SC - ${selectedTeam} Hoje`);
      fetchMatchesForTeam(selectedTeam, true);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutScreen />;
      case 'teams':
        return (
          <TeamsScreen 
            initialTeam={selectedTeam} 
            onSelectTeam={handleSelectTeamFromScreen} 
          />
        );
      case 'tournaments':
        return <TournamentsScreen />;
      case 'premium':
        return <PremiumScreen />;
      default:
        if (loading) {
          return (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>
                {selectedTeam 
                  ? (isTodayOnly ? `BUSCANDO JOGOS DE HOJE DE ${selectedTeam}...` : `BUSCANDO JOGOS DE ${selectedTeam}...`)
                  : 'CARREGANDO JOGOS...'}
              </Text>
            </View>
          );
        }
        return (
          <FlatList
            ref={listRef}
            data={matches}
            renderItem={({ item }) => <MatchCard match={item} />}
            keyExtractor={(item, index) => `${item.match_id}-${item.tournament}-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                listRef.current?.scrollToIndex({ index: info.index, animated: true });
              }, 500);
            }}
            ListHeaderComponent={
              selectedTeam ? (
                <View style={styles.teamBannerContainer}>
                  <View style={styles.teamBannerTextContainer}>
                    <Text style={styles.teamBannerLabel}>
                      {isTodayOnly ? 'JOGOS DE HOJE DO TIME' : 'CALENDÁRIO DO TIME'}
                    </Text>
                    <Text style={styles.teamBannerTitle}>{selectedTeam}</Text>
                  </View>
                  <View style={styles.bannerActions}>
                    <TouchableOpacity 
                      style={styles.toggleViewButton}
                      onPress={toggleTodayOnlyView}
                    >
                      <CalendarDays size={14} color={Colors.primary} />
                      <Text style={styles.toggleViewText}>
                        {isTodayOnly ? 'VER TUDO' : 'VER HOJE'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.clearTeamButton}
                      onPress={() => handleTabPress('today')}
                    >
                      <X size={14} color={Colors.onSurfaceVariant} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {isTodayOnly 
                    ? "Nenhuma partida registrada para hoje"
                    : selectedTeam 
                      ? `NENHUMA PARTIDA ENCONTRADA PARA ${selectedTeam}` 
                      : 'NENHUM JOGO PARA HOJE'}
                </Text>
              </View>
            }
            refreshing={loading}
            onRefresh={() => selectedTeam ? fetchMatchesForTeam(selectedTeam, isTodayOnly) : fetchTodayMatches()}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: Colors.background }}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView style={styles.container}>
          <Header />
          
          <View style={styles.content}>
            {renderContent()}
          </View>

          {/* Bottom Navigation */}
          <View style={styles.bottomNav}>
            <TouchableOpacity 
              style={styles.navItem} 
              onPress={() => handleTabPress('today')}
            >
              <Calendar 
                size={20} 
                color={activeTab === 'today' && !selectedTeam ? Colors.primary : Colors.onSurfaceVariant} 
                strokeWidth={activeTab === 'today' && !selectedTeam ? 3 : 2}
              />
              <Text style={[styles.navText, activeTab === 'today' && !selectedTeam && styles.activeNavText]}>HOJE</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => handleTabPress('teams')}
            >
              <Users 
                size={20} 
                color={activeTab === 'teams' || selectedTeam ? Colors.primary : Colors.onSurfaceVariant} 
                strokeWidth={activeTab === 'teams' || selectedTeam ? 3 : 2}
              />
              <Text style={[styles.navText, (activeTab === 'teams' || selectedTeam) && styles.activeNavText]}>
                {selectedTeam ? 'TIME' : 'TIMES'}
              </Text>
            </TouchableOpacity>

            {/* STYLISH PREMIUM BUTTON */}
            <TouchableOpacity 
              style={styles.premiumNavItem}
              onPress={() => handleTabPress('premium')}
            >
              <LinearGradient
                colors={activeTab === 'premium' ? [Colors.primary, '#E9C400', '#B8860B'] : ['#333', '#1A1A1A']}
                style={styles.premiumIconCircle}
              >
                <Crown 
                  size={24} 
                  color={activeTab === 'premium' ? Colors.black : Colors.onSurfaceVariant} 
                  strokeWidth={2.5}
                />
              </LinearGradient>
              <Text style={[
                styles.navText, 
                { fontSize: 7, marginTop: 2 },
                activeTab === 'premium' && { color: Colors.primary, fontWeight: '900' }
              ]}>PREMIUM</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => handleTabPress('tournaments')}
            >
              <Trophy 
                size={20} 
                color={activeTab === 'tournaments' ? Colors.primary : Colors.onSurfaceVariant} 
                strokeWidth={activeTab === 'tournaments' ? 3 : 2}
              />
              <Text style={[styles.navText, activeTab === 'tournaments' && styles.activeNavText]}>CAMP.</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => handleTabPress('about')}
            >
              <Info 
                size={20} 
                color={activeTab === 'about' ? Colors.primary : Colors.onSurfaceVariant} 
                strokeWidth={activeTab === 'about' ? 3 : 2}
              />
              <Text style={[styles.navText, activeTab === 'about' && styles.activeNavText]}>SOBRE</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  listContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'Anton_400Regular', color: Colors.primary, marginTop: 12, letterSpacing: 2, textAlign: 'center', paddingHorizontal: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, paddingHorizontal: 20 },
  emptyText: { fontFamily: 'Anton_400Regular', color: Colors.onSurfaceVariant, fontSize: 16, letterSpacing: 1, textAlign: 'center' },
  teamBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerHigh,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  teamBannerTextContainer: { flex: 1 },
  teamBannerLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Colors.primary, letterSpacing: 1 },
  teamBannerTitle: { fontFamily: 'Anton_400Regular', fontSize: 20, color: Colors.onSurface, marginTop: 2 },
  bannerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 196, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 4,
  },
  toggleViewText: { fontFamily: 'Inter_700Bold', fontSize: 10, color: Colors.primary, letterSpacing: 0.5 },
  clearTeamButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    height: 65,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(77, 71, 50, 0.3)',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  premiumNavItem: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1,
    marginTop: -15, // Lift the button slightly
  },
  premiumIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justify.content: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navText: { fontFamily: 'Inter_700Bold', fontSize: 7, color: Colors.onSurfaceVariant, marginTop: 4, letterSpacing: 0.5 },
  activeNavText: { color: Colors.primary },
});
