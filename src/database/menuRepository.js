import { db, withEntityMeta } from './db';
import { CATEGORIES } from '../data/categories';

const categoryRank = (c) => {
  const i = CATEGORIES.indexOf(c);
  return i === -1 ? CATEGORIES.length : i;
};

const sortMenu = (items) =>
  items.sort((a, b) => categoryRank(a.category) - categoryRank(b.category) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));

export const menuRepository = {
  /** All non-deleted items in menu order. */
  async getAll() {
    const items = await db.menuItems.filter((m) => !m.deletedAt).toArray();
    return sortMenu(items);
  },

  /** Includes soft-deleted items — used by reports to resolve historical items. */
  getAllIncludingDeleted() {
    return db.menuItems.toArray();
  },

  getById(id) {
    return db.menuItems.get(id);
  },

  async create(data) {
    const count = await db.menuItems.count();
    const item = withEntityMeta({ sortOrder: count + 1, deletedAt: null, syncStatus: 'pending', ...data });
    await db.menuItems.add(item);
    return item;
  },

  async update(id, changes) {
    const updatedAt = new Date().toISOString();
    await db.menuItems.update(id, { ...changes, updatedAt, syncStatus: 'pending' });
    return db.menuItems.get(id);
  },

  /** Soft delete keeps history intact and lets the deletion sync to the server later. */
  async softDelete(id) {
    const now = new Date().toISOString();
    await db.menuItems.update(id, { deletedAt: now, updatedAt: now, isAvailable: false, syncStatus: 'pending' });
  },

  bulkAdd(items) {
    return db.menuItems.bulkAdd(items);
  },

  clear() {
    return db.menuItems.clear();
  },
};
