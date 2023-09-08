import 'server-only';

import Link from 'next/link';
import SubNav from '../../../../../components/SubNav';

export default async function ModelLayout(props) {

    return (
        <div className="page-base">
            <div className="action-section">
                <SubNav root="model" />
            </div>
            <div className="form-section">
                {props.children}
            </div>
        </div>
    )
}