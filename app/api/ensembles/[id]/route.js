import { createMember } from '@/api/members/route';
import { createMembership } from '@/api/membership/route';
import { createClient } from 'utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { extractFields } from 'utils';

export const getOneEnsemble = async (id) => {
    const supabase = createClient();

    const { data: ensemble, error } = await supabase
        .from('Ensemble')
        .select(`
            *,
            EnsembleMembership ( id, type:membership_type (*), Member (*)),
            Lineup (id, name, is_primary),
            EnsembleType (*)
        `)
        .eq('id', id)
        .neq('EnsembleMembership.status', "Inactive")
        .single()

    if (error) {
        console.error("get ensemble error:", error);
        return new Error(error);
    }

    // console.log("getOneEnsemble:", ensemble);
    return ensemble;
}

// fetch
export async function GET({ params }) {
    const res = await getOneEnsemble(params.id)
    return NextResponse.json({ res })
}

// ###############

export const updateOneEnsemble = async (ensembleData) => {
    const { id, name, type, logoUrl } = ensembleData;
    const supabase = createClient();

    // console.log("update ensemble profile data:", ensembleData)

    const { data: ensemble, error } = await supabase
        .from('Ensemble')
        .update({
            name,
            type,
            logoUrl
        })
        .eq('id', id)
        .select()
        .single()
    
    if (error) {
        console.error("update ensemble error:", error);
        return new Error(error);
    }

    // console.log("update ensemble data:", ensemble)

    return ensemble;
}

// update
export async function PUT(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await updateOneEnsemble({...req, id: params.id})
    return NextResponse.json({ res })
}

// ###############

export const createEnsembleMember = async (props) => {

    let member;
    try {
        member = await createMember(props);
    }
    catch(err) {
        return Error(err.message)
    }

    try {
        const membership = await createMembership({ ...props, member: member.id, ensemble: props.ensembleId, membership_start: props.membership_start, membership_type: props.membership_type })
    }
    catch (err2) {
        return Error(err2.message)
    }
    finally { return member }
    
}

export async function POST(request, { params }) {
    const _req = await request.formData()
    const req = extractFields(_req);
    const res = await createEnsembleMember({ ...req, ensembleId: params.id })
    if (res instanceof Error) return NextResponse.json({ error: res.message }, { status: 400 })
    return NextResponse.json(res)
}