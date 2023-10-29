'use client'

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import { Text } from './Vcontrols/';

const FilterContainer = (props) => {
    const { id, filterTag, search, filters = [], defaultFilter = {}, minimum=1, style, debug, children } = props;
    const [activeFilterSets, setActiveFilterSets] = useState(defaultFilter)
    const [searchString, setSearchString] = useState("")

    let tagCount = 0;

    if (debug) console.log(props)

    const clearAll = () => {
        setActiveFilterSets({})
        setSearchString("")
    }

    const toggleFilter = (filter, filterParam) => {
        console.log({ filter }, { filterParam })
        let tempFilterSets = filter.mode === "exclusive" ? {} : { ...activeFilterSets }
        let filterSet = tempFilterSets[filter.name] || { filterParams: {} }
        
        if (filterSet.filterParams[filterParam.caption] != undefined) {
            delete filterSet.filterParams[filterParam.caption]
        } else {
            filterSet = { ...filter, filterParams: _.isEmpty(filterSet.filterParams) ? { } : {...filterSet.filterParams} }
            filterSet.filterParams[filterParam.caption] = { ...filterParam };
        }
        
        if (tempFilterSets[filter.name] && Object.keys(tempFilterSets[filter.name].filterParams).length === 0) {
            delete tempFilterSets[filter.name]
        } else {
            tempFilterSets[filter.name] = filterSet
        }
        setActiveFilterSets(tempFilterSets);
    }

    const filterWithButtons = (child) => {
        return Object.keys(activeFilterSets).every(filterSetName => {
            const filterSet = activeFilterSets[filterSetName];
            return Object.keys(filterSet.filterParams).some(filterParamKey => {
                if (child.props[filterSet.filterBy] != null) {
                    console.log({ filterSet })
                    const filterValue = filterSet.filterParams[filterParamKey].value != undefined ? filterSet.filterParams[filterParamKey].value : filterSet.filterParams[filterParamKey].caption
                    switch (typeof filterValue) {
                        case 'string':
                            if (filterSet.exactMatch) return child.props[filterSet.filterBy] === filterValue;
                            return child.props[filterSet.filterBy].includes(filterValue);
                        case 'boolean':
                        case 'number':
                            return child.props[filterSet.filterBy] === filterValue;
                        case 'object':
                            return filterValue(child.props[filterSet.filterBy]);
                        default:
                            return true;
                    }
                }
                return false;
            })
        })
    }

    const filterChild = (child) => {
        if (!child.props.filterTag || child.props.filterTag != filterTag) return true;
        
        let includeChild = true;
        // filter buttons
        includeChild = filterWithButtons(child)
            
        // search string
        if (includeChild && search && searchString.length > 0) {
            // console.log(child.props, searchString)
            includeChild = child.props[search?.searchProp].toLowerCase().includes(searchString.toLowerCase());
        }

        return includeChild;
    }

    const handleChildren = (childrenToHandle) => {
        return React.Children.map(childrenToHandle, child => {
            // console.log("**** handling child:", child)
            if (child === null) return null;
            if (!child.props) return child
            //
            if (child.props.filterTag === filterTag) {
                tagCount++;
                const includeChild = filterChild(child);
                if (includeChild) return child;
                return null;
            }
            if (child.props.children) {
                const newChildren = handleChildren(child.props.children);
                return React.cloneElement(child, null, newChildren)
            } else {
                return child;
            }
        })
    }

    const filteredChildren = handleChildren(children)

    const allFilterButtons = filters.map((filter, f) => {
        return (
            <div key={f} className="filter-buttons-set">
                {
                    filter.buttons.map((filterObject, o) => {
                        const { caption, value } = filterObject;
                        // console.log(activeFilterSets[filter.name])
                        const isChecked = activeFilterSets[filter.name] ? Object.keys(activeFilterSets[filter.name].filterParams).includes(caption) : false;
                        return (
                            <label key={`${f}-${o}`} id={`${id}-filter`} htmlFor={`${id}-${caption}`} className={`filter-button tab-button ${isChecked ? "active" : ""}`}>
                                <input
                                    id={`${id}-${caption}`}
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleFilter(filter, filterObject)} 
                                />
                                {caption}
                            </label>
                        ) 
                    })
                }
            </div>
        )
    })

    const clearButton = 
        <div className="clear-button-container">
            <i id={`${id}-clear-button`} className={`big ${""}`} onClick={clearAll}>cancel</i>
        </div>
    
    const searchBox = <Text id={`${id}-searchbox`} label={search?.label} value={searchString} clear extraAction={(v) => setSearchString(v)} style={{ flex: 1, maxWidth: "300px", minWidth: "150px" }} />
    
    let searchContainer;
    if (typeof window !== 'undefined') searchContainer = document.getElementById(`${id}-search`)
    
    if (searchContainer && search) createPortal(searchBox, searchContainer)

    return (
        <div className="filter-container" style={style}>
            {tagCount > minimum &&
                <div className="filters">
                    {search &&
                        searchBox
                    }
                    {allFilterButtons}
                    {filters.length > 0 ? clearButton : null}
                </div>
            }
            <div className="filter-container-content">
                { filteredChildren }
            </div>
        </div>
    )
}

export default FilterContainer;

