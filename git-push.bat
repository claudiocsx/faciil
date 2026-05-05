@echo off
cd /d C:\Users\Ana Claudia\Documents\meupdv\meu-pdv

"C:\Program Files\Git\bin\git.exe" add .
"C:\Program Files\Git\bin\git.exe" commit -m "feat: melhora UX - skeleton loaders, tela sucesso pedido, animacao carrinho, empty states"
"C:\Program Files\Git\bin\git.exe" push origin main

echo.
echo Melhorias de UX enviadas com sucesso!
pause