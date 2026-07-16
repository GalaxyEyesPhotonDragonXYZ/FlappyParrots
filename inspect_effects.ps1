Add-Type -AssemblyName System.Drawing
$path = Join-Path (Get-Location) 'images\effects_sheet.png'
$img = [System.Drawing.Image]::FromFile($path)
$width = $img.Width; $height = $img.Height
$bmp = New-Object System.Drawing.Bitmap $img
function ColorKey($c) { return "$($c.R),$($c.G),$($c.B),$($c.A)" }
function Brightness($c) { return ($c.R + $c.G + $c.B) / 3 }
$colorCounts = @{}
for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.A -le 10) { continue }
        $key = ColorKey($c)
        if (-not $colorCounts.ContainsKey($key)) { $colorCounts[$key] = 0 }
        $colorCounts[$key] += 1
    }
}
$backgroundColors = $colorCounts.GetEnumerator() | Sort-Object -Property Value -Descending | Select-Object -First 8 | ForEach-Object { $_.Key }
$backgroundColors = $backgroundColors | Where-Object {
    $parts = $_ -split ',' | ForEach-Object { [int]$_ }
    $sum = $parts[0] + $parts[1] + $parts[2]
    $sum -lt 160
}
if ($backgroundColors.Count -eq 0) { $backgroundColors = $colorCounts.GetEnumerator() | Sort-Object -Property Value -Descending | Select-Object -First 4 | ForEach-Object { $_.Key } }
function IsBackground($c) {
    if ($c.A -le 10) { return $true }
    $key = ColorKey($c)
    if ($backgroundColors -contains $key) { return $true }
    $brightness = Brightness($c)
    if ($brightness -lt 40) { return $true }
    return $false
}
function IsVisible($c) {
    return -not (IsBackground($c))
}
$rows = @()
for ($y = 0; $y -lt $height; $y++) {
    $any = $false
    for ($x = 0; $x -lt $width; $x++) {
        if (IsVisible($bmp.GetPixel($x, $y))) { $any = $true; break }
    }
    $rows += $any
}
$regions = @(); $start = -1
for ($y = 0; $y -lt $height; $y++) {
    if ($rows[$y] -and $start -eq -1) { $start = $y }
    if (-not $rows[$y] -and $start -ne -1) { $regions += ,[int[]]($start, $y); $start = -1 }
}
if ($start -ne -1) { $regions += ,[int[]]($start, $height) }
Write-Output "size $width x $height"
$idx = 0
foreach ($reg in $regions) {
    $y0 = $reg[0]; $y1 = $reg[1]
    $minx = $width; $maxx = -1
    for ($y = $y0; $y -lt $y1; $y++) {
        for ($x = 0; $x -lt $width; $x++) {
            if (IsVisible($bmp.GetPixel($x, $y))) { $minx = [Math]::Min($minx, $x); $maxx = [Math]::Max($maxx, $x) }
        }
    }
    Write-Output "row $idx y $y0-$y1 x $minx-$maxx height $($y1-$y0)"
    $cols = @(); $sx = -1
    for ($x = 0; $x -lt $width; $x++) {
        $colAny = $false
        for ($y = $y0; $y -lt $y1; $y++) {
            if (IsVisible($bmp.GetPixel($x, $y))) { $colAny = $true; break }
        }
        if ($colAny -and $sx -eq -1) { $sx = $x }
        if (-not $colAny -and $sx -ne -1) { Write-Output " box $sx-$x"; $sx = -1 }
    }
    if ($sx -ne -1) { Write-Output " box $sx-$width" }
    $idx++
}
$img.Dispose(); $bmp.Dispose()
