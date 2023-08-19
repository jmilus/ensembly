import 'server-only'

import SecurityWrapper from '../../components/SecurityWrapper';

const EnsemblesLayout = (props) => {
    return (
        <SecurityWrapper currentModule="ensembles">
            {props.children}
        </SecurityWrapper>
    )
}

export default EnsemblesLayout;