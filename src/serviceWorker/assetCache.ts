import { ASSET_CACHE_NAME } from '../config';
import { pause } from '../util/schedulers';

declare const self: ServiceWorkerGlobalScope;

// An attempt to fix freezing UI on iOS
const TIMEOUT = 3000;
const CACHE_UPDATE_TIMEOUT = 30000;

export async function respondWithCacheNetworkFirst(e: FetchEvent) {
  const abortController = new AbortController();
  const cachePromise = self.caches.open(ASSET_CACHE_NAME);
  const remotePromise = fetchAsset(e.request, abortController.signal);

  e.waitUntil(cacheAssetResponse(e.request, cachePromise, remotePromise, abortController));

  const remote = await resolveWithTimeout(remotePromise, TIMEOUT);
  if (remote?.response.ok) {
    return remote.response;
  }

  const cached = await resolveCachedResponse(e.request, cachePromise);
  if (cached) {
    abortController.abort();
    return cached;
  }

  return remote ? remote.response : (await remotePromise).response;
}

export function respondWithCache(e: FetchEvent) {
  const abortController = new AbortController();
  const cachePromise = self.caches.open(ASSET_CACHE_NAME);
  const responsePromise = resolveCacheFirst(e.request, cachePromise, abortController.signal);

  e.waitUntil(cacheAssetResponse(e.request, cachePromise, responsePromise, abortController));

  return responsePromise.then(({ response }) => response);
}

export function clearAssetCache() {
  return self.caches.delete(ASSET_CACHE_NAME);
}

interface AssetResponse {
  response: Response;
  responseToCache?: Response;
}

async function resolveCacheFirst(
  request: Request,
  cachePromise: Promise<Cache>,
  abortSignal: AbortSignal,
): Promise<AssetResponse> {
  const cached = await resolveCachedResponse(request, cachePromise);
  if (cached) return { response: cached };

  return fetchAsset(request, abortSignal);
}

async function resolveCachedResponse(request: Request, cachePromise: Promise<Cache>) {
  const cached = await resolveWithTimeout(
    cachePromise.then((cache) => cache.match(request)),
    TIMEOUT,
  );

  if (!cached) return undefined;
  if (cached.ok) return cached;

  const cache = await cachePromise;
  await cache.delete(request);
  return undefined;
}

async function fetchAsset(request: Request, abortSignal: AbortSignal): Promise<AssetResponse> {
  const response = await fetch(request, { signal: abortSignal });

  return {
    response,
    responseToCache: response.ok ? response.clone() : undefined,
  };
}

async function cacheAssetResponse(
  request: Request,
  cachePromise: Promise<Cache>,
  responsePromise: Promise<AssetResponse>,
  abortController: AbortController,
) {
  const isCompleted = await Promise.race([
    updateAssetCache(request, cachePromise, responsePromise).then(
      () => true,
      () => true,
    ),
    pause(CACHE_UPDATE_TIMEOUT).then(() => false),
  ]);

  if (!isCompleted) abortController.abort();
}

async function updateAssetCache(
  request: Request,
  cachePromise: Promise<Cache>,
  responsePromise: Promise<AssetResponse>,
) {
  const { responseToCache } = await responsePromise;
  if (!responseToCache) return;

  const cache = await cachePromise;
  await cache.put(request, responseToCache);
}

async function resolveWithTimeout<T>(promise: Promise<T>, timeout: number) {
  let isResolved = false;

  try {
    return await Promise.race([
      pause(timeout).then(() => (isResolved ? undefined : Promise.reject(new Error('TIMEOUT')))),
      promise,
    ]);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return undefined;
  } finally {
    isResolved = true;
  }
}
