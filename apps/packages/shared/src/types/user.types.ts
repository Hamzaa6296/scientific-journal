// Shared user-related types.
// Backend uses these in schemas/DTOs.
// Frontend uses these in Redux state and component props.

export enum Role {
  ADMIN = "admin",
  EDITOR = "editor",
  REVIEWER = "reviewer",
  AUTHOR = "author",
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  affiliation: string;
  bio: string;
  expertise: string[];
  isEmailVerified: boolean;
  createdAt: string;
}
