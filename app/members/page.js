import 'server-only';

import { getAllMembers } from '../api/members/route';

import Link from 'next/link';

import FilterContainer from '../../components/FilterContainer';
import MemberCard from '../../components/MemberCard';
import ModalButton from '../../components/ModalButton';
import { Form, Text } from '../../components/Vcontrols';

const MembersPage = async () => {

    const members = await getAllMembers();

    return (
        <div className="page-base">
            <div className="action-section">
                <article style={{padding: "0 20px"}}>
                    <h1>Members</h1>
                    <article className="button-chain column">
                        <ModalButton
                            modalButton={<><i>person_add</i><span>New Member</span></>}
                            title="New Member"
                            buttonClass="fat"
                        >
                            <Form id="new-member-modal-form" METHOD="POST" followPath="$slug$" >
                                <section className="modal-fields">
                                    <Text id="newMemberFirstName" name="firstName" label="First Name" value="" isRequired />
                                    <Text id="newMemberLastName" name="lastName" label="Last Name" value="" isRequired />
                                </section>
                            </Form>
                            <section className="modal-buttons">
                                <button name="submit" form="new-member-modal-form">Create Member</button>
                            </section>
                        </ModalButton>
                        <ModalButton
                            modalButton={<><i>upload</i><span>Upload Members</span></>}
                            title="Upload"
                            buttonClass="fat"
                        >
                            <Form id="upload-member-modal-form" METHOD="POST" >
                                <section className="modal-fields">
                                    {/* <File id="newMemberFirstName" name="file" label="Select File" value="" isRequired /> */}
                                </section>
                            </Form>
                            <section className="modal-buttons">
                                <button name="submit" form="upload-member-modal-form">Upload Members</button>
                            </section>
                        </ModalButton>
                    </article> 
                </article>
            </div>
            <div className="form-section">
                <div className="page-details">
                    <FilterContainer
                        id="members-filter"
                        filterTag="member"
                        columns={{count: "auto-fill", width: "201px"}}
                        search={{ label: "Search Members", searchProp: "name" }}
                        filters={[
                            { name: "sex", filterProp: "sex", buttons: ["male", "female", "unspecified"] }
                        ]}
                    >
                        {
                            members.map((member, i) => {
                                return (
                                    <MemberCard
                                        key={i}
                                        tag="member"
                                        membership={{Member: member}}
                                        presentation={"grid"}
                                        format={"detail"}
                                        name={member.aka}
                                        sex={member.sex}
                                    />
                                )
                            })
                        }
                    </FilterContainer>
                </div>
            </div>
        </div>
    )
}

export default MembersPage;