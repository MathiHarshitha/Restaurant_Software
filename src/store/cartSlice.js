import { createSelector, createSlice } from '@reduxjs/toolkit';
import { calculateBill } from '../utils/billCalculator';

// The order currently being billed. Lives in Redux so it survives navigation
// (e.g. the cashier checks a report mid-order and comes back).
const initialState = {
  lines: [],
  paymentMethod: 'upi',
  discount: { type: 'amount', value: 0 },
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, { payload: item }) {
      const line = state.lines.find((l) => l.menuItemId === item.id);
      if (line) line.quantity += 1;
      else state.lines.push({ menuItemId: item.id, name: item.name, category: item.category, price: item.price, gstRate: item.gstRate, isVeg: item.isVeg, quantity: 1 });
    },
    incrementItem(state, { payload: menuItemId }) {
      const line = state.lines.find((l) => l.menuItemId === menuItemId);
      if (line) line.quantity += 1;
    },
    decrementItem(state, { payload: menuItemId }) {
      const line = state.lines.find((l) => l.menuItemId === menuItemId);
      if (!line) return;
      if (line.quantity > 1) line.quantity -= 1;
      else state.lines = state.lines.filter((l) => l.menuItemId !== menuItemId);
    },
    setQuantity(state, { payload: { menuItemId, quantity } }) {
      const q = Math.max(0, Math.min(999, Math.floor(Number(quantity) || 0)));
      if (q === 0) state.lines = state.lines.filter((l) => l.menuItemId !== menuItemId);
      else {
        const line = state.lines.find((l) => l.menuItemId === menuItemId);
        if (line) line.quantity = q;
      }
    },
    removeItem(state, { payload: menuItemId }) {
      state.lines = state.lines.filter((l) => l.menuItemId !== menuItemId);
    },
    setPaymentMethod(state, { payload }) {
      state.paymentMethod = payload;
    },
    setDiscount(state, { payload }) {
      state.discount = payload;
    },
    clearCart(state) {
      state.lines = [];
      state.discount = initialState.discount;
    },
    /** Keep open-order prices in step with menu edits. */
    syncPrices(state, { payload: menuItems }) {
      const byId = new Map(menuItems.map((m) => [m.id, m]));
      state.lines.forEach((l) => {
        const m = byId.get(l.menuItemId);
        if (m) { l.price = m.price; l.gstRate = m.gstRate; l.name = m.name; }
      });
    },
  },
});

export const selectCart = (s) => s.cart;
export const selectCartTotals = createSelector(
  [(s) => s.cart.lines, (s) => s.cart.discount],
  (lines, discount) => calculateBill(lines, discount),
);

export const { addItem, incrementItem, decrementItem, setQuantity, removeItem, setPaymentMethod, setDiscount, clearCart, syncPrices } = cartSlice.actions;
export default cartSlice.reducer;
