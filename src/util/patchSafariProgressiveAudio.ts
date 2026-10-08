/*
 * Thanks to Ace Monkey for this mind-blowing patch.
 */

export function patchSafariProgressiveAudio(audioEl: HTMLAudioElement) {
  if (audioEl.dataset.patchedForSafari) {
    return;
  }
  audioEl.dataset.patchedForSafari = 'true';

  let danceAbortController: AbortController | undefined;

  audioEl.addEventListener('emptied', () => {
    danceAbortController?.abort();
    danceAbortController = undefined;
    delete audioEl.dataset.patchAppliedForSafari;
    delete audioEl.dataset.patchForSafariInProgress;
  });

  audioEl.addEventListener('play', () => {
    if (audioEl.dataset.patchAppliedForSafari) {
      return;
    }
    audioEl.dataset.patchAppliedForSafari = 'true';

    danceAbortController = new AbortController();
    const { signal } = danceAbortController;
    const t = audioEl.currentTime;

    audioEl.dataset.patchForSafariInProgress = 'true';
    function onProgress() {
      if (!audioEl.buffered.length) {
        return;
      }
      audioEl.currentTime = audioEl.duration - 1;
      audioEl.addEventListener('progress', () => {
        delete audioEl.dataset.patchForSafariInProgress;
        audioEl.currentTime = t;
        if (audioEl.paused && !audioEl.dataset.preventPlayAfterPatch) {
          audioEl.play();
        }
      }, { once: true, signal });

      audioEl.removeEventListener('progress', onProgress);
    }

    audioEl.addEventListener('progress', onProgress, { signal });
  });
}

export function isSafariPatchInProgress(audioEl: HTMLAudioElement) {
  return Boolean(audioEl.dataset.patchForSafariInProgress);
}
