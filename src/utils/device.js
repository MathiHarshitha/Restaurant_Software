import { v4 as uuid } from 'uuid';

const KEY = 'sl_device_id';

/** Stable per-browser device id, attached to every bill for multi-device sync later. */
export function getDeviceId() {
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = `dev_${uuid()}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return 'dev_unknown';
  }
}

export { uuid };
