@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "fix: corrige erro de parse no CartSidebar - await fora de funcao async"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Erro de parse corrigido e enviado!
pause