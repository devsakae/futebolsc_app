import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
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
    timestamp,
    featured
  } = match;

  const getMatchDateTime = () => {
    if (timestamp && timestamp > 0) {
      return new Date(timestamp * 1000);
    }
    const [day, month, year] = date.split('/');
    const [hours, minutes] = schedule.split(':');
    return new Date(year, month - 1, day, hours, minutes);
  };

  const matchDateObj = getMatchDateTime();
  const now = new Date();
  const displayMonth = getMonthName((matchDateObj.getMonth() + 1).toString());
  const displaySchedule = `${matchDateObj.getHours().toString().padStart(2, '0')}:${matchDateObj.getMinutes().toString().padStart(2, '0')}`;

  const isToday = (mDate) => {
    const today = new Date();
    return mDate.getDate() === today.getDate() &&
           mDate.getMonth() === today.getMonth() &&
           mDate.getFullYear() === today.getFullYear();
  };

  const matchIsToday = isToday(matchDateObj);
  const showScore = !matchIsToday && now >= matchDateObj;

  return (
    <View style={[
      styles.container, 
      featured && styles.featuredContainer
    ]}>
      {/* Left 18%: Date/Time */}
      <View style={[
        styles.leftSection,
        featured && styles.featuredLeftSection
      ]}>
        <Text style={[
          styles.dateText,
          featured && styles.featuredText
        ]}>{matchDateObj.getDate()} {displayMonth}</Text>
        <Text style={[
          styles.timeText,
          featured && styles.featuredTimeText
        ]}>{displaySchedule}</Text>
      </View>

      {/* Right 82%: Match Details */}
      <View style={styles.rightSection}>
        <View style={styles.tournamentContainer}>
          <Trophy size={10} color={featured ? Colors.primary : Colors.primary} strokeWidth={3} />
          <Text style={[
            styles.tournamentText,
            featured && styles.featuredTournamentText
          ]} numberOfLines={1}>{tournament}</Text>
        </View>

        <View style={styles.matchRow}>
          <View style={styles.teamGroup}>
            <Text style={styles.teamName}>{homeTeam}</Text>
            {showScore && <Text style={styles.score}>{homeScore}</Text>}
          </View>
          
          <View style={styles.vsContainer}>
             <Text style={styles.vsText}>{showScore ? 'x' : 'vs'}</Text>
          </View>
          
          <View style={styles.teamGroup}>
            {showScore && <Text style={styles.score}>{awayScore}</Text>}
            <Text style={styles.teamName}>{awayTeam}</Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={12} color={featured ? Colors.onSurface : Colors.onSurfaceVariant} />
          <Text style={[
            styles.locationText,
            featured && styles.featuredLocationText
          ]} numberOfLines={1}>
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
    borderColor: 'rgba(153, 144, 119, 0.2)', 
    marginBottom: 12,
    minHeight: 85,
    ...Platform.select({
      ios: {
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
      }
    }),
  },
  featuredContainer: {
    backgroundColor: Colors.surfaceContainerHigh, // Slightly lighter
    borderColor: Colors.primary, // Gold border
    borderWidth: 1.5,
  },
  leftSection: {
    width: '18%',
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRightWidth: 1,
    borderRightColor: 'rgba(153, 144, 119, 0.2)',
  },
  featuredLeftSection: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)', // Subtle gold tint
    borderRightColor: Colors.primary,
  },
  dateText: {
    ...Typography.labelLg,
    color: Colors.onSurfaceVariant,
    fontSize: 9,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  timeText: {
    ...Typography.headlineSm,
    color: Colors.primary,
    fontSize: 16,
    marginTop: 2,
  },
  featuredTimeText: {
    fontWeight: '900',
  },
  featuredText: {
    color: Colors.onSurface,
    fontWeight: 'bold',
  },
  rightSection: {
    width: '82%',
    paddingVertical: 10,
    paddingHorizontal: 12,
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
    fontSize: 9,
    letterSpacing: 0.5,
    flex: 1,
  },
  featuredTournamentText: {
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  teamGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vsContainer: {
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: {
    ...Typography.headlineSm,
    color: Colors.onSurface,
    fontSize: 14,
  },
  score: {
    ...Typography.headlineSm,
    color: Colors.primary,
    fontSize: 18,
    minWidth: 14,
    textAlign: 'center',
  },
  vsText: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
    fontSize: 10,
    fontWeight: 'bold',
    opacity: 0.6,
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
    fontSize: 10,
    opacity: 0.8,
  },
  featuredLocationText: {
    color: Colors.onSurface,
    opacity: 1,
  }
});

export default MatchCard;
