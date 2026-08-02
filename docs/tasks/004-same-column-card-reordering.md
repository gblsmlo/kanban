# Reordenar cards dentro da mesma seção

**Status:** implementado, com ordenação ascendente/descendente, reconciliação otimista e `Board` restaurável.

## Contexto

Cards podem mudar de prioridade dentro de uma seção. Por exemplo, um card na
posição 3 deve poder ir para a posição 2 ou 1 sem precisar mudar de coluna.
O mesmo gesto deve continuar livre no eixo horizontal para mover o card entre
seções: não existem modos ou regras concorrentes para movimento em X e Y.

## Escopo

- Permitir arrastar um card verticalmente para outra posição da mesma seção.
- Preservar o mesmo gesto para mover cards entre seções e entre posições,
  usando a seção e o card sob o ponteiro como um único slot de destino.
- Exibir o preview da nova posição durante a interação.
- Informar a mudança pelo callback `onMoveCard` já existente, usando a mesma
  seção em `sourceColumnId` e `targetColumnId` e as posições zero-based em
  `sourceIndex` e `targetIndex`.
- Manter as regras de ordenação e a persistência sob responsabilidade de cada
  consumer.

## Critérios de aceite

- Um card pode ser movido para cima ou para baixo na mesma seção, inclusive da
  terceira para a primeira ou segunda posição.
- A posição tem semântica de inserção antes/depois do card sob o ponteiro. Para
  `1,2,3`, arrastar `3` antes de `2` resulta em `1,3,2`; arrastar `3` depois de
  `2` preserva `1,2,3`. A mesma regra em `1,2,3,4,5` produz `1,3,2,4,5` quando
  `3` é inserido entre `1` e `2`.
- O drop final é a autoridade para o callback. Um preview intermediário não
  pode persistir um slot diferente daquele indicado pela posição final do
  ponteiro.
- Mudanças entre a metade superior e inferior do mesmo card atualizam o
  preview imediatamente, sem esperar que o alvo de colisão mude.
- Ao concluir o movimento, `onMoveCard` recebe o card, a seção de origem e
  destino, a posição original e a posição solicitada.
- Quando o consumer retorna `true`, o preview permanece até que `columns`
  confirme o card na posição solicitada.
- Quando o consumer retorna `false`, o card volta imediatamente à posição
  original.
- O callback pode retornar `Promise<boolean>` para representar persistência
  assíncrona. Enquanto a Promise estiver pendente, a ordem otimista continua
  visível mesmo que o cache publique temporariamente um snapshot antigo.
- Em caso de falha assíncrona, o consumer restaura seu cache e resolve `false`;
  em caso de sucesso, publica a ordem canônica e resolve `true`.
- Soltar o card na posição original não dispara `onMoveCard`.
- Soltar diretamente sobre outro card persiste a posição final mesmo quando o
  navegador não emite uma atualização intermediária de `onDragOver`.
- Movimentos repetidos dentro do mesmo slot não recriam o preview, evitando
  renders de lista sem mudança de posição.
- A reordenação por teclado continua disponível com as mesmas garantias de
  acessibilidade do drag-and-drop entre seções.
- Testes cobrem movimentos para cima e para baixo, inclusive o caso 2 → 1,
  confirmação do consumer, cache obsoleto, rollback e reconciliação da posição
  persistida.
- Stories de interação documentam e validam em Chromium a priorização por
  ponteiro, a priorização por teclado, a persistência assíncrona diante de
  cache obsoleto e o rollback quando o consumer rejeita a mudança.
- Uma story manual, sem `play` automático, permite arrastar livremente e
  restaurar a ordem inicial para inspeção visual. Ela contém cinco cards na
  primeira coluna e uma segunda coluna para validar movimentos nos eixos X e Y.

## Implementação

- `DragDropProvider` e `useSortable` da API React atual substituem o contexto,
  os sensores e o `SortableContext` legados.
- Cada card informa `group` e `index`; o `OptimisticSortingPlugin` do dnd-kit
  projeta a ordem no DOM durante o drag-over sem renderizar novamente a lista
  React a cada colisão.
- Colisão, posição relativa, movimento por teclado, feedback visual e atributos
  de acessibilidade são responsabilidades dos plugins do dnd-kit.
- O helper oficial `move()` projeta o resultado final e cobre a entrada em uma
  coluna vazia, o caso adicional documentado para listas múltiplas.
- O pacote mantém somente a tradução do evento final para `KanbanCardMove` e a
  reconciliação necessária para impedir regressão visual causada por snapshots
  obsoletos do cache do consumer.

## Fora de escopo

- Definir chaves de ordenação, políticas de prioridade, API, banco de dados ou
  estratégia de persistência do consumer.
