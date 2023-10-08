import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { getMemberUserProfile } from '@/api/auth/route';
import { getMemberEmails } from '@/api/members/[id]/email/route';

import { Form, Text, Collection } from 'components/Vcontrols';
import { getSecurityRoles } from '@/api/security/route';

const AccountPage = async (context) => {
    const { params: { id } } = context;
    console.log({ id })

    const supabase = createServerComponentClient({ cookies })

    const userProfile = await getMemberUserProfile(id);
    const allRoles = await getSecurityRoles(true)
    const memberEmail = await getMemberEmails({ member: id, type: "Primary" })
    
    console.log({ userProfile }, { allRoles })

    const changePassword = async (passwordData) => {
        console.log({ passwordData })
        const { data, error } = await supabase.auth.updateUser({
            password: passwordData["new-password"]
        })
        if (error) {
            console.log("there was trouble updating the password:", error);
        } else {
            console.log("success:", data);
        }
    }
    
    // <Form id="manage-password" >
    //     <section>
    //         <Text id="new-password" name="new-password" label="New Password" format="password" isRequired>
    //             <Text id="confirm-password" name="confirm-password" label="Confirm Password" format="password" isRequired/>
    //         </Text>
    //     </section>
    //     <section>
    //         <button type="submit" className="fit">Submit</button>
    //     </section>
    // </Form>

    return (
        <div id="page">
            <article>
                <fieldset className="tall" style={{width: "500px"}}>
                    <legend>Accoutn Details</legend>
                    <Text id="login-email" label="User Email" value={userProfile.email} readonly />
                    <Form id="update-roles-form" APIURL="/api/users" METHOD="PUT" auxData={{ user: userProfile.user }} auto>
                        <Collection id="user-roles" name="roles" label="Roles" value={userProfile.roles} options={allRoles.map(r => r.role_name)} />
                    </Form>
                </fieldset>

            </article>
        </div>
    )
}

export default AccountPage;