@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "fix: header branco com efeito vidro - backdrop-blur e fundo rgba(255,255,255,0.85)"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Header corrigido com efeito vidro!
pause