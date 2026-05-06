import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini AI client
// The GEMINI_API_KEY is injected at runtime
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chatWithAI(message: string, history: { role: string; text: string }[]) {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3.1-flash-lite-preview',
      config: {
        systemInstruction: `أنت معلم لغة فرنسية لطيف ومتعاون. اسمك "Étoile". 
        مهمتك هي مساعدة المستخدم على ممارسة اللغة الفرنسية.
        - إذا كتب المستخدم بالفرنسية، رد عليه بالفرنسية وصحح له أخطاءه بلطف إذا وجدت، مع شرح بسيط بالعربية عند الحاجة.
        - شجع المستخدم واطرح عليه أسئلة بسيطة ليستمر في المحادثة.
        - اجعل إجاباتك قصيرة وواضحة.
        - يمكنك أحياناً تضمين ترجمة للكلمات الصعبة.`,
      }
    });

    // We can't pass history directly into create() easily in this version without formatting it correctly,
    // so we will just send the latest message or append history as context if needed.
    // For simplicity, we'll serialize the recent history to give context in a single message, 
    // or we can just send the message.
    
    // Convert history to text for context
    const context = history.map(h => `${h.role === 'user' ? 'الطالب' : 'المعلم'}: ${h.text}`).join('\n');
    const prompt = context ? `سياق المحادثة السابقة:
${context}

مرحباً، إليك رسالة الطالب الجديدة:
${message}` : message;

    const response = await chat.sendMessage({ message: prompt });
    return response.text || 'عذراً، لم أتمكن من الرد.';
  } catch (error) {
    console.error('Error chatting with AI:', error);
    return 'عذراً، حدث خطأ في الاتصال بالمساعد الذكي.';
  }
}

export async function translateMessageToFrench(message: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: `ترجم النص التالي إلى اللغة الفرنسية. إذا كان النص بالفعل بالفرنسية، قم بإرجاعه كما هو. لا تضف أي شرح إضافي أو علامات اقتباس. النص: "${message}"`
    });
    return response.text?.trim() || message;
  } catch (error) {
    console.error('Error translating message:', error);
    return message;
  }
}

export async function translateMessageToArabic(message: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: `ترجم النص التالي إلى اللغة العربية. إذا كان النص بالفعل بالعربية، قم بإرجاعه كما هو. لا تضف أي شرح إضافي أو علامات اقتباس. النص: "${message}"`
    });
    return response.text?.trim() || message;
  } catch (error) {
    console.error('Error translating message:', error);
    return message;
  }
}

export async function evaluatePronunciation(phrase: string, transcribedText: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `أنت خبير في تقييم النطق للغة الفرنسية. 
      الطالب كان يُفترض أن يقول العبارة التالية بالفرنسية: "${phrase}"
      لكن ما تم التعرف عليه صوتياً هو: "${transcribedText}"
      
      هل النطق قريب بما يكفي؟ 
      أعطِ تقييماً قصيراً مشجعاً باللغة العربية، واشرح الكلمات التي تم نطقها بشكل خاطئ إن وجدت.
      قدم نصيحة حول كيفية نطقها بشكل صحيح.
      اجعل الرد موجزاً (3-4 أسطر كحد أقصى).`,
    });
    return response.text || 'لا يمكن تقييم النطق حالياً.';
  } catch (error) {
    console.error('Error evaluating pronunciation:', error);
    return 'عذراً، حدث خطأ أثناء محاولة تقييم النطق.';
  }
}

export async function lookupDictionaryWord(word: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: `أنت قاموس فرنسي عربي. ابحث عن الكلمة الفرنسية "${word}".
      قم بإرجاع الرد بتنسيق JSON حصرياً وصحيحاً لبرمجيا.
      {{
        "word": "الكلمة بالفرنسية",
        "type": "نوع الكلمة (اسم مذكر/مؤنث، فعل، صفة، إلخ)",
        "translation": "الترجمة العربية الأساسية",
        "definition": "تعريف مبسط للكلمة باللغة العربية",
        "examples": [
          {{ "fr": "مثال 1 بالفرنسية", "ar": "ترجمة المثال 1" }},
          {{ "fr": "مثال 2 بالفرنسية", "ar": "ترجمة المثال 2" }}
        ]
      }}
      لا تضف أي نص آخر خارج الـ JSON.`,
    });
    
    // Clean up response if it has markdown formatting
    let text = response.text || '';
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/, '').replace(/```\n?$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/, '').replace(/```\n?$/, '');
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error looking up word:', error);
    return null;
  }
}
