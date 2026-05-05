@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" rm git-push.bat git-push-header.bat git-push-header-fix.bat git-push-header-glass.bat git-push.bat git-cleanup.bat
"C:\Program Files\Git\bin\git.exe" rm update-colors.mjs update-colors-v2.mjs update-colors-v3.mjs update-identity.mjs
"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "chore: remove arquivos .bat e .mjs do repositorio"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Arquivos desnecessarios removidos!
pause