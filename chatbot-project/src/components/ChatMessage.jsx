import './ChatMessage.css'
import RobotProfileImage from '../assets/chat-bot.png'
import UserProfileImage from '../assets/avatar-pic.png'

      // Chat Message Component
      export function Chat({ message, sender }) {
        return (
          <div className={sender === "user" ? "user-chat" : "bot-chat"}>
            <>
              {sender === "bot" && (
                <img src={RobotProfileImage} width="30" className="chat-bot-img" />
              )}

              {/* Check if this is the loading message */}
              {sender === "bot" && message === "loading" ? (
                  <div className="chat-message-text">
                  Thinking<span className="thinking-dots"></span>
                </div>
               
              ) : (
                <div className="chat-message-text">{message}</div> // Show real message
              )}

              {sender === "user" && (
                <img src={UserProfileImage} width="50" className="avatar-img" />
              )}
            </>
          </div>
        );
      }
