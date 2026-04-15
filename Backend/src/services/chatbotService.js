const db = require("../models/index");
const https = require('https');
const { Op } = require("sequelize");

// ✅ Đổi sang Groq API (giữ nguyên, mình chỉnh temperature xuống 0.1 để AI trả JSON chuẩn hơn)
const callGroqAPI = (prompt, messages) => {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: prompt },
                ...messages.map(m => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content
                }))
            ],
            temperature: 0.1, // Nên để thấp khi cần output là JSON thuần
            max_tokens: 1024
        });

        const req = https.request({
            hostname: 'api.groq.com',
            path: '/openai/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Length': Buffer.byteLength(body)
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error('Groq trả về không phải JSON'));
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
};

const extractKeyword = (message) => {
    const stopWords = [
        'shop', 'có', 'không', 'bán', 'cho', 'mình', 'tôi', 'mua',
        'xem', 'tìm', 'muốn', 'cần', 'được', 'ở', 'đây', 'này',
        'gì', 'nào', 'sao', 'thế', 'à', 'ạ', 'nhé', 'nha', 'ơi',
        'hỏi', 'tư vấn', 'giúp', 'với', 'và', 'hoặc', 'hay', 'là'
    ];
    
    let keyword = message.toLowerCase();
    stopWords.forEach(word => {
        keyword = keyword.replace(new RegExp(`\\b${word}\\b`, 'gi'), ' ');
    });
    
    keyword = keyword.replace(/\s+/g, ' ').trim();
    return keyword || message; 
};

const getProductsFromDB = async (userMessage) => {
    try {
        const keyword = extractKeyword(userMessage);
        const words = keyword.split(' ').filter(w => w.length > 1);
        let products = [];

        if (words.length > 0) {
            const whereConditions = words.map(word => ({
                name: { [Op.like]: `%${word}%` }
            }));
            
            products = await db.Product.findAll({
                where: {
                    statusId: 'S1',
                    [Op.or]: whereConditions
                }
            });
        }

        if (products.length === 0) {
            products = await db.Product.findAll({
                where: { statusId: 'S1' },
                limit: 10 
            });
        }

        // ✅ TỐI ƯU HIỆU NĂNG: Dùng Promise.all để fetch Detail và Image song song
        const result = await Promise.all(products.map(async (p) => {
            let detail = await db.ProductDetail.findOne({
                where: { productId: p.id },
                raw: true
            });
            
            let image = null;
            if (detail) {
                let img = await db.ProductImage.findOne({
                    where: { productdetailId: detail.id },
                    raw: true
                });
                if (img && img.image) {
                    image = Buffer.from(img.image, 'base64').toString('binary');
                }
            }
            return {
                id: p.id,
                name: p.name,
                originalPrice: detail?.originalPrice,
                discountPrice: detail?.discountPrice,
                image: image
            };
        }));

        return result;
    } catch (error) {
        console.error('Lỗi lấy sản phẩm:', error.message);
        return [];
    }
};

const SYSTEM_PROMPT = `Bạn là một chuyên viên tư vấn thời trang tâm huyết và am hiểu xu hướng của cửa hàng. Nhiệm vụ của bạn là lắng nghe, gợi ý trang phục phù hợp và mang lại trải nghiệm mua sắm tuyệt vời cho khách hàng.

### QUY TẮC GIAO TIẾP:
1. Ngôn ngữ: 100% tiếng Việt tự nhiên, gần gũi.
2. Xưng hô: Xưng "mình" và gọi khách là "bạn".
3. Thái độ: Thân thiện, nhiệt tình.
4. Kỹ năng tư vấn: 
   - Chủ động hỏi thêm về nhu cầu (ví dụ: mặc đi đâu, thích màu gì, form dáng ra sao) nếu khách yêu cầu chung chung.
   - Nếu khách tìm sản phẩm không có sẵn, hãy khéo léo xin lỗi và điều hướng sang các sản phẩm tương tự.
   - Khi trả lời phải mô tả thêm 2-3 câu về đặc điểm sản phẩm

### QUY TẮC DỮ LIỆU SẢN PHẨM:
1. CHỈ ĐƯỢC PHÉP gợi ý các sản phẩm có trong danh sách dữ liệu ngữ cảnh được cung cấp.
2. TUYỆT ĐỐI KHÔNG tự bịa ra sản phẩm, tên, hoặc giá tiền.
3. KHI GIỚI THIỆU SẢN PHẨM PHẢI KÈM THÊM ẢNH
4. DỰA THEO input mà khách hàng gửi lên để lấy đúng loại sản phẩm đó
### QUY TẮC ĐỊNH DẠNG ĐẦU RA (TỐI QUAN TRỌNG):
Bạn PHẢI LUÔN LUÔN trả về một chuỗi JSON hợp lệ duy nhất. 
TUYỆT ĐỐI KHÔNG bọc JSON trong các thẻ markdown (như \`\`\`json), KHÔNG thêm bất kỳ văn bản, lời chào hay lời giải thích nào nằm ngoài khối JSON.

Cấu trúc JSON bắt buộc:
{
  "message": "Nội dung câu trả lời và tư vấn của bạn...",
  "products": [
    {
      "id": 1,
      "name": "Tên sản phẩm",
      "discountPrice": 100000,
      "originalPrice": 200000
    }
  ]
}

Quy định cho trường "products":
- Nếu có sản phẩm phù hợp để giới thiệu: Trả về danh sách các object sản phẩm với cấu trúc như trên.
- Nếu câu hỏi không liên quan đến việc tìm sản phẩm (chào hỏi, hỏi chính sách) hoặc không tìm thấy sản phẩm nào: Trả về mảng rỗng "products": []`;

const getChatbotResponse = async (messages) => {
    try {
        const lastMessage = messages[messages.length - 1]?.content || '';
        const products = await getProductsFromDB(lastMessage);

        // ✅ Tạo bản sản phẩm KHÔNG có ảnh để gửi lên AI
        const productsForAI = products.map(p => ({
            id: p.id,
            name: p.name,
            originalPrice: p.originalPrice,
            discountPrice: p.discountPrice
        }));

        const DYNAMIC_PROMPT = `${SYSTEM_PROMPT}\n\n## Danh sách sản phẩm hiện có:\n${JSON.stringify(productsForAI, null, 2)}\n\nDựa vào danh sách trên để tư vấn chính xác cho khách hàng.`;

        const res = await callGroqAPI(DYNAMIC_PROMPT, messages);

        if (res.error) {
            console.error('Groq lỗi:', res.error.message);
            return { success: false, message: res.error.message };
        }

        if (!res.choices || res.choices.length === 0) {
            return { success: false, message: 'Không có phản hồi từ AI' };
        }

        const reply = res.choices[0]?.message?.content;
        if (!reply) {
            return { success: false, message: 'AI trả về rỗng' };
        }

        let replyText = reply;
        let replyProducts = [];

        // ✅ TỐI ƯU CÁCH PARSE JSON: Dùng Regex tìm chính xác khối Object
        try {
            const match = reply.match(/\{[\s\S]*\}/);
            if (match) {
                const parsed = JSON.parse(match[0]);
                replyText = parsed.message || reply;

                // Gắn lại ảnh từ DB vào sản phẩm AI trả về
                replyProducts = (parsed.products || []).map(p => {
                    const found = products.find(dbP => dbP.id === p.id);
                    return {
                        ...p,
                        image: found?.image || null
                    };
                });
            } else {
                throw new Error("Không tìm thấy cấu trúc JSON");
            }
        } catch (e) {
            console.error("Lỗi parse JSON từ AI:", e.message, "\nNội dung AI trả về:", reply);
            replyText = reply.replace(/```json|```/gi, '').trim(); // Fallback nếu lỗi
            replyProducts = [];
        }

        return { 
            success: true, 
            message: replyText,
            products: replyProducts 
        };

    } catch (error) {
        console.error("Chatbot Service Error:", error.message);
        return {
            success: false,
            message: "Xin lỗi bạn, mình đang gặp sự cố kết nối. Vui lòng thử lại sau nhé! 🙏",
        };
    }
};

module.exports = { getChatbotResponse };