/* Miri AI: funkcja serwerowa Vercel.
   Klucz Anthropic jest tylko w zmiennej środowiskowej ANTHROPIC_API_KEY (Vercel -> Settings -> Environment Variables).
   Strona nigdy nie widzi klucza, wysyła tylko rozmowę na /api/miri. */
const Anthropic = require('@anthropic-ai/sdk');

const MODEL = () => process.env.MIRI_MODEL || 'claude-opus-5-5';
const MAX_MESSAGES = 20;
const MAX_CHARS = 4000;
const LIMIT_PER_MINUTE = 20;
const hits = new Map(); /* prosty limit na adres IP (w obrębie jednej instancji funkcji) */

const BASE =
  'Jesteś Miri, asystentką głosową systemu MGS Computer, działającego w przeglądarce. ' +
  'Odpowiadasz po polsku, chyba że użytkownik pisze w innym języku. ' +
  'Twoje odpowiedzi są czytane na głos, więc pisz zwykłym tekstem: bez markdownu, list z gwiazdkami, tabel i emoji. ' +
  'Masz lokalne umiejętności obsługiwane przez system (otwieranie aplikacji, godzina, minutnik, muzyka, tryb ciemny, notatki), ' +
  'więc nie udawaj, że wykonałaś czynność na komputerze, jeśli o nią nie poproszono wprost. ' +
  'Gdy czegoś nie wiesz, powiedz to krótko.';

const STYLES = {
  friendly: 'Styl: przyjazny i naturalny. Odpowiadaj w 1 do 3 krótkich zdaniach.',
  concise: 'Styl: maksymalnie zwięzły. Jedno krótkie zdanie, bez wstępów.',
  formal: 'Styl: formalny i grzeczny, ale nadal krótki. Zwracaj się do użytkownika per Pan/Pani.',
  funny: 'Styl: lekki, żartobliwy, z odrobiną humoru, ale bez przesady. Krótko.',
  teacher: 'Styl: cierpliwy nauczyciel. Tłumacz prosto, krok po kroku, ale zwięźle.',
};

function tooMany(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 500) for (const [k, v] of hits) if (!v.some((t) => now - t < 60000)) hits.delete(k);
  return list.length > LIMIT_PER_MINUTE;
}

function cleanMessages(input) {
  const out = [];
  for (const m of (Array.isArray(input) ? input : []).slice(-MAX_MESSAGES)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') continue;
    const text = m.content.trim().slice(0, MAX_CHARS);
    if (!text) continue;
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += '\n' + text;
    else out.push({ role: m.role, content: text });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') return res.status(405).json({ error: 'Użyj metody POST.' });

  const allowed = process.env.MIRI_ALLOWED_ORIGIN; /* opcjonalnie, np. https://moja-strona.vercel.app */
  if (allowed && req.headers.origin && req.headers.origin !== allowed) {
    return res.status(403).json({ error: 'Niedozwolone źródło żądania.' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Brak ANTHROPIC_API_KEY w zmiennych środowiskowych Vercel.' });
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim();
  if (tooMany(ip)) return res.status(429).json({ error: 'Za dużo pytań naraz. Spróbuj za chwilę.' });

  const body = typeof req.body === 'string' ? safeJson(req.body) : req.body || {};
  const messages = cleanMessages(body.messages);
  if (!messages.length) return res.status(400).json({ error: 'Brak wiadomości od użytkownika.' });

  const style = STYLES[body.style] ? body.style : 'friendly';
  const custom = typeof body.custom === 'string' ? body.custom.trim().slice(0, 500) : '';
  const system = [BASE, STYLES[style], custom && 'Dodatkowe wskazówki użytkownika (stosuj, o ile nie łamią zasad powyżej): ' + custom]
    .filter(Boolean)
    .join('\n');

  const client = new Anthropic(); /* klucz z ANTHROPIC_API_KEY */
  const params = {
    model: MODEL(),
    max_tokens: 700,
    system,
    messages,
    output_config: { effort: 'low' } /* szybkie odpowiedzi do rozmowy głosowej */,
  };

  try {
    let response;
    try {
      /* Refusal fallback po stronie serwera: gdy model odmówi, kontynuuje model zapasowy. */
      response = await client.beta.messages.create({
        ...params,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      });
    } catch (err) {
      if (process.env.MIRI_FALLBACK === 'off' || err instanceof Anthropic.BadRequestError) {
        response = await client.messages.create(params); /* wariant bez fallbacków (np. inny model) */
      } else {
        throw err;
      }
    }

    if (response.stop_reason === 'refusal') {
      return res.status(200).json({ text: 'Przepraszam, w tym nie mogę pomóc.' });
    }
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    return res.status(200).json({ text: text || 'Nie mam nic do dodania.' });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error('Miri: nieprawidłowy klucz API');
      return res.status(500).json({ error: 'Klucz ANTHROPIC_API_KEY jest nieprawidłowy.' });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Limit zapytań do AI został chwilowo wyczerpany.' });
    }
    console.error('Miri: błąd API', err && err.status, err && err.message);
    return res.status(502).json({ error: 'AI nie odpowiada. Spróbuj ponownie za chwilę.' });
  }
};

function safeJson(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return {};
  }
}
