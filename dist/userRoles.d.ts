export declare const USER_ROLE_IDS: readonly ["sales", "recruiting", "consulting", "founder", "product_manager", "engineering", "marketing", "finance", "student", "other"];
export type UserRoleId = (typeof USER_ROLE_IDS)[number];
export declare const USER_ROLE_LABELS: Record<UserRoleId, string>;
export declare function isUserRoleId(value: unknown): value is UserRoleId;
export declare const USER_CONTEXT_MAX_CHARACTERS = 1500;
