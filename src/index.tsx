import React from "react";
import ReactDOM from "react-dom/client"; // Use this instead of ReactDOM
import ChatbotUI from "./Chatbot";

const mountChatbot = (containerId: string) => {
  const container = document.getElementById(containerId);
  if (container) {
    const root = ReactDOM.createRoot(container); // Create a root for the container
    root.render(<ChatbotUI />); // Use `render` on the root
  } else {
    console.error(`Container with ID ${containerId} not found.`);
  }
};

// Export the function to mount the chatbot
export { mountChatbot };
