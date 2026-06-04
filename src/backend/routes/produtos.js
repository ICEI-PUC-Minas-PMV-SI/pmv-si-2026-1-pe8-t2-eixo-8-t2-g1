const express = require("express");
const { Produto, ItemServico } = require("../models");
const { isIntegerGreaterThanZero } = require("../utils/utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const produtos = await Produto.findAll();

  return res.json(
    produtos.map((produto) => ({
      ...produto.toJSON(),
      quantidade: Number(produto.quantidade),
      precoUnitario: Number(produto.precoUnitario),
    }))
  );
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar produtos"
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const idValido = isIntegerGreaterThanZero(id);

    if (!idValido) {
      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero"
      });
    }

    const produto = await Produto.findByPk(id);

    if (!produto) {
      return res.status(404).json({
        message: "Produto não encontrado"
      });
    }

    return res.json(produto);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar produto"
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nome, quantidade, precoUnitario } = req.body;

    if (!nome || quantidade === undefined || precoUnitario === undefined) {
      return res.status(400).json({
        message: "nome, quantidade e precoUnitario são obrigatórios"
      });
    }

    const quantidadeNumero = Number(quantidade);
    const precoUnitarioNumero = Number(precoUnitario);

    if (!isIntegerGreaterThanZero(quantidadeNumero)) {
      return res.status(400).json({
        message: "quantidade deve ser um número inteiro maior ou igual a zero"
      });
    }

    if (Number.isNaN(precoUnitarioNumero) || precoUnitarioNumero < 0) {
      return res.status(400).json({
        message: "precoUnitario deve ser um número maior ou igual a zero"
      });
    }

    if (quantidadeNumero >= Math.pow(10, 8) || precoUnitarioNumero >= Math.pow(10, 8)) {
      return res.status(400).json({
        message: "quantidade ou preço unitário deve ser um número menor que 10^8"
      });
    }

    const produto = await Produto.create({
      nome,
      quantidade: quantidadeNumero,
      precoUnitario: precoUnitarioNumero
    });

    return res.status(201).json(produto);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Erro de validação",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Registro duplicado",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }

    return res.status(500).json({
      message: "Erro interno ao cadastrar produto"
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const idValido = isIntegerGreaterThanZero(id);

    if (!idValido) {
      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero"
      });
    }

    const produto = await Produto.findByPk(id);

    if (!produto) {
      return res.status(404).json({
        message: "Produto não encontrado"
      });
    }

    const { nome, quantidade, precoUnitario } = req.body;

    let quantidadeNumero = produto.quantidade;
    let precoUnitarioNumero = produto.precoUnitario;

    if (quantidade !== undefined) {
      quantidadeNumero = Number(quantidade);

      if (!isIntegerGreaterThanZero(quantidadeNumero)) {
        return res.status(400).json({
          message: "quantidade deve ser um número inteiro maior ou igual a zero"
        });
      }
    }

    if (precoUnitario !== undefined) {
      precoUnitarioNumero = Number(precoUnitario);
      if (Number.isNaN(precoUnitarioNumero) || precoUnitarioNumero < 0) {
        return res.status(400).json({
          message: "precoUnitario deve ser um número maior ou igual a zero"
        });
      }
    }

    if (quantidadeNumero >= Math.pow(10, 8) || precoUnitarioNumero >= Math.pow(10, 8)) {
      return res.status(400).json({
        message: "quantidade ou preço unitário deve ser um número menor que 10^8"
      });
    }

    const produtoAtualizado = await produto.update({
      nome: nome ?? produto.nome,
      quantidade: quantidadeNumero,
      precoUnitario: precoUnitarioNumero
    });

    return res.json(produtoAtualizado);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Erro de validação",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "Registro duplicado",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message,
          value: err.value
        }))
      });
    }

    return res.status(500).json({
      message: "Erro interno ao atualizar produto"
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const idValido = isIntegerGreaterThanZero(id);

    if (!idValido) {
      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero"
      });
    }

    const produto = await Produto.findByPk(id);

    if (!produto) {
      return res.status(404).json({
        message: "Produto não encontrado"
      });
    }

    const possuiItens = await ItemServico.findOne({
      where: {
        idProduto: id
      }
    });

    if (possuiItens) {
      return res.status(409).json({
        message: "Produto possui itens de serviço vinculados"
      });
    }

    await produto.destroy();

    return res.status(200).json({
      message: "Produto deletado com sucesso"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao deletar produto"
    });
  }
});

module.exports = router;
