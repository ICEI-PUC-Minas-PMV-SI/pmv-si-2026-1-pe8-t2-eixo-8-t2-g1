const express = require("express");
const cors = require("cors");
const { DataTypes } = require("sequelize");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
require("dotenv").config();
const { sequelize, Perfil } = require("./models");

const app = express();
const clientesRoutes = require("./routes/clientes");
const itensServicoRoutes = require("./routes/itensServico");
const produtosRoutes = require("./routes/produtos");
const relatoriosRoutes = require("./routes/relatorios");
const servicosRoutes = require("./routes/servicos");
const usuariosRoutes = require("./routes/usuarios");
const veiculosRoutes = require("./routes/veiculos");
const fornecedoresRoutes = require("./routes/fornecedores");
const perfisRoutes = require("./routes/perfis");
const permissoesRoutes = require("./routes/permissoes");


app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "127.0.0.1:5173/*");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res) => {
  res.json({ message: "API AutoPro rodando" });
});

app.get("/swagger.json", (req, res) => {
  res.json(swaggerDocument);
});

app.use("/clientes", clientesRoutes);
app.use("/veiculos", veiculosRoutes);
app.use("/servicos", servicosRoutes);
app.use("/itens-servico", itensServicoRoutes);
app.use("/produtos", produtosRoutes);
app.use("/relatorios", relatoriosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/perfis", perfisRoutes);
app.use("/permissoes", permissoesRoutes);
app.use("/fornecedores", fornecedoresRoutes);

const PORT = process.env.PORT || 3001;
/* const PERFIS_PADRAO = ["Administrador", "Supervisor", "Padrão"];

async function garantirPerfisPadrao() {
  for (const nome of PERFIS_PADRAO) {
    await Perfil.findOrCreate({
      where: {
        nome,
      },
      defaults: {
        nome,
      },
    });
  }
}

function normalizarNomeTabela(tabela) {
  if (typeof tabela === "string") {
    return tabela;
  }

  return tabela.tableName || tabela.table_name || tabela.name;
}

async function migrarUsuarioPerfil() {
  const queryInterface = sequelize.getQueryInterface();
  const tabelas = await queryInterface.showAllTables();
  const existeTabelaUsuarios = tabelas
    .map(normalizarNomeTabela)
    .includes("usuarios");

  if (!existeTabelaUsuarios) {
    return;
  }

  const usuariosTable = await queryInterface.describeTable("usuarios");

  if (!usuariosTable.id_perfil) {
    await queryInterface.addColumn("usuarios", "id_perfil", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "perfis",
        key: "id",
      },
    });
  }

  const usuariosTableAtualizada = await queryInterface.describeTable("usuarios");

  if (usuariosTableAtualizada.perfil) {
    await sequelize.query(`
      UPDATE usuarios
      SET id_perfil = perfis.id
      FROM perfis
      WHERE usuarios.perfil::text = perfis.nome
        AND usuarios.id_perfil IS NULL
    `);
  }

  const perfilPadrao = await Perfil.findOne({
    where: {
      nome: "Padrão",
    },
  });

  if (perfilPadrao) {
    await sequelize.query(
      "UPDATE usuarios SET id_perfil = :idPerfil WHERE id_perfil IS NULL",
      {
        replacements: {
          idPerfil: perfilPadrao.id,
        },
      },
    );
  }

  const usuariosTableFinal = await queryInterface.describeTable("usuarios");

  if (usuariosTableFinal.id_perfil?.allowNull) {
    await sequelize.query("ALTER TABLE usuarios ALTER COLUMN id_perfil SET NOT NULL");
  }
} */

async function startDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
/*     await garantirPerfisPadrao();
    await migrarUsuarioPerfil(); */
    console.log("Conexao com PostgreSQL realizada com sucesso");
  } catch (err) {
    console.error("Erro ao conectar com PostgreSQL:", err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

startDB();
