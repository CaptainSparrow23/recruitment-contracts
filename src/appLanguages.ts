// The languages Sorinai exists in. One list for the app, which runs in one of
// them per launch, and the server, which keeps each person's for its emails and
// starter content. A language joins only once its texts exist on both sides.
export const APP_LANGUAGES = ["en"] as const;

export type AppLanguage = (typeof APP_LANGUAGES)[number];

export function isAppLanguage(value: unknown): value is AppLanguage {
  return typeof value === "string" && (APP_LANGUAGES as readonly string[]).includes(value);
}
