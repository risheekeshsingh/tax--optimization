const OpenAI = require('openai');
require('dotenv').config();

async function test() {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('API Key starts with:', apiKey?.substring(0, 20));
  
  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a tax assistant.' },
        { role: 'user', content: 'How can I save tax with 80C?' }
      ]
    });
    console.log('✅ OpenAI Response:', response.choices[0].message.content.substring(0, 200));
  } catch (err) {
    console.error('❌ OpenAI Error:', err.message);
    console.error('Status:', err.status);
    console.error('Code:', err.code);
    console.error('Error details:', err.error?.message || err.error);
  }
}
test();
