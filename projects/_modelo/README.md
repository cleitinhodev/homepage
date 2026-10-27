# 📦 Modelo de tutorial

Esta pasta é um **modelo**. Ela começa com `_`, então o gerador a **ignora** e ela não aparece no site.

## Como criar um novo tutorial

1. Copie esta pasta com um nome novo (só letras minúsculas, números e `-`):

   ```bash
   cp -r projects/_modelo projects/meu-primeiro-tutorial
   ```

2. Edite `projects/meu-primeiro-tutorial/index.html` — o visual é todo seu (CSS próprio, fontes, cores...).
3. Edite `project.json`:

   | campo         | obrigatório | exemplo                          |
   |---------------|-------------|----------------------------------|
   | `title`       | não*        | `"Flexbox na prática"`           |
   | `description` | não*        | `"Aprenda a alinhar tudo"`       |
   | `date`        | não*        | `"2026-11-02"` (AAAA-MM-DD)      |
   | `tags`        | não         | `["css", "layout"]`              |
   | `cover`       | não         | `"capa.png"` (relativo à pasta)  |

   \* Sem `project.json` (ou faltando campos), o gerador usa o `<title>` e a `<meta name="description">` do `index.html`, e a data do último commit da pasta.
   Se não tiver capa, apague a linha `cover` (ou coloque um arquivo `capa.png` na pasta).

4. Faça commit e push para `main`. O GitHub Actions atualiza `projects/projects.json` e o tutorial aparece na tela inicial.

Quer ver antes? Rode `node scripts/build-projects.mjs` e depois `python3 -m http.server` na raiz do repositório.
