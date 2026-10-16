# Składa src\*.js i src\*.html w pliki:
#   mac-w-przegladarce.html  - wersja do opublikowania jako artefakt claude.ai
#   index.html               - samodzielna strona do wrzucenia na własny hosting (z plikami obok)
# Dodatkowo skanuje folder w poszukiwaniu plików audio i zapisuje ich listę do src\b3-songs.js (aplikacja Muzyka).
$u = New-Object System.Text.UTF8Encoding($false)

$exts = '.m4a','.mp3','.ogg','.wav','.flac','.aac'
$songs = @()
foreach ($dir in @($PSScriptRoot, "$PSScriptRoot\music")) {
  if (Test-Path $dir) {
    Get-ChildItem -LiteralPath $dir -File | Where-Object { $exts -contains $_.Extension.ToLower() } | ForEach-Object {
      $rel = if ($dir -eq $PSScriptRoot) { $_.Name } else { "music/" + $_.Name }
      $songs += [pscustomobject]@{ name = [IO.Path]::GetFileNameWithoutExtension($_.Name); file = $rel }
    }
  }
}
$json = if ($songs.Count -eq 0) { '[]' } elseif ($songs.Count -eq 1) { '[' + ($songs[0] | ConvertTo-Json -Compress) + ']' } else { $songs | ConvertTo-Json -Compress }
[IO.File]::WriteAllText("$PSScriptRoot\src\b3-songs.js", "const SONGS=$json;`n", $u)

$order = 'b2-logos.js','b3-songs.js','c-core.js','d-os.js','e-apps1.js','f-term.js','g-apps2.js','h-store.js','j-miri.js','i-init.js'
$head = [IO.File]::ReadAllText("$PSScriptRoot\src\a-head.html", $u)
$body = [IO.File]::ReadAllText("$PSScriptRoot\src\b-body.html", $u)
$js = ($order | ForEach-Object { [IO.File]::ReadAllText("$PSScriptRoot\src\$_", $u).TrimStart([char]0xFEFF) }) -join "`n"

[IO.File]::WriteAllText("$PSScriptRoot\mac-w-przegladarce.html", $head + $body + "<script>`n" + $js + "`n</script>`n", $u)

# Dokument kompletny: doctype, kodowanie, viewport i zerowy margines (artefakt dodaje to sam)
$page  = "<!doctype html>`n<html lang=`"pl`">`n<head>`n<meta charset=`"utf-8`">`n"
$page += "<meta name=`"viewport`" content=`"width=device-width,initial-scale=1,viewport-fit=cover`">`n"
$page += "<style>:root{color-scheme:light}body{margin:0}</style>`n"
$page += $head + "</head>`n<body>`n" + $body + "<script>`n" + $js + "`n</script>`n</body>`n</html>`n"
[IO.File]::WriteAllText("$PSScriptRoot\index.html", $page, $u)

"Zbudowano mac-w-przegladarce.html oraz index.html (utwory z plików: $($songs.Count))"
