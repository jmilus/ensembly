import { LineupSelector } from '../../../EnsemblesHelpers';

import { getManyLineups } from '@/api/ensembles/[id]/lineup/route';

export default async function LineupLayout(props) {
    const lineups = await getManyLineups(props.params.id);
   
    return (
        <>
            <div className="page-header">
                <LineupSelector value={props.params.lineup} lineups={lineups}/>
                <div id="lineup-filter-search"></div>
            </div>
            <div className="page-details">
                { props.children }
            </div>
        </>
    )
}