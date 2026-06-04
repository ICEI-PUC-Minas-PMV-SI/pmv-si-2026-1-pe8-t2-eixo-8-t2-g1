const express = require("express");
const { Permissao, PerfilPermissao } = require("../models");
const { isIntegerGreaterThanZero } = require("../utils/utils");

const router = express.Router();

function tratarErro(error, res, mensagemPadrao) {
  if (error.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: "Erro de validação",
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    });
  }

  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      message: "Registro duplicado",
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      })),
    });
  }

  return res.status(500).json({
    message: mensagemPadrao,
  });
}

function lerIdParametro(idParam) {
  const id = Number(idParam);
  return isIntegerGreaterThanZero(id) ? id : null;
}

router.get("/", async (req, res) => {
  try {
    const permissoes = await Permissao.findAll({
      order: [["chave", "ASC"]],
    });

    return res.json(permissoes);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar permissões",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = lerIdParametro(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero",
      });
    }

    const permissao = await Permissao.findByPk(id);

    if (!permissao) {
      return res.status(404).json({
        message: "Permissão não encontrada",
      });
    }

    return res.json(permissao);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar permissão",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { chave, descricao } = req.body;

    if (!chave) {
      return res.status(400).json({
        message: "chave é obrigatória",
      });
    }

    const permissao = await Permissao.create({
      chave,
      descricao: descricao ?? null,
    });

    return res.status(201).json(permissao);
  } catch (error) {
    return tratarErro(error, res, "Erro interno ao cadastrar permissão");
  }
});

router.put("/:id", async (req, res) => {
  try {
    const id = lerIdParametro(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero",
      });
    }

    const permissao = await Permissao.findByPk(id);

    if (!permissao) {
      return res.status(404).json({
        message: "Permissão não encontrada",
      });
    }

    const { chave, descricao } = req.body;

    if (chave !== undefined && !chave) {
      return res.status(400).json({
        message: "chave não pode ser vazia",
      });
    }

    const permissaoAtualizada = await permissao.update({
      chave: chave ?? permissao.chave,
      descricao: descricao ?? permissao.descricao,
    });

    return res.json(permissaoAtualizada);
  } catch (error) {
    return tratarErro(error, res, "Erro interno ao atualizar permissão");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = lerIdParametro(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero",
      });
    }

    const permissao = await Permissao.findByPk(id);

    if (!permissao) {
      return res.status(404).json({
        message: "Permissão não encontrada",
      });
    }

    const perfisVinculados = await PerfilPermissao.count({
      where: {
        idPermissao: id,
      },
    });

    if (perfisVinculados > 0) {
      return res.status(409).json({
        message: "Permissão possui perfis vinculados",
      });
    }

    await permissao.destroy();

    return res.status(200).json({
      message: "Permissão deletada com sucesso",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao deletar permissão",
    });
  }
});

module.exports = router;
