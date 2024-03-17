import 'server-only';

export default async function SignupSuccess() {
    return (
        <div style={{ display: "flex", width: "100%", height: "100%" }}>
            <div style={{ width: "500px", padding: "40px", margin: "auto", background: "var(--gray1)", border: "1px solid var(--gray5)", borderRadius: "10px", ['--edge-color']: "var(--color-h3)" }}>
                Success! Your account has been created. Please check your inbox for a verification email. It will contain a link to login.
            </div>
        </div>
    )
}