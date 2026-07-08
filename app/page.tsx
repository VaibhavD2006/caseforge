import { redirect } from 'next/navigation'

export default function Home() {
  // Landing / marketing page is implemented in a later task.
  // For now, route users toward sign-in.
  redirect('/sign-in')
}
