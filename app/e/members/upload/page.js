'use server'

import Importer from './Importer';

import { getBioOptions } from '@/api/members/bio/route';
import { getManyMembershipTypes } from '@/api/membership/types/route';
import { getManyEnsembles } from '@/api/ensembles/route';
import { getAllDivisions } from '@/api/ensembles/division/route';
import { getAllMembers } from '@/api/members/route';
import { getAllEnsembleTypes } from '@/api/ensembles/types/route';
import { getAllMembershipCapacities } from '@/api/membership/capacity/route';

import SubNav from 'components/SubNav'
import ModalButton from 'components/ModalButton';
import { Text, Select, Number, Collection, Form } from 'components/Vcontrols'

export default async function UploadMembersPage() {
    const allMembers = await getAllMembers()
    const bioOptions = await getBioOptions();
    const membershipTypes = await getManyMembershipTypes()
    const ensembles = await getManyEnsembles()
    const divisions = await getAllDivisions(false)
    const ensembleTypes = await getAllEnsembleTypes()
    const capacities = await getAllMembershipCapacities()

    const termPeriod = [
        { id: 1, value: "Week" },
        { id: 2, value: "Month" },
        { id: 3, value: "Year" }
    ]

    const members = allMembers.map(member => {
        if (member.address[0]) {
            Object.keys(member.address[0]).forEach(key => {
                if (key === 'type') return;
                member[key] = member.address[0][key]
            })
            delete member.address
        } else {
            member.address = null;
        }
        return {
            ...member,
            phonenumber: member.phonenumber[0]?.number || null,
            email: member.email[0]?.email || null,
            uniqueName: `${member.firstName}-${member.middleName || ""}-${member.lastName}-${member.suffix || ""}`
        }
    })

    console.log({ ensembles })

    const optionSets = {
        sex: bioOptions.sex.map(v => v.type),
        race: bioOptions.race.map(v => v.type),
        hair: bioOptions.hair.map(v => v.type),
        eyes: bioOptions.eyes.map(v => v.type),
        membershipType: membershipTypes.map(mt => { return {...mt, value: mt.name } }),
        ensemble: ensembles.map(ens => { return {...ens, value: ens.name } }),
        division: divisions.map(div => { return {...div, value: div.name } })
    }
    
    return (
        <div id="page-base">
            <div id="page-header" >
                <SubNav
                    caption="Members"
                    root="members"
                />
            </div>
            <div id="page-frame">
                <div id="page">
                    <Importer optionSets={optionSets} members={members} />

                </div>

            </div>

        </div>
    )
}