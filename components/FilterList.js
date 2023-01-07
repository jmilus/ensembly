import { useState, useEffect } from 'react';

const FilterList = ({listSet, Elem, filters, search}) => {
    const [displayList, setDisplayList] = useState(listSet);

    const filterList = (listFilter) => {
        setDisplayList(listSet.map(item => listFilter(item)));
    }

    return (
        <div className="filter-lsit-container">
            <div className="filter-control-bar">
                {
                    filters.map((filt, f) => {
                        return <div className="filter-button" onClick={() => filterList(filt.method)}>{filt.name}</div>
                    })
                }
                {search &&
                    <input className="uncontrolled-text" type="text" placeholder="Search..." onChange={(e) => setSearchString(e.target.value)} />
                }
            </div>
            <div className="list">
                {
                    displayList.map((item, i) => {
                        return <Elem key={i} {...item} />
                    })
                }
            </div>
        </div>
    )
}

export default FilterList;