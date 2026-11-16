export declare const APP_LANGUAGES: readonly ["en"];
export type AppLanguage = (typeof APP_LANGUAGES)[number];
export declare function isAppLanguage(value: unknown): value is AppLanguage;
