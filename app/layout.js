import 'server-only';

import 'styles/globals.css'
import 'styles/layout.css';
import 'styles/modal.css';
import 'components/Vcontrols/Vstyling.css';

export const revalidate = 0;

const RootLayout = async ({children}) => {
    
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
  
export default RootLayout;