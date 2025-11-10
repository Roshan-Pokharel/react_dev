import { useState} from 'react'
import { ChatInput } from './components/ChatInput.jsx'
import ChatMessages from './components/ChatMessages.jsx'
import './App.css'

function App() {
        const [chatMessage, setChatMessage] = useState([{
          message: "Hello! How can I assist you today?",
          sender: "bot",
          id: crypto.randomUUID(),
        }
          
        ]);

        return (
          <div className="app-container">
            <ChatMessages chatMessage={chatMessage} />
            <ChatInput
              chatMessage={chatMessage}
              setChatMessage={setChatMessage}
            />
          </div>
        );
      }

export default App
