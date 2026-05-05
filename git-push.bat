@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "style: remove glows e suaviza cores - visual limpo e leve"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Visual limpo e leve enviado!
pause