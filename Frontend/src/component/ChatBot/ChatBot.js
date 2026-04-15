import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./ChatBot.css";
import { useHistory } from "react-router-dom";
// Quick reply suggestions
const QUICK_REPLIES = [
  "Tư vấn size cho mình 📏",
  "Gợi ý outfit đi chơi 🌸",
  "Chính sách đổi trả 🔄",
  "Sản phẩm đang hot 🔥",
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const history = useHistory();

  // Scroll xuống cuối
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input khi mở chat
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Load welcome message lần đầu mở
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetchWelcomeMessage();
    }
  }, [isOpen, messages.length]);

  const fetchWelcomeMessage = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/chatbot/welcome`
      );
      if (res.data.success) {
        const { message, quickReplies } = res.data.data;
        setMessages([
          {
            id: Date.now(),
            role: "assistant",
            content: message,
            quickReplies: quickReplies,
            timestamp: new Date(),
          },
        ]);
      }
    } catch {
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content:
            "Xin chào! Mình là trợ lý thời trang AI 👗✨ Bạn cần mình hỗ trợ gì?",
          timestamp: new Date(),
        },
      ]);
    }
  };

  const sendMessage = async (text) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    setInputValue("");

    // Thêm tin nhắn user vào UI
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/chatbot/message`,
        {
          messages: conversationHistory,
          userMessage: messageText,
        }
      );

      if (res.data.success) {
        const { reply, products, updatedMessages } = res.data.data;
        setConversationHistory(updatedMessages);

        const botMsg = {
          id: Date.now() + 1,
          role: "assistant",
          content: reply,
          products: products || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            "Xin lỗi bạn, mình đang gặp sự cố. Vui lòng thử lại sau nhé! 🙏",
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setConversationHistory([]);
    fetchWelcomeMessage();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Nút mở chatbot */}
      <div className="chatbot-launcher" onClick={() => setIsOpen(!isOpen)}>
        {hasUnread && !isOpen && <span className="chatbot-badge">1</span>}
        <div className={`chatbot-launcher-icon ${isOpen ? "open" : ""}`}>
          {isOpen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
            </svg>
          )}
        </div>
        {!isOpen && (
          <div className="chatbot-launcher-pulse" />
        )}
      </div>

      {/* Cửa sổ chat */}
      <div className={`chatbot-window ${isOpen ? "open" : ""}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <div className="chatbot-avatar">
              <img src="/resources/img/fevicon.png" alt="Bot Logo" />
              <div className="chatbot-status-dot" />
            </div>
            <div className="chatbot-header-info">
              <h4>Trợ lý Thời Trang</h4>
              <span>Trực tuyến · Phản hồi ngay</span>
            </div>
          </div>
          <div className="chatbot-header-actions">
            <button
              className="chatbot-icon-btn"
              onClick={handleReset}
              title="Cuộc trò chuyện mới"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
            <button
              className="chatbot-icon-btn"
              onClick={() => setIsOpen(false)}
              title="Thu nhỏ"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`chatbot-message-wrapper ${msg.role === "user" ? "user" : "bot"}`}
            >
              {msg.role === "assistant" && (
                <div className="chatbot-avatar">
                  <img src="/resources/img/fevicon.png" alt="Bot Logo" />
                  <div className="chatbot-status-dot" />
                </div>
              )}
              <div className="chatbot-message-group">
                <div
                  className={`chatbot-message ${msg.role === "user" ? "user" : "bot"} ${msg.isError ? "error" : ""}`}
                >
                  {msg.content}
                </div>
                {/* {msg.products && msg.products.length > 0 && (
                  <div className="chatbot-product-cards">
                    {msg.products.map((p, i) => (
                      <div key={i} className="chatbot-product-card">
                        <div className="chatbot-product-info">
                          <div className="chatbot-product-name">{p.name}</div>
                          <div className="chatbot-product-price">
                            <span className="price-discount">
                              {p.discountPrice?.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="price-original">
                              {p.originalPrice?.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )} */}
                {/* anh san pham*/}
                {msg.products && msg.products.length > 0 && (
                  <div className="chatbot-product-cards">
                    {msg.products.map((p, i) => (
                      <div
                        key={i}
                        className="chatbot-product-card"
                        onClick={() => {
                          history.push(`/detail-product/${p.id}`);
                          setIsOpen(false);
                        }} // ✅ thêm dòng này
                        style={{ cursor: 'pointer' }}
                      >
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p?.name}
                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6 }}
                          />
                        )}
                        <div className="chatbot-product-info">
                          <div className="chatbot-product-name">{p?.name}</div>
                          <div className="chatbot-product-price">
                            <span className="price-discount">
                              {p?.discountPrice?.toLocaleString('vi-VN')}đ
                            </span>
                            <span className="price-original">
                              {p?.originalPrice?.toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span className="chatbot-time">{formatTime(msg.timestamp)}</span>

                {/* Quick replies */}
                {msg.quickReplies && (
                  <div className="chatbot-quick-replies">
                    {msg.quickReplies.map((qr, i) => (
                      <button
                        key={i}
                        className="chatbot-quick-reply-btn"
                        onClick={() => sendMessage(qr)}
                        disabled={isLoading}
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="chatbot-message-wrapper bot">
              <div className="chatbot-avatar">
                <img src="/resources/img/fevicon.png" alt="Bot Logo" />
              </div>
              <div className="chatbot-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick reply shortcuts */}
        {messages.length <= 1 && (
          <div className="chatbot-shortcuts">
            {QUICK_REPLIES.map((qr, i) => (
              <button
                key={i}
                className="chatbot-shortcut-btn"
                onClick={() => sendMessage(qr)}
                disabled={isLoading}
              >
                {qr}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chatbot-input-area">
          <textarea
            ref={inputRef}
            className="chatbot-input"
            placeholder="Nhắn tin tư vấn..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className={`chatbot-send-btn ${inputValue.trim() ? "active" : ""}`}
            onClick={() => sendMessage()}
            disabled={!inputValue.trim() || isLoading}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Overlay mobile */}
      {isOpen && <div className="chatbot-overlay" onClick={() => setIsOpen(false)} />}
    </>
  );
};

export default ChatBot;