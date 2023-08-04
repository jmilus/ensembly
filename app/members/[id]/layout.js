import 'server-only';

import { getOneMember } from '../../api/members/[id]/route';

import { MemberProfileNav } from '../MembersHelpers';

const MemberLayout = async (context) => {
    const member = await getOneMember(context.params.id)

    return (
        <div className="page-base">
            <div className="action-section">
                <MemberProfileNav member={member} />
            </div>
            <div className="form-section">
                {context.children}
                {context.modal}
            </div>
        </div>
    )
}

export default MemberLayout;