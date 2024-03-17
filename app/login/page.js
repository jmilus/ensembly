import 'server-only';

import { userLoggedIn, loginWithPassword, loginWithMagicLink, signup } from './actions'

import { Text } from 'components/Vcontrols';

export default async function LoginPage() {
    const isLoggedIn = await userLoggedIn()
    console.log({isLoggedIn})
    if (isLoggedIn) redirect('/e');


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
                                <form id="email-password-form">
                                    <Text id="login-email" name="email" label="Email" format="email" isRequired />
                                    <Text id="password" name="password" label="Password" format="password" />
                                </form>
                            </article>
                        </div>
                        <section className="modal-buttons">
                            <button className="fit hero" form="email-password-form" formAction={loginWithPassword} style={{order: 1000, marginLeft: "10px"}}>Log in</button>
                            <button className="fit" form="email-password-form" formAction={loginWithMagicLink}>Send Magic Link</button>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}