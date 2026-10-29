# 🛠️ Tools (`tools/`)

Esta pasta guarda **ferramentas e utilitários** que rodam no navegador. Exemplos: um conversor de cores, um gerador de senhas, uma calculadora, um editor de pixel art.

Cada subpasta com um `index.html` vira um item da aba **Tools** do site, com o selo `TOOL`, e entra na lista de últimas adições da tela inicial.

Ainda não há ferramentas publicadas. A aba mostra "CAIXA DE FERRAMENTAS VAZIA" até a primeira chegar.

> Guia completo do site (regras gerais, GitHub Actions, idiomas, FAQ): [README principal](../README.md).

## O que tem aqui

```
tools/
├── README.md        # este arquivo (o gerador ignora arquivos soltos)
├── tools.json       # manifesto GERADO pelo GitHub Actions: não edite à mão
├── _modelo/         # modelo para copiar (ignorado por começar com "_")
└── conversor-de-cores/      # exemplo: ferramenta nova
    ├── index.html   # obrigatório: a página
    ├── project.json # opcional: como aparece na lista
    └── ...          # imagens, CSS, JS
```

## Nome da pasta

- Só **letras minúsculas sem acento, números e hífen**: `conversor-de-cores`.
- Sem espaços, acentos ou `ç`. Não comece com `_` ou `.`, porque essas pastas são ignoradas.
- A pasta fica **direto** em `tools/`. O nome dela vira o endereço: `https://cleitinhodev.github.io/homepage/tools/conversor-de-cores/`

## Passo a passo pelo terminal (git)

```bash
git clone https://github.com/cleitinhodev/homepage.git   # só na primeira vez
cd homepage
git pull                                                   # sempre, antes de começar
cp -r tools/_modelo tools/conversor-de-cores
```

No Windows (PowerShell), troque o `cp` por `Copy-Item -Recurse tools\_modelo tools\conversor-de-cores`.

1. Edite `tools/conversor-de-cores/index.html`: o visual é todo seu. Use **caminhos relativos** (`img/foto.png`, nunca `/img/foto.png`) e deixe um link `../../` para voltar ao site.
2. Edite `tools/conversor-de-cores/project.json` (exemplo abaixo).
3. (Opcional) Veja antes de publicar:

   ```bash
   node scripts/build-manifests.mjs   # coloca uma ferramenta nova na lista
   python3 -m http.server 8000        # abra http://localhost:8000/#tools
   ```

4. Publique:

   ```bash
   git add .
   git commit -m "Adiciona tool Conversor de cores"
   git push
   ```

5. Espere o ✓ verde na aba **Actions** do GitHub (1–2 minutos) e recarregue o site.
6. Antes da próxima alteração, rode `git pull`: o Actions faz um commit próprio atualizando `tools/tools.json`.

## Passo a passo pelo site do GitHub

1. No computador, prepare a pasta `conversor-de-cores` com o `index.html`, o `project.json` e as imagens.
2. Abra https://github.com/cleitinhodev/homepage/tree/main/tools e clique em **Add file → Upload files**.
3. **Arraste a pasta inteira** (não só os arquivos de dentro), para o GitHub criar `tools/conversor-de-cores/...`.
4. Escreva a mensagem do commit (ex.: `Adiciona tool Conversor de cores`), deixe **Commit directly to the `main` branch** e clique em **Commit changes**.
5. Espere o ✓ verde na aba **Actions** e recarregue o site.

> ⚠️ O upload pelo navegador aceita **no máximo 100 arquivos por vez** (e 25 MB por arquivo). Com mais arquivos, suba em partes: primeiro a pasta com o `index.html`, depois entre em `tools/conversor-de-cores/` no GitHub e envie o resto (entrando nas subpastas, como `img/`, antes de enviar os arquivos delas). Ou use o terminal.

## Exemplo de `project.json`

```json
{
  "title": "Conversor de cores",
  "description": "Converta cores entre HEX, RGB e HSL e copie o resultado com um clique.",
  "date": "2026-11-05",
  "tags": [
    "cores",
    "css",
    "utilitário"
  ],
  "cover": "capa.png",
  "i18n": {
    "en": {
      "title": "Color converter",
      "description": "Convert colors between HEX, RGB and HSL and copy the result with one click."
    },
    "es": {
      "title": "Conversor de colores",
      "description": "Convierte colores entre HEX, RGB y HSL y copia el resultado con un clic."
    }
  }
}
```

| Campo | O que é |
|---|---|
| `title` | título do card (sem ele, usa o `<title>` do `index.html`) |
| `description` | frase curta (sem ela, usa a `<meta name="description">`) |
| `date` | `AAAA-MM-DD`; o mais novo aparece primeiro (sem ela, usa a data do último commit da pasta) |
| `tags` | palavras para a busca |
| `cover` | capa, relativa à pasta do item (ou um link `https://`). Sem capa, apague a linha e o card mostra 🛠️ |
| `i18n` | opcional: título e descrição em outros idiomas do site (`en`, `es`, `fr`, `de`, `it`, `ru`, `tr`, `id`, `ar`, `hi`, `bn`, `ja`, `ko`, `zh-CN`) |
| `langs` | opcional: idiomas que a **sua página** entende em `?lang=`. Com eles, o link abre como `tools/conversor-de-cores/?lang=en` |

Todos os campos são opcionais. Use aspas duplas e não deixe vírgula depois do último item.

## Dicas para esta pasta

- A ferramenta precisa funcionar só com HTML, CSS e JavaScript: o GitHub Pages não roda servidor (PHP, Python, banco de dados).
- Bibliotecas: coloque os arquivos `.js` dentro da pasta da tool (ex.: `lib/`) ou use um link `https://` de CDN.
- Este exemplo não tem `langs` porque a ferramenta tem um idioma só. Se ela ler `?lang=` na URL, adicione `"langs": ["pt-BR", "en"]`.
- Não edite `tools.json`: ele é recriado a cada push. Para mudar algo na lista, mude o `project.json` do item.
- Item não apareceu, imagem quebrada ou ordem errada? Veja [Problemas comuns (FAQ)](../README.md#problemas-comuns-faq).
