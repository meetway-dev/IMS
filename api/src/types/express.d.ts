declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      roles: string[];
      permissions: string[];
    }
  }
}

export type AuthUser = Express.User;
