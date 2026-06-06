const express = require("express");
const { Produto, ItemServico } = require("../models");
const { isIntegerGreaterThanZero } = require("../utils/utils");

const router = express.Router();

function isIntegerGreaterThanOrEqualToZero(value) {
  return Number.isInteger(value) && value >= 0;
}

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
    const {
      titulo,
      descricao,
      codigoSku,
      idMarca,
      idCategoria,
      idFornecedor,
      tipoItem,
      preco,
      estoqueAtual,
    } = req.body;

    if (
      !titulo ||
      !codigoSku ||
      !idMarca ||
      !idCategoria ||
      !idFornecedor
    ) {
      return res.status(400).json({
        message:
          "titulo, codigoSku, idMarca, idCategoria e idFornecedor são obrigatórios",
      });
    }

    const produto = await Produto.create({
      titulo,
      descricao,
      codigoSku,
      idMarca,
      idCategoria,
      idFornecedor,
      tipoItem: tipoItem || "Produto",
      preco: Number(preco || 0),
      estoqueAtual: Number(estoqueAtual || 0),
    });

    return res.status(201).json(produto);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro interno ao cadastrar produto",
    });
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

    const produto = await Produto.findByPk(id);

    if (!produto) {
      return res.status(404).json({
        message: "Produto não encontrado",
      });
    }

    const produtoAtualizado = await produto.update({
      titulo: req.body.titulo ?? produto.titulo,
      descricao: req.body.descricao ?? produto.descricao,
      codigoSku: req.body.codigoSku ?? produto.codigoSku,
      idMarca: req.body.idMarca ?? produto.idMarca,
      idCategoria:
        req.body.idCategoria ?? produto.idCategoria,
      idFornecedor:
        req.body.idFornecedor ?? produto.idFornecedor,
      tipoItem: req.body.tipoItem ?? produto.tipoItem,
      preco: req.body.preco ?? produto.preco,
      estoqueAtual:
        req.body.estoqueAtual ??
        produto.estoqueAtual,
    });

    return res.json(produtoAtualizado);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Erro interno ao atualizar produto",
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
