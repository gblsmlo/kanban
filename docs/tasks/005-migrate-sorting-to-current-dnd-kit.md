# Migrar a ordenação para a API atual do dnd-kit

**Status:** implementado no `main`; este contrato possui teste de regressão contra a API legada.

## Contexto

A primeira implementação calculava manualmente o alvo antes/depois, mantinha
um preview React durante todo o arraste e aplicava transformações, overlay,
sensores e atributos de acessibilidade que o dnd-kit atual já oferece. Essa
sobreposição aumentava o número de regras, renders e pontos de divergência do
comportamento padrão de um Kanban.

## História

Como usuário do Kanban, quero mover um card livremente nos eixos X e Y e ver a
ordem mudar imediatamente, para priorizar cards dentro da coluna ou movê-los
entre colunas sem atraso ou regressão visual.

Como consumer do pacote, quero receber uma única intenção final com coluna e
posição, para persistir a ordenação sem precisar conhecer regras internas do
drag-and-drop.

## Implementação

- Migrar do pacote legado `@dnd-kit/core` para `DragDropProvider` e os hooks da
  API React atual.
- Declarar `group` e `index` em cada sortable e deixar o
  `OptimisticSortingPlugin` reordenar o DOM durante o arraste.
- Remover `SortableContext`, estratégia vertical, cálculo manual de metade do
  card, transform, estado de `activeCard` e preview React para alvos sortables.
- Usar o `DragOverlay` atual com callback de `source`, permitindo que o elemento
  sortable original ocupe o slot projetado pelo plugin sem estado duplicado.
- Usar o helper oficial `move()` para projetar o resultado final e para o caso
  documentado de uma coluna vazia, cujo alvo ainda não é sortable.
- Configurar o droppable que cobre a coluna com `CollisionPriority.Lowest`, de
  modo que cards sortables vençam a colisão em listas preenchidas e a coluna
  funcione somente como fallback em áreas vazias.
- Usar `pointerIntersection`: com ponteiro, um card só vence quando está sob o
  cursor; por teclado, o detector mantém o fallback por interseção da forma.
- Usar os plugins nativos de feedback, teclado, auto-scroll e acessibilidade.
- Encerrar imediatamente o drop quando `onMoveCard` retorna uma Promise; a
  persistência assíncrona não pode manter o card flutuando após o pointer-up.
- Manter no pacote apenas o bridge de `KanbanCardMove` e a reconciliação visual
  contra snapshots de cache obsoletos. O consumer continua responsável pela
  mutação, rollback remoto e ordem canônica.

## Critérios de aceite

- `3 → 1` resulta em `3,1,2`; inserir `3` entre `1` e `2` resulta em `1,3,2`;
  manter `3` depois de `2` preserva `1,2,3`.
- O mesmo gesto move cards entre colunas preenchidas e para uma coluna vazia.
- Drag-over entre cards sortables não chama `setState` para refazer o preview.
- `onMoveCard` recebe os índices inicial e final calculados a partir do evento
  sortable e é chamado somente quando a posição muda.
- Aceite síncrono conclui a suspensão nativa; rejeição síncrona aborta a
  operação nativa e reconcilia a ordem React de origem; persistência assíncrona
  encerra o feedback imediatamente e mantém a ordem otimista até confirmação ou
  rollback do consumer.
- `Space` inicia/finaliza o movimento por teclado, setas movem o card e `Enter`
  continua disponível para a ação original de um controle dentro do card.
- Testes unitários validam o adaptador oficial, coluna vazia, suspensão,
  persistência assíncrona, cache obsoleto e rollback.
- Stories em Chromium validam ponteiro, teclado, rejeição e persistência
  assíncrona sem regressão visual.

## Fora de escopo

- Escolher banco de dados, API, chave de ordenação ou política de conflito do
  consumer.
- Reimplementar collision detection ou estratégias de ordenação do dnd-kit.
