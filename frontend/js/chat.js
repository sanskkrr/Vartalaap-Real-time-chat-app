let selectedUID = null;
let socket;
const token = localStorage.getItem("token");
const myUID = localStorage.getItem("uid");
alert("Your UID: " + myUID);

if (!token) {
  window.location.href = "login.html";
}

async function loadUsers() {
  const res = await fetch("http://127.0.0.1:8000/users");
  const users = await res.json();

  const list = document.getElementById("userList");
  list.innerHTML = "";

  users.forEach(user => {
    if (user.uid === myUID) return; // skip yourself

    const li = document.createElement("li");
    li.className = "p-2 bg-gray-700 rounded cursor-pointer";

    li.innerText = user.email;

    li.onclick = () => {

  selectedUID = user.uid;

  document.getElementById("chatUser").innerText = user.email;

  console.log("Selected:", selectedUID);

};

    list.appendChild(li);
  });
}
startChat();

function startChat() {
  socket = new WebSocket(`ws://127.0.0.1:8000/ws?token=${token}`);
  socket.onmessage = function (event) {

  const data = JSON.parse(event.data);

  const li = document.createElement("div");

  if (data.from === myUID) {

    li.className = "self-end bg-blue-500 px-4 py-2 rounded-lg max-w-xs";

  } else {

    li.className = "self-start bg-gray-700 px-4 py-2 rounded-lg max-w-xs";

  }

  li.innerText = data.message;

  document.getElementById("chat").appendChild(li);

};

  socket.onopen = () => console.log("Connected");
  loadUsers();

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    const msgDiv = document.createElement("div");

    if (data.from === myUID) {
      msgDiv.className = "bg-blue-500 p-2 rounded self-end max-w-xs";
      msgDiv.innerText = data.message;
    } else {
      msgDiv.className = "bg-gray-700 p-2 rounded self-start max-w-xs";
      msgDiv.innerText = data.message;
    }

    document.getElementById("chat").appendChild(msgDiv);
  };
}

window.sendMessage = function () {
  const message = document.getElementById("message").value;

  if (!selectedUID) {
    alert("Select a user first");
    return;
  }



socket.send(JSON.stringify({
  to: selectedUID,
  message: message
}));

  document.getElementById("message").value = "";
};