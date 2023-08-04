import 'server-only'

import SecurityWrapper from '../../components/SecurityWrapper';

const MembersLayout = (props) => {
    return (
        <SecurityWrapper currentModule="members">
            {props.children}
            {props.modal}
        </SecurityWrapper>
    )
}

export default MembersLayout;