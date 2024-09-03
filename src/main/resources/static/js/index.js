"use strict";

const usernameForm = document.querySelector("#username-form");
const messageForm = document.querySelector("#message-form");
const messageInput = document.querySelector("#message-input");
const messagesArea = document.querySelector("#messages-area");
const usernameScreen = document.querySelector(".username-screen");
const messagesScreen = document.querySelector(".messages-screen");

let username = null;
let stompClient = null;
let userUsername = null;

function connect(event) {
  event.preventDefault();
  username = document.querySelector("#username-input").value.trim();
  if (username !== undefined) {
    const socket = new SockJS("/ws");
    stompClient = Stomp.over(socket);

    stompClient.connect({}, onConnected, onError);
    usernameScreen.classList.add("hidden");
    messagesScreen.classList.remove("hidden");
    userUsername = username;
  }
}

function onConnected() {
  console.log("Connected to WebSocket server");
  stompClient.subscribe("/topic/public", onMessageRecieved);

  stompClient.send(
    "/app/chat.addUser",
    {},
    JSON.stringify({ sender: username, type: "JOIN" }),
  );
}

function onError(err) {
  alert("error, check log");
  console.log("error:", err);
}

function sendMessage(event) {
  event.preventDefault();

  //checking if there is a message to send
  const messageContent = messageInput.value.trim();
  if (messageContent && stompClient) {
    let chatMessage = {
      sender: username,
      content: messageContent,
      type: "CHAT",
    };
    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
    messageInput.value = "";
  }
}

function onMessageRecieved(payload) {
  const message = JSON.parse(payload.body);
  const messageElement = document.createElement("li");

  if (message.type === "JOIN") {
    messageElement.textContent = `${message.sender} joined!`;
  } else if (message.type === "LEAVE") {
    messageElement.textContent = `${message.sender} left!`;
  } else {
    const textElement = document.createElement("p");
    const textMessage = document.createTextNode(message.content);
    textElement.appendChild(textMessage);
    messageElement.appendChild(textElement);

    if (message.sender === userUsername) {
      messageElement.classList.add("sent-message");
    } else {
      messageElement.classList.add("recieved-message");
    }
  }
  messagesArea.appendChild(messageElement);
}

usernameForm.addEventListener("submit", connect);
messageForm.addEventListener("submit", sendMessage);
