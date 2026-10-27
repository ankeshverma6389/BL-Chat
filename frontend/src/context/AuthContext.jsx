import React, { createContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const api = axios.create({ baseURL: backendUrl });
export const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socket, setSocket] = useState(null);

  const checkAuth = async () => {
    try {
      const { data } = await api.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const login = async (state, credential) => {
    try {
      const { data } = await api.post(`/api/auth/${state}`, credential);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        api.defaults.headers.common.token = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message ?? error.message);
    }
  };
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUser([]);
    delete api.defaults.headers.common.token;
    socket?.disconnect();
  };
const updateProfile=async (body) => {
  try {
    const { data } = await api.put("/api/auth/update-profile",body);
    if(data.success){
      setAuthUser(data.user);
      toast.success("Profile updated successfully");
      return true;
    }
    toast.error(data.message);
    return false;
  } catch (error) {
    toast.error(error.response?.data?.message ?? error.message);
    return false;
  }
}
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      },
    });
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUser(userIds);
    });
  };

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.token = token;
    }
    checkAuth();
  }, []);

  const value = {
    axios: api,
    authUser,
    onlineUser,
    socket,
    setAuthUser,
    setOnlineUser,
    setSocket,
    setToken,
    login,
    logout,
    updateProfile
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
