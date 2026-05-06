const Cliente = require("./Cliente");
const ItemServico = require("./ItemServico");
const Produto = require("./Produto");
const Servico = require("./Servico");
const Usuario = require("./Usuario");
const Veiculo = require("./Veiculo");
const sequelize = require("../database/connection");

Cliente.hasMany(Veiculo, {
  foreignKey: "id_cliente",
  as: "veiculos",
});

Veiculo.belongsTo(Cliente, {
  foreignKey: "id_cliente",
  as: "cliente",
});

Veiculo.hasMany(Servico, {
  foreignKey: "id_veiculo",
  as: "servicos",
});

Servico.belongsTo(Veiculo, {
  foreignKey: "id_veiculo",
  as: "veiculo",
});

Servico.hasMany(ItemServico, {
  foreignKey: "id_servico",
  as: "itens",
});

ItemServico.belongsTo(Servico, {
  foreignKey: "id_servico",
  as: "servico",
});

Produto.hasMany(ItemServico, {
  foreignKey: "id_produto",
  as: "itens_servico",
});

ItemServico.belongsTo(Produto, {
  foreignKey: "id_produto",
  as: "produto",
});

module.exports = {
  sequelize,
  Cliente,
  Veiculo,
  Servico,
  ItemServico,
  Produto,
  Usuario,
};
