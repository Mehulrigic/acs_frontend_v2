// import React, { createContext, useContext, useState } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(
//     localStorage.getItem("authToken") ? true : false
//   );

//   const login = (token, user, role) => {
//     setIsAuthenticated(true);
//     localStorage.setItem("authToken", token); // Save token for persistence
//     localStorage.setItem("user", JSON.stringify(user));
//     localStorage.setItem("userRole", JSON.stringify(role));
//   };

//   const logout = () => {
//     setIsAuthenticated(false);
//     localStorage.removeItem("authToken");
//     localStorage.clear();
//   };

//   return (
//     <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
