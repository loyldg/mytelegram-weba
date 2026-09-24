/* eslint-disable simple-import-sort/imports -- Sanitize and claim URL login before other startup modules */
import { getPendingWebLogin } from './util/routing';
import { webLoginHandoffPromise } from './util/webLoginHandoff';
import './util/handleError';
import './util/setupServiceWorker';
import './global/init';

import TeactDOM from './lib/teact/teact-dom';
import {
  getActions, getGlobal,
} from './global';

import {
  DEBUG, STRICTERDOM_ENABLED,
} from './config';
import { enableStrict, requestMutation } from './lib/fasterdom/fasterdom';
import { selectChat, selectCurrentMessageList, selectPeerFullInfo, selectTabState } from './global/selectors';
import { selectSharedSettings } from './global/selectors/sharedState';
import { betterView } from './util/betterView';
import { IS_TAURI } from './util/browser/globalEnvironment';
import listenOtherClients from './util/browser/listenOtherClients';
import { requestGlobal, subscribeToMultitabBroadcastChannel } from './util/browser/multitab';
import { establishMultitabRole, subscribeToMasterChange } from './util/establishMultitabRole';
import { initGlobal } from './util/init';
import { initLocalization } from './util/localization';
import { Bundles, loadBundle } from './util/moduleLoader';
import { MULTITAB_STORAGE_KEY } from './util/multiaccount';
import { getDek, getDekGeneration } from './util/passcode';
import { initAutolock } from './util/passcode/autolock';
import { subscribeToPasscodeChannel } from './util/passcode/channel';
import { initPasscodeNavigation } from './util/passcode/navigation';
import { checkAndAssignPermanentWebVersion } from './util/permanentWebVersion';
import { onBeforeUnload } from './util/schedulers';
import initTauriApi from './util/tauri/initTauriApi';
import setupTauriListeners from './util/tauri/setupTauriListeners';
import updateWebmanifest from './util/updateWebmanifest';

import App from './components/App';

import './assets/fonts/roboto.css';
import './styles/index.scss';

if (STRICTERDOM_ENABLED) {
  enableStrict();
}

if (IS_TAURI) {
  initTauriApi();
  setupTauriListeners();
}

const initializationPromise = init();

async function init() {
  await webLoginHandoffPromise;
  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('>>> INIT');
  }

  if (!(window as any).isCompatTestPassed) return;

  checkAndAssignPermanentWebVersion();
  listenOtherClients();

  subscribeToMultitabBroadcastChannel();
  subscribeToPasscodeChannel(loadPasscodeActions);
  initPasscodeNavigation(getDek, getDekGeneration);
  await requestGlobal(APP_VERSION);
  localStorage.setItem(MULTITAB_STORAGE_KEY, '1');
  onBeforeUnload(() => {
    const global = getGlobal();
    if (Object.keys(global.byTabId).length === 1) {
      localStorage.removeItem(MULTITAB_STORAGE_KEY);
    }
  });

  await initGlobal();
  getActions().init();

  initAutolock();

  getActions().updateShouldEnableDebugLog();
  getActions().updateShouldDebugExportedSenders();

  const global = getGlobal();

  initLocalization(selectSharedSettings(global).language, true);

  subscribeToMasterChange((isMasterTab) => {
    getActions()
      .switchMultitabRole({ isMasterTab }, { forceSyncOnIOs: true });
  });
  const shouldReestablishMasterToSelf = Boolean(getPendingWebLogin())
    || getGlobal().auth.state !== 'authorizationStateReady';
  establishMultitabRole(shouldReestablishMasterToSelf);

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('>>> START INITIAL RENDER');
  }

  requestMutation(() => {
    updateWebmanifest();

    TeactDOM.render(
      <App />,
      document.getElementById('root')!,
    );

    betterView();
  });

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.log('>>> FINISH INITIAL RENDER');
  }

  if (DEBUG) {
    document.addEventListener('dblclick', () => {
      const currentGlobal = getGlobal();
      const currentMessageList = selectCurrentMessageList(currentGlobal);
      // eslint-disable-next-line no-console
      console.warn('TAB STATE', selectTabState(currentGlobal));
      // eslint-disable-next-line no-console
      console.warn('GLOBAL STATE', currentGlobal);
      if (currentMessageList) {
        // eslint-disable-next-line no-console
        console.warn(
          'CURRENT MESSAGE LIST',
          selectChat(currentGlobal, currentMessageList.chatId),
          selectPeerFullInfo(currentGlobal, currentMessageList.chatId),
          currentGlobal.messages.byChatId[currentMessageList.chatId],
        );
      }
    });
  }
}

async function loadPasscodeActions() {
  await Promise.all([loadBundle(Bundles.Main), initializationPromise]);
  return getActions();
}

onBeforeUnload(() => {
  const actions = getActions();
  actions.leaveGroupCall?.({ isPageUnload: true });
  actions.hangUp?.({ isPageUnload: true });
});
