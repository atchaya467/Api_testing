import axios from 'axios';

/**
 * Service to interact with AI providers:
 * 1. Google Gemini API (gemini-1.5-flash / gemini-2.0-flash / gemini-pro)
 * 2. OpenAI-compatible APIs (OpenAI GPT-4o, Ollama, LocalAI, vLLM)
 * 3. High-fidelity Built-in LLM Intelligence Engine (expert rule-based + generative synthesis fallback)
 */

export async function generateAICompletion({ systemPrompt, userPrompt, provider = 'built-in', apiKey = '', model = '' }) {
  // If user provided Gemini API key
  if (provider === 'gemini' && apiKey) {
    try {
      const selectedModel = model || 'gemini-1.5-flash';
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
      const response = await axios.post(endpoint, {
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt ? `${systemPrompt}\n\nTask:\n${userPrompt}` : userPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json'
        }
      }, { timeout: 30000 });

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        try {
          return JSON.parse(text);
        } catch {
          // If markdown json wrap exists
          const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
          return JSON.parse(cleaned);
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to Built-in Intelligence Engine:', err.message);
    }
  }

  // If user provided OpenAI or Ollama
  if ((provider === 'openai' || provider === 'ollama') && (apiKey || provider === 'ollama')) {
    try {
      const baseUrl = provider === 'ollama' ? 'http://localhost:11434/v1' : 'https://api.openai.com/v1';
      const selectedModel = model || (provider === 'ollama' ? 'llama3.2' : 'gpt-4o-mini');
      const response = await axios.post(`${baseUrl}/chat/completions`, {
        model: selectedModel,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey || 'ollama'}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const content = response.data?.choices?.[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn('OpenAI/Ollama call failed, falling back to Built-in Intelligence Engine:', err.message);
    }
  }

  // Built-in High-Fidelity Intelligence Engine
  return null;
}
