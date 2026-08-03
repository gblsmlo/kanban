# Views `0.4.0`: List e Grouping

**Status:** concluído.

## Estado atual

Primeiro vertical slice implementado:

- collection core com projeção por Status e Assignee;
- `CollectionProvider` controlado e não controlado;
- `CollectionSettingsMenu` funcional para View e Grouping;
- composição pública `ListView`, `ListGroup` e `ListItem*`;
- expansão de grupos controlada ou não controlada;
- `ListItemSkeleton` baseado em `ui/skeleton`;
- stories `List/Default`, `List/Assignee`, `List/Read Only` e `List/Loading`;
- story `Kanban/View Settings` alternando Kanban/List e Status/Assignee sobre
  a mesma coleção, com Filter e Toolbar preservados;
- composição visual densa, sem `Card`/`CardFrame` aninhados, alinhada à
  referência de grupos e linhas planas;
- npm e registry expõem a mesma API inicial.

Entrega concluída na versão `0.4.0`: a coleção integra Kanban e List, a troca de
view é persistível pelo consumer e o movimento do Kanban continua usando o
adapter DnD existente.

## Objetivo

Evoluir `@tc96/collection-views` para um pacote de views sem renomear o
repositório. A `0.4.0` entregará Kanban e List sobre a mesma coleção e a
mesma API de preferências. Outras views não fazem parte do contrato desta
versão.

O Settings ganha o grupo `Grouping`, com `Group by → Status | Assignee`.
`Status` é o default para Kanban e List. A escolha define quais seções a view
exibe; não é apenas uma preferência cosmética.

## História

Como consumer do pacote, quero fornecer uma coleção uma única vez e alternar
entre Kanban e List, para reutilizar filtros, agrupamento e persistência sem
adaptar meus dados a componentes diferentes.

Como usuário, quero agrupar a view por status ou responsável e expandir somente
as seções relevantes, para mudar a leitura dos mesmos itens sem perder filtros,
ordem ou contexto.

## Referência visual e semântica

Os anexos validam a semântica, não um clone visual:

- a List é dividida em cabeçalhos de grupo com ícone, label, count, estado
  expandido/recolhido e ação à direita;
- `Status` produz grupos como `Backlog`, `In Progress` e `Done`;
- `Assignee` produz grupos de pessoas e um grupo `No assignee`;
- recolher um grupo oculta suas linhas sem remover o grupo da navegação;
- cada linha preserva identidade e pode compor título e metadados próprios do
  consumer.

As superfícies serão compostas com primitivas COSS via `@/components/ui/*`, sem
overrides obrigatórios por `className` no consumer.

## Dependência arquitetural

Implementar conforme
[`ADR-002`](../architecture/adr-002-collection-first-views.md): a fonte canônica
das novas views é uma coleção plana com adapters obrigatórios de status e
assignee. `KanbanColumnData` continua suportado por compatibilidade, mas não será
usado para modelar List ou uma view futura.

## API pública proposta

Os nomes serão fechados por testes de tipo antes do primeiro export, mantendo
estas responsabilidades:

```tsx
<CollectionProvider
  collection={{
    items,
    statuses,
    assignees,
    getKey: (item) => item.id,
    getLabel: (item) => item.title,
    getStatusId: (item) => item.statusId,
    getAssigneeId: (item) => item.assigneeId,
  }}
  defaultPreferences={{ view: 'kanban', groupBy: 'status' }}
  onPreferencesChange={persistPreferences}
>
  {({ collection }) => (
    <>
      <CollectionToolbar />
      <CollectionViewOutlet
        collection={collection}
        renderKanbanItem={(item) => <TaskCard task={item} />}
        renderListItem={(item) => <TaskRow task={item} />}
      />
    </>
  )}
</CollectionProvider>
```

Consumers também poderão montar somente a view desejada:

```tsx
<ListView
  collection={collection}
  grouping="status"
  renderItem={(item) => <TaskRow task={item} />}
/>
```

Contratos essenciais:

```ts
type CollectionViewMode = 'kanban' | 'list'
type CollectionGrouping = 'status' | 'assignee'

interface CollectionPreferences {
  view: CollectionViewMode
  groupBy: CollectionGrouping
}

interface CollectionMove<TItem> {
  item: TItem
  itemId: string
  grouping: CollectionGrouping
  sourceGroupId: string | null
  sourceIndex: number
  targetGroupId: string | null
  targetIndex: number
}
```

O provider terá contratos controlados e não controlados:
`preferences`, `defaultPreferences` e `onPreferencesChange`. O callback recebe o
estado completo e `reason: 'view' | 'grouping'`. Preferências são serializáveis;
o pacote não grava em URL, storage ou backend.

## Responsabilidades

| Pacote | Consumer |
| --- | --- |
| Projeção por status/assignee | Dados canônicos e catálogo de opções |
| Estado controlado/não controlado das preferências | Persistência de view, grouping e expansão |
| Layout, colapso, teclado, foco e announcements | Conteúdo da linha/card e ações de domínio |
| Evento otimista de movimento | Mutação de status/assignee, ordem, cache e rollback |
| Empty/loading states genéricos | Permissões, paginação, query e telemetria |

## Semântica de Grouping

- `groupBy` default é `status` em Kanban e List.
- A ordem dos grupos segue `statuses` ou `assignees`; a ordem dos itens segue a
  coleção recebida.
- `null` cria o grupo final `No status` ou `No assignee`, com mensagens
  substituíveis pelo consumer.
- Cada item possui um único status e um único assignee de agrupamento na
  `0.4.0`. Pessoas adicionais podem ser renderizadas, mas não duplicam o item em
  vários grupos.
- Trocar `groupBy` é síncrono e não altera os itens, filtros ou identidade. O
  consumer persiste em segundo plano quando usa o modo controlado.
- O estado de expansão é indexado pelo agrupamento para que retornar de
  Assignee para Status restaure as seções anteriormente abertas.
- Filtros e Grouping são ortogonais: primeiro o core filtra a coleção, depois
  projeta os grupos. Counts representam somente itens visíveis.
- `Swimlanes` continua sendo uma futura subdivisão secundária exclusiva do
  Kanban; não substitui o agrupamento primário compartilhado entre views.

## Composição da List

- `ListView` renderiza grupos estáveis, com `ListGroup`, `ListGroupHeader`,
  `ListItem`, `ListItemContent` e `ListItemActions` como composição pública.
- O consumer usa as primitivas do pacote (`ListItem*`) e não recebe a API COSS
  subjacente diretamente.
- Cabeçalho: toggle de expansão, ícone/label, count e slot de ação à direita.
- Linha: seleção opcional, conteúdo consumer-owned, metadados e ações; nenhum
  campo de negócio será hardcoded pelo pacote.
- O modo read-only não monta activators de drag, usa cursor default e mantém
  links/botões do consumer funcionais.
- Quando `onMoveItem` existe, a List permite reordenar no eixo vertical e mover
  entre grupos. O callback informa a mudança de status/assignee e a posição;
  persistência continua consumer-owned.
- Loading usa grupos/linhas skeleton passivos baseados em `ui/skeleton`, sem
  registros de domínio falsos.

## Compatibilidade do Kanban

- `KanbanView` atual permanece source-compatible e visualmente equivalente.
- A nova composição `KanbanBoard` consome a projeção do provider.
- Um adapter transforma `KanbanColumnData` no formato interno sem exigir status
  ou assignee do card legado.
- O DnD atual continua autoridade para colisão, preview e acessibilidade. A
  camada compartilhada traduz apenas o evento final para `CollectionMove`.
- Alternar grouping não remonta todo o board nem cria um segundo algoritmo de
  ordenação. Chaves de item e grupo permanecem estáveis dentro da projeção.

## Limite de escopo para novas views

Nenhuma terceira view será simulada nem exportada na `0.4.0`. A arquitetura
entrega somente os contratos reutilizáveis de coleção, facets, filtros,
preferências e callbacks; uma nova view exigirá uma decisão própria de interação
antes de entrar no escopo.

## Entrega por PR

### PR 1 — Collection core e contratos

- Escrever testes de tipos e da projeção antes da implementação.
- Adicionar tipos, provider controlado/não controlado e função pura de projeção.
- Cobrir Status, Assignee, unassigned, ids desconhecidos, ordem e imutabilidade.
- Documentar ownership, defaults, serialização e migração gradual.

### PR 2 — Primitivas e stories da List

- Criar composição `ListView`/`ListGroup`/`ListItem` COSS-first.
- Criar grupo `Patterns/List` no Storybook com `Default`, `Read Only`, `Loading`
  e cenários separados de Status e Assignee.
- Cobrir expand/collapse, empty groups, teclado, ações e cursor read-only.
- Usar cards suficientes para todos os status, assignees e `No assignee`.

### PR 3 — Grouping e Settings funcionais

- Migrar `Settings → Grouping by → Status | Assignee` do mock para o core.
- Fazer `Status` e `Assignee` reprojetarem Kanban e List imediatamente.
- Integrar filtros existentes à coleção antes do agrupamento.
- Persistir expansão por grouping sem escrita automática em storage.
- Documentar API controlada, não controlada e exemplo de URL/local storage.

### PR 4 — Movimento e compatibilidade do Kanban

- Adicionar `CollectionMove` e adapter para `KanbanCardMove`.
- Cobrir reordenação e movimento entre grupos nas duas views, incluindo UI
  otimista, snapshot obsoleto, aceite e rollback.
- Provar que o `KanbanView` legado não mudou visualmente nem em DnD.
- Atualizar npm exports, `core`, registry e testes de paridade.

### PR 5 — Release `0.4.0`

- Publicar documentação final, migration guide e release notes.
- Validar todos os exemplos apenas contra exports públicos.
- Atualizar versão para `0.4.0` e migrar o pacote para `@tc96/collection-views`,
  mantendo o repositório `kanban`.
- Rodar lint, typecheck, testes unitários, Storybook Chromium, build,
  Storybook build, registry parity e `npm pack --dry-run`.

## Estratégia de testes

- TDD para projeção, estado e eventos antes dos componentes.
- Testes de contrato TypeScript para genéricos e modos controlado/não
  controlado.
- Testes de componentes orientados aos casos de uso, não à estrutura interna.
- Stories com play tests para trocar Status/Assignee, recolher/restaurar grupos,
  combinar filtros, mover itens, aceitar/rejeitar persistência e trocar de view.
- Teste de referência garante que itens não são remontados desnecessariamente
  ao filtrar ou expandir grupos.
- Browser integrado valida DOM, foco, portals, overflow, cursor, densidade e
  ausência de regressões `useRef`/`removeChild`.

## Documentação obrigatória

- `README.md`: visão do pacote, quick start com coleção e compatibilidade do
  Kanban standalone.
- `docs/api/collection.md`: adapters, options, defaults e valores nulos.
- `docs/api/provider.md`: estado, callbacks, reasons e persistência.
- `docs/api/list.md`: composição, read-only, loading e movimento.
- `docs/api/grouping.md`: projeção, counts, expansão e interação com filtros.
- TSDoc em todos os exports públicos e examples compilados contra o entrypoint.
- Storybook demonstra a API, mas não será sua única documentação.

## Critérios de aceite da `0.4.0`

- Um consumer fornece uma coleção e renderiza Kanban ou List sem remodelar os
  itens entre views.
- Status e Assignee existem em toda coleção nova por adapters, sem exigir nomes
  de propriedades no modelo do consumer.
- Kanban e List iniciam agrupados por Status e podem mudar para Assignee pelo
  Settings funcional.
- `No status` e `No assignee`, counts, filtros e expansão funcionam nas duas
  views.
- A mudança de view/grouping é otimista, controlável e persistível sem regressão
  visual provocada por cache obsoleto.
- O movimento entre grupos informa campo e posição, preserva identidade e não
  duplica regras do DnD.
- O repositório continua `kanban` e o pacote publicado é
  `@tc96/collection-views` em `0.4.0`.
- List possui Default, Read Only e Loading documentados e testados.
- Não há API ou story de uma terceira view nesta versão.

## Fora de escopo

- Renomear o repositório.
- Implementar uma terceira view na `0.4.0`.
- Persistência automática, cache, autorização ou queries remotas.
- Campos fixos no item do consumer.
- Multi-assignee como múltiplos grupos simultâneos.
- Clonar a aparência do produto usado como referência.
