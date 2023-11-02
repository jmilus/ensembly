import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { getMemberUserProfile } from '@/api/auth/route';
import { getMemberEmails } from '@/api/members/[id]/email/route';

import ModalButton from 'components/ModalButton';
import { Form, Text, Collection } from 'components/Vcontrols';
import { getSecurityRoles } from '@/api/security/route';

const AccountPage = async (context) => {
    const { params: { id } } = context;
    console.log({ id })

    const supabase = createServerComponentClient({ cookies })

    const userProfile = await getMemberUserProfile(id);
    const allRoles = await getSecurityRoles(true)
    const memberEmail = await getMemberEmails({ member: id, type: "Primary" })

    // const userProfile = {email: "nothing", roles: ["hello"]}
    
    
    console.log({userProfile})

    return (
        <div id="page">
            <article>
                <fieldset className="tall" style={{width: "500px"}}>
                    <legend>Account Details</legend>
                    <Form id="update-roles-form" APIURL={`/api/users/${userProfile.user}/profile`} auto>
                        <Text id="login-email" label="User Email" value={userProfile.email} readonly />
                        <Collection id="user-roles" name="roles" label="Roles" value={userProfile.roles} options={allRoles.map(r => r.role_name)} />
                    </Form>
                </fieldset>

            </article>
        </div>
    )
}

export default AccountPage;