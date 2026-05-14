const BOOK_ABBR: Record<string, string> = {
  "Gen": "genesis", "Ex": "exodus", "Exod": "exodus", "Lev": "leviticus",
  "Num": "numbers", "Deut": "deuteronomy", "Josh": "joshua", "Judg": "judges",
  "Ruth": "ruth", "1 Sam": "1 samuel", "2 Sam": "2 samuel",
  "1 Kings": "1 kings", "2 Kings": "2 kings",
  "1 Chr": "1 chronicles", "2 Chr": "2 chronicles",
  "Ezra": "ezra", "Neh": "nehemiah", "Esth": "esther", "Job": "job",
  "Ps": "psalms", "Prov": "proverbs", "Eccl": "ecclesiastes",
  "Song": "song of solomon", "Isa": "isaiah", "Jer": "jeremiah",
  "Lam": "lamentations", "Ezek": "ezekiel", "Dan": "daniel",
  "Hos": "hosea", "Joel": "joel", "Amos": "amos", "Obad": "obadiah",
  "Jonah": "jonah", "Mic": "micah", "Nah": "nahum", "Hab": "habakkuk",
  "Zeph": "zephaniah", "Hag": "haggai", "Zech": "zechariah", "Mal": "malachi",
  "Matt": "matthew", "Mark": "mark", "Luke": "luke", "John": "john",
  "Acts": "acts", "Rom": "romans",
  "1 Cor": "1 corinthians", "2 Cor": "2 corinthians",
  "Gal": "galatians", "Eph": "ephesians", "Phil": "philippians",
  "Col": "colossians", "1 Thess": "1 thessalonians", "2 Thess": "2 thessalonians",
  "1 Tim": "1 timothy", "2 Tim": "2 timothy", "Titus": "titus",
  "Philem": "philemon", "Heb": "hebrews", "James": "james",
  "1 Pet": "1 peter", "2 Pet": "2 peter",
  "1 John": "1 john", "2 John": "2 john", "3 John": "3 john",
  "Jude": "jude", "Rev": "revelation",
};

function parseRef(ref: string): string | null {
  // Normalize en-dashes to hyphens, remove trailing periods
  const normalized = ref.replace(/–/g, "-").replace(/\.$/, "");

  // Split into book + address parts
  // Handles: "Rom. 8:35-39", "1 Cor. 6:19-20", "Matt. 10:29"
  const match = normalized.match(/^(\d?\s?[A-Za-z]+\.?)\s+(\d+:\d+(?:-\d+)?)$/);
  if (!match) return null;

  const abbr = match[1].replace(/\.$/, "").trim();
  const address = match[2];

  const fullBook = BOOK_ABBR[abbr];
  if (!fullBook) return null;

  return `${fullBook}+${address}`;
}

export interface VerseResult {
  reference: string;
  text: string;
  translation: string;
}

const CACHE_PREFIX = "gf_verse_";

export async function fetchVerse(ref: string): Promise<VerseResult> {
  const cacheKey = CACHE_PREFIX + ref;

  // Check localStorage cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as VerseResult;
    }
  } catch {
    // localStorage unavailable
  }

  const query = parseRef(ref);
  if (!query) {
    throw new Error(`Could not parse reference: ${ref}`);
  }

  const url = `https://bible-api.com/${query}?translation=web`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

  const data = await res.json();

  // bible-api.com returns { reference, text, translation_name, verses }
  const result: VerseResult = {
    reference: data.reference as string,
    text: (data.text as string).trim(),
    translation: (data.translation_name as string) ?? "WEB",
  };

  try {
    localStorage.setItem(cacheKey, JSON.stringify(result));
  } catch {
    // Cache write failed silently
  }

  return result;
}
