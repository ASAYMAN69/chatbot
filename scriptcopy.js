
// Chat Widget Script
(function() {
    // Generate a unique session ID or retrieve from storage
    const generateSessionId = () => {
      // Check if a session ID already exists in session storage
      const existingSessionId = sessionStorage.getItem('chatWidgetSessionId');
      
      if (existingSessionId) {
        return existingSessionId;
      }
      
      // Generate a new UUID v4 session ID
      const newSessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      
      // Store the new session ID in session storage
      sessionStorage.setItem('chatWidgetSessionId', newSessionId);
      return newSessionId;
    };
  
    // Get session ID for this user session
    const sessionId = generateSessionId();
    
    // Chat API handling
    const chatApi = {
      webhookUrl: 'https://lovely-proper-sunfish.ngrok-free.app/webhook/b5a531d1-585f-43fe-ba30-ec5aacac4189/chat',
      
      sendMessage: async (message) => {
        try {
          const payload = {
            action: "sendMessage",
            sessionId: sessionId,
            chatInput: message,
            metadata: {}
          };
          
          const response = await fetch(chatApi.webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          return data.output || "Sorry, I couldn't understand that.";
        } catch (error) {
          console.error('Error sending message:', error);
          return "Sorry, there was an error processing your request.";
        }
      }
    };
  
    // Create the chat UI
    function createChatWidget() {
      // Create styles for the widget
      const style = document.createElement('style');
      style.textContent = `
        #chat-widget-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        #chat-widget-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color:rgb(74, 227, 247);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }
        
        #chat-widget-button:hover {
          transform: scale(1.05);
        }
        
        #chat-widget-button svg {
          width: 28px;
          height: 28px;
        }
        
        #chat-widget-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 320px;
          height: 400px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          display: none;
          flex-direction: column;
          overflow: hidden;
        }
        
        #chat-widget-window.open {
          display: flex;
        }
        
        #chat-widget-header {
          background-color: #4a6cf7;
          color: white;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        #chat-widget-title {
          font-weight: 600;
          font-size: 16px;
        }
        
        #chat-widget-close {
          cursor: pointer;
          background: none;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          width: 24px;
          height: 24px;
        }
        
        #chat-widget-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .chat-message {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          line-height: 1.4;
          font-size: 14px;
          word-wrap: break-word;
        }
        
        .chat-message.bot {
          align-self: flex-start;
          background-color: #f1f1f1;
          color: #333;
          border-bottom-left-radius: 4px;
        }
        
        .chat-message.user {
          align-self: flex-end;
          background-color: #4a6cf7;
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        #chat-widget-input-area {
          padding: 12px;
          border-top: 1px solid #eaeaea;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        #chat-widget-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
        }
        
        #chat-widget-input:focus {
          border-color: #4a6cf7;
        }
        
        #chat-widget-send {
          background-color: #4a6cf7;
          color: white;
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        #chat-widget-send svg {
          width: 18px;
          height: 18px;
        }
        
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
          background-color: #f1f1f1;
          border-radius: 18px;
          width: fit-content;
          align-self: flex-start;
          margin-bottom: 5px;
        }
        
        .typing-indicator span {
          width: 6px;
          height: 6px;
          background-color: #888;
          border-radius: 50%;
          display: inline-block;
          animation: typingAnimation 1s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(1) { animation-delay: 0s; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typingAnimation {
          0% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
      `;
      
      document.head.appendChild(style);
      
      // Create the widget container
      const container = document.createElement('div');
      container.id = 'chat-widget-container';
      
      // Create the chat button
      const button = document.createElement('div');
      button.id = 'chat-widget-button';
      button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      
      // Create the chat window
      const chatWindow = document.createElement('div');
      chatWindow.id = 'chat-widget-window';
      
      // Create the header
      const header = document.createElement('div');
      header.id = 'chat-widget-header';
      
      const title = document.createElement('div');
      title.id = 'chat-widget-title';
      title.textContent = 'Chat Support';
      
      const closeButton = document.createElement('button');
      closeButton.id = 'chat-widget-close';
      closeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      
      header.appendChild(title);
      header.appendChild(closeButton);
      
      // Create messages container
      const messagesContainer = document.createElement('div');
      messagesContainer.id = 'chat-widget-messages';
      
      // Create input area
      const inputArea = document.createElement('div');
      inputArea.id = 'chat-widget-input-area';
      
      const input = document.createElement('input');
      input.id = 'chat-widget-input';
      input.type = 'text';
      input.placeholder = 'Type a message...';
      
      const sendButton = document.createElement('button');
      sendButton.id = 'chat-widget-send';
      sendButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
      
      inputArea.appendChild(input);
      inputArea.appendChild(sendButton);
      
      // Assemble the chat window
      chatWindow.appendChild(header);
      chatWindow.appendChild(messagesContainer);
      chatWindow.appendChild(inputArea);
      
      // Add all elements to the container
      container.appendChild(chatWindow);
      container.appendChild(button);
      
      // Add the container to the body
      document.body.appendChild(container);
      
      // Add event listeners
      button.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        
        // If opening the chat for the first time, show welcome message
        if (chatWindow.classList.contains('open') && messagesContainer.children.length === 0) {
          showTypingIndicator();
          
          setTimeout(() => {
            hideTypingIndicator();
            addMessage("Hello! How can I help you today?", 'bot');
          }, 1000);
        }
      });
      
      closeButton.addEventListener('click', () => {
        chatWindow.classList.remove('open');
      });
      
      // Handle sending messages
      const handleSendMessage = async () => {
        const message = input.value.trim();
        if (!message) return;
        
        // Clear input
        input.value = '';
        
        // Add user message to chat
        addMessage(message, 'user');
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send to API and get response
        const botResponse = await chatApi.sendMessage(message);
        
        // Hide typing indicator and show response
        setTimeout(() => {
          hideTypingIndicator();
          addMessage(botResponse, 'bot');
        }, 500);
      };
      
      sendButton.addEventListener('click', handleSendMessage);
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSendMessage();
        }
      });
      
      // Helper functions for adding messages
      function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
      
        if (sender === 'bot') {
          // Extract buttons and remove them from main text
          const buttonMatches = [...text.matchAll(/``(.*?)``/g)];
          const cleanText = text.replace(/``.*?``/g, '').trim();
      
          if (cleanText) {
            const textNode = document.createElement('div');
            textNode.textContent = cleanText;
            messageElement.appendChild(textNode);
          }
      
          if (buttonMatches.length > 0) {
            const buttonWrapper = document.createElement('div');
            buttonWrapper.className = 'chat-button-wrapper';
      
            buttonMatches.forEach(match => {
              const buttonText = match[1];
              const button = document.createElement('button');
              button.className = 'chat-inline-button';
              button.textContent = buttonText;
      
              button.onclick = () => {
                input.value = buttonText;
                sendButton.click();
              };
      
              buttonWrapper.appendChild(button);
            });
      
            messageElement.appendChild(buttonWrapper);
          }
        } else {
          messageElement.textContent = text;
        }
      
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
      
      
      
      
      function showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';
        indicator.id = 'typing-indicator';
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
      
      function hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
          indicator.remove();
        }
      }
    }
  
    // Initialize the chat widget after the page has loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createChatWidget);
    } else {
      createChatWidget();
    }
  })();
  