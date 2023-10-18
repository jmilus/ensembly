import 'server-only';

import React from 'react';
import { headers } from 'next/headers';
import { getSecurityRoles } from '@/api/security/route';


const SecurityWrapper = async ({ currentModule, children }) => {
    const security = await getSecurityRoles()
    // console.log({security})
    return children 
}

export default SecurityWrapper;
