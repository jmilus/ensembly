import 'server-only';

import 'styles/globals.css'
import 'styles/layout.css';
import 'styles/modal.css';
import 'components/Vcontrols/Vstyling.css';
import StatusBlipContext from 'components/BlipContext';

import StatusBlip from 'components/StatusBlip';

export const revalidate = 0;

const RootLayout = async ({children}) => {
    
    return (
        <html lang="en">
            <body>
                <StatusBlipContext>
                    <StatusBlip />
                    {children}
                </StatusBlipContext>
            </body>
        </html>
    );
}
  
export default RootLayout;