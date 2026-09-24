import { getActions, getGlobal } from '../../global';

import { throttle } from '../schedulers';
import { loadPasscodeMeta } from './index';

const ACTIVITY_STORAGE_KEY = 'tt-last-activity';
const ACTIVITY_WRITE_THROTTLE_MS = 5000;
const CHECK_INTERVAL_MS = 10000;
const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'touchstart'];

const writeActivity = throttle(() => {
  localStorage.setItem(ACTIVITY_STORAGE_KEY, String(Date.now()));
}, ACTIVITY_WRITE_THROTTLE_MS, true);

export function initAutolock() {
  ACTIVITY_EVENTS.forEach((eventName) => {
    window.addEventListener(eventName, writeActivity, { passive: true, capture: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkAutolockAndWriteActivity();
  });

  checkAutolockAndWriteActivity();
  window.setInterval(checkAutolock, CHECK_INTERVAL_MS);
}

function checkAutolockAndWriteActivity() {
  void checkAutolock().catch(() => undefined).finally(() => writeActivity());
}

async function checkAutolock() {
  const global = getGlobal();
  if (
    !global.passcode.hasPasscode
    || global.passcode.isScreenLocked
    || !global.passcode.autolockDuration
  ) return;

  const meta = await loadPasscodeMeta();
  if (!meta || meta.isLocked || !meta.autolockDuration) return;

  const now = Date.now();
  const lastActivity = Math.min(Number(localStorage.getItem(ACTIVITY_STORAGE_KEY)) || now, now);
  if (now - lastActivity < meta.autolockDuration) return;

  getActions().lockScreen();
}
