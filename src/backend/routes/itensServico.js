const express = require("express");
const { sequelize, ItemServico, Servico, Produto } = require("../models");
const { isIntegerGreaterThanZero } = require("../utils/utils");

const router = express.Router();

async function recalcularValorServico(idServico, transaction) {
  const itens = await ItemServico.findAll({
    where: {
      idServico: idServico
    },
    include: [
      {
        model: Produto,
        as: "produto"
      }
    ],
    transaction
  });

  const valorTotal = itens.reduce((total, item) => {
    const quantidade = Number(item.quantidadeUtilizada);
    const preco = Number(item.produto?.preco || 0);

    return total + quantidade * preco;
  }, 0);

  await Servico.update(
    {
      valorTotal: valorTotal
    },
    {
      where: {
        id: idServico
      },
      transaction
    }
  );

  return valorTotal;
}

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
    const {
      idServico: idServicoPayload,
      idProduto: idProdutoPayload,
      quantidadeUtilizada: quantidadeUtilizadaPayload,
    } = req.body;

    const idServico = Number(idServicoPayload);
    const idProduto = Number(idProdutoPayload);
    const quantidadeUtilizada = Number(quantidadeUtilizadaPayload);

    if (!isIntegerGreaterThanZero(idServico)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "idServico deve ser um número inteiro maior que zero"
      });
    }

    if (!isIntegerGreaterThanZero(idProduto)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "idProduto deve ser um número inteiro maior que zero"
      });
    }

    if (!isIntegerGreaterThanZero(quantidadeUtilizada)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "quantidadeUtilizada deve ser um número inteiro maior que zero"
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

    if (Number(produto.estoqueAtual) < quantidadeUtilizada) {
      await transaction.rollback();

      return res.status(409).json({
        message: "Quantidade utilizada maior que o estoque disponível"
      });
    }

    const itemServico = await ItemServico.create(
      {
        idServico: idServico,
        idProduto: idProduto,
        quantidadeUtilizada: quantidadeUtilizada
      },
      { transaction }
    );

    produto.estoqueAtual =
      Number(produto.estoqueAtual) - quantidadeUtilizada;

    await produto.save({ transaction });
    await recalcularValorServico(idServico, transaction);

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

    const {
      idServico: idServicoPayload,
      idProduto: idProdutoPayload,
      quantidadeUtilizada: quantidadeUtilizadaPayload,
    } = req.body;
    const idServicoAntigo = itemServico.idServico;

    const idServico = idServicoPayload !== undefined
      ? Number(idServicoPayload)
      : itemServico.idServico;

    const idProduto = idProdutoPayload !== undefined
      ? Number(idProdutoPayload)
      : itemServico.idProduto;

    const quantidadeUtilizada = quantidadeUtilizadaPayload !== undefined
      ? Number(quantidadeUtilizadaPayload)
      : Number(itemServico.quantidadeUtilizada);

    if (!isIntegerGreaterThanZero(idServico)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "idServico deve ser um número inteiro maior que zero"
      });
    }

    if (!isIntegerGreaterThanZero(idProduto)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "idProduto deve ser um número inteiro maior que zero"
      });
    }

    if (!isIntegerGreaterThanZero(quantidadeUtilizada)) {
      await transaction.rollback();

      return res.status(400).json({
        message: "quantidadeUtilizada deve ser um número inteiro maior que zero"
      });
    }

    const servico = await Servico.findByPk(idServico, { transaction });

    if (!servico) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Serviço não encontrado"
      });
    }

    const produtoAntigo = await Produto.findByPk(itemServico.idProduto, {
      transaction
    });

    if (produtoAntigo) {
      produtoAntigo.estoqueAtual =
        Number(produtoAntigo.estoqueAtual) +
        Number(itemServico.quantidadeUtilizada);
      await produtoAntigo.save({ transaction });
    }

    const produtoNovo = await Produto.findByPk(idProduto, {
      transaction
    });

    if (!produtoNovo) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Produto não encontrado"
      });
    }

    if (Number(produtoNovo.estoqueAtual) < quantidadeUtilizada) {
      await transaction.rollback();

      return res.status(409).json({
        message: "Quantidade utilizada maior que o estoque disponível"
      });
    }

    produtoNovo.estoqueAtual =
      Number(produtoNovo.estoqueAtual) - Number(quantidadeUtilizada);

    await produtoNovo.save({ transaction });

    const itemServicoAtualizado = await itemServico.update(
      {
        idServico: idServico,
        idProduto: idProduto,
        quantidadeUtilizada: quantidadeUtilizada
      },
      { transaction }
    );

    await recalcularValorServico(idServico, transaction);

    if (idServicoAntigo !== idServico) {
      await recalcularValorServico(idServicoAntigo, transaction);
    }

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

    const produto = await Produto.findByPk(itemServico.idProduto, {
      transaction
    });

    if (produto) {
      produto.estoqueAtual =
        Number(produto.estoqueAtual) +
        Number(itemServico.quantidadeUtilizada);
      await produto.save({ transaction });
    }

    const idServico = itemServico.idServico;

    await itemServico.destroy({ transaction });
    await recalcularValorServico(idServico, transaction);

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
