// The user's self-declared role, set in Settings and stored on their profile.
// One source of truth: the settings picker renders these options and the backend
// validates the PATCH body against the same list.
//
// The SLUG is what gets stored and what reaches the model — labels are display
// only, so re-wording a label later never orphans a stored row. Deliberately a
// plain text column rather than a pgEnum: this list will churn as we learn who
// actually uses the product, and an enum would make every wording change a
// migration.
export const USER_ROLE_IDS = [
  "sales",
  "recruiting",
  "consulting",
  "founder",
  "product_manager",
  "engineering",
  "marketing",
  "finance",
  "student",
  "other"
] as const;

export type UserRoleId = (typeof USER_ROLE_IDS)[number];

export const USER_ROLE_LABELS: Record<UserRoleId, string> = {
  sales: "Sales",
  recruiting: "Recruiting",
  consulting: "Consulting",
  founder: "Founder / Executive",
  product_manager: "Product manager",
  engineering: "Engineering",
  marketing: "Marketing",
  finance: "Finance",
  student: "Student",
  other: "Other"
};

export function isUserRoleId(value: unknown): value is UserRoleId {
  return (
    typeof value === "string" &&
    (USER_ROLE_IDS as readonly string[]).includes(value)
  );
}

// Hard cap on the free-text "About you" paragraph. It rides the copilot's CACHED
// developer-prompt prefix on every request of a session, so it is a standing
// token cost per user, not a one-off — hence a real limit rather than a nominal
// one. Enforced on both sides: maxLength in the settings textarea, and a 400 from
// the profile PATCH (a client could always post directly).
export const USER_CONTEXT_MAX_CHARACTERS = 1500;
