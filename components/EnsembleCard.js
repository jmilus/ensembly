import { useRouter } from 'next/router';
import { getInitials } from '../utils';

import VForm from './VForm';
import V from './ControlMaster';
import SubMenu from './SubMenu';

import { Status, Capacity } from '@prisma/client';

import { useContext } from 'react';
import { GlobalContext } from "../pages/_app";

const EnsembleCard = ({ membership, ensemble, presentation, format }) => {
    const { dispatch } = useContext(GlobalContext);
    const router = useRouter();

    const { id, name, type } = ensemble;
    const typeColor = JSON.parse(type.typeColor);
    
    const elemTypeColor = `${typeColor.type}(${typeColor.values[0]},${typeColor.values[1]}%, ${typeColor.values[2]}%)`;
    
    const initials = getInitials(name).substring(0,3);
    const heroIcon = <div>{initials}</div>

    const changeMembershipStatus = (newStatus) => {
        console.log("changing membership status", newStatus);

        const changeButtonProps = {
            Active: { caption: "Activate", class: "hero" },
            Suspended: { caption: "Suspend", class: "warning"}
        }

        
        const changeStatus = (newStatus) => {
            const response = fetch('/api/members/updateMembership', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: membership.id,
                    status: newStatus
                })
            })
                .then(response => response.json())
                .then(record => {
                    console.log("status updated successfully:", { record })
                    return record;
                })
                .catch((err, message) => {
                    console.error('problem updating status:', message);
                    return err;
            })
        }

        dispatch({
            type: "modal",
            payload: {
                type: "message",
                content: {
                    title: "Change Status",
                    body: `Change status to ${newStatus}?`
                },
                buttons: [
                    { name: "change", caption: changeButtonProps[newStatus].caption, class: changeButtonProps[newStatus].class, action: () => changeStatus(newStatus) },
                    { name: "dismiss", caption: "Cancel" }
                ]
            }
        })
    }

    const closeOutMembership = () => {
        console.log("closing out membership", membership);

        const modalBody = 
            <div className="modal-fields">
                <div className="modal-message">{`Deactivate ${member.name}'s ${membership.name} Role?`}</div> 
                <V.Date id="endDate" field="endDate" label="Deactivate As Of" min={membership.startDate} recordId={membership.membershipId} isRequired/>
            </div>

        dispatch({
            type: "modal",
            payload: {
                type: "form",
                content: {
                    title: "Deactivate",
                    body: modalBody,
                    URL: "/members/updateMembership",
                    additionalIds: { memberId: member.id, ensembleId: ensemble.id }
                },
                buttons: [
                    { name: "submit", caption: "Deactivate", styleClass: "deactivate", class: "hero"},
                    { name: "dismiss", caption: "Cancel" }
                ]
            }
        })
    }

    const deleteMembership = () => {
        console.log("deleting membership")
    }

    switch (format) {
        case "membership":
            const membershipName = `$membership-${membership.id}`;
            let statusIcon;
            switch (membership.status) {
                case "Active":
                    statusIcon = <i className="status-icon" style={{color:"limegreen"}}>check_circle</i>
                    break;
                case "Suspended":
                    statusIcon = <i className="status-icon" style={{color:"orange"}}>unpublished</i>
                    break;
                default:
                    statusIcon = <i className="status-icon" style={{color:"royalblue"}}>brightness_2</i>
            }
            //
            const statusChanger = membership.status === "Active"
                ? {
                    caption: "Suspend",
                    action: () => changeMembershipStatus("Suspended")
                }
                : {
                    caption: "Activate",
                    action: () => changeMembershipStatus("Active")
                }
            
            const ensembleOptions = [
                statusChanger,
                {
                    caption: "Deactivate",
                    action: () => closeOutMembership(cap)
                },
                {
                    caption: "Delete Memberhsip",
                    action: () => deleteMembership(cap),
                    style: {color: "red"}
                }
            ]
            return (
                <div className="card-container">
                    <section>
                        <div className="card-header clickable" onClick={() => router.push(`/ensembles/${id}`)}>
                            <div className="hero-icon" style={{ width: "25px", height: "25px", fontSize: "0.5em" }}>{heroIcon}</div>
                            <div className="card-caption">
                                <div className="card-name">{name}</div>
                                <div className="card-subtitle"></div>
                            </div>
                        </div>
                    </section>
                    <VForm id={`membership-${membershipName}`} APIURL="/members/updateMembership" recordId={membership.id} >
                        <section>
                            {statusIcon}
                            <V.Date id="" field="statusDate" label={membership.status} value={membership.statusDate} />
                            <SubMenu options={ensembleOptions} style={{ margin: "auto 0 10px 0" }} />
                        </section>
                    </VForm>
                </div>
            )
        case "minimal":
        default:
            return (
                <object className="card-container clickable" onClick={() => router.push(`/ensembles/${id}`)}>
                    <div className="hero-icon" style={{width: "50px", height: "50px", background: elemTypeColor}}>{heroIcon}</div>
                    <div className="card-name">{name}</div>
                </object>
            );
    }
}

export default EnsembleCard;