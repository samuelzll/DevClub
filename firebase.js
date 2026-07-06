// firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyDGaHPcM_kQEmrcRHDZtkjhgl2LeLy3GkM",
  authDomain: "bemdoce-trufas-963ab.firebaseapp.com",
  projectId: "bemdoce-trufas-963ab",
  storageBucket: "bemdoce-trufas-963ab.firebasestorage.app",
  messagingSenderId: "283171501348",
  appId: "1:283171501348:web:853551811eb2d123556fb1"
};
// 🔥 Evita inicialização duplicada
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// 🔐 Auth
window.auth = firebase.auth();

// 🔥 Firestore
window.db = firebase.firestore();
