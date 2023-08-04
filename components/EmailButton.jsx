// import sendMail from '../emails';

const testEmail = async (email) => {
    console.log({ email })
    const { to, cc, bcc, subject, text, stream } = email;
    const emailResult = fetch('/api/general/sendEmail', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email)
    })
        .then(response => response.json())
        .then(res => {
            console.log({ res })
            return res;
        })
        .catch((err, message) => {
            console.error("email failed", message);
            return err;
        })
    return emailResult;
    
}

const EmailButton = ({message, icon="mail", caption="Send"}) => {
    const { to, subject, text, stream } = message;
    return <button onClick={() => testEmail(message)}><i>{icon}</i><span>{caption}</span></button>
}

export default EmailButton;