import { NextResponse } from 'next/server';
import { z } from 'zod';
import fetch from 'node-fetch';
import cheerio from 'cheerio';
import { pino } from 'pino';

const logger = pino({ transport: { target: 'pino-pretty' } });

const schema = z.object({
  url: z.string().url(),
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required');
}

const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = schema.parse(body);

    // Fetch and parse HTML
    const htmlResponse = await fetchWithTimeout(url, { timeout: 5000 });
    const html = await htmlResponse.text();
    const $ = cheerio.load(html);

    // Remove scripts and styles
    $('script, style').remove();

    // Extract main content
    const text = $('body').text().trim();
    const chunks = text.match(/.{1,10000}/g) || [text];

    // Generate summary for each chunk
    let fullSummary = '';
    for (const chunk of chunks) {
      const response = await fetchWithTimeout(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GEMINI_API_KEY}`,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `以下のテキストを50文字以内の1文で要約してください：\n\n${chunk}`
                  }
                ]
              }
            ]
          })
        },
        5000
      );

      if (!response.ok) {
        throw new Error('Gemini API call failed');
      }

      const data = await response.json();
      const chunkSummary = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      fullSummary += chunkSummary;
    }

    // Generate final summary from all chunks
    const finalResponse = await fetchWithTimeout(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `以下の要約をさらに50文字以内の1文で要約してください：\n\n${fullSummary}`
                }
              ]
            }
          ]
        })
      },
      5000
    );

    if (!finalResponse.ok) {
      throw new Error('Final Gemini API call failed');
    }

    const finalData = await finalResponse.json();
    const finalSummary = finalData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return NextResponse.json({ summary: finalSummary });
  } catch (error) {
    logger.error(error, 'Error in summary generation');
    return NextResponse.json(
      { error: '要約の生成に失敗しました' },
      { status: 500 }
    );
  }
}
