import { NextResponse } from 'next/server';

const RULES = [
  { k: ['travel', 'trip', 'tour', 'beach', 'sea', 'cox', 'sylhet', 'saint martin', 'bandarban', 'ভ্রমণ', 'ঘুর', 'সমুদ্র', 'পাহাড়', 'ঝরনা', 'waterfall', 'hike'], t: ['#travel', '#wanderlust', '#bangladesh', '#nature'] },
  { k: ['food', 'eat', 'kacchi', 'biryani', 'burger', 'pizza', 'restaurant', 'cafe', 'tea', 'খাবার', 'কাচ্চি', 'রেস্টুরেন্ট'], t: ['#food', '#foodie', '#dhakaeats', '#yum'] },
  { k: ['cricket', 'football', 'match', 'game', 'goal', 'wicket', 'খেলা', 'ম্যাচ', 'ক্রিকেট', 'ফুটবল'], t: ['#cricket', '#sports', '#bangladesh', '#matchday'] },
  { k: ['tech', 'code', 'coding', 'setup', 'laptop', 'phone', 'app', 'developer', 'programming'], t: ['#tech', '#setup', '#coding', '#developer'] },
  { k: ['fashion', 'style', 'ootd', 'dress', 'saree', 'শাড়ি', 'পাঞ্জাবি', 'outfit', 'makeup'], t: ['#fashion', '#style', '#ootd', '#desilook'] },
  { k: ['music', 'song', 'sing', 'guitar', 'গান', 'মিউজিক'], t: ['#music', '#vibes', '#song'] },
  { k: ['art', 'paint', 'draw', 'sketch', 'আঁকা', 'ছবি আঁক'], t: ['#art', '#aesthetic', '#creative'] },
  { k: ['reel', 'video', 'dance', 'নাচ', 'ভিডিও'], t: ['#reels', '#viral', '#fyp'] },
  { k: ['wedding', 'marriage', 'love', 'bride', 'বিয়ে', 'ভালোবাসা'], t: ['#love', '#wedding', '#couplegoals'] },
  { k: ['sunset', 'sunrise', 'rain', 'sky', 'cloud', 'flower', 'বৃষ্টি', 'সূর্য', 'আকাশ', 'ফুল', 'photo', 'photography'], t: ['#sunset', '#nature', '#photography'] },
  { k: ['gym', 'fitness', 'workout', 'run', 'yoga', 'জিম'], t: ['#fitness', '#gym', '#health'] },
  { k: ['study', 'exam', 'book', 'school', 'college', 'university', 'পড়া', 'বই', 'পরীক্ষা'], t: ['#study', '#studentlife', '#books'] },
  { k: ['eid', 'puja', 'celebrat', 'birthday', 'party', 'ঈদ', 'জন্মদিন'], t: ['#celebration', '#festival', '#party'] },
];

const CITIES = [
  ['dhaka', '#dhaka'], ['sylhet', '#sylhet'], ["cox", "#coxsbazar"], ['chittagong', '#chittagong'],
  ['chattogram', '#chattogram'], ['khulna', '#khulna'], ['rajshahi', '#rajshahi'], ['barishal', '#barishal'], ['rangpur', '#rangpur'],
];

export async function POST(req) {
  const { caption = '', location = '' } = await req.json().catch(() => ({}));
  const text = `${caption} ${location}`.toLowerCase();
  const out = [];
  const push = (t) => { if (!out.includes(t)) out.push(t); };
  RULES.forEach(r => { if (r.k.some(k => text.includes(k))) r.t.forEach(push); });
  CITIES.forEach(([city, tag]) => { if (text.includes(city)) push(tag); });
  push('#vyro');
  if (out.length < 4) ['#trending', '#viral', '#explore'].forEach(push);
  return NextResponse.json({ suggestions: out.slice(0, 10), beta: true });
}
