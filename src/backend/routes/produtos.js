const express = require("express");
const { Op } = require("sequelize");
const {
  Categoria,
  Cliente,
  ItemServico,
  Marca,
  Produto,
} = require("../models");
const { isIntegerGreaterThanZero } = require("../utils/utils");

const router = express.Router();

const produtoIncludes = [
  {
    model: Marca,
    as: "marca",
    attributes: ["id", "titulo"],
  },
  {
    model: Categoria,
    as: "categoria",
    attributes: ["id", "titulo"],
  },
  {
    model: Cliente,
    as: "fornecedor",
    attributes: ["id", "nomeCompleto", "email", "telefone"],
  },
];

function toProdutoResponse(produto) {
  const produtoJson = produto.toJSON();

  return {
    ...produtoJson,
    preco: Number(produtoJson.preco),
    estoqueAtual: Number(produtoJson.estoqueAtual),
  };
}

function isValidMoney(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number < 100000000;
}

function isValidStock(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 && number < 100000000;
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeOptionalId(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "" || Number(value) === 0) {
    return null;
  }

  const id = Number(value);
  return isIntegerGreaterThanZero(id) ? id : Number.NaN;
}

async function validateReferences({ idCategoria, idFornecedor, idMarca }) {
  const [categoria, fornecedor, marca] = await Promise.all([
    idCategoria ? Categoria.findByPk(idCategoria) : null,
    idFornecedor
      ? Cliente.findOne({
          where: {
            id: idFornecedor,
            isFornecedor: true,
          },
        })
      : null,
    idMarca ? Marca.findByPk(idMarca) : null,
  ]);

  if (idCategoria && !categoria) {
    return "Categoria nao encontrada";
  }

  if (idMarca && !marca) {
    return "Marca nao encontrada";
  }

  if (idFornecedor && !fornecedor) {
    return "Fornecedor nao encontrado";
  }

  return null;
}

async function findProdutoById(id) {
  return Produto.findByPk(id, {
    include: produtoIncludes,
  });
}

router.get("/", async (req, res) => {
  try {
    const produtos = await Produto.findAll({
      include: produtoIncludes,
      order: [["id", "DESC"]],
    });

    return res.json(produtos.map(toProdutoResponse));
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar produtos",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isIntegerGreaterThanZero(id)) {
      return res.status(400).json({
        message: "ID deve ser um numero inteiro maior que zero",
      });
    }

    const produto = await findProdutoById(id);

    if (!produto) {
      return res.status(404).json({
        message: "Produto nao encontrado",
      });
    }

    return res.json(toProdutoResponse(produto));
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao buscar produto",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      codigoSku,
      descricao,
      estoqueAtual,
      idCategoria,
      idFornecedor,
      idMarca,
      preco,
      tipoItem,
      titulo,
    } = req.body;

    if (
      !isNonEmptyString(titulo) ||
      !isNonEmptyString(codigoSku) ||
      preco === undefined ||
      preco === null ||
      preco === "" ||
      preco <= 0 ||
      !isNonEmptyString(tipoItem)
    ) {
      return res.status(400).json({
        message: "O Título, Código SKU, Tipo e Preço são obrigatórios",
      });
    }

    const references = {
      idCategoria: normalizeOptionalId(idCategoria) ?? null,
      idFornecedor: normalizeOptionalId(idFornecedor) ?? null,
      idMarca: normalizeOptionalId(idMarca) ?? null,
    };

    if (Object.values(references).some(Number.isNaN)) {
      return res.status(400).json({
        message: "As referencias informadas devem possuir IDs validos",
      });
    }

    if (!isValidMoney(preco)) {
      return res.status(400).json({
        message: "preco deve conter um valor valido",
      });
    }

    if (estoqueAtual !== undefined && !isValidStock(estoqueAtual)) {
      return res.status(400).json({
        message: "estoqueAtual deve conter um valor valido",
      });
    }

    const referenceError = await validateReferences(references);

    if (referenceError) {
      return res.status(400).json({
        message: referenceError,
      });
    }

    const codigoSkuNormalizado = codigoSku.trim();
    const tipoItemNormalizado = tipoItem.trim();
    const skuExistente = await Produto.findOne({
          where: {
            codigoSku: codigoSkuNormalizado,
          },
        });

    if (skuExistente) {
      return res.status(409).json({
        message: "codigoSku ja cadastrado",
      });
    }

    const produto = await Produto.create({
      ...references,
      titulo: titulo.trim(),
      descricao: isNonEmptyString(descricao) ? descricao.trim() : null,
      codigoSku: codigoSkuNormalizado,
      tipoItem: tipoItemNormalizado,
      preco: Number(preco),
      estoqueAtual: estoqueAtual === undefined ? 0 : Number(estoqueAtual),
    });
    const produtoCriado = await findProdutoById(produto.id);

    return res.status(201).json(toProdutoResponse(produtoCriado));
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "codigoSku ja cadastrado",
      });
    }

    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      return res.status(400).json({
        message: "Dados invalidos para o produto",
      });
    }

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
        message: "ID deve ser um numero inteiro maior que zero",
      });
    }

    const produto = await Produto.findByPk(id);

    if (!produto) {
      return res.status(404).json({
        message: "Produto nao encontrado",
      });
    }

    if (Object.keys(req.body).length === 0) {
      const produtoAtual = await findProdutoById(id);
      return res.json(toProdutoResponse(produtoAtual));
    }

    const values = {};
    const referenceFields = ["idCategoria", "idFornecedor", "idMarca"];

    for (const field of referenceFields) {
      if (req.body[field] !== undefined) {
        const value = normalizeOptionalId(req.body[field]);

        if (Number.isNaN(value)) {
          return res.status(400).json({
            message: `${field} deve conter um ID valido`,
          });
        }

        values[field] = value;
      }
    }

    const referenceError = await validateReferences(values);

    if (referenceError) {
      return res.status(400).json({
        message: referenceError,
      });
    }

    if (req.body.titulo !== undefined) {
      values.titulo =
        req.body.titulo === null ? "" : String(req.body.titulo).trim();
    }

    if (req.body.codigoSku !== undefined) {
      const codigoSku = isNonEmptyString(req.body.codigoSku)
        ? req.body.codigoSku.trim()
        : null;
      const skuExistente = codigoSku
        ? await Produto.findOne({
            where: {
              codigoSku,
              id: {
                [Op.ne]: id,
              },
            },
          })
        : null;

      if (skuExistente) {
        return res.status(409).json({
          message: "codigoSku ja cadastrado",
        });
      }

      values.codigoSku = codigoSku;
    }

    if (req.body.tipoItem !== undefined) {
      values.tipoItem = isNonEmptyString(req.body.tipoItem)
        ? req.body.tipoItem.trim()
        : produto.tipoItem;
    }

    if (req.body.preco !== undefined) {
      if (!isValidMoney(req.body.preco)) {
        return res.status(400).json({
          message: "preco deve conter um valor valido",
        });
      }

      values.preco = Number(req.body.preco);
    }

    if (req.body.estoqueAtual !== undefined) {
      if (!isValidStock(req.body.estoqueAtual)) {
        return res.status(400).json({
          message: "estoqueAtual deve conter um valor valido",
        });
      }

      values.estoqueAtual = Number(req.body.estoqueAtual);
    }

    if (req.body.descricao !== undefined) {
      values.descricao = isNonEmptyString(req.body.descricao)
        ? req.body.descricao.trim()
        : null;
    }

    await produto.update(values);
    const produtoAtualizado = await findProdutoById(id);

    return res.json(toProdutoResponse(produtoAtualizado));
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message: "codigoSku ja cadastrado",
      });
    }

    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeForeignKeyConstraintError"
    ) {
      return res.status(400).json({
        message: "Dados invalidos para o produto",
      });
    }

    return res.status(500).json({
      message: "Erro interno ao atualizar produto",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!isIntegerGreaterThanZero(id)) {
      return res.status(400).json({
        message: "ID deve ser um numero inteiro maior que zero",
      });
    }

    const produto = await Produto.findByPk(id);

    if (!produto) {
      return res.status(404).json({
        message: "Produto nao encontrado",
      });
    }

    const possuiItens = await ItemServico.findOne({
      where: {
        idProduto: id,
      },
    });

    if (possuiItens) {
      return res.status(409).json({
        message: "Produto possui itens de servico vinculados",
      });
    }

    await produto.destroy();

    return res.status(200).json({
      message: "Produto deletado com sucesso",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro interno ao deletar produto",
    });
  }
});

module.exports = router;
