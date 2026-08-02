# Acoes no cabecalho da secao

## Contexto

Cada secao do quadro deve oferecer acoes rapidas sem deslocar o titulo ou o
contador de itens.

## Escopo

- Expor acoes opcionais por secao para `Settings` (menu de tres pontos) e
  `Plus` (adicionar item).
- Renderizar ambas no lado direito do cabecalho, na mesma linha do titulo da
  secao e de seu contador.
- Manter as acoes acessiveis por teclado, com nome acessivel que identifique a
  secao a que pertencem.
- Preservar o contrato domain-neutral: o pacote apenas entrega os pontos de
  extensao e dispara callbacks; permissao, menu de configuracao, criacao,
  dados remotos e persistencia continuam sob responsabilidade do consumidor.

## Criterios de aceite

- Sem acoes configuradas, o cabecalho permanece visualmente igual ao atual.
- Com uma ou ambas as acoes configuradas, os controles ficam alinhados a
  direita, sem truncar indevidamente o titulo nem aumentar a largura da
  secao.
- `Settings` abre/aciona o comportamento fornecido pelo consumidor para a
  secao correta; `Plus` aciona a inclusao de um item na secao correta.
- Os controles nao iniciam o arraste horizontal do quadro nem o arraste de um
  card.
- Testes cobrem a renderizacao opcional, os callbacks com o id da secao e a
  navegacao por teclado.
- Storybook demonstra uma secao sem acoes e outra com as duas acoes.

## Fora de escopo

- Implementar regras de permissao, formularios, persistencia ou o conteudo do
  menu de configuracao.
