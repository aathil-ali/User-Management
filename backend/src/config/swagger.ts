import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User Management API',
      version: '1.0.0',
      description: 'Enterprise User Management System API',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:8000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint'
        },
      },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000'
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          name: {
            type: 'string',
            example: 'John Doe'
          },
          role: {
            type: 'string',
            enum: ['admin', 'user'],
            example: 'user'
          },
          isActive: {
            type: 'boolean',
            example: true
          },
          avatar: {
            type: 'string',
            nullable: true,
            example: 'https://example.com/avatar.jpg'
          },
          preferences: {
            type: 'object',
            properties: {
              theme: {
                type: 'string',
                enum: ['light', 'dark', 'auto'],
                example: 'light'
              },
              notifications: {
                type: 'boolean',
                example: true
              },
              language: {
                type: 'string',
                enum: ['en', 'es', 'fr'],
                example: 'en'
              },
              timezone: {
                type: 'string',
                example: 'UTC'
              }
            }
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        },
        required: ['id', 'email', 'name', 'role', 'isActive']
      },
      UserRegistration: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'newuser@example.com'
          },
          password: {
            type: 'string',
            minLength: 6,
            example: 'SecurePass123!'
          },
          name: {
            type: 'string',
            minLength: 1,
            example: 'John Doe'
          }
        }
      },
      UserLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          password: {
            type: 'string',
            example: 'MyPassword123!'
          }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Authentication successful'
          },
          data: {
            type: 'object',
            properties: {
              user: {
                $ref: '#/components/schemas/User'
              },
              tokens: {
                type: 'object',
                properties: {
                  accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  },
                  refreshToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  }
                }
              }
            }
          }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean'
          },
          message: {
            type: 'string'
          },
          data: {
            type: 'object',
            nullable: true
          }
        },
        required: ['success', 'message']
      },
      PaginatedUsers: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true
          },
          message: {
            type: 'string',
            example: 'Users retrieved successfully'
          },
          data: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/User'
                }
              },
              pagination: {
                type: 'object',
                properties: {
                  total: {
                    type: 'integer',
                    example: 150
                  },
                  pages: {
                    type: 'integer',
                    example: 8
                  },
                  page: {
                    type: 'integer',
                    example: 1
                  },
                  limit: {
                    type: 'integer',
                    example: 20
                  }
                }
              }
            }
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            example: 'Error message description'
          },
          error: {
            type: 'string',
            example: 'Detailed error information'
          },
          statusCode: {
            type: 'integer',
            example: 400
          }
        },
        required: ['success', 'message']
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Unauthorized - Invalid or missing token',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Unauthorized access',
              statusCode: 401
            }
          }
        }
      },
      ForbiddenError: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Forbidden access',
              statusCode: 403
            }
          }
        }
      },
      NotFoundError: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Resource not found',
              statusCode: 404
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              success: false,
              message: 'Validation failed',
              statusCode: 400
            }
          }
        }
      }
    }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJsdoc(options);
