import 'server-only';

import { getOneBroadcast } from '@/api/messages/broadcasts/[id]/route';
import { getManyEmails } from '@/api/emails/route';
import { nester } from 'utils';

import Broadcast from 'components/Broadcast'

const BroadcastDetailsPage = async (context) => {
    const broadcast = await getOneBroadcast(context.params.id)
    const ensembleemails = await getManyEmails("ensemble", '5aceabd3-324b-45fb-bc7a-4f79f022d9a8')

    const mailgroups = {};

    mailgroups.ensembles = ensembleemails.map(ee => {
        return {
            name: ee.name,
            lineups: ee.Lineup.map(lu => {
                const lineup = { name: lu.name, divisions: [] }

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
                lineup.divisions = nester(Object.values(tempDivisions).map(div => div), "parent_division")
                return lineup;
            })
        }

    })

    // console.log("broadcast:", broadcast)

    return (
        <Broadcast
            broadcastId={broadcast[0].id}
            subject={broadcast[0].subject}
            to_address={broadcast[0].to_address || []}
            cc_address={broadcast[0].cc_address || []}
            bcc_address={broadcast[0].bcc_address || []}
            body={broadcast[0].body}
            status={broadcast[0].status}
            mailgroups={mailgroups} /> 
    )
}

export default BroadcastDetailsPage;