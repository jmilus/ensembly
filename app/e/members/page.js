import 'server-only';

import { getAllMembers } from '@/api/members/route';

import ModalButton from 'components/ModalButton';
import { Form, Text, File } from 'components/Vcontrols';
import SecurityWrapper from 'components/SecurityWrapper';
import SubNav from 'components/SubNav';
import FilterContainer from 'components/FilterContainer';
import ItemCard from 'components/ItemCard';
import { getBioOptions } from '@/api/members/bio/route';

const MembersPage = async () => {

    const members = await getAllMembers();
    const { sex } = await getBioOptions(['sex']);

    // console.log({ sex })

    const navButtons = [
        <ModalButton
            key="modal-button-new-member"
            modalButton={<><i>person_add</i><span>New Member</span></>}
            title="Create New Member"
            buttonClass="fit"
        >
            <Form id="new-member-modal-form" METHOD="POST" followPath="/e/members/$slug$" >
                <section className="modal-fields inputs">
                    <Text id="newMemberFirstName" name="firstName" label="First Name" value=""/>
                    <Text id="newMemberLastName" name="lastName" label="Last Name" value=""/>
                </section>
            </Form>
            <section className="modal-buttons">
                <button name="submit" className="fit" form="new-member-modal-form">Create Member</button>
            </section>
        </ModalButton>,
        <ModalButton
            key="modal-button-upload-members"
            modalButton={<><i>upload</i><span>Upload Members</span></>}
            title="Upload Members from Excel File"
            buttonClass="fit"
        >
            <Form id="upload-members-modal-form" APIURL="/api/members/uploadMembers" METHOD="POST" debug>
                <File id="fileUpload" name="members" handling="upload" fileTypes="xlsx" isRequired />
            </Form>
            <section className="modal-buttons">
                <button name="submit" className="fit" form="upload-members-modal-form">Upload</button>
            </section>
        </ModalButton>
    ]

    return (
        <SecurityWrapper currentModule="members">
            <div id="page-base">
                <div id="nav-header">
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
                                { name: "sex", filterBy: "sex", buttons: sex.map(s => { return { caption: s.type, value: s.id } }) }
                            ]}
                            minimum={5}
                        >
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
                        </FilterContainer>
                    </div>
                </div>
            </div>
        </SecurityWrapper>
    )
}

export default MembersPage;