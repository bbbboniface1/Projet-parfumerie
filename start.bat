@echo off
title Sirani Parfumerie - Serveur Local
color 0A
echo.
echo  ==========================================
echo   SIRANI PARFUMERIE - Demarrage serveur
echo  ==========================================
echo.
echo  [1/2] Demarrage de MySQL...
REM CORRECTION LOCAL XAMPP : utiliser MySQL fourni par XAMPP si disponible.
netstat -ano | findstr ":3306" >nul 2>&1
if %errorlevel%==0 (
    echo  MySQL deja actif sur le port 3306
) else if exist "C:\xampp\mysql_start.bat" (
    start "" /min "C:\xampp\mysql_start.bat"
    timeout /t 5 /nobreak >nul
    echo  MySQL XAMPP demarre
) else (
    net start MySQL80 >nul 2>&1
    if %errorlevel%==0 (
        echo  MySQL80 demarre avec succes
    ) else (
        echo  MySQL introuvable. Demarrez MySQL depuis le panneau XAMPP.
    )
)
echo.
echo  [2/2] Lancement du serveur Node.js...
echo.
echo  Boutique  : http://localhost:3000
echo  Admin     : http://localhost:3000/admin
echo  Mot admin : sirani
echo.
echo  Appuyez sur Ctrl+C pour arreter
echo  ==========================================
echo.
cd /d %~dp0
node server.js
pause
