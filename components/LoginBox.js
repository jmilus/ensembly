'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from 'utils/supabase/client';
import useStatus from 'hooks/useStatus';

import { HOSTURL } from 'config'

import Image from 'next/image';
import { Form, Text } from './Vcontrols';

import GoogleIcon from 'public/images/GoogleIcon.png'
import DiscordIcon from 'public/images/DiscordIcon.png'
import LinkedInIcon from 'public/images/LinkedInIcon.png'
import { validateEmail } from 'utils/index';

import 'styles/modal.css';
import Link from 'next/link';

const LoginBox = () => {
    const [linkEmail, setLinkEmail] = useState("")
    const supabase = createClient();
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
    const authSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    const router = useRouter();
    const status = useStatus();
    
    const sendMagicLink = async () => {
        console.log(validateEmail(linkEmail), linkEmail)
        if (validateEmail(linkEmail)) {
            console.log("signing in with email", linkEmail)
            const { data, error } = await supabase.auth.signInWithOtp({
              email: linkEmail,
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

    const signInWithPassword = async (formData) => {
        const email = formData.get('email')
        const password = formData.get('password')

        if(email && password) status.saving("Logging In...")
        

        const { data: result, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })
        if (error) {
            console.log("login error", { error })
            status.error({caption: "That Login/Password is Incorrect."})
        } else {
            console.log("logging in...", { result });
            status.saved({ caption: "Welcome!" })
            router.refresh()
        }
    }

    const setMyPassword = async () => {
        const { data: passwordResult, error: passwordError } = await authSupabase.auth.admin.updateUserById(
            '686b092f-1c43-4f57-a6d3-e78338f290ba',
            { password: 'icardius' }
          )
        
        console.log({ passwordResult }, { passwordError })
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
                            <article>

                                <Form id="signin-with-password-form" altSubmit={signInWithPassword} style={{ marginBottom: "20px" }} debug>
                                    <Text id="login-email" name="email" label="Email" format="email" extraAction={setLinkEmail} isRequired />
                                    <Text id="password" name="password" label="Password" format="password" isRequired/>
                                </Form>

                                <section style={{ justifyContent: "center", padding: "10px" }} className="inputs">
                                    <Image src={GoogleIcon} alt="google-logo" width={25} height={25} onClick={() => signInWithSocial('google')} />
                                    <Image src={DiscordIcon} alt="discord-logo" width={25} height={25} onClick={() => signInWithSocial('discord')}/>
                                    <Image src={LinkedInIcon} alt="discord-logo" width={25} height={25} onClick={() => signInWithSocial('linkedin')}/>
                                    
                                </section>
                                
                                <section style={{justifyContent: "center", padding: "10px"}} >
                                    <Link href="/signup" className="link-text">Create your Account</Link>
                                </section>
                            </article>
                        </div>
                        <section className="modal-buttons">
                            <button className="fit" onClick={setMyPassword}>Fix Password</button>
                            <button className="fit hero" onClick={sendMagicLink} style={{['--edge-color']: "var(--color-h2)"}}><i>forward_to_inbox</i><span>Email Login</span></button>
                            <button className="fit hero" name="submit" form="signin-with-password-form" style={{['--edge-color']: "var(--color-p)"}}>Sign In</button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginBox;