import { settingsRepository } from '../database/settingsRepository';
import { seedDemoData } from '../database/seed';
import { RESTAURANT_SEED } from '../data/menuSeed';

export const settingsService = {
  async getRestaurant() {
    return (await settingsRepository.get('restaurant')) || { id: 'restaurant', ...RESTAURANT_SEED };
  },

  updateRestaurant(changes) {
    return settingsRepository.merge('restaurant', changes);
  },

  /** Wipes local data and rebuilds the demo restaurant. */
  resetDemoData(onProgress) {
    return seedDemoData(onProgress);
  },
};
