import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  ActivityIndicator, 
  StatusBar, 
  Text,
  TouchableOpacity
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton';
import { 
  Inter_400Regular, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { Calendar, Users, Trophy, Info, Crown } from 'lucide-react-native';

import Header from './src/components/Header';
import MatchCard from './src/components/MatchCard';
import AboutScreen from './src/screens/AboutScreen';
import TeamsScreen from './src/screens/TeamsScreen';
import TournamentsScreen from './src/screens/TournamentsScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import { Colors } from './src/constants/Colors';
import { getTodayMatches } from './src/services/api';

export default function App() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');

  let [fontsLoaded] = useFonts({
    Anton_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const data = await getTodayMatches();
      setMatches(data);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
      setMatches([]);
    } finally {
      setLoading(false);
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
        return <TeamsScreen />;
      case 'tournaments':
        return <TournamentsScreen />;
      case 'premium':
        return <PremiumScreen />;
      default:
        if (loading) {
          return (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>CARREGANDO JOGOS...</Text>
            </View>
          );
        }
        return (
          <FlatList
            data={matches}
            renderItem={({ item }) => <MatchCard match={item} />}
            keyExtractor={(item, index) => `${item.match_id}-${item.tournament}-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>NENHUM JOGO PARA HOJE</Text>
              </View>
            }
            refreshing={loading}
            onRefresh={fetchMatches}
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
              onPress={() => setActiveTab('today')}
            >
              <Calendar 
                size={20} 
                color={activeTab === 'today' ? Colors.primary : Colors.onSurfaceVariant} 
                strokeWidth={activeTab === 'today' ? 3 : 2}
              />
              <Text style={[styles.navText, activeTab === 'today' && styles.activeNavText]}>HOJE</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.navItem}
              onPress={() => setActiveTab('teams')}
            >
              <Users 
                size={20} 
                color={activeTab === 'teams' ? Colors.primary : Colors.onSurfaceVariant} 
                strokeWidth={activeTab === 'teams' ? 3 : 2}
              />
              <Text style={[styles.navText, activeTab === 'teams' && styles.activeNavText]}>TIMES</Text>
            </TouchableOpacity>

            {/* STYLISH PREMIUM BUTTON */}
            <TouchableOpacity 
              style={styles.premiumNavItem}
              onPress={() => setActiveTab('premium')}
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
              onPress={() => setActiveTab('tournaments')}
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
              onPress={() => setActiveTab('about')}
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
  loadingText: { fontFamily: 'Anton_400Regular', color: Colors.primary, marginTop: 12, letterSpacing: 2 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  emptyText: { fontFamily: 'Anton_400Regular', color: Colors.onSurfaceVariant, fontSize: 16, letterSpacing: 1 },
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
    justifyContent: 'center',
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
