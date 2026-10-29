# 📦 Modelo de jogo (`games/`)

Esta pasta é um **modelo**. Ela começa com `_`, então o gerador a **ignora** e ela não aparece no site.

> Passo a passo completo desta pasta, pelo terminal ou pelo upload do GitHub: [`games/README.md`](../README.md). Guia geral do site e FAQ: [README principal](../../README.md).

## Como criar um novo jogo

1. Copie esta pasta com um nome novo (só letras minúsculas sem acento, números e `-`; sem espaços):

   ```bash
   cp -r games/_modelo games/meu-jogo
   ```

2. Edite `games/meu-jogo/index.html`: o visual é todo seu (CSS próprio, fontes, cores...). Use caminhos relativos e deixe um link `../../` para voltar ao site.
3. Edite `project.json`:

   | campo         | obrigatório | exemplo                                    |
   |---------------|-------------|--------------------------------------------|
   | `title`       | não*        | `"Snake neon"`                              |
   | `description` | não*        | `"Uma frase curta"`                        |
   | `date`        | não*        | `"2026-11-02"` (AAAA-MM-DD)                |
   | `tags`        | não         | `["css", "layout"]`                        |
   | `cover`       | não         | `"capa.png"` (relativo à pasta)            |
   | `i18n`        | não         | traduções do título e da descrição (abaixo) |
   | `langs`       | não         | idiomas que a página aceita em `?lang=`    |

   \* Sem `project.json` (ou faltando campos), o gerador usa o `<title>` e a `<meta name="description">` do `index.html`, e a data do último commit da pasta.
   Se não tiver capa, apague a linha `cover` (ou coloque um arquivo `capa.png` na pasta).

### Traduções (`i18n`) e idioma da página (`langs`)

O site principal tem 15 idiomas. Para o jogo aparecer traduzido nas listas, adicione `i18n` com o código do idioma (os mesmos de `assets/i18n/`: `en`, `es`, `fr`, `de`, `it`, `ru`, `tr`, `id`, `ar`, `hi`, `bn`, `ja`, `ko`, `zh-CN`):

```json
"i18n": {
  "en": { "title": "Game title", "description": "A short sentence about the game and how to play it." },
  "es": { "title": "Título del juego", "description": "Una frase corta sobre el juego y cómo se juega." }
}
```

Idioma sem tradução usa o `title`/`description` padrão. Só `title` e `description` são lidos.

Se a sua página aceitar `?lang=<código>` na URL, liste os códigos em `langs` (do jeito que a página espera, ex.: `"pt_BR"` ou `"pt-BR"`). Quando o idioma escolhido no site estiver na lista, o link abre como `games/meu-jogo/?lang=<código>`. Sem `langs`, o link abre sem parâmetro. Se a página não tiver idiomas, apague `i18n` e `langs`.

4. Faça commit e push para `main`. O GitHub Actions atualiza `games/games.json` e o jogo aparece na aba **Games** e na tela inicial.

Quer ver antes? Rode `node scripts/build-manifests.mjs` e depois `python3 -m http.server` na raiz do repositório.
