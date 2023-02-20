export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

export const packageOptions = (obj, valuesArray) => {
    const selectionValues = Array.isArray(valuesArray) ? valuesArray : [valuesArray];
    // console.log("packaging options", obj, selectionValues)
    if (!obj) return {};
    
    let newObj = {};
    if (Array.isArray(obj)) {
        //db query
        obj.forEach(o => {
            newObj[o.id] = { ...o, selected: selectionValues.includes(o.id), value: o.value || o.id };
        });
    } else {
        //enums
        Object.keys(obj).forEach(key => {
            newObj[key] = {id: key, value: key, name: obj[key], selected: selectionValues.includes(key)}
        })
    }
    // console.log("packaged options:", {newObj})
    return newObj;
}

export const deleteRecord = async (APIURL, id) => {
    console.log("delete utility email id:", id);
    const deletedRecord = await fetch(APIURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "id": id })
    })
        .then(response => response.json())
        .then(res => {
            return res;
        })
        .catch((err, message) => {
            console.error('Could not delete record...', message);
        })
    
    return deletedRecord;
}

export const getInitials = (name) => {
    const nameArray = name.split(" ");
    return nameArray.map(n => {
        return n.substr(0, 1).toUpperCase();
    }).join("");
}

export const getErrorMessage = (code) => {
    switch (code) {
        case "P2002":
            return "Cannot create duplicate record";
        default:
            return "an unknown error occurred";
    }
}

export const formatDBObject = obj => {
	let newObj = {}
	Object.keys(obj).forEach(key => {
		let value = obj[key]
		if (value !== null) {
			// If array, loop...
			if (Array.isArray(value)) {
				value = value.map(item => {
					if (typeof item === 'object' || Array.isArray(item)) return formatDBObject(item);
					return item;
				})
			}
			// ...if property is date/time, stringify/parse...
			else if (typeof value === 'object' && typeof value.getMonth === 'function') {
				value = JSON.parse(JSON.stringify(value))
			}
			// ...and if a deep object, loop.
			else if (typeof value === 'object') {
				value = formatDBObject(value)
			} else {
			}
		}
		newObj[key] = value;
	})
	return newObj
}