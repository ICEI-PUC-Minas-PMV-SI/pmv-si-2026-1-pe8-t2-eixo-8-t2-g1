const store = {
  clientes: [],
  veiculos: [],
  servicos: [],
  itensServico: [],
  produtos: [],
  categorias:[],
  marcas: [],
  veicuulo_tipos: [],
  counters: {
    clientes: 1,
    veiculos: 1,
    servicos: 1,
    itensServico: 1,
    produtos: 1,
    categorias:1,
    marcas: 1,
    veicuulo_tipos: 1,
  },
};

function getNextId(collectionName) {
  const id = store.counters[collectionName];
  store.counters[collectionName] += 1;
  return id;
}

module.exports = {
  store,
  getNextId,
};
