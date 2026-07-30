import { Platform } from 'react-native';

/**
 * Normalizes a string for team matching (lowercase, no accents, replace hyphens/underscores with spaces)
 */
export const normalizeStr = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Strip common Brazilian football team prefixes/suffixes for matching
 */
const stripTeamAffixes = (str) => {
  const norm = normalizeStr(str);
  return norm
    .replace(/^(cn|aa|ec|ad|ae|ao|cd|fc|sc)\s+/, '')
    .replace(/\s+(saf|fc|sc)$/, '')
    .trim();
};

/**
 * Given a team parameter string from URL and a list of teams,
 * returns the best matching official team name from the list.
 */
export const findMatchingTeam = (teamsList, teamParam) => {
  if (!teamParam) return null;
  const decodedParam = decodeURIComponent(teamParam).trim();
  if (!decodedParam) return null;

  if (!teamsList || teamsList.length === 0) {
    return decodedParam.replace(/[-_]/g, ' ').toUpperCase();
  }

  // 1. Exact raw match
  const exactMatch = teamsList.find(
    (t) => (typeof t === 'string' ? t : t.name) === decodedParam
  );
  if (exactMatch) return typeof exactMatch === 'string' ? exactMatch : exactMatch.name;

  // 2. Exact normalized match
  const normParam = normalizeStr(decodedParam);
  const normMatch = teamsList.find(
    (t) => normalizeStr(typeof t === 'string' ? t : t.name) === normParam
  );
  if (normMatch) return typeof normMatch === 'string' ? normMatch : normMatch.name;

  // 3. Affix-stripped match (e.g. "marcilio-dias" -> "CN MARCÍLIO DIAS")
  const strippedParam = stripTeamAffixes(decodedParam);
  const affixMatch = teamsList.find(
    (t) => stripTeamAffixes(typeof t === 'string' ? t : t.name) === strippedParam
  );
  if (affixMatch) return typeof affixMatch === 'string' ? affixMatch : affixMatch.name;

  // 4. Substring match
  const substringMatch = teamsList.find((t) => {
    const tName = stripTeamAffixes(typeof t === 'string' ? t : t.name);
    return (
      (tName.length > 2 && strippedParam.length > 2) &&
      (tName.includes(strippedParam) || strippedParam.includes(tName))
    );
  });
  if (substringMatch) return typeof substringMatch === 'string' ? substringMatch : substringMatch.name;

  // Fallback to nicely formatted decodedParam
  return decodedParam.replace(/[-_]/g, ' ').toUpperCase();
};

/**
 * Known static tab routes that are not team names
 */
const KNOWN_TAB_ROUTES = {
  '': 'today',
  'today': 'today',
  'hoje': 'today',
  'teams': 'teams',
  'times': 'teams',
  'tournaments': 'tournaments',
  'campeonatos': 'tournaments',
  'camp': 'tournaments',
  'about': 'about',
  'sobre': 'about',
  'premium': 'premium',
};

/**
 * Gets current route info from window.location.pathname
 */
export const getRouteFromUrl = () => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return { type: 'tab', value: 'today', teamParam: null, isTodayOnly: false };
  }

  const pathname = window.location.pathname || '';
  const cleanPath = decodeURIComponent(pathname.replace(/^\/+|\/+$/g, '')).trim();
  const lowerPath = cleanPath.toLowerCase();

  if (KNOWN_TAB_ROUTES.hasOwnProperty(lowerPath)) {
    return {
      type: 'tab',
      value: KNOWN_TAB_ROUTES[lowerPath],
      teamParam: null,
      isTodayOnly: false,
    };
  }

  // Check if route ends with /hoje or /today (e.g. "criciuma/hoje" or "CRICIÚMA/hoje")
  if (lowerPath.endsWith('/hoje') || lowerPath.endsWith('/today')) {
    const teamPart = cleanPath.replace(/\/(hoje|today)$/i, '').trim();
    return {
      type: 'team_today',
      value: 'today',
      teamParam: teamPart,
      isTodayOnly: true,
    };
  }

  // If not a static tab, it's a full team schedule route!
  return {
    type: 'team',
    value: 'today',
    teamParam: cleanPath,
    isTodayOnly: false,
  };
};

/**
 * Updates browser URL and document title without page reload
 */
export const updateBrowserUrl = (path, title) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.history) {
    const formattedPath = path ? (path.startsWith('/') ? path : '/' + path) : '/';
    if (window.location.pathname !== formattedPath) {
      window.history.pushState({}, title || '', formattedPath);
    }
    if (title && typeof document !== 'undefined') {
      document.title = title;
    }
  }
};
