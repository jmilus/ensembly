import 'server-only'

import SecurityWrapper from '../../components/SecurityWrapper';

const EnsemblesLayout = (context) => {
    return (
        <SecurityWrapper currentModule="ensembles">
            {context.children}
        </SecurityWrapper>
    )
}

export default EnsemblesLayout;