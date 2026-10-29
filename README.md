# ▶ CLEITINHO.DEV — homepage

A homepage do **CleitinhoDEV**, com cara de fliperama retrô (synthwave vermelho e roxo, scanlines de monitor CRT, botões com neon e glitch). Ela é a vitrine dos meus **tutoriais, ferramentas, jogos e páginas de estudo**. Logo na entrada tem uma "tela" de fliperama com as **últimas adições** de todas as categorias juntas.

🌐 **Site:** https://cleitinhodev.github.io/homepage/

| | |
|---|---|
| 🌍 Site | https://www.bugzinho.com/ |
| 💜 Doação | https://www.bugzinho.com/donate |
| 🎨 Patreon | https://patreon.com/CleitinhoDEV |
| 📺 YouTube | https://www.youtube.com/@CleitinhoDEV |

## Sumário

1. [Visão geral](#visão-geral)
2. [Estrutura de pastas](#estrutura-de-pastas)
3. [Como adicionar um item (passo a passo)](#como-adicionar-um-item-passo-a-passo)
   - [Antes de começar: regras do nome da pasta](#antes-de-começar-regras-do-nome-da-pasta)
   - [O arquivo `project.json`](#o-arquivo-projectjson)
   - [Jeito 1: pelo terminal (git)](#jeito-1-pelo-terminal-git)
   - [Jeito 2: pelo site do GitHub (sem instalar nada)](#jeito-2-pelo-site-do-github-sem-instalar-nada)
   - [Projetos (`projects/`)](#projetos-projects)
   - [Tools (`tools/`)](#tools-tools)
   - [Games (`games/`)](#games-games)
   - [Educação (`educacao/`)](#educação-educacao)
4. [Como os manifestos são gerados (GitHub Actions)](#como-os-manifestos-são-gerados-github-actions)
5. [Ver o site no seu computador](#ver-o-site-no-seu-computador)
6. [Problemas comuns (FAQ)](#problemas-comuns-faq)
7. [Criar uma categoria nova](#criar-uma-categoria-nova)
8. [Idiomas do site (i18n)](#idiomas-do-site-i18n)
9. [Controles e a aba Links + RETRO INVADER](#controles-e-a-aba-links--retro-invader)
10. [Publicação (GitHub Pages)](#publicação-github-pages)
11. [Licença](#licença)

## Visão geral

- **Tela inicial (Principal):** um monitor de fliperama que lista os itens mais novos de todas as categorias (até 8), cada um com um selo: `PROJETO`, `TOOL`, `GAME` ou `EDU`. Escolha com ↑ ↓ e abra com **START**.
- **Categorias:** cada uma tem **uma aba** no menu e **uma pasta** no repositório. Cada item é uma subpasta com o seu próprio `index.html`, ou seja, uma página com o visual que você quiser.

  | Aba | Pasta | Selo | Para quê |
  |---|---|---|---|
  | Projetos | [`projects/`](projects/) | `PROJETO` | tutoriais e projetos |
  | Tools | [`tools/`](tools/) | `TOOL` | ferramentas e utilitários |
  | Games | [`games/`](games/) | `GAME` | jogos e experimentos jogáveis |
  | Educação | [`educacao/`](educacao/) | `EDU` | aulas, guias e materiais de estudo |

- **Automático:** você só cria a pasta. Um script (`scripts/build-manifests.mjs`) roda no GitHub Actions a cada push, monta a lista de itens de cada categoria (o "manifesto") e publica o site.
- **15 idiomas:** o site principal muda de idioma pelo seletor 🌐 no topo. Veja [Idiomas do site](#idiomas-do-site-i18n).
- **Aba Links:** os links acima e o mini game **RETRO INVADER**.

## Estrutura de pastas

```
.
├── index.html                  # página principal (menu + tela CRT + abas)
├── assets/
│   ├── css/style.css           # visual retrô do site principal
│   ├── i18n/<código>.json      # textos do site em cada idioma (pt-BR.json é a fonte)
│   ├── js/categories.js        # LISTA DE CATEGORIAS, usada pelo site e pelo gerador
│   ├── js/i18n.js              # idiomas: lista, detecção, seletor, traduções
│   ├── js/app.js               # navegação, tela interativa, abas de categoria
│   ├── js/game.js              # mini game RETRO INVADER (aba Links)
│   └── audio/game-theme.mp3    # música do jogo (só toca ao dar play)
├── projects/                   # aba Projetos
│   ├── README.md               # passo a passo desta pasta
│   ├── projects.json           # manifesto GERADO automaticamente (não edite à mão)
│   ├── _modelo/                # modelo para copiar (ignorado por começar com "_")
│   │   ├── index.html
│   │   ├── project.json
│   │   └── README.md
│   └── <seu-tutorial>/         # cada item: uma pasta com seu próprio visual
│       ├── index.html          # obrigatório
│       ├── project.json        # opcional (título, descrição, data, capa...)
│       └── ...                 # imagens, CSS, JS do item
├── tools/                      # aba Tools    (mesma estrutura, manifesto tools/tools.json)
├── games/                      # aba Games    (mesma estrutura, manifesto games/games.json)
├── educacao/                   # aba Educação (mesma estrutura, manifesto educacao/educacao.json)
├── scripts/
│   ├── build-manifests.mjs     # gera os manifestos de todas as categorias
│   ├── build-projects.mjs      # nome antigo (ainda funciona: chama o build-manifests)
│   └── check-i18n.mjs          # confere se todos os idiomas têm as mesmas chaves
└── .github/workflows/site.yml  # confere traduções, gera manifestos e publica no GitHub Pages
```

## Como adicionar um item (passo a passo)

O caminho é o mesmo para as quatro categorias. Só muda a pasta: `projects/`, `tools/`, `games/` ou `educacao/`. Cada pasta tem um `README.md` com o passo a passo só dela.

### Antes de começar: regras do nome da pasta

O nome da pasta vira o endereço do item: `projects/flexbox-na-pratica/` abre em `https://cleitinhodev.github.io/homepage/projects/flexbox-na-pratica/`.

- ✅ Use **letras minúsculas sem acento, números e hífen**: `flexbox-na-pratica`, `conversor-de-cores`, `pixel-runner-2`.
- ✅ O gerador também aceita `_` e `.` no meio e letras maiúsculas, mas minúsculas com hífen evitam confusão (o GitHub Pages diferencia `Pasta` de `pasta`).
- ❌ Sem espaços, acentos ou `ç` (`Meu Tutorial`, `educação-1`): a pasta é ignorada e aparece um aviso no log.
- ❌ Começar com `_` ou `.` faz a pasta ser **ignorada de propósito** (é assim que o `_modelo` fica fora do site).
- A pasta precisa ficar **direto** dentro da categoria (`projects/meu-item/index.html`). Uma pasta dentro de outra (`projects/grupo/meu-item/`) não entra.
- Dentro dela é obrigatório um arquivo chamado exatamente `index.html` (minúsculo).

### O arquivo `project.json`

É opcional, mas recomendado. Ele diz ao site como mostrar o item na lista:

| Campo | O que é | Se faltar |
|---|---|---|
| `title` | título do card | usa o `<title>` do `index.html` (ou o nome da pasta) |
| `description` | frase curta | usa a `<meta name="description">` do `index.html` |
| `date` | data no formato `AAAA-MM-DD`; define a ordem | usa a data do último commit da pasta |
| `tags` | lista de palavras para a busca (o card mostra até 8) | sem tags |
| `cover` | imagem de capa, caminho **relativo à pasta do item** (`capa.png`, `img/capa.webp`) ou um link `https://` | mostra o ícone da categoria |
| `i18n` | título e descrição em outros idiomas (`en`, `es`, `ja`...) | usa `title`/`description` em qualquer idioma |
| `langs` | idiomas que a **página do item** entende em `?lang=` | o link abre sem `?lang=` |

Exemplo completo (os exemplos de cada categoria estão mais abaixo):

```json
{
  "title": "Flexbox na prática",
  "description": "Monte layouts responsivos com Flexbox, do zero ao card perfeito.",
  "date": "2026-11-02",
  "tags": ["css", "layout", "iniciante"],
  "cover": "img/capa.webp",
  "i18n": {
    "en": { "title": "Flexbox in practice", "description": "Build responsive layouts with Flexbox, from zero to the perfect card." },
    "es": { "title": "Flexbox en la práctica", "description": "Crea diseños responsivos con Flexbox, desde cero hasta la tarjeta perfecta." }
  },
  "langs": ["pt-BR", "en", "es"]
}
```

Dicas:

- JSON é exigente: use aspas duplas, e não deixe vírgula depois do último item. Se o arquivo estiver inválido, o gerador avisa no log e usa os dados do `index.html`.
- `i18n` usa os códigos do site: `en`, `es`, `fr`, `de`, `it`, `ru`, `tr`, `id`, `ar`, `hi`, `bn`, `ja`, `ko`, `zh-CN`. Idioma sem tradução mostra o texto padrão.
- `langs` serve para páginas que já têm idiomas próprios e leem `?lang=` na URL. Escreva os códigos do jeito que **a sua página** espera (`pt-BR` ou `pt_BR`). Quando o idioma escolhido no site estiver na lista, o link abre como `projects/meu-item/?lang=<código>`. Se a sua página só tem um idioma, apague `i18n` e `langs`.
- Não tem capa? Apague a linha `cover`.

### Jeito 1: pelo terminal (git)

Precisa do [Git](https://git-scm.com/) instalado. O [Node.js 18+](https://nodejs.org/) e o Python são opcionais, só para ver o site antes de publicar.

1. **Baixe o repositório** (só na primeira vez) ou **atualize** o que você já tem:

   ```bash
   git clone https://github.com/cleitinhodev/homepage.git   # primeira vez
   cd homepage
   git pull                                                   # sempre, antes de começar
   ```

2. **Copie o modelo** da categoria com o nome novo (exemplo com `projects/`; troque pela pasta que quiser):

   ```bash
   cp -r projects/_modelo projects/flexbox-na-pratica
   ```

   No Windows (PowerShell): `Copy-Item -Recurse projects\_modelo projects\flexbox-na-pratica`

3. **Edite** `projects/flexbox-na-pratica/index.html` (a página em si) e `project.json` (como ela aparece na lista). Coloque imagens e outros arquivos dentro da mesma pasta e use **caminhos relativos** (`img/foto.png`, nunca `/img/foto.png`). Deixe um link `../../` para voltar ao site.
4. **(Opcional) Veja antes de publicar**: siga [Ver o site no seu computador](#ver-o-site-no-seu-computador).
5. **Publique:**

   ```bash
   git add .
   git commit -m "Adiciona tutorial Flexbox na prática"
   git push
   ```

6. Abra a aba **Actions** do repositório e espere o ✓ verde (1–2 minutos). Pronto: o item aparece na aba da categoria e na tela inicial.
7. O Actions faz um commit próprio atualizando o manifesto. Por isso, **rode `git pull` antes da próxima alteração**.

### Jeito 2: pelo site do GitHub (sem instalar nada)

1. **No seu computador**, prepare uma pasta com o nome certo (ex.: `flexbox-na-pratica`) contendo o `index.html`, o `project.json` e as imagens. Dá para baixar o modelo abrindo `projects/_modelo/` no GitHub e copiando os arquivos.
2. No GitHub, abra a pasta da categoria, por exemplo https://github.com/cleitinhodev/homepage/tree/main/projects
3. Clique em **Add file → Upload files**.
4. **Arraste a pasta inteira** (não só os arquivos de dentro) para a área de upload. Assim o GitHub cria `projects/flexbox-na-pratica/...`. Se arrastar só os arquivos, eles caem soltos em `projects/` e o item não aparece.
5. Em **Commit changes**, escreva uma mensagem (ex.: `Adiciona tutorial Flexbox na prática`), deixe **Commit directly to the `main` branch** marcado e clique em **Commit changes**.
6. Abra a aba **Actions** e espere o ✓ verde. Depois recarregue o site.

> ⚠️ **Limite do upload pelo navegador:** no máximo **100 arquivos por vez** (e até 25 MB por arquivo). Se a sua pasta tiver mais, faça em partes: primeiro suba a pasta com o `index.html` e parte dos arquivos; depois entre em `projects/flexbox-na-pratica/` no GitHub e faça novos uploads com o resto, respeitando as subpastas (ex.: entre em `img/` antes de subir as imagens). Cada upload é um commit e o site se atualiza a cada um. Muitos arquivos? Prefira o [terminal](#jeito-1-pelo-terminal-git).

Para criar uma página simples direto no navegador: dentro da pasta da categoria, **Add file → Create new file** e digite `flexbox-na-pratica/index.html` no nome. A `/` cria a pasta. Depois repita com `flexbox-na-pratica/project.json`.

Para editar um item depois: abra o arquivo no GitHub, clique no ✏️ (Edit), altere e faça **Commit changes**.

### Projetos (`projects/`)

Tutoriais e projetos em geral. Aparecem na aba **Projetos** com o selo `PROJETO`. Passo a passo da pasta: [projects/README.md](projects/README.md).

```bash
cp -r projects/_modelo projects/flexbox-na-pratica
```

```json
{
  "title": "Flexbox na prática",
  "description": "Monte layouts responsivos com Flexbox, do zero ao card perfeito.",
  "date": "2026-11-02",
  "tags": ["css", "layout", "iniciante"],
  "cover": "img/capa.webp",
  "i18n": {
    "en": { "title": "Flexbox in practice", "description": "Build responsive layouts with Flexbox, from zero to the perfect card." },
    "es": { "title": "Flexbox en la práctica", "description": "Crea diseños responsivos con Flexbox, desde cero hasta la tarjeta perfecta." }
  },
  "langs": ["pt-BR", "en", "es"]
}
```

Os tutoriais publicados ([Renemya](projects/renemya-tutorial/project.json) e [Easy Game Translator](projects/easy-game-translator-tutorial/project.json)) são exemplos reais de páginas com muitos idiomas.

### Tools (`tools/`)

Ferramentas e utilitários que rodam no navegador (conversores, geradores, calculadoras...). Aparecem na aba **Tools** com o selo `TOOL`. Passo a passo da pasta: [tools/README.md](tools/README.md).

```bash
cp -r tools/_modelo tools/conversor-de-cores
```

```json
{
  "title": "Conversor de cores",
  "description": "Converta cores entre HEX, RGB e HSL e copie o resultado com um clique.",
  "date": "2026-11-05",
  "tags": ["cores", "css", "utilitário"],
  "cover": "capa.png",
  "i18n": {
    "en": { "title": "Color converter", "description": "Convert colors between HEX, RGB and HSL and copy the result with one click." },
    "es": { "title": "Conversor de colores", "description": "Convierte colores entre HEX, RGB y HSL y copia el resultado con un clic." }
  }
}
```

### Games (`games/`)

Jogos e experimentos jogáveis (HTML5, canvas...). Aparecem na aba **Games** com o selo `GAME`. Passo a passo da pasta: [games/README.md](games/README.md).

```bash
cp -r games/_modelo games/pixel-runner
```

```json
{
  "title": "Pixel Runner",
  "description": "Corra, pule e desvie dos obstáculos neste runner de 8 bits. Setas ou toque para jogar.",
  "date": "2026-11-10",
  "tags": ["arcade", "canvas", "8-bit"],
  "cover": "assets/capa.png",
  "i18n": {
    "en": { "title": "Pixel Runner", "description": "Run, jump and dodge obstacles in this 8-bit runner. Arrow keys or touch to play." },
    "es": { "title": "Pixel Runner", "description": "Corre, salta y esquiva obstáculos en este runner de 8 bits. Flechas o toque para jugar." }
  },
  "langs": ["pt-BR", "en", "es"]
}
```

### Educação (`educacao/`)

Aulas, guias e materiais de estudo. Aparecem na aba **Educação** com o selo `EDU`. Passo a passo da pasta: [educacao/README.md](educacao/README.md).

```bash
cp -r educacao/_modelo educacao/fracoes-para-iniciantes
```

```json
{
  "title": "Frações para iniciantes",
  "description": "Entenda frações com pizzas, barras e exercícios interativos com correção na hora.",
  "date": "2026-11-12",
  "tags": ["matemática", "frações", "ensino fundamental"],
  "cover": "img/capa.webp",
  "i18n": {
    "en": { "title": "Fractions for beginners", "description": "Understand fractions with pizzas, bars and interactive exercises with instant feedback." },
    "es": { "title": "Fracciones para principiantes", "description": "Entiende las fracciones con pizzas, barras y ejercicios interactivos con corrección al instante." }
  }
}
```

## Como os manifestos são gerados (GitHub Actions)

Cada categoria tem um **manifesto**: `projects/projects.json`, `tools/tools.json`, `games/games.json` e `educacao/educacao.json`. É a lista que o site lê para montar a tela inicial e as abas.

> 🚫 **Não edite os manifestos à mão.** Eles são recriados do zero a cada push, então qualquer mudança manual some. Para mudar um título, uma data ou uma capa, edite o `project.json` do item.

A cada push na `main`, o workflow **Site (manifesto + Pages)** (`.github/workflows/site.yml`):

1. confere as traduções do site (`node scripts/check-i18n.mjs`);
2. roda `node scripts/build-manifests.mjs`, que olha cada subpasta das categorias:
   - entra só a pasta com `index.html`;
   - pastas começando com `_` ou `.` e arquivos soltos (como os `README.md`) são ignorados;
   - os dados vêm do `project.json` e, no que faltar, do `index.html` e do git;
3. se algum manifesto mudou, faz um commit `chore: atualiza manifestos [skip ci]`;
4. publica o site no GitHub Pages.

**Ordem dos itens:** a `date` mais nova vem primeiro. Na mesma data, vem antes o que entrou no repositório por último (o gerador guarda isso no campo `added`, a data do primeiro commit da pasta). A tela inicial mistura todas as categorias com essa regra e mostra até 8 itens.

Comandos úteis (Node 18+, na raiz do repositório):

```bash
node scripts/build-manifests.mjs          # recria os manifestos
node scripts/build-manifests.mjs --check  # só confere se estão em dia (não muda nada)
node scripts/check-i18n.mjs               # confere as traduções do site
```

## Ver o site no seu computador

Abrir o `index.html` com dois cliques (`file://`) **não funciona**: o navegador bloqueia a leitura dos manifestos. Use um servidor local, na raiz do repositório:

```bash
node scripts/build-manifests.mjs   # inclui os itens novos na lista
python3 -m http.server 8000        # ou: npx serve .
```

Abra http://localhost:8000. Para testar um idioma: http://localhost:8000/?lang=en. Para parar o servidor, use `Ctrl+C`.

## Problemas comuns (FAQ)

**Meu item não aparece no site.**

- Espere o ✓ verde na aba **Actions** (1–2 min) e recarregue com `Ctrl+F5`. Se o workflow falhou (❌), abra o log: os avisos começam com `⚠`.
- Confira o caminho: tem que ser `<categoria>/<pasta>/index.html`, com `index.html` em minúsculas e a pasta **direto** dentro da categoria.
- Confira o [nome da pasta](#antes-de-começar-regras-do-nome-da-pasta): sem espaço, sem acento, sem começar com `_` ou `.`.
- No upload pelo navegador, confira se você arrastou **a pasta** e não só os arquivos.

**O título ou a descrição estão errados.** Se o `project.json` tiver um erro de JSON (vírgula sobrando, aspas simples), ele é ignorado e o site usa o `<title>` do `index.html`. Valide o arquivo (ex.: em https://jsonlint.com/) ou rode `node scripts/build-manifests.mjs`, que mostra o aviso.

**O item está na posição errada.** A ordem vem da `date` do `project.json` (formato `AAAA-MM-DD`, ex.: `2026-11-02`). Sem `date`, vale a data do último commit da pasta, que muda toda vez que você edita algo nela. Para fixar a posição, defina `date`.

**Imagens, CSS ou links quebrados na página do item.** O site fica em `https://cleitinhodev.github.io/homepage/`, não na raiz do domínio. Um caminho que começa com `/` (`/img/foto.png`) procura em `cleitinhodev.github.io/img/` e não acha. Use caminhos relativos à pasta do item: `img/foto.png` ou `./img/foto.png`. Confira também maiúsculas e minúsculas: `Foto.PNG` e `foto.png` são arquivos diferentes no site, mesmo que no Windows funcione.

**A capa não aparece.** `cover` precisa ser relativo à pasta do item (`capa.png`, `img/capa.webp`) ou um link `https://`. Caminho com `/` no começo, ou que sai da pasta (`../`), é descartado pelo gerador. Se a imagem não carregar, o card mostra um ícone 🕹️ no lugar.

**`git push` foi recusado (`rejected`, `fetch first`).** O Actions fez um commit atualizando o manifesto depois do seu último push. Rode `git pull` e depois `git push` de novo. Se o `git pull` reclamar de mudanças locais em um manifesto, descarte-as (`git checkout -- projects/projects.json`) e tente de novo: o Actions recria o arquivo.

**O site abriu no idioma errado.** Escolha no seletor 🌐 (fica salvo no navegador) ou abra com `?lang=pt-BR`. Na primeira visita, o site usa o idioma do navegador e, se não tiver esse idioma, usa inglês.

**O título do meu item não muda quando troco o idioma.** Adicione o idioma em `i18n` no `project.json`. Sem tradução, o texto padrão aparece em todos os idiomas.

**O link do item não abre a página no idioma do site.** A página precisa entender `?lang=` e o código precisa estar em `langs`, escrito do jeito que a página espera.

**Quero esconder um item sem apagar.** Renomeie a pasta para começar com `_` (ex.: `_flexbox-na-pratica`). O endereço antigo deixa de funcionar.

## Criar uma categoria nova

1. Adicione **um objeto** em `assets/js/categories.js` (a ordem da lista é a ordem das abas, antes de **Links**):

   ```js
   {
     id: 'musicas', dir: 'musicas', tab: 'Músicas', badge: 'MÚSICA', icon: '🎵', accent: 'pink',
     noun: 'música(s)', lead: 'Trilhas e experimentos sonoros.',
     empty: { title: 'NENHUMA MÚSICA AINDA...', coin: 'PRESS PLAY', text: 'Adicione uma pasta em musicas/.' },
     open: '▶ Ouvir'
   }
   ```

   - `id` é o endereço da aba (`#musicas`); `dir` é a pasta; `accent` pode ser `red`, `violet` ou `pink`.
   - A aba ganha busca, cards e estado vazio automaticamente, e os itens entram na tela inicial com o selo `badge`.
2. Crie a pasta `musicas/` (de preferência com um `_modelo/` e um `README.md`, copiando os de `educacao/`).
3. Rode `node scripts/build-manifests.mjs` para criar `musicas/musicas.json` (o workflow também cria). O workflow já lê a lista de categorias, então não precisa mexer nele.
4. Traduza os textos da aba: em cada `assets/i18n/*.json`, adicione as chaves `cat.musicas.tab`, `.badge`, `.noun`, `.lead`, `.emptyTitle`, `.emptyCoin`, `.emptyText` e `.open` (copie as de `cat.educacao.*`). Sem elas, a aba aparece com os textos de `categories.js` em todos os idiomas. Rode `node scripts/check-i18n.mjs` no fim.

## Idiomas do site (i18n)

O site principal (menu, tela, abas, Links, jogo e rodapé) tem 15 idiomas. As páginas de cada item têm seus próprios idiomas (ou não) e não fazem parte disso.

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

**Como o idioma é escolhido**, nesta ordem:

1. `?lang=<código>` na URL (ex.: `?lang=ar`). Vale só para aquela visita e não é salvo.
2. A escolha feita no seletor 🌐, salva no navegador (`localStorage`, chave `cleitinhodev.lang`).
3. O idioma do navegador. Variantes usam o idioma base: `pt-PT` usa `pt-BR`, `zh-TW` usa `zh-CN`, `es-MX` usa `es`.
4. Se o navegador estiver num idioma que o site não tem, usa **inglês**.

O seletor funciona pelo teclado: Enter ou Espaço abre, ↑ ↓ Home End navegam, digitar letras pula para o idioma, Enter escolhe e Esc fecha. Trocar o idioma atualiza `<html lang>`, o `dir="rtl"` do árabe, as datas e a fonte. Chinês, japonês, coreano, hindi, bengali e árabe carregam uma fonte própria (Google Fonts), porque a fonte pixel só tem letras latinas.

**Arquivos:** cada idioma é `assets/i18n/<código>.json`, com as mesmas chaves do `pt-BR.json`. Uma chave que faltar usa o texto em pt-BR. Trechos como `{n}` e `{heart}` são preenchidos pelo site: mantenha-os no texto traduzido. Frases de fliperama como `INSERT COIN` e `PRESS START` ficam em inglês de propósito.

**Mudar um texto:** edite a chave no JSON do idioma e rode `node scripts/check-i18n.mjs` (o workflow também roda e falha se algo estiver faltando).

**Adicionar um idioma:**

1. Copie `assets/i18n/en.json` para `assets/i18n/<código>.json` e traduza os valores (não as chaves).
2. Adicione uma linha na lista `LANGS` de `assets/js/i18n.js`: código, sigla, nome nativo, `dir` (`ltr` ou `rtl`) e, se a escrita não for latina, a fonte do Google Fonts.
3. Se precisar de outra fonte ou tamanho, adicione um bloco `:root:lang(<código>)` no fim de `assets/css/style.css`, como os que já existem.
4. Rode `node scripts/check-i18n.mjs`.

## Controles e a aba Links + RETRO INVADER

Tela inicial:

- **↑ / ↓** (ou os botões ▲ ▼) escolhem o item; **Enter** ou **START** abre.
- Clique num item para selecionar; clique de novo para abrir.
- **← / →** navegam entre as abas do menu.
- Em telas estreitas, ou em idiomas de palavras longas, as abas vão para o menu ☰.
- Respeita `prefers-reduced-motion` (animações reduzidas).

A aba **Links** (`#links`; o antigo `#sobre` redireciona para ela) tem os botões para o site, a doação, o Patreon e o YouTube. Embaixo fica o mini game **RETRO INVADER**:

- Fica parado na tela de título até apertar **Jogar**, **Enter** ou tocar na tela.
- **← →** ou **A D** movem, **Espaço** atira, **P** ou **Esc** pausam. No celular aparecem botões de toque.
- As ondas ficam cada vez mais rápidas, com tiros inimigos, disco voador bônus e 3 vidas. O recorde fica salvo no navegador.
- A música (`assets/audio/game-theme.mp3`) só é baixada e tocada ao dar play. Ela pausa no pause, no game over e ao trocar de aba. A escolha do botão **Som** fica salva.

## Publicação (GitHub Pages)

Em *Settings → Pages*, a fonte (*Source*) deve ser **GitHub Actions**. Todos os caminhos do site são relativos, então ele funciona em `https://cleitinhodev.github.io/homepage/`.

## Licença

MIT — veja [LICENSE](LICENSE).
