const AuthService = {
  login: async (email, password) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
 
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
 
      const data = await response.json();
      localStorage.setItem("token", data.token);
 
      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
 
  faculty_login: async (email, password) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/faculty/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
 
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }
 
      const data = await response.json();
      localStorage.setItem("token", data.token);
 
      return {
        success: true,
        user: data.user,
        token: data.token,
      };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
 
  logout: () => {
    localStorage.removeItem("token");
  },
 
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
 
  getCurrentUserId: () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
 
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.user_id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },
};
 
export default AuthService;