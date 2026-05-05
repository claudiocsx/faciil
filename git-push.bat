@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "style: paleta ultra-suave - fundo #050505, cores menos vibrantes, glows discretos"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Paleta ultra-suave enviada!
pause