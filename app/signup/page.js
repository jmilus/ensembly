import 'server-only';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Form, Text } from 'components/Vcontrols';

const Signup = async () => {
    const supabase = createServerComponentClient({ cookies });
    const { data: { session }, error } = await supabase.auth.getSession()

    if (session) redirect(`/e/dashboard`);

    return (
        <div style={{ display: "flex", width: "100%", height: "100%" }}>
            <div style={{ width: "500px", padding: "40px", margin: "auto", background: "var(--gray1)", border: "1px solid var(--gray5)", borderRadius: "10px", ['--edge-color']: "var(--color-h3)" }}>
                <Form id="singup-form" APIURL="/api/auth" METHOD="POST" followPath="/signup/success">
                    <article>
                        <Text id="org-name" name="orgName" label="Organization Name" isRequired />
                        <Text id="first-name" name="firstName" label="First Name" isRequired />
                        <Text id="last-name" name="lastName" label="Last Name" isRequired />
                        <Text id="email" name="email" label="Email Address" format="email" isRequired />
                        <Text id="signup-code" name="code" label="Code" isRequired />
                    </article>
                    <section>
                        <button className="fit" name="submit">Submit</button>
                    </section>
                </Form>
            </div>
        </div>
    )
}

export default Signup;