import 'server-only';

import { createClient } from '../../utils/supabase-server';
import { fetchManyMembers } from '../../pages/api/members/getManyMembers';
import { loadUserPermissions } from '../../pages/api/general/getUserPermissions';

import FilterContainer from '../../components/FilterContainer';
import MemberCard from '../../components/MemberCard';
import Modal2 from '../../components/Modal2';
import { Form, Text, File } from '../../components/Vcontrols';

const MembersPage = async () => {
    const supabase = createClient();
    const {
        data: { session },
    } = await supabase.auth.getSession()
    
    const authorization = await loadUserPermissions(session.user.email)
    const { permissions: { security } } = authorization;

    const members = await fetchManyMembers();

    if (security.modules.members) {

        return (
            <div className="page-base">
                <div className="action-section">
                    <article >
                        <h1>Members</h1>
                        <Modal2
                            modalButton={<button><i>person_add</i><span>New Member</span></button>}
                            title="Create New Member"
                        >
                            <Form id="new-member-modal-form" APIURL="/members/createMember" debug >
                                <section className="modal-fields">
                                    <Text id="newMemberFirstName" name="firstName" label="First Name" value=""/>
                                    <Text id="newMemberLastName" name="lastName" label="Last Name" value=""/>
                                </section>
                                <section className="modal-buttons">
                                    <button name="submit">Create Member</button>
                                    <button name="cancel">Cancel</button>
                                </section>
                            </Form>
                        </Modal2>
                        <Modal2
                            modalButton={<button><i>upload</i><span>Upload Members</span></button>}
                            title="Upload Members from Excel File"
                        >
                            <Form id="upload-members-modal-form" APIURL="/members/uploadMembers" debug>
                                <section className="modal-fields">
                                    <File id="fileUpload" field="file" handling="upload" fileType="xlsx" />
                                </section>
                                <section className="modal-buttons">
                                    <button name="submit">Upload</button>
                                    <button name="cancel">Cancel</button>
                                </section>
                            </Form>
                        </Modal2>
                    </article>
                </div>
                <div className="form-section">
                    <div className="page-details">
                        <FilterContainer
                            id="members-filter"
                            filterTag="member"
                            columns={{count: "auto-fill", width: "200px"}}
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
                                            membership={{member}}
                                            presentation={"grid"}
                                            format={"detail"}
                                            name={member.aka}
                                            sex={member.memberBio.sex}
                                        />
                                    )
                                })
                            }
                        </FilterContainer>
                    </div>
                </div>
            </div>
        )
    } else {
        throw new Error("You do not have permissions to access this module.");
    }
}

export default MembersPage;