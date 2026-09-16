# Verificacao de requests da area logada

Data: 2026-09-08

Resultado: passed

## Historia verificada

O fluxo analisado foi: area logada renderiza dados do servidor, usuario cria/edita/remove convidados ou fornecedores, a UI chama uma rota API, a API grava no banco, invalida cache e a tela precisa refletir os dados novos sem exigir refresh manual.

## Achado principal

O atraso percebido nos convidados nao era apenas tempo de request. Havia uma corrida de estado:

- `GuestListManager` atualizava a pagina via `router.refresh()` depois de criar/editar/remover.
- Ao mesmo tempo, um `useEffect` sincronizava `guests` a partir de `initialGuests`.
- Se o refresh retornasse uma arvore ainda antiga por cache/revalidacao, esse efeito podia sobrescrever a lista local nova. Resultado visivel: o usuario salvava um convidado, mas via total/lista antiga ate atualizar a pagina.

## Correcoes aplicadas

- A pagina `/admin/convidados` agora e dinamica (`force-dynamic`), alinhada as outras telas logadas.
- As mutacoes de convidados invalidam explicitamente:
  - `/admin/convidados`
  - `/admin/dashboard`
  - `/cerimonial/dashboard`
- O RSVP publico tambem invalida essas paginas, porque altera os totais de confirmados, recusados e pendentes.
- As mutacoes de fornecedores invalidam explicitamente:
  - `/admin/fornecedores`
  - `/cerimonial/fornecedores`
- A lista de convidados agora aplica o convidado criado localmente assim que a API responde, sem depender apenas do `router.refresh()`.
- Removida a sincronizacao automatica que podia trocar a lista local nova por `initialGuests` antigo.
- Adicionados logs estruturados de duracao em rotas de mutacao, sem dados pessoais do formulario.

## Logs adicionados

As rotas instrumentadas emitem:

- `request_start`
- `request_done`
- `request_failed`

Campos: `route`, `method`, `status`, `ms` e `requestId` (`x-vercel-id` quando existir). Isso permite filtrar no log da Vercel quais requests estao lentas e separar demora de banco/API de atraso de cache/UI.

## Validacao

- `npm.cmd run lint` passou nos arquivos alterados.
- `npm.cmd run test:guests` passou: cria convidado e confirma que a lista e o contador `1 pendentes` aparecem sem refresh manual.
- `npm.cmd run test:suppliers` passou: cadastro/edicao/validacoes/layout mobile continuam funcionando.
- `npm.cmd run build` passou.

## Limites

Os testes interceptam API para validar comportamento da UI sem criar dados reais no banco. A duracao real de banco em producao deve ser observada pelos novos logs estruturados na Vercel.
