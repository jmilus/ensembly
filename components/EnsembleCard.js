import Link from 'next/link';
import { getInitials } from '../utils';

import { Form, DateTime } from './Vcontrols';

const EnsembleCard = ({ membership, ensemble, presentation, format, readonly }) => {

    const { id, name, type } = ensemble;
    const typeColor = JSON.parse(type.typeColor);
    
    const elemTypeColor = `${typeColor.type}(${typeColor.values[0]},${typeColor.values[1]}%, ${typeColor.values[2]}%)`;
    
    const initials = getInitials(name).substring(0,3);
    const heroIcon = <div>{initials}</div>


    switch (format) {
        case "membership":
            const membershipName = `$membership-${membership.id}`;
            
            return (
                <div className="card-container">
                    <section style={{justifyContent: "space-between"}}>
                        <div className="card-header">
                            <div className="hero-icon" style={{ width: "25px", height: "25px", fontSize: "0.5em" }}>{heroIcon}</div>
                            <div className="card-caption">
                                <div className="card-name">{name}</div>
                                <div className="card-subtitle"></div>
                            </div>
                        </div>
                        <Link href={`/ensembles/${id}`}><i>theater_comedy</i></Link>
                    </section>
                    <Form id={`membership-${membershipName}`} APIURL="/members/updateMembership" recordId={membership.id} >
                        <DateTime id="" field="statusDate" label={membership.status} value={membership.statusDate} readonly={readonly} />
                    </Form>
                </div>
            )
        case "minimal":
        default:
            return (
                <Link href={`/ensembles/${id}`}>
                    <div className="card-container">
                        <div className="hero-icon" style={{width: "50px", height: "50px", background: elemTypeColor}}>{heroIcon}</div>
                        <div className="card-name">{name}</div>
                    </div>
                </Link>
            );
    }
}

export default EnsembleCard;