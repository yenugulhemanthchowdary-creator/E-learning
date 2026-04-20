import { apiRequest } from "./client";
import type { AuthResponse, User } from "../types";

interface BackendUser {
  id: number;
  full_name: string;
  email: string;
  avatar: string;
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

export async function register(fullName: string, email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<BackendAuthResponse>("/api/auth/register", {
    method: "POST",
    body: {
      full_name: fullName,
      email,
      password,
    },
  });

  return mapAuthResponse(response);
}

export async function me(token: string): Promise<AuthResponse["user"]> {
  const response = await apiRequest<BackendUser>("/api/auth/me", { token });
  return mapUser(response);
}
