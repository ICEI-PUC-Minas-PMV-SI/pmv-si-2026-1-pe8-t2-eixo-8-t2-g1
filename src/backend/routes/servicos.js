const express = require("express");
const { Servico, Veiculo, ItemServico } = require("../models");
const { isIntegerGreaterThanZero } = require("../utils/utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const servicos = await Servico.findAll({
      include: [
        {
          model: Veiculo,
          as: "veiculo"
        }
      ]
    });

    return res.json(servicos);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar serviços"
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

    const servico = await Servico.findByPk(id, {
      include: [
        {
          model: Veiculo,
          as: "veiculo"
        },
        {
          model: ItemServico,
          as: "itens"
        }
      ]
    });

    if (!servico) {
      return res.status(404).json({
        message: "Serviço não encontrado"
      });
    }

    return res.json(servico);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar serviço"
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      descricao,
      status,
      data_inicio,
      data_fim,
      valor_total,
      id_veiculo
    } = req.body;

    const idVeiculo = Number(id_veiculo);
    const valorTotal = Number(valor_total);

    if (!descricao || !status || !data_inicio || valor_total === undefined || !id_veiculo) {
      return res.status(400).json({
        message: "descricao, status, data_inicio, valor_total e id_veiculo são obrigatórios"
      });
    }

    if (!isIntegerGreaterThanZero(idVeiculo)) {
      return res.status(400).json({
        message: "id_veiculo deve ser um número inteiro maior que zero"
      });
    }

    if (Number.isNaN(valorTotal) || valorTotal < 0) {
      return res.status(400).json({
        message: "valor_total deve ser um número maior ou igual a zero"
      });
    }

    const veiculo = await Veiculo.findByPk(idVeiculo);

    if (!veiculo) {
      return res.status(404).json({
        message: "Veículo não encontrado"
      });
    }

    const servico = await Servico.create({
      descricao,
      status,
      data_inicio,
      data_fim: data_fim ?? null,
      valor_total: valorTotal,
      id_veiculo: idVeiculo
    });

    return res.status(201).json(servico);
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

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message: "Veículo informado não existe"
      });
    }

    return res.status(500).json({
      message: "Erro interno ao cadastrar serviço"
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

    const servico = await Servico.findByPk(id);

    if (!servico) {
      return res.status(404).json({
        message: "Serviço não encontrado"
      });
    }

    const {
      descricao,
      status,
      data_inicio,
      data_fim,
      valor_total,
      id_veiculo
    } = req.body;

    let idVeiculo = servico.id_veiculo;
    let valorTotal = servico.valor_total;

    if (id_veiculo !== undefined) {
      idVeiculo = Number(id_veiculo);

      if (!isIntegerGreaterThanZero(idVeiculo)) {
        return res.status(400).json({
          message: "id_veiculo deve ser um número inteiro maior que zero"
        });
      }

      const veiculo = await Veiculo.findByPk(idVeiculo);

      if (!veiculo) {
        return res.status(404).json({
          message: "Veículo não encontrado"
        });
      }
    }

    if (valor_total !== undefined) {
      valorTotal = Number(valor_total);

      if (Number.isNaN(valorTotal) || valorTotal < 0) {
        return res.status(400).json({
          message: "valor_total deve ser um número maior ou igual a zero"
        });
      }
    }

    const servicoAtualizado = await servico.update({
      descricao: descricao ?? servico.descricao,
      status: status ?? servico.status,
      data_inicio: data_inicio ?? servico.data_inicio,
      data_fim: data_fim ?? servico.data_fim,
      valor_total: valorTotal,
      id_veiculo: idVeiculo
    });

    return res.json(servicoAtualizado);
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

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message: "Veículo informado não existe"
      });
    }

    return res.status(500).json({
      message: "Erro interno ao atualizar serviço"
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

    const servico = await Servico.findByPk(id);

    if (!servico) {
      return res.status(404).json({
        message: "Serviço não encontrado"
      });
    }

    const possuiItens = await ItemServico.findOne({
      where: {
        id_servico: id
      }
    });

    if (possuiItens) {
      return res.status(409).json({
        message: "Serviço possui itens vinculados"
      });
    }

    await servico.destroy();

    return res.status(200).json({
      message: "Serviço deletado com sucesso"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao deletar serviço"
    });
  }
});

module.exports = router;