import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVTrA-NeHO5aFJficKN3SNQ1K0dlxHXfc",
  authDomain: "vartalaap-65dfd.firebaseapp.com",
  projectId: "vartalaap-65dfd",
  storageBucket: "vartalaap-65dfd.firebasestorage.app",
  messagingSenderId: "24289874379",
  appId: "1:24289874379:web:e0b9a962a58bd62402a64e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);