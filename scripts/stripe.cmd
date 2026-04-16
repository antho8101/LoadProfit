@echo off
setlocal EnableDelayedExpansion
set "BASE=%LOCALAPPDATA%\Microsoft\WinGet\Packages"
for /d %%D in ("%BASE%\Stripe.StripeCli_*") do (
  if exist "%%D\stripe.exe" (
    "%%D\stripe.exe" %*
    exit /b !ERRORLEVEL!
  )
)
echo [stripe] stripe.exe introuvable. Installez avec: winget install -e --id Stripe.StripeCli --source winget
exit /b 1
