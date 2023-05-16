'use client'

import { useRouter } from 'next/navigation';
import { getInitials } from '../utils';

import { Form, DateTime } from './Vcontrols';

const EnsembleCard = ({ ensemble, subtitle, presentation, format, readonly }) => {
    const { id, name, type } = ensemble;
    const typeColor = JSON.parse(type.typeColor);
    const router = useRouter();
    
    const elemTypeColor = `${typeColor.type}(${typeColor.values[0]},${typeColor.values[1]}%, ${typeColor.values[2]}%)`;
    
    const initials = getInitials(name).substring(0,3);
    const heroIcon = <div>{initials}</div>


    switch (format) {
        case "minimal":
        default:
            return (
                <div className="card-container" onClick={() => router.push(`/ensembles/${id}`)}>
                    <div className="card-header">
                        <div className="hero-icon" style={{width: "50px", height: "50px", background: elemTypeColor}}>{heroIcon}</div>
                        <div className="card-caption">
                            <div className="card-name">{name}</div>
                            <div className="card-subtitle">{subtitle}</div>
                        </div>
                    </div>
                </div>
            );
    }
}

export default EnsembleCard;