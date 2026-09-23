# Separacao da UI e Plano de Correcao Visual

Este documento separa os elementos visuais da landing em camadas para que o front-end seja construido com mais fidelidade e qualidade. Ele foi feito sem alterar componentes, estilos ou assets.

## Estado atual

- Fonte visual principal: Figma `ExvdVwjI85E8G0wWiMTtN3`, frame `1:867`, documentado em `docs/project-context.md`.
- Limite atual: o conector do Figma retornou limite de uso do plano Starter, entao a leitura direta de metadados/screenshot ficou bloqueada nesta passada.
- Base analisada: exports em `public/assets/figma` e os componentes React existentes em `src/components/landing` e `src/components/booking`.
- Regra de execucao: nao corrigir tudo de uma vez. Cada secao deve virar um checkpoint pequeno, validado visualmente antes de passar para a proxima.

## Principio de separacao

Para evitar UI borrada, rigida ou pouco responsiva:

- Screenshots completos de secoes servem apenas como referencia visual.
- Textos, botoes, cards, formularios, bordas, sombras, linhas, estados e grids devem ser reconstruidos em HTML/CSS/React.
- Vetores simples devem virar SVG ou CSS, nao PNG ampliado.
- Fotos, personagens, cenas e texturas podem continuar como bitmap, desde que exportados limpos, em resolucao suficiente e sem texto/card embutido.
- Icones devem ser lucide-react somente quando forem visualmente equivalentes aos do Figma; caso contrario, devem ser exportados como SVG do proprio Figma.

## Inventario dos assets atuais

| Asset | Conteudo atual | Classificacao | Uso correto | Acao necessaria |
| --- | --- | --- | --- | --- |
| `public/assets/figma/hero-reference.png` | Print completo do hero com logo, texto, CTA e cena | Referencia | Nao importar no front | Mover mentalmente/organizar como referencia de comparacao |
| `public/assets/figma/hero-scene.png` | Cena/personagem/altar do hero | Raster de cena | Pode ser imagem de fundo/arte | Reexportar maior e mais fiel se estiver macio no desktop |
| `public/assets/figma/logo.png` | Logo raster 163x73 | Vetor de marca exportado como PNG | Usar como fallback | Exportar `logo.svg` do Figma para nitidez |
| `public/assets/figma/service-section-web.png` | Print completo da secao de servico | Referencia | Nao importar no front | Usar apenas para comparacao |
| `public/assets/figma/service-visual.png` | Composite com celular, pessoa, texto e cards cortados | Referencia/composite | Nao usar como elemento final | Separar em celular/CSS, pessoa limpa, textos/cards em DOM |
| `public/assets/figma/service-person-large.png` | Pessoa com fundo/celular/cards parcialmente embutidos | Asset poluido | Evitar como asset final | Reexportar pessoa com transparencia, sem cards e sem fundo |
| `public/assets/figma/service-person.png` | Versao menor tambem com elementos embutidos | Asset poluido | Evitar como asset final | Substituir por cutout limpo ou remover uso |
| `public/assets/figma/steps-section-web.png` | Print completo da secao de passos | Referencia | Nao importar no front | Reconstruir container, cards e CTA em DOM/CSS |
| `public/assets/figma/booking-photo.png` | Foto/card com texto ja embutido | Raster com texto baked-in | Usar com cautela | Ideal: exportar foto sem texto e recriar copy no DOM |
| `public/assets/figma/warning-person.png` | Pessoa/cartaz com fundo vermelho/corte embutido | Asset parcialmente poluido | Usar temporariamente | Separar pessoa/cartaz/fundo para responsividade |

## Separacao por secao

### Hero

Manter em DOM/CSS:

- Logo, se for SVG.
- H1 com destaques em laranja.
- Paragrafo.
- CTA principal.
- Link secundario.
- Gradientes de leitura sobre a imagem.

Manter como bitmap:

- Cena/personagem/altar, idealmente em export maior que o atual.

Risco atual:

- `hero-scene.png` tem 705x760, o que pode ficar pouco nitido em telas largas.
- O hero de referencia tem composicao horizontal 1080x520; a implementacao usa um recorte vertical reposicionado. Precisa calibrar enquadramento.

### Servico

Manter em DOM/CSS:

- Fundo laranja do celular/card principal.
- Moldura do celular, cantos, notch/camera.
- Marca d'agua "Marmoteiro".
- Titulo "Simples, rapido e online."
- Texto descritivo.
- Cards de beneficios.
- Icones dos cards, se lucide for equivalente.

Manter como bitmap:

- Pessoa em primeiro plano, mas reexportada com transparencia e sem elementos de layout colados.

Risco atual:

- `service-person-large.png` ja contem partes da UI dentro do proprio PNG. Isso limita responsividade e pode causar bordas/cortes estranhos.

### Como funciona

Manter em DOM/CSS:

- Container com borda arredondada.
- Titulo central com destaque laranja.
- Quatro cards.
- Numeradores circulares.
- Estado destacado do quarto card.
- CTA com linhas laterais.

Manter como referencia:

- `steps-section-web.png`.

Risco atual:

- Esta secao esta conceitualmente correta em DOM, mas precisa ajuste fino de dimensoes, espacamentos, raio, glow e posicao do CTA contra a referencia.

### Agendamento

Manter em DOM/CSS:

- Formulario completo.
- Labels, inputs, select, seletor de data, horarios, mensagens e botao.
- Copy sobre a imagem, se essa copy fizer parte do layout final.

Manter como bitmap:

- Foto/arte de apoio, sem texto embutido se possivel.

Risco atual:

- `booking-photo.png` tem texto dentro da imagem. Isso prejudica acessibilidade, responsividade e nitidez.
- O documento de produto cita data de nascimento, mas o formulario atual tem nome, e-mail e WhatsApp. Isso deve entrar como correcao funcional separada, nao misturada com ajuste puramente visual.

### Avisos importantes

Manter em DOM/CSS:

- Fundo vermelho.
- Card branco do titulo.
- Icone de alerta.
- Cards/lista de avisos.
- Layout responsivo.

Manter como bitmap:

- Personagem/cartaz somente se vier limpo e sem fundo embutido desnecessario.

Risco atual:

- `warning-person.png` mistura personagem, cartaz e fundo vermelho. Melhor separar para evitar cortes ruins em mobile.

### Beneficios, FAQ, Footer e telas de pagamento/status

Manter em DOM/CSS:

- Todos os textos e interacoes.
- Cards e acordeoes.
- Footer.
- Estados de sucesso, pendencia e erro.

Fonte visual:

- Devem herdar tokens e componentes das secoes prototipadas no Figma, porque nem tudo parece estar prototipado.

## Tokens e componentes base

Antes de corrigir secoes, travar estes elementos:

- Largura de conteudo: referencia atual usa `1122px`.
- Fundo principal: preto.
- Fundo de secao escura: `#111111`.
- Laranja principal: `#ff9700`.
- Amarelo/borda: comparar `#f4df00`, `#ffb21a` e Figma.
- Marrom de card: atual `#4b3100`.
- Vermelho de aviso: atual `#f51f28`.
- Tipografia: confirmar fonte no Figma. O projeto assume Poppins, mas ainda nao carrega fonte explicitamente em `src/app/layout.tsx`.
- CTA principal: gradiente horizontal, borda amarela, raio pill, glow amarelo/magenta.
- Card base: raio pequeno, borda amarela, fundo marrom, glow controlado.
- Step card: variante transparente e variante ativa laranja.
- Form control: borda clara, foco laranja, alturas estaveis.

## Organizacao recomendada de assets

Sem mudar agora, a organizacao ideal seria:

- `public/assets/figma/reference/`: prints completos usados so para comparacao.
- `public/assets/brand/logo.svg`: logo vetorial.
- `public/assets/landing/hero-scene.webp`: cena do hero em alta.
- `public/assets/landing/service-person.png`: pessoa limpa com transparencia.
- `public/assets/landing/booking-photo.webp`: foto limpa sem texto.
- `public/assets/landing/warning-person.png`: personagem/cartaz limpo.
- `public/assets/icons/*.svg`: apenas icones que nao batem com lucide.

## Plano de correcao passo a passo

### Checkpoint 1 - Reabrir fonte visual e extrair assets limpos

1. Tentar novamente o conector Figma quando o limite liberar.
2. Ler metadados do frame `1:867`.
3. Identificar frames/secoes reais e ignorar o card avulso mencionado em `docs/project-context.md`.
4. Exportar ou solicitar exports limpos:
   - logo SVG;
   - hero scene em alta;
   - pessoa do servico com transparencia;
   - foto do agendamento sem texto;
   - personagem/cartaz dos avisos sem fundo embutido, se existir;
   - icones SVG somente se lucide nao bater.
5. Separar screenshots completos como referencia, nao como assets de producao.

Criterio de aceite:

- Lista fechada de assets limpos.
- Nenhum screenshot completo sendo tratado como elemento de UI final.

### Checkpoint 2 - Travar tokens visuais

1. Confirmar fonte real no Figma.
2. Carregar a fonte corretamente no Next se necessario.
3. Consolidar cores, sombras, raios, largura de container e estilos de CTA.
4. Criar/ajustar componentes base sem alterar o conteudo das secoes ainda.

Criterio de aceite:

- Uma fonte de verdade para CTA, card, input e shell.
- Menos valores soltos repetidos nos componentes.

### Checkpoint 3 - Corrigir Hero

1. Ajustar enquadramento da imagem contra `hero-reference.png`.
2. Conferir posicao do logo, H1, paragrafo e CTAs.
3. Ajustar tamanhos e line-height sem usar escala por viewport.
4. Criar comportamento mobile com composicao propria, nao apenas encolhendo desktop.
5. Validar desktop e mobile por screenshot.

Criterio de aceite:

- Texto nitido e acessivel.
- CTA e link secundario alinhados com a referencia.
- Imagem sem corte estranho e sem baixa resolucao perceptivel.

### Checkpoint 4 - Corrigir Servico

1. Trocar PNG poluido por pessoa limpa.
2. Recriar celular/fundo/marca d'agua em CSS ou SVG.
3. Calibrar titulo, texto e posicao da pessoa.
4. Reconstruir cards com dimensoes estaveis.
5. Validar se os icones lucide sao aceitaveis; exportar SVG se nao forem.
6. Testar mobile para evitar cards sobrepostos.

Criterio de aceite:

- Nenhum texto/card embutido em imagem.
- Pessoa recorta corretamente em desktop e mobile.
- Cards batem visualmente com a referencia.

### Checkpoint 5 - Corrigir Como Funciona

1. Calibrar container externo, raio e borda.
2. Ajustar grid, altura dos cards e espacamentos.
3. Ajustar card ativo laranja e numerador branco.
4. Ajustar CTA sobreposto e linhas laterais.
5. Validar com `steps-section-web.png`.

Criterio de aceite:

- Secao bate com o print de referencia sem depender do print.
- CTA nao sobrepoe conteudo em nenhuma largura.

### Checkpoint 6 - Corrigir Agendamento

1. Decidir se a copy da imagem continua no design final.
2. Se continuar, recriar a copy no DOM e usar foto limpa no fundo.
3. Ajustar formulario ao mesmo sistema visual dos cards/botoes.
4. Adicionar campo de data de nascimento em etapa funcional propria, se confirmado como requisito.
5. Validar estados: carregando servicos, carregando horarios, erro, sem horarios e envio.

Criterio de aceite:

- Formulario legivel, estavel e responsivo.
- Texto importante nao fica preso dentro de imagem.
- Fluxo funcional preservado.

### Checkpoint 7 - Corrigir Avisos Importantes

1. Separar personagem/cartaz/fundo se houver asset limpo.
2. Ajustar card branco, icone e titulo.
3. Ajustar lista de avisos para mobile.
4. Conferir contraste e acessibilidade.

Criterio de aceite:

- Personagem nao corta texto nem cards.
- Avisos ficam legiveis em telas pequenas.

### Checkpoint 8 - Harmonizar secoes derivadas

1. Revisar Beneficios para nao duplicar visual de "Como funciona" sem intencao.
2. Melhorar FAQ seguindo os mesmos tokens, sem criar visual novo.
3. Ajustar footer com logo vetorial.
4. Aplicar o mesmo sistema nas telas de sucesso, pendencia, erro e status.

Criterio de aceite:

- Tudo parece pertencer ao mesmo design system.
- Nenhuma secao parece template generico fora do Figma.

### Checkpoint 9 - Verificacao final

1. Rodar lint/build.
2. Subir servidor local.
3. Capturar screenshots em desktop, tablet e mobile.
4. Comparar visualmente contra os prints de referencia.
5. Checar:
   - textos sem overflow;
   - elementos sem sobreposicao incoerente;
   - imagens nitidas;
   - CTAs clicaveis;
   - formularios usaveis;
   - responsividade real.

Criterio de aceite:

- Build passa.
- Landing aprovada visualmente por secao.
- Pendencias restantes documentadas, nao escondidas.

## Ordem de execucao recomendada

1. Fonte visual/assets.
2. Tokens/componentes base.
3. Hero.
4. Servico.
5. Como funciona.
6. Agendamento.
7. Avisos.
8. Beneficios/FAQ/Footer/telas derivadas.
9. Verificacao final.

Nenhuma etapa deve comecar antes da anterior estar validada, salvo se o usuario pedir explicitamente para trocar a prioridade.
