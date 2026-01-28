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
                width: 70px;
                height: 70px;
                border-radius: 50%;
                background: ${this.options.iconColor};
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transition: all 0.3s ease;
                z-index: ${this.options.zIndex};
            }

            .chatbot-icon:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
            }

            .chatbot-icon svg {
                width: 30px;
                height: 30px;
                fill: white;
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
                background: ${this.options.iconColor};
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
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 28px; height: 28px;">
                    <!-- 頭 -->
                    <rect x="6" y="4" width="12" height="10" rx="2" fill="none" stroke="white" stroke-width="2"/>
                    
                    <!-- アンテナ -->
                    <line x1="12" y1="2" x2="12" y2="4" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="1.5" r="1" fill="white"/>
                    
                    <!-- 目 -->
                    <circle cx="10" cy="9" r="1.5" fill="white"/>
                    <circle cx="14" cy="9" r="1.5" fill="white"/>
                    
                    <!-- 口 -->
                    <rect x="9" y="11" width="6" height="1.5" rx="0.75" fill="white"/>
                    
                    <!-- 胴体 -->
                    <rect x="8" y="14" width="8" height="5" rx="1" fill="none" stroke="white" stroke-width="2"/>
                    
                    <!-- 腕 -->
                    <line x1="6" y1="16" x2="8" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    <line x1="16" y1="16" x2="18" y2="16" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    
                    <!-- 脚 -->
                    <line x1="10" y1="19" x2="10" y2="22" stroke="white" stroke-width="2" stroke-linecap="round"/>
                    <line x1="14" y1="19" x2="14" y2="22" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span style="color: white; font-size: 12px; font-weight: 600; white-space: nowrap;">AIに質問</span>
            </div>
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