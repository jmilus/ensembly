import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import LoginBox from 'components/LoginBox';


// const Login = async () => {
//     const supabase = createServerComponentClient({ cookies });
//     const { data: { session }, error } = await supabase.auth.getSession()

//     if (session) redirect(`/e/dashboard`);
//     return <LoginBox />;
// }

// export default Login;

import { login, signup } from './actions'

import { Form, Text } from 'components/Vcontrols';

export default function LoginPage() {
    return (
        <div className="modal-base">
            <div className="modal-wrapper">
                <div className="modal-border">
                    <div className="modal-container">
                        <div className="modal-header">
                            Login to Ensembly
                        </div>
                        <div className="modal-body">
                            <article>
                            <form>
                                <label htmlFor="email">Email:</label>
                                <input id="email" name="email" type="email" required />
                                <label htmlFor="password">Password:</label>
                                <input id="password" name="password" type="password" required />
                                <button formAction={login}>Log in</button>
                                {/* <button formAction={signup}>Sign up</button> */}
                            </form>

                                {/* <section style={{ justifyContent: "center", padding: "10px" }} className="inputs">
                                    <Image src={GoogleIcon} alt="google-logo" width={25} height={25} onClick={() => signInWithSocial('google')} />
                                    <Image src={DiscordIcon} alt="discord-logo" width={25} height={25} onClick={() => signInWithSocial('discord')}/>
                                    <Image src={LinkedInIcon} alt="discord-logo" width={25} height={25} onClick={() => signInWithSocial('linkedin')}/>
                                    
                                </section>
                                
                                <section style={{justifyContent: "center", padding: "10px"}} >
                                    <Link href="/signup" className="link-text">Create your Account</Link>
                                </section> */}
                            </article>
                        </div>
                        {/* <section className="modal-buttons">
                            <button className="fit" onClick={setMyPassword}>Fix Password</button>
                            <button className="fit hero" onClick={sendMagicLink} style={{['--edge-color']: "var(--color-h2)"}}><i>forward_to_inbox</i><span>Email Login</span></button>
                            <button className="fit hero" name="submit" form="signin-with-password-form" style={{['--edge-color']: "var(--color-p)"}}>Sign In</button>
                        </section> */}
                    </div>
                </div>
            </div>
        </div>
    )
}