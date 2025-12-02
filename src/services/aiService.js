const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'google';
    this.googleApiKey = process.env.GOOGLE_API_KEY;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    
    // 缓存可用模型列表，避免频繁查询
    this.availableModelsCache = null;
    this.modelsCacheTime = null;
    this.cacheTimeout = 3600000; // 1小时缓存
    
    // 验证 API 密钥配置
    if (this.provider === 'google' && !this.googleApiKey) {
      console.error('❌ GOOGLE_API_KEY is not set in environment variables');
      console.error('Please set GOOGLE_API_KEY in Vercel environment variables');
    } else if (this.provider === 'google' && this.googleApiKey) {
      // 检查 API 密钥格式（应该以 AIza 开头）
      if (!this.googleApiKey.startsWith('AIza')) {
        console.warn('⚠️ GOOGLE_API_KEY format may be incorrect (should start with "AIza")');
      } else {
        console.log('✅ GOOGLE_API_KEY is configured (format looks correct)');
      }
    }
    
    // 配置代理
    this.proxyAgent = null;
    if (process.env.HTTP_PROXY || process.env.HTTPS_PROXY) {
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
      this.proxyAgent = new HttpsProxyAgent(proxyUrl);
      console.log('✅ 代理已配置:', proxyUrl.replace(/\/\/.*@/, '//***@')); // 隐藏密码
    }
  }

  // 延迟函数，用于处理速率限制
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 重试函数，带指数退避
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        // 如果是 429 错误，使用指数退避
        if (error.response && error.response.status === 429) {
          const retryAfter = error.response.headers['retry-after'];
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : baseDelay * Math.pow(2, attempt);
          
          if (attempt < maxRetries - 1) {
            console.log(`⏳ Rate limit hit (429), waiting ${delay}ms before retry ${attempt + 1}/${maxRetries}`);
            await this.delay(delay);
            continue;
          }
        }
        
        // 如果不是 429 或已达到最大重试次数，抛出错误
        throw error;
      }
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

  async getAvailableModels() {
    // 如果缓存有效，直接返回
    if (this.availableModelsCache && this.modelsCacheTime && 
        (Date.now() - this.modelsCacheTime) < this.cacheTimeout) {
      return this.availableModelsCache;
    }

    // 尝试获取可用模型列表
    let availableModels = [];
    try {
      const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${this.googleApiKey}`;
      const listConfig = {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      };
      if (this.proxyAgent) {
        listConfig.httpsAgent = this.proxyAgent;
        listConfig.httpAgent = this.proxyAgent;
      }
      
      // 使用重试机制获取模型列表
      const listResponse = await this.retryWithBackoff(async () => {
        return await axios.get(listUrl, listConfig);
      }, 2, 2000); // 最多重试2次，基础延迟2秒
      
      if (listResponse.data && listResponse.data.models) {
        availableModels = listResponse.data.models
          .filter(m => {
            // Filter models that support generateContent
            const supportsGenerateContent = m.supportedGenerationMethods && 
              m.supportedGenerationMethods.includes('generateContent');
            // Also check if model name looks valid (not empty, not just 'models/')
            const hasValidName = m.name && m.name.replace('models/', '').length > 0;
            // Exclude special models (TTS, image generation, etc.)
            const isTextModel = !m.name.includes('-tts') && 
                               !m.name.includes('-image') && 
                               !m.name.includes('thinking') &&
                               !m.name.includes('computer-use') &&
                               !m.name.includes('robotics') &&
                               !m.name.includes('learnlm') &&
                               !m.name.includes('gemma') &&
                               !m.name.includes('nano-banana');
            return supportsGenerateContent && hasValidName && isTextModel;
          })
          .map(m => {
            // Remove 'models/' prefix if present
            let modelName = m.name.replace(/^models\//, '');
            // Log model details for debugging
            console.log(`  - Model: ${m.name} -> ${modelName} (methods: ${m.supportedGenerationMethods?.join(', ') || 'none'})`);
            return modelName;
          });
        console.log(`📋 Found ${availableModels.length} available text models:`, availableModels.slice(0, 5).join(', '));
        
        // 缓存结果
        this.availableModelsCache = availableModels;
        this.modelsCacheTime = Date.now();
      }
    } catch (listError) {
      console.log('⚠️ Could not list available models, will try default models');
      if (listError.response && listError.response.status === 429) {
        console.log('⚠️ Rate limited when listing models, using cached or default models');
      }
    }
    
    return availableModels;
  }

  async callGoogleGemini(prompt, maxTokens) {
    if (!this.googleApiKey) {
      throw new Error('Google API key is not configured. Please set GOOGLE_API_KEY in .env file');
    }

    // 获取可用模型列表（带缓存）
    const availableModels = await this.getAvailableModels();

    // List of models to try in order (with fallback)
    // Priority: User specified > Confirmed working models > Available models from API > Other models
    const confirmedModels = [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.5-pro-exp'
    ].filter(Boolean);
    
    // Get additional models from API (excluding confirmed ones)
    const additionalModels = availableModels.length > 0 
      ? availableModels.filter(m => !confirmedModels.includes(m)).slice(0, 3)
      : [];
    
    const fallbackModels = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro-latest',
      'gemini-pro'
    ];
    
    // Combine all models in priority order
    const modelsToTry = [
      ...confirmedModels,
      ...additionalModels,
      ...fallbackModels
    ].filter(Boolean);

    // Remove duplicates
    const uniqueModels = [...new Set(modelsToTry)];
    
    console.log(`🔍 Will try ${uniqueModels.length} models:`, uniqueModels.slice(0, 5).join(', '), uniqueModels.length > 5 ? '...' : '');

    // API versions to try
    const apiVersions = ['v1beta', 'v1']; // Try v1beta first as it's more stable

    const errors = []; // Collect all errors for better diagnostics

    // Try each model with each API version until one works
    for (const model of uniqueModels) {
      for (const apiVersion of apiVersions) {
        try {
          // Try different URL formats
          // Format 1: Standard format with API key in URL
          let url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${this.googleApiKey}`;
          console.log(`🔄 Trying: ${model} with API ${apiVersion}`);
          console.log(`   URL: ${url.replace(this.googleApiKey, '***')}`);
          
          const axiosConfig = {
            headers: {
              'Content-Type': 'application/json',
              // Try adding API key in header as well (some endpoints might require this)
              'x-goog-api-key': this.googleApiKey
            },
            timeout: 60000 // Increase timeout to 60 seconds for slow responses
          };

          if (this.proxyAgent) {
            axiosConfig.httpsAgent = this.proxyAgent;
            axiosConfig.httpAgent = this.proxyAgent;
          }

          // 使用重试机制处理 429 错误
          // Note: Don't retry on timeout, just try next model
          const response = await this.retryWithBackoff(async () => {
            const startTime = Date.now();
            try {
              const result = await axios.post(
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
              const duration = Date.now() - startTime;
              console.log(`   ✅ Request completed in ${duration}ms`);
              return result;
            } catch (err) {
              const duration = Date.now() - startTime;
              console.log(`   ❌ Request failed after ${duration}ms: ${err.message}`);
              throw err;
            }
          }, 3, 2000); // 最多重试3次，基础延迟2秒

          if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
            throw new Error('Invalid response from Gemini API');
          }

          const text = response.data.candidates[0].content.parts[0].text;
          console.log(`✅ Successfully used Gemini model: ${model} with API ${apiVersion}`);
          return text.trim();
        } catch (error) {
          // Collect error information
          const errorInfo = {
            model,
            apiVersion,
            status: error.response?.status,
            message: error.response?.data?.error?.message || error.message,
            code: error.code
          };
          errors.push(errorInfo);
          
          // Handle timeout errors
          if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            console.log(`⏱️ Model ${model} with API ${apiVersion} timed out, trying next...`);
            continue; // Try next API version or model
          }
          
          // If it's a 404 (model not found), try next combination
          if (error.response && error.response.status === 404) {
            const errorData = error.response.data?.error || error.response.data;
            const errorMsg = errorData?.message || JSON.stringify(errorData);
            console.log(`⚠️ Model ${model} with API ${apiVersion} not found (404)`);
            console.log(`   Error: ${errorMsg.substring(0, 200)}`);
            // Log full error for first few attempts to help diagnose
            if (errors.length < 3) {
              console.log(`   Full error:`, JSON.stringify(errorData, null, 2));
            }
            continue; // Try next API version or model
          }
          
          // If it's a 429 (rate limit), wait a bit and try next model
          if (error.response && error.response.status === 429) {
            console.log(`⚠️ Rate limit (429) for model ${model}, trying next model...`);
            // 等待一小段时间再尝试下一个模型
            await this.delay(1000);
            continue; // Try next model
          }
          
          // If it's a 401/403 (auth error), stop trying and throw immediately
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.error(`❌ Authentication error (${error.response.status}): Invalid API key or insufficient permissions`);
            throw new Error(`Gemini API authentication failed (${error.response.status}): ${error.response.data?.error?.message || 'Invalid API key or insufficient permissions'}`);
          }
          
          // If it's a different error and this is the last combination, throw it
          const isLastModel = model === uniqueModels[uniqueModels.length - 1];
          const isLastApiVersion = apiVersion === apiVersions[apiVersions.length - 1];
          
          if (isLastModel && isLastApiVersion) {
            console.error('❌ All model combinations failed. Error summary:');
            errors.forEach(e => {
              console.error(`  - ${e.model} (${e.apiVersion}): ${e.status} - ${e.message}`);
            });
            
            if (error.response) {
              throw new Error(`Gemini API error: All models failed. Last error (${error.response.status}): ${JSON.stringify(error.response.data?.error || error.response.data)}. Please check your API key at https://makersuite.google.com/app/apikey`);
            } else if (error.request) {
              throw new Error('Network error: Unable to connect to Gemini API. Please check your internet connection or use a VPN if you are in a restricted network environment.');
            } else {
              throw new Error(`Error: ${error.message}`);
            }
          }
        }
      }
    }
    
    // If all models and API versions failed
    throw new Error(`All Gemini models and API versions failed. Tried ${uniqueModels.length} models with ${apiVersions.length} API versions. Please verify your API key at https://makersuite.google.com/app/apikey and check the Vercel environment variables.`);
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

