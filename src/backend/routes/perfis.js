const express = require("express");
const { Perfil, Permissao, Usuario, PerfilPermissao } = require("../models");
const { isIntegerGreaterThanZero } = require("../utils/utils");

const router = express.Router();

const perfilInclude = [
  {
    model: Permissao,
    as: "permissoes",
    through: {
      attributes: [],
    },
  },
];

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

async function buscarPerfilCompleto(id) {
  return Perfil.findByPk(id, {
    include: perfilInclude,
  });
}

router.get("/", async (req, res) => {
  try {
    const perfis = await Perfil.findAll({
      include: perfilInclude,
      order: [["nome", "ASC"]],
    });

    return res.json(perfis);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar perfis",
    });
  }
});

router.get("/:id/permissoes", async (req, res) => {
  try {
    const id = lerIdParametro(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero",
      });
    }

    const perfil = await buscarPerfilCompleto(id);

    if (!perfil) {
      return res.status(404).json({
        message: "Perfil não encontrado",
      });
    }

    return res.json(perfil.permissoes);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar permissões do perfil",
    });
  }
});

router.put("/:id/permissoes", async (req, res) => {
  try {
    const id = lerIdParametro(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID deve ser um número inteiro maior que zero",
      });
    }

    const perfil = await Perfil.findByPk(id);

    if (!perfil) {
      return res.status(404).json({
        message: "Perfil não encontrado",
      });
    }

    const idsRecebidos = req.body.ids_permissoes ?? req.body.permissoes ?? [];

    if (!Array.isArray(idsRecebidos)) {
      return res.status(400).json({
        message: "ids_permissoes deve ser um array",
      });
    }

    const idsPermissoes = [...new Set(idsRecebidos.map(Number))];
    const idsInvalidos = idsPermissoes.some((idPermissao) => !isIntegerGreaterThanZero(idPermissao));

    if (idsInvalidos) {
      return res.status(400).json({
        message: "Todos os ids de permissão devem ser inteiros maiores que zero",
      });
    }

    const permissoes = idsPermissoes.length
      ? await Permissao.findAll({
          where: {
            id: idsPermissoes,
          },
        })
      : [];

    if (permissoes.length !== idsPermissoes.length) {
      return res.status(404).json({
        message: "Uma ou mais permissões não foram encontradas",
      });
    }

    await perfil.setPermissoes(permissoes);

    const perfilAtualizado = await buscarPerfilCompleto(id);

    return res.json(perfilAtualizado);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao atualizar permissões do perfil",
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

    const perfil = await buscarPerfilCompleto(id);

    if (!perfil) {
      return res.status(404).json({
        message: "Perfil não encontrado",
      });
    }

    return res.json(perfil);
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar perfil",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nome } = req.body;

    if (!nome) {
      return res.status(400).json({
        message: "nome é obrigatório",
      });
    }

    const perfil = await Perfil.create({
      nome,
    });

    return res.status(201).json(perfil);
  } catch (error) {
    return tratarErro(error, res, "Erro interno ao cadastrar perfil");
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

    const perfil = await Perfil.findByPk(id);

    if (!perfil) {
      return res.status(404).json({
        message: "Perfil não encontrado",
      });
    }

    const { nome } = req.body;

    if (nome !== undefined && !nome) {
      return res.status(400).json({
        message: "nome não pode ser vazio",
      });
    }

    const perfilAtualizado = await perfil.update({
      nome: nome ?? perfil.nome,
    });

    return res.json(perfilAtualizado);
  } catch (error) {
    return tratarErro(error, res, "Erro interno ao atualizar perfil");
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

    const perfil = await Perfil.findByPk(id);

    if (!perfil) {
      return res.status(404).json({
        message: "Perfil não encontrado",
      });
    }

    const usuariosVinculados = await Usuario.count({
      where: {
        idPerfil: id,
      },
    });

    if (usuariosVinculados > 0) {
      return res.status(409).json({
        message: "Perfil possui usuários vinculados",
      });
    }

    await PerfilPermissao.destroy({
      where: {
        idPerfil: id,
      },
    });

    await perfil.destroy();

    return res.status(200).json({
      message: "Perfil deletado com sucesso",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao deletar perfil",
    });
  }
});

module.exports = router;
