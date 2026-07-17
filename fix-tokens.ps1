$content = Get-Content -Path "tokens\tokens.css" -Raw

# Replace Satoshi with Poppins
$content = $content -replace 'Satoshi', 'Poppins'

# Light theme error
$content = $content -replace '\{color\.palette\.error\.40\}', 'hsl(354, 85%, 44%)'
$content = $content -replace '\{color\.palette\.error\.100\}', 'hsl(0, 0%, 100%)'
$content = $content -replace '\{color\.palette\.error\.80\}', 'hsl(354, 100%, 86%)'
$content = $content -replace '\{color\.palette\.error\.30\}', 'hsl(353, 62%, 30%)'

# Dark theme error (some overlap in names, but the replacement works if we do it globally based on the exact string)
$content = $content -replace '\{color\.palette\.error\.20\}', 'hsl(354, 74%, 23%)'
$content = $content -replace '\{color\.palette\.error\.90\}', 'hsl(353, 100%, 93%)'

# Neutral dark theme overrides
$content = $content -replace '\{color\.palette\.neutral\.6\}', 'hsl(180, 2%, 6%)'
$content = $content -replace '\{color\.palette\.neutral\.24\}', 'hsl(180, 1%, 24%)'
$content = $content -replace '\{color\.palette\.neutral\.4\}', 'hsl(180, 2%, 4%)'
$content = $content -replace '\{color\.palette\.neutral\.12\}', 'hsl(180, 2%, 12%)'
$content = $content -replace '\{color\.palette\.neutral\.17\}', 'hsl(180, 2%, 17%)'
$content = $content -replace '\{color\.palette\.neutral\.22\}', 'hsl(180, 2%, 22%)'

Set-Content -Path "tokens\tokens.css" -Value $content
