# UniPlace deploy prep: build Angular and embed it into the Spring Boot jar's static resources.
$ErrorActionPreference = "Stop"
Write-Host "1/3 Building Angular production bundle..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\campus-portal"
npm run build

$dist = "dist\campus-portal\browser"
if (-not (Test-Path $dist)) { $dist = "dist\campus-portal" }   # older output layouts
if (-not (Test-Path "$dist\index.html")) { throw "Build output not found under $dist" }

Write-Host "2/3 Copying build into backend static resources..." -ForegroundColor Cyan
$static = "$PSScriptRoot\campusportal\src\main\resources\static"
if (Test-Path $static) { Remove-Item -Recurse -Force $static }
New-Item -ItemType Directory -Force -Path $static | Out-Null
Copy-Item -Recurse -Force "$dist\*" $static

Write-Host "3/3 Done. Commit campusportal/src/main/resources/static and push - Railway builds the jar." -ForegroundColor Green
Write-Host "Local test:  cd campusportal; .\mvnw spring-boot:run   then open http://localhost:8081"
