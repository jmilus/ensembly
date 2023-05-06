import Link from 'next/link';
import basePageStyles from '../../styles/basePage.module.css';

export default function LoadingEnsembles() {
    return (
        <div className={basePageStyles.pageBase}>
            <div className={basePageStyles.actionSection}>
                
            </div>
            <div className={basePageStyles.formSection}>
                <div className={basePageStyles.pageHeader}>
                    <h1>Ensembles</h1>
                </div>
                <div className={basePageStyles.pageDetails}>
                    <div className="grid">
                        
                    </div>
                </div>
            </div>
        </div>
    )
}