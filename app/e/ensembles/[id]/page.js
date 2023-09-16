import 'server-only';

import { redirect } from 'next/navigation'

export default async function EnsembleRedirect(context) {
    redirect(`/ensembles/${context.params.id}/general`);
}
