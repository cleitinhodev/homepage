# 🎮 Games (`games/`)

Esta pasta guarda **jogos e experimentos jogáveis** feitos para o navegador. Exemplos: um jogo em `<canvas>`, um quiz, um jogo exportado para HTML5 (Godot, GameMaker, Construct, Phaser...).

Cada subpasta com um `index.html` vira um item da aba **Games** do site, com o selo `GAME`, e entra na lista de últimas adições da tela inicial.

Ainda não há jogos publicados. A aba mostra "NENHUM JOGO AINDA..." até o primeiro chegar. O mini game RETRO INVADER fica na aba Links e não faz parte desta pasta.

> Guia completo do site (regras gerais, GitHub Actions, idiomas, FAQ): [README principal](../README.md).

## O que tem aqui

```
games/
├── README.md        # este arquivo (o gerador ignora arquivos soltos)
├── games.json       # manifesto GERADO pelo GitHub Actions: não edite à mão
├── _modelo/         # modelo para copiar (ignorado por começar com "_")
└── pixel-runner/            # exemplo: jogo novo
    ├── index.html   # obrigatório: a página
    ├── project.json # opcional: como aparece na lista
    └── ...          # imagens, CSS, JS
```

## Nome da pasta

- Só **letras minúsculas sem acento, números e hífen**: `pixel-runner`.
- Sem espaços, acentos ou `ç`. Não comece com `_` ou `.`, porque essas pastas são ignoradas.
- A pasta fica **direto** em `games/`. O nome dela vira o endereço: `https://cleitinhodev.github.io/homepage/games/pixel-runner/`

## Passo a passo pelo terminal (git)

```bash
git clone https://github.com/cleitinhodev/homepage.git   # só na primeira vez
cd homepage
git pull                                                   # sempre, antes de começar
cp -r games/_modelo games/pixel-runner
```

No Windows (PowerShell), troque o `cp` por `Copy-Item -Recurse games\_modelo games\pixel-runner`.

1. Edite `games/pixel-runner/index.html`: o visual é todo seu. Use **caminhos relativos** (`img/foto.png`, nunca `/img/foto.png`) e deixe um link `../../` para voltar ao site.
2. Edite `games/pixel-runner/project.json` (exemplo abaixo).
3. (Opcional) Veja antes de publicar:

   ```bash
   node scripts/build-manifests.mjs   # coloca um jogo novo na lista
   python3 -m http.server 8000        # abra http://localhost:8000/#games
   ```

4. Publique:

   ```bash
   git add .
   git commit -m "Adiciona jogo Pixel Runner"
   git push
   ```

5. Espere o ✓ verde na aba **Actions** do GitHub (1–2 minutos) e recarregue o site.
6. Antes da próxima alteração, rode `git pull`: o Actions faz um commit próprio atualizando `games/games.json`.

## Passo a passo pelo site do GitHub

1. No computador, prepare a pasta `pixel-runner` com o `index.html`, o `project.json` e as imagens.
2. Abra https://github.com/cleitinhodev/homepage/tree/main/games e clique em **Add file → Upload files**.
3. **Arraste a pasta inteira** (não só os arquivos de dentro), para o GitHub criar `games/pixel-runner/...`.
4. Escreva a mensagem do commit (ex.: `Adiciona jogo Pixel Runner`), deixe **Commit directly to the `main` branch** e clique em **Commit changes**.
5. Espere o ✓ verde na aba **Actions** e recarregue o site.

> ⚠️ O upload pelo navegador aceita **no máximo 100 arquivos por vez** (e 25 MB por arquivo). Com mais arquivos, suba em partes: primeiro a pasta com o `index.html`, depois entre em `games/pixel-runner/` no GitHub e envie o resto (entrando nas subpastas, como `img/`, antes de enviar os arquivos delas). Ou use o terminal.

## Exemplo de `project.json`

```json
{
  "title": "Pixel Runner",
  "description": "Corra, pule e desvie dos obstáculos neste runner de 8 bits. Setas ou toque para jogar.",
  "date": "2026-11-10",
  "tags": [
    "arcade",
    "canvas",
    "8-bit"
  ],
  "cover": "assets/capa.png",
  "i18n": {
    "en": {
      "title": "Pixel Runner",
      "description": "Run, jump and dodge obstacles in this 8-bit runner. Arrow keys or touch to play."
    },
    "es": {
      "title": "Pixel Runner",
      "description": "Corre, salta y esquiva obstáculos en este runner de 8 bits. Flechas o toque para jugar."
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
| `cover` | capa, relativa à pasta do item (ou um link `https://`). Sem capa, apague a linha e o card mostra 🎮 |
| `i18n` | opcional: título e descrição em outros idiomas do site (`en`, `es`, `fr`, `de`, `it`, `ru`, `tr`, `id`, `ar`, `hi`, `bn`, `ja`, `ko`, `zh-CN`) |
| `langs` | opcional: idiomas que a **sua página** entende em `?lang=`. Com eles, o link abre como `games/pixel-runner/?lang=en` |

Todos os campos são opcionais. Use aspas duplas e não deixe vírgula depois do último item.

## Dicas para esta pasta

- Jogo exportado por uma engine: exporte para **Web/HTML5** e coloque o conteúdo exportado dentro da pasta do jogo. O arquivo principal precisa se chamar `index.html`; se a engine gerar outro nome, renomeie.
- Exportações costumam ter muitos arquivos ou arquivos grandes: o upload pelo navegador aceita no máximo 100 arquivos por vez e 25 MB por arquivo. Para jogos grandes, use o terminal (o limite do git no GitHub é 100 MB por arquivo).
- Algumas exportações (ex.: Godot com threads) exigem cabeçalhos especiais que o GitHub Pages não envia. Exporte sem threads, se a engine permitir.
- Escreva os controles na `description`: é o que aparece no card.
- Não edite `games.json`: ele é recriado a cada push. Para mudar algo na lista, mude o `project.json` do item.
- Item não apareceu, imagem quebrada ou ordem errada? Veja [Problemas comuns (FAQ)](../README.md#problemas-comuns-faq).
