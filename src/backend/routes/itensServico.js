const express = require("express");
const { sequelize, ItemServico, Servico, Produto } = require("../models");
const { isIntegerGreaterThanZero } = require("../utils/utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const itensServico = await ItemServico.findAll({
      include: [
        {
          model: Servico,
          as: "servico"
        },
        {
          model: Produto,
          as: "produto"
        }
      ]
    });

    return res.json(itensServico);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar itens de serviço"
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

    const itemServico = await ItemServico.findByPk(id, {
      include: [
        {
          model: Servico,
          as: "servico"
        },
        {
          model: Produto,
          as: "produto"
        }
      ]
    });

    if (!itemServico) {
      return res.status(404).json({
        message: "Item de serviço não encontrado"
      });
    }

    return res.json(itemServico);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar item de serviço"
    });
  }
});

router.post("/", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id_servico, id_produto, quantidade_utilizada } = req.body;

    const idServico = Number(id_servico);
    const idProduto = Number(id_produto);
    const quantidadeUtilizada = Number(quantidade_utilizada);

    if (!isIntegerGreaterThanZero(idServico)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "id_servico deve ser um número inteiro maior que zero"
      });
    }

    if (!isIntegerGreaterThanZero(idProduto)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "id_produto deve ser um número inteiro maior que zero"
      });
    }

    if (!isIntegerGreaterThanZero(quantidadeUtilizada)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "quantidade_utilizada deve ser um número inteiro maior que zero"
      });
    }

    const servico = await Servico.findByPk(idServico, { transaction });

    if (!servico) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Serviço não encontrado"
      });
    }
    const produto = await Produto.findByPk(idProduto, { transaction });


    if (!produto) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Produto não encontrado"
      });
    }

    if (produto.quantidade < quantidadeUtilizada) {
      await transaction.rollback();

      return res.status(409).json({
        message: "Quantidade utilizada maior que o estoque disponível"
      });
    }

    const itemServico = await ItemServico.create(
      {
        id_servico: idServico,
        id_produto: idProduto,
        quantidade_utilizada: quantidadeUtilizada
      },
      { transaction }
    );

    produto.quantidade -= quantidadeUtilizada;

    await produto.save({ transaction });

    await transaction.commit();

    return res.status(201).json(itemServico);
  } catch (error) {
    await transaction.rollback();

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Erro de validação",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message: "Serviço ou produto informado não existe"
      });
    }

    return res.status(500).json({
      message: "Erro interno ao cadastrar item de serviço"
    });
  }
});

router.put("/:id", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const id = Number(req.params.id);

    const idValido = isIntegerGreaterThanZero(id);

    if (!idValido) {
      await transaction.rollback();

      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero"
      });
    }

    const itemServico = await ItemServico.findByPk(id, { transaction });

    if (!itemServico) {
      await transaction.rollback();
      return res.status(404).json({
        message: "Item de serviço não encontrado"
      });
    }

    const { id_servico, id_produto, quantidade_utilizada } = req.body;

    const idServico = id_servico !== undefined
      ? Number(id_servico)
      : itemServico.id_servico;

    const idProduto = id_produto !== undefined
      ? Number(id_produto)
      : itemServico.id_produto;

    const quantidadeUtilizada = quantidade_utilizada !== undefined
      ? Number(quantidade_utilizada)
      : itemServico.quantidade_utilizada;

    console.log(idProduto, idServico, quantidadeUtilizada);

    if (!isIntegerGreaterThanZero(idServico)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "id_servico deve ser um número inteiro maior que zero"
      });
    }

    if (!isIntegerGreaterThanZero(idProduto)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "id_produto deve ser um número inteiro maior que zero"
      });
    }

    if (!isIntegerGreaterThanZero(quantidadeUtilizada)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "quantidade_utilizada deve ser um número inteiro maior que zero"
      });
    }

    const servico = await Servico.findByPk(idServico, { transaction });

    if (!servico) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Serviço não encontrado"
      });
    }

    const produtoAntigo = await Produto.findByPk(itemServico.id_produto, {
      transaction
    });

    const produtoNovo = await Produto.findByPk(idProduto, {
      transaction
    });

    if (!produtoNovo) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Produto não encontrado"
      });
    }

    if (produtoAntigo) {
      produtoAntigo.quantidade = Number(produtoAntigo.quantidade) + Number(itemServico.quantidade_utilizada);
      await produtoAntigo.save({ transaction });
    }

    if (produtoNovo.quantidade < quantidadeUtilizada) {
      await transaction.rollback();

      return res.status(409).json({
        message: "Quantidade utilizada maior que o estoque disponível"
      });
    }

    produtoNovo.quantidade = Number(produtoNovo.quantidade) - Number(quantidadeUtilizada);

    await produtoNovo.save({ transaction });

    const itemServicoAtualizado = await ItemServico.update(
      {
        id_servico: idServico,
        id_produto: idProduto,
        quantidade_utilizada: quantidadeUtilizada
      },
      { transaction }
    );

    await transaction.commit();

    return res.json(itemServicoAtualizado);
  } catch (error) {
    await transaction.rollback();

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        message: "Erro de validação",
        errors: error.errors.map((err) => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message: "Serviço ou produto informado não existe"
      });
    }

    return res.status(500).json({
      message: "Erro interno ao atualizar item de serviço"
    });
  }
});

router.delete("/:id", async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const id = Number(req.params.id);

    const idValido = isIntegerGreaterThanZero(id);

    if (!idValido) {
      await transaction.rollback();

      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero"
      });
    }

    const itemServico = await ItemServico.findByPk(id, { transaction });

    if (!itemServico) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Item de serviço não encontrado"
      });
    }

    const produto = await Produto.findByPk(itemServico.id_produto, {
      transaction
    });

    if (produto) {
      produto.quantidade += itemServico.quantidade_utilizada;
      await produto.save({ transaction });
    }

    await itemServico.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      message: "Item de serviço deletado com sucesso"
    });
  } catch (error) {
    await transaction.rollback();

    return res.status(500).json({
      message: "Erro interno ao deletar item de serviço"
    });
  }
});

module.exports = router;