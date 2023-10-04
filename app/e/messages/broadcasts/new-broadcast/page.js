import 'server-only';

import { getManyEmails } from '@/api/emails/route';
import { nester } from 'utils';

import Broadcast from 'app/e/messages/broadcasts/Broadcast'

const NewBroadcastPage = async () => {
    const ensembleemails = await getManyEmails("ensemble")

    const mailgroups = {};

    mailgroups.children = ensembleemails.map(ee => {
        return {
            name: ee.name,
            //lineups:
            children: ee.Lineup.map(lu => {
                const lineup = { name: lu.name, children: [] /* divisions */ }

                const tempDivisions = {};
                ee.Division.forEach(div => {
                    tempDivisions[div.id] = { ...div, members: {} };
                })

                lu.LineupAssignment.forEach(la => {
                    // if (!tempDivisions[la.Division.id]) 
                    if (la.EnsembleMembership.Member.EmailAddress[0]?.email) {

                        tempDivisions[la.Division.id].members[la.EnsembleMembership.Member.id] = {
                            id: la.EnsembleMembership.Member.id,
                            name: la.EnsembleMembership.Member.aka,
                            email: la.EnsembleMembership.Member.EmailAddress[0]?.email
                        }
                    }
                })
                lineup.children = nester(Object.values(tempDivisions).map(div => div), "parent_division")
                return lineup;
            })
        }

    })

    const emptyBlock = {type: "standard_paragraph", key: Math.random()}

    return (
        <Broadcast
            broadcastId="new"
            status={"DRAFT"}
            mailgroups={mailgroups}
            body={[emptyBlock]}
        /> 
    )
}

export default NewBroadcastPage;