# ↗ Links externos (`externos/`)

Esta pasta serve para colocar no site **links para páginas que estão em outro lugar**: um vídeo no YouTube, um repositório no GitHub, um post, um curso, uma ferramenta online...

O link aparece **igual a um item normal**: na aba da categoria escolhida (Projetos, Tools, Games ou Educação) e na tela inicial (**Últimas adições**). A diferença:

- ganha o selo **`↗ LINK EXTERNO`**;
- o botão vira **↗ Visitar site** e abre **em uma nova aba**;
- sem imagem, aparece um ícone 🔗 no lugar da capa.

> Por que `externos/` e não `links/`? O site já tem a aba **Links** (redes sociais + mini game). Uma pasta `links/` ia parecer que é dessa aba. `externos/` deixa claro que são itens de fora que entram nas categorias.

## O formato: um arquivo `.json` por link

Cada link é **um único arquivo** dentro desta pasta: `externos/<nome>.json`. Não precisa de pasta, nem de `index.html`.

Exemplo mínimo (`externos/curso-git-youtube.json`):

```json
{
  "url": "https://www.youtube.com/@CleitinhoDEV",
  "category": "educacao",
  "title": "Curso de Git no YouTube"
}
```

Exemplo completo:

```json
{
  "url": "https://github.com/cleitinhodev/meu-projeto",
  "category": "projects",
  "title": "Meu Projeto no GitHub",
  "description": "O código-fonte completo, com instruções de instalação.",
  "date": "2026-11-02",
  "tags": ["github", "javascript"],
  "image": "imagens/meu-projeto.webp",
  "i18n": {
    "en": { "title": "My Project on GitHub", "description": "The full source code, with install instructions." }
  }
}
```

| Campo | Obrigatório? | O que é |
|---|---|---|
| `url` | ✅ sim | O endereço completo, **começando com `https://`**. |
| `category` | ✅ sim | Em qual aba o link entra: `projects`, `tools`, `games` ou `educacao`. Também vale: `projeto`, `projetos`, `tool`, `ferramenta`, `game`, `jogo`, `educação`, `edu`, `estudos`... (maiúsculas e acentos não importam). |
| `title` | ✅ sim | O nome que aparece no site. |
| `description` | não | Uma frase curta sobre o link. |
| `date` | não (recomendado) | `AAAA-MM-DD`, ex.: `2026-11-02`. Define a posição na lista (mais novo primeiro). Sem ela, vale a data do último commit do arquivo. |
| `tags` | não | Lista de palavras: `["html", "iniciante"]`. Também servem para a busca. |
| `image` | não | A capa. Pode ser um arquivo **dentro de `externos/`** (recomendado: `imagens/<nome>.webp`, e o arquivo fica em `externos/imagens/<nome>.webp`) **ou** um link `https://` para uma imagem. Sem `image`, aparece o ícone 🔗. |
| `i18n` | não | Título/descrição em outros idiomas, igual ao `project.json`: `{ "en": { "title": "...", "description": "..." } }`. |
| `langs` | não | Só use se o site de destino entender `?lang=`. Ex.: `["en", "es"]` faz o link abrir com `?lang=en` quando o site estiver em inglês. Sem `langs`, o link abre exatamente como você escreveu. |

**Nome do arquivo:** letras minúsculas sem acento, números e hífen, terminando em `.json` (ex.: `curso-git-youtube.json`). O nome não aparece no site, só precisa ser único.

**Ignorados de propósito:** arquivos que começam com `_` ou `.`. Por isso o [`_modelo.json`](_modelo.json) desta pasta não aparece no site. Para esconder um link sem apagar, renomeie para `_nome.json`.

## Jeito 1: pelo site do GitHub (o mais fácil)

1. Abra https://github.com/cleitinhodev/homepage/tree/main/externos
2. Clique em **Add file → Create new file**.
3. No nome do arquivo, digite por exemplo `curso-git-youtube.json`.
4. Cole o conteúdo (veja os [exemplos por categoria](#exemplos-por-categoria) abaixo) e troque os textos.
5. Clique em **Commit changes...**, deixe **Commit directly to the `main` branch** marcado e confirme.
6. Abra a aba **Actions** e espere o ✓ verde (1–2 minutos). Recarregue o site: o link aparece na aba da categoria e na tela inicial.

**Com imagem local:** abra https://github.com/cleitinhodev/homepage/tree/main/externos/imagens, clique em **Add file → Upload files**, arraste a imagem (ex.: `curso-git-youtube.webp`) e faça o commit. No `.json`, use `"image": "imagens/curso-git-youtube.webp"`. Dica: imagens leves (WebP ou JPG, até ~300 KB) deixam o site rápido.

## Jeito 2: pelo terminal (git)

```bash
cd homepage
git pull                                   # sempre, antes de começar
cp externos/_modelo.json externos/curso-git-youtube.json
# edite externos/curso-git-youtube.json no seu editor
# (opcional) coloque a capa em externos/imagens/curso-git-youtube.webp

node scripts/build-manifests.mjs           # (opcional) confere e mostra avisos
git add externos
git commit -m "Adiciona link externo: curso de Git"
git push
```

No Windows (PowerShell): `Copy-Item externos\_modelo.json externos\curso-git-youtube.json`

Quer ver antes de publicar? Rode `node scripts/build-manifests.mjs` e depois `python3 -m http.server 8000` na raiz e abra http://localhost:8000. Só não faça commit dos manifestos alterados se não quiser: o Actions recria eles de qualquer jeito.

## Exemplos por categoria

**Projetos** (`externos/repo-renemya.json`):

```json
{
  "url": "https://github.com/cleitinhodev/renemya",
  "category": "projeto",
  "title": "Renemya no GitHub",
  "description": "O código-fonte do Renemya.",
  "date": "2026-11-02",
  "tags": ["github"]
}
```

**Tools** (`externos/conversor-online.json`):

```json
{
  "url": "https://exemplo.com/conversor",
  "category": "tool",
  "title": "Conversor de imagens online",
  "description": "Converte PNG para WebP direto no navegador.",
  "date": "2026-11-03",
  "image": "https://exemplo.com/capa-conversor.png"
}
```

**Games** (`externos/meu-jogo-itch.json`):

```json
{
  "url": "https://exemplo.itch.io/meu-jogo",
  "category": "game",
  "title": "Meu jogo no itch.io",
  "description": "Um jogo de plataforma 2D feito em uma game jam.",
  "date": "2026-11-04",
  "image": "imagens/meu-jogo-itch.webp"
}
```

**Educação** (`externos/aula-python-youtube.json`):

```json
{
  "url": "https://www.youtube.com/@CleitinhoDEV",
  "category": "educação",
  "title": "Aula de Python no YouTube",
  "description": "Variáveis, listas e laços em 20 minutos.",
  "date": "2026-11-05",
  "tags": ["python", "video"]
}
```

## Deu errado? (o link não aparece)

O gerador **pula** o link e escreve um aviso (no GitHub Actions aparece como ⚠ *warning* amarelo no resumo do workflow, com o nome do arquivo). Os motivos:

- **falta `url`**, ou ela não começa com `https://` (`http://` não é aceito);
- **falta `category`** ou ela não existe (o aviso mostra as opções válidas);
- **falta `title`**;
- **JSON inválido**: vírgula sobrando no fim, aspas simples `'` em vez de `"`, chave sem aspas. Valide em https://jsonlint.com/;
- o nome do arquivo tem espaço/acento, começa com `_`/`.` ou não termina em `.json`.

A imagem não aparece? Se o caminho estiver errado (arquivo não existe, começa com `/`, sai da pasta com `../`), o link entra **sem capa** e o log mostra um aviso. Se a imagem remota sair do ar, o site mostra o ícone 🔗.

> 🚫 Não edite os manifestos (`projects/projects.json` etc.) à mão: o link é copiado para lá automaticamente a cada push.
