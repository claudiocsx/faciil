@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv"

"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "style: nova identidade visual - branco, midnight, amber, conforme exemplo"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Nova identidade visual aplicada!
pause