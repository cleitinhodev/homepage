# 👾 Projetos (`projects/`)

Esta pasta guarda **tutoriais e projetos**: páginas que ensinam algo passo a passo ou apresentam um projeto. Exemplos: um tutorial de CSS, o guia de um programa, a apresentação de um app.

Cada subpasta com um `index.html` vira um item da aba **Projetos** do site, com o selo `PROJETO`, e entra na lista de últimas adições da tela inicial.

Itens publicados aqui: [`renemya-tutorial/`](renemya-tutorial/) e [`easy-game-translator-tutorial/`](easy-game-translator-tutorial/).

> Guia completo do site (regras gerais, GitHub Actions, idiomas, FAQ): [README principal](../README.md).

## O que tem aqui

```
projects/
├── README.md        # este arquivo (o gerador ignora arquivos soltos)
├── projects.json    # manifesto GERADO pelo GitHub Actions: não edite à mão
├── _modelo/         # modelo para copiar (ignorado por começar com "_")
└── flexbox-na-pratica/      # exemplo: tutorial novo
    ├── index.html   # obrigatório: a página
    ├── project.json # opcional: como aparece na lista
    └── ...          # imagens, CSS, JS
```

## Nome da pasta

- Só **letras minúsculas sem acento, números e hífen**: `flexbox-na-pratica`.
- Sem espaços, acentos ou `ç`. Não comece com `_` ou `.`, porque essas pastas são ignoradas.
- A pasta fica **direto** em `projects/`. O nome dela vira o endereço: `https://cleitinhodev.github.io/homepage/projects/flexbox-na-pratica/`

## Passo a passo pelo terminal (git)

```bash
git clone https://github.com/cleitinhodev/homepage.git   # só na primeira vez
cd homepage
git pull                                                   # sempre, antes de começar
cp -r projects/_modelo projects/flexbox-na-pratica
```

No Windows (PowerShell), troque o `cp` por `Copy-Item -Recurse projects\_modelo projects\flexbox-na-pratica`.

1. Edite `projects/flexbox-na-pratica/index.html`: o visual é todo seu. Use **caminhos relativos** (`img/foto.png`, nunca `/img/foto.png`) e deixe um link `../../` para voltar ao site.
2. Edite `projects/flexbox-na-pratica/project.json` (exemplo abaixo).
3. (Opcional) Veja antes de publicar:

   ```bash
   node scripts/build-manifests.mjs   # coloca um tutorial novo na lista
   python3 -m http.server 8000        # abra http://localhost:8000/#projetos
   ```

4. Publique:

   ```bash
   git add .
   git commit -m "Adiciona tutorial Flexbox na prática"
   git push
   ```

5. Espere o ✓ verde na aba **Actions** do GitHub (1–2 minutos) e recarregue o site.
6. Antes da próxima alteração, rode `git pull`: o Actions faz um commit próprio atualizando `projects/projects.json`.

## Passo a passo pelo site do GitHub

1. No computador, prepare a pasta `flexbox-na-pratica` com o `index.html`, o `project.json` e as imagens.
2. Abra https://github.com/cleitinhodev/homepage/tree/main/projects e clique em **Add file → Upload files**.
3. **Arraste a pasta inteira** (não só os arquivos de dentro), para o GitHub criar `projects/flexbox-na-pratica/...`.
4. Escreva a mensagem do commit (ex.: `Adiciona tutorial Flexbox na prática`), deixe **Commit directly to the `main` branch** e clique em **Commit changes**.
5. Espere o ✓ verde na aba **Actions** e recarregue o site.

> ⚠️ O upload pelo navegador aceita **no máximo 100 arquivos por vez** (e 25 MB por arquivo). Com mais arquivos, suba em partes: primeiro a pasta com o `index.html`, depois entre em `projects/flexbox-na-pratica/` no GitHub e envie o resto (entrando nas subpastas, como `img/`, antes de enviar os arquivos delas). Ou use o terminal.

## Exemplo de `project.json`

```json
{
  "title": "Flexbox na prática",
  "description": "Monte layouts responsivos com Flexbox, do zero ao card perfeito.",
  "date": "2026-11-02",
  "tags": [
    "css",
    "layout",
    "iniciante"
  ],
  "cover": "img/capa.webp",
  "i18n": {
    "en": {
      "title": "Flexbox in practice",
      "description": "Build responsive layouts with Flexbox, from zero to the perfect card."
    },
    "es": {
      "title": "Flexbox en la práctica",
      "description": "Crea diseños responsivos con Flexbox, desde cero hasta la tarjeta perfecta."
    }
  },
  "langs": [
    "pt-BR",
    "en",
    "es"
  ]
}
```

| Campo | O que é |
|---|---|
| `title` | título do card (sem ele, usa o `<title>` do `index.html`) |
| `description` | frase curta (sem ela, usa a `<meta name="description">`) |
| `date` | `AAAA-MM-DD`; o mais novo aparece primeiro (sem ela, usa a data do último commit da pasta) |
| `tags` | palavras para a busca |
| `cover` | capa, relativa à pasta do item (ou um link `https://`). Sem capa, apague a linha e o card mostra 👾 |
| `i18n` | opcional: título e descrição em outros idiomas do site (`en`, `es`, `fr`, `de`, `it`, `ru`, `tr`, `id`, `ar`, `hi`, `bn`, `ja`, `ko`, `zh-CN`) |
| `langs` | opcional: idiomas que a **sua página** entende em `?lang=`. Com eles, o link abre como `projects/flexbox-na-pratica/?lang=en` |

Todos os campos são opcionais. Use aspas duplas e não deixe vírgula depois do último item.

## Dicas para esta pasta

- Um tutorial com várias telas costuma ter muitas imagens. Prefira `.webp` (arquivos menores) e guarde tudo em uma subpasta, como `img/`.
- Se o tutorial tem vários idiomas e lê `?lang=` na URL, liste os códigos em `langs`. Veja os exemplos reais: [renemya-tutorial/project.json](renemya-tutorial/project.json) (códigos `pt_BR`) e [easy-game-translator-tutorial/project.json](easy-game-translator-tutorial/project.json) (códigos `pt-BR`).
- Não edite `projects.json`: ele é recriado a cada push. Para mudar algo na lista, mude o `project.json` do item.
- Item não apareceu, imagem quebrada ou ordem errada? Veja [Problemas comuns (FAQ)](../README.md#problemas-comuns-faq).
