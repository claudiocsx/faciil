@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "style: remove barra pesquisa categorias, mantem apenas selecao"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Categorias sem barra de pesquisa!
pause
