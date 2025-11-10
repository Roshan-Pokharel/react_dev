import { useState } from "react";
import {Chatbot} from 'supersimpledev'
import './ChatInput.css'
// Chat Input Component
      export function ChatInput({ setChatMessage }) {
        const [inputText, setInputText] = useState("");

        function saveInputText(event) {
          setInputText(event.target.value);
        }

        async function sendMessage() {
          const currentInput = inputText;
          // Don't send empty messages
          if (!currentInput.trim()) return;

          setInputText("");

          const userMessage = {
            message: currentInput,
            sender: "user",
            id: crypto.randomUUID(),
          };

          // Create a unique ID for the loading message
          const loadingMessageId = crypto.randomUUID();
          const loadingMessage = {
            message: "loading", // Special message to detect loading
            sender: "bot",
            id: loadingMessageId,
          };

          // Add user message AND loading message to the chat
          setChatMessage((prevMessages) => [
            ...prevMessages,
            userMessage,
            loadingMessage,
          ]);

          // Wait for 2 seconds
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Get the bot response
          const response = Chatbot.getResponse(currentInput);

          const botMessage = {
            message: response,
            sender: "bot",
          };

         
          setChatMessage((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === loadingMessageId
                ? { ...botMessage, id: loadingMessageId }
                : msg
            )
          );
        }
        
        // Added onKeyDown to send message with 'Enter' key
        function handleKeyDown(event) {
          if (event.key === 'Enter') {
            sendMessage();
          }
        }

        return (
          <div className="chat-input-container">
            <input
              type="text"
              placeholder="Type your message..."
              size="30"
              onChange={saveInputText}
              onKeyDown={handleKeyDown}
              value={inputText}
              className="chat-input"
            />
            <button onClick={sendMessage} className="send-button">
              Send
            </button>
          </div>
        );
      }