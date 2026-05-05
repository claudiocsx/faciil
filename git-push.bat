@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "style: ajusta paleta de cores para tons mais equilibrados e adiciona cor de erro"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Paleta de cores atualizada com sucesso!
pause