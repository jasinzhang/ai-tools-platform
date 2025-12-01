const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'google';
    this.googleApiKey = process.env.GOOGLE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    
    // 配置代理
    this.proxyAgent = null;
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
      this.proxyAgent = new HttpsProxyAgent(proxyUrl);
      console.log('✅ 代理已配置:', proxyUrl.replace(/\/\/.*@/, '//***@')); // 隐藏密码
    }
  }

  async callAI(prompt, maxTokens = 500) {
    if (this.provider === 'google' && this.googleApiKey) {
      return await this.callGoogleGemini(prompt, maxTokens);
    } else if (this.openaiApiKey) {
      return await this.callOpenAI(prompt, maxTokens);
    } else {
      throw new Error('No AI provider configured. Please set GOOGLE_API_KEY or OPENAI_API_KEY in .env file');
    }
  }

  async callGoogleGemini(prompt, maxTokens) {
    if (!this.googleApiKey) {
      throw new Error('Google API key is not configured. Please set GOOGLE_API_KEY in .env file');
    }

    // List of models to try in order (with fallback)
    const modelsToTry = [
      process.env.GEMINI_MODEL, // User specified model first
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest'
    ].filter(Boolean); // Remove undefined values

    // Remove duplicates
    const uniqueModels = [...new Set(modelsToTry)];

    // API versions to try
    const apiVersions = ['v1', 'v1beta'];

    // Try each model with each API version until one works
    for (const model of uniqueModels) {
      for (const apiVersion of apiVersions) {
        try {
          const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${this.googleApiKey}`;
          
          const axiosConfig = {
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000
          };

          if (this.proxyAgent) {
            axiosConfig.httpsAgent = this.proxyAgent;
            axiosConfig.httpAgent = this.proxyAgent;
          }

          const response = await axios.post(
            url,
            {
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                temperature: 0.9,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: maxTokens || 500
              }
            },
            axiosConfig
          );

          if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
            throw new Error('Invalid response from Gemini API');
          }

          const text = response.data.candidates[0].content.parts[0].text;
          console.log(`✅ Successfully used Gemini model: ${model} with API ${apiVersion}`);
          return text.trim();
        } catch (error) {
          // If it's a 404 (model not found), try next combination
          if (error.response && error.response.status === 404) {
            console.log(`⚠️ Model ${model} with API ${apiVersion} not found, trying next...`);
            continue; // Try next API version or model
          }
          
          // If it's a different error and this is the last combination, throw it
          const isLastModel = model === uniqueModels[uniqueModels.length - 1];
          const isLastApiVersion = apiVersion === apiVersions[apiVersions.length - 1];
          
          if (isLastModel && isLastApiVersion) {
            console.error('Google Gemini API Error:', error.message);
            if (error.response) {
              console.error('Response status:', error.response.status);
              console.error('Response data:', JSON.stringify(error.response.data, null, 2));
              throw new Error(`Gemini API error (${error.response.status}): ${JSON.stringify(error.response.data?.error || error.response.data)}`);
            } else if (error.request) {
              console.error('No response received. Network error or timeout.');
              throw new Error('Network error: Unable to connect to Gemini API. Please check your internet connection or use a VPN if you are in a restricted network environment.');
            } else {
              throw new Error(`Error: ${error.message}`);
            }
          }
        }
      }
    }
    
    // If all models and API versions failed
    throw new Error('All Gemini models and API versions failed. Please check your API key and network connection.');
  }

  async callOpenAI(prompt, maxTokens) {
    try {
      const axiosConfig = {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      };

      // 如果配置了代理，使用代理
      if (this.proxyAgent) {
        axiosConfig.httpsAgent = this.proxyAgent;
        axiosConfig.httpAgent = this.proxyAgent;
      }

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: maxTokens,
          temperature: 0.9
        },
        axiosConfig
      );

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API Error:', error.response?.data || error.message);
      throw new Error('Failed to generate content. Please check your API key.');
    }
  }

  // TikTok Title Generator
  async generateTikTokTitle(topic, tone = 'engaging', style = 'trendy') {
    const prompt = `Generate 10 catchy TikTok video titles about "${topic}". 
Requirements:
- Tone: ${tone}
- Style: ${style}
- Each title should be 5-8 words
- Use trending keywords and emojis
- Make them viral-worthy and clickable
- Format: Return only the titles, one per line, numbered 1-10`;

    const response = await this.callAI(prompt, 300);
    const titles = response.split('\n').filter(line => line.trim()).slice(0, 10);
    return { titles };
  }

  // Instagram Caption Generator
  async generateInstagramCaption(description, tone = 'friendly', hashtagCount = 10) {
    const prompt = `Create an Instagram post caption for an image described as: "${description}"

Requirements:
- Tone: ${tone}
- Include ${hashtagCount} relevant hashtags
- Make it engaging and authentic
- Include a call-to-action
- Format: Caption first, then hashtags on separate lines

Generate the caption now:`;

    const response = await this.callAI(prompt, 400);
    const parts = response.split(/\n\s*\n/);
    const caption = parts[0] || response;
    const hashtags = response.match(/#[\w]+/g) || [];
    
    return { caption: caption.trim(), hashtags: hashtags.slice(0, hashtagCount) };
  }

  // YouTube Content Generator
  async generateYouTubeContent(topic, description, tone = 'engaging') {
    const prompt = `Create YouTube content for a video:
Topic: ${topic}
Description: ${description || 'General content'}

Generate:
1. A catchy title (under 60 characters)
2. A detailed description (3-4 sentences)
3. 10 relevant tags (comma-separated)

Tone: ${tone}
Make it SEO-friendly and engaging.

Format your response as:
TITLE: [title here]
DESCRIPTION: [description here]
TAGS: [tags here]`;

    const response = await this.callAI(prompt, 500);
    
    const titleMatch = response.match(/TITLE:\s*(.+)/i);
    const descMatch = response.match(/DESCRIPTION:\s*([\s\S]+?)(?=TAGS|$)/i);
    const tagsMatch = response.match(/TAGS:\s*(.+)/i);
    
    return {
      title: titleMatch ? titleMatch[1].trim() : '',
      description: descMatch ? descMatch[1].trim() : '',
      tags: tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()) : []
    };
  }

  // Text Rewriter
  async rewriteText(text, tone = 'professional', style = 'clear') {
    const prompt = `Rewrite the following text in a ${tone} tone with a ${style} style. Keep the meaning the same but make it more engaging:

"${text}"

Provide only the rewritten text:`;

    const response = await this.callAI(prompt, 500);
    return { rewritten: response.trim() };
  }

  // Text Summarizer
  async summarizeText(text, length = 'medium') {
    const lengthMap = { short: '2-3 sentences', medium: '4-5 sentences', long: '6-8 sentences' };
    const targetLength = lengthMap[length] || lengthMap.medium;
    
    const prompt = `Summarize the following text in ${targetLength}. Include the key points and main ideas:

"${text}"

Provide only the summary:`;

    const response = await this.callAI(prompt, 300);
    return { summary: response.trim() };
  }

  // Product Name Generator
  async generateProductNames(description, industry = 'general', style = 'modern') {
    const prompt = `Generate 15 creative product name suggestions for:
Product description: ${description}
Industry: ${industry}
Style: ${style}

Requirements:
- Creative and memorable names
- Relevant to the product
- Easy to pronounce
- Available domain potential (mention if applicable)
- Format: Return only the names, one per line, numbered 1-15`;

    const response = await this.callAI(prompt, 400);
    const names = response.split('\n').filter(line => line.trim()).slice(0, 15);
    return { names };
  }

  // Username Generator
  async generateUsernames(keyword = '', style = 'cool', length = 'medium') {
    const prompt = `Generate 20 creative username suggestions.

Requirements:
- Keyword: ${keyword || 'none specified'}
- Style: ${style}
- Length: ${length}
- Available and unique
- Easy to remember
- Format: Return only the usernames, one per line, numbered 1-20`;

    const response = await this.callAI(prompt, 400);
    const usernames = response.split('\n').filter(line => line.trim()).slice(0, 20);
    return { usernames };
  }
}

module.exports = new AIService();

