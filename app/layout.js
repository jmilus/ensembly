import 'server-only';

import { createClient } from '../utils/supabase-server';
import SupabaseListener from '../components/supabase-listener'
import SupabaseProvider from '../components/supabase-provider'

import Nav from '../components/Nav';
import StatusBlip from '../components/StatusBlip';
import Modal from '../components/Modal';
import DropDownMenu from '../components/DropDownMenu';
import ContextFrame from '../components/ContextFrame';
import LoginBox from '../components/LoginBox';

import '../styles/globals.css';
import '../styles/layout.css';

export const revalidate = 0;

const RootLayout = async ({ children }) => {
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // console.log("layout session:", session)
    
    return (
        <html lang="en">
            <body>
                <SupabaseProvider>
                    <SupabaseListener serverAccessToken={session?.access_token} />
                    <ContextFrame>
                        {!session
                            ? <LoginBox />
                            : <div id="app-body">
                                <StatusBlip />
                                <DropDownMenu />
                                <Modal />
                                <Nav session={session} />
                                {children}
                            </div>
                        }
                    </ContextFrame>
                </SupabaseProvider>
            </body>
        </html>
    );
}
  
export default RootLayout;


//http://localhost:3000/#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNjgwMDU1NzQ1LCJzdWIiOiIwZWU0N2YzNi00OGE1LTRmZWItOGUzOS00ODc3YTA2OGU3YTUiLCJlbWFpbCI6InJlZHJvb3N0ZXI5QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZ29vZ2xlIiwicHJvdmlkZXJzIjpbImRpc2NvcmQiLCJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FHTm15eFlFTTJlZWN5MTZVWDhVWGgyY1JIQUttZHFEQWtXVTFSVV90X01BVFE9czk2LWMiLCJlbWFpbCI6InJlZHJvb3N0ZXI5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJKb3NodWEgTWlsdXMiLCJpc3MiOiJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS91c2VyaW5mby92Mi9tZSIsIm5hbWUiOiJKb3NodWEgTWlsdXMiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUdObXl4WUVNMmVlY3kxNlVYOFVYaDJjUkhBS21kcURBa1dVMVJVX3RfTUFUUT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTAwMDc0MDc1MTkzODIzOTU4MTI3Iiwic3ViIjoiMTAwMDc0MDc1MTkzODIzOTU4MTI3In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib2F1dGgiLCJ0aW1lc3RhbXAiOjE2ODAwNTIxNDV9XSwic2Vzc2lvbl9pZCI6IjZmYTI5MmFiLWRiZjQtNDllMC04NGRmLWU2ZjI1OTNlNDI3MSJ9.77ugc4-JrIT-t35LkJebBp4DMZ1UGYBREIHy9C-0aiY&expires_in=3600&provider_token=ya29.a0Ael9sCNVo86-EefhXxF_nls1cCP-_4H_OmHQW8c2a1pmBi1J54hqw8ZSjfrIU-8OUaEb4SXrZ091MxNUD_UFWXNTWeKcBg-RqJJWwlRk7RaQrCOIQfcLDXanxdESMzLJapLl1JLaOE6CZSsGzAlnI7Mno8m_Iy0aCgYKASkSARISFQF4udJh5hJghs7tQzS9zCM-7S3rAg0166&refresh_token=LmLmCAACY7knkUmB33ErRA&token_type=bearer