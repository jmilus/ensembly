import { useState, useEffect } from 'react';

const Carousel = (props) => {
    const [currentCard, setCurrentCard] = useState(0);
    const [carouselHeight, setCarouselHeight] = useState(0);

    useEffect(() => {
        const carouselChild = document.querySelector(`#${props.id} .contact-card`);
        setCarouselHeight(carouselChild.clientHeight);
    }, [])

    useEffect(() => {
        setCurrentCard(0);
    }, [props.children])



    let cardTrayContent =
        <div className="card-slider" style={{ top: -(currentCard * carouselHeight) }}>
            {props.children} 
        </div>  
    if (currentCard < 0 || props.children.length === 0) {
        cardTrayContent = props.newItem;
    }
    
    return (
        <fieldset id={props.id} className="carousel">
            <legend className="carousel-title">{props.title}</legend>
            <div className="carousel-content" style={{ height: carouselHeight }}>
                <div className="card-tray">
                    {cardTrayContent}
                </div>
                <div className="carousel-control vertical">
                    {
                        props.children.map((child, i) => {
                            return <div key={i} className={`dot${currentCard === i ? " selected" : ""}`} onClick={() => setCurrentCard(i)}></div>
                        })
                    }
                    <i className={`btn dot${currentCard < 0 ? " selected" : ""}`} onClick={() => setCurrentCard(-1)}>add_circle</i>
                </div>
            </div>
        </fieldset>
    );
}

export default Carousel;