'use client'

import { useRouter } from 'next/navigation';
import { getInitials } from '../utils';
import { useDrag } from 'react-dnd';

const ItemCard = ({ type="basic", cardType, dropItem, itemIcon, name, subtitle, cardLinkTo, captionLinkTo, children }) => {
    const router = useRouter();

    const [{ isDragging }, drag] = useDrag(() => ({
        type: cardType || "",
        item: dropItem,
        end(item, monitor) {
            const dropResult = monitor.getDropResult()
            console.log(dropResult);
        },
        collect: monitor => ({
            isDragging: !!monitor.isDragging(),
        })
    }))

    return (
        <div
            ref={dropItem ? drag : null}
            className={`card-container ${type}${dropItem ? " dragable" : ""}`}
            style={{ opacity: isDragging ? 0 : 1, }}
            onClick={cardLinkTo ? () => router.push(cardLinkTo) : null}
        >
            <div className="card-header" onClick={captionLinkTo ? () => router.push(captionLinkTo) : null}>
                <div className="hero-icon">{itemIcon || getInitials(name)}</div>
                {name &&
                    <div className="card-caption">
                        <div className="card-name">{name}</div>
                        <div className="card-subtitle">{subtitle}</div>
                    </div>
                }
            </div>
            {children &&
                <div className="card-body">{children}</div>
            }
        </div>
    )
}

export default ItemCard;