@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "style: headers branco puro com efeito glass - box-shadow leve"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Headers branco com efeito glass aplicados!
pause