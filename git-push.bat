@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "style: suaviza paleta de cores para reduzir cansaço visual"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Paleta de cores suavizada enviada!
pause