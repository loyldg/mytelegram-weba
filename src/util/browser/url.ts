import { onFullyIdle } from '../../lib/teact/heavyAnimation';

import { DEBUG } from '../../config';
import convertPunycode from '../../lib/punycode';

const PROTOCOL_WHITELIST = new Set(['http:', 'https:', 'tg:', 'ton:', 'mailto:', 'tel:']);
const FALLBACK_PREFIX = 'https://';
const PROTOCOL_PREFIX_PATTERN = /^[a-z][a-z\d+.-]*:/i;
const VALID_URI_ESCAPE_SEQUENCE_PATTERN = /(%[\da-f]{2})/gi;
const DOMAIN_SEPARATOR_PATTERN = /[.\u3002\uff0e\uff61]|%2e|%e3%80%82|%ef%bc%8e|%ef%bd%a1/i;
const DEFAULT_IGNORABLE_PATTERN = /\p{Default_Ignorable_Code_Point}/u;
const LETTER_OR_MARK_SOURCE = String.raw`[\p{L}\p{M}]`;
const SCRIPT_NEUTRAL_SOURCE = String.raw`[\p{Script_Extensions=Common}\p{Script_Extensions=Inherited}]`;

// `Script_Extensions` requires a concrete script value, so the current Unicode script set is enumerated
const SCRIPT_NAMES = [
  'Latin', 'Cyrillic', 'Greek', 'Armenian', 'Hebrew', 'Arabic',
  'Han', 'Hiragana', 'Katakana', 'Hangul', 'Bopomofo',
  'Adlam', 'Ahom', 'Anatolian_Hieroglyphs', 'Avestan', 'Balinese', 'Bamum',
  'Bassa_Vah', 'Batak', 'Bengali', 'Beria_Erfe', 'Bhaiksuki', 'Brahmi', 'Braille',
  'Buginese', 'Buhid', 'Canadian_Aboriginal', 'Carian', 'Caucasian_Albanian', 'Chakma', 'Cham',
  'Cherokee', 'Chorasmian', 'Coptic', 'Cuneiform', 'Cypriot', 'Cypro_Minoan', 'Deseret',
  'Devanagari', 'Dives_Akuru', 'Dogra', 'Duployan', 'Egyptian_Hieroglyphs', 'Elbasan', 'Elymaic',
  'Ethiopic', 'Garay', 'Georgian', 'Glagolitic', 'Gothic', 'Grantha', 'Gujarati', 'Gunjala_Gondi',
  'Gurmukhi', 'Gurung_Khema', 'Hanifi_Rohingya', 'Hanunoo', 'Hatran', 'Imperial_Aramaic',
  'Inscriptional_Pahlavi', 'Inscriptional_Parthian', 'Javanese', 'Kaithi', 'Kannada', 'Kawi', 'Kayah_Li',
  'Kharoshthi', 'Khitan_Small_Script', 'Khmer', 'Khojki', 'Khudawadi', 'Kirat_Rai', 'Lao', 'Lepcha',
  'Limbu', 'Linear_A', 'Linear_B', 'Lisu', 'Lycian',
  'Lydian', 'Mahajani', 'Makasar', 'Malayalam', 'Mandaic', 'Manichaean', 'Marchen', 'Masaram_Gondi',
  'Medefaidrin', 'Meetei_Mayek', 'Mende_Kikakui', 'Meroitic_Cursive', 'Meroitic_Hieroglyphs', 'Miao',
  'Modi', 'Mongolian', 'Mro', 'Multani', 'Myanmar', 'Nabataean', 'Nag_Mundari', 'Nandinagari',
  'New_Tai_Lue', 'Newa', 'Nko', 'Nushu', 'Nyiakeng_Puachue_Hmong', 'Ogham', 'Ol_Chiki', 'Ol_Onal',
  'Old_Hungarian', 'Old_Italic', 'Old_North_Arabian', 'Old_Permic', 'Old_Persian', 'Old_Sogdian',
  'Old_South_Arabian', 'Old_Turkic', 'Old_Uyghur', 'Oriya', 'Osage', 'Osmanya', 'Pahawh_Hmong',
  'Palmyrene', 'Pau_Cin_Hau', 'Phags_Pa', 'Phoenician', 'Psalter_Pahlavi', 'Rejang', 'Runic', 'Samaritan',
  'Saurashtra', 'Sharada', 'Shavian', 'Siddham', 'Sidetic', 'SignWriting', 'Sinhala', 'Sogdian',
  'Sora_Sompeng', 'Soyombo', 'Sundanese', 'Sunuwar', 'Syloti_Nagri', 'Syriac', 'Tagalog', 'Tagbanwa',
  'Tai_Le', 'Tai_Tham', 'Tai_Viet', 'Tai_Yo', 'Takri', 'Tamil', 'Tangsa', 'Tangut', 'Telugu', 'Thaana',
  'Thai', 'Tibetan', 'Tifinagh', 'Tirhuta', 'Todhri', 'Tolong_Siki', 'Toto', 'Tulu_Tigalari', 'Ugaritic',
  'Vai', 'Vithkuqi', 'Wancho', 'Warang_Citi', 'Yezidi', 'Yi', 'Zanabazar_Square',
] as const;

type Script = typeof SCRIPT_NAMES[number];
type ScriptPattern = {
  character: RegExp;
  incompatibleCharacter: RegExp;
};
type ScriptPatternCache = {
  scripts: ScriptPattern[];
  allowedCombinations: RegExp[];
};

let scriptPatternCache: ScriptPatternCache | undefined;

if (typeof self !== 'undefined') {
  onFullyIdle(initializeScriptPatternCache);
}

function normalizeProtocol(protocol: string) {
  return protocol.replace(/:$/, '').trim().toLowerCase();
}

export function ensureProtocol(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (!PROTOCOL_WHITELIST.has(parsedUrl.protocol)) {
      return `${FALLBACK_PREFIX}${url}`;
    }

    return url;
  } catch (err) {
    return `${FALLBACK_PREFIX}${url}`;
  }
}

export function formatLinkUrl(url: string) {
  return ensureProtocol(url)
    .split(VALID_URI_ESCAPE_SEQUENCE_PATTERN)
    .map((part, index) => index % 2 ? part : encodeURI(part))
    .join('');
}

export function getUnicodeUrl(url: string) {
  const href = ensureProtocol(url);

  try {
    const parsedUrl = new URL(href);
    const unicodeDomain = convertPunycode(parsedUrl.hostname);

    try {
      return decodeURI(parsedUrl.toString()).replace(parsedUrl.hostname, unicodeDomain);
    } catch (err) { // URL contains invalid sequences, keep it as it is
      return parsedUrl.toString().replace(parsedUrl.hostname, unicodeDomain);
    }
  } catch (error) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('SafeLink.getDecodedUrl error ', url, error);
    }
  }

  return undefined;
}

export function isSuspiciousUrl(url: string): boolean {
  const protocol = url.match(PROTOCOL_PREFIX_PATTERN)?.[0].toLowerCase();
  const urlToParse = protocol && PROTOCOL_WHITELIST.has(protocol) ? url : ensureProtocol(url);

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlToParse);
  } catch (err) {
    return true;
  }

  if (hasSuspiciousUrlCredentials(parsedUrl)) {
    return true;
  }

  let domain: string;
  try {
    domain = convertPunycode(parsedUrl.hostname);
  } catch (err) {
    return true;
  }

  return domain.split('.').some(isSuspiciousDomainLabel);
}

export function hasSuspiciousUrlCredentials({ username, password }: URL) {
  // Include encoded and Unicode domain separators that can disguise credentials as a hostname
  return DOMAIN_SEPARATOR_PATTERN.test(username) || DOMAIN_SEPARATOR_PATTERN.test(password);
}

export function getSuspiciousDomainCharacters(label: string) {
  const characters = Array.from(label);
  const suspiciousCharacters = new Set(characters.filter((character) => DEFAULT_IGNORABLE_PATTERN.test(character)));
  if (!isLabelMixedScript(label)) return suspiciousCharacters;

  const { scripts, allowedCombinations } = scriptPatternCache!;
  const patterns = scripts.map(({ incompatibleCharacter }) => incompatibleCharacter).concat(allowedCombinations);
  let fewestIncompatibleCharacters = characters.length;
  let closestPatterns: RegExp[] = [];

  // Highlight characters outside the best-fitting writing system, including supported CJK combinations
  for (const pattern of patterns) {
    const count = characters.filter((character) => pattern.test(character)).length;
    if (count < fewestIncompatibleCharacters) {
      fewestIncompatibleCharacters = count;
      closestPatterns = [pattern];
    } else if (count === fewestIncompatibleCharacters) {
      closestPatterns.push(pattern);
    }
  }

  for (const character of characters) {
    // A tie leaves all characters that disagree with any equally likely writing system highlighted
    if (closestPatterns.some((pattern) => pattern.test(character))) {
      suspiciousCharacters.add(character);
    }
  }

  return suspiciousCharacters;
}

function isSuspiciousDomainLabel(label: string) {
  return DEFAULT_IGNORABLE_PATTERN.test(label) || isLabelMixedScript(label);
}

function isLabelMixedScript(label: string) {
  initializeScriptPatternCache();
  const { scripts, allowedCombinations } = scriptPatternCache!;

  if (scripts.some(({ incompatibleCharacter: pattern }) => !pattern.test(label))) {
    return false;
  }

  if (allowedCombinations.some((pattern) => !pattern.test(label))) {
    return false;
  }

  return scripts.some(({ character: pattern }) => pattern.test(label));
}

function initializeScriptPatternCache() {
  if (scriptPatternCache) return;

  scriptPatternCache = {
    scripts: buildScriptPatterns(),
    allowedCombinations: [
      buildIncompatibleScriptPattern(['Han', 'Hiragana', 'Katakana']),
      buildIncompatibleScriptPattern(['Han', 'Hangul']),
      buildIncompatibleScriptPattern(['Han', 'Bopomofo']),
    ],
  };
}

function buildScriptPatterns(): ScriptPattern[] {
  const patterns: ScriptPattern[] = [];

  for (const script of SCRIPT_NAMES) {
    try {
      const characterPattern = new RegExp(`\\p{Script_Extensions=${script}}`, 'u');
      patterns.push({
        character: characterPattern,
        incompatibleCharacter: buildIncompatibleScriptPattern([script]),
      });
    } catch (err) {
      // Unicode revisions expose different script names across browser versions
    }
  }

  return patterns;
}

function buildIncompatibleScriptPattern(scripts: readonly Script[]) {
  const scriptSource = scripts.map((script) => `\\p{Script_Extensions=${script}}`).join('|');

  // The unanchored lookaheads find any significant character outside the compatible scripts
  return new RegExp(`(?=${LETTER_OR_MARK_SOURCE})(?!${SCRIPT_NEUTRAL_SOURCE})(?!${scriptSource})`, 'u');
}

export function isValidProtocol(url: string, allowedProtocols: string[]) {
  if (typeof url !== 'string') {
    return false;
  }

  try {
    const parsedUrl = new URL(url);

    return allowedProtocols.includes(normalizeProtocol(parsedUrl.protocol));
  } catch (err) {
    return false;
  }
}
