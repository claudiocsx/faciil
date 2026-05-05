@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add -A
"C:\Program Files\Git\bin\git.exe" commit -m "style: headers com efeito vidro - branco translucido e backdrop-blur"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Headers com efeito vidro aplicados e enviados!
pause