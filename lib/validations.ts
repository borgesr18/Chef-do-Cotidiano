import { z } from 'zod';

// Schema para validação de receitas
export const recipeSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres').max(100, 'Título muito longo'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres').max(500, 'Descrição muito longa'),
  ingredients: z.array(z.string().min(1, 'Ingrediente não pode estar vazio')).min(1, 'Pelo menos um ingrediente é obrigatório'),
  instructions: z.array(z.string().min(1, 'Instrução não pode estar vazia')).min(1, 'Pelo menos uma instrução é obrigatória'),
  prep_time: z.number().min(1, 'Tempo de preparo deve ser positivo').max(1440, 'Tempo de preparo muito longo'),
  cook_time: z.number().min(0, 'Tempo de cozimento não pode ser negativo').max(1440, 'Tempo de cozimento muito longo'),
  servings: z.number().min(1, 'Porções deve ser pelo menos 1').max(50, 'Muitas porções'),
  difficulty: z.enum(['facil', 'medio', 'dificil'], { message: 'Dificuldade deve ser fácil, médio ou difícil' }),
  category_id: z.string().uuid('ID da categoria inválido'),
  image_url: z.string().url('URL da imagem inválida').optional(),
  tags: z.array(z.string()).optional(),
  nutrition: z.object({
    calories: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    carbs: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
    fiber: z.number().min(0).optional(),
  }).optional(),
});

// Schema para atualização de receitas (campos opcionais)
export const updateRecipeSchema = recipeSchema.partial();

// Schema para validação de categorias
export const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50, 'Nome muito longo'),
  description: z.string().max(200, 'Descrição muito longa').optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal').optional(),
});

// Schema para validação de usuários
export const userProfileSchema = z.object({
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  bio: z.string().max(500, 'Bio muito longa').optional(),
  avatar_url: z.string().url('URL do avatar inválida').optional(),
  dietary_preferences: z.array(z.string()).optional(),
  cooking_level: z.enum(['iniciante', 'intermediario', 'avancado']).optional(),
});

// Schema para validação de comentários
export const commentSchema = z.object({
  content: z.string().min(1, 'Comentário não pode estar vazio').max(1000, 'Comentário muito longo'),
  rating: z.number().min(1, 'Avaliação mínima é 1').max(5, 'Avaliação máxima é 5').optional(),
  recipe_id: z.string().uuid('ID da receita inválido'),
});

// Schema para validação de interações
export const interactionSchema = z.object({
  recipe_id: z.string().uuid('ID da receita inválido'),
  action: z.enum(['view', 'like', 'favorite', 'share', 'download'], { message: 'Ação inválida' }),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Schema para validação de push subscriptions
export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Endpoint inválido'),
  keys: z.object({
    p256dh: z.string().min(1, 'Chave p256dh é obrigatória'),
    auth: z.string().min(1, 'Chave auth é obrigatória'),
  }),
});

// Schema para validação de payload de push notification
export const pushPayloadSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Título muito longo'),
  body: z.string().min(1, 'Corpo é obrigatório').max(300, 'Corpo muito longo'),
  icon: z.string().url('URL do ícone inválida').optional(),
  badge: z.string().url('URL do badge inválida').optional(),
  tag: z.string().optional(),
  data: z.record(z.string(), z.any()).optional(),
  actions: z.array(z.object({
    action: z.string().min(1, 'Ação é obrigatória'),
    title: z.string().min(1, 'Título da ação é obrigatório'),
    icon: z.string().url('URL do ícone inválida').optional(),
  })).optional(),
});

// Schema para validação de busca
export const searchSchema = z.object({
  query: z.string().min(1, 'Termo de busca é obrigatório').max(100, 'Termo de busca muito longo'),
  category: z.string().uuid('ID da categoria inválido').optional(),
  difficulty: z.enum(['facil', 'medio', 'dificil']).optional(),
  max_prep_time: z.number().min(1).max(1440).optional(),
  max_cook_time: z.number().min(1).max(1440).optional(),
  tags: z.array(z.string()).optional(),
  sort_by: z.enum(['relevance', 'date', 'rating', 'prep_time', 'popularity']).default('relevance'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

// Schema para validação de parâmetros de paginação
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sort_by: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
});

// Schema para validação de upload de arquivos
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'Arquivo é obrigatório' }),
  type: z.enum(['image', 'document'], { message: 'Tipo de arquivo inválido' }),
  max_size: z.number().default(5 * 1024 * 1024), // 5MB default
});

// Schema para validação de email
export const emailSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Schema para validação de senha
export const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
});

// Schema para validação de login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema para validação de registro
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
});

// Função utilitária para validar dados
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
}

// Função para validar dados de forma assíncrona
export async function validateDataAsync<T>(schema: z.ZodSchema<T>, data: unknown): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const validatedData = await schema.parseAsync(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
}

// Middleware para validação em APIs Next.js
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown) => {
    const result = validateData(schema, data);
    if (!result.success) {
      throw new Error(`Dados inválidos: ${result.errors.join(', ')}`);
    }
    return result.data;
  };
}