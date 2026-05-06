const express = require("express");
const { Veiculo, Cliente, Servico } = require("../models");
const { isIntegerGreaterThanZero } = require("../utils/utils");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const veiculos = await Veiculo.findAll();

    return res.json(veiculos);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar veículos"
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

    const veiculo = await Veiculo.findByPk(id);

    if (!veiculo) {
      return res.status(404).json({
        message: "Veículo não encontrado"
      });
    }

    return res.json(veiculo);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar veículo"
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      placa,
      modelo,
      ano,
      cor,
      quilometragem,
      tipoVeiculo,
      motorizacao,
      numeroChasse,
      tipoCombustivel,
      dataUltimaRevisao,
      id_cliente
    } = req.body;

    const anoNumero = Number(ano);
    const idCliente = Number(id_cliente);

    if (!placa || !modelo || !ano || !cor || !id_cliente) {
      return res.status(400).json({
        message: "placa, modelo, ano, cor e id_cliente são obrigatórios"
      });
    }

    if (!isIntegerGreaterThanZero(anoNumero)) {
      return res.status(400).json({
        message: "ano deve ser um número inteiro maior que zero"
      });
    }

    if (!isIntegerGreaterThanZero(idCliente)) {
      return res.status(400).json({
        message: "id_cliente deve ser um número inteiro maior que zero"
      });
    }

    const cliente = await Cliente.findByPk(idCliente);

    if (!cliente) {
      return res.status(404).json({
        message: "Cliente não encontrado"
      });
    }

    const veiculo = await Veiculo.create({
      placa,
      modelo,
      ano: anoNumero,
      cor,
      quilometragem: quilometragem ?? 0,
      tipoVeiculo,
      motorizacao,
      numeroChasse,
      tipoCombustivel,
      dataUltimaRevisao,
      id_cliente: idCliente
    });

    return res.status(201).json(veiculo);
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

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message: "Cliente informado não existe"
      });
    }

    return res.status(500).json({
      message: "Erro interno ao cadastrar veículo"
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

    const veiculo = await Veiculo.findByPk(id);

    if (!veiculo) {
      return res.status(404).json({
        message: "Veículo não encontrado"
      });
    }

    const {
      placa,
      modelo,
      ano,
      cor,
      quilometragem,
      tipoVeiculo,
      motorizacao,
      numeroChasse,
      tipoCombustivel,
      dataUltimaRevisao,
      id_cliente
    } = req.body;

    let anoNumero = veiculo.ano;
    let idCliente = veiculo.id_cliente;

    if (ano !== undefined) {
      anoNumero = Number(ano);

      if (!isIntegerGreaterThanZero(anoNumero)) {
        return res.status(400).json({
          message: "ano deve ser um número inteiro maior que zero"
        });
      }
    }

    if (id_cliente !== undefined) {
      idCliente = Number(id_cliente);

      if (!isIntegerGreaterThanZero(idCliente)) {
        return res.status(400).json({
          message: "id_cliente deve ser um número inteiro maior que zero"
        });
      }

      const cliente = await Cliente.findByPk(idCliente);

      if (!cliente) {
        return res.status(404).json({
          message: "Cliente não encontrado"
        });
      }
    }

    const veiculoAtualizado = await veiculo.update({
      placa: placa ?? veiculo.placa,
      modelo: modelo ?? veiculo.modelo,
      ano: anoNumero,
      cor: cor ?? veiculo.cor,
      quilometragem: quilometragem ?? veiculo.quilometragem,
      tipoVeiculo: tipoVeiculo ?? veiculo.tipoVeiculo,
      motorizacao: motorizacao ?? veiculo.motorizacao,
      numeroChasse: numeroChasse ?? veiculo.numeroChasse,
      tipoCombustivel: tipoCombustivel ?? veiculo.tipoCombustivel,
      dataUltimaRevisao: dataUltimaRevisao ?? veiculo.dataUltimaRevisao,
      id_cliente: idCliente
    });

    return res.json(veiculoAtualizado);
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

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        message: "Cliente informado não existe"
      });
    }

    return res.status(500).json({
      message: "Erro interno ao atualizar veículo"
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

    const veiculo = await Veiculo.findByPk(id);

    if (!veiculo) {
      return res.status(404).json({
        message: "Veículo não encontrado"
      });
    }

    const possuiServicos = await Servico.findOne({
      where: {
        id_veiculo: id
      }
    });

    if (possuiServicos) {
      return res.status(409).json({
        message: "Veículo possui serviços vinculados"
      });
    }

    await veiculo.destroy();

    return res.status(200).json({
      message: "Veículo deletado com sucesso"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao deletar veículo"
    });
  }
});

module.exports = router;
