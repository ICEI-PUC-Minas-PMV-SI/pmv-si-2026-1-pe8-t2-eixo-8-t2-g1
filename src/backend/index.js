const express = require("express");
const cors = require("cors");
const { DataTypes } = require("sequelize");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
require("dotenv").config();
const { sequelize } = require("./models");

const app = express();
const clientesRoutes = require("./routes/clientes");
const itensServicoRoutes = require("./routes/itensServico");
const produtosRoutes = require("./routes/produtos");
const servicosRoutes = require("./routes/servicos");
const usuariosRoutes = require("./routes/usuarios");
const veiculosRoutes = require("./routes/veiculos");

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
app.use("/usuarios", usuariosRoutes);

const PORT = process.env.PORT || 3001;

async function startDB() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
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
