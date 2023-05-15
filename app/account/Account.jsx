'use client'

import { useState } from 'react';
import { supabase } from '../../lib/supabase-client';

import { Form, Text } from '../../components/Vcontrols/';

import basePageStyles from '../../styles/basePage.module.css';


const Account = (user) => {
    const [message, setMessage] = useState({text: "", class: ""});
    
    
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
            <div className={basePageStyles.actionSection}>

            </div>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <h1>Account</h1>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <article>
                        <fieldset>
                            <legend>Credentials</legend>
                            <Text id="login-email" label="Email" value={user.email} readonly />
                            <Form id="manage-password" altSubmit={changePassword}>
                                <section>
                                    <Text id="new-password" name="new-password" label="New Password" format="password" isRequired>
                                        <Text id="confirm-password" name="confirm-password" label="Confirm Password" format="password" isRequired/>
                                    </Text>
                                </section>
                                <section>
                                    <button type="submit">Submit</button>
                                    <div className={`form-message ${message.class}`}>{message.text}</div>
                                </section>
                            </Form>
                        </fieldset>

                    </article>
                </div>

            </div>
        </div>
    )
}

export default Account;