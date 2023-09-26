import 'server-only';

import { redirect } from 'next/navigation'

export default async function EnsembleRedirect(context) {
    redirect(`/e/ensembles/${context.params.id}/general`);
}
