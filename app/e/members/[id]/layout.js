import 'server-only';

import { getMemberUser } from '@/api/users/route';
import { getMemberEmails } from '@/api/members/[id]/email/route';

import SecurityWrapper from 'components/SecurityWrapper';
import SubNav from 'components/SubNav';
import { Button, Form, Text } from 'components/Vcontrols';
import ModalButton from 'components/ModalButton';

export default async function MemberProfilePageLayout(context) {
    const memberUser = await getMemberUser({ member: context.params.id });
    const memberEmail = await getMemberEmails({ member: context.params.id, type: "Primary" })

    console.log({memberUser}, {memberEmail})

    const navNodes = [
        { caption: "Profile", route: `/e/members/${context.params.id}` }
    ]

    const navButtons = {}

    const isUser = !!memberUser?.member
    const hasEmail = typeof memberEmail?.email === 'string' && memberEmail?.email.length > 0

    console.log({isUser}, {hasEmail})

    if (isUser) {
        navNodes.push({ caption: "Account", route: `/e/members/${context.params.id}/account` })
        navButtons.account = [
            <ModalButton
                key="change-password"
                renderButton="Change Password"
                buttonClass="fit"
                title="Change Password"
            >
                <Form id="change-password-form" APIURL={`/api/users/${memberUser?.user}/account`} debug>
                    <section className="inputs">
                        <Text id="new-password" name="newPassword" label="New Password" format="password" isRequired>
                            <Text id="confirm-password" name="confirmPassword" label="Confirm Password" format="password" isRequired/>
                        </Text>
                    </section>
                </Form>
                <section className="modal-buttons">
                    <button name="submit" className="fit" form="change-password-form">Submit</button>
                </section>
            </ModalButton>
        ]
    }
    

    if (!isUser && hasEmail) {
        navButtons.profile = [
            <Button
                key="make-user"
                name="create-user"
                APIURL="/api/users"
                METHOD="POST"
                payload={{ member: context.params.id }}
                followPath={`/e/members/${context.params.id}/account`}
                buttonClass="fit"
                json
            ><i>account_circle</i><span>Make User</span></Button>
        ]
    }

    return (
        <SecurityWrapper currentModule="members">
            <div id="page-base">
                <div id="page-header">
                    <SubNav
                        caption="members"
                        root="members"
                        navNodes={navNodes}
                        buttons={navButtons}
                    />
                </div>
                <div id="page-frame">
                    {context.children}
                </div>
            </div>
        </SecurityWrapper>
    )
}