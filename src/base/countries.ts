/* ─────────────────────────────────────────────────────────
 * COUNTRIES — ISO 3166-1 alpha-2, English name, E.164 dial
 * code, and an optional national grouping pattern.
 *
 * Flags are NOT shipped as assets: an alpha-2 code maps
 * directly onto Unicode regional indicator symbols, so the
 * emoji is computed. That keeps the dataset to plain text and
 * means no icon set to keep in sync.
 *
 * `pattern` groups the national number for readability only —
 * digits per group, e.g. [3,3,4] renders 415 555 2671. It is
 * presentation, never validation: real numbering plans have
 * variable lengths, and a component that refuses a valid
 * number is worse than one that formats it loosely.
 * ponytail: grouping only. If you need true parsing and
 * validation, that is libphonenumber's job, not this file's.
 * ───────────────────────────────────────────────────────── */

export interface Country {
  /** ISO 3166-1 alpha-2. */
  iso: string;
  name: string;
  /** Dial code without the plus. */
  dial: string;
  /** Digit grouping for display. */
  pattern?: number[];
}

/* [iso, name, dial, pattern?] */
type Row = [string, string, string, number[]?];

const ROWS: Row[] = [
  ["AD", "Andorra", "376"],
  ["AE", "United Arab Emirates", "971", [2, 3, 4]],
  ["AF", "Afghanistan", "93"],
  ["AG", "Antigua and Barbuda", "1268"],
  ["AI", "Anguilla", "1264"],
  ["AL", "Albania", "355"],
  ["AM", "Armenia", "374"],
  ["AO", "Angola", "244"],
  ["AR", "Argentina", "54"],
  ["AS", "American Samoa", "1684"],
  ["AT", "Austria", "43"],
  ["AU", "Australia", "61", [3, 3, 3]],
  ["AW", "Aruba", "297"],
  ["AX", "Åland Islands", "358"],
  ["AZ", "Azerbaijan", "994"],
  ["BA", "Bosnia and Herzegovina", "387"],
  ["BB", "Barbados", "1246"],
  ["BD", "Bangladesh", "880"],
  ["BE", "Belgium", "32"],
  ["BF", "Burkina Faso", "226"],
  ["BG", "Bulgaria", "359"],
  ["BH", "Bahrain", "973"],
  ["BI", "Burundi", "257"],
  ["BJ", "Benin", "229"],
  ["BL", "Saint Barthélemy", "590"],
  ["BM", "Bermuda", "1441"],
  ["BN", "Brunei", "673"],
  ["BO", "Bolivia", "591"],
  ["BQ", "Caribbean Netherlands", "599"],
  ["BR", "Brazil", "55", [2, 5, 4]],
  ["BS", "Bahamas", "1242"],
  ["BT", "Bhutan", "975"],
  ["BW", "Botswana", "267"],
  ["BY", "Belarus", "375"],
  ["BZ", "Belize", "501"],
  ["CA", "Canada", "1", [3, 3, 4]],
  ["CD", "DR Congo", "243"],
  ["CF", "Central African Republic", "236"],
  ["CG", "Republic of the Congo", "242"],
  ["CH", "Switzerland", "41", [2, 3, 2, 2]],
  ["CI", "Côte d'Ivoire", "225"],
  ["CK", "Cook Islands", "682"],
  ["CL", "Chile", "56"],
  ["CM", "Cameroon", "237"],
  ["CN", "China", "86", [3, 4, 4]],
  ["CO", "Colombia", "57", [3, 3, 4]],
  ["CR", "Costa Rica", "506", [4, 4]],
  ["CU", "Cuba", "53"],
  ["CV", "Cape Verde", "238"],
  ["CW", "Curaçao", "599"],
  ["CY", "Cyprus", "357"],
  ["CZ", "Czechia", "420", [3, 3, 3]],
  ["DE", "Germany", "49", [4, 7]],
  ["DJ", "Djibouti", "253"],
  ["DK", "Denmark", "45", [2, 2, 2, 2]],
  ["DM", "Dominica", "1767"],
  ["DO", "Dominican Republic", "1809"],
  ["DZ", "Algeria", "213"],
  ["EC", "Ecuador", "593"],
  ["EE", "Estonia", "372"],
  ["EG", "Egypt", "20", [3, 4, 4]],
  ["ER", "Eritrea", "291"],
  ["ES", "Spain", "34", [3, 3, 3]],
  ["ET", "Ethiopia", "251"],
  ["FI", "Finland", "358"],
  ["FJ", "Fiji", "679"],
  ["FK", "Falkland Islands", "500"],
  ["FM", "Micronesia", "691"],
  ["FO", "Faroe Islands", "298"],
  ["FR", "France", "33", [1, 2, 2, 2, 2]],
  ["GA", "Gabon", "241"],
  ["GB", "United Kingdom", "44", [4, 6]],
  ["GD", "Grenada", "1473"],
  ["GE", "Georgia", "995"],
  ["GF", "French Guiana", "594"],
  ["GG", "Guernsey", "44"],
  ["GH", "Ghana", "233"],
  ["GI", "Gibraltar", "350"],
  ["GL", "Greenland", "299"],
  ["GM", "Gambia", "220"],
  ["GN", "Guinea", "224"],
  ["GP", "Guadeloupe", "590"],
  ["GQ", "Equatorial Guinea", "240"],
  ["GR", "Greece", "30", [3, 3, 4]],
  ["GT", "Guatemala", "502", [4, 4]],
  ["GU", "Guam", "1671"],
  ["GW", "Guinea-Bissau", "245"],
  ["GY", "Guyana", "592"],
  ["HK", "Hong Kong", "852", [4, 4]],
  ["HN", "Honduras", "504"],
  ["HR", "Croatia", "385"],
  ["HT", "Haiti", "509"],
  ["HU", "Hungary", "36"],
  ["ID", "Indonesia", "62", [3, 4, 4]],
  ["IE", "Ireland", "353", [2, 3, 4]],
  ["IL", "Israel", "972", [2, 3, 4]],
  ["IM", "Isle of Man", "44"],
  ["IN", "India", "91", [5, 5]],
  ["IQ", "Iraq", "964"],
  ["IR", "Iran", "98"],
  ["IS", "Iceland", "354", [3, 4]],
  ["IT", "Italy", "39", [3, 3, 4]],
  ["JE", "Jersey", "44"],
  ["JM", "Jamaica", "1876"],
  ["JO", "Jordan", "962"],
  ["JP", "Japan", "81", [2, 4, 4]],
  ["KE", "Kenya", "254"],
  ["KG", "Kyrgyzstan", "996"],
  ["KH", "Cambodia", "855"],
  ["KI", "Kiribati", "686"],
  ["KM", "Comoros", "269"],
  ["KN", "Saint Kitts and Nevis", "1869"],
  ["KP", "North Korea", "850"],
  ["KR", "South Korea", "82", [2, 4, 4]],
  ["KW", "Kuwait", "965"],
  ["KY", "Cayman Islands", "1345"],
  ["KZ", "Kazakhstan", "7"],
  ["LA", "Laos", "856"],
  ["LB", "Lebanon", "961"],
  ["LC", "Saint Lucia", "1758"],
  ["LI", "Liechtenstein", "423"],
  ["LK", "Sri Lanka", "94"],
  ["LR", "Liberia", "231"],
  ["LS", "Lesotho", "266"],
  ["LT", "Lithuania", "370"],
  ["LU", "Luxembourg", "352"],
  ["LV", "Latvia", "371"],
  ["LY", "Libya", "218"],
  ["MA", "Morocco", "212"],
  ["MC", "Monaco", "377"],
  ["MD", "Moldova", "373"],
  ["ME", "Montenegro", "382"],
  ["MF", "Saint Martin", "590"],
  ["MG", "Madagascar", "261"],
  ["MH", "Marshall Islands", "692"],
  ["MK", "North Macedonia", "389"],
  ["ML", "Mali", "223"],
  ["MM", "Myanmar", "95"],
  ["MN", "Mongolia", "976"],
  ["MO", "Macao", "853"],
  ["MP", "Northern Mariana Islands", "1670"],
  ["MQ", "Martinique", "596"],
  ["MR", "Mauritania", "222"],
  ["MS", "Montserrat", "1664"],
  ["MT", "Malta", "356"],
  ["MU", "Mauritius", "230"],
  ["MV", "Maldives", "960"],
  ["MW", "Malawi", "265"],
  ["MX", "Mexico", "52", [3, 3, 4]],
  ["MY", "Malaysia", "60", [2, 3, 4]],
  ["MZ", "Mozambique", "258"],
  ["NA", "Namibia", "264"],
  ["NC", "New Caledonia", "687"],
  ["NE", "Niger", "227"],
  ["NG", "Nigeria", "234", [3, 3, 4]],
  ["NI", "Nicaragua", "505"],
  ["NL", "Netherlands", "31", [1, 8]],
  ["NO", "Norway", "47", [3, 2, 3]],
  ["NP", "Nepal", "977"],
  ["NR", "Nauru", "674"],
  ["NU", "Niue", "683"],
  ["NZ", "New Zealand", "64", [2, 3, 4]],
  ["OM", "Oman", "968"],
  ["PA", "Panama", "507"],
  ["PE", "Peru", "51"],
  ["PF", "French Polynesia", "689"],
  ["PG", "Papua New Guinea", "675"],
  ["PH", "Philippines", "63", [3, 3, 4]],
  ["PK", "Pakistan", "92", [3, 7]],
  ["PL", "Poland", "48", [3, 3, 3]],
  ["PM", "Saint Pierre and Miquelon", "508"],
  ["PR", "Puerto Rico", "1787"],
  ["PS", "Palestine", "970"],
  ["PT", "Portugal", "351", [3, 3, 3]],
  ["PW", "Palau", "680"],
  ["PY", "Paraguay", "595"],
  ["QA", "Qatar", "974"],
  ["RE", "Réunion", "262"],
  ["RO", "Romania", "40", [3, 3, 3]],
  ["RS", "Serbia", "381"],
  ["RU", "Russia", "7", [3, 3, 2, 2]],
  ["RW", "Rwanda", "250"],
  ["SA", "Saudi Arabia", "966", [2, 3, 4]],
  ["SB", "Solomon Islands", "677"],
  ["SC", "Seychelles", "248"],
  ["SD", "Sudan", "249"],
  ["SE", "Sweden", "46", [2, 3, 2, 2]],
  ["SG", "Singapore", "65", [4, 4]],
  ["SI", "Slovenia", "386"],
  ["SK", "Slovakia", "421"],
  ["SL", "Sierra Leone", "232"],
  ["SM", "San Marino", "378"],
  ["SN", "Senegal", "221"],
  ["SO", "Somalia", "252"],
  ["SR", "Suriname", "597"],
  ["SS", "South Sudan", "211"],
  ["ST", "São Tomé and Príncipe", "239"],
  ["SV", "El Salvador", "503", [4, 4]],
  ["SX", "Sint Maarten", "1721"],
  ["SY", "Syria", "963"],
  ["SZ", "Eswatini", "268"],
  ["TC", "Turks and Caicos Islands", "1649"],
  ["TD", "Chad", "235"],
  ["TG", "Togo", "228"],
  ["TH", "Thailand", "66", [2, 3, 4]],
  ["TJ", "Tajikistan", "992"],
  ["TL", "Timor-Leste", "670"],
  ["TM", "Turkmenistan", "993"],
  ["TN", "Tunisia", "216"],
  ["TO", "Tonga", "676"],
  ["TR", "Türkiye", "90", [3, 3, 4]],
  ["TT", "Trinidad and Tobago", "1868"],
  ["TV", "Tuvalu", "688"],
  ["TW", "Taiwan", "886", [3, 3, 3]],
  ["TZ", "Tanzania", "255"],
  ["UA", "Ukraine", "380", [2, 3, 4]],
  ["UG", "Uganda", "256"],
  ["US", "United States", "1", [3, 3, 4]],
  ["UY", "Uruguay", "598"],
  ["UZ", "Uzbekistan", "998"],
  ["VA", "Vatican City", "39"],
  ["VC", "Saint Vincent and the Grenadines", "1784"],
  ["VE", "Venezuela", "58"],
  ["VG", "British Virgin Islands", "1284"],
  ["VI", "U.S. Virgin Islands", "1340"],
  ["VN", "Vietnam", "84", [3, 4, 3]],
  ["VU", "Vanuatu", "678"],
  ["WF", "Wallis and Futuna", "681"],
  ["WS", "Samoa", "685"],
  ["XK", "Kosovo", "383"],
  ["YE", "Yemen", "967"],
  ["YT", "Mayotte", "262"],
  ["ZA", "South Africa", "27", [2, 3, 4]],
  ["ZM", "Zambia", "260"],
  ["ZW", "Zimbabwe", "263"],
];

export const COUNTRIES: Country[] = ROWS.map(([iso, name, dial, pattern]) => ({
  iso,
  name,
  dial,
  pattern,
}));

const BY_ISO = new Map(COUNTRIES.map((country) => [country.iso, country]));

export const countryByIso = (iso: string) => BY_ISO.get(iso.toUpperCase());

/* alpha-2 → regional indicator pair, e.g. "ID" → 🇮🇩 */
export function countryFlag(iso: string) {
  const code = iso.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((char) => 0x1f1e6 + char.charCodeAt(0) - 65));
}

/* Some dial codes are shared and CANNOT be resolved from the
   number alone: +1 is both US and Canada, +7 both Russia and
   Kazakhstan, +44 the UK and three Crown Dependencies. One
   country per code is declared the default so the result is at
   least deterministic; the user can always override it in the
   picker, and a wrong-but-stable flag beats an arbitrary one. */
const PRIMARY = new Set([
  "US", // +1   over CA
  "RU", // +7   over KZ
  "IT", // +39  over VA
  "GB", // +44  over GG, IM, JE
  "NO", // +47
  "FI", // +358 over AX
  "GP", // +590 over BL, MF
  "CW", // +599 over BQ
  "RE", // +262 over YT
]);

/* Longest dial code wins so +1 does not swallow +1264. */
export function countryFromE164(value: string) {
  const digits = value.replace(/\D/g, "");
  let best: Country | undefined;
  for (const country of COUNTRIES) {
    if (!digits.startsWith(country.dial)) continue;
    if (!best || country.dial.length > best.dial.length) {
      best = country;
    } else if (country.dial.length === best.dial.length && PRIMARY.has(country.iso)) {
      best = country;
    }
  }
  return best;
}

/** Groups digits for display: 4155552671 + [3,3,4] → "415 555 2671". */
export function groupDigits(digits: string, pattern?: number[]) {
  if (!pattern || !digits) return digits;
  const parts: string[] = [];
  let i = 0;
  for (const size of pattern) {
    if (i >= digits.length) break;
    parts.push(digits.slice(i, i + size));
    i += size;
  }
  /* anything past the pattern stays attached rather than dropped */
  if (i < digits.length) parts.push(digits.slice(i));
  return parts.join(" ");
}
