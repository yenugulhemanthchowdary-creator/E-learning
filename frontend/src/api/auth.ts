import { apiRequest } from "./client";
import type { AuthResponse, User } from "../types";

interface BackendUser {
  id: number;
  full_name: string;
  email: string;
  avatar: string;
  phone?: string | null;
  bio?: string | null;
  learning_goals?: string[];
}

interface BackendAuthResponse {
  access_token: string;
  token_type: string;
  user: BackendUser;
}

function mapUser(user: BackendUser): User {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    avatar: user.avatar,
    phone: user.phone ?? null,
    bio: user.bio ?? null,
    learningGoals: user.learning_goals ?? [],
  };
}

function mapAuthResponse(response: BackendAuthResponse): AuthResponse {
  return {
    token: response.access_token,
    user: mapUser(response.user),
  };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<BackendAuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });

  return mapAuthResponse(response);
}

export async function register(
  fullName: string,
  email: string,
  password: string,
  extras?: { phone?: string; bio?: string; learningGoals?: string[] },
): Promise<AuthResponse> {
  const response = await apiRequest<BackendAuthResponse>("/api/auth/register", {
    method: "POST",
    body: {
      full_name: fullName,
      email,
      password,
      phone: extras?.phone || null,
      bio: extras?.bio || null,
      learning_goals: extras?.learningGoals ?? [],
    },
  });

  return mapAuthResponse(response);
}

export async function me(token: string): Promise<AuthResponse["user"]> {
  const response = await apiRequest<BackendUser>("/api/auth/me", { token });
  return mapUser(response);
}
