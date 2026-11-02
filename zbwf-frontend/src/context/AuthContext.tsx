"use client";

import axios from "axios";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

// Define the types for the user data
interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string | null;
  country: string;
  city: string;
  dateOfBirth: string | null;
  role: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  profilePic: string | null;
  sellerType: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Define the types for the context state
interface AuthContextType {
  token: string | null;
  role: string | null;
  data: UserData | null;
  sellerIds: string[];
  setToken: (token: string | null) => void;
  setRole: (role: string | null) => void;
  setData: (data: UserData | null) => void;
  setSellerIds: (ids: string[]) => void; 
  logout: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to provide context to the app
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>("test_env");
  const [role, setRole] = useState<string | null>("test_env");
  const [data, setData] = useState<any | null>("test_env");
  const [sellerIds, setSellerIds] = useState<string[]>([]); 

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    const storedData = localStorage.getItem("data");
    const storedSellerIds = localStorage.getItem("sellerIds"); 

    if (storedToken) setToken(storedToken);
    if (storedRole) setRole(storedRole);
    if (storedData) setData(JSON.parse(storedData));
    if (storedSellerIds) setSellerIds(JSON.parse(storedSellerIds)); 
  }, []);

  useEffect(() => {
    if (data) {
      localStorage.setItem("data", JSON.stringify(data));
    } else {
      localStorage.removeItem("data");
    }
  }, [data]);

  useEffect(() => {
    if (sellerIds.length > 0) {
      localStorage.setItem("sellerIds", JSON.stringify(sellerIds));
    } else {
      localStorage.removeItem("sellerIds");
    }
  }, [sellerIds]);

  const fetchAndStoreSellers = async () => {
    if (!token || !data?.id) return; 
    try {
      console.log("Token fetch: ", token);
      // const response = await axios.get(`${process.env.NEXT_PUBLIC_HOST}/sellers`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      // console.log("resp: ", response.data.data);

      // const allSellers = response.data.data;

      // console.log("data.id: ", data.id);
      // const userSellers = allSellers.filter((seller: any) => seller.user.id === data.id);
      // const userSellers = allSellers.filter((seller: any) => console.log("sellers dataaa: ", seller.user.id) );

      // Filter sellers created by the current user
      // const userSellers = allSellers.filter((seller: any, index) => {
      //   // console.log(index, "Seller data:  ", seller.user?.id);
      //   return seller.user?.i  d === data.id;
      // });

      // // console.log("userSellers: ", userSellers)
      // const sellerIds = userSellers.map((seller: any) => seller.id);

      // setSellerIds(sellerIds);

      // console.log("Sellers created by the current user:", userSellers);
      // console.log("Seller IDs:", sellerIds);
    } catch (error) {
      console.error("Error fetching sellers:", error);
    }
  };

  useEffect(() => {
    if (token && data?.id) {
      fetchAndStoreSellers();
    }
  }, [token, data?.id]); 

  
  const logout = () => {
    setToken(null);
    setRole(null);
    setData(null);
    setSellerIds([]); 
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("data");
    localStorage.removeItem("sellerIds");
  };

  return (
    <AuthContext.Provider
      value={{ token, role, data, sellerIds, setToken, setRole, setData, setSellerIds, logout,}}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
