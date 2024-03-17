import 'server-only'

import { redirect } from 'next/navigation'

export default async function SettingsRedirect(context) {
    redirect(`settings/general`);
}