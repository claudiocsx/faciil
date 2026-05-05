@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "style: ajusta cores - midnight, amber, mantem estrutura original"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Cores ajustadas sem mudar estrutura!
pause