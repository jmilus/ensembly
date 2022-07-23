export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

export const packageEnum = (obj) => {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;

    return Object.keys(obj).map(key => {
        return {id: key, name: obj[key]}
    })
}

export const processForm = (event) => {
    event.preventDefault();

    // console.log("submit action", { event });

    const formData = {};
    Object.keys(event.target).forEach(itemKey => {
        const field = event.target[itemKey];
        if (field.nodeName === "INPUT" || field.nodeName === "SELECT") {
            if (field.attributes["data-realvalue"]) {
                formData[field.name] = field.attributes["data-realvalue"].value
            } else {
                
                formData[field.name] = field.value;
            }

            //if(field.attributes[])
        }
        
    });

    console.log({ formData })

    return formData;
}

export const handleFormUpdate = async (event, APIURL, ids) => {
    const { recordId, linkedId } = ids;

    const formData = processForm(event);
    formData.id = recordId;
    formData.linkedId = linkedId;

    const updatedRecord = await fetch(APIURL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(record => {
            console.log({ record });
            return record;
        })
        .catch((err, message) => {
            console.error('Could not update record...', message);
            return err;
        })

    return updatedRecord;

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
    const trimName = name.join("").replace(/\W/gm);
    return Array.from(trimName, (n) => {
        return n === n.toUpperCase() ? n : null;
    }).join("");
}