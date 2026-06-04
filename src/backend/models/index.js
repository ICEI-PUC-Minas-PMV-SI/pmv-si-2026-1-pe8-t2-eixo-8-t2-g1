const Cliente = require("./Cliente");
const ItemServico = require("./ItemServico");
const Produto = require("./Produto");
const Servico = require("./Servico");
const Usuario = require("./Usuario");
const Veiculo = require("./Veiculo");
const Fornecedor = require("./Fornecedor");
const Perfil = require("./Perfil");
const Permissao = require("./Permissao");
const PerfilPermissao = require("./PerfilPermissao");
const sequelize = require("../database/connection");

Cliente.hasMany(Veiculo, {
  foreignKey: "idCliente",
  as: "veiculos",
});

Veiculo.belongsTo(Cliente, {
  foreignKey: "idCliente",
  as: "cliente",
});

Veiculo.hasMany(Servico, {
  foreignKey: "idVeiculo",
  as: "servicos",
});

Servico.belongsTo(Veiculo, {
  foreignKey: "idVeiculo",
  as: "veiculo",
});

Servico.hasMany(ItemServico, {
  foreignKey: "idServico",
  as: "itens",
});

ItemServico.belongsTo(Servico, {
  foreignKey: "idServico",
  as: "servico",
});

Produto.hasMany(ItemServico, {
  foreignKey: "idProduto",
  as: "itensServico",
});

ItemServico.belongsTo(Produto, {
  foreignKey: "idProduto",
  as: "produto",
});

Perfil.hasMany(Usuario, {
  foreignKey: "idPerfil",
  as: "usuarios",
});

Usuario.belongsTo(Perfil, {
  foreignKey: "idPerfil",
  as: "perfilInfo",
});

Perfil.belongsToMany(Permissao, {
  through: PerfilPermissao,
  foreignKey: "idPerfil",
  otherKey: "idPermissao",
  as: "permissoes",
});

Permissao.belongsToMany(Perfil, {
  through: PerfilPermissao,
  foreignKey: "idPermissao",
  otherKey: "idPerfil",
  as: "perfis",
});

module.exports = {
  sequelize,
  Cliente,
  Veiculo,
  Servico,
  ItemServico,
  Produto,
  Usuario,
  Fornecedor,
  Perfil,
  Permissao,
  PerfilPermissao
};
