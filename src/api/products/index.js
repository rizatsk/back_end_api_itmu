const ProductsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'products',
  version: '1.0.0',
  register: async (server, {service, logActivityService, validator}) => {
    const productsHandler = new ProductsHandler(service, logActivityService, validator);
    server.route(routes(productsHandler));
  },
};
