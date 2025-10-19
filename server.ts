import 'dotenv/config';
import http, { IncomingMessage, ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';

const PORT = Number(process.env.PORT || 5174);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('Missing GEMINI_API_KEY');
  process.exit(1);
}

export type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

const server = http.createServer(async (req, res) => {
  setCORS(res);
  
  if (req.method === 'OPTIONS') return res.end();
  const url = req.url || '/';

  if (req.method === 'GET' && url === '/api/health') {
    return json(res, 200, { ok: true, service: 'gemini-proxy', node: process.version });
  }

  if (req.method === 'POST' && url === '/api/chat') {
    try {
      await handleChat(req, res);
    } catch (e: any) {
      json(res, 500, { error: 'Server error', detail: e?.message || String(e) });
    }
    return;
  }

  serveStatic(req, res);
});

const setCORS = (res: ServerResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

const json = (res: ServerResponse, code: number, data: unknown) => {
  const body = JSON.stringify(data);
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(body);
}

const notFound = (res: ServerResponse) => {
  res.statusCode = 404;
  res.end('Not Found');
}

const handleChat = async (req: IncomingMessage, res: ServerResponse) => {
  const body = await parseJSON(req);
  if (!body || !Array.isArray(body.messages)) {
    return json(res, 400, { error: 'messages array required' });
  }

  const contents = toGeminiContents(body.messages as ChatMessage[]);
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY!,
    },
    body: JSON.stringify({ contents }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    return json(res, 502, { error: 'Gemini API error', detail: text });
  }

  const data = await resp.json() as any;
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  
  return json(res, 200, { reply });
}

const parseJSON = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
  }
  catch { 
    return null; 
  }
}

const toGeminiContents = (messages: ChatMessage[]) => {
  const systemText = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
  const conversation = messages.filter(m => m.role !== 'system');
  
  if (systemText) {
    conversation.unshift({ role: 'user', content: `System instruction:\n${systemText}` });
  }
  
  return conversation.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
}

const serveStatic = (req: IncomingMessage, res: ServerResponse) => {
  const urlPath = req.url === '/' ? '/index.html' : (req.url || '/');
  const filePath = path.join(process.cwd(), 'public', path.normalize(urlPath));
  if (!filePath.startsWith(path.join(process.cwd(), 'public'))) {
    return notFound(res);
  }

  fs.readFile(filePath, (err, buf) => {
    if (err) 
      return notFound(res);
    
    const ext = path.extname(filePath);
    const type = ext === '.html' ? 'text/html; charset=utf-8'
      : ext === '.js' ? 'text/javascript; charset=utf-8'
      : ext === '.css' ? 'text/css; charset=utf-8' : 'text/plain; charset=utf-8';

    res.setHeader('Content-Type', type);
    res.statusCode = 200;
    
    res.end(buf);
  });
}

server.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});

