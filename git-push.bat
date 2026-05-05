@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "feat: adiciona botao de admin na loja para acesso ao painel"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Botao de admin adicionado!
pause