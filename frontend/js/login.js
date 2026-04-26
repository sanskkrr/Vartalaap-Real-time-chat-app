import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

window.login = async function () {
  
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    const token = await userCred.user.getIdToken();
    const uid = userCred.user.uid;

    localStorage.setItem("token", token);
    localStorage.setItem("uid", uid);

    window.location.href = "chat.html";

  } catch (err) {
    alert(err.message);
  }
};
document.getElementById("loginBtn").addEventListener("click", login);