import { useRouter } from 'next/router';
import { getInitials } from '../utils';
import { useDrag } from 'react-dnd';

const MemberCard = ({ membership, subtitle = "", presentation, cardType="no-drag", format, dropAction }) => {
    const { member } = membership;
    const doSomething = (junk) => {
        dropAction(junk)
    }
    const [{ isDragging }, drag, preview] = useDrag(() => ({
        type: cardType,
        item: membership,
        end(item, monitor) {
            const dropResult = monitor.getDropResult()
            console.log(dropResult);
            if (item && dropResult) {
                const { value } = dropResult;
                doSomething({ membership: item, division: value });
            }
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        })
    }), [dropAction])

    const router = useRouter();
    const { aka } = member;

    const initials = getInitials([member.firstName, member.middleName, member.lastName].join(" ")).substring(0,3);
    const heroIcon = <div>{initials}</div>

    switch (format) {
        case "detail":
            return (
                <div className="card-container clickable" onClick={() => router.push(`/members/${member.id}`)}>
                    <div className="card-header">
                        <div className="hero-icon" style={{width: "50px", height: "50px"}}>{heroIcon}</div>
                        <div className="card-caption">
                            <div className="card-name">{aka}</div>
                            <div className="card-subtitle">{subtitle}</div>
                        </div>
                    </div>
                    <div className="card-body">
                    </div>
                </div>
            );
        case "drag":
            
            return (
                <div ref={drag} className="card-container" style={isDragging ? { opacity: 0 } : {}}>
                    <div className="card-header" >
                        <div className="hero-icon" style={{ minWidth: "50px", minHeight: "50px" }}>{heroIcon}</div>
                        <div className="card-caption">
                            <div className="card-name">{aka}</div>
                            <div className="card-subtitle">{subtitle}</div>
                        </div>
                        <i className="link-text" onClick={() => router.push(`/members/${member.id}`)} style={{marginLeft: "auto", color: "var(--gray4)"}}>account_box</i>
                    </div>
                </div>
            )
        case "wait":
            return (
                <div ref={drag} className="card-container">
                    <div className="card-header" >
                        <div className="hero-icon cold" style={{ width: "50px", height: "50px" }}>{heroIcon}</div>
                        <div className="card-caption">
                            <div className="card-name cold">{aka}</div>
                            <div className="card-subtitle">{subtitle}</div>
                        </div>
                        <i className="link-text" onClick={() => router.push(`/members/${member.id}`)} style={{marginLeft: "auto", color: "var(--gray4)"}}>account_box</i>
                    </div>
                </div>
            )
        case "minimal":
        default:
            return (
                <div className="card-container clickable" onClick={() => router.push(`/members/${member.id}`)}>
                    <div className="card-header">
                        <div className="hero-icon" style={{width: "50px", height: "50px"}}>{heroIcon}</div>
                        <div className="card-caption">
                            <div className="card-name">{aka}</div>
                            <div className="card-subtitle">{subtitle}</div>
                        </div>
                    </div>
                </div>
            );
    }
}

export default MemberCard;