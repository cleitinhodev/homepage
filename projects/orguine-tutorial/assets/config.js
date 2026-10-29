/* =====================================================================
   ⚙️  CONFIGURAÇÃO DO TUTORIAL DO ORGUINE — EDITE AQUI
   ---------------------------------------------------------------------
   Este é o ÚNICO lugar para mudar versão, data e links. Vale para TODAS
   as páginas de idioma (index.html e tutorial-orguine.en.html).

   • Mude só o que está entre aspas '...'. Não apague vírgulas nem chaves.
   • versao ........ número da versão mostrado na página (sem o "v").
   • dataRelease ... data da versão no formato DD/MM/AAAA. A página em
                     inglês mostra a data por extenso automaticamente
                     (ex.: "October 29, 2026").
   • links ......... endereços usados nos botões e links da página.
       - Os links de download usam "/releases/latest/download/<arquivo>",
         que sempre baixa a ÚLTIMA versão publicada no GitHub. Assim eles
         continuam funcionando quando sair uma versão nova, desde que o
         nome do arquivo na Release continue o mesmo.
       - "voltar" é o botão "Voltar" (para a sua página principal).
   ===================================================================== */
var ORGUINE_CONFIG = {
  versao: '2.1.1',
  dataRelease: '29/10/2026',

  links: {
    github:          'https://github.com/cleitinhodev',                         // seu perfil
    repo:            'https://github.com/cleitinhodev/orguine',                 // repositório do projeto
    release:         'https://github.com/cleitinhodev/orguine/releases/latest', // página da última versão
    issues:          'https://github.com/cleitinhodev/orguine/issues',          // relatar problemas
    downloadWindows: 'https://github.com/cleitinhodev/orguine/releases/latest/download/Orguine-windows-amd64.exe',
    downloadLinux:   'https://github.com/cleitinhodev/orguine/releases/latest/download/Orguine-linux-x86_64',
    downloadMac:     'https://github.com/cleitinhodev/orguine/releases/latest/download/Orguine-macos-arm64.zip',
    site:            'https://www.bugzinho.com/',                               // seu site
    donate:          'https://www.bugzinho.com/donate',                         // página de doação
    voltar:          'https://www.bugzinho.com/'                                // botão "Voltar"
  },

  /* Idiomas do tutorial: código do idioma → nome do arquivo .html.
     Só mexa aqui se RENOMEAR os arquivos .html ou adicionar um idioma novo. */
  idiomas: {
    'pt-BR': 'index.html',      // Português (Brasil) — idioma padrão
    'en':    'tutorial-orguine.en.html'    // English
  }
};
/* ===================== FIM DA CONFIGURAÇÃO ===================== */
