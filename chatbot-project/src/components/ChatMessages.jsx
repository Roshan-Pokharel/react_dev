 import { useRef, useEffect } from "react";
 import { Chat } from "./ChatMessage.jsx";
 import './ChatMessages.css'
 // Chat Messages Component
       function ChatMessages({ chatMessage }) {
      
        const chatMessageRef = useRef(null);

        useEffect(() => {
          const containerElem= chatMessageRef.current;
          if(containerElem){
            containerElem.scrollTop = containerElem.scrollHeight;
          }
        }, [chatMessage]);

        return (
          <div className="chat-messages-container"  ref={chatMessageRef}>
            {chatMessage.map((chatMessage) => {
              //console.log(chatMessage.message);
              return (
                <Chat
                  message={chatMessage.message}
                  sender={chatMessage.sender}
                  key={chatMessage.id}
                />
              );
            })}
          </div>
        );
      }

      export default ChatMessages;