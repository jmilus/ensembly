import 'server-only';

import { getMemberUser } from '@/api/users/route';

import SecurityWrapper from 'components/SecurityWrapper';
import SubNav from 'components/SubNav';
import { Button } from 'components/Vcontrols';

export default async function MemberProfilePageLayout(context) {
    const memberUser = await getMemberUser({ member: context.params.id });
    
    console.log({memberUser})

    const navNodes = [
        { caption: "Profile", route: `/e/members/${context.params.id}` },
        { caption: "Account", route: `/e/members/${context.params.id}/account` }
    ]

    const navButtons = [
        <Button
            name="create-user"
            caption={<><i>account_circle</i><span>Make User</span></>}
            APIURL="/api/users"
            METHOD="POST"
            payload={{ member: context.params.id }}
            followPath={`/e/members/${context.params.id}/account`}
            buttonClass="fit"
        />
    ]

    return (
        <SecurityWrapper currentModule="members">
            <div id="page-base">
                <div id="nav-header">
                    <SubNav
                        caption="members"
                        root="members"
                        navNodes={memberUser.length > 0 ? navNodes : []}
                        buttons={memberUser.length > 0 ? [] : navButtons}
                    />
                </div>
                <div id="page-frame">
                    {context.children}
                </div>
            </div>
        </SecurityWrapper>
    )
}