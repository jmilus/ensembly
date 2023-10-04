import 'server-only'

import SubNav from 'components/SubNav';

const DashboardPage = async () => {

    return (
        <div id="page-base">
            <div id="nav-header">
                <SubNav caption="dashboard" />
            </div>
            <div id="page-frame">
                <div id="page"></div>
            </div>
        </div>
    )
}

export default DashboardPage;