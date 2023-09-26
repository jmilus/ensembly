'use client'

import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { HOSTURL } from 'config'

import Image from 'next/image';
import TabControl, { Tab } from 'components/TabControl';
import { Form, Text } from './Vcontrols';

import GoogleIcon from 'public/images/GoogleIcon.png'
import DiscordIcon from 'public/images/DiscordIcon.png'
import LinkedInIcon from 'public/images/LinkedInIcon.png'

import 'styles/modal.css';

const LoginBox = () => {
    const supabase = createClientComponentClient();
    const router = useRouter();

    console.log("session:", supabase.auth.session)


    const sendMagicLink = async (signInData) => {
        const email = signInData.email
        if (email) {
            const { data, error } = await supabase.auth.signInWithOtp({
              email: email,
              options: {
                emailRedirectTo: HOSTURL,
              },
            })
            if (error) {
                console.log("magic link error", {error})
            } else {
                console.log("magic link sent", data)
            }
        
        }
    }

    const signInWithSocial = async (provider) => {
        console.log("signing in with:", provider);
        const googleParams = provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : {};
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                queryParams: googleParams,
                redirectTo: `${HOSTURL}/auth/callback`
            }
        })
        if (error) console.log(`problem signing in with ${provider}`, error);
        console.log("signin data", data)
    }

    const signInWithPassword = async (e) => {
        e.preventDefault()
        const credForm = new FormData(e.target);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: credForm.get('email'),
            password: credForm.get('password'),
        })
        if (error) {
            console.log("login error", { error })
        } else {
            console.log("logging in...", { data });
            router.refresh()
        }
    }

    return (
        <div className="modal-base">
            <div className="modal-wrapper">
                <div className="modal-border">
                    <div className="modal-container">
                        <div className="modal-header">
                            Login to Ensembly
                        </div>
                        <div className="modal-body">
                            <TabControl style={{margin: "0 20px 20px"}}>
                                <Tab id="Social">
                                    <article >
                                        <button className="fat centered" onClick={() => signInWithSocial('google')}>
                                            <Image src={GoogleIcon} alt="google-logo" width={25} height={25} />
                                            <span>Sign in With Google</span>
                                        </button>
                                        <button className="fat centered" onClick={() => signInWithSocial('discord')}>
                                            <Image src={DiscordIcon} alt="discord-logo" width={25} height={25} />
                                            <span>Sign in With Discord</span>
                                        </button>
                                        <button className="fat centered" onClick={() => signInWithSocial('linkedin')}>
                                            <Image src={LinkedInIcon} alt="discord-logo" width={25} height={25} />
                                            <span>Sign in With LinkedIn</span>
                                        </button>
                                    </article>

                                </Tab>
                                <Tab id="Magic Link">
                                    {/* <Form id="login-link" recordId="login-data" onChange={() => setFormMessage({...blankMessage})} altSubmit={(data) => signInHandler(data, "link")} debug >
                                    </Form> */}
                                    <form onSubmit={(e) => sendMagicLink(e)}>

                                        <article>
                                            <Text id="magic-link-email" name="email" label="Email" format="email" isRequired />
                                            <button name="submit" className="fat hero centered" ><i>forward_to_inbox</i>Send Magic Link</button>
                                           
                                        </article>
                                    </form>
                                </Tab>
                                <Tab id="Password">
                                    {/* <Form id="login-with-password" recordId="login-data" onChange={() => setFormMessage({ ...blankMessage })} altSubmit={(data) => signInHandler(data, "password")} >
                                        
                                    </Form> */}
                                    <form onSubmit={(e) => signInWithPassword(e)}>

                                        <article>
                                            <Text id="login-email" name="email" label="Email" format="email" isRequired />
                                            <Text id="password" name="password" label="Password" format="password" isRequired />
                                            <button name="submit" className="fat hero" >Sign In</button>
                                            
                                        </article>
                                    </form>
                                </Tab>
                            </TabControl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginBox;