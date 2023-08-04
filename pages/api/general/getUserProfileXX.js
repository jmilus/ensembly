import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const loadUserProfile = async (id) => {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession()

    const userId = id ? id : session?.user?.id;

    if (!userId) return {}

    // console.log("fetching permissions for user:", userId)
    
    const { data: Profile, error } = await supabase
        .from('Profile')
        .select(`
            Member ( * ),
            role (
                permissions,
                role
            )
        `)
        .eq('user', userId )
    
    // if (error) console.log("Fetch User Profile error:", error)

    return {
        member: Profile[0].Member,
        role: Profile[0].role.role,
        permissions: Profile[0].role.permissions
    }
    
}


const getUserProfile = async (req, res) => {
    let response = [];
    try {
        response = await loadUserProfile(req.body.email);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default getUserProfile;

//  permissions structure:
//      modules (main menu pathways) - explicitly permitted -- must be included in permissions, otherwise hidden
//          list (pertaining to all records returned from a "get many" fetch)
//          record (pertaining to a specific record returned from a "get one" fetch)
//          sub-module () - implicitly permitted until "sub-module" invoked in permissions, then each must be explicitly permitted
//          elements (individual DOM elements identified by id) - array - elements are implicitly permitted unless specifically indicated otherwise.
//                  will inherit parent module/sub-module's mode unless indicated otherwise here.
//
//      linkedIds (list of objects of ids and their respecive permission)
//
//      [modes] - assigned to modules, sub-modules, lists, records, or elements. Indicates permission value
//          "all" (all permissions granted top-down, dead-end in tree)
//          "hide" (explicitly hides an implicit node)
//          "read" (can view items but not edit, delete or create)
//          "edit" (can edit record, read is implicit)
//          "create" (can create new records, read is implicit)
//          "delete" (can delete record(s), edit and read are implicit)
//          "linked" (inicates speciic permissions to be applied to explicitly listed records by id in "linkedIds" array.)
//          "__field-name" (extension of "linked", indicates the name of a field in current record to be matched to an id in "linkedIds" array,
//              as opposed to the current recordId)