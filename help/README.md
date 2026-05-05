# AutoPro gestão de oficinas

`CURSO: Sistemas de Informação`

`DISCIPLINA: Projeto - Trabalho de Conclusão de Curso`

`SEMESTRE: 8º`

Sistemas web para gestão de oficinas mecânicas 

## Integrantes

* Davi Coelho Peixoto
* Fernanda Belmont Rivlis
* Márcia Delmare de Oliveira Peixoto
* Pedro Miranda Cardoso Neto
* Valdeir Carlos Mendes


## Orientador

* Simone Fernandes Queiroz

# AutoPro

Sistema web para gerenciamento de oficina automotiva.

O projeto esta organizado como um monorepo com backend, frontend e banco PostgreSQL rodando via Docker Compose.

## Tecnologias

- Backend: Node.js, Express, Sequelize, PostgreSQL
- Frontend: React, Vite, TypeScript, React Router DOM, Axios
- Documentacao da API: Swagger UI
- Ambiente: Docker e Docker Compose

## Estrutura

```text
pcc/
|-- backend/
|   |-- database/
|   |   `-- connection.js
|   |-- models/
|   |   |-- Cliente.js
|   |   |-- ItemServico.js
|   |   |-- Produto.js
|   |   |-- Servico.js
|   |   |-- Usuario.js
|   |   |-- Veiculo.js
|   |   `-- index.js
|   |-- routes/
|   |   |-- clientes.js
|   |   |-- itensServico.js
|   |   |-- produtos.js
|   |   |-- servicos.js
|   |   |-- usuarios.js
|   |   `-- veiculos.js
|   |-- utils/
|   |-- index.js
|   `-- swagger.json
|-- frontend/
|   |-- client/
|   |   `-- src/
|   |       |-- api/
|   |       |-- components/
|   |       |-- pages/
|   |       `-- App.tsx
|   |-- server/
|   `-- package.json
`-- docker-compose.yml
```

## Pre-requisitos

- Docker Desktop instalado e rodando
- Git, se for clonar/versionar o projeto
- VS Code, opcional

## Como rodar

Na raiz do projeto:

```powershell
docker compose up --build
```

Depois acesse:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3001
Swagger:  http://localhost:3001/api-docs
OpenAPI:  http://localhost:3001/swagger.json
```

Para parar:

```powershell
docker compose down
```

Para parar e apagar o volume do banco:

```powershell
docker compose down -v
```

## Como rodar sem Docker

Para rodar sem Docker, voce precisa ter instalado no computador:

- Node.js
- npm
- pnpm
- PostgreSQL

### Banco local

Crie um banco PostgreSQL com as mesmas credenciais usadas pelo projeto:

```text
Database: PCC_AUTO
Usuario: postgres
Senha: 1234
Porta: 5432
```

Se o seu PostgreSQL local estiver usando outra porta, ajuste o `DB_PORT` no arquivo `backend/.env`.

### Backend sem Docker

Na pasta `backend`, instale as dependencias:

```powershell
cd backend
npm install
```

Crie ou ajuste o arquivo `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=PCC_AUTO
DB_USER=postgres
DB_PASSWORD=1234
JWT_SECRET=troque-este-segredo-em-producao
JWT_EXPIRES_IN_SECONDS=86400
```

Inicie o backend em modo desenvolvimento:

```powershell
npm run dev
```

Ou rode em modo normal:

```powershell
npm start
```

Depois acesse:

```text
Backend: http://localhost:3001
Swagger: http://localhost:3001/api-docs
```

### Frontend sem Docker

Em outro terminal, na pasta `frontend`, instale as dependencias:

```powershell
cd frontend
pnpm install
```

Se o backend estiver em `http://localhost:3001`, nenhuma variavel extra e obrigatoria. Caso queira configurar explicitamente, crie ou ajuste o arquivo `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

Inicie o frontend:

```powershell
pnpm dev
```

Depois acesse:

```text
Frontend: http://localhost:5173
```

## Banco de dados

O PostgreSQL roda no container `pcc_db`.

Credenciais padrao do Docker Compose:

```text
Host pelo backend no Docker: db
Host pelo computador/pgAdmin: localhost
Porta pelo computador/pgAdmin: 5433
Porta interna do container: 5432
Database: PCC_AUTO
Usuario: postgres
Senha: 1234
```

No pgAdmin, use:

```text
Host: localhost
Port: 5433
Maintenance database: PCC_AUTO
Username: postgres
Password: 1234
```

O backend usa Sequelize e executa `sequelize.sync()` ao iniciar.

## Variaveis de ambiente

Arquivo principal:

```text
backend/.env
```

Exemplo:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=PCC_AUTO
DB_USER=postgres
DB_PASSWORD=1234
JWT_SECRET=troque-este-segredo-em-producao
JWT_EXPIRES_IN_SECONDS=86400
```

No Docker Compose, o `DB_HOST` e sobrescrito para `db`, que e o nome do servico PostgreSQL dentro da rede Docker.

## Backend

Scripts:

```powershell
cd backend
npm run dev
npm start
```

Principais rotas:

```text
GET    /
GET    /swagger.json

GET    /clientes
POST   /clientes
GET    /clientes/:id
PUT    /clientes/:id
DELETE /clientes/:id

GET    /veiculos
POST   /veiculos
GET    /veiculos/:id
PUT    /veiculos/:id
DELETE /veiculos/:id

GET    /servicos
POST   /servicos
GET    /servicos/:id
PUT    /servicos/:id
DELETE /servicos/:id

GET    /itens-servico
POST   /itens-servico
GET    /itens-servico/:id
PUT    /itens-servico/:id
DELETE /itens-servico/:id

GET    /produtos
POST   /produtos
GET    /produtos/:id
PUT    /produtos/:id
DELETE /produtos/:id

POST   /usuarios/login
GET    /usuarios
POST   /usuarios
GET    /usuarios/:id
PUT    /usuarios/:id
DELETE /usuarios/:id
```

## Login

Login:

```http
POST /usuarios/login
```

Body:

```json
{
  "email": "admin@email.com",
  "senha": "123456"
}
```

Resposta:

```json
{
  "token": "jwt",
  "usuario": {
    "id": "uuid",
    "nome": "Admin",
    "email": "admin@email.com",
    "perfil": "Administrador",
    "status": "Ativo",
    "dataCriacao": "2026-05-03T00:00:00.000Z",
    "dataAtualizacao": "2026-05-03T00:00:00.000Z"
  }
}
```

O frontend salva:

```text
localStorage.authToken
localStorage.authUser
```

O Axios envia o token automaticamente no header:

```text
Authorization: Bearer <token>
```

## Criar primeiro usuario

Como o login depende de usuario cadastrado, crie um usuario pelo Swagger em:

```text
http://localhost:3001/api-docs
```

Use a rota:

```text
POST /usuarios
```

Exemplo:

```json
{
  "nome": "Administrador",
  "email": "admin@email.com",
  "perfil": "Administrador",
  "status": "Ativo",
  "senha": "123456"
}
```

Depois entre no frontend com esse email e senha.

## Frontend

Scripts:

```powershell
cd frontend
pnpm dev
pnpm check
pnpm build
```

Rotas principais:

```text
/login
/
/pessoas
/pessoas/:id/editar
/veiculos
/veiculos/:id/editar
/os
/os/:id/editar
/produtos
/produtos/:id/editar
/usuarios
/tabelas
/fornecedores
/configuracoes
/relatorios
```

O roteamento usa `react-router-dom`.

## Permissoes de usuario

Na tela de usuarios:

- `Administrador` pode criar, editar, habilitar/desabilitar e resetar senha.
- `Supervisor` e `Padrao` visualizam a lista sem acoes de modificacao.

## Desenvolvimento com Docker

O Compose usa volumes:

```yaml
./backend:/app
./frontend:/app
```

Por isso, alteracoes nos arquivos sao refletidas automaticamente nos containers.

O backend usa `nodemon`.

O frontend usa Vite.

## Comandos uteis

Ver logs:

```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

Entrar no backend:

```powershell
docker compose exec backend sh
```

Entrar no frontend:

```powershell
docker compose exec frontend sh
```

Rodar typecheck do frontend:

```powershell
docker compose exec frontend pnpm check
```

Testar API:

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:3001/
Invoke-WebRequest -UseBasicParsing http://localhost:3001/usuarios
```

## Problemas comuns

### Frontend nao abre em http://localhost:5173

Confira se o container esta rodando:

```powershell
docker compose ps
docker compose logs -f frontend
```

### Backend nao conecta no banco

Dentro do Docker, o backend deve usar:

```text
DB_HOST=db
```

Esse valor ja esta configurado no `docker-compose.yml`.

Pelo pgAdmin no computador, use:

```text
Host: localhost
Port: 5433
```

### Dados aparecem no pgAdmin mas nao na API

Verifique se voce esta olhando o mesmo banco e porta:

```text
Container PostgreSQL: pcc_db
Banco: PCC_AUTO
Porta host: 5433
```

### Alterei arquivos e nao atualizou

Normalmente o volume atualiza automaticamente. Se travar:

```powershell
docker compose restart backend
docker compose restart frontend
```

### Resetar banco local

Isso apaga todos os dados:

```powershell
docker compose down -v
docker compose up --build
```