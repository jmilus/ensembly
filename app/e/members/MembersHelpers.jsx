'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { Form, Text, File } from 'components/Vcontrols';
import TabControl, { Tab } from 'components/TabControl';
import ModalButton from 'components/ModalButton';

// export function MemberNav() {

//     return (
//         <article style={{padding: "10px"}}>
//             <h1>Members</h1>
//             <ModalButton
//                 modalButton={<><i>person_add</i><span>New Member</span></>}
//                 title="Create New Member"
//             >
//                 <Form id="new-member-modal-form" APIURL="/members/createMember" debug >
//                     <section className="modal-fields">
//                         <Text id="newMemberFirstName" name="firstName" label="First Name" value=""/>
//                         <Text id="newMemberLastName" name="lastName" label="Last Name" value=""/>
//                     </section>
//                 </Form>
//                 <section className="modal-buttons">
//                     <button name="submit" form="new-member-modal-form">Create Member</button>
//                 </section>
//             </ModalButton>
//             <ModalButton
//                 modalButton={<></>}
//                 title="Upload Members from Excel File"
//             >
//                 <Form id="upload-members-modal-form" APIURL="/members/uploadMembers" debug>
//                     <section className="modal-fields">
//                         <File id="fileUpload" field="file" handling="upload" fileType="xlsx" />
//                     </section>
//                 </Form>
//                 <section className="modal-buttons">
//                     <button name="submit" form="upload-members-modal-form">Upload</button>
//                 </section>
//             </ModalButton>
//         </article>
//     )
    
// }

// export function MemberProfileNav({ member }) {
//     const router = useRouter()

//     return (
//         <div className="sub-nav">
//             <article style={{ padding: "10px", flex: "0 0 10em" }}>
//                 <Link href="/members"><i>arrow_back</i>All Members</Link>
//                 <h1>Member Profile</h1>
//             </article>
//             <TabControl id="nav-tabs" type="accordion">
//                 <Tab id="Profile" onLoad={() => router.push(`/members/${member.id}/`)}></Tab>
//                 <Tab id="Account" onLoad={() => router.push(`/members/${member.id}/account/`)}></Tab>
//             </TabControl>
//         </div>
//     )

// }

// export function MakeUserButton({member}) {
//     const router = useRouter();
//     const supabase = createClientComponentClient();

//     const createUser = async () => {
//         const {data, error} = await supabase.auth.signUp(
//             {
//                 email: member.email,
//                 password: member.password || "temporary"
//             }
//         )
//         if (error) {
//             console.error("create user error:", error)
//             return;
//         }

//         router.refresh();
//         console.log(data)
//     }

//     return (
//         <button style={{margin: "auto"}} onClick={createUser}><i>person_add</i><span>Create User Account</span></button>
//     )
// }