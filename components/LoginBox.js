'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { HOSTURL } from 'config'

import Image from 'next/image';
import { Text } from './Vcontrols';

import GoogleIcon from 'public/images/GoogleIcon.png'
import DiscordIcon from 'public/images/DiscordIcon.png'
import LinkedInIcon from 'public/images/LinkedInIcon.png'

import 'styles/modal.css';

const LoginBox = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const supabase = createClientComponentClient();
    const router = useRouter();

    console.log("Login box session:", supabase.auth.session)

    
    
    const sendMagicLink = async () => {
        console.log("signing in with email")
        if (email != "") {
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

    const signIn = async () => {
        console.log("signing in with password")
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        if (error) {
            console.log("login error", { error })
        } else {
            console.log("logging in...", { data });
            router.refresh()
        }
    }

    const keyHandler = (e) => {
        if (e.key === "Enter") signIn();
    }

    return (
        <div className="modal-base">
            <div className="modal-wrapper">
                <div className="modal-border">
                    <div className="modal-container">
                        <div className="modal-header" onClick={() => console.log("click")}>
                            Login to Ensembly
                        </div>
                        <div className="modal-body">
                            <article onKeyDown={keyHandler}>

                                <article>
                                    <Text id="login-email" name="email" label="Email" format="email" extraAction={(a) => setEmail(a)} isRequired />
                                    <Text id="password" name="password" label="Password" format="password" extraAction={(a) => setPassword(a)} isRequired />
                                </article>

                                <section >
                                    <button className="fit centered" onClick={() => signInWithSocial('google')}>
                                        <Image src={GoogleIcon} alt="google-logo" width={25} height={25} />
                                    </button>
                                    <button className="fit centered" onClick={() => signInWithSocial('discord')}>
                                        <Image src={DiscordIcon} alt="discord-logo" width={25} height={25} />
                                    </button>
                                    <button className="fit centered" onClick={() => signInWithSocial('linkedin')}>
                                        <Image src={LinkedInIcon} alt="discord-logo" width={25} height={25} />
                                    </button>
                                </section>
                            </article>
                        </div>
                        <section className="modal-buttons">
                            <button className="fit hero centered" onClick={sendMagicLink} style={{['--edge-color']: "var(--color-h2)"}}><i>forward_to_inbox</i>Email Login</button>
                            <button className="fit hero" onClick={signIn} style={{['--edge-color']: "var(--color-p)"}}>Sign In</button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginBox;