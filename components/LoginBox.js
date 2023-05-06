'use client'

import { useState } from 'react';

import { supabase } from '../lib/supabase-client';
import { HOSTURL } from '../config'

import Image from 'next/image';
import TabControl, { Tab } from '../components/TabControl';
import { Form, Text } from './Vcontrols';

import GoogleIcon from '../public/images/GoogleIcon.png'
import DiscordIcon from '../public/images/DiscordIcon.png'
import LinkedInIcon from '../public/images/LinkedInIcon.png'

import '../styles/modal.css';

const LoginBox = () => {
    const blankMessage = {message: "", vibe: ""}
    const [formMessage, setFormMessage] = useState({ ...blankMessage })

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

    const signInWithSocial = async (provider) => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: HOSTURL
            }
        })
        if (error) console.log(`problem signing in with ${provider}`, error);
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
        <div className="modal-base">
            <div className="modal-wrapper">
                <div className="modal-border">
                    <div className="modal-container">
                        <div className="modal-header">
                            Login to Ensembly
                        </div>
                        <div className="modal-body">
                            <TabControl tabsStyle={{padding: "15px"}} onChange={() => setFormMessage({...blankMessage})}>
                                <Tab id="Social">
                                    <article>
                                        <button className="fat centered" onClick={() => signInWithSocial('google')}>
                                            <Image src={GoogleIcon} alt="google-logo" width={25} height={25} />
                                            Sign in With Google
                                        </button>
                                        <button className="fat centered" onClick={() => signInWithSocial('discord')}>
                                            <Image src={DiscordIcon} alt="discord-logo" width={25} height={25} />
                                            Sign in With Discord
                                        </button>
                                        <button className="fat centered" onClick={() => signInWithSocial('linkedin')}>
                                            <Image src={LinkedInIcon} alt="discord-logo" width={25} height={25} />
                                            Sign in With LinkedIn
                                        </button>
                                    </article>

                                </Tab>
                                <Tab id="Magic Link">
                                    <Form id="login-link" recordId="login-data" onChange={() => setFormMessage({...blankMessage})} altSubmit={(data) => signInHandler(data, "link")} debug >
                                        <article>
                                            <Text id="magic-link-email" name="email" label="Email" format="email" isRequired />
                                            <button name="submit" className="fat hero centered" ><i>forward_to_inbox</i>Send Magic Link</button>
                                            <span className={`form-message ${formMessage.vibe}`} >{formMessage.message}</span>
                                        </article>
                                    </Form>
                                </Tab>
                                <Tab id="Password">
                                    <Form id="login-with-password" recordId="login-data" onChange={() => setFormMessage({...blankMessage})} altSubmit={(data) => signInHandler(data, "password")} >
                                        <article>
                                            <Text id="login-email" name="email" label="Email" format="email" isRequired />
                                            <Text id="password" name="password" label="Password" format="password" isRequired />
                                            <button name="submit" className="fat hero" >Sign In</button>
                                            <span className={`form-message ${formMessage.vibe}`} >{formMessage.message}</span>
                                        </article>
                                    </Form>
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