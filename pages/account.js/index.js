import { useState } from 'react';
import { supabase } from '../../lib/supabase-client';
import { useSession, useUser } from '@supabase/auth-helpers-react';

import V from '../../components/Vcontrols/VerdantControl';

import basePageStyles from '../../styles/basePage.module.css';


const AccountPage = () => {
    const [message, setMessage] = useState({text: "", class: ""});
    const user = useUser();
    
    const changePassword = async (passwordData) => {
        console.log({ passwordData })
        const { data, error } = await supabase.auth.updateUser({
            password: passwordData["new-password"]
        })
        if (error) {
            console.log("there was trouble updating the password:", error);
            setMessage({ text: error.message, class: "error" })
        } else {
            console.log("success:", data);
            setMessage({ text: "Password successfully changed", class: "" });
        }
    }

    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <h1>Account</h1>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <article>
                        <fieldset>
                            <legend>Credentials</legend>
                            <V.Text id="login-email" label="Email" value={user.email} readonly />
                            <V.Form id="manage-password" altSubmit={changePassword}>
                                <section>
                                    <V.Text id="new-password" name="new-password" label="New Password" format="password" isRequired>
                                        <V.Text id="confirm-password" name="confirm-password" label="Confirm Password" format="password" isRequired/>
                                    </V.Text>
                                </section>
                                <section>
                                    <button type="submit">Submit</button>
                                    <div className={`form-message ${message.class}`}>{message.text}</div>
                                </section>
                            </V.Form>
                        </fieldset>

                    </article>
                </div>

            </div>
            <div className={basePageStyles.actionSection}>

            </div>
        </div>
    )
}

export default AccountPage;