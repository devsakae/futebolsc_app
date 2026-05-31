import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { ChevronDown, Search, X, Trophy } from 'lucide-react-native';
import { getTournaments, getMatchesByTournament } from '../services/api';
import MatchCard from '../components/MatchCard';

const TournamentsScreen = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tournamentsLoading, setTeamsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setTeamsLoading(true);
      const data = await getTournaments();
      setTournaments(data);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setTeamsLoading(false);
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

  const handleSelectTournament = async (tournament) => {
    setSelectedTournament(tournament);
    setModalVisible(false);
    setSearchQuery('');
    
    try {
      setLoading(true);
      const data = await getMatchesByTournament(tournament);
      setMatches(data);
      
      setTimeout(() => {
        const index = findNearestMatchIndex(data);
        if (listRef.current && data.length > 0) {
          listRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }
      }, 500);
      
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTournaments = tournaments.filter(t => 
    t.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => setModalVisible(true)}
        disabled={tournamentsLoading}
      >
        <Text style={styles.selectorText} numberOfLines={1}>
          {selectedTournament || (tournamentsLoading ? 'CARREGANDO...' : 'SELECIONE UM CAMPEONATO')}
        </Text>
        <ChevronDown size={20} color={Colors.primary} />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>BUSCANDO PARTIDAS...</Text>
        </View>
      ) : selectedTournament ? (
        <FlatList
          ref={listRef}
          data={matches}
          renderItem={({ item }) => <MatchCard match={item} allowFeatured={false} />}
          keyExtractor={(item, index) => `${item.match_id}-${item.tournament}-${index}`}
          contentContainerStyle={styles.listContainer}
          onScrollToIndexFailed={(info) => {
            setTimeout(() => {
              listRef.current?.scrollToIndex({ index: info.index, animated: true });
            }, 500);
          }}
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>NENHUMA PARTIDA ENCONTRADA</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.instructionText}>ESCOLHA UM CAMPEONATO PARA VER A TABELA COMPLETA</Text>
        </View>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.safeAreaModal} edges={['top', 'bottom']}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>CAMPEONATOS</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={24} color={Colors.onSurface} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <Search size={18} color={Colors.onSurfaceVariant} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar campeonato..."
                  placeholderTextColor={Colors.onSurfaceVariant}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
              </View>

              <FlatList
                data={filteredTournaments}
                keyExtractor={(item, index) => `${item}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.tournamentItem} 
                    onPress={() => handleSelectTournament(item)}
                  >
                    <Trophy size={16} color={Colors.primary} style={{ marginRight: 10 }} />
                    <Text style={styles.itemText}>{item}</Text>
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
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(153, 144, 119, 0.4)',
    marginBottom: 16,
  },
  selectorText: { ...Typography.titleLg, color: Colors.onSurface, fontSize: 14, flex: 1 },
  listContainer: { paddingBottom: 24 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  loadingText: { ...Typography.labelLg, color: Colors.primary, marginTop: 12, letterSpacing: 2 },
  emptyText: { ...Typography.headlineSm, color: Colors.onSurfaceVariant, textAlign: 'center' },
  instructionText: { ...Typography.headlineSm, color: Colors.onSurfaceVariant, textAlign: 'center', opacity: 0.7 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  safeAreaModal: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.surfaceContainerHigh, borderTopLeftRadius: 20, borderTopRightRadius: 20, height: '90%', padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { ...Typography.headlineSm, color: Colors.primary, letterSpacing: 2 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surfaceContainerLow, borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, color: Colors.onSurface, ...Typography.bodyLg },
  tournamentItem: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center' },
  itemText: { ...Typography.bodyLg, color: Colors.onSurface, flex: 1 },
  separator: { height: 1, backgroundColor: 'rgba(153, 144, 119, 0.1)' },
});

export default TournamentsScreen;
