import 'server-only';

import SecurityWrapper from 'components/SecurityWrapper';
import SubNav from 'components/SubNav';
import ModalButton from 'components/ModalButton';
import { Form, Text, Number, Collection, Select } from 'components/Vcontrols';
import { getAllMembershipCapacities } from '@/api/membership/capacity/route';
import { getManyEnsembles } from '@/api/ensembles/route';

export default async function SettingsLayout(params) {
    const capacities = await getAllMembershipCapacities()
    const ensembles = await getManyEnsembles()
    const termPeriod = [
        { id: 1, type: "Week" },
        { id: 2, type: "Month" },
        { id: 3, type: "Year" }
    ]
    const navNodes = [
        { caption: "General", route: '/general' },
        { caption: "Ensembles", route: '/ensembles' },
        { caption: "Members", route: '/members' },
        { caption: "Membership", route: '/membership' }
    ]
    const navButtons = {
        membership: [
            <ModalButton
                modalButton={<span>Create Membership Type</span>}
                buttonClass="fit"
                title="Create Membership Type"
            >
                <Form id="membership-type-form" APIURL="/api/membership/types" METHOD="PUT" debug>
                    <Text id="membership-typ-name" name="name" label="Type Name" value="" isRequired />
                    <section className="inputs">
                        <Number id="membership-term-length" name="term_length" label="Expires in" value={1} style={{ flex: 1 }} isRequired />
                        <Select id="memberhsip-term-period" name="term_period" label="" options={termPeriod} value={3} style={{ flex: 5 }} isRequired />
                    </section>
                    <Collection id="membership-capacities" name="capacity" label="Capacities" options={capacities.map(cap => cap.type)} isRequired />
                    <Collection id="membership-ensembles" name="ensembles" label="Ensembles" options={ensembles} isRequired />
                </Form>
                <section className="modal-buttons">
                    <button name="submit" form="membership-type-form">Create</button>
                </section>
            </ModalButton>
        ]
    }

    return (
        <SecurityWrapper currentModule="settings">
            <div id="page-base">
                <div id="nav-header">
                    <SubNav caption="settings" root="settings" navNodes={navNodes} buttons={navButtons} />
                </div>
                <div id="page-frame">
                    {params.children}
                </div>
            </div>
        </SecurityWrapper>
    )
}