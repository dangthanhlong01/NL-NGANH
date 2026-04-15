import chatbotService from '../services/chatbotService';

/**
 * POST /api/chatbot/message
 * Body: { messages: [{role, content}], userMessage: string }
 */
const sendMessage = async (req, res) => {
  try {
    const { messages, userMessage } = req.body;

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tin nhắn không được để trống",
      });
    }

    // Xây dựng lịch sử hội thoại
    const conversationHistory = Array.isArray(messages) ? messages : [];

    // Thêm tin nhắn mới của user
    const updatedMessages = [
      ...conversationHistory,
      { role: "user", content: userMessage.trim() },
    ];

    // Giới hạn lịch sử 20 tin nhắn gần nhất để tránh quá token
    const limitedMessages = updatedMessages.slice(-20);

    const result = await chatbotService.getChatbotResponse(limitedMessages);

    if (result.success) {
    return res.status(200).json({
        success: true,
        data: {
            reply: result.message,
            products: result.products || [], // ✅ Lấy từ service
            updatedMessages: [
                ...limitedMessages,
                { role: "assistant", content: result.message },
            ],
        },
    });
} else {
      return res.status(500).json({
        success: false,
        message: result.message,
      });
    }
  } catch (error) {
    console.error("Chatbot Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server, vui lòng thử lại sau",
    });
  }
};

/**
 * GET /api/chatbot/welcome
 * Trả về tin nhắn chào mừng
 */
const getWelcomeMessage = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      message:
        "Xin chào! Mình là trợ lý thời trang AI của cửa hàng 👗✨ Mình có thể giúp bạn tư vấn size, gợi ý outfit, hoặc giải đáp thắc mắc về sản phẩm. Bạn cần mình hỗ trợ gì hôm nay?",
      // quickReplies: [
      //   "Tư vấn size cho mình",
      //   "Gợi ý outfit đi chơi",
      //   "Chính sách đổi trả",
      //   "Sản phẩm đang hot",
      // ],
    },
  });
};

module.exports = { sendMessage, getWelcomeMessage };