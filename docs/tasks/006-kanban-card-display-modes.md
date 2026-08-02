# Modos de exibição do KanbanCard

**Status:** implementado e validado por testes unitários, stories em Chromium e
revisão visual das stories `Card/Compact` e `Kanban/Board`.

## Contexto

Cards com descrição, tags e metadados são úteis para leitura detalhada, mas
ocupam muito espaço quando o usuário quer examinar ou priorizar mais itens. O
card precisa oferecer uma apresentação compacta sem criar uma segunda estrutura
de dados ou interferir na ordenação do Kanban.

## História

Como usuário do Kanban, quero alternar todos os cards entre as apresentações
`full` e `compact` nas configurações do board, para escolher quanto conteúdo
visualizar sem perder o contexto de tags e data.

Como consumer do pacote, quero controlar essa preferência no nível do board e
decidir como será persistida.

## Implementação

- Adicionar o contrato controlado `KanbanCardDisplay = 'full' | 'compact'`, com
  `full` como valor padrão e retrocompatível.
- Preservar a composição pública `KanbanCard*`; o consumer não acessa as
  primitivas internas de Card.
- Demonstrar a ação de exibição em `Toolbar → Settings → Layout → Cards`, fora dos
  elementos arrastáveis, usando `ui/menu` apenas no consumer da story.
- Reservar no mock de `Layout` submenus claros para largura de `Columns`,
  agrupamento por `Swimlanes` e expansão ou recolhimento em `Visibility`, sem
  adicionar esses contratos à API pública do Kanban.
- Compor o resumo compacto na ordem título, tags e data; a data permanece
  visível e `ui/tooltip` torna todas as tags disponíveis por hover e foco.
- Não montar os controles e hooks do tooltip enquanto o card estiver em `full`;
  o Storybook deduplica `react` e `react-dom` para preservar um único dispatcher
  de hooks entre COSS, DnD Kit e as stories durante HMR.
- Em `compact`, manter título, tags e data na mesma linha e ocultar descrição,
  content e footer da apresentação e da árvore de acessibilidade.
- Tratar o resumo de tags como ação secundária, preservando um ativador de drag
  independente e o comportamento nativo dos sensores do dnd-kit.
- Remontar a subtree compartilhada do board no handoff de movimentos entre
  colunas populadas, impedindo que React remova um card que o plugin otimista do
  DnD Kit já moveu para outro elemento pai.
- Manter o estado e sua persistência sob responsabilidade do consumer.

## Critérios de aceite

- O modo omitido renderiza exatamente a composição `full` existente.
- O menu em `Toolbar → Settings → Layout → Cards` identifica as opções
  `Detailed` e `Compact` e alterna todos os cards imediatamente entre `full` e
  `compact`.
- Os cards não exibem uma ação de reticências para controlar o display.
- O modo compacto exibe título, ícone de tags, quantidade e data sem
  expandir a largura do card.
- Hover e foco no resumo de tags abrem um tooltip que contém todas as tags; a
  data permanece visível fora do tooltip.
- A story `Kanban/Board` monta sem erros de hooks tanto em uma carga limpa quanto
  depois da otimização de dependências do Vite.
- A story pública `Card/Compact` inicia em estado neutro, sem portal aberto no
  `body` durante a troca de canvas do Storybook.
- Tooltip e seu controle não iniciam drag; o card continua ordenável por ponteiro
  e teclado.
- Um movimento real entre colunas populadas conclui sem `removeChild`, preserva
  a ordem otimista e permanece visível depois do drop.
- O movimento por teclado entre colunas devolve o foco ao card movido depois da
  reconciliação do DOM.
- A preferência controlada no board permanece aplicada depois de mover um card.
- A story `Read Only` permanece passiva, sem ação de exibição e com cursor
  padrão.
- Testes unitários validam o contrato e stories em Chromium validam layout,
  tooltip, menu, teclado e integração com DnD.

## Fora de escopo

- Escolher armazenamento local, cache remoto ou política de sincronização.
- Alterar a persistência ou a projeção de ordenação fornecida pelo DnD Kit.
