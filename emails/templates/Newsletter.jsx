import { emailStyles } from '../styling';
import Image from 'next/image'

import CSC_logo from '../../public/images/CSC_logo.jpeg';

const Newsletter = () => {

    const bgColor = "white";
    const fontColor = "black"
    const brandColor = "hsl(208, 100%, 26%)"
    const headerLogo = "https://ryusyifoziwwxpgvslmj.supabase.co/storage/v1/object/public/Logos/clcp72kzr000ic5ll1ii4xntf/logo.jpeg"

    return (
        <table style={{ width: "100%", height: "100%" }}>
            <tbody>
                <tr>
                    <td style={{
                        textAlign: "-webkit-center",
                        backgroundColor: bgColor,
                        verticalAlign: "top",
                    }}>
                        <table style={{
                            maxWidth: "800px",
                            width: "100%",
                            fontFamily: "'Roboto', sans-serif",
                            color: fontColor
                        }}>
                            <thead>
                                <tr>
                                    <td>
                                        <div id="image-container" style={{position: "relative", width: "100%", height: "150px"}}>
                                            <img src={headerLogo} fill={true} alt="header logo" style={{width: "100%", height: "100%", maxHeight: "200px", objectFit: "contain"}} />
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{textAlign: "-webkit-center", fontSize: "30px", color: brandColor}}>
                                        Newsletter
                                    </td>
                                </tr>
                            </thead>
                            <tbody style={{
                                color: fontColor
                            }}>
                                <tr>
                                    <td>
                                        <h2>Section Header</h2>
                                        This email was sent by the Ensembly App!<br/>Don't get too excited just yet, this isn't remotely user-friendly to do at the moment.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default Newsletter;