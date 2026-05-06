const express = require("express");
const { Cliente, Veiculo } = require("../models");
const {
  isIntegerGreaterThanZero,
  isValidEmail,
  tratarErroSequelize,
} = require("../utils/utils");

const router = express.Router();

const generosValidos = ["M", "F", "Outro"];
const tiposValidos = ["Física", "Jurídica"];

function normalizarTipo(tipo) {
  if (tipo === undefined) {
    return tipo;
  }

  const tipoNormalizado = String(tipo).toLowerCase();

  if (["física", "fisica", "fã­sica"].includes(tipoNormalizado)) {
    return "Física";
  }

  if (["jurídica", "juridica", "jurã­dica"].includes(tipoNormalizado)) {
    return "Jurídica";
  }

  return tipo;
}

function normalizarCliente(cliente) {
  return {
    ...cliente,
    tipo: normalizarTipo(cliente.tipo),
  };
}

function validarEndereco(endereco) {
  if (!endereco || typeof endereco !== "object" || Array.isArray(endereco)) {
    return false;
  }

  return Boolean(
    endereco.logradouro &&
      endereco.numero &&
      endereco.bairro &&
      endereco.cidade &&
      endereco.uf &&
      endereco.pais &&
      endereco.cep,
  );
}

function validarCliente(cliente, obrigatorio = true) {
  const {
    nomeCompleto,
    genero,
    dataNascimento,
    tipo,
    endereco,
    telefone,
    email,
    isFornecedor,
  } = cliente;

  if (
    obrigatorio &&
    (!nomeCompleto ||
      !genero ||
      !dataNascimento ||
      !tipo ||
      !endereco ||
      !telefone ||
      !email ||
      isFornecedor === undefined)
  ) {
    return "nomeCompleto, genero, dataNascimento, tipo, endereco, telefone, email e isFornecedor são obrigatórios";
  }

  if (email !== undefined && !isValidEmail(email)) {
    return "email deve ser válido";
  }

  if (genero !== undefined && !generosValidos.includes(genero)) {
    return "genero deve ser M, F ou Outro";
  }

  if (tipo !== undefined && !tiposValidos.includes(tipo)) {
    return "tipo deve ser Física ou Jurídica";
  }

  if (endereco !== undefined && !validarEndereco(endereco)) {
    return "endereco deve conter logradouro, numero, bairro, cidade, uf, pais e cep";
  }

  if (isFornecedor !== undefined && typeof isFornecedor !== "boolean") {
    return "isFornecedor deve ser booleano";
  }

  return null;
}

router.get("/", async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      order: [["dataCriacao", "DESC"]],
    });

    return res.json(clientes);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar clientes",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isIntegerGreaterThanZero(id)) {
      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero",
      });
    }

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({
        message: "Cliente não encontrado",
      });
    }

    return res.json(cliente);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar cliente",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const dadosCliente = normalizarCliente(req.body);
    const erroValidacao = validarCliente(dadosCliente);

    if (erroValidacao) {
      return res.status(400).json({
        message: erroValidacao,
      });
    }

    const cliente = await Cliente.create(dadosCliente);

    return res.status(201).json(cliente);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro interno ao cadastrar cliente");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isIntegerGreaterThanZero(id)) {
      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero",
      });
    }

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({
        message: "Cliente não encontrado",
      });
    }

    const dadosCliente = normalizarCliente(req.body);
    const erroValidacao = validarCliente(dadosCliente, false);

    if (erroValidacao) {
      return res.status(400).json({
        message: erroValidacao,
      });
    }

    const clienteAtualizado = await cliente.update({
      nomeCompleto: dadosCliente.nomeCompleto ?? cliente.nomeCompleto,
      genero: dadosCliente.genero ?? cliente.genero,
      dataNascimento: dadosCliente.dataNascimento ?? cliente.dataNascimento,
      tipo: dadosCliente.tipo ?? cliente.tipo,
      endereco: dadosCliente.endereco ?? cliente.endereco,
      telefone: dadosCliente.telefone ?? cliente.telefone,
      email: dadosCliente.email ?? cliente.email,
      isFornecedor: dadosCliente.isFornecedor ?? cliente.isFornecedor,
      observacao: dadosCliente.observacao ?? cliente.observacao,
    });

    return res.json(clienteAtualizado);
  } catch (error) {
    return tratarErroSequelize(error, res, "Erro interno ao atualizar cliente");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isIntegerGreaterThanZero(id)) {
      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero",
      });
    }

    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({
        message: "Cliente não encontrado",
      });
    }

    const possuiVeiculos = await Veiculo.findOne({
      where: {
        id_cliente: id,
      },
    });

    if (possuiVeiculos) {
      return res.status(409).json({
        message: "Cliente possui veículos vinculados",
      });
    }

    await cliente.destroy();

    return res.status(200).json({
      message: "Cliente deletado com sucesso",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao deletar cliente",
    });
  }
});

module.exports = router;
