# Testes do formulário de fornecedores

1. Instale as dependências com npm install e tenha Google Chrome instalado.
2. Inicie o servidor local com npm run dev.
3. Execute npm run test:suppliers em outro terminal.

SUPPLIER_TEST_URL permite usar outra porta local. Os testes montam os componentes reais com listas vazias e interceptam o POST/PATCH dos fornecedores. Nenhum cadastro de teste é gravado no banco.

O runner cria app/supplier-test-preview/page.tsx temporariamente e remove o arquivo ao finalizar, mesmo em caso de falha dos testes. Não execute build/deploy ao mesmo tempo. Se o processo for encerrado à força, remova somente esse arquivo temporário antes de rodar novamente.

A suíte cobre cadastro mínimo/completo, edição, erros, preservação de dados, moeda, seções, foco, limites de anexos e dimensões móveis/desktop. A simulação de VisualViewport não substitui um teste com teclado de um aparelho físico. Upload real de PDF e persistência real não fazem parte desta suíte.

Capturas e resultados são gravados em design/fornecedor-mobile/validacao.
