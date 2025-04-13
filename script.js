
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
    
    // UI Configuration (color scheme)
    const UIConfig = {
      // Default colors
      chatButtonColor: 'rgb(74, 227, 247)', 
      sendButtonColor: 'rgb(74, 227, 247)',
      
      // Set custom chat button color and update derived colors
      setChatButtonColor: function(color) {
        this.chatButtonColor = color;
        
        // Apply the new color to all relevant elements
        document.documentElement.style.setProperty('--chat-button-color', color);
        
        // Calculate a lighter version of the color for buttons hover
        const buttonHoverColor = this.lightenColor(color, 0.2);
        document.documentElement.style.setProperty('--button-hover-color', buttonHoverColor);
        
        // Calculate a lighter version for bot messages
        const botMessageColor = this.lightenColor(color, 0.85);
        document.documentElement.style.setProperty('--bot-message-color', botMessageColor);
      },
      
      // Set send button color
      setSendButtonColor: function(color) {
        this.sendButtonColor = color;
        document.documentElement.style.setProperty('--send-button-color', color);
      },
      
      // Helper function to lighten a color
      lightenColor: function(color, factor) {
        // Convert to RGB if it's a hex color
        let r, g, b;
        
        if (color.startsWith('#')) {
          const hex = color.replace('#', '');
          r = parseInt(hex.substr(0, 2), 16);
          g = parseInt(hex.substr(2, 2), 16);
          b = parseInt(hex.substr(4, 2), 16);
        } else if (color.startsWith('rgb')) {
          // Extract RGB values
          const rgbValues = color.match(/\d+/g);
          r = parseInt(rgbValues[0]);
          g = parseInt(rgbValues[1]);
          b = parseInt(rgbValues[2]);
        } else {
          // Default to a light blue if color format is unknown
          return `rgba(200, 240, 255, ${factor})`;
        }
        
        // Lighten the color
        r = Math.floor(r + (255 - r) * factor);
        g = Math.floor(g + (255 - g) * factor);
        b = Math.floor(b + (255 - b) * factor);
        
        return `rgb(${r}, ${g}, ${b})`;
      }
    };
    
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
      // Create styles for the widget with CSS variables for theming
      const style = document.createElement('style');
      style.textContent = `
        :root {
          --chat-button-color: ${UIConfig.chatButtonColor};
          --send-button-color: ${UIConfig.sendButtonColor};
          --bot-message-color: ${UIConfig.lightenColor(UIConfig.chatButtonColor, 0.85)};
          --button-hover-color: ${UIConfig.lightenColor(UIConfig.chatButtonColor, 0.2)};
        }
        
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
          background-color: var(--chat-button-color);
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
          transition: transform 0.3s ease;
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
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.3s, transform 0.3s;
        }
        
        #chat-widget-window.open {
          display: flex;
          opacity: 1;
          transform: translateY(0);
        }
        
        #chat-widget-header {
          background-color: var(--chat-button-color);
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
          gap: 8px;
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
          background-color: var(--bot-message-color);
          color: #333;
          border-bottom-left-radius: 4px;
          margin-bottom: 3px;
        }
        
        .chat-message.user {
          align-self: flex-end;
          background-color: var(--send-button-color);
          color: white;
          border-bottom-right-radius: 4px;
          margin-bottom: 3px;
        }
        
        .chat-image-container {
          align-self: flex-start;
          max-width: 80%;
          margin-bottom: 3px;
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
          border-color: var(--chat-button-color);
        }
        
        #chat-widget-send {
          background-color: var(--send-button-color);
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
          background-color: var(--bot-message-color);
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
        
        .chat-button-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }
        
        .chat-inline-button {
          background-color: transparent;
          border: 1px solid var(--chat-button-color);
          border-radius: 16px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
          color: #333;
        }
        
        .chat-inline-button:hover {
          background-color: var(--button-hover-color);
          color: #000;
        }
        
        .chat-image {
          max-width: 100%;
          max-height: 200px;
          border-radius: 8px;
        }
      `;
      
      document.head.appendChild(style);
      
      // Create the widget container
      const container = document.createElement('div');
      container.id = 'chat-widget-container';
      
      // Create the chat button with both message and arrow icons
      const button = document.createElement('div');
      button.id = 'chat-widget-button';
      button.innerHTML = '<svg id="chat-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><svg id="arrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;"><polyline points="6 9 12 15 18 9"></polyline></svg>';
      
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
      
      // Apply initial colors
      UIConfig.setChatButtonColor(UIConfig.chatButtonColor);
      UIConfig.setSendButtonColor(UIConfig.sendButtonColor);
      
      // Test function to demonstrate changing colors (for development/testing)
      window.changeChatColors = function(chatColor, sendColor) {
        if (chatColor) UIConfig.setChatButtonColor(chatColor);
        if (sendColor) UIConfig.setSendButtonColor(sendColor);
      };
      
      // Add event listeners
      button.addEventListener('click', () => {
        chatWindow.classList.toggle('open');
        
        // Toggle between chat and arrow icons
        const chatIcon = document.getElementById('chat-icon');
        const arrowIcon = document.getElementById('arrow-icon');
        
        if (chatWindow.classList.contains('open')) {
          chatIcon.style.display = 'none';
          arrowIcon.style.display = 'block';
          
          // If opening the chat for the first time, show welcome message
          if (messagesContainer.children.length === 0) {
            showTypingIndicator();
            
            setTimeout(() => {
              hideTypingIndicator();
              addMessage("Hello! How can I help you today?", 'bot');
            }, 1000);
          }
        } else {
          chatIcon.style.display = 'block';
          arrowIcon.style.display = 'none';
        }
      });
      
      closeButton.addEventListener('click', () => {
        chatWindow.classList.remove('open');
        // Reset to chat icon when closed
        document.getElementById('chat-icon').style.display = 'block';
        document.getElementById('arrow-icon').style.display = 'none';
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
          processAndDisplayBotResponse(botResponse);
        }, 500);
      };
      
      sendButton.addEventListener('click', handleSendMessage);
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSendMessage();
        }
      });
      
      // Process and display bot response with separate images and text
      function processAndDisplayBotResponse(text) {
        // Check for postimg.cc image URLs
        const imageRegex = /https:\/\/i\.postimg\.cc\/\S+/g;
        const imageMatches = text.match(imageRegex);
        
        // Check for button markup
        const buttonRegex = /``(.*?)``/g;
        const buttonMatches = [...text.matchAll(buttonRegex)];
        
        // Clean text by removing button markers
        let cleanText = text.replace(/``.*?``/g, '');
        
        // If there are image URLs, remove them from the text as well
        if (imageMatches) {
          imageMatches.forEach(imgUrl => {
            cleanText = cleanText.replace(imgUrl, '');
          });
        }
        
        cleanText = cleanText.trim();
        
        // Add images first (if any) as separate messages
        if (imageMatches && imageMatches.length > 0) {
          imageMatches.forEach(imageUrl => {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'chat-image-container';
            
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.alt = 'Chat image';
            imageElement.className = 'chat-image';
            imageElement.onerror = () => {
              imageElement.style.display = 'none';
              console.error('Failed to load image:', imageUrl);
            };
            
            imageContainer.appendChild(imageElement);
            messagesContainer.appendChild(imageContainer);
          });
        }
        
        // Only add text content if it exists (with buttons if any)
        if (cleanText || buttonMatches.length > 0) {
          const messageElement = document.createElement('div');
          messageElement.classList.add('chat-message', 'bot');
          
          if (cleanText) {
            const textNode = document.createElement('div');
            textNode.textContent = cleanText;
            messageElement.appendChild(textNode);
          }
          
          // Add buttons if any
          if (buttonMatches && buttonMatches.length > 0) {
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
          
          messagesContainer.appendChild(messageElement);
        }
        
        // Scroll to the bottom after adding all elements
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
      
      // Helper function for adding messages
      function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', sender);
        messageElement.textContent = text;
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
  
    // Initialize the chat widget immediately to fix loading issues
    createChatWidget();
})();
