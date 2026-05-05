@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "fix: corrige erro de sintaxe no ProductDetail.jsx - virgula solta"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Erro de build corrigido e enviado!
pause