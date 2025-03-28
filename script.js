document.addEventListener("DOMContentLoaded", () => {
  const chatBody = document.querySelector(".chat-body");
  const messageInput = document.querySelector(".message-input");
  const chatForm = document.getElementById("chat-form");
  const clearChatBtn = document.getElementById("clear-chat");

  const API_KEY = "ELdNBneJKAnOoCzmqPWsjA6t1ns62EwYlAFgtZXE"; // Cohere API kaliti
  const API_URL = "https://api.cohere.ai/v1/chat";

  // Default bot xabari
  const defaultBotMessage = `<div class="message bot-message">
                                <img src="images/bot.png" alt="" class="logo-icon logo" />
                                <div class="message-text">
                                    Hey there 👋 <br />
                                    How can I help you today?
                                </div>
                            </div>`;

  // Vaqt olish funksiyasi
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // "Typing..." indikatorini qo‘shish
  const showTypingIndicator = () => {
    const typingElement = createMessageElement(
      "Bot is typing...",
      "bot-message"
    );
    typingElement.classList.add("typing");
    chatBody.appendChild(typingElement);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  // "Typing..." indikatorini o‘chirish
  const removeTypingIndicator = () => {
    const typingElement = document.querySelector(".typing");
    if (typingElement) typingElement.remove();
  };

  // Yangi xabar yaratish funksiyasi
  const createMessageElement = (content, classes) => {
    const div = document.createElement("div");
    div.classList.add("message", classes);
    div.innerHTML = `
            <div class="message-text">${content}</div>
            <div class="message-time">${getCurrentTime()}</div>
        `;
    return div;
  };

  // LocalStorage uchun funksiyalar
  const saveMessagesToLocal = () => {
    localStorage.setItem("chatMessages", chatBody.innerHTML);
  };

  const loadMessagesFromLocal = () => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      chatBody.innerHTML = savedMessages;
    }
    // Agar chat bo‘sh bo‘lsa, default bot xabarini qo‘shamiz
    if (!chatBody.innerHTML.trim()) {
      const botMessageElement = createMessageElement(
        defaultBotMessage,
        "bot-message"
      );
      chatBody.appendChild(botMessageElement);
    }
  };

  // Foydalanuvchi xabarini chiqarish
  const handleOutgoingMessage = (userMessage) => {
    const userMessageElement = createMessageElement(
      userMessage,
      "user-message"
    );
    chatBody.appendChild(userMessageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
    messageInput.value = "";
    saveMessagesToLocal();
  };

  // AI javobini olish
  const getAIResponse = async (userMessage) => {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ model: "command-r", message: userMessage }),
      });

      const data = await response.json();
      return data.text || "I couldn't understand that.";
    } catch (error) {
      return "Error: Unable to get a response.";
    }
  };

  // Bot javobini chiqarish
  const handleIncomingMessage = async (userMessage) => {
    handleOutgoingMessage(userMessage);
    showTypingIndicator();
    const botResponse = await getAIResponse(userMessage);
    removeTypingIndicator();
    const botMessageElement = createMessageElement(botResponse, "bot-message");
    chatBody.appendChild(botMessageElement);
    chatBody.scrollTop = chatBody.scrollHeight;
    saveMessagesToLocal();
  };

  // Xabar yuborish
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;
    await handleIncomingMessage(userMessage);
  });

  // Chatni tozalash (default bot xabarini saqlash)
  clearChatBtn.addEventListener("click", () => {
    chatBody.innerHTML = "";
    localStorage.removeItem("chatMessages");
    const botMessageElement = createMessageElement(
      defaultBotMessage,
      "bot-message"
    );
    chatBody.appendChild(botMessageElement);
    saveMessagesToLocal();
  });

  // Oldingi xabarlarni yuklash
  loadMessagesFromLocal();
});
