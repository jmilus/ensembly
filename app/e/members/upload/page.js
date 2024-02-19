'use server'

import Importer from './Importer';

import { getBioOptions } from '@/api/members/bio/route';
import { getManyMembershipTypes } from '@/api/membership/types/route';
import { getManyEnsembles } from '@/api/ensembles/route';
import { getAllDivisions } from '@/api/ensembles/division/route';
import { getAllMembers } from '@/api/members/route';

export default async function UploadMembersPage() {
    const members = await getAllMembers()
    const bioOptions = await getBioOptions();
    const membershipTypes = await getManyMembershipTypes()
    const ensembles = await getManyEnsembles()
    const divisions = await getAllDivisions(false)

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
        <Importer optionSets={optionSets} members={members} />
    )
}