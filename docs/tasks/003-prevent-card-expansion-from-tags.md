# Conter tags longas dentro do card

## Contexto

Uma tag cujo conteudo e maior que a largura de um card pode fazer o elemento
pai expandir, quebrando o alinhamento visual das secoes do quadro.

## Escopo

- Garantir que os contenedores estruturais do Kanban possam encolher dentro da
  largura da secao, inclusive quando o conteudo renderizado pelo consumidor
  tiver texto longo e sem quebra.
- Manter o card e a secao na largura definida pelo layout do quadro.
- Oferecer uma forma neutra e documentada para que o consumidor trate o
  overflow visual de sua tag (por exemplo, truncamento, quebra ou tooltip),
  sem o pacote assumir semantica de dominio.

## Criterios de aceite

- Um card com uma tag maior que sua largura nao aumenta a largura do card,
  da secao nem do quadro.
- Os cards vizinhos e as secoes continuam alinhados, sem criar overflow
  horizontal inesperado no quadro.
- O conteudo longo permanece acessivel conforme a estrategia de overflow
  definida pelo consumidor; nao pode desaparecer silenciosamente.
- O comportamento vale para cards arrastaveis e para o modo somente leitura.
- Testes de layout/DOM cobrem conteudo longo e Storybook inclui um exemplo de
  tag longa para inspeção visual.

## Fora de escopo

- Definir o componente de tag, sua semantica, cores ou regra de truncamento de
  cada aplicacao consumidora.
