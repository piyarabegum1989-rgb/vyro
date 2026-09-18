import { redirect } from 'next/navigation';

// Keep old /feed links working and send them to the VYRO Facebook-class interface.
export default function Feed() {
  redirect('/vyro-facebook.html');
}
