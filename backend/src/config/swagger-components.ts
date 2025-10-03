export const swaggerComponents = {
  schemas: {
    // DTOs
    RegisterDto: {
      type: 'object',
      required: ['email', 'password', 'name'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
        },
        password: {
          type: 'string',
          minLength: 8,
          example: 'Password123!',
        },
        name: {
          type: 'string',
          example: 'John Doe',
        },
      },
    },
    LoginDto: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          type: 'string',
          format: 'email',
          example: 'user@example.com',
        },
        password: {
          type: 'string',
          example: 'Password123!',
        },
      },
    },
    LogoutDto: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
      },
    },
    UpdateProfileDto: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          example: 'John Doe',
        },
        bio: {
          type: 'string',
          example: 'Software developer',
        },
        phone: {
          type: 'string',
          example: '123-456-7890',
        },
        photo: {
          type: 'string',
          format: 'uri',
          example: 'https://example.com/profile.jpg',
        },
      },
    },

    // Models
    User: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        email: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        role: {
          type: 'string',
        },
      },
    },
    AuthResponse: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
        },
        refreshToken: {
          type: 'string',
        },
        user: {
          $ref: '#/components/schemas/User',
        },
      },
    },

    // Generic Responses
    SuccessResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        message: {
          type: 'string',
        },
        data: {
          type: 'object',
          nullable: true,
        },
      },
    },
    ErrorResponse: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: false,
        },
        error: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
            details: {
              type: 'object',
              nullable: true,
            },
          },
        },
      },
    },
  },
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
};