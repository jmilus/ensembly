'use server';

import { createClient } from 'utils/supabase/server'
import { getAllEnsembleTypes } from '@/api/ensembles/types/route';

export async function getEnsembleTypes() {
    return getAllEnsembleTypes();
}