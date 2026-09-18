import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { neon } from '@neondatabase/serverless';

/*
 * VIRO storage adapter
 * --------------------
 * Production: Neon Postgres (set DATABASE_URL in Vercel)
 * Local development without DATABASE_URL: ./data/*.json
 *
 * The app intentionally keeps its original collection-shaped data while using
 * Postgres JSONB in production. That makes the existing API stable, lets the
 * initial demo data seed automatically, and—unlike local JSON files—persists
 * across Vercel serverless deployments.
 */
const DIR = path.join(process.cwd(), 'data');
const COLLECTIONS = new Set([
  'users', 'posts', 'follows', 'likes', 'comments', 'blocks',
  'sessions', 'notifications', 'conversations', 'messages',
]);

let sqlClient;
let schemaReady;
let seeded = false;
let seedPromise;

function usingNeon() {
  return Boolean(process.env.DATABASE_URL);
}

function sql() {
  if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL);
  return sqlClient;
}

function assertCollection(name) {
  if (!COLLECTIONS.has(name)) throw new Error(`Unknown VIRO collection: ${name}`);
}

function ensureDir() {
  if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });
}

async function ensureSchema() {
  if (!usingNeon()) return;
  if (!schemaReady) {
    schemaReady = sql()`
      CREATE TABLE IF NOT EXISTS vyro_collections (
        name TEXT PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
  }
  await schemaReady;
}

function localRead(name) {
  ensureDir();
  const file = path.join(DIR, `${name}.json`);
  if (!fs.existsSync(file)) return [];
  try {
    const rows = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function localWrite(name, rows) {
  ensureDir();
  fs.writeFileSync(path.join(DIR, `${name}.json`), JSON.stringify(rows, null, 2));
}

async function readRaw(name) {
  assertCollection(name);
  if (!usingNeon()) return localRead(name);
  await ensureSchema();
  const rows = await sql()`SELECT data FROM vyro_collections WHERE name = ${name} LIMIT 1`;
  const value = rows[0]?.data;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

async function writeRaw(name, rows) {
  assertCollection(name);
  const safeRows = Array.isArray(rows) ? rows : [];
  if (!usingNeon()) {
    localWrite(name, safeRows);
    return;
  }
  await ensureSchema();
  await sql()`
    INSERT INTO vyro_collections (name, data, updated_at)
    VALUES (${name}, ${JSON.stringify(safeRows)}::jsonb, NOW())
    ON CONFLICT (name)
    DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
  `;
}

export function hashPassword(password, salt) {
  const nextSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), nextSalt, 64).toString('hex');
  return { salt: nextSalt, hash };
}

export function verifyPassword(password, salt, hash) {
  try {
    const actual = Buffer.from(crypto.scryptSync(String(password), salt, 64).toString('hex'));
    const expected = Buffer.from(String(hash));
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(6).toString('hex')}`;
}

export function extractTags(caption = '') {
  return [...new Set(String(caption).match(/#[\p{L}\p{N}_]+/gu) || [])];
}

function makeSeed() {
  const makeUser = (username, name, email, password, bio, isPrivate = false) => {
    const { salt, hash } = hashPassword(password);
    return {
      id: uid('u'), username, name, email, passHash: hash, salt, bio: bio || '',
      isPrivate, createdAt: new Date().toISOString(),
    };
  };
  // Seed profiles populate an empty development database only. They use
  // unshared random passwords so no public/demo credentials exist.
  const secret = () => crypto.randomBytes(24).toString('hex');
  const demo = makeUser('sami_rahman', 'Sami Rahman', 'sami@viro.local', secret(), 'Graphic designer | Dreamer | Creator');
  const arif = makeUser('rifat', 'Rifat Hasan', 'rifat@viro.local', secret(), 'Cricket, food and Sylhet');
  const nusrat = makeUser('nusrat', 'Nusrat Jahan', 'nusrat@viro.local', secret(), 'Art and aesthetic', true);
  const tanvir = makeUser('tanjim', 'Tanjim Ahmed', 'tanjim@viro.local', secret(), 'Reels creator | Tech and travel');
  const post = (userId, type, mediaUrl, caption, location = '', hoursAgo = 10) => ({
    id: uid('p'), userId, type, mediaUrl, caption, location,
    hashtags: extractTags(caption),
    createdAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
  });
  const posts = [
    post(demo.id, 'post', 'https://picsum.photos/seed/vyro1/800/800', 'Sunset over Ratargul #sunset #sylhet #travel', 'Ratargul, Sylhet', 5),
    post(demo.id, 'reel', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', 'My first VIRO reel! #reels #viro #fun', 'Dhaka', 8),
    post(arif.id, 'post', 'https://picsum.photos/seed/vyrofood/800/800', 'Best kacchi in town? #food #kacchi #dhakaeats', 'Dhaka', 12),
    post(arif.id, 'post', 'https://picsum.photos/seed/cricket22/800/800', 'Match day vibes #cricket #bangladesh', 'Sylhet Stadium', 26),
    post(nusrat.id, 'post', 'https://picsum.photos/seed/art99/800/800', 'New painting #art #aesthetic', 'Home studio', 15),
    post(tanvir.id, 'reel', 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 'Chasing waterfalls #travel #nature #reels', 'Jaflong, Sylhet', 20),
    post(tanvir.id, 'post', 'https://picsum.photos/seed/tech7/800/800', 'Desk setup tour #tech #setup', 'Dhaka', 40),
  ];
  const conversation = { id: uid('cv'), members: [demo.id, arif.id], updatedAt: new Date().toISOString() };
  return {
    users: [demo, arif, nusrat, tanvir],
    posts,
    follows: [
      { followerId: demo.id, followingId: arif.id, status: 'accepted' },
      { followerId: arif.id, followingId: demo.id, status: 'accepted' },
      { followerId: demo.id, followingId: tanvir.id, status: 'accepted' },
      { followerId: tanvir.id, followingId: demo.id, status: 'accepted' },
      { followerId: arif.id, followingId: tanvir.id, status: 'accepted' },
    ],
    likes: [
      { postId: posts[0].id, userId: arif.id },
      { postId: posts[0].id, userId: tanvir.id },
      { postId: posts[2].id, userId: demo.id },
    ],
    comments: [{ id: uid('c'), postId: posts[0].id, userId: arif.id, text: 'Amazing shot!', createdAt: new Date().toISOString() }],
    blocks: [],
    sessions: [],
    notifications: [{ id: uid('n'), userId: demo.id, type: 'like', fromUserId: arif.id, postId: posts[0].id, text: 'liked your post', read: false, createdAt: new Date().toISOString() }],
    conversations: [conversation],
    messages: [{ id: uid('m'), convoId: conversation.id, senderId: arif.id, text: 'Hey! Welcome to VIRO', createdAt: new Date().toISOString() }],
  };
}

async function migrateLegacyPrototypeProfiles(existingUsers) {
  // Older builds shipped predictable prototype credentials. Preserve their posts
  // but make those sample identities non-loginable and present them as VIRO seed profiles.
  const replacements = {
    'demo@vyro.app': ['sami_rahman', 'Sami Rahman', 'sami@viro.local', 'Graphic designer | Dreamer | Creator', false],
    'arif@vyro.app': ['rifat', 'Rifat Hasan', 'rifat@viro.local', 'Cricket, food and Sylhet', false],
    'nusrat@vyro.app': ['nusrat', 'Nusrat Jahan', 'nusrat@viro.local', 'Art and aesthetic', true],
    'tanvir@vyro.app': ['tanjim', 'Tanjim Ahmed', 'tanjim@viro.local', 'Reels creator | Tech and travel', false],
  };
  let changed = false;
  for (const user of existingUsers) {
    const replacement = replacements[String(user.email || '').toLowerCase()];
    if (!replacement) continue;
    const [username, name, email, bio, isPrivate] = replacement;
    const { salt, hash } = hashPassword(crypto.randomBytes(24).toString('hex'));
    Object.assign(user, { username, name, email, bio, isPrivate, salt, passHash: hash, legacyPrototype: true });
    changed = true;
  }
  if (changed) await writeRaw('users', existingUsers);
}

async function seedIfNeeded() {
  if (seeded) return;
  if (!seedPromise) {
    seedPromise = (async () => {
      await ensureSchema();
      const existingUsers = await readRaw('users');
      if (existingUsers.length) {
        await migrateLegacyPrototypeProfiles(existingUsers);
        return;
      }
      const seed = makeSeed();
      await Promise.all(Object.entries(seed).map(([name, rows]) => writeRaw(name, rows)));
    })();
  }
  try {
    await seedPromise;
    seeded = true;
  } catch (error) {
    seedPromise = undefined;
    throw error;
  }
}

export async function table(name) {
  await seedIfNeeded();
  return readRaw(name);
}

export async function save(name, rows) {
  await seedIfNeeded();
  return writeRaw(name, rows);
}

export function databaseMode() {
  return usingNeon() ? 'neon' : 'local-json';
}
