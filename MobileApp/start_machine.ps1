# Same idea as start_all.ps1, but tunnels the real ESP32 instead of the
# Node simulator. Use this now that we're testing against real hardware.
#
# This only handles the ESP32 side. For Metro, run in a separate terminal:
#   npx expo start --tunnel
# (requires @expo/ngrok installed locally in the project - see package.json;
# the global-install prompt Expo offers is broken and won't work)
#
# The ESP32's local IP can change (DHCP) - check it via the serial monitor
# if this fails to reach it:
#   & "$env:USERPROFILE\.platformio\penv\Scripts\pio.exe" device monitor -p COM4 -b 115200
#
# Usage:
#   .\start_machine.ps1                    # uses the last known IP
#   .\start_machine.ps1 -MachineIP 1.2.3.4 # if the IP changed

param(
    [string]$MachineIP = "172.16.58.250"
)

Write-Host "Cleaning up old processes..." -ForegroundColor Yellow
Stop-Process -Name "cloudflared" -ErrorAction SilentlyContinue
Stop-Process -Name "node" -ErrorAction SilentlyContinue

$cfExe = "$PWD\cloudflared.exe"
if (-not (Test-Path $cfExe)) {
    Write-Host "Downloading Cloudflare Tunnel..." -ForegroundColor Magenta
    Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
}

Write-Host "Starting Cloudflare Tunnel to the ESP32 at $MachineIP..." -ForegroundColor Cyan
Start-Process -NoNewWindow -FilePath "cmd.exe" -ArgumentList "/c `"$cfExe`" tunnel --url http://$MachineIP > tunnel_log.txt 2>&1"

Write-Host "Waiting for Cloudflare tunnel to establish..." -ForegroundColor Yellow
Start-Sleep -Seconds 6

$log = Get-Content "tunnel_log.txt" -Raw
$urlMatch = [regex]::Match($log, 'https://[a-zA-Z0-9-]+\.trycloudflare\.com')

if ($urlMatch.Success) {
    $url = $urlMatch.Value
    Write-Host "Cloudflare Tunnel Active: $url -> $MachineIP" -ForegroundColor Green

    $envPath = ".env"
    $newIpLine = "EXPO_PUBLIC_MACHINE_IP=$url"

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
    if (-not $found) { $newContent += $newIpLine }
    $newContent | Set-Content $envPath -Encoding ASCII

    Write-Host "Updated .env to point at the real ESP32 via the tunnel!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now run in a separate terminal: npx expo start --tunnel" -ForegroundColor Cyan
} else {
    Write-Host "Failed to start Cloudflare tunnel. Check tunnel_log.txt, or verify the ESP32's IP ($MachineIP) is still correct." -ForegroundColor Red
}
