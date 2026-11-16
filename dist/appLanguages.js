// The languages Sorinai exists in. One list for the app, which runs in one of
// them per launch, and the server, which keeps each person's for its emails and
// starter content. A language joins only once its texts exist on both sides.
export const APP_LANGUAGES = ["en"];
export function isAppLanguage(value) {
    return typeof value === "string" && APP_LANGUAGES.includes(value);
}
