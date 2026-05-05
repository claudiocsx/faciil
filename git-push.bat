@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "style: botao Ver Loja mais visivel no painel admin - verde neon e texto preto"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Botao Ver Loja destacado!
pause