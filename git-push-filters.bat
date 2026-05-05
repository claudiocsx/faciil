@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "style: filtros/categorias com mesmo estilo do header - branco glass"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Filtros com estilo do header aplicados!
pause