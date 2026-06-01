# LogiSync k6 test runner for Windows PowerShell.
#
# Examples:
#   .\apps\api\test\k6\run-tests.ps1 -TestType smoke -Module auth
#   .\apps\api\test\k6\run-tests.ps1 -TestType load -Module order
#   .\apps\api\test\k6\run-tests.ps1 -TestType stress
#   .\apps\api\test\k6\run-tests.ps1 -TestType smoke -Module auth -OutputJson

param(
    [ValidateSet('smoke', 'load', 'stress', 'soak', 'scenario', 'security')]
    [string]$TestType = 'smoke',

    [ValidateSet('auth', 'order', 'catalog', 'rfq')]
    [string]$Module = 'auth',

    [string]$BaseUrl          = 'http://localhost:9751',
    [string]$AdminEmail       = 'admin@logisync.dev',
    [string]$AdminPassword    = 'Admin@123456',

    [string]$WorkspaceAEmail    = '',
    [string]$WorkspaceAPassword = '',
    [string]$WorkspaceBEmail    = '',
    [string]$WorkspaceBPassword = '',

    [switch]$OutputJson,
    [switch]$InfluxDB,
    [string]$InfluxUrl = 'http://localhost:8086'
)

$ErrorActionPreference = 'Stop'

# Check k6
if (-not (Get-Command k6 -ErrorAction SilentlyContinue)) {
    Write-Error @"
k6 is not installed. Install it with one of these options:

  1. Winget:
     winget install k6 --source winget

  2. Chocolatey:
     choco install k6

  3. Manual install:
     https://k6.io/docs/get-started/installation/
"@
    exit 1
}

Write-Host "k6 version: $(k6 version)" -ForegroundColor Green

$ScriptDir = "$PSScriptRoot"

# Select script
$script = switch ($TestType) {
    'smoke'    { "$ScriptDir\smoke\$Module.smoke.js" }
    'load'     { "$ScriptDir\load\$Module.load.js" }
    'stress'   { "$ScriptDir\stress\auth-ratelimit.stress.js" }
    'soak'     { "$ScriptDir\soak\core.soak.js" }
    'scenario' { "$ScriptDir\scenarios\user-journey.scenario.js" }
    'security' { "$ScriptDir\security\cross-tenant.security.js" }
}

if (-not (Test-Path $script)) {
    Write-Error "Script not found: $script"
    Write-Host "Available scripts:" -ForegroundColor Yellow
    Get-ChildItem -Path "$ScriptDir" -Recurse -Filter "*.js" | ForEach-Object {
        Write-Host "  $($_.FullName.Replace($ScriptDir, '.'))"
    }
    exit 1
}

Write-Host "Script: $script" -ForegroundColor Cyan

# Build arguments
$k6Args = @(
    'run',
    $script,
    "--env BASE_URL=$BaseUrl",
    "--env ADMIN_EMAIL=$AdminEmail",
    "--env ADMIN_PASSWORD=$AdminPassword"
)

if ($TestType -eq 'security') {
    if ($WorkspaceAEmail)    { $k6Args += "--env WORKSPACE_A_EMAIL=$WorkspaceAEmail" }
    if ($WorkspaceAPassword) { $k6Args += "--env WORKSPACE_A_PASSWORD=$WorkspaceAPassword" }
    if ($WorkspaceBEmail)    { $k6Args += "--env WORKSPACE_B_EMAIL=$WorkspaceBEmail" }
    if ($WorkspaceBPassword) { $k6Args += "--env WORKSPACE_B_PASSWORD=$WorkspaceBPassword" }
}

$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$reportDir = "$ScriptDir\reports"
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null

if ($OutputJson) {
    $reportFile = "$reportDir\${TestType}_${Module}_${timestamp}.json"
    $k6Args += "--out json=$reportFile"
    Write-Host "JSON report: $reportFile" -ForegroundColor Yellow
}

if ($InfluxDB) {
    $k6Args += "--out influxdb=$InfluxUrl/k6"
    Write-Host "InfluxDB: $InfluxUrl/k6" -ForegroundColor Yellow
}

# Run k6
Write-Host ""
Write-Host "Starting $TestType test for module '$Module'..." -ForegroundColor Magenta
Write-Host "   Base URL: $BaseUrl"
Write-Host ""

$startTime = Get-Date
& k6 @k6Args
$exitCode = $LASTEXITCODE
$elapsed  = (Get-Date) - $startTime

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "PASSED - Duration: $($elapsed.ToString('mm\:ss'))" -ForegroundColor Green
} else {
    Write-Host "FAILED (exit code $exitCode) - Duration: $($elapsed.ToString('mm\:ss'))" -ForegroundColor Red
}

exit $exitCode

