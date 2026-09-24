import { signalUnknownPasskey } from '../browser/passkeys';
import { bufferToBase64Url } from '../encoding/base64';
import { getTranslationFn } from '../localization';

const PRF_SALT_LENGTH = 32;
const CHALLENGE_LENGTH = 32;
const HKDF_INFO = 'tt-passcode-unlock';
const RP_NAME = 'Telegram Web';

let conditionalRequestAbortController: AbortController | undefined;

type PrfExtensionResults = {
  prf?: {
    enabled?: boolean;
    results?: {
      first?: ArrayBuffer;
    };
  };
};

export type UnlockPasskeyCreationResult = {
  credentialId: number[];
  prfSalt: number[];
  kek: ArrayBuffer;
};

export async function createUnlockPasskey(): Promise<UnlockPasskeyCreationResult | undefined> {
  const prfSalt = crypto.getRandomValues(new Uint8Array(PRF_SALT_LENGTH));
  const userName = getTranslationFn()('PasscodePasskeyName');

  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(CHALLENGE_LENGTH)),
      rp: { name: RP_NAME },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'required',
      },
      extensions: { prf: { eval: { first: prfSalt } } },
    },
  }) as PublicKeyCredential | undefined;

  if (!credential) return undefined;

  const credentialId = Array.from(new Uint8Array(credential.rawId));
  const extensionResults = credential.getClientExtensionResults() as PrfExtensionResults;
  if (!extensionResults.prf?.enabled && !extensionResults.prf?.results?.first) {
    signalUnknownUnlockPasskey(credentialId);
    return undefined;
  }

  try {
    // Some authenticators only return PRF output on `get`, not on `create`
    const prfOutput = extensionResults.prf?.results?.first || await evalPrf(credentialId, prfSalt);

    return {
      credentialId,
      prfSalt: Array.from(prfSalt),
      kek: await deriveKekFromPrf(prfOutput),
    };
  } catch (err) {
    signalUnknownUnlockPasskey(credentialId);
    throw err;
  }
}

export async function getPasskeyKek(credentialId: number[], prfSalt: number[], isConditional?: boolean) {
  const prfOutput = await evalPrf(credentialId, new Uint8Array(prfSalt), isConditional);
  return deriveKekFromPrf(prfOutput);
}

export function signalUnknownUnlockPasskey(credentialId: number[]) {
  signalUnknownPasskey(bufferToBase64Url(new Uint8Array(credentialId)));
}

export function cancelConditionalPasskeyRequest() {
  conditionalRequestAbortController?.abort();
  conditionalRequestAbortController = undefined;
}

async function evalPrf(credentialId: number[], salt: Uint8Array, isConditional?: boolean): Promise<ArrayBuffer> {
  if (isConditional) {
    if (!PublicKeyCredential.isConditionalMediationAvailable
      || !await PublicKeyCredential.isConditionalMediationAvailable()) {
      throw new Error('[passkeyUnlock] Conditional mediation is not supported');
    }
  } else {
    cancelConditionalPasskeyRequest();
  }

  const abortController = isConditional ? new AbortController() : undefined;
  if (abortController) {
    cancelConditionalPasskeyRequest();
    conditionalRequestAbortController = abortController;
  }

  let credential: PublicKeyCredential | undefined;
  try {
    credential = await navigator.credentials.get({
      mediation: isConditional ? 'conditional' : undefined,
      signal: abortController?.signal,
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(CHALLENGE_LENGTH)),
        allowCredentials: [{ type: 'public-key', id: new Uint8Array(credentialId) }],
        userVerification: 'required',
        extensions: { prf: { eval: { first: salt } } } as AuthenticationExtensionsClientInputs,
      },
    }) as PublicKeyCredential | undefined;
  } finally {
    if (conditionalRequestAbortController === abortController) {
      conditionalRequestAbortController = undefined;
    }
  }

  if (!credential) {
    throw new Error('[passkeyUnlock] Passkey evaluation cancelled');
  }

  const prfOutput = (credential.getClientExtensionResults() as PrfExtensionResults).prf?.results?.first;
  if (!prfOutput) {
    throw new Error('[passkeyUnlock] PRF extension is not supported by the authenticator');
  }

  return prfOutput;
}

async function deriveKekFromPrf(prfOutput: ArrayBuffer) {
  const hkdfKey = await crypto.subtle.importKey('raw', prfOutput, 'HKDF', false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: new TextEncoder().encode(HKDF_INFO),
    },
    hkdfKey,
    256,
  );
}
