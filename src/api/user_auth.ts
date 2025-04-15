import { OnboardingState } from '../types';

interface LoginResponse {
  message?: string;
  user_id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
  error?: string;
  needs_onboarding?: boolean;
}

interface GoogleAuthResponse {
  credential: string;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  confirmEmail: string;
  password: string;
}

interface SignupResponse {
  message?: string;
  error?: string;
}

interface UserProfile {
  success: boolean;
  preferences?: {
    education: {
      level: string[];
      institution: string;
      field_of_study: string;
    };
    learning_styles: string[];
    additional_preferences: string;
  };
  error?: string;
}

const API_BASE_URL = 'https://backend-ai-cloud-explains.onrender.com';

export const userAuthAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const loginResponse = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (loginData.user_id) {
        // Check user profile
        const profileResponse = await fetch(`${API_BASE_URL}/get_user_profile?user_id=${loginData.user_id}`);
        const profileData: UserProfile = await profileResponse.json();

        return {
          ...loginData,
          needs_onboarding: !!profileData.error
        };
      }

      return loginData;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Server error during login');
    }
  },

  googleAuth: async (response: GoogleAuthResponse): Promise<LoginResponse> => {
    try {
      const authResponse = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: response.credential })
      });

      const authData = await authResponse.json();

      if (authData.user_id) {
        // Check user profile
        const profileResponse = await fetch(`${API_BASE_URL}/get_user_profile?user_id=${authData.user_id}`);
        const profileData: UserProfile = await profileResponse.json();

        return {
          ...authData,
          needs_onboarding: !!profileData.error
        };
      }

      return authData;
    } catch (error) {
      console.error('Google auth error:', error);
      throw new Error('Server error during Google authentication');
    }
  },

  signup: async (data: SignupData): Promise<SignupResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Server error during registration');
    }
  }
};