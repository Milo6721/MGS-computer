# Wdrożenie MGS Computer z Miri AI na Vercel

## Co jest w folderze
- `index.html` - cała strona (budowana przez `build.ps1`)
- `api/miri.js` - funkcja serwerowa Miri AI (używa SDK Anthropic)
- `package.json` - zależność `@anthropic-ai/sdk`
- `logo.png`, `sirilogo.jpg`, `kiedyja.m4a` - Twoje pliki (logo systemu, logo Miri, piosenka)

## Kroki
1. Wrzuć cały folder do projektu na Vercel (`src`, `build.ps1` i `mac-w-przegladarce.html` są pomijane przez `.vercelignore`).
2. W Vercel wejdź w **Settings → Environment Variables** i dodaj:
   - `ANTHROPIC_API_KEY` - Twój klucz API z console.anthropic.com (zaznacz jako Sensitive). Klucz nie trafia do kodu strony.
   - opcjonalnie `MIRI_MODEL` - domyślnie `claude-opus-5-5`; taniej i szybciej: `claude-haiku-5-5`.
   - opcjonalnie `MIRI_ALLOWED_ORIGIN` - adres Twojej strony, np. `https://twoja-strona.vercel.app`, żeby nikt inny nie używał Twojego endpointu.
3. Zrób **Redeploy**, żeby zmienne zaczęły działać.
4. Otwórz stronę, kliknij ikonę Miri na górze (albo powiedz „Hey Miri”) i zadaj pytanie.

## Uwagi
- „Hey Miri” (mikrofon) działa tylko na HTTPS, w Chrome lub Edge, po zgodzie na mikrofon.
- Rozmowa wychodzi przez `/api/miri`. Bez klucza Miri nadal wykonuje polecenia lokalne (otwieranie aplikacji, godzina, minutnik, muzyka, tryb ciemny, notatki), ale nie odpowiada na pytania ogólne.
- Funkcja ma prosty limit 20 pytań na minutę na adres IP. Dla większego ruchu dodaj własną ochronę (np. Vercel Firewall).
- Po zmianach w `src` uruchom `powershell -File build.ps1`, żeby odnowić `index.html`.
