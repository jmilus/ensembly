'use server';

import { createClient } from 'utils/supabase/server'
import { getAllEnsembleTypes } from '@/api/ensembles/types/route';
import { getAllMembershipCapacities } from '@/api/membership/capacity/route';

export async function getEnsembleTypes() {
    return getAllEnsembleTypes();
}

export async function getCapacities() {
    return getAllMembershipCapacities();
}