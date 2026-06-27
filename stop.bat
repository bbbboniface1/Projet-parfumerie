@echo off
echo Arret du serveur Sirani Parfumerie...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
  taskkill /PID %%a /F >nul 2>&1
)
REM CORRECTION LOCAL XAMPP : arreter MySQL XAMPP si disponible.
if exist "C:\xampp\mysql_stop.bat" (
  call "C:\xampp\mysql_stop.bat" >nul 2>&1
) else (
  net stop MySQL80 >nul 2>&1
)
echo Serveur arrete.
pause
