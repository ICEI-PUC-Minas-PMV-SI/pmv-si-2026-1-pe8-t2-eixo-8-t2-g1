const { DataTypes } = require("sequelize");

async function ensureProdutoFields(sequelize) {
  const queryInterface = sequelize.getQueryInterface();
  const columns = await queryInterface.describeTable("produtos");
  const skuColumnWasMissing = !columns.codigo_sku;

  const addColumn = async (name, definition) => {
    if (!columns[name]) {
      await queryInterface.addColumn("produtos", name, definition);
      columns[name] = definition;
    }
  };

  await addColumn("descricao", {
    type: DataTypes.TEXT,
    allowNull: true,
  });

  await addColumn("codigo_sku", {
    type: DataTypes.STRING(50),
    allowNull: true,
  });

  await addColumn("id_marca", {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "marcas",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });

  await addColumn("id_categoria", {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "categorias",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });

  await addColumn("id_fornecedor", {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "clientes",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "RESTRICT",
  });

  await addColumn("tipo_item", {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: "Produto",
  });

  if (skuColumnWasMissing) {
    await sequelize.query(`
      UPDATE produtos
      SET codigo_sku = 'LEGACY-' || id
      WHERE codigo_sku IS NULL OR BTRIM(codigo_sku) = ''
    `);
  }

  await queryInterface.changeColumn("produtos", "codigo_sku", {
    type: DataTypes.STRING(50),
    allowNull: true,
  });

  const indexes = await queryInterface.showIndex("produtos");
  const hasSkuUniqueIndex = indexes.some(
    (index) =>
      index.unique &&
      index.fields.some((field) => field.attribute === "codigo_sku"),
  );

  if (!hasSkuUniqueIndex) {
    await queryInterface.addIndex("produtos", ["codigo_sku"], {
      name: "produtos_codigo_sku_unique",
      unique: true,
    });
  }
}

module.exports = ensureProdutoFields;
