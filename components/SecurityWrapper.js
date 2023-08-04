import 'server-only';

import React from 'react';
import { headers } from 'next/headers';

import { getProfile } from '../app/api/auth/[id]/route';

const SecurityWrapper = async ({ currentModule, children }) => {
    const { permissions, role, user, member } = await getProfile()
    // console.log({ role }, { permissions }, { member })

    const isSelf = false
    // console.log({ isSelf })

    const setToReadOnly = (elem) => {
        if (elem === null) return null;
        if (!elem.props) return elem;

        if (elem.props.name) {
            const elemProps = { ...elem.props, readonly: true };
            return React.cloneElement(elem, { ...elemProps } )
        }

        if (elem.props.children) {
            return React.cloneElement(elem, null, React.Children.map(elem.props.children, child => {
                return setToReadOnly(child)
            }))
        }
    }
    
    const screenChildren = (childrenToScreen, securityTree) => {
        // console.log(child.props.id, {securityTree})
        return React.Children.map(childrenToScreen, child => {
            if (child === null)
                return null;
            if (!child.props)
                return child;
            if (securityTree === "all")
                return child;
            
            let securityBranch = securityTree;
            if (child.props.id) {
                // console.log(child.props.id, {securityBranch})
                if (!securityBranch[child.props.id]) return null;
                switch (securityBranch[child.props.id]) {
                    case "read":
                        const readChild = setToReadOnly(child);
                        return readChild;
                    case "all":
                        return child;
                    default:
                        securityBranch = securityBranch[child.props.id]
                        break;
                }
            }
            if (child.props.children) {
                const newChildren = screenChildren(child.props.children, securityBranch);
                return React.cloneElement(child, null, newChildren);
            }
            return child;
        })
    }

    let securityTree = permissions.modules[currentModule];

    switch (securityTree) {
        case undefined:
            return <div className="nullified"></div>;
        case "all":
            return children;
        default:
            return screenChildren(children, isSelf ? permissions.modules[module].self : permissions.modules[module].records);
    }
}

export default SecurityWrapper;
