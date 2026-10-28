# ▶ CLEITINHO.DEV — homepage

Minha homepage onde guardo conhecimentos gerais! Um site **retrô** (synthwave vermelho + roxo, scanlines CRT, botões com glitch/neon) que funciona como **vitrine de tutoriais, ferramentas e jogos**. Cada categoria tem sua pasta e sua aba: **Projetos** (`projects/`), **Tools** (`tools/`), **Games** (`games/`) e **Educação** (`educacao/`). A tela principal é um monitor de fliperama que mostra as últimas adições de todas juntas, com um selo `PROJETO`, `TOOL`, `GAME` ou `EDU` em cada uma.

O site principal está em **15 idiomas** (seletor 🌐 no topo). Veja [Idiomas](#idiomas-i18n).

🌐 **Site:** https://cleitinhodev.github.io/homepage/

## Estrutura

```
.
├── index.html                  # página principal (menu + tela CRT + abas)
├── assets/
│   ├── css/style.css           # visual retrô do site principal
│   ├── i18n/<código>.json      # textos do site em cada idioma (pt-BR.json é a fonte)
│   ├── js/categories.js        # LISTA DE CATEGORIAS (Projetos, Tools, Games, Educação...) usada pelo site e pelo gerador
│   ├── js/i18n.js              # idiomas: lista, detecção, seletor, traduções
│   ├── js/app.js               # navegação, tela interativa, abas de categoria
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
├── tools/                      # mesma ideia, para ferramentas
│   ├── tools.json              # manifesto GERADO
│   ├── _modelo/
│   └── <sua-tool>/index.html
├── games/                      # mesma ideia, para jogos
│   ├── games.json              # manifesto GERADO
│   ├── _modelo/
│   └── <seu-jogo>/index.html
├── educacao/                   # mesma ideia, para aulas e materiais de estudo
│   ├── educacao.json           # manifesto GERADO
│   ├── _modelo/
│   └── <sua-aula>/index.html
├── scripts/build-manifests.mjs # gera os manifestos de todas as categorias
├── scripts/check-i18n.mjs      # confere se todos os idiomas têm as mesmas chaves
├── scripts/build-projects.mjs  # nome antigo (ainda funciona: chama o build-manifests)
└── .github/workflows/site.yml  # atualiza os manifestos e publica no GitHub Pages
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
     "cover": "capa.png",
     "i18n": {
       "en": { "title": "My tutorial", "description": "What you will learn." },
       "es": { "title": "Mi tutorial", "description": "Lo que vas a aprender." }
     },
     "langs": ["pt-BR", "en", "es"]
   }
   ```

   Todos os campos são opcionais. Sem eles, o gerador usa o `<title>` e a `<meta name="description">` do `index.html` e a data do último commit da pasta. `cover` é um caminho relativo à pasta do tutorial.

   - `i18n` (opcional): título e descrição em outros idiomas, por código (`en`, `es`, `ja`...). O site usa o do idioma escolhido e, se não houver, o texto padrão.
   - `langs` (opcional): idiomas que a **página do tutorial** entende via `?lang=`, escritos do jeito que a página espera (`pt-BR` ou `pt_BR`, tanto faz). Se o idioma do site estiver na lista, os links para o tutorial ganham `?lang=<código>`; se não estiver, o link vai sem parâmetro.
4. `git add . && git commit -m "novo tutorial" && git push`

O workflow **Site (manifesto + Pages)** roda a cada push na `main`: recria os manifestos (`projects/projects.json`, `tools/tools.json`, `games/games.json`), faz commit deles de volta com `[skip ci]` se mudaram, e publica o site. Em 1–2 minutos o tutorial aparece na tela inicial e na aba **Projetos**.

Regras do gerador (iguais em todas as categorias): só entram pastas com `index.html`; pastas começando com `_` ou `.` são ignoradas; nomes de pasta só com letras, números, `-`, `_` e `.`.

**Ordem:** mais novo primeiro pela `date`. Na mesma data, vem antes o que entrou no repositório por último. O gerador grava isso no campo `added` (segundos do primeiro commit da pasta). Uma pasta ainda não commitada fica sem `added` e conta como a mais nova; depois do push, o workflow preenche o campo e faz um commit `[skip ci]` só do manifesto. A tela inicial mistura as categorias com essa mesma regra e mostra até 8 itens.

## Como adicionar uma tool, um jogo ou uma aula

É igual ao tutorial, só muda a pasta:

```bash
cp -r tools/_modelo tools/minha-tool      # ferramenta → aba Tools, selo TOOL
cp -r games/_modelo games/meu-jogo        # jogo → aba Games, selo GAME
cp -r educacao/_modelo educacao/minha-aula  # aula → aba Educação, selo EDU
```

Edite o `index.html` (visual próprio, caminhos relativos, link `../../` para voltar) e o `project.json` (mesmos campos do tutorial), depois faça commit e push. O item aparece na aba certa e na tela inicial, e o link aponta para `tools/minha-tool/`, `games/meu-jogo/` ou `educacao/minha-aula/`.

## Como criar uma categoria nova

Basta **uma entrada** em `assets/js/categories.js`, por exemplo:

```js
{
  id: 'musicas', dir: 'musicas', tab: 'Músicas', badge: 'MÚSICA', icon: '🎵', accent: 'pink',
  noun: 'música(s)', lead: 'Trilhas e experimentos sonoros.',
  empty: { title: 'NENHUMA MÚSICA AINDA...', coin: 'PRESS PLAY', text: 'Adicione uma pasta em musicas/.' },
  open: '▶ Ouvir'
}
```

- A aba entra sozinha no menu (na ordem da lista, antes de **Links**), com busca, cards e estado vazio.
- `accent` pode ser `red`, `violet` ou `pink`.
- Crie a pasta `musicas/` com um `_modelo/` se quiser. Rode `node scripts/build-manifests.mjs` para criar `musicas/musicas.json`; o workflow também cria e faz commit dele.
- O workflow já lê a lista de categorias, então não precisa mexer nele.
- Textos traduzidos: adicione em `assets/i18n/*.json` as chaves `cat.musicas.tab`, `.badge`, `.noun`, `.lead`, `.emptyTitle`, `.emptyCoin`, `.emptyText` e `.open` (copie as de `cat.educacao.*`). Sem elas, a aba aparece com os textos de `categories.js` em qualquer idioma.

## Idiomas (i18n)

O site principal (menu, tela, abas, Links, jogo e rodapé) tem 15 idiomas:

| Código | Idioma | | Código | Idioma |
|---|---|---|---|---|
| `pt-BR` | Português (Brasil), padrão | | `ru` | Русский |
| `en` | English | | `bn` | বাংলা |
| `es` | Español | | `ja` | 日本語 |
| `zh-CN` | 简体中文 | | `de` | Deutsch |
| `hi` | हिन्दी | | `id` | Bahasa Indonesia |
| `ar` | العربية (direita → esquerda) | | `ko` | 한국어 |
| `fr` | Français | | `tr` | Türkçe |
| `it` | Italiano | | | |

As páginas de cada tutorial têm seus próprios idiomas e não fazem parte disso.

**Como o idioma é escolhido**, nesta ordem:

1. `?lang=<código>` na URL (ex.: `?lang=ar`). Vale só para aquela visita e não é salvo.
2. A escolha feita no seletor 🌐, salva no `localStorage` (`cleitinhodev.lang`).
3. O idioma do navegador (`navigator.languages`). `pt-PT` usa `pt-BR`, `zh-TW` usa `zh-CN`, `es-MX` usa `es`, e assim por diante.
4. Se o navegador estiver num idioma que o site não tem, usa **inglês**.

O seletor funciona no teclado: Enter/Espaço abre, ↑ ↓ Home End navegam, digitar as letras pula para o idioma, Enter escolhe, Esc fecha. Trocar de idioma atualiza `<html lang>`, `dir="rtl"` no árabe, as datas (`Intl.DateTimeFormat`) e a fonte. Chinês, japonês, coreano, hindi, bengali e árabe carregam uma fonte própria do Google Fonts, porque a fonte pixel só tem letras latinas.

**Arquivos:** cada idioma é `assets/i18n/<código>.json`, com as mesmas chaves do `pt-BR.json`. Chave faltando cai no pt-BR. `{nome}` é um valor que o site preenche (ex.: `{n}`, `{heart}`); mantenha-os no texto traduzido. Frases de fliperama como `INSERT COIN` e `PRESS START` ficam em inglês de propósito.

**Para mudar um texto:** edite a chave no JSON do idioma e rode `node scripts/check-i18n.mjs` (o workflow também roda).

**Para adicionar um idioma:**

1. Copie `assets/i18n/en.json` para `assets/i18n/<código>.json` e traduza os valores.
2. Adicione uma linha na lista `LANGS` de `assets/js/i18n.js` (código, sigla, nome nativo, `dir` e, se a escrita não for latina, a fonte do Google Fonts).
3. Se precisar de outra fonte, adicione um bloco `:root:lang(<código>)` no fim de `assets/css/style.css`, como os que já existem.
4. Rode `node scripts/check-i18n.mjs`.

## Rodando localmente

Abrir o `index.html` direto (`file://`) **não funciona**: o navegador bloqueia o `fetch()` dos manifestos. Use um servidor local:

```bash
node scripts/build-manifests.mjs  # atualiza os manifestos (Node 18+)
python3 -m http.server 8000       # na raiz do repositório
# abra http://localhost:8000
```

`node scripts/build-manifests.mjs --check` só confere se os manifestos estão em dia.

## Controles da tela

- **↑ / ↓** (ou os botões ▲ ▼) escolhem o item; **Enter** ou **START** abre.
- Clique num item para selecionar; clique de novo para abrir.
- **← / →** navegam entre as abas do menu.
- Em telas estreitas ou com idiomas de palavras longas, as abas vão para o menu ☰.
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
