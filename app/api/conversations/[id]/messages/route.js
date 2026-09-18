import { NextResponse } from 'next/server';
import { table, save, uid } from '@/lib/db';
import { sessionUser, publicUser, blockedEither, notify } from '@/lib/auth';

export async function GET(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const [conversations, users, allMessages] = await Promise.all([table('conversations'), table('users'), table('messages')]);
  const conversation = conversations.find(item => item.id === params.id);
  if (!conversation || !conversation.members.includes(session.user.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const peerId = conversation.members.find(member => member !== session.user.id);
  const peer = users.find(user => user.id === peerId);
  const messages = allMessages.filter(message => message.convoId === conversation.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  return NextResponse.json({ peer: publicUser(peer), messages, blocked: await blockedEither(session.user.id, peerId) });
}

export async function POST(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const conversations = await table('conversations');
  const conversation = conversations.find(item => item.id === params.id);
  if (!conversation || !conversation.members.includes(session.user.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const peerId = conversation.members.find(member => member !== session.user.id);
  if (await blockedEither(session.user.id, peerId)) return NextResponse.json({ error: 'Message পাঠানো যাবে না (blocked)' }, { status: 403 });
  const { text } = await req.json();
  if (!text || !String(text).trim()) return NextResponse.json({ error: 'মেসেজ লেখো' }, { status: 400 });
  const message = { id: uid('m'), convoId: conversation.id, senderId: session.user.id, text: String(text).slice(0, 1000), createdAt: new Date().toISOString() };
  const messages = await table('messages');
  messages.push(message);
  conversation.updatedAt = new Date().toISOString();
  await Promise.all([save('messages', messages), save('conversations', conversations)]);
  await notify(peerId, { type: 'message', fromUserId: session.user.id, text: 'sent you a message' });
  return NextResponse.json({ message });
}
