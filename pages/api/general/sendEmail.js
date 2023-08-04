// import sendMail from '../../../emails';
import { renderToStaticMarkup } from 'react-dom/server';
import Newsletter from '../../../emails/templates/Newsletter';

var postmark = require("postmark");

var client = new postmark.ServerClient(process.env.POSTMARK_TOKEN);


const sendIt = async (email) => {
    const textHTML = `<div>${renderToStaticMarkup(<Newsletter />)}</div>`
    console.log(textHTML)
    const { subject, to, cc, bcc } = email;
    const result = await client.sendEmail({
        "From": "hello@ensembly.app",
        "To": to,
        "Cc": cc,
        "Bcc": bcc,
        "Subject": subject,
        "HtmlBody": textHTML,
        "TextBody": "test successful?",
        "MessageStream": "ensembly-announcements"
    });
    console.log({result})
    return result
}



const sendEmail = async (req, res) => {
    console.log("trying to send an email...");
    let response = [];
    try {
        response = await sendIt(req.body);
        res.status(200);
        res.json(response);
    }
    catch (err) {
        console.error({ err });
        res.status(500);
        res.json({ message: 'crap!', err });
    }
}

export default sendEmail;