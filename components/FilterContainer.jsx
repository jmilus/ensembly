'use client'

import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import { Text } from './Vcontrols/';

const FilterContainer = (props) => {
    const { id, filterTag, search, filters = [], defaultFilter = {}, columns, rows="min-content", style, debug, children } = props;
    const [activeFilterSets, setActiveFilterSets] = useState(defaultFilter)
    const [searchString, setSearchString] = useState("")

    let tagCount = 0;

    if (debug) console.log(props)

    const clearAll = () => {
        setActiveFilterSets({})
        setSearchString("")
    }

    const toggleFilter = (filterSetName, mode, filterObject) => {
        console.log({filterObject})
        const filterKey = Object.keys(filterObject)[0]
        let tempFilterSets = { ...activeFilterSets }
        let filterSet = tempFilterSets[filterSetName] || {}
        if (mode === "exclusive") {
            filterSet = [filterObject]
        } else {
            if (filterSet[filterKey]) {
                delete filterSet[filterKey]
            } else {
                filterSet = { ...filterSet, ...filterObject }
            }
        }

        if (Object.keys(filterSet).length === 0) {
            delete tempFilterSets[filterSetName]
        } else {
            tempFilterSets[filterSetName] = filterSet
        }
        setActiveFilterSets(tempFilterSets);
    }

    const filterWithButtons = (child) => {
        return Object.keys(activeFilterSets).every(filterSetName => {
            const filterSet = activeFilterSets[filterSetName];
            console.log({ filterSet })
            return Object.keys(filterSet).some(filterCaption => {
                const filterFunction = filterSet[filterCaption]
                console.log({ filterCaption }, { filterFunction })
                if (child.props[filterSetName] != null) {
                    console.log("comparing", filterSetName, child.props[filterSetName], filterFunction)
                    if (typeof filterFunction != 'object') return child.props[filterSetName] === filterFunction;
                    return filterFunction(child.props[filterSetName]) // run the element's filterProp through the filter button's filter function
                }
                return false;
            })
        })
    }

    const filterChild = (child) => {
        console.log(child)
        if (!child.props.filterTag || child.props.filterTag != filterTag) return true;
        
        let includeChild = true;
        // filter buttons
        console.log({ activeFilterSets })
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
                        const filterCaption = Object.keys(filterObject)[0];
                        const isChecked = activeFilterSets[filter.name] ? Object.keys(activeFilterSets[filter.name]).includes(filterCaption) : false;
                        return (
                            <div key={`${f}-${o}`} id={`${id}-filter`} className={`filter-button tab-button ${isChecked ? "active" : ""}`} >
                                <label htmlFor={`${id}-${filterCaption}`} className="filter-label">
                                    <input
                                        id={`${id}-${filterCaption}`}
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleFilter(filter.name, filter.mode, filterObject)} 
                                    />
                                    {filterCaption}
                                </label>
                            </div>
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
            {tagCount > 1 &&
                <div className="filters">
                    {search &&
                        searchBox
                    }
                    {allFilterButtons}
                    {filters.length > 0 ? clearButton : null}
                </div>
            }
            <div className="filter-container-content" style={{ ["--grid-columns"]: columns.count, ["--min-width"]: columns.width, gridAutoRows: rows }}>
                { filteredChildren }
            </div>
        </div>
    )
}

export default FilterContainer;

