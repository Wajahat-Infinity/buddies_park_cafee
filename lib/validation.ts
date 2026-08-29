/**
 * Digits only, country code included, no plus sign and no leading zero.
 * Lives outside the actions file so the form and the Server Action can share
 * it: every export of a "use server" module must be an async action.
 */
export function isValidWhatsappNumber(value: string): boolean {
  return /^[1-9]\d{6,14}$/.test(value);
}
