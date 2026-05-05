@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "style: headers branco/85 com efeito glass - bg-white/85 backdrop-blur-xl"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Headers branco com efeito glass aplicados!
pause