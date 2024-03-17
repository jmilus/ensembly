import 'server-only';

import { getAllMembers } from '@/api/members/route';

import ModalButton from 'components/ModalButton';
import { Form, Text } from 'components/Vcontrols';
import SecurityWrapper from 'components/SecurityWrapper';
import SubNav from 'components/SubNav';
import FilterContainer from 'components/FilterContainer';
import ItemCard from 'components/ItemCard';
import { getBioOptions } from '@/api/members/bio/route';
import Link from 'next/link';

const MembersPage = async () => {

    const members = await getAllMembers();
    const { sex } = await getBioOptions(['sex']);

    console.log({ members })

    const navButtons = [
        <ModalButton
            key="modal-button-new-member"
            renderButton={<><i>person_add</i><span>New Member</span></>}
            title="Create New Member"
            buttonClass="fit"
        >
            <Form id="new-member-modal-form" METHOD="POST" followPath="/e/members/$slug$" >
                <section className="modal-fields inputs">
                    <Text id="newMemberFirstName" name="firstName" label="First Name" value="" isRequired/>
                    <Text id="newMemberLastName" name="lastName" label="Last Name" value="" isRequired/>
                </section>
            </Form>
            <section className="modal-buttons">
                <button name="submit" className="fit" form="new-member-modal-form">Create Member</button>
            </section>
        </ModalButton>,
        <Link href="/e/members/upload">
            <button className="fit"><i>upload</i><span>Upload Members</span></button>
        </Link>
    ]

    return (
        <SecurityWrapper currentModule="members">
            <div id="page-base">
                <div id="page-header">
                    <SubNav caption="members" root="members" buttons={navButtons} />
                </div>
                <div id="page-frame">
                        
                    <div id="page">
                        <FilterContainer
                            id="members-filter"
                            filterTag="member"
                            columns={{ count: "auto-fill", width: "201px" }}
                            search={{ label: "Search Members", searchProp: "name" }}
                            filters={[
                                { name: "sex", filterBy: "sex", exactMatch: true, buttons: sex.map(s => { return { caption: s.type } }) }
                            ]}
                            minimum={5}
                        >
                            <article className="scroll grid" style={{ ['--min-width']: "201px" }}>
                                {
                                    members.map((member, i) => {
                                        // console.log({ member })
                                        return (
                                            <ItemCard
                                                key={i}
                                                filterTag="member"
                                                name={member.aka}
                                                caption={member.aka}
                                                cardLinkTo={`/e/members/${member.id}`}
                                                type="profile"
                                                sex={member.sex}
                                            />
                                        )
                                    })
                                }
                            </article>
                        </FilterContainer>
                    </div>
                </div>
            </div>
        </SecurityWrapper>
    )
}

export default MembersPage;