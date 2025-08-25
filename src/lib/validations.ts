import { z } from 'zod';

// Validações básicas reutilizáveis
const emailSchema = z.string().email('Email inválido').min(1, 'Email é obrigatório');
const passwordSchema = z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número');
const slugSchema = z.string().regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens');
const uuidSchema = z.string().uuid('ID inválido');

// Validações para usuário
export const userValidations = {
  // Registro de usuário
  register: z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
    acceptTerms: z.boolean().refine(val => val === true, 'Você deve aceitar os termos de uso')
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmPassword']
  }),

  // Login
  login: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Senha é obrigatória'),
    rememberMe: z.boolean().optional()
  }),

  // Atualização de perfil
  updateProfile: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo').optional(),
    bio: z.string().max(500, 'Bio muito longa').optional(),
    avatar_url: z.string().url('URL do avatar inválida').optional(),
    preferences: z.object({
      dietary_restrictions: z.array(z.string()).optional(),
      favorite_cuisines: z.array(z.string()).optional(),
      skill_level: z.enum(['beginner', 'intermediate', 'advanced']).optional()
    }).optional()
  }),

  // Mudança de senha
  changePassword: z.object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: passwordSchema,
    confirmNewPassword: z.string()
  }).refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'Senhas não coincidem',
    path: ['confirmNewPassword']
  })
};

// Validações para receitas
export const recipeValidations = {
  // Criação de receita
  create: z.object({
    title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(200, 'Título muito longo'),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000, 'Descrição muito longa'),
    ingredients: z.array(z.object({
      name: z.string().min(1, 'Nome do ingrediente é obrigatório'),
      quantity: z.string().min(1, 'Quantidade é obrigatória'),
      unit: z.string().optional()
    })).min(1, 'Pelo menos um ingrediente é obrigatório'),
    instructions: z.array(z.object({
      step: z.number().positive('Número do passo deve ser positivo'),
      description: z.string().min(5, 'Descrição do passo deve ter pelo menos 5 caracteres')
    })).min(1, 'Pelo menos uma instrução é obrigatória'),
    prep_time: z.number().positive('Tempo de preparo deve ser positivo').max(1440, 'Tempo de preparo muito longo'),
    cook_time: z.number().positive('Tempo de cozimento deve ser positivo').max(1440, 'Tempo de cozimento muito longo').optional(),
    servings: z.number().positive('Número de porções deve ser positivo').max(50, 'Muitas porções'),
    difficulty: z.enum(['easy', 'medium', 'hard'], { message: 'Dificuldade inválida' }),
    category_id: uuidSchema,
    tags: z.array(z.string()).optional(),
    image_url: z.string().url('URL da imagem inválida').optional(),
    nutrition_info: z.object({
      calories: z.number().positive().optional(),
      protein: z.number().positive().optional(),
      carbs: z.number().positive().optional(),
      fat: z.number().positive().optional(),
      fiber: z.number().positive().optional()
    }).optional()
  }),

  // Atualização de receita
  update: z.object({
    title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(200, 'Título muito longo').optional(),
    description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(1000, 'Descrição muito longa').optional(),
    ingredients: z.array(z.object({
      name: z.string().min(1, 'Nome do ingrediente é obrigatório'),
      quantity: z.string().min(1, 'Quantidade é obrigatória'),
      unit: z.string().optional()
    })).optional(),
    instructions: z.array(z.object({
      step: z.number().positive('Número do passo deve ser positivo'),
      description: z.string().min(5, 'Descrição do passo deve ter pelo menos 5 caracteres')
    })).optional(),
    prep_time: z.number().positive('Tempo de preparo deve ser positivo').max(1440, 'Tempo de preparo muito longo').optional(),
    cook_time: z.number().positive('Tempo de cozimento deve ser positivo').max(1440, 'Tempo de cozimento muito longo').optional(),
    servings: z.number().positive('Número de porções deve ser positivo').max(50, 'Muitas porções').optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    category_id: uuidSchema.optional(),
    tags: z.array(z.string()).optional(),
    image_url: z.string().url('URL da imagem inválida').optional(),
    nutrition_info: z.object({
      calories: z.number().positive().optional(),
      protein: z.number().positive().optional(),
      carbs: z.number().positive().optional(),
      fat: z.number().positive().optional(),
      fiber: z.number().positive().optional()
    }).optional()
  }),

  // Busca de receitas
  search: z.object({
    query: z.string().optional(),
    category: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    max_prep_time: z.number().positive().max(1440).optional(),
    ingredients: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    page: z.number().positive().default(1),
    limit: z.number().positive().max(100).default(20),
    sort_by: z.enum(['created_at', 'title', 'prep_time', 'rating', 'views']).default('created_at'),
    sort_order: z.enum(['asc', 'desc']).default('desc')
  })
};

// Validações para categorias
export const categoryValidations = {
  create: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
    slug: slugSchema,
    description: z.string().max(500, 'Descrição muito longa').optional(),
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal').optional()
  }),

  update: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo').optional(),
    slug: slugSchema.optional(),
    description: z.string().max(500, 'Descrição muito longa').optional(),
    icon: z.string().optional(),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal').optional()
  })
};

// Validações para comentários
export const commentValidations = {
  create: z.object({
    content: z.string().min(3, 'Comentário deve ter pelo menos 3 caracteres').max(1000, 'Comentário muito longo'),
    recipe_id: uuidSchema,
    parent_id: uuidSchema.optional() // Para respostas
  }),

  update: z.object({
    content: z.string().min(3, 'Comentário deve ter pelo menos 3 caracteres').max(1000, 'Comentário muito longo')
  })
};

// Validações para avaliações
export const ratingValidations = {
  create: z.object({
    recipe_id: uuidSchema,
    rating: z.number().min(1, 'Avaliação mínima é 1').max(5, 'Avaliação máxima é 5'),
    comment: z.string().max(500, 'Comentário muito longo').optional()
  }),

  update: z.object({
    rating: z.number().min(1, 'Avaliação mínima é 1').max(5, 'Avaliação máxima é 5'),
    comment: z.string().max(500, 'Comentário muito longo').optional()
  })
};

// Validações para upload de arquivos
export const uploadValidations = {
  image: z.object({
    file: z.instanceof(File, { message: 'Arquivo é obrigatório' })
      .refine(file => file.size <= 5 * 1024 * 1024, 'Arquivo deve ter no máximo 5MB')
      .refine(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type), 'Formato de arquivo inválido'),
    alt: z.string().max(200, 'Texto alternativo muito longo').optional()
  })
};

// Validações para parâmetros de URL
export const paramValidations = {
  id: uuidSchema,
  slug: slugSchema,
  page: z.string().regex(/^\d+$/, 'Página deve ser um número').transform(Number).refine(n => n > 0, 'Página deve ser positiva'),
  limit: z.string().regex(/^\d+$/, 'Limite deve ser um número').transform(Number).refine(n => n > 0 && n <= 100, 'Limite deve estar entre 1 e 100')
};

// Função utilitária para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

// Middleware para validação em API routes
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = validateData(schema, data);
    
    if (!result.success) {
      const errors = result.errors.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return {
        isValid: false,
        errors,
        data: null
      };
    }
    
    return {
      isValid: true,
      errors: [],
      data: result.data
    };
  };
}

// Validação para sanitização de HTML
export const sanitizeHtml = (html: string): string => {
  // Remove scripts e tags perigosas
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Validação para prevenção de XSS
export const xssValidation = z.string().transform(sanitizeHtml);

// Validação para prevenção de SQL Injection (para queries dinâmicas)
export const sqlSafeString = z.string().refine(
  (str) => !/[';"\\]/.test(str),
  'Caracteres especiais não são permitidos'
);

// Adicionados para APIs de push/push-subscription
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Endpoint inválido'),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1)
  })
});

export const pushPayloadSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  icon: z.string().url().optional(),
  badge: z.string().url().optional(),
  tag: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
  actions: z.array(z.object({
    action: z.string().min(1),
    title: z.string().min(1),
    icon: z.string().url().optional()
  })).optional()
});