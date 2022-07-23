import { useRouter } from 'next/router';
import { getInitials } from '../utils';

import styles from '../styles/ProfileCard.module.css'

const ProfileCard = ({ member, presentation, format }) => {
    const router = useRouter();
    const { firstName, lastName } = member;

    const initials = getInitials([firstName, lastName]).substring(0,3);
    const heroIcon = <div>{initials}</div>

    switch (format) {
        case "detail":
        case "minimal":
        default:
            return (
                <div className={styles.cardContainer} onClick={() => router.push(`/members/${member.id}`)}>
                    <div className={styles.heroIcon} style={{width: "50px", height: "50px"}}>{heroIcon}</div>
                    <div className={styles.cardName}>{firstName} {lastName}</div>
                </div>
            );
    }
}

export default ProfileCard;