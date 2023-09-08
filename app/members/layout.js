import 'server-only'

import SecurityWrapper from '../../components/SecurityWrapper';

const MembersLayout = (props) => {
    return (
        <SecurityWrapper currentModule="members">
            <div className="page-base">
                <div className="action-section">
                    {props.nav}
                </div>
                <div className="form-section">
                    {props.children}
                </div>
            </div>
        </SecurityWrapper>
    )
}

export default MembersLayout;