import { ACCOUNT_QUERY } from '../config';

export function getAccountSlot(url: string) {
  const params = new URL(url).searchParams;
  const slot = Number(params.get(ACCOUNT_QUERY));
  return slot > 1 && Number.isInteger(slot) ? slot : undefined;
}
