import { useRouter } from 'next/router';
import { getInitials } from '../utils';

import VForm from './VForm';
import V from './ControlMaster';

import { Status, Capacity } from '@prisma/client';

import styles from '../styles/ProfileCard.module.css'

const EnsembleCard = ({ ensemble, divisions, subdivisions, memberId, format }) => {
    const router = useRouter();

    const { id, name, capacities, type } = ensemble;
    const typeColor = JSON.parse(type.typeColor);
    
    const elemTypeColor = `${typeColor.type}(${typeColor.values[0]},${typeColor.values[1]}%, ${typeColor.values[2]}%)`;
    
    const initials = getInitials(name).substring(0,3);
    const heroIcon = <div>{initials}</div>

    switch (format) {
        case "membership":
            return (
                <object className={styles.cardContainer}>
                    <section>
                        <div className={styles.header} onClick={() => router.push(`/ensembles/${id}`)}>
                            <div className={styles.heroIcon} style={{ width: "25px", height: "25px", fontSize: "0.5em" }}>{heroIcon}</div>
                            <div className={styles.cardCaption}>
                                <div className={styles.cardName}>{name}</div>
                                <div className={styles.subtitle}></div>
                            </div>
                        </div>
                    </section>
                    {
                        capacities.map((cap, i) => {
                            const membershipName = `${id}-${cap.membershipId}`;
                            // const dateControl = cap.endDate ? <V.Date id={`endDate-${membershipName}`} name="endDate" label="End" value={cap.endDate} /> : <V.Date id={`startDate-${membershipName}`} name="startDate" label="Start" value={cap.startDate} />;
                            const divisionByCapacity = divisions.find(div => {
                                return div.capacity === cap.name;
                            })
                            return (
                                <VForm id={`membership-${membershipName}`} APIURL="/members/updateMembership" linkedId={memberId} recordId={cap.membershipId} >
                                    <section>
                                        <V.Select id={`capacity-${membershipName}`} name="capacity" label="Capacity" value={cap.name} options={Capacity} >
                                            <V.Select id={`division-${membershipName}`} name="division" label={divisionByCapacity.divisionAlias} value={cap.division?.id} options={divisions} filterKey={"capacity"} >
                                                <V.Select id={`subdivision-${membershipName}`} name="subdivision" label="subdivision" value={cap.subDivision?.id} options={subdivisions} filterKey={"divisionId"} />
                                            </V.Select>
                                        </V.Select>
                                        {/* {dateControl} */}
                                    </section>
                                </VForm>
                            )
                        })
                    }
                </object>
            )
        case "minimal":
        default:
            return (
                <object className={styles.cardContainer} onClick={() => router.push(`/ensembles/${id}`)}>
                    <div className={styles.heroIcon} style={{width: "50px", height: "50px", background: elemTypeColor}}>{heroIcon}</div>
                    <div className={styles.cardName}>{name}</div>
                </object>
            );
    }
}

export default EnsembleCard;