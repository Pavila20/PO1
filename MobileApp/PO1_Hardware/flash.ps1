# Loads WiFi credentials from .env into this PowerShell session, then builds
# and flashes PO1_Hardware.
#
# Needed because PlatformIO's ${sysenv.*} substitution (used in platformio.ini)
# reads real OS environment variables, not the .env file directly — running
# `pio run --target upload` on its own bakes in blank credentials.
#
# Usage:
#   .\flash.ps1                 # auto-detect the board's port
#   .\flash.ps1 -Port COM4      # target a specific port

param(
    [string]$Port = ""
)

$envFile = Join-Path $PSScriptRoot ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "Missing PO1_Hardware\.env - put HOME_SSID/HOME_PASSWORD/SCHOOL_SSID/SCHOOL_PASSWORD there first." -ForegroundColor Red
    exit 1
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line.Contains("=")) {
        $parts = $line -split "=", 2
        Set-Item -Path "env:$($parts[0].Trim())" -Value $parts[1].Trim()
    }
}
Write-Host "Loaded WiFi credentials from .env (HOME_SSID=$env:HOME_SSID, SCHOOL_SSID=$env:SCHOOL_SSID)" -ForegroundColor Green

$pio = "$env:USERPROFILE\.platformio\penv\Scripts\pio.exe"
$uploadArgs = @("run", "--target", "upload")
if ($Port) { $uploadArgs += @("--upload-port", $Port) }

& $pio @uploadArgs
