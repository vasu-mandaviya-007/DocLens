Write-Host "Starting Development Environment in Windows Terminal (Tabs)..." -ForegroundColor Green

# Yahan humne Activate.ps1 ke baad \; ka use kiya hai.
# Isse Windows Terminal confuse nahi hoga aur command properly PowerShell ko bhej dega.

$wtArgs = '-w 0 ' +
    'new-tab --title "Frontend" -d ".\frontend" powershell -NoExit -Command "npm run dev" ; ' +
    'new-tab --title "FastApi Server" -d ".\backend" powershell -NoExit -Command ".\.venv\Scripts\Activate.ps1 \; uvicorn app.main:app --reload"'

# Start-Process se directly Windows Terminal ko call karenge
Start-Process wt.exe -ArgumentList $wtArgs

Write-Host "Launched Windows Terminal with 2 tabs successfully!" -ForegroundColor Green 