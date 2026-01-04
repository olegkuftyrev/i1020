const API_URL = "http://localhost:3333/api/auth"

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  fullName?: string
}

export interface User {
  id: number
  email: string
  fullName: string | null
}

export interface AuthResponse {
  message: string
  user: User
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }

    return response.json()
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }

    return response.json()
  },

  me: async (): Promise<{ user: User }> => {
    const response = await fetch(`${API_URL}/me`, {
      credentials: "include",
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Unauthorized")
      }
      throw new Error("Failed to fetch user")
    }

    return response.json()
  },

  logout: async (): Promise<void> => {
    const response = await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    })

    if (!response.ok) {
      throw new Error("Logout failed")
    }
  },
}

