// File: src/docs/swagger.js
const swaggerJsdoc = require('swagger-jsdoc'); // [cite: 676]
const swaggerUi = require('swagger-ui-express'); // [cite: 677]
const config = require('../config'); // [cite: 678]

const options = {
  definition: {
    openapi: '3.0.3', // [cite: 681, 684]
    info: { // [cite: 689]
      title: config.appName, // [cite: 690]
      version: config.version, // [cite: 691]
      description: 'REST API untuk capstone project Web Advanced Development.' // [cite: 693]
    },
    servers: [
      { 
        url: `http://localhost:${config.port}/api/v1`, // [cite: 694]
        description: 'Local Dev' // [cite: 695]
      }
    ],
    components: { // [cite: 696]
      schemas: { // [cite: 697]
        CreateTask: { // [cite: 698]
          type: 'object', // [cite: 699]
          required: ['title'], // [cite: 700]
          properties: { // [cite: 701]
            title: { 
              type: 'string', 
              minLength: 1, 
              maxLength: 200, 
              example: 'Belajar Joi Validation' // [cite: 703]
            },
            description: { 
              type: 'string', 
              maxLength: 1000, 
              example: 'Mempelajari cara validasi input dengan Joi' // [cite: 704]
            },
            status: { 
              type: 'string', 
              enum: ['todo', 'in_progress', 'done'], // [cite: 712]
              default: 'todo' 
            },
            priority: { 
              type: 'string', 
              enum: ['low', 'medium', 'high'], // [cite: 715]
              default: 'medium' // [cite: 706]
            },
            dueDate: { 
              type: 'string', 
              format: 'date-time', 
              example: '2024-12-31T00:00:00Z' // [cite: 716]
            }
          }
        },
        Task: { // [cite: 710]
          allOf: [ // [cite: 711]
            { '$ref': '#/components/schemas/CreateTask' }, // [cite: 717]
            {
              type: 'object', // [cite: 719]
              properties: { // [cite: 719]
                id: { type: 'integer', example: 1 }, // [cite: 720, 722]
                createdAt: { type: 'string', format: 'date-time' }, // [cite: 723, 724]
                updatedAt: { type: 'string', format: 'date-time' } // [cite: 725, 726]
              }
            }
          ]
        },
        ErrorResponse: { // [cite: 729]
          type: 'object', // [cite: 729]
          properties: { // [cite: 730]
            error: { // [cite: 731]
              type: 'object', // [cite: 732]
              properties: { // [cite: 732]
                code: { type: 'string', example: 'VALIDATION_ERROR' }, // [cite: 733, 735]
                message: { type: 'string', example: 'Data yang dikirim tidak valid.' }, // [cite: 734, 735, 741]
                details: { // [cite: 736]
                  type: 'array', // [cite: 736]
                  items: { // [cite: 736]
                    type: 'object', // [cite: 737]
                    properties: { // [cite: 738]
                      field: { type: 'string' }, // [cite: 740]
                      message: { type: 'string' } // [cite: 740]
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Tasks', description: 'Operasi CRUD untuk resource Task' } // [cite: 745]
    ]
  },
  apis: ['./src/routes/*.js'] // [cite: 746]
};

const swaggerSpec = swaggerJsdoc(options); // [cite: 751, 753]

const setupSwagger = (app) => { // [cite: 757]
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { // [cite: 759]
    customSiteTitle: `${config.appName} API Docs` // [cite: 760]
  }));
  
  app.get('/api/docs.json', (req, res) => { // [cite: 762]
    res.setHeader('Content-Type', 'application/json'); // [cite: 763]
    res.send(swaggerSpec); // [cite: 763]
  });

  console.log(`Docs        : http://localhost:${config.port}/api/docs`); // [cite: 765]
};

module.exports = setupSwagger; // [cite: 766]