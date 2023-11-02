import 'server-only';

import Link from 'next/link';
import SubNav from 'components/SubNav';

export default async function ModelLayout(props) {

    return (
        <div id="page-base">
            <div id="nav-header">
                <SubNav root="calendar" />
            </div>
            <div id="page-frame">
                {props.children}
            </div>
        </div>
    )
}