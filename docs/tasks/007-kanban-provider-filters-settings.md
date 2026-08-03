# Provider de filtros e preferências do Kanban

**Status:** planejado.

## Contexto

A story `Kanban/Toolbar` valida a arquitetura de informação dos menus `Filter`
e `Settings`, porém atualmente mantém estado, regras de filtragem e preferências
de layout dentro do próprio exemplo. Isso comprova a experiência, mas não cria
um contrato reutilizável para aplicações que instalam `@tc96/collection-views` pelo npm ou
pelo registry.

O Kanban é um provider de UI para projetos de terceiros. Ele deve oferecer os
comportamentos visuais e de interação do board sem assumir entidades, backend,
cache, autorização, idioma ou estratégia de persistência do produto consumidor.

## História

Como consumer do pacote, quero compor um Kanban com filtros e preferências de
layout nativos, para não reimplementar menus, estado de interface e projeções
visuais em cada produto.

Como usuário do board, quero filtrar cards e ajustar sua apresentação de forma
imediata, preservando minhas escolhas quando o produto decidir persistir essas
preferências.

## Premissas arquiteturais

- A evolução será aditiva e compatível com o uso atual de `KanbanView`.
- O pacote será responsável por estado de UI, projeção visual, acessibilidade e
  interações; o consumer continuará responsável por dados canônicos, permissões,
  cache, persistência, telemetria e tratamento de erros.
- Todo estado persistível será serializável. A API pública usará arrays e objetos
  simples, nunca `Set`, elementos React ou instâncias internas de componentes.
- Filtros e preferências terão contratos controlados e não controlados. O modo
  controlado é a integração indicada para URL, storage, cache ou API remota.
- A atualização visual será síncrona e otimista. Callbacks notificam o consumer,
  mas o Kanban não aguardará uma gravação remota para atualizar a interface.
- As primitivas visuais continuarão vindo de `@/components/ui/*`, preservando a
  distribuição COSS-first no npm e no registry.
- Textos visíveis e labels acessíveis terão defaults em inglês e poderão ser
  substituídos pelo consumer sem trocar a implementação dos menus.

## Decisão

Introduzir uma composição opcional baseada em `KanbanProvider`, mantendo
`KanbanView` standalone como contrato retrocompatível:

```tsx
<KanbanProvider
  columns={columns}
  filterDefinitions={filterDefinitions}
  filteringMode="client"
  filters={filters}
  getKey={(card) => card.id}
  layout={persistedLayout}
  onFiltersChange={setFiltersInUrl}
  onLayoutChange={persistBoardPreference}
>
  <KanbanToolbar title="Product delivery" />
  <KanbanBoard
    getCardLabel={(card) => card.title}
    onMoveCard={persistCardMove}
    renderCard={(card) => <TaskCard card={card} />}
  />
</KanbanProvider>
```

`KanbanBoard` será a view que consome o provider. `KanbanView` continuará
aceitando `columns`, `getKey`, `renderCard` e `onMoveCard` diretamente para não
quebrar aplicações existentes; internamente, ambos compartilharão a mesma
implementação de layout e drag-and-drop.

Esta composição foi escolhida porque mantém toolbar, menu e board sincronizados
sem prop drilling, permite omitir completamente a toolbar em superfícies
read-only e não transforma persistência remota em responsabilidade do pacote.

## Proposta de API pública

Os nomes finais devem ser confirmados por testes de tipo antes da implementação,
mas a responsabilidade de cada contrato é estável:

```ts
export type KanbanFilterState = Readonly<Record<string, readonly string[]>>

export interface KanbanFilterOption {
  label: ReactNode
  value: string
  icon?: ReactNode
}

export interface KanbanFilterDefinition {
  id: string
  label: ReactNode
  icon?: ReactNode
  options: readonly KanbanFilterOption[]
}

export interface KanbanClientFilterDefinition<TCard>
  extends KanbanFilterDefinition {
  getValues: (
    card: TCard,
    column: KanbanColumnData<TCard>,
  ) => readonly string[]
}

export type KanbanColumnWidth = "narrow" | "standard" | "wide"

export interface KanbanLayoutState {
  cardDisplay: KanbanCardDisplay
  columnWidth: KanbanColumnWidth
  collapsedColumnIds: readonly string[]
  swimlane: string | null
}

export interface KanbanSwimlaneOption {
  label: ReactNode
  value: string
}

export interface KanbanSwimlaneDefinition<TCard> {
  id: string
  label: ReactNode
  options: readonly KanbanSwimlaneOption[]
  getValue: (card: TCard) => string | null
}
```

O provider terá pares separados de estado para que filtros possam ser
persistidos na URL enquanto preferências de layout sejam salvas em outro
destino:

- `filters`, `defaultFilters` e `onFiltersChange`;
- `layout`, `defaultLayout` e `onLayoutChange`;
- `filteringMode: 'client' | 'manual'`;
- `filterDefinitions` e `swimlaneDefinitions`;
- `messages` para tradução e substituição de labels;
- `children` para composição do toolbar e do board.

As mudanças notificarão o motivo e o valor completo, permitindo analytics e
persistência sem depender de detalhes internos:

```ts
type KanbanFiltersChangeReason = "toggle-option" | "clear"

type KanbanLayoutChangeReason =
  | "card-display"
  | "column-width"
  | "column-collapse"
  | "expand-all-columns"
  | "collapse-all-columns"
  | "swimlane"
```

Hooks públicos serão restritos às necessidades de composição avançada:
`useKanbanFilters()` e `useKanbanLayout()`. Eles devem falhar com uma mensagem
clara quando usados fora de `KanbanProvider`. Contextos e reducers internos não
serão exportados.

## Semântica funcional

### Filters

- `KanbanFilterMenu` renderiza label e ícone de cada definição, opções em
  submenus, quantidade ativa no trigger e a ação `Clear filters`.
- No modo `client`, o core aplica `OR` entre valores do mesmo filtro e `AND`
  entre filtros ativos. Um card com qualquer label selecionada satisfaz aquele
  filtro.
- A projeção filtrada não altera os arrays recebidos nem a ordem canônica. O
  count visual representa os cards visíveis.
- No modo `manual`, o provider somente controla o menu e emite
  `onFiltersChange`; o consumer refaz sua query e fornece novas colunas. Esse é
  o modo indicado para paginação ou datasets remotos.
- Sem filtros ativos, o provider preserva as referências das colunas recebidas
  e não executa os resolvers dos cards.
- `Status`, `Assignee`, `Creator`, `Priority`, `Labels` e `Date` permanecerão no
  exemplo como definições do consumer. Não serão campos fixos do pacote.

### Settings > Layout > Cards

- Controla `cardDisplay: 'full' | 'compact'` para todos os cards do board.
- `KanbanCard` continua aceitando `display` diretamente; dentro do provider, o
  board injeta a preferência sem exigir que cada consumer faça prop drilling.
- A troca é imediata e não interfere na identidade ou ordenação dos cards.

### Settings > Layout > Columns

- Controla `columnWidth: 'narrow' | 'standard' | 'wide'`.
- O mapeamento para tokens/classes permanece interno ao Kanban; o valor público
  descreve intenção de layout e não uma largura CSS.
- A largura deve funcionar com o scroll horizontal natural do board, sem fixar
  largura no wrapper do Storybook.

### Settings > Layout > Visibility

- `collapsedColumnIds` é a fonte de verdade serializável.
- Uma coluna recolhida mantém título, quantidade e ação de expansão, mas não
  monta cards nem os expõe à árvore de acessibilidade.
- `Expand all`, `Collapse all` e a seleção individual produzem uma única
  mudança de estado por ação.
- Na primeira versão, uma coluna recolhida não será drop target. Isso evita uma
  mudança invisível; o usuário deve expandi-la antes de mover cards para ela.
- No mobile, recolher a coluna ativa move a seleção para a primeira coluna
  expandida disponível. Se todas estiverem recolhidas, o empty state explica
  como restaurar a visualização.

### Settings > Layout > Swimlanes

- As opções e a extração do agrupamento são fornecidas por
  `KanbanSwimlaneDefinition<TCard>`; `Assignee` e `Priority` são apenas exemplos.
- `null` representa `None` e preserva o board atual sem custo de agrupamento.
- Cada lane possui id e label estáveis, mantém a ordem original dos cards e
  exibe um empty state quando necessário.
- Movimento entre lanes adicionará `sourceSwimlaneId` e `targetSwimlaneId`
  opcionais a `KanbanCardMove`. O consumer continua responsável por alterar o
  campo de domínio e persistir a nova posição.
- Ordenação nativa do dnd-kit continuará sendo a autoridade; o Kanban não
  introduzirá um segundo algoritmo de colisão ou preview.

### Extensões de Settings

`Details` e `Notifications` não têm comportamento genérico que o Kanban possa
executar sem conhecer o produto. Eles não serão itens mortos do core. O menu de
Settings oferecerá um slot composto para o consumer adicionar grupos e ações
de board usando as mesmas primitivas COSS. O grupo `Layout` continuará nativo e
funcional mesmo sem extensões.

## Estado, persistência e concorrência

- No modo não controlado, o provider aplica a mudança local antes de chamar o
  callback.
- No modo controlado, o consumer deve publicar o novo valor imediatamente para
  manter a experiência otimista e persistir em segundo plano.
- O provider não escreverá em `localStorage`, não criará query cache e não fará
  rollback remoto. A documentação incluirá receitas para persistência local e
  remota sem escolher uma biblioteca de dados.
- O estado emitido será sempre completo, normalizado e imutável. IDs inexistentes
  serão ignorados na projeção sem apagar a preferência persistida; assim uma
  coluna temporariamente ausente pode reaparecer com a escolha anterior.
- Mudanças de filtro ou layout não reinicializam a reconciliação otimista de
  drag-and-drop nem substituem a ordem canônica fornecida pelo consumer.

## Acessibilidade e internacionalização

- Triggers preservam ícone e label na mesma linha e usam as primitivas COSS de
  `Toolbar`, `Button` e `Menu` sem overrides no consumer.
- Submenus mantêm roles nativos de menu, radio e checkbox, navegação por teclado,
  foco restaurado e labels acessíveis.
- O count do filtro terá anúncio textual; cor e ícone não serão a única forma de
  indicar estado.
- Expandir/recolher uma coluna anuncia título e novo estado.
- O pacote expõe mensagens por chave, incluindo toolbar, filtros, ações de
  limpeza, layout, opções padrão e empty states. Conteúdo de domínio continua
  vindo das definições do consumer.

## Performance

- Separar contextos/seletores de filtros e layout para que abrir um menu não
  renderize todos os cards.
- Memoizar apenas projeções derivadas; não duplicar `columns` em estado React.
- Não percorrer cards sem filtros ou swimlane ativos.
- Manter callbacks e definições estáveis na documentação e avisar em modo de
  desenvolvimento quando IDs de filtros, opções, colunas ou lanes se repetirem.
- Preservar `getKey(card)` como identidade do card em todas as projeções.
- Validar com React Profiler que alternar um checkbox não causa remontagem de
  cards que permanecem visíveis.

## Plano de entrega por PR

### PR 1 — Fundação do provider e contrato público

- Escrever primeiro testes de tipo e de estado controlado/não controlado.
- Adicionar `KanbanProvider`, estado normalizado, mensagens e hooks públicos.
- Extrair `KanbanBoard` da implementação compartilhada com `KanbanView`, sem
  alteração visual ou quebra da API existente.
- Publicar documentação inicial da composição e tabela de ownership.
- Atualizar exports npm, `core`, registry e testes de paridade.

### PR 2 — Filters core

- Migrar o menu funcional da story para `KanbanFilterMenu`.
- Implementar definições genéricas, modos `client` e `manual`, algoritmo
  `AND/OR`, clear e indicador de quantidade.
- Cobrir dados locais, labels multivaloradas, zero resultados, modo manual e
  estado controlado.
- Documentar definições, filtragem remota, persistência em URL e tradução.

### PR 3 — Settings core: cards, columns e visibility

- Migrar `KanbanSettingsMenu` e tornar reais card display, largura e colapso.
- Adicionar slot de extensões para ações específicas do produto.
- Cobrir desktop, mobile, read-only, teclado, foco e interação com filtros/DnD.
- Documentar preferências controladas e receitas de persistência.

### PR 4 — Swimlanes e integração com DnD

- Implementar definições genéricas e projeção das lanes.
- Estender `KanbanCardMove` com ids opcionais de lane.
- Validar movimentos X/Y dentro e entre colunas e lanes, inclusive persistência
  otimista, cache obsoleto e rollback.
- Documentar atualização do campo de domínio e compatibilidade da extensão.

Cada PR precisa ser publicável isoladamente, incluir documentação da API que
adiciona e manter npm/registry equivalentes. A feature completa recomenda uma
versão minor, pois adiciona API sem remover contratos existentes.

## Estratégia de testes

- Testes unitários do reducer/normalização antes dos componentes.
- Testes de contrato TypeScript para props controladas, não controladas e
  genéricos de card.
- Testes de componentes para menus, keyboard, foco, mensagens e context errors.
- Testes de projeção para `AND` entre filtros, `OR` interno, modo manual,
  referência estável sem filtro, widths e colunas recolhidas.
- Testes do adaptador DnD para lanes sem reimplementar regras da biblioteca.
- Stories públicas `Kanban/Board`, `Kanban/Read Only` e `Kanban/Toolbar`, mais as
  variants existentes em `Card`; cenários técnicos ficam ocultos com `!dev` e
  `!autodocs`.
- Plays no Chromium comprovam o caso de uso completo: filtrar, limpar, alternar
  layout, recolher/restaurar colunas, agrupar e mover cards sem regressão visual.
- Revisão no browser integrado inspeciona DOM, portals, overflow, cursor,
  acessibilidade e ausência dos erros de hooks/removeChild já corrigidos.
- `lint:ci`, `typecheck`, testes unitários, Storybook, build e `pack:check` devem
  passar antes de cada PR.

## Documentação obrigatória da API

A entrega não estará concluída somente com stories. Cada PR atualizará:

- `README.md`: quick start com provider, ownership e migração do uso standalone;
- `docs/api/kanban-provider.md`: props, tipos, defaults, callbacks, razões de
  mudança, exemplos controlados/não controlados e regras de serialização;
- `docs/api/filters.md`: definições, algoritmo client, modo manual e URL;
- `docs/api/layout.md`: cards, columns, visibility, swimlanes e persistência;
- TSDoc em todos os exports públicos;
- Storybook como demonstração interativa, sem ser a única fonte de verdade;
- changelog/release notes com versão, adições e ausência de breaking changes.

Todos os exemplos devem compilar contra o entrypoint público
`@tc96/collection-views`; nenhum exemplo documentado pode importar arquivos internos.

## Critérios de aceite finais

- Um projeto terceiro consegue instalar por npm ou registry e montar provider,
  toolbar, filters, settings e board usando somente exports públicos.
- `KanbanView` standalone continua funcionando sem provider e sem mudança visual.
- Os seis filtros do exemplo funcionam por configuração, não por campos
  hardcoded no pacote.
- Client filtering e manual/server filtering possuem comportamento e docs
  inequívocos.
- Cards, Columns, Visibility e Swimlanes alteram o board de verdade; não existem
  preferências stateful limitadas ao Storybook.
- Estado controlado é persistível e não apresenta regressão visual durante
  atualização assíncrona do consumer.
- Estado não controlado funciona sem infraestrutura externa.
- A API não depende de entidades, cache, backend ou biblioteca de estado do
  consumer.
- DnD continua nativo, otimista e livre nos eixos X/Y depois de filtros,
  colapso e swimlanes.
- Read-only continua passivo, com cursor default e sem controles que impliquem
  mutação indisponível.
- Labels e mensagens podem ser localizados; teclado e leitores de tela operam
  menus e colunas corretamente.
- README, guias de API, TSDoc, stories, registry e pacote npm descrevem e expõem
  o mesmo contrato validado.

## Fora de escopo

- Persistência automática em storage ou backend.
- Escolha de React Query, SWR, Redux ou outra biblioteca do consumer.
- Filtros de negócio fixos ou chamadas de API específicas.
- Implementação de notificações, permissões ou detalhes de um produto.
- Substituir algoritmos de colisão, ordenação ou acessibilidade do dnd-kit.
