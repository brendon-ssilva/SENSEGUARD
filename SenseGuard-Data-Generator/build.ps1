$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$python = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $python)) { throw 'Crie o ambiente .venv antes de compilar.' }
function Invoke-Python {
    & $python @args
    if ($LASTEXITCODE -ne 0) { throw "Python terminou com codigo $LASTEXITCODE." }
}
Invoke-Python -m pip install -r requirements.txt -r requirements-build.txt
Invoke-Python -m unittest discover -s tests -v
Invoke-Python -m PyInstaller --noconfirm --clean --onefile --windowed --name SenseGuard-Data-Generator --collect-all mysql.connector --copy-metadata mysql-connector-python --collect-all bcrypt main.py
$exe = Join-Path $PSScriptRoot 'dist\SenseGuard-Data-Generator.exe'
if (-not (Test-Path -LiteralPath $exe)) { throw 'Executavel nao encontrado.' }
Get-FileHash -LiteralPath $exe -Algorithm SHA256
Write-Host "Executavel criado: $exe"
