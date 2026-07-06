// File: src/lib/tokenStore.js

// Variabel module - hanya bisa diakses dalam file ini
let accessToken = null;

export const TokenStore = {
  // Access Token disimpan di memory (variabel JavaScript)
  getAccessToken: () => accessToken,
  setAccessToken: (token) => { accessToken = token; },
  
  // Refresh Token disimpan di sessionStorage
  // (lebih aman dari localStorage karena reset saat tab ditutup)
  getRefreshToken: () => sessionStorage.getItem("rf_token"),
  setRefreshToken: (token) => sessionStorage.setItem("rf_token", token),
  
  // Hapus semua token (saat logout)
  clear: () => {
    accessToken = null;
    sessionStorage.removeItem("rf_token");
  },
  
  // Cek apakah user punya refresh token (masih login)
  isLoggedIn: () => !!sessionStorage.getItem("rf_token"),
};