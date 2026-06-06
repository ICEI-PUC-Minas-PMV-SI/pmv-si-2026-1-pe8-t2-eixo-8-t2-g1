const Cliente = require("./Cliente");
const ItemServico = require("./ItemServico");
const Produto = require("./Produto");
const Servico = require("./Servico");
const Usuario = require("./Usuario");
const Veiculo = require("./Veiculo");
const Perfil = require("./Perfil");
const Permissao = require("./Permissao");
const PerfilPermissao = require("./PerfilPermissao");
const Categoria = require("./Categoria");
const Marca = require("./Marca");
const TipoVeiculo = require("./TipoVeiculo");
const Smtp = require("./Smtp");
const Empresa = require("./Empresa");
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

Marca.hasMany(Produto, {
  foreignKey: "idMarca",
  as: "produtos",
});

Produto.belongsTo(Marca, {
  foreignKey: "idMarca",
  as: "marca",
});

Categoria.hasMany(Produto, {
  foreignKey: "idCategoria",
  as: "produtos",
});

Produto.belongsTo(Categoria, {
  foreignKey: "idCategoria",
  as: "categoria",
});

Cliente.hasMany(Produto, {
  foreignKey: "idFornecedor",
  as: "produtosFornecidos",
});

Produto.belongsTo(Cliente, {
  foreignKey: "idFornecedor",
  as: "fornecedor",
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
  Perfil,
  Permissao,
  PerfilPermissao,
  Categoria,
  Marca,
  TipoVeiculo,
  Smtp,
  Empresa,
};
