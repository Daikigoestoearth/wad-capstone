const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const config = require('../config');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: config.appName,
      version: config.version,
      description: 'REST API untuk capstone project Web Advanced Development.',
    },
    servers: [{ url: `http://localhost:${config.port}/api/v1`, description: 'Local Dev' }],
  },
  apis: ['./src/routes/*.js'], // Mengambil dokumentasi dari JSDoc di file route
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`Docs: http://localhost:${config.port}/api/docs`);
};

module.exports = setupSwagger;