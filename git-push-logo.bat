@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "style: logo icone ambar, texto facil igual rodape"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Logo ajustada: icone ambar e texto facil!
pause
