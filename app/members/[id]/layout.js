import 'server-only';

import { createClient } from '../../../utils/supabase-server';
import { loadUserPermissions } from '../../../pages/api/general/getUserPermissions';
import { fetchOneMember } from '../../../pages/api/members/getOneMember';

import { MemberProfileNav } from '../MembersHelpers';

const MemberLayout = async (context) => {

    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession()
    
    const authorization = await loadUserPermissions(session.user.email)
    const { permissions: { security } } = authorization;
    
    if (security.modules.members) {
        const member = await fetchOneMember(context.params.id)

        return (
            <div className="page-base">
                <div className="action-section">
                    <MemberProfileNav member={member} />
                </div>
                <div className="form-section">
                    <div className="page-details">
                        {context.children}
                    </div>
                </div>
            </div>
        )
    } else {
        throw new Error("You do not have permissions to access this module.");
    }
}

export default MemberLayout;