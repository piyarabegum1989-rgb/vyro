import { cookies } from 'next/headers';
import { table, save, uid } from './db';

export async function sessionUser() {
  try {
    const cookie = cookies().get('vyro_session');
    if (!cookie) return null;
    const [sessions, users] = await Promise.all([table('sessions'), table('users')]);
    const session = sessions.find(item => item.token === cookie.value);
    if (!session) return null;
    const user = users.find(item => item.id === session.userId);
    return user && !user.suspended ? { user, token: session.token } : null;
  } catch {
    return null;
  }
}

export function isAdmin(user) {
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return Boolean(adminEmail && user?.email && String(user.email).toLowerCase() === adminEmail);
}

export function publicUser(user) {
  if (!user) return null;
  const { passHash, salt, ...safeUser } = user;
  return { ...safeUser, isAdmin: isAdmin(user) };
}

export async function blockedEither(aId, bId) {
  if (!aId || !bId) return false;
  const blocks = await table('blocks');
  return blocks.some(block =>
    (block.blockerId === aId && block.blockedId === bId) ||
    (block.blockerId === bId && block.blockedId === aId));
}

export async function followStatus(meId, otherId) {
  if (!meId || !otherId) return 'none';
  const follows = await table('follows');
  const follow = follows.find(item => item.followerId === meId && item.followingId === otherId);
  return follow ? follow.status : 'none';
}

export async function canView(viewer, target) {
  if (!target) return false;
  if (!target.isPrivate) return true;
  if (viewer?.id === target.id) return true;
  return Boolean(viewer && (await followStatus(viewer.id, target.id)) === 'accepted');
}

export async function notify(userId, notification) {
  if (!userId || notification.fromUserId === userId) return;
  const all = await table('notifications');
  all.push({
    id: uid('n'), userId, read: false, createdAt: new Date().toISOString(),
    postId: null, ...notification,
  });
  await save('notifications', all);
}

export async function enrichPost(post, me) {
  const [users, likes, comments] = await Promise.all([table('users'), table('likes'), table('comments')]);
  const postLikes = likes.filter(item => item.postId === post.id);
  const kinds = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
  const reactions = Object.fromEntries(kinds.map(kind => [kind, postLikes.filter(item => (item.reaction || 'like') === kind).length]));
  const mine = me ? postLikes.find(item => item.userId === me.id) : null;
  return {
    ...post,
    audience: post.audience || 'public',
    author: publicUser(users.find(item => item.id === post.userId)),
    likes: postLikes.length,
    liked: Boolean(mine),
    myReaction: mine?.reaction || (mine ? 'like' : null),
    reactions,
    comments: comments.filter(item => item.postId === post.id).length,
  };
}
