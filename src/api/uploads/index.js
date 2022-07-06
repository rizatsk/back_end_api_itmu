const UploadsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'uploads',
  version: '1.0.0',
  register: async (server, {service, packageServiceService, productsService, logActivityService, storageImage, validator}) => {
    const uploadsHandler = new UploadsHandler({service, packageServiceService, productsService, logActivityService, validator});
    server.route(routes(uploadsHandler, storageImage));
  },
};
