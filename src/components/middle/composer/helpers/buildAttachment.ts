import type { ApiAttachment } from '../../../../api/types';

import {
  GIF_MIME_TYPE,
  SUPPORTED_AUDIO_CONTENT_TYPES,
  SUPPORTED_PHOTO_CONTENT_TYPES,
  SUPPORTED_VIDEO_CONTENT_TYPES,
} from '../../../../config';
import { parseAudioMetadata } from '../../../../util/audio';
import {
  createPosterForVideo,
  preloadImage,
  preloadVideo,
} from '../../../../util/files';
import { scaleImage } from '../../../../util/imageResize';

const MAX_STANDARD_QUALITY_IMG_SIZE = 1280; // px
const MAX_HIGH_QUALITY_IMG_SIZE = 2560;
const MAX_THUMB_IMG_SIZE = 40; // px
const MAX_ASPECT_RATIO = 20;
const FILE_EXT_REGEX = /\.[^/.]+$/;

export default async function buildAttachment(
  filename: string, blob: Blob, options?: Partial<ApiAttachment>,
): Promise<ApiAttachment> {
  const blobUrl = URL.createObjectURL(blob);
  const { type: mimeType, size } = blob;
  let quick;
  let audio;
  let previewBlobUrl;
  let shouldSendAsFile;
  const shouldSendInHighQuality = options?.shouldSendInHighQuality;

  if (SUPPORTED_PHOTO_CONTENT_TYPES.has(mimeType)) {
    const img = await preloadImage(blobUrl);
    const { width, height } = img;
    shouldSendAsFile = !validateAspectRatio(width, height);

    const maxQuickImgSize = shouldSendInHighQuality ? MAX_HIGH_QUALITY_IMG_SIZE : MAX_STANDARD_QUALITY_IMG_SIZE;
    const shouldShrink = Math.max(width, height) > maxQuickImgSize;
    const isGif = mimeType === GIF_MIME_TYPE;

    if (!shouldSendAsFile) {
      if (!options?.compressedBlobUrl && !isGif && (shouldShrink || mimeType !== 'image/jpeg')) {
        const resizedUrl = await scaleImage(
          blobUrl, shouldShrink ? maxQuickImgSize / Math.max(width, height) : 1, 'image/jpeg',
        );
        URL.revokeObjectURL(blobUrl);
        return buildAttachment(filename, blob, {
          ...options,
          compressedBlobUrl: resizedUrl,
        });
      }

      if (mimeType === 'image/jpeg') {
        filename = filename.replace(FILE_EXT_REGEX, '.jpg');
      }

      quick = { width, height };
    }

    const shouldShrinkPreview = Math.max(width, height) > MAX_THUMB_IMG_SIZE;
    if (shouldShrinkPreview) {
      previewBlobUrl = await scaleImage(
        blobUrl, MAX_THUMB_IMG_SIZE / Math.max(width, height), 'image/jpeg',
      );
    } else {
      previewBlobUrl = blobUrl;
    }
  } else if (SUPPORTED_VIDEO_CONTENT_TYPES.has(mimeType)) {
    try {
      const { videoWidth: width, videoHeight: height, duration } = await preloadVideo(blobUrl);
      shouldSendAsFile = !validateAspectRatio(width, height);
      if (!shouldSendAsFile) {
        quick = { width, height, duration };
      }
    } catch (err) {
      shouldSendAsFile = true;
    }

    previewBlobUrl = await createPosterForVideo(blobUrl);
  } else if (SUPPORTED_AUDIO_CONTENT_TYPES.has(mimeType)) {
    const {
      duration, title, performer, coverUrl,
    } = await parseAudioMetadata(blobUrl);
    audio = {
      duration: duration || 0,
      title,
      performer,
    };
    previewBlobUrl = coverUrl;
  }

  return {
    blob,
    blobUrl,
    filename,
    mimeType,
    size,
    quick,
    audio,
    previewBlobUrl,
    shouldSendAsFile: shouldSendAsFile || undefined,
    uniqueId: `${Date.now()}-${Math.random()}`,
    ...options,
  };
}

export function prepareAttachmentsToSend(
  attachments: ApiAttachment[], shouldSendCompressed?: boolean,
): ApiAttachment[] {
  return attachments.map((attach) => {
    if (shouldSendCompressed) {
      if (attach.compressedBlobUrl) {
        return {
          ...attach,
          blobUrl: attach.compressedBlobUrl,
        };
      }
      return attach;
    }

    return {
      ...attach,
      shouldSendAsFile: !(attach.voice || attach.audio) || undefined,
      shouldSendAsSpoiler: undefined,
    };
  });
}

function validateAspectRatio(width: number, height: number) {
  const maxAspectRatio = Math.max(width, height) / Math.min(width, height);
  return maxAspectRatio <= MAX_ASPECT_RATIO;
}
