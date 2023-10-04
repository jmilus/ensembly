import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { getProfile } from '@/api/auth/[id]/route';
import { getOneEmail } from '@/api/emails/route';

import { MakeUserButton } from '../../MembersHelpers';
import { Form, Text } from 'components/Vcontrols';

const AccountPage = async (context) => {
    const { params: { id } } = context;
    console.log({ id })

    const supabase = createServerComponentClient({ cookies })

    const { user } = await getProfile({ member: id });
    const memberEmail = await getOneEmail({member: id, type: "Primary"})

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

    if (user.length === 0) return (
        <article>
            <MakeUserButton member={{email: memberEmail}} />
        </article>
    )

    return (
        <div id="page">
            <article>
                <fieldset>
                    <legend>Credentials</legend>
                    <Text id="login-email" label="Email" value={user.email} readonly />
                    <Form id="manage-password" >
                        <section>
                            <Text id="new-password" name="new-password" label="New Password" format="password" isRequired>
                                <Text id="confirm-password" name="confirm-password" label="Confirm Password" format="password" isRequired/>
                            </Text>
                        </section>
                        <section>
                            <button type="submit">Submit</button>
                        </section>
                    </Form>
                </fieldset>

            </article>
        </div>
    )
}

export default AccountPage;