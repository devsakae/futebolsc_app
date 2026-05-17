import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { MapPin, Trophy } from 'lucide-react-native';

const MatchCard = ({ match }) => {
  const {
    tournament,
    date,
    homeTeam,
    homeScore,
    awayTeam,
    awayScore,
    stadium,
    location,
    schedule,
  } = match;

  return (
    <View style={styles.container}>
      {/* Left 25%: Date/Time */}
      <View style={styles.leftSection}>
        <Text style={styles.dateText}>{date.split('/')[0]} {getMonthName(date.split('/')[1])}</Text>
        <Text style={styles.timeText}>{schedule}</Text>
      </View>

      {/* Right 75%: Match Details */}
      <View style={styles.rightSection}>
        <View style={styles.tournamentContainer}>
          <Trophy size={10} color={Colors.primary} strokeWidth={3} />
          <Text style={styles.tournamentText}>{tournament}</Text>
        </View>

        <View style={styles.matchRow}>
          <View style={styles.teamContainer}>
            <Text style={styles.teamName} numberOfLines={1}>{homeTeam}</Text>
            <Text style={styles.score}>{homeScore}</Text>
          </View>
          
          <Text style={styles.vsText}>vs</Text>
          
          <View style={styles.teamContainer}>
            <Text style={styles.score}>{awayScore}</Text>
            <Text style={styles.teamName} numberOfLines={1}>{awayTeam}</Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={12} color={Colors.onSurfaceVariant} />
          <Text style={styles.locationText} numberOfLines={1}>
            {stadium}{location ? `, ${location}` : ''}
          </Text>
        </View>
      </View>
    </View>
  );
};

const getMonthName = (month) => {
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return months[parseInt(month, 10) - 1] || month;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(153, 144, 119, 0.2)', // outline with low opacity
    marginBottom: 12,
    elevation: 2,
  },
  leftSection: {
    width: '25%',
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(153, 144, 119, 0.2)',
  },
  dateText: {
    ...Typography.labelLg,
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    textAlign: 'center',
  },
  timeText: {
    ...Typography.headlineSm,
    color: Colors.primary,
    fontSize: 20,
    marginTop: 2,
  },
  rightSection: {
    width: '75%',
    padding: 12,
    justifyContent: 'center',
  },
  tournamentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  tournamentText: {
    ...Typography.labelLg,
    color: Colors.primary,
    fontSize: 10,
    letterSpacing: 2,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamName: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
    fontSize: 16,
    flex: 1,
  },
  score: {
    ...Typography.headlineSm,
    color: Colors.primary,
    fontSize: 18,
  },
  vsText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    paddingHorizontal: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  locationText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontSize: 11,
  },
});

export default MatchCard;
