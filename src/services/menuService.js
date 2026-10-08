import { z } from 'zod';
import { menuRepository } from '../database/menuRepository';
import { CATEGORIES, GST_RATES } from '../data/categories';

// Same schema the backend will validate with (Zod), kept in one place.
export const menuItemSchema = z.object({
  name: z.string().trim().min(2, 'Enter a food name').max(60, 'Keep the name under 60 characters'),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Choose a category' }) }),
  price: z.coerce.number({ invalid_type_error: 'Enter a price' }).positive('Price must be more than ₹0').max(100000),
  gstRate: z.coerce.number().refine((v) => GST_RATES.includes(v), 'Choose a GST rate'),
  isVeg: z.boolean(),
  isAvailable: z.boolean(),
});

async function assertUniqueName(name, exceptId) {
  const all = await menuRepository.getAll();
  const clash = all.find((m) => m.id !== exceptId && m.name.toLowerCase() === name.trim().toLowerCase());
  if (clash) throw new ValidationError({ name: 'An item with this name already exists' });
}

export class ValidationError extends Error {
  constructor(fieldErrors) {
    super('Please check the highlighted fields.');
    this.fieldErrors = fieldErrors;
  }
}

function parse(input) {
  const result = menuItemSchema.safeParse(input);
  if (!result.success) {
    const fieldErrors = {};
    result.error.issues.forEach((i) => { fieldErrors[i.path[0]] ??= i.message; });
    throw new ValidationError(fieldErrors);
  }
  return result.data;
}

export const menuService = {
  getMenuItems: () => menuRepository.getAll(),

  async getAvailableItems() {
    return (await menuRepository.getAll()).filter((m) => m.isAvailable);
  },

  async createMenuItem(input) {
    const data = parse(input);
    await assertUniqueName(data.name);
    return menuRepository.create(data);
  },

  async updateMenuItem(id, input) {
    const data = parse(input);
    await assertUniqueName(data.name, id);
    return menuRepository.update(id, data);
  },

  setAvailability: (id, isAvailable) => menuRepository.update(id, { isAvailable }),

  deleteMenuItem: (id) => menuRepository.softDelete(id),
};
