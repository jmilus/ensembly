'use client'

import { useRouter, usePathname } from 'next/navigation';
import { getInitials } from '../utils';
import { useDrag } from 'react-dnd';

const ItemCard = ({ classes="basic", cardType, dropItem, itemIcon, caption, subtitle, cardLinkTo, captionLinkTo, style, cardBodyStyle, highlightWhenSelectedId, children }) => {
    const router = useRouter();
    const pathname = usePathname()

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

    let selectionHighlight = pathname.includes(highlightWhenSelectedId) ? " selected" : "";

    return (
        <div
            ref={dropItem ? drag : null}
            className={`card-container ${classes}${dropItem ? " dragable" : ""}${selectionHighlight}`}
            style={{ ...style, opacity: isDragging ? 0 : 1, }}
            onClick={cardLinkTo ? () => router.push(cardLinkTo) : null}
        >
            <div className="card-header" onClick={captionLinkTo ? () => router.push(captionLinkTo) : null}>
                {dropItem && <i style={{color: "var(--gray5)", margin: "0 10px 0 0", cursor: "all-scroll"}}>drag_indicator</i>}
                {itemIcon
                    ? itemIcon
                    : <div className="hero-icon">{getInitials(caption)}</div>
                }
                {caption &&
                    <div>
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