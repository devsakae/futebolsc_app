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
import { useFonts, Anton_400Regular } from '@expo-google-fonts/anton';
import { 
  Inter_400Regular, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { Calendar, List, Users } from 'lucide-react-native';

import Header from './src/components/Header';
import MatchCard from './src/components/MatchCard';
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
      // Fallback data for testing if API fails
      setMatches([
        {
          tournament: "UEFA Champions League",
          date: "15/05/2026",
          homeTeam: "Real Madrid",
          homeScore: 2,
          awayTeam: "Bayern",
          awayScore: 1,
          stadium: "Santiago Bernabéu",
          location: "Madri",
          schedule: "20:00",
        },
        {
          tournament: "Premier League",
          date: "14/05/2026",
          homeTeam: "Man City",
          homeScore: 0,
          awayTeam: "Arsenal",
          awayScore: 2,
          stadium: "Emirates Stadium",
          location: "Londres",
          schedule: "16:00",
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Header />
      
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>CARREGANDO JOGOS...</Text>
          </View>
        ) : (
          <FlatList
            data={matches}
            renderItem={({ item }) => <MatchCard match={item} />}
            keyExtractor={(item, index) => item.match_id?.toString() || index.toString()}
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
        )}
      </View>

      {/* Bottom Navigation Mock */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem} 
          onPress={() => setActiveTab('today')}
        >
          <Calendar 
            size={24} 
            color={activeTab === 'today' ? Colors.primary : Colors.onSurfaceVariant} 
            strokeWidth={activeTab === 'today' ? 3 : 2}
          />
          <Text style={[
            styles.navText, 
            activeTab === 'today' && styles.activeNavText
          ]}>HOJE</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('more')}
        >
          <List 
            size={24} 
            color={activeTab === 'more' ? Colors.primary : Colors.onSurfaceVariant} 
          />
          <Text style={[
            styles.navText, 
            activeTab === 'more' && styles.activeNavText
          ]}>MAIS JOGOS</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('about')}
        >
          <Users 
            size={24} 
            color={activeTab === 'about' ? Colors.primary : Colors.onSurfaceVariant} 
          />
          <Text style={[
            styles.navText, 
            activeTab === 'about' && styles.activeNavText
          ]}>SOBRE NÓS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Anton_400Regular',
    color: Colors.primary,
    marginTop: 12,
    letterSpacing: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontFamily: 'Anton_400Regular',
    color: Colors.onSurfaceVariant,
    fontSize: 16,
    letterSpacing: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: 'rgba(77, 71, 50, 0.3)',
    paddingBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  activeNavText: {
    color: Colors.primary,
  },
});
