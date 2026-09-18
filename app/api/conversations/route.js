import { NextResponse } from 'next/server';
import { table, save, uid } from '@/lib/db';
import { sessionUser, publicUser, blockedEither } from '@/lib/auth';

export async function GET() {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const [users, messages, allConversations] = await Promise.all([table('users'), table('messages'), table('conversations')]);
  const mine = allConversations.filter(conversation => conversation.members.includes(session.user.id)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const conversations = (await Promise.all(mine.map(async conversation => {
    const peerId = conversation.members.find(member => member !== session.user.id);
    const peer = users.find(user => user.id === peerId);
    const last = messages.filter(message => message.convoId === conversation.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
    const unread = messages.filter(message => message.convoId === conversation.id && message.senderId !== session.user.id && !message.readAt).length;
    return { id: conversation.id, peer: publicUser(peer), last, unread, blocked: await blockedEither(session.user.id, peerId) };
  }))).filter(conversation => conversation.peer);
  return NextResponse.json({ conversations });
}

export async function POST(req) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const { username } = await req.json();
  const users = await table('users');
  const target = users.find(user => user.username === String(username || '').toLowerCase());
  if (!target || target.id === session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (await blockedEither(session.user.id, target.id)) return NextResponse.json({ error: 'Message পাঠানো যাবে না (blocked)' }, { status: 403 });
  const conversations = await table('conversations');
  let conversation = conversations.find(item => item.members.includes(session.user.id) && item.members.includes(target.id));
  if (!conversation) {
    conversation = { id: uid('cv'), members: [session.user.id, target.id], updatedAt: new Date().toISOString() };
    conversations.push(conversation);
    await save('conversations', conversations);
  }
  return NextResponse.json({ conversation: { id: conversation.id, peer: publicUser(target) } });
}
