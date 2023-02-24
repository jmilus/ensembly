import { useState } from 'react';

import { supabase } from '../lib/supabase-client';
import { HOSTURL } from '../config'

import Image from 'next/image';
import TabControl, { Tab } from '../components/TabControl';
import V from './Vcontrols/VerdantControl';

import GoogleIcon from '../public/images/GoogleIcon.png'
import styles from '../styles/LoginBox.module.css';

const LoginBox = () => {
    const blankMessage = {message: "", vibe: ""}
    const [formMessage, setFormMessage] = useState({...blankMessage})

    console.log("form message:", formMessage)

    const getURL = () => {
        let url =
          process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
          process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
          HOSTURL;
        // Make sure to include `https://` when not localhost.
        url = url.includes('http') ? url : `https://${url}`;
        // Make sure to including trailing `/`.
        url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;
        return url;
    };

    const redirectURL = getURL();

    const signInHandler = async (data, route) => {
        let message
        switch (route) {
            case "link":
                message = await sendMagicLink(data);
                break;
            case "password":
                message = await signInWithPassword(data);
                break;
            default:
                break;
        }
        if (message) setFormMessage(message);
    }

    const sendMagicLink = async (signInData) => {
        console.log({signInData})
        const email = signInData.email
        let formResponseMessage = "";
        if (email) {
            const { data, error } = await supabase.auth.signInWithOtp({
              email: email,
              options: {
                emailRedirectTo: HOSTURL,
              },
            })
            if (error) {
                console.log("magic link error", {error})
                formResponseMessage = { message: error.message, vibe: "error" };
            } else {
                console.log("magic link sent", data)
                formResponseMessage = {message: `A Magic Link was sent to ${email}`, vibe: ""};
            }
        } else {
            formResponseMessage = { message: "Please enter your Email Address", vibe: "warn" };
        }
        return formResponseMessage;
    }

    const signInWithGoogle = async (provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: HOSTURL
            }
        })
        if (error) console.log("problem signing in with Google:", error);
    }

    const signInWithPassword = async (credentials) => {
        let formResponseMessage = "";
        console.log("sign-in with password:", credentials)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
        })
        if (error) {
            console.log("login error", { error })
            formResponseMessage = { message: error.message, vibe: "error" };
        } else {
            console.log("logging in...");
            formResponseMessage = "Logging in...";
        }
        return formResponseMessage;
    }

    return (
        <div className={styles.signinContainer}>
            <div className={styles.signinBox}>
                <div className={styles.signinHeader}>
                    Login to Ensembly
                </div>
                <div className={styles.signinBody}>
                    <TabControl tabsStyle={{padding: "15px"}} onChange={() => setFormMessage({...blankMessage})}>
                        <Tab id="Social">
                            <article>
                                <button className="fat centered" onClick={() => signInWithGoogle('google')}>
                                    <Image src={GoogleIcon} alt="google-logo" width={25} height={25} />
                                    Sign in With Google
                                </button>

                            </article>

                        </Tab>
                        <Tab id="Magic Link">
                            <V.Form id="login-link" recordId="login-data" onChange={() => setFormMessage({...blankMessage})} altSubmit={(data) => signInHandler(data, "link")} debug >
                                <article>
                                    <V.Text id="magic-link-email" name="email" label="Email" format="email" isRequired />
                                    <button name="submit" className="fat hero centered" ><i>forward_to_inbox</i>Send Magic Link</button>
                                    <span className={`form-message ${formMessage.vibe}`} >{formMessage.message}</span>
                                </article>
                            </V.Form>
                        </Tab>
                        <Tab id="Password">
                            <V.Form id="login-with-password" recordId="login-data" onChange={() => setFormMessage({...blankMessage})} altSubmit={(data) => signInHandler(data, "password")} >
                                <article>
                                    <V.Text id="login-email" name="email" label="Email" format="email" isRequired />
                                    <V.Text id="password" name="password" label="Password" format="password" isRequired />
                                    <button name="submit" className="fat hero" >Sign In</button>
                                    <span className={`form-message ${formMessage.vibe}`} >{formMessage.message}</span>
                                </article>
                            </V.Form>
                        </Tab>
                    </TabControl>
                    
                </div>
            </div>
        </div>
    )
}

export default LoginBox;