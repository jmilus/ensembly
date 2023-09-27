'use client'

import { useRouter } from 'next/navigation';
import { getInitials } from '../utils';
import { useDrag } from 'react-dnd';

const ItemCard = ({ classes="basic", cardType, dropItem, itemIcon, caption, subtitle, cardLinkTo, captionLinkTo, style, cardBodyStyle, children }) => {
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
            className={`card-container ${classes}${dropItem ? " dragable" : ""}`}
            style={{ ...style, opacity: isDragging ? 0 : 1, }}
            onClick={cardLinkTo ? () => router.push(cardLinkTo) : null}
        >
            <div className="card-header" onClick={captionLinkTo ? () => router.push(captionLinkTo) : null}>
                <div className="hero-icon">{itemIcon || getInitials(caption)}</div>
                {caption &&
                    <div className="card-caption">
                        <div className="card-caption">{caption}</div>
                        <div className="card-subtitle">{subtitle}</div>
                    </div>
                }
            </div>
            {children &&
                <div className="card-body" style={ cardBodyStyle }>{children}</div>
            }
        </div>
    )
}

export default ItemCard;