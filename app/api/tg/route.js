import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/db';
import { tg } from '@/lib/tg';
import { webhookSecret } from '@/lib/auth';
export async function POST(req) {
  if (req.nextUrl.searchParams.get('s') !== webhookSecret()) return NextResponse.json({ ok: false }, { status: 403 });
  const bot = await getSetting('bot'); const u = await req.json(); const m = u.message;
  if (bot && m?.text?.startsWith('/start')) {
    await tg(bot.token, 'sendMessage', { chat_id: m.chat.id, text: '🎁 Clevo o‘yiniga xush kelibsiz! Barabanni aylantiring va coin yig‘ing.',
      reply_markup: { inline_keyboard: [[{ text: '🎡 O‘yinni ochish', web_app: { url: req.nextUrl.origin + '/app' } }]] } });
  }
  return NextResponse.json({ ok: true });
}
