# Barra de rolagem horizontal apenas durante arraste

## Contexto

No desktop, a barra de rolagem horizontal do quadro pode ficar visivel sem que
o usuario esteja navegando horizontalmente. A navegacao por clicar, segurar e
arrastar o quadro ja existe; a indicacao visual deve acompanhar somente essa
interacao.

## Escopo

- Ocultar a barra horizontal enquanto o quadro estiver parado ou apenas em
  hover.
- Exibi-la somente depois de um ponteiro primario iniciar um arraste
  horizontal valido no quadro e mantê-la visivel ate o termino, cancelamento ou
  perda da captura desse arraste.
- Preservar a rolagem por clicar, segurar e arrastar para esquerda ou direita.

## Criterios de aceite

- A barra horizontal nao aparece apenas por hover, foco, clique sem movimento,
  rolagem vertical ou por interagir com um card/controle.
- Depois que o arraste horizontal ultrapassar o limiar de ativacao, a barra
  aparece e a posicao do quadro acompanha o ponteiro nos dois sentidos.
- Ao soltar, cancelar ou perder a captura do ponteiro, a barra volta ao estado
  oculto e o cursor deixa o estado de arraste.
- Gestos predominantemente verticais, botoes, links, campos e o arraste de
  cards continuam sem iniciar a rolagem horizontal do quadro.
- Testes de interacao cobrem os estados oculto, ativo e encerrado; Storybook
  permite verificar visualmente o comportamento em um quadro com overflow.

## Fora de escopo

- Alterar a rolagem vertical de cada secao ou desabilitar formas nativas de
  navegacao horizontal que o navegador forneca.
