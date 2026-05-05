@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "style: headers branco puro (#FFFFFF) sem transparencia"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Headers branco puro aplicados!
pause