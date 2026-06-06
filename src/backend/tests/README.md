# Suite de testes da API

Esta suite cobre todas as rotas implementadas no backend, com excecao das
familias explicitamente fora do escopo:

- `categorias`
- `marcas`
- `empresas`
- `smtp`
- `veiculos_tipos`

Os testes usam o banco isolado `PCC_AUTO_TEST`, criado automaticamente, e
limpam todas as tabelas antes de cada caso. O nome do banco precisa terminar
com `_TEST`; a execucao e interrompida caso essa protecao nao seja atendida.

As rotas somente de leitura (`fornecedores` e `relatorios`) nao possuem
payload, ID de recurso ou campos obrigatorios. Para elas, os cenarios
equivalentes cobrem autenticacao, resposta vazia/populada, formato agregado e
falha de persistencia.

Execute no container do backend:

```sh
npm test
```
