# ▶ CLEITINHO.DEV — homepage

Minha homepage onde guardo conhecimentos gerais! Um site **retrô** (synthwave vermelho + roxo, scanlines CRT, botões com glitch/neon) que funciona como **vitrine de tutoriais**: a tela principal é um monitor de fliperama que mostra os últimos projetos adicionados na pasta `projects/`.

🌐 **Site:** https://cleitinhodev.github.io/homepage/

## Estrutura

```
.
├── index.html                  # página principal (menu + tela CRT + abas)
├── assets/
│   ├── css/style.css           # visual retrô do site principal
│   ├── js/app.js               # navegação, tela interativa, lista de projetos
│   ├── js/game.js              # mini game RETRO INVADER (aba Links)
│   └── audio/game-theme.mp3    # música do jogo (só toca ao dar play)
├── projects/
│   ├── projects.json           # manifesto GERADO automaticamente (não edite à mão)
│   ├── _modelo/                # modelo de tutorial (ignorado por começar com "_")
│   │   ├── index.html
│   │   ├── project.json
│   │   └── README.md
│   └── <seu-tutorial>/         # cada tutorial: uma pasta com seu próprio estilo
│       ├── index.html
│       └── project.json        # opcional
├── scripts/build-projects.mjs  # gera projects/projects.json
└── .github/workflows/site.yml  # atualiza o manifesto e publica no GitHub Pages
```

## Como adicionar um tutorial

1. Copie o modelo: `cp -r projects/_modelo projects/meu-tutorial`
2. Crie o visual que quiser em `projects/meu-tutorial/index.html` (cada pasta tem estilo próprio).
3. Preencha `projects/meu-tutorial/project.json`:

   ```json
   {
     "title": "Meu tutorial",
     "description": "O que você vai aprender.",
     "date": "2026-11-02",
     "tags": ["css", "iniciante"],
     "cover": "capa.png"
   }
   ```

   Todos os campos são opcionais. Sem eles, o gerador usa o `<title>` e a `<meta name="description">` do `index.html` e a data do último commit da pasta. `cover` é um caminho relativo à pasta do tutorial.
4. `git add . && git commit -m "novo tutorial" && git push`

O workflow **Site (manifesto + Pages)** roda a cada push na `main`: recria `projects/projects.json` (mais novo primeiro; na mesma data, o que entrou no repositório por último vem antes), faz commit dele de volta com `[skip ci]` se mudou, e publica o site. Em 1–2 minutos o tutorial aparece na tela inicial e na aba **Projetos**.

Regras do gerador: só entram pastas com `index.html`; pastas começando com `_` ou `.` são ignoradas; nomes de pasta só com letras, números, `-`, `_` e `.`.

## Rodando localmente

Abrir o `index.html` direto (`file://`) **não funciona**: o navegador bloqueia o `fetch()` do `projects.json`. Use um servidor local:

```bash
node scripts/build-projects.mjs   # atualiza o manifesto (Node 18+)
python3 -m http.server 8000       # na raiz do repositório
# abra http://localhost:8000
```

`node scripts/build-projects.mjs --check` só confere se o manifesto está em dia.

## Controles da tela

- **↑ / ↓** (ou os botões ▲ ▼) escolhem o projeto; **Enter** ou **START** abre.
- Clique num item para selecionar; clique de novo para abrir.
- **← / →** navegam entre as abas do menu.
- Respeita `prefers-reduced-motion` (animações reduzidas).

## Aba Links + RETRO INVADER

A aba **Links** (`#links`; o antigo `#sobre` redireciona pra ela) tem os botões para o site, doação, Patreon e canal do YouTube, e embaixo o mini game **RETRO INVADER**:

- Fica parado na tela de título até apertar **Jogar**, **Enter** ou tocar na tela.
- **← →** ou **A D** movem, **Espaço** atira, **P** ou **Esc** pausam. No celular aparecem botões de toque.
- Ondas cada vez mais rápidas, tiros inimigos, disco voador bônus, 3 vidas e recorde salvo no `localStorage`.
- A música (`assets/audio/game-theme.mp3`, `preload="none"`) só é baixada e tocada ao dar play. Ela pausa no pause, no game over e ao trocar de aba, e o botão **Som** fica salvo.

## Publicação (GitHub Pages)

Em *Settings → Pages*, a fonte deve ser **GitHub Actions**. Todos os caminhos são relativos, então o site funciona em `https://cleitinhodev.github.io/homepage/`.

## Licença

MIT — veja [LICENSE](LICENSE).
