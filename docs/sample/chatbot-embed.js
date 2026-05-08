class ChatbotEmbed {
    constructor(options = {}) {
        this.options = {
            chatbotUrl: options.chatbotUrl || '',
            chatbotTitle: options.chatbotTitle || 'AI Chatbot',
            position: options.position || 'bottom-right',
            iconColor: options.iconColor || '#667eea',
            width: options.width || '400px',
            height: options.height || '600px',
            zIndex: options.zIndex || 9999
        };

        this.isOpen = false;
        
        // DOMが読み込まれてから初期化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        this.injectStyles();
        this.createChatIcon();
        this.createChatWindow();
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .chatbot-icon {
                position: fixed;
                height: 60px;
                padding: 0 26px;
                border-radius: 30px;
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
                background-size: 200% 200%;
                animation: chatbot-gradient-shift 6s ease infinite;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(139, 92, 246, 0.45), 0 0 0 0 rgba(139, 92, 246, 0.5);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                z-index: ${this.options.zIndex};
            }

            .chatbot-icon::before {
                content: '';
                position: absolute;
                inset: 0;
                border-radius: inherit;
                background: linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899);
                filter: blur(14px);
                opacity: 0.55;
                z-index: -1;
                animation: chatbot-pulse 2.4s ease-in-out infinite;
            }

            .chatbot-icon:hover {
                transform: translateY(-2px) scale(1.03);
                box-shadow: 0 12px 28px rgba(139, 92, 246, 0.55);
            }

            .chatbot-icon svg {
                width: 22px;
                height: 22px;
                fill: white;
                flex-shrink: 0;
                filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8));
                animation: chatbot-sparkle 2.4s ease-in-out infinite;
            }

            .chatbot-icon-label {
                color: #ffffff;
                font-size: 16px;
                font-weight: 700;
                letter-spacing: 0.06em;
                white-space: nowrap;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', sans-serif;
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
            }

            @keyframes chatbot-gradient-shift {
                0%   { background-position: 0% 50%; }
                50%  { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            @keyframes chatbot-pulse {
                0%, 100% { opacity: 0.45; transform: scale(1); }
                50%      { opacity: 0.75; transform: scale(1.06); }
            }

            @keyframes chatbot-sparkle {
                0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
                50%      { transform: scale(1.15) rotate(12deg); opacity: 0.85; }
            }

            .chatbot-icon.bottom-right {
                bottom: 20px;
                right: 20px;
            }

            .chatbot-icon.bottom-left {
                bottom: 20px;
                left: 20px;
            }

            .chatbot-icon.top-right {
                top: 20px;
                right: 20px;
            }

            .chatbot-icon.top-left {
                top: 20px;
                left: 20px;
            }

            .chatbot-window {
                position: fixed;
                background: white;
                border-radius: 8px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                display: none;
                flex-direction: column;
                overflow: hidden;
                z-index: ${this.options.zIndex};
                transition: all 0.3s ease;
            }

            .chatbot-window.open {
                display: flex;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .chatbot-window.bottom-right {
                bottom: 30px;
                right: 30px;
                width: ${this.options.width};
                height: ${this.options.height};
            }

            .chatbot-window.bottom-left {
                bottom: 30px;
                left: 30px;
                width: ${this.options.width};
                height: ${this.options.height};
            }

            .chatbot-window.top-right {
                top: 30px;
                right: 30px;
                width: ${this.options.width};
                height: ${this.options.height};
            }

            .chatbot-window.top-left {
                top: 30px;
                left: 30px;
                width: ${this.options.width};
                height: ${this.options.height};
            }

            .chatbot-header {
                background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
                background-size: 200% 200%;
                animation: chatbot-gradient-shift 6s ease infinite;
                color: white;
                padding: 4px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }

            .chatbot-header h3 {
                margin: auto;
                font-size: 16px;
                font-weight: 600;
            }

            .chatbot-close {
                background: none;
                border: none;
                color: white;
                font-size: 32px;
                cursor: pointer;
                padding: 0;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: background 0.2s;
            }

            .chatbot-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .chatbot-iframe {
                width: 100%;
                height: 100%;
                border: none;
            }

            @media (max-width: 768px) {
                .chatbot-window {
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    bottom: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    border-radius: 0;
                    max-width: none;
                }

                .chatbot-icon {
                    bottom: 20px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    createChatIcon() {
        this.iconElement = document.createElement('div');
        this.iconElement.className = `chatbot-icon ${this.options.position}`;
        this.iconElement.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <!-- メインのスパークル（AI風キラキラ） -->
                <path d="M12 2 L13.4 9.2 L20.5 10.6 L13.4 12 L12 19.2 L10.6 12 L3.5 10.6 L10.6 9.2 Z" fill="white"/>
                <!-- サブスパークル -->
                <path d="M19.5 3 L20 5.2 L22.2 5.7 L20 6.2 L19.5 8.4 L19 6.2 L16.8 5.7 L19 5.2 Z" fill="white" opacity="0.85"/>
                <path d="M5 17 L5.4 18.6 L7 19 L5.4 19.4 L5 21 L4.6 19.4 L3 19 L4.6 18.6 Z" fill="white" opacity="0.75"/>
            </svg>
            <span class="chatbot-icon-label">AIに質問</span>
        `;
        this.iconElement.addEventListener('click', () => this.toggleChat());
        document.body.appendChild(this.iconElement);
    }

    createChatWindow() {
        this.windowElement = document.createElement('div');
        this.windowElement.className = `chatbot-window ${this.options.position}`;
        this.windowElement.innerHTML = `
            <div class="chatbot-header">
                <h3>${this.options.chatbotTitle}</h3>
                <button class="chatbot-close">×</button>
            </div>
            <iframe class="chatbot-iframe" src="${this.options.chatbotUrl}"></iframe>
        `;
        
        const closeButton = this.windowElement.querySelector('.chatbot-close');
        closeButton.addEventListener('click', () => this.toggleChat());
        
        document.body.appendChild(this.windowElement);
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            this.windowElement.classList.add('open');
            this.iconElement.style.display = 'none';
        } else {
            this.windowElement.classList.remove('open');
            this.iconElement.style.display = 'flex';
        }
    }

    open() {
        if (!this.isOpen) {
            this.toggleChat();
        }
    }

    close() {
        if (this.isOpen) {
            this.toggleChat();
        }
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.ChatbotEmbed = ChatbotEmbed;
}