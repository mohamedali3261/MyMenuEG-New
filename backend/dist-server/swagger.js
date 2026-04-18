export const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'MyMenuEG API',
        version: '1.0.0',
        description: 'E-commerce API for MyMenuEG store',
        contact: {
            name: 'API Support',
            email: 'support@mymenueg.com'
        }
    },
    servers: [
        {
            url: 'http://localhost:5000',
            description: 'Development server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            Product: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name_ar: { type: 'string' },
                    name_en: { type: 'string' },
                    description_ar: { type: 'string' },
                    description_en: { type: 'string' },
                    price: { type: 'number' },
                    old_price: { type: 'number' },
                    stock: { type: 'integer' },
                    status: { type: 'string', enum: ['active', 'draft', 'archived'] },
                    image_url: { type: 'string' },
                    category_id: { type: 'string' },
                    is_best_seller: { type: 'boolean' }
                }
            },
            Category: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    name_ar: { type: 'string' },
                    name_en: { type: 'string' },
                    status: { type: 'string', enum: ['active', 'draft'] }
                }
            },
            Order: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    customer_name: { type: 'string' },
                    phone: { type: 'string' },
                    governorate: { type: 'string' },
                    city: { type: 'string' },
                    address: { type: 'string' },
                    total_price: { type: 'number' },
                    status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] }
                }
            },
            Coupon: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    code: { type: 'string' },
                    type: { type: 'string', enum: ['percentage', 'fixed'] },
                    value: { type: 'number' },
                    min_order: { type: 'number' },
                    usage_limit: { type: 'integer' },
                    status: { type: 'string', enum: ['active', 'inactive'] }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    error: { type: 'string' }
                }
            }
        }
    },
    paths: {
        '/api/v1/health': {
            get: {
                summary: 'Health check',
                tags: ['System'],
                responses: {
                    '200': {
                        description: 'Service is healthy',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: { type: 'string' },
                                        database: { type: 'string' },
                                        timestamp: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/auth/login': {
            post: {
                summary: 'Admin login',
                tags: ['Auth'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['username', 'password'],
                                properties: {
                                    username: { type: 'string' },
                                    password: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Login successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        token: { type: 'string' },
                                        admin: { $ref: '#/components/schemas/Category' }
                                    }
                                }
                            }
                        }
                    },
                    '401': {
                        description: 'Invalid credentials',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/products': {
            get: {
                summary: 'Get all products',
                tags: ['Products'],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer' }, description: 'Page number' },
                    { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Items per page' },
                    { name: 'category_id', in: 'query', schema: { type: 'string' }, description: 'Filter by category' },
                    { name: 'q', in: 'query', schema: { type: 'string' }, description: 'Search query' }
                ],
                responses: {
                    '200': {
                        description: 'List of products',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        products: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/Product' }
                                        },
                                        total: { type: 'integer' },
                                        pages: { type: 'integer' },
                                        currentPage: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Create or update product',
                tags: ['Products'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Product' }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Product saved successfully'
                    },
                    '401': {
                        description: 'Unauthorized'
                    }
                }
            }
        },
        '/api/v1/products/{id}': {
            get: {
                summary: 'Get product by ID',
                tags: ['Products'],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': {
                        description: 'Product details',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Product' }
                            }
                        }
                    },
                    '404': {
                        description: 'Product not found'
                    }
                }
            },
            delete: {
                summary: 'Delete product',
                tags: ['Products'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': {
                        description: 'Product deleted successfully'
                    },
                    '401': {
                        description: 'Unauthorized'
                    }
                }
            }
        },
        '/api/v1/categories': {
            get: {
                summary: 'Get all categories',
                tags: ['Categories'],
                responses: {
                    '200': {
                        description: 'List of categories',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Category' }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/v1/orders': {
            get: {
                summary: 'Get all orders',
                tags: ['Orders'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'page', in: 'query', schema: { type: 'integer' } },
                    { name: 'limit', in: 'query', schema: { type: 'integer' } },
                    { name: 'status', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    '200': {
                        description: 'List of orders',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/Order' }
                                }
                            }
                        }
                    }
                }
            },
            post: {
                summary: 'Create new order',
                tags: ['Orders'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['customer', 'items', 'total_price'],
                                properties: {
                                    customer: {
                                        type: 'object',
                                        properties: {
                                            name: { type: 'string' },
                                            phone: { type: 'string' },
                                            governorate: { type: 'string' },
                                            city: { type: 'string' },
                                            address: { type: 'string' },
                                            notes: { type: 'string' }
                                        }
                                    },
                                    items: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                id: { type: 'string' },
                                                name: { type: 'string' },
                                                price: { type: 'number' },
                                                quantity: { type: 'integer' }
                                            }
                                        }
                                    },
                                    total_price: { type: 'number' },
                                    coupon_id: { type: 'string' },
                                    discount_amount: { type: 'number' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Order created successfully'
                    }
                }
            }
        },
        '/api/v1/coupons/validate': {
            post: {
                summary: 'Validate coupon code',
                tags: ['Coupons'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['code', 'total'],
                                properties: {
                                    code: { type: 'string' },
                                    total: { type: 'number' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Coupon is valid',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Coupon' }
                            }
                        }
                    },
                    '404': {
                        description: 'Invalid coupon'
                    }
                }
            }
        },
        '/api/v1/contact': {
            post: {
                summary: 'Submit contact form',
                tags: ['Contact'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'message'],
                                properties: {
                                    name: { type: 'string' },
                                    email: { type: 'string' },
                                    phone: { type: 'string' },
                                    subject: { type: 'string' },
                                    message: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Message sent successfully'
                    },
                    '400': {
                        description: 'Validation failed'
                    }
                }
            },
            get: {
                summary: 'Get all contact messages (Admin)',
                tags: ['Contact'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'List of contact messages'
                    }
                }
            }
        },
        '/api/v1/reviews': {
            get: {
                summary: 'Get all reviews (Admin)',
                tags: ['Reviews'],
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'approved', 'rejected'] } }
                ],
                responses: {
                    '200': {
                        description: 'List of reviews'
                    }
                }
            },
            post: {
                summary: 'Submit a product review',
                tags: ['Reviews'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['product_id', 'user_name', 'rating'],
                                properties: {
                                    product_id: { type: 'string' },
                                    user_name: { type: 'string' },
                                    rating: { type: 'integer', minimum: 1, maximum: 5 },
                                    comment_ar: { type: 'string' },
                                    comment_en: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Review submitted (pending approval)'
                    }
                }
            }
        },
        '/api/v1/reviews/product': {
            get: {
                summary: 'Get reviews for a product',
                tags: ['Reviews'],
                parameters: [
                    { name: 'product_id', in: 'query', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    '200': {
                        description: 'Product reviews with average rating'
                    }
                }
            }
        }
    }
};
