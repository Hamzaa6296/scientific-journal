// PURPOSE: Defines all user roles as a TypeScript enum.
// WHY ENUM? Instead of typing 'admin', 'editor' as raw strings throughout
// your code (risky — typos cause silent bugs), you reference Role.ADMIN.
// TypeScript will catch typos at compile time.

export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  REVIEWER = 'reviewer',
}
