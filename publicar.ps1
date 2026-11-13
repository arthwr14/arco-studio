# Publica este site no GitHub Pages.
# Uso: .\publicar.ps1 [-Repo arco-studio]
param([string]$Repo = "arco-studio")
$ErrorActionPreference = "Continue"  # erros de comandos nativos são checados por $LASTEXITCODE
Set-Location $PSScriptRoot

# Ferramentas instaladas em %LOCALAPPDATA%\Programs (caso o PATH ainda não tenha sido recarregado)
$env:Path = "$env:LOCALAPPDATA\Programs\MinGit\cmd;$env:LOCALAPPDATA\Programs\GitHubCLI\bin;$env:Path"

gh auth status *> $null
if ($LASTEXITCODE -ne 0) { Write-Host "Faça login primeiro:  gh auth login" -ForegroundColor Yellow; exit 1 }
gh auth setup-git | Out-Null

$user = gh api user | ConvertFrom-Json
$login = $user.login

if (-not (Test-Path .git)) { git init -b main | Out-Null }
git config user.name  $(if ($user.name) { $user.name } else { $login })
git config user.email "$($user.id)+$login@users.noreply.github.com"
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) { git commit -m "Site Arco Studio (demonstração)" | Out-Null }

gh repo view "$login/$Repo" *> $null
if ($LASTEXITCODE -ne 0) {
  gh repo create $Repo --public --source . --remote origin --push --description "Site de demonstração: estúdio de sobrancelhas e depilação a laser (negócio fictício)"
} else {
  if (-not (git remote | Select-String -Quiet '^origin$')) { git remote add origin "https://github.com/$login/$Repo.git" }
  git push -u origin main
}

# Liga o GitHub Pages (branch main, pasta raiz)
gh api "repos/$login/$Repo/pages" *> $null
if ($LASTEXITCODE -ne 0) {
  gh api -X POST "repos/$login/$Repo/pages" -f "source[branch]=main" -f "source[path]=/" | Out-Null
}

$url = (gh api "repos/$login/$Repo/pages" | ConvertFrom-Json).html_url
Write-Host ""
Write-Host "Publicado! Em 1 a 2 minutos o site estará em: $url" -ForegroundColor Green
