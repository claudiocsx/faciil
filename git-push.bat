@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "feat: melhora UX/UI - filtros ativos, destaque busca, confirmacao remocao, botao scroll top, shimmer skeleton"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Melhorias de UX/UI enviadas com sucesso!
pause