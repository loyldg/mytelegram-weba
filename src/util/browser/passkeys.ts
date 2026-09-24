import type { ApiPasskeyOption, ApiPasskeyRegistrationOption } from '../../api/types';

import { IS_WEBAUTHN_SIGNAL_API_SUPPORTED } from './windowEnvironment';

export function toCredentialCreationOptions(option: ApiPasskeyRegistrationOption): CredentialCreationOptions {
  const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(option.publicKey);

  return {
    publicKey,
  };
}

export function toCredentialRequestOptions(option: ApiPasskeyOption): CredentialRequestOptions {
  const publicKey = PublicKeyCredential.parseRequestOptionsFromJSON(option.publicKey);

  return {
    publicKey,
  };
}

export function signalUnknownPasskey(credentialId: string) {
  if (!IS_WEBAUTHN_SIGNAL_API_SUPPORTED) return;

  void PublicKeyCredential.signalUnknownCredential({
    rpId: window.location.hostname,
    credentialId,
  }).catch(() => undefined);
}
