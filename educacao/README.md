# 📚 Educação (`educacao/`)

Esta pasta guarda **aulas, guias e materiais de estudo**. Exemplos: uma aula de matemática, um resumo de história, uma lista de exercícios interativa, um guia de estudos.

Cada subpasta com um `index.html` vira um item da aba **Educação** do site, com o selo `EDU`, e entra na lista de últimas adições da tela inicial.

Ainda não há aulas publicadas. A aba mostra "SALA DE AULA VAZIA..." até a primeira chegar.

> Guia completo do site (regras gerais, GitHub Actions, idiomas, FAQ): [README principal](../README.md).

## O que tem aqui

```
educacao/
├── README.md        # este arquivo (o gerador ignora arquivos soltos)
├── educacao.json    # manifesto GERADO pelo GitHub Actions: não edite à mão
├── _modelo/         # modelo para copiar (ignorado por começar com "_")
└── fracoes-para-iniciantes/ # exemplo: aula nova
    ├── index.html   # obrigatório: a página
    ├── project.json # opcional: como aparece na lista
    └── ...          # imagens, CSS, JS
```

## Nome da pasta

- Só **letras minúsculas sem acento, números e hífen**: `fracoes-para-iniciantes`.
- Sem espaços, acentos ou `ç`. Não comece com `_` ou `.`, porque essas pastas são ignoradas.
- A pasta fica **direto** em `educacao/`. O nome dela vira o endereço: `https://cleitinhodev.github.io/homepage/educacao/fracoes-para-iniciantes/`

## Passo a passo pelo terminal (git)

```bash
git clone https://github.com/cleitinhodev/homepage.git   # só na primeira vez
cd homepage
git pull                                                   # sempre, antes de começar
cp -r educacao/_modelo educacao/fracoes-para-iniciantes
```

No Windows (PowerShell), troque o `cp` por `Copy-Item -Recurse educacao\_modelo educacao\fracoes-para-iniciantes`.

1. Edite `educacao/fracoes-para-iniciantes/index.html`: o visual é todo seu. Use **caminhos relativos** (`img/foto.png`, nunca `/img/foto.png`) e deixe um link `../../` para voltar ao site.
2. Edite `educacao/fracoes-para-iniciantes/project.json` (exemplo abaixo).
3. (Opcional) Veja antes de publicar:

   ```bash
   node scripts/build-manifests.mjs   # coloca uma aula nova na lista
   python3 -m http.server 8000        # abra http://localhost:8000/#educacao
   ```

4. Publique:

   ```bash
   git add .
   git commit -m "Adiciona aula Frações para iniciantes"
   git push
   ```

5. Espere o ✓ verde na aba **Actions** do GitHub (1–2 minutos) e recarregue o site.
6. Antes da próxima alteração, rode `git pull`: o Actions faz um commit próprio atualizando `educacao/educacao.json`.

## Passo a passo pelo site do GitHub

1. No computador, prepare a pasta `fracoes-para-iniciantes` com o `index.html`, o `project.json` e as imagens.
2. Abra https://github.com/cleitinhodev/homepage/tree/main/educacao e clique em **Add file → Upload files**.
3. **Arraste a pasta inteira** (não só os arquivos de dentro), para o GitHub criar `educacao/fracoes-para-iniciantes/...`.
4. Escreva a mensagem do commit (ex.: `Adiciona aula Frações para iniciantes`), deixe **Commit directly to the `main` branch** e clique em **Commit changes**.
5. Espere o ✓ verde na aba **Actions** e recarregue o site.

> ⚠️ O upload pelo navegador aceita **no máximo 100 arquivos por vez** (e 25 MB por arquivo). Com mais arquivos, suba em partes: primeiro a pasta com o `index.html`, depois entre em `educacao/fracoes-para-iniciantes/` no GitHub e envie o resto (entrando nas subpastas, como `img/`, antes de enviar os arquivos delas). Ou use o terminal.

## Exemplo de `project.json`

```json
{
  "title": "Frações para iniciantes",
  "description": "Entenda frações com pizzas, barras e exercícios interativos com correção na hora.",
  "date": "2026-11-12",
  "tags": [
    "matemática",
    "frações",
    "ensino fundamental"
  ],
  "cover": "img/capa.webp",
  "i18n": {
    "en": {
      "title": "Fractions for beginners",
      "description": "Understand fractions with pizzas, bars and interactive exercises with instant feedback."
    },
    "es": {
      "title": "Fracciones para principiantes",
      "description": "Entiende las fracciones con pizzas, barras y ejercicios interactivos con corrección al instante."
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
| `cover` | capa, relativa à pasta do item (ou um link `https://`). Sem capa, apague a linha e o card mostra 📚 |
| `i18n` | opcional: título e descrição em outros idiomas do site (`en`, `es`, `fr`, `de`, `it`, `ru`, `tr`, `id`, `ar`, `hi`, `bn`, `ja`, `ko`, `zh-CN`) |
| `langs` | opcional: idiomas que a **sua página** entende em `?lang=`. Com eles, o link abre como `educacao/fracoes-para-iniciantes/?lang=en` |

Todos os campos são opcionais. Use aspas duplas e não deixe vírgula depois do último item.

## Dicas para esta pasta

- O nome da **pasta da categoria** é `educacao`, sem `ç` e sem til, e o nome da pasta da aula também não pode ter acentos: `fracoes-para-iniciantes`, não `frações-para-iniciantes`. Já o `title` pode ter acentos à vontade.
- Use `tags` com a matéria e o nível (`matemática`, `ensino médio`...). A busca da aba procura no título, na descrição e nas tags.
- PDFs e outros materiais podem ficar dentro da pasta da aula, com links relativos no `index.html` (ex.: `<a href="exercicios.pdf">`).
- Não edite `educacao.json`: ele é recriado a cada push. Para mudar algo na lista, mude o `project.json` do item.
- Item não apareceu, imagem quebrada ou ordem errada? Veja [Problemas comuns (FAQ)](../README.md#problemas-comuns-faq).
