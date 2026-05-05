@echo off
cd /d C:\Users\paupa\Downloads\HosteleriaJoviat
git add -A
git commit -m "i18n: apply full translation to all remaining pages and components"
git push origin master
echo Exit code: %ERRORLEVEL%
