import 'server-only'

import SecurityWrapper from 'components/SecurityWrapper';

const MembersLayout = (props) => {
    return (
        <SecurityWrapper currentModule="members">
            <div id="page-base">
                <div id="nav-header">
                    {props.nav}
                </div>
                <div id="page-frame">
                    {props.children}
                </div>
            </div>
        </SecurityWrapper>
    )
}

export default MembersLayout;