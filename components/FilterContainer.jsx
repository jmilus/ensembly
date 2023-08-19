'use client'

import React, { useState } from 'react';

import { Text } from './Vcontrols/';

export function FilterButtons(props) {
    const { id, buttons, filterValues = [], filterAction } = props;

    return (
        <div className="filter-buttons-set">
            {
                buttons.map((button, b) => {
                    let filterName = typeof button != 'string' ? Object.keys(button)[0] : button
                    let filterChecked = typeof button != 'string' ? filterValues.some(o => Object.keys(o)[0] === filterName) : filterValues.includes(filterName);

                    return (
                        <div key={b} id={`${id}-filter`} className={`filter-button tab-button ${filterChecked ? "active" : ""}`} >
                            <label htmlFor={`${id}-${filterName}`} className="filter-label">
                                <input
                                    id={`${id}-${filterName}`}
                                    type="checkbox"
                                    checked={filterChecked}
                                    onChange={() => filterAction(button)} 
                                />
                                {filterName}
                            </label>
                        </div>
                    ) 
                })
            }
        </div>
    )
}

const FilterContainer = (props) => {
    const { id, title, filterTag, search, filters = [], columns, rows="min-content", Vstyle, debug, children } = props;
    const [filterParams, setFilterParams] = useState({})
    const [searchString, setSearchString] = useState("")

    if (debug) console.log(props)

    const clearAll = () => {
        setFilterParams({})
        setSearchString("")
    }

    const handleFilters = (key, mode, value) => {
        let tempParams = { ...filterParams }
        let param = tempParams[key] || []
        if (mode === "exclusive") {
            param = [value]
        } else {
            const valueIndex = param.findIndex(p => p === value)
            if (valueIndex >= 0) {
                param.splice(valueIndex, 1);
            } else {
                param.push(value)
            }
        }

        tempParams[key] = param
        setFilterParams(tempParams);
    }

    const filterChild = (child) => {
        // console.log(child)
        //filter buttons
        let includeChild = true;
        includeChild = filters.every(filter => {
            if (!filterParams[filter.name]) return true;

            let anyMatch = filterParams[filter.name].length === 0;
            filterParams[filter.name].forEach(param => {
                if (typeof param === 'string') {
                    if (child.props[filter.filterProp] === param) anyMatch = true;
                } else {
                    const filterFunction = Object.values(param)[0]
                    const childProp = child.props[filter.filterProp]
                    anyMatch = filterFunction(childProp)
                }
            })
            return anyMatch;
        })
        
        //filter search
        if (includeChild && search && searchString.length > 0) {
            // console.log(child.props, searchString)
            includeChild = child.props[search?.searchProp].toLowerCase().includes(searchString.toLowerCase());
        }

        return includeChild;
    }

    const handleChildren = (childrenToHandle) => {
        // console.log(childrenToHandle)
        // console.log("handling children ***********************")
        return React.Children.map(childrenToHandle, child => {
            // console.log("**** handling child:", child)
            if (child === null) return null;
            if (!child.props) return child
            //
            if (child.props.tag === filterTag) {
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

    const filterButtons = filters.map((filter, f) => {
        return <FilterButtons key={f} id={filter.name} buttons={filter.buttons} filterValues={filterParams[filter.name]} filterAction={(v) => handleFilters(filter.name, filter.mode, v)} />
    })

    const clearButton = 
        <div className="clear-button-container">
            <i id={`${id}-clear-button`} className={`big ${""}`} onClick={clearAll}>cancel</i>
        </div>

    return (
        <div className="filter-container" style={Vstyle}>
            <div className="filters">
                {title && <h1 style={{padding: "16px 20px 0 0"}}>{title}</h1>}
                {search &&
                    <Text id={`${id}-searchbox`} label={search.label} value={searchString} clear extraAction={(v) => setSearchString(v)} Vstyle={{ flex: 1, maxWidth: "300px" }} />
                }
                {filterButtons}
                {filters.length > 0 ? clearButton : null}
            </div>
            <div className="filter-container-content" style={{ ["--grid-columns"]: columns.count, ["--min-width"]: columns.width, gridAutoRows: rows, gridTemnplateRows: "none"}}>
                { filteredChildren }
            </div>
        </div>
    )
}

export default FilterContainer;

