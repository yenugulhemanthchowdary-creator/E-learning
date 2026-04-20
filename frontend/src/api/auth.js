import { apiRequest } from "./client";
function mapUser(user) {
    return {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        avatar: user.avatar,
    };
}
function mapAuthResponse(response) {
    return {
        token: response.access_token,
        user: mapUser(response.user),
    };
}
export async function login(email, password) {
    const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
    });
    return mapAuthResponse(response);
}
export async function register(fullName, email, password) {
    const response = await apiRequest("/api/auth/register", {
        method: "POST",
        body: {
            full_name: fullName,
            email,
            password,
        },
    });
    return mapAuthResponse(response);
}
export async function me(token) {
    const response = await apiRequest("/api/auth/me", { token });
    return mapUser(response);
}
