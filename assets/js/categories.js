/*
 * CATEGORIAS DO SITE — fonte única usada pelo site (assets/js/app.js)
 * e pelo gerador de manifestos (scripts/build-manifests.mjs).
 *
 * Para criar uma categoria nova, adicione UM objeto aqui e crie a pasta
 * <dir>/ com um <dir>/<dir>.json contendo [] (o gerador também cria sozinho).
 * A aba entra no menu (antes de "Links") e os itens entram na tela inicial.
 *
 *   id      → id da aba / hash da URL (#id)
 *   dir     → pasta na raiz do repo; o manifesto fica em <dir>/<dir>.json
 *   tab     → texto do botão no menu
 *   badge   → selo curto na tela inicial (PROJETO / TOOL / GAME)
 *   icon    → emoji usado no card sem capa e no estado vazio
 *   accent  → "red" | "violet" | "pink" (cor de destaque da categoria)
 *   noun    → nome no plural para contadores ("3 de 5 tools")
 *   lead    → frase abaixo do título da aba
 *   empty   → { title, coin, text } do estado vazio
 *   open    → texto do botão para abrir um item
 */
(function (root) {
  root.SITE_CATEGORIES = [
    {
      id: 'projetos', dir: 'projects', tab: 'Projetos', badge: 'PROJETO', icon: '👾', accent: 'red',
      noun: 'projeto(s)', lead: 'Todos os tutoriais e projetos, do mais novo ao mais antigo.',
      empty: { title: 'NENHUM PROJETO AINDA...', coin: 'INSERT COIN', text: 'O cartucho está vazio. Os tutoriais aparecem aqui assim que forem adicionados em projects/.' },
      open: '▶ Abrir projeto'
    },
    {
      id: 'tools', dir: 'tools', tab: 'Tools', badge: 'TOOL', icon: '🛠️', accent: 'violet',
      noun: 'tool(s)', lead: 'Ferramentas e utilitários, do mais novo ao mais antigo.',
      empty: { title: 'CAIXA DE FERRAMENTAS VAZIA', coin: 'NO TOOLS FOUND', text: 'Nenhuma ferramenta na bancada ainda. Assim que uma pasta for adicionada em tools/, ela aparece aqui.' },
      open: '▶ Abrir tool'
    },
    {
      id: 'games', dir: 'games', tab: 'Games', badge: 'GAME', icon: '🎮', accent: 'pink',
      noun: 'jogo(s)', lead: 'Jogos e experimentos jogáveis, do mais novo ao mais antigo.',
      empty: { title: 'NENHUM JOGO AINDA...', coin: 'INSERT COIN', text: 'O fliperama está desligado. Assim que um jogo for adicionado em games/, ele aparece aqui.' },
      open: '▶ Jogar'
    }
  ];
})(typeof window !== 'undefined' ? window : globalThis);
