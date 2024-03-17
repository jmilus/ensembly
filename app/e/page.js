import { redirect } from 'next/navigation';

export default async function ERedirect(context) {
    // console.log({ context })
    redirect(`/e/dashboard`);
}