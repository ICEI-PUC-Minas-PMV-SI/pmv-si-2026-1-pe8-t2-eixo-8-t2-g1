const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
require("dotenv").config();
const { sequelize } = require("./models");
const autenticarCookie = require("./middlewares/auth");

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
const categoriasRoutes = require("./routes/categorias");
const marcasRoutes = require("./routes/marcas");
const tiposRoutes = require("./routes/veiculos_tipos");
const empresaRoutes = require("./routes/empresas");
const smtpRoutes = require("./routes/smtp");

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origem nao permitida pelo CORS"));
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res) => {
  res.json({ message: "API AutoPro rodando" });
});

app.get("/swagger.json", (req, res) => {
  res.json(swaggerDocument);
});

app.use("/clientes", autenticarCookie, clientesRoutes);
app.use("/veiculos", autenticarCookie, veiculosRoutes);
app.use("/servicos", autenticarCookie, servicosRoutes);
app.use("/itens-servico", autenticarCookie, itensServicoRoutes);
app.use("/produtos", autenticarCookie, produtosRoutes);
app.use("/relatorios", autenticarCookie, relatoriosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/perfis", autenticarCookie, perfisRoutes);
app.use("/permissoes", autenticarCookie, permissoesRoutes);
app.use("/fornecedores", autenticarCookie, fornecedoresRoutes);
app.use("/categorias", autenticarCookie, categoriasRoutes);
app.use("/marcas", autenticarCookie, marcasRoutes);
app.use("/tipos/veiculos", autenticarCookie, tiposRoutes);
app.use("/config/empresa", autenticarCookie, empresaRoutes);
app.use("/config/smtp", autenticarCookie, smtpRoutes);


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

if (require.main === module) {
  startDB();
}

module.exports = {
  app,
  startDB,
};
