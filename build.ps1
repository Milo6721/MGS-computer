# Składa src\*.js i src\*.html w pliki:
#   mac-w-przegladarce.html  - wersja do opublikowania jako artefakt claude.ai
#   index.html               - samodzielna strona do wrzucenia na własny hosting (z logo.png obok)
$u = New-Object System.Text.UTF8Encoding($false)
$order = 'b2-logos.js','c-core.js','d-os.js','e-apps1.js','f-term.js','g-apps2.js','h-store.js','i-init.js'
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

"Zbudowano mac-w-przegladarce.html oraz index.html"
