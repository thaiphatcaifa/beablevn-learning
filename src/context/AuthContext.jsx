// src/context/AuthContext.jsx
import React, { useContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ref, get } from "firebase/database";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("--- BẮT ĐẦU THEO DÕI AUTH ---");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("✅ 1. Firebase Auth xác nhận đã đăng nhập:", user.email);
        console.log("🔑 UID của user là:", user.uid);
        
        // Truy cập Database
        const userRef = ref(db, `users/${user.uid}`);
        console.log("🔍 2. Đang tìm dữ liệu tại đường dẫn:", `users/${user.uid}`);
        
        try {
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("✅ 3. Đã tìm thấy dữ liệu trong Database:", data);
            
            if (data.role) {
                console.log("👑 4. Vai trò (Role) tìm thấy:", data.role);
                setUserRole(data.role);
                setUserData(data);
            } else {
                console.error("❌ LỖI: Tìm thấy User nhưng KHÔNG THẤY trường 'role'!");
            }
          } else {
            console.error("❌ LỖI TO: Không tìm thấy node dữ liệu nào trùng khớp với UID này!");
            console.log("👉 Gợi ý: Kiểm tra lại file JSON hoặc cấu trúc DB.");
          }
        } catch (err) {
          console.error("❌ LỖI KẾT NỐI DB:", err);
        }
        
        setCurrentUser(user);
      } else {
        console.log("zzz Chưa đăng nhập");
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, userRole, userData, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}