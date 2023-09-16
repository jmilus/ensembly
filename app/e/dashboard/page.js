import 'server-only'

import SubNav from 'components/SubNav';

const DashboardPage = async () => {

    return (
        <div className="page-base">
            <div className="action-section">
                <SubNav caption="dashboard" />
            </div>
            <div className="form-section">
                <div className="page-details"></div>
            </div>
        </div>
    )
}

export default DashboardPage;