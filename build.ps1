# Składa src\*.js i src\*.html w jeden plik mac-w-przegladarce.html
$u = New-Object System.Text.UTF8Encoding($false)
$order = 'b2-logos.js','c-core.js','d-os.js','e-apps1.js','f-term.js','g-apps2.js','h-store.js','i-init.js'
$head = [IO.File]::ReadAllText("$PSScriptRoot\src\a-head.html", $u)
$body = [IO.File]::ReadAllText("$PSScriptRoot\src\b-body.html", $u)
$js = ($order | ForEach-Object { [IO.File]::ReadAllText("$PSScriptRoot\src\$_", $u).TrimStart([char]0xFEFF) }) -join "`n"
[IO.File]::WriteAllText("$PSScriptRoot\mac-w-przegladarce.html", $head + $body + "<script>`n" + $js + "`n</script>`n", $u)
"Zbudowano mac-w-przegladarce.html"
