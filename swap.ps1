$path = "c:\Users\HP\OneDrive\Desktop\ALWAYS-ME\Projet perso\Linefood\fichier\style.css"
$content = Get-Content -Raw $path

# Backgrounds (Navy -> Obsidian/Black)
$content = $content -replace '#07111c', '#111111'
$content = $content -replace 'rgba\(7,17,28,', 'rgba(17,17,17,'
$content = $content -replace '#0d1e2d', '#181818'
$content = $content -replace '#0a1825', '#0A0A0A'
$content = $content -replace '#040c14', '#000000'

# Golds (Muddy gold -> Premium gold)
$content = $content -replace '#c9a84c', '#D4AF37'
$content = $content -replace '#e2c97e', '#F2D77D'
$content = $content -replace 'rgba\(201,168,76,', 'rgba(212,175,55,'
$content = $content -replace '#f0ebe0', '#FDFBF7'
$content = $content -replace '#b8860b', '#AA8A2A'

# Rust -> Gold (Unifying palette)
$content = $content -replace '#a84c2a', '#D4AF37'
$content = $content -replace '#c96040', '#C19B2E'
$content = $content -replace 'rgba\(168,76,42,', 'rgba(212,175,55,'
$content = $content -replace '#bf5a32', '#AA8A2A'

# Text colors (Cream -> Crisp White/Silver)
$content = $content -replace 'rgba\(232,224,208,0.45\)', '#999999'
$content = $content -replace 'rgba\(232,224,208,', 'rgba(255,255,255,'
$content = $content -replace '#e8e0d0', '#EAEAEA'

# Greens -> Gold (Zone section only)
$content = $content -replace 'rgba\(37,211,102,0.12\)', 'rgba(212,175,55,0.12)'
$content = $content -replace 'rgba\(37,211,102,0.3\)', 'rgba(212,175,55,0.3)'
$content = $content -replace 'rgba\(37,211,102,0.1\)', 'rgba(212,175,55,0.1)'
$content = $content -replace '#4ade80', 'var(--gold)'

Set-Content -Path $path -Value $content -NoNewline -Encoding UTF8
