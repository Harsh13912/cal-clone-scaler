import { redirect } from 'next/navigation';

export default function RootPage() {
  // This automatically sends anyone who lands on your homepage 
  // straight to your event types dashboard.
  redirect('/dashboard/event-types');
}
