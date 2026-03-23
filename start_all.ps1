Write-Host "🧹 Cleaning up old processes..." -ForegroundColor Yellow
Stop-Process -Name "node" -ErrorAction SilentlyContinue
Stop-Process -Name "cloudflared" -ErrorAction SilentlyContinue

$cfExe = "$PWD\cloudflared.exe"
if (-not (Test-Path $cfExe)) {
    Write-Host "⬇️ Downloading Cloudflare Tunnel..." -ForegroundColor Magenta
    Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
}

Write-Host "🤖 Starting Machine Simulator in the background..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "node" -ArgumentList "simulator/server.js"

Write-Host "☁️ Starting Cloudflare Tunnel..." -ForegroundColor Cyan
# 👇 CHANGED TO 5000 TO MATCH YOUR SIMULATOR
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c `"$cfExe`" tunnel --url http://127.0.0.1:5000 > tunnel_log.txt 2>&1"

Write-Host "⏳ Waiting for Cloudflare tunnel to establish..." -ForegroundColor Yellow
Start-Sleep -Seconds 6

$log = Get-Content "tunnel_log.txt" -Raw
$urlMatch = [regex]::Match($log, 'https://[a-zA-Z0-9-]+\.trycloudflare\.com')

if ($urlMatch.Success) {
    $url = $urlMatch.Value
    Write-Host "✅ Cloudflare Tunnel Active: $url" -ForegroundColor Green

    $envPath = ".env"
    $newIpLine = "EXPO_PUBLIC_MACHINE_IP=$url"

    if (Test-Path $envPath) {
        $content = Get-Content $envPath
        $newContent = @()
        $found = $false

        foreach ($line in $content) {
            $line = $line.Trim()
            if ($line -match "^EXPO_PUBLIC_MACHINE_IP=") {
                $newContent += $newIpLine
                $found = $true
            } elseif ($line.Length -gt 0) {
                $newContent += $line
            }
        }

        if (-not $found) {
            $newContent += $newIpLine
        }

        # 👇 ADDED -Encoding ASCII SO EXPO CAN READ IT
        $newContent | Set-Content $envPath -Encoding ASCII
    } else {
        Set-Content -Path $envPath -Value $newIpLine -Encoding ASCII
    }

    Write-Host "📝 Updated .env file safely!" -ForegroundColor Green

    Write-Host "📱 Starting Expo Development Server..." -ForegroundColor Cyan
    npx expo start -c --tunnel
} else {
    Write-Host "❌ Failed to start Cloudflare tunnel. Check tunnel_log.txt for errors." -ForegroundColor Red
}