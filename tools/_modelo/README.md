# 📦 Modelo de ferramenta (`tools/`)

Esta pasta é um **modelo**. Ela começa com `_`, então o gerador a **ignora** e ela não aparece no site.

## Como criar uma nova ferramenta

1. Copie esta pasta com um nome novo (só letras minúsculas, números e `-`):

   ```bash
   cp -r tools/_modelo tools/minha-ferramenta
   ```

2. Edite `tools/minha-ferramenta/index.html`: o visual é todo seu (CSS próprio, fontes, cores...). Use caminhos relativos e deixe um link `../../` para voltar ao site.
3. Edite `project.json`:

   | campo         | obrigatório | exemplo                                    |
   |---------------|-------------|--------------------------------------------|
   | `title`       | não*        | `"Conversor de cores"`                              |
   | `description` | não*        | `"Uma frase curta"`                        |
   | `date`        | não*        | `"2026-11-02"` (AAAA-MM-DD)                |
   | `tags`        | não         | `["css", "layout"]`                        |
   | `cover`       | não         | `"capa.png"` (relativo à pasta)            |
   | `i18n`        | não         | traduções do título e da descrição (abaixo) |
   | `langs`       | não         | idiomas que a página aceita em `?lang=`    |

   \* Sem `project.json` (ou faltando campos), o gerador usa o `<title>` e a `<meta name="description">` do `index.html`, e a data do último commit da pasta.
   Se não tiver capa, apague a linha `cover` (ou coloque um arquivo `capa.png` na pasta).

### Traduções (`i18n`) e idioma da página (`langs`)

O site principal tem 15 idiomas. Para a ferramenta aparecer traduzida nas listas, adicione `i18n` com o código do idioma (os mesmos de `assets/i18n/`: `en`, `es`, `fr`, `de`, `it`, `ru`, `tr`, `id`, `ar`, `hi`, `bn`, `ja`, `ko`, `zh-CN`):

```json
"i18n": {
  "en": { "title": "Tool title", "description": "A short sentence explaining what the tool does." },
  "es": { "title": "Título de la herramienta", "description": "Una frase corta que explica lo que hace la herramienta." }
}
```

Idioma sem tradução usa o `title`/`description` padrão. Só `title` e `description` são lidos.

Se a sua página aceitar `?lang=<código>` na URL, liste os códigos em `langs` (do jeito que a página espera, ex.: `"pt_BR"` ou `"pt-BR"`). Quando o idioma escolhido no site estiver na lista, o link abre como `tools/minha-ferramenta/?lang=<código>`. Sem `langs`, o link abre sem parâmetro. Se a página não tiver idiomas, apague `i18n` e `langs`.

4. Faça commit e push para `main`. O GitHub Actions atualiza `tools/tools.json` e a ferramenta aparece na aba **Tools** e na tela inicial.

Quer ver antes? Rode `node scripts/build-manifests.mjs` e depois `python3 -m http.server` na raiz do repositório.
