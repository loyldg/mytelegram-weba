import { useMemo } from '../lib/teact/teact';

import type { ApiAudio, ApiChat, ApiMessage, ApiPeer } from '../api/types';

import { getAudioHasCover, getMediaHash } from '../global/helpers';
import { buildMediaMetadata } from '../util/mediaSession';
import useMedia from './useMedia';
import useMessageMediaMetadata from './useMessageMediaMetadata';

import telegramLogoPath from '../assets/telegram-logo-filled.svg';

type OwnArgs = {
  audio?: ApiAudio;
  message?: ApiMessage;
  sender?: ApiPeer;
  chat?: ApiChat;
};

export default function useTrackMediaMetadata({
  audio, message, sender, chat,
}: OwnArgs): MediaMetadata | undefined {
  const messageMetadata = useMessageMediaMetadata(message, sender, chat);

  const shouldUseTrackMetadata = !message || (Boolean(audio) && !message.content.audio && !message.content.voice);

  const coverHash = audio && getAudioHasCover(audio) ? getMediaHash(audio, 'pictogram') : undefined;
  const coverUrl = useMedia(shouldUseTrackMetadata ? coverHash : undefined);
  const artworkUrl = coverUrl || telegramLogoPath;

  const trackMetadata = useMemo(() => {
    if (!audio) return undefined;

    return buildMediaMetadata({
      title: audio.title || audio.fileName,
      artist: audio.performer,
      artwork: [{ src: artworkUrl }],
    });
  }, [audio, artworkUrl]);

  return shouldUseTrackMetadata ? trackMetadata : messageMetadata;
}
