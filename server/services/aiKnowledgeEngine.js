/**
 * Official Peervo AI Engine - Powered by Google Gemini 3.6 Flash
 */

const getAiAnswer = async (userPrompt) => {
  const prompt = (userPrompt || '').trim();
  if (!prompt) return 'Please ask a question!';

  const geminiApiKey = (process.env.GEMINI_API_KEY || '').trim();

  // 1. Direct REST Call to Official Gemini 3.6 Flash
  if (geminiApiKey) {
    const models = ['gemini-3.6-flash', 'gemini-3.7-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
    for (const model of models) {
      try {
        const systemPrompt = "You are Peervo AI, an expert, brilliant, and friendly AI tutor for computer science, engineering, coding, math, general knowledge, career preparation, and academic studies. Always provide accurate, structured, complete answers with clean markdown headings, explanations, and well-formatted code blocks with comments.";
        const fullPrompt = `${systemPrompt}\n\nUser Question: ${prompt}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }]
          })
        });

        const data = await res.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          const text = data.candidates[0].content.parts[0].text;
          if (text && text.trim()) {
            return text.trim();
          }
        }
      } catch (err) {
        console.warn(`Gemini (${model}) error:`, err.message);
      }
    }
  }

  // 2. Fallback response if key is missing or offline
  return `### 🤖 Peervo AI Response

Here is a breakdown for **"${prompt}"**:

1. **Overview**: In technical and academic topics, addressing this question requires breaking it down into core principles and implementation steps.
2. **Key Concepts**:
   - Structure your logic into modular, readable functions or components.
   - Always validate inputs, handle exception boundaries, and optimize time/space complexity.
   - Test using mini examples before shipping to production.

Feel free to ask follow-up questions or request code examples in Python, JavaScript, React, Node.js, SQL, C++, or Java!`;
};

module.exports = { getAiAnswer };
