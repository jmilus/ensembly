import { useRef } from 'react';
import { useRouter } from 'next/router';
import { getInitials } from '../utils';
import { ItemTypes } from '../config/constants';
import { useDrag } from 'react-dnd';

import styles from '../styles/ProfileCard.module.css'

const MemberCard = ({ member, subtitle="", presentation, format }) => {
    const router = useRouter();
    const { name } = member;

    const initials = getInitials(name).substring(0,3);
    const heroIcon = <div>{initials}</div>

    switch (format) {
        case "minimal":
            return (
                <div className={styles.cardContainer}>
                    <div className={styles.header} onClick={() => router.push(`/members/${member.id}`)}>
                        <div className={styles.heroIcon} style={{width: "50px", height: "50px"}}>{heroIcon}</div>
                        <div className={styles.cardCaption}>
                            <div className={styles.cardName}>{name}</div>
                            <div className={styles.subtitle}>{subtitle}</div>
                        </div>
                    </div>
                </div>
            );
        case "drag":
            const [{ isDragging, didDrop }, drag, preview] = useDrag(() => ({
                type: ItemTypes.CARD,
                item: member,
                end: () => console.log("membercard dropped in a container:", didDrop),
                collect: monitor => ({
                    isDragging: !!monitor.isDragging(),
                    didDrop: !!monitor.didDrop()
                })
            }))
            
            return (
                <div ref={drag} className={styles.cardContainer} style={isDragging ? { opacity: 0 } : {}}>
                    <div className={styles.header} >
                        <div className={styles.heroIcon} style={{ width: "50px", height: "50px" }}>{heroIcon}</div>
                        <div className={styles.cardCaption}>
                            <div className={styles.cardName}>{name}</div>
                            <div className={styles.subtitle}>{subtitle}</div>
                        </div>
                        <i className="link-text" onClick={() => router.push(`/members/${member.id}`)} style={{marginLeft: "auto", color: "var(--gray4)"}}>account_box</i>
                    </div>
                </div>
            )
        default:
            return (
                <div className={styles.cardContainer}>
                    <div className={styles.header} onClick={() => router.push(`/members/${member.id}`)}>
                        <div className={styles.heroIcon} style={{width: "50px", height: "50px"}}>{heroIcon}</div>
                        <div className={styles.cardCaption}>
                            <div className={styles.cardName}>{name}</div>
                            <div className={styles.subtitle}>{subtitle}</div>
                        </div>
                    </div>
                </div>
            );
    }
}

export default MemberCard;