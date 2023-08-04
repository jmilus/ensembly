import 'server-only';

import { getAllMembers } from '../api/members/route';

import Link from 'next/link';

import FilterContainer from '../../components/FilterContainer';
import MemberCard from '../../components/MemberCard';

const MembersPage = async () => {

    const members = await getAllMembers();

    return (
        <div className="page-base">
            <div className="action-section">
                <article style={{padding: "0 20px"}}>
                    <h1>Members</h1>
                        <article className="button-chain column" style={{ padding: "10px" }}>
                            <Link href={'/members/$new-member'}><button className="fat"><i>person_add</i><span>New Member</span></button></Link>
                            <Link href={'/members/$upload-members'}><button className="fat"><i>upload</i><span>Upload Members</span></button></Link>
                        </article> 
                    {/* <ModalButton
                        modalButton={<><i>upload</i><span>Upload Members</span></>}
                        title="Upload Members from Excel File"
                    >
                        <Form id="upload-members-modal-form" APIURL="/members/uploadMembers" debug>
                            <section className="modal-fields">
                                <File id="fileUpload" field="file" handling="upload" fileType="xlsx" />
                            </section>
                        </Form>
                        <section className="modal-buttons">
                            <button name="submit" form="upload-members-modal-form">Upload</button>
                        </section>
                    </ModalButton> */}
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