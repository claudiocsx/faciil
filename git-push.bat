@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "fix: corrige erro de parse JSX no CartSidebar e remove codigo duplicado"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Commit e push realizados com sucesso!
pause