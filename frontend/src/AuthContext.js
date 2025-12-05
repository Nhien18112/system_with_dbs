import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. KHỞI TẠO STATE: Đọc dữ liệu từ localStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      // Nếu có dữ liệu, chuyển từ JSON string sang Object và trả về
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      // Xử lý lỗi nếu localStorage bị hỏng (trả về null)
      console.error("Lỗi đọc user từ localStorage:", error);
      return null;
    }
  });

  /**
   * login(userData): Lưu thông tin user mới vào State VÀ localStorage
   */
  const login = (userData) => {
    setUser(userData);
    // 2. LƯU DỮ LIỆU MỚI VÀO LOCALSTORAGE
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /**
   * logout(): Xóa user khỏi State VÀ localStorage
   */
  const logout = () => {
    setUser(null);
    // 3. XÓA DỮ LIỆU
    localStorage.removeItem("user");
  };

  // Optional: Dùng useEffect để đồng bộ hóa nếu cần (thường không cần thiết 
  // nếu login/logout đã xử lý xong)
  /*
  useEffect(() => {
    // Không cần dùng useEffect nếu logic login/logout đã update localStorage
  }, [user]);
  */

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);