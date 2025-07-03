import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import axiosInstance, {
  setTokens,
  removeTokens,
  getTokens,
} from '../api/axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Decode JWT to extract user info
const getUserFromToken = (accessToken) => {
  if (!accessToken) return null;
  try {
    const base64Url = accessToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ On mount: load user from token + validate via API
  useEffect(() => {
    const initAuth = async () => {
      const { accessToken } = getTokens();

      if (accessToken) {
        const tokenUser = getUserFromToken(accessToken);
        setUser(tokenUser); // Set quick UI access from token

        try {
          const res = await axiosInstance.get('/user/me');
          setUser(res.data.user); // Overwrite with fresh data
        } catch (err) {
          setUser(null);
          removeTokens();
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // ✅ Login
  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    const { accessToken, refreshToken } = res.data;
    setTokens({ accessToken, refreshToken });
    const userData = getUserFromToken(accessToken);
    setUser(userData);
    return userData;
  };

  // ✅ Register
  const register = async (data) => {
    const res = await axiosInstance.post('/auth/register', data);
    return res.data;
  };

  // ✅ Logout
  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch {}
    removeTokens();
    setUser(null);
    window.location.href = '/login';
  }, []);

  // ✅ Refresh user from token manually
  const refreshUser = () => {
    const { accessToken } = getTokens();
    if (accessToken) {
      setUser(getUserFromToken(accessToken));
    } else {
      setUser(null);
    }
  };

  // ✅ Multi-tab sync (logout everywhere)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'accessToken' || e.key === 'refreshToken') {
        refreshUser();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        refreshUser,
        isAuthenticated: !!user,
        roles: Array.isArray(user?.roles)
          ? user.roles
          : user?.role
          ? [user.role]
          : ['user'],
        role: Array.isArray(user?.roles)
          ? user.roles[0]
          : user?.role
          ? user.role
          : 'user',
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
