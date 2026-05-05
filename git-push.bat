@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "style: ajusta header da loja com novas cores - midnight, amber, off-white"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Header da loja ajustado!
pause