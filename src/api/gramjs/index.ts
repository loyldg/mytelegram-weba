// export { initApi, callApi, cancelApiProgress } from './methods/init';
export {
  initApi, closeApi, reconnectApi, callApi, cancelApiProgress, cancelApiProgressMaster, callApiLocal,
  handleMethodCallback,
  handleMethodResponse,
  updateFullLocalDb,
  updateLocalDb,
  setShouldEnableDebugLog,
} from './worker/connector';
