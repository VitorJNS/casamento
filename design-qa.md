# Verificação do formulário de fornecedor

Data: 2026-09-07

final result: passed

Escopo: interface e fluxo do formulário real nas áreas dos noivos e da cerimonialista, em Chrome local com API simulada. Não é uma certificação de todos os aparelhos ou da infraestrutura externa.

## Implementação

- Opção 1: campos essenciais primeiro; contato, contrato/pagamentos e observações expansíveis.
- Diálogo nativo em tela cheia no celular e limitado a 640 px no desktop. Navegação externa fica inerte; foco retorna ao botão de abertura.
- Cabeçalho e rodapé fora da rolagem dos campos. Altura e posição acompanham VisualViewport, com espaço para a área segura inferior.
- Rótulos persistentes, controles de pelo menos 48 px, telefone com teclado apropriado e limite de 600 caracteres nas observações.
- API, validação de negócio e mecanismos existentes de anexos preservados. Cerimonialista mantém seu campo de email e seus status; upload de PDF continua exclusivo da área dos noivos.

## Comparação visual

Referências: design/fornecedor-mobile/opcao-1.png e expansões opcao-1-contato.png, opcao-1-contrato.png e opcao-1-observacoes.png.
Capturas finais: design/fornecedor-mobile/validacao/final-*.png.
Referência principal e contato foram inspecionados junto às capturas correspondentes; contrato e observações também tiveram suas capturas inspecionadas.
Referências são imagens em alta densidade com proporção equivalente a 390 x 844; capturas do navegador usam 390 x 844 CSS px e deviceScaleFactor 1. A barra do sistema e o teclado desenhados na referência não são elementos da aplicação.

O formulário conserva a hierarquia, o verde/lavanda, os campos arredondados e as expansões aprovadas. O cabeçalho foi compactado para priorizar a área de digitação. Categoria permanece campo livre conforme o sistema existente. Os campos essenciais continuam na mesma rolagem; não há substituição por um resumo ao rolar. Essas adaptações evitam novos modos de preenchimento. O contraste dos textos opcionais usa verde em vez de lavanda claro. Nenhuma sobreposição funcional foi encontrada nos cenários abaixo.

Iteração mobile adicional: a captura enviada pelo usuário mostrou corte horizontal no seletor de status e no botão de salvar. O diálogo agora usa `100dvw`, aplica `box-sizing: border-box` em toda a árvore do formulário e limita cabeçalho, corpo, rodapé, seções e botões a `max-width: 100%`. Os botões de status também foram compactados em viewports estreitas.

Iteração de contenção da página: a tela de fornecedores não permite mais arraste lateral no celular. O shell logado limita a largura da página, e os cards/boxes de fornecedores agora usam `min-width: 0`, `max-width: 100%` e `overflow-hidden` nos pontos que podiam crescer por texto longo, valores, telefone ou ações.

## Verificações aprovadas

- Build de produção, TypeScript e lint dos arquivos alterados e testes.
- Cadastro somente com os três obrigatórios e cadastro completo, em ambas as áreas.
- Edição nos noivos preservando os dados opcionais.
- Obrigatórios vazios e valor pago superior ao contrato bloqueiam o envio.
- Conversão de valores em reais para centavos e envio dos campos de contato/data/observações.
- Falha de API exibe mensagem e mantém o rascunho para nova tentativa.
- Abrir/fechar seções preserva valores; atalho de contato foca o telefone.
- Escape, restauração de foco e desbloqueio da rolagem ao fechar.
- Arquivo que não é PDF e PDF acima de 10 MB são rejeitados.
- Sem erros JavaScript capturados durante os fluxos.
- Geometria e hit testing do botão: 320x568, 390x844, 430x932, 844x390 e 1280x800, com todas as seções abertas, inclusive com erros.
- Viewport reduzido para 390x500; simulação explícita de VisualViewport com altura 480 e offsetTop 40. Botão dentro da área visível e corpo sem invadir rodapé.
- Nova captura visual em 390x844 e 320x568 sem corte lateral no status, nas seções expansíveis ou no botão de salvar.
- Após cadastrar fornecedor com nome/categoria longos, a lista foi testada tentando rolar horizontalmente; `scrollX` permaneceu 0 e `document/body` ficaram dentro da largura da viewport nas áreas dos noivos e da cerimonialista.

## Limites

O teclado físico de iOS/Android não foi testado; a alteração de viewport foi simulada. Gravação real no banco e upload de PDF bem-sucedido no serviço externo não foram executados. Os testes verificam o envio da interface com respostas interceptadas, sem criar dados de teste no banco. As rotas de produção e autenticação não foram alteradas.

## Reexecutar

Com `npm run dev` ativo e Chrome instalado, execute `npm run test:suppliers`. Para outra porta local, defina SUPPLIER_TEST_URL (ex.: http://localhost:3100).
O runner cria uma rota temporária com os componentes reais e a remove em finally. Não execute build/deploy durante a suíte. Resultados ficam em design/fornecedor-mobile/validacao/.


---

# Guest cards and responsive message dialog - 2026-09-16

final result: passed

Scope: selected option 3 applied to the existing guest manager and AdminShell. Browser evidence uses synthetic guests (no database writes). Existing supplier report above is preserved.

## Visual references and normalization

Sources: public/design/convidados/opcao-3.png and opcao-3-mensagem-aberta.png (1713x918); opcao-3-mensagem-tablet.png (1047x1502, normalized to 834x1194 CSS); opcao-3-mensagem-celular.png (853x1844, normalized to 390x844 CSS). Generated references represent layout intent; existing application navigation, typography tokens and authenticated shell remain in place.

Implementation evidence: public/design/convidados/implementacao/{desktop,tablet,celular,estreito,paisagem}-{cards,mensagem}.png. Dialog captures use 1713x918, 834x1194, 390x844, 320x568 and 844x390 respectively at deviceScaleFactor 1. Card captures are full-page screenshots at those viewport widths.

## Findings and comparison history

- P2 fixed: initial desktop dialog stretched to viewport height. Tablet/desktop now use content-sized height, capped at viewport minus 64px and vertically centered. Mobile retains nearly full-height reading area.
- P2 fixed: very narrow cards need additional room for response metadata. Below 300px card width, status/type use the first row and response spans the second. Heights remain identical across every non-editing card.
- Two equal columns on wider content areas and one on narrow areas. Group names and variable-length observations do not increase card height. Full group names are available in a separate accessible dialog.
- Full-view and focused review: desktop message and mobile message captures visually inspected; narrow full-page cards checked for status, footer and group alignment. Focused regions are readable in those captures without an additional crop.

## Required surfaces

- Typography: existing sans-serif and weights retained; title 24px, message 16px mobile / 18px larger screens with relaxed line-height. Text preserves line breaks and wraps long unbroken strings. Small card metadata remains readable; full names are available in details.
- Spacing/layout: fixed section geometry for resting cards; matching footers with/without notes; content-sized desktop dialog and near-full-height mobile dialog. Footer/header stay outside the message scroller.
- Tokens: existing olive, lavender, paper and neutral borders retained; dimmed modal backdrop and semantic status colors.
- Assets: existing app branding retained; Lucide icons used for message, group, close and actions. No new raster assets required by the implemented component.
- Copy: full response note and internal note remain separate. Empty cards show Sem observacao; nonempty ones offer Ler mensagem or Ler anotacao. Group overflow exposes every name.

## Verification

Passed at all five viewport sizes: equal card heights, no horizontal viewport/card overflow, modal contained in viewport, complete long-message/internal-note content, body scroll lock, internal scrolling, close button in viewport, Escape dismissal, focus restoration and modal focus containment, all group members accessible. No browser page errors.

Existing npm run test:guests passed (create updates list and count with mocked API). ESLint and TypeScript checks are recorded in the task verification.

P3: responsive mockups are illustrative; the existing admin shell, search copy and content density differ from generated background elements intentionally. No actionable P0/P1/P2 findings remain within scope. Editing mode retains its existing form layout and is intentionally not a fixed-height summary card.


## Follow-up: compact group and mobile controls

Group dialog now uses content height at all breakpoints (max-width 480px). Six names fit without scrolling at 390x844: dialog height 496px. Small/landscape viewports cap the dialog and scroll the list. Message mode retains its responsive reading layout. Group chips and +N button are all 36px tall. Music control sits above the marked mobile admin navigation, including safe-area inset; desktop retains its previous position.

Verified 390x844, 320x568, 834x1194, 844x390 and 1440x900: chip height equality, modal bounds, group contents, play/pause state and music/navigation clearance, focus restoration and long message scrolling. Corrected native dialog bottom positioning after focused inspection to avoid unnecessary group scrolling. Evidence: public/design/convidados/implementacao/grupo-compacto-celular.png and musica-acima-navegacao.png.

final result: passed
