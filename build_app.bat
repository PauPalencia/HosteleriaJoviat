@echo off
cd /d C:\Users\paupa\Downloads\HosteleriaJoviat
set CI=false
npm run build
echo Exit code: %ERRORLEVEL%
