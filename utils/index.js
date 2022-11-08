export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

export const packageOptions = (obj) => {
    if (!obj) return [];
    
    //db query
    if (Array.isArray(obj)) {
        return obj;
    }

    //enums
    return Object.keys(obj).map(key => {
        return {id: key, value: obj[key], name: obj[key]}
    })
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