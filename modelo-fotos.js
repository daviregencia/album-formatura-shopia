// Álbum "Minha Formatura" montado com as fotos tiradas do álbum impresso (fotos2/).
// Cada página: layout, fotos, nome na vertical (title), texto do rodapé (caption),
// enquadramento opcional das fotos (pos, em %), fundo ('amarelo' na primeira dupla),
// estilo do rodapé ('caixa' = letra de forma, 'dourado' = frase em duas linhas)
// e enfeites {t, x, y, w, r} na página de 800x600.
// Tamanhos pela altura da página do álbum impresso: foguete ~25% da altura, balão ~27%,
// selo ABC ~27%, capelo ~17%, bonequinho ~20%.
window.MODELO_FORMATURA = {
  title: 'Minha Formatura',
  cover: 'Shopia Teixeira Rosa',
  dir: 'fotos2/',
  pages: [
    { layout: '1v', photos: ['retrato'], caption: 'CMEI Iolanda Zeni Vila', fundo: 'amarelo', rodape: 'caixa',
      // foguete em pé, colado no canto de baixo à esquerda da foto (foto: x 200–580, y 30–522)
      enfeites: [{ t: 'foguete', x: 112, y: 380, w: 96, r: -4 }, { t: 'nuvem', x: 540, y: 462, w: 104 }] },
    { layout: 1, photos: ['familia_grande'], title: 'Shopia Teixeira Rosa', fundo: 'amarelo',
      enfeites: [{ t: 'nuvem', x: 6, y: 2, w: 116 }, { t: 'balao', x: 618, y: 0, w: 112, r: 8 },
        { t: 'abc', x: 244, y: 418, w: 252, r: -3 }, { t: 'letraA', x: 710, y: 496, w: 72 }] },
    { layout: '1v', photos: ['menina_amarela'],
      enfeites: [{ t: 'nuvem', x: 50, y: 466, w: 120 }, { t: 'lua', x: 606, y: 34, w: 84 }] },
    { layout: '1v', photos: ['retrato_baloes'],
      enfeites: [{ t: 'aviao', x: 30, y: 60, w: 140 }, { t: 'nuvem', x: 590, y: 470, w: 116 }] },
    { layout: 2, photos: ['canudo_alto', 'bracos_abc'],
      // balão no canto de baixo à esquerda da 1ª foto; foguete no canto de cima à direita da 2ª
      enfeites: [{ t: 'balao', x: 0, y: 398, w: 122, r: -8 }, { t: 'foguete', x: 648, y: 0, w: 104, r: 22 }] },
    { layout: 1, photos: ['mae_filha'], caption: 'Minha Formatura',
      // capelo sobre o canto de cima à direita da foto; bonequinho fora da foto, embaixo à esquerda
      enfeites: [{ t: 'capelo', x: 598, y: 0, w: 134 }, { t: 'formando', x: 2, y: 432, w: 74 }] },
    { layout: '1v', photos: ['adolescente'],
      enfeites: [{ t: 'aviao', x: 596, y: 40, w: 140 }, { t: 'nuvem', x: 50, y: 470, w: 120 }] },
    { layout: 1, photos: ['sentados'],
      enfeites: [{ t: 'nuvem', x: 680, y: 396, w: 116 }, { t: 'lua', x: 696, y: 46, w: 84 }] },
    { layout: 1, photos: ['avos'], caption: 'Minha Formatura',
      enfeites: [{ t: 'aviao', x: 668, y: 280, w: 132, r: -70 }] },
    { layout: 1, photos: ['vestido_preto'],
      enfeites: [{ t: 'lua', x: 696, y: 30, w: 84 }, { t: 'balao', x: 690, y: 370, w: 100, r: 6 }] },
    { layout: 4, photos: ['grade1', 'grade2', 'grade3', 'grade4'],
      enfeites: [{ t: 'lua', x: 0, y: 0, w: 74 }, { t: 'aviao', x: 676, y: 506, w: 120 }] },
    { layout: 1, photos: ['vestido_vermelho'],
      enfeites: [{ t: 'aviao', x: 668, y: 460, w: 132, r: -10 }, { t: 'nuvem', x: 682, y: 110, w: 112 }] },
    { layout: 1, photos: ['turma2'], caption: 'A doçura de aprender\nTodos os dias.', rodape: 'dourado',
      enfeites: [{ t: 'capelo', x: 10, y: 0, w: 116, r: -12 }] },
    { layout: 1, photos: ['turma1'],
      enfeites: [{ t: 'abc', x: 290, y: 418, w: 252, r: -3 }, { t: 'foguete', x: 700, y: 30, w: 76, r: 20 }] },
    { layout: 1, photos: ['panorama'], caption: 'Formandos 2025',
      enfeites: [{ t: 'balao', x: 690, y: 10, w: 104, r: 8 }, { t: 'foguete', x: 6, y: 410, w: 76, r: -26 },
        { t: 'formando', x: 704, y: 446, w: 74 }] },
  ],
};
