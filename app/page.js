import { redirect } from 'next/navigation';

// The public VYRO experience is the Facebook-class V3 social interface.
export default function Home() {
  redirect('/vyro-facebook.html');
}
