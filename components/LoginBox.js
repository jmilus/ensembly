import { supabase } from '../lib/supabase-client';
import { HOSTURL } from '../config'

import Image from 'next/image';
import TabControl, { Tab } from '../components/TabControl';
import V from './Vcontrols/VerdantControl';

import GoogleIcon from '../public/images/GoogleIcon.png'
import styles from '../styles/LoginBox.module.css';

const LoginBox = () => {

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

    const sendMagicLink = async (signInData) => {
        const email = signInData["login-data"]?.email
        let returnMessage = "";
        if (email) {
            const { data, error } = await supabase.auth.signInWithOtp({
              email: email,
              options: {
                emailRedirectTo: HOSTURL,
              },
            })
            if (error) {
                console.log("magic link error", {error})
                returnMessage = error.message;
            } else {
                console.log("magic link sent", data)
                returnMessage = `A Magic Link was sent to ${email}`;
            }
        } else {
            returnMessage = "Please enter your Email Address";
        }
        return returnMessage;
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
        let returnMessage = "";
        console.log("sign-in with password:", credentials)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials["login-data"].email,
            password: credentials["login-data"].password
        })
        if (error) {
            console.log("login error", { error })
            returnMessage = error.message;
        } else {
            console.log("logging in...");
            returnMessage = "Logging in...";
        }
        return returnMessage;
    }

    return (
        <div className={styles.signinContainer}>
            <div className={styles.signinBox}>
                <div className={styles.signinHeader}>
                    Login to Ensembly
                </div>
                <div className={styles.signinBody}>
                    <TabControl tabsStyle={{padding: "15px"}} >
                        <Tab id="Social">
                            <article>
                                <button className="fat centered" onClick={() => signInWithGoogle('google')}>
                                    <Image src={GoogleIcon} alt="google-logo" width={25} height={25} />
                                    Sign in With Google
                                </button>

                            </article>

                        </Tab>
                        <Tab id="Magic Link">
                            <V.Form id="login-link" recordId="login-data" altSubmit={sendMagicLink} manual >
                                <article>
                                    <V.Text id="magic-link-email" field="email" label="Email" format="email" isRequired />
                                    <button name="submit" className="fat hero centered" ><i>forward_to_inbox</i>Send Magic Link</button>
                                    <span name="form-message" ></span>
                                </article>
                            </V.Form>
                        </Tab>
                        <Tab id="Password">
                            <V.Form id="login-with-password" recordId="login-data" altSubmit={signInWithPassword} manual >
                                <article>
                                    <V.Text id="login-email" field="email" label="Email" format="email" isRequired />
                                    <V.Text id="password" field="password" label="Password" format="password" isRequired />
                                    <button name="submit" className="fat hero" >Sign In</button>
                                    <span name="form-message" ></span>
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