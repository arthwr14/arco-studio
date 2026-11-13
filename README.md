# Arco Studio · Sobrancelhas & Laser (demonstração)

Site de demonstração para o portfólio de [Arthur Torres](https://arthwr.com.br).
Negócio fictício: nome, endereço, preços e depoimentos são exemplos.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Início: apresentação, serviços, diferenciais, números, como agendar, depoimentos |
| `servicos.html` | Tabela de preços em abas e simulador de pacotes de depilação a laser |
| `resultados.html` | Galeria com filtros e ampliação, avaliações |
| `sobre.html` | História, equipe, valores e dúvidas frequentes |
| `contato.html` | Formulário que monta a mensagem para o WhatsApp, horários (aberto/fechado agora) e mapa |

Sem build e sem dependências: HTML, CSS (`assets/style.css`) e JavaScript puro (`assets/main.js`).

## Adaptar para um cliente real

1. Em `assets/main.js`, preencha `WA_NUMBER` (ex.: `"5511999998888"`). Vazio, os botões mostram
   uma prévia da mensagem em vez de abrir o WhatsApp.
2. Troque textos, preços e endereço nos `.html`, e as fotos em `img/`.
3. Remova a faixa `demo-bar` do topo e o aviso de negócio fictício do rodapé.

## Publicar no GitHub Pages

```powershell
gh auth login          # uma vez
.\publicar.ps1         # cria o repositório, envia os arquivos e liga o GitHub Pages
```

## Créditos das fotos

Fotos do [Unsplash](https://unsplash.com), usadas sob a licença Unsplash.
