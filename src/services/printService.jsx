import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import Receipt from '../components/receipt/Receipt';

let root = null;

/**
 * Renders the receipt into a dedicated #print-root (hidden on screen) and opens
 * the browser print dialog. Print CSS hides the app so only the receipt prints.
 * A thermal printer integration can later replace this without touching the UI.
 */
export const printService = {
  printBill(bill, restaurant) {
    const container = document.getElementById('print-root');
    if (!container) return;
    root ??= createRoot(container);
    flushSync(() => root.render(<Receipt bill={bill} restaurant={restaurant} />));
    window.print();
  },
};
