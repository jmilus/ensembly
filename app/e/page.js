import { redirect } from 'next/navigation';

export default async function ERedirect(context) {
    redirect(`/e/dashboard`);
}