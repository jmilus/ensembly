export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
}

export const packageOptions = (obj) => {
    if (!obj) return {};
    // console.log(obj)
    
    let newObj = {};
    if (Array.isArray(obj) && obj.length > 0) {
        //db query
        obj.forEach(o => {
            if (o != undefined) {
                if (typeof o === 'string') {
                    newObj[o] = {id: o, value: o, caption: o}
                } else {
                    if (!o.id) return {}
                    if (o.type && !o.name && !o.caption && !o.value) {
                        newObj[o.id] = { ...o, value: o.id, caption: o.type }
                    } else {
                        let optionValue = o.value ? o.value : o.id;
                        let optionName = o.caption ? o.caption : o.name ? o.name : optionValue;
                        newObj[optionValue] = { ...o, value: optionValue, caption: optionName };
                    }
                }
            }
        });
    } else {
        //enums
        Object.keys(obj).forEach(key => {
            newObj[key] = { ...obj[key]}
            if (!newObj[key].id) newObj[key].id = key;
            if (!newObj[key].value) newObj[key].value = key;
            if (!newObj[key].caption) newObj[key].caption = newObj[key].name || key;
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
    if(!name) return "XX"
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
    // console.log({obj});
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

export const HEXtoHSL = (hex, valuesOnly) => {
    // Convert hex to RGB first
    let [r, g, b] = HEXtoRGB(hex, true)
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;

    let cmin = Math.min(r, g, b),
        cmax = Math.max(r, g, b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    if (valuesOnly) return [h, s, l];

    return `hsl(${h},${s}%,${l}%)`

}

export const HEXtoRGB = (hex, valuesOnly) => {
    let r = 0, g = 0, b = 0;

    // 3 digits
    if (hex.length == 4) {
        r = "0x" + hex[1] + hex[1];
        g = "0x" + hex[2] + hex[2];
        b = "0x" + hex[3] + hex[3];

    // 6 digits
    } else if (hex.length == 7) {
        r = "0x" + hex[1] + hex[2];
        g = "0x" + hex[3] + hex[4];
        b = "0x" + hex[5] + hex[6];
    }

    if (valuesOnly) return [+r, +g, +b]
        
    return `rgb(${+r},${+g},${+b})`
}

export const contrastColors = (bg, fg = [0, 0, 0]) => {
    let bgBrightness = ((bg[0] * 299) + (bg[1] * 587) + (bg[2] * 114)) / 1000;
    let fgBrightness = ((fg[0] * 299) + (fg[1] * 587) + (fg[2] * 114)) / 1000;

    // console.log({bgBrightness}, {fgBrightness})

    let brightness = Math.round(Math.abs(bgBrightness - fgBrightness))

    let difference = Math.abs(bg[0] - fg[0]) + Math.abs(bg[1] - fg[1]) + Math.abs(bg[2] - fg[2])
    
    // console.log("contrast evaluations:", { brightness }, { difference })
    
    if (brightness >= 150) return true;
    return (brightness * 3) + difference > 750
    // if (brightness > 100 && difference > 210) return true
    return false
}

export const nester = (listToNest, referenceField) => {
    const tiers = [];
    const tierMaker = (items) => {
        const idList = items.map(div => div.id)
        let currentList = [];
        let remainingList = [];
        items.forEach(item => {
            if (!idList.includes(item[referenceField])) {
                currentList.push(item)
            } else {
                remainingList.push(item);
            }
        })
        tiers.push(currentList);
        if (remainingList.length > 0) tierMaker(remainingList);
    }

    tierMaker(listToNest);

    tiers.reverse();

    tiers.forEach((tier, t) => {
        if (t + 1 < tiers.length) {
            tier.forEach(item => {
                tiers[t + 1].forEach(upper => {
                    if (upper.id === item[referenceField]) {
                        if (!upper.children) {
                            upper.children = {};
                        }
                        upper.children[item.id] = item;
                    }
                })

            })
        }
    })

    tiers.reverse()
    return tiers[0];
}

export const deduper = (array) => {
    return array.filter((item, i) => {
        return !array.slice(0, i).includes(item);
    })
}

export const validateEmail = (email) => {
    return /.+@.+\.[A-Za-z]+$/.test(email.trim())
}

export const extractFields = (formData) => {
    const iterator = [...formData.entries()]
    const data = {}
    iterator.forEach(obj => {
        const [dataKey, dataValue] = obj;
        console.log({ obj })
        if (data[dataKey]) {
            if (!Array.isArray(data[dataKey])) data[dataKey] = [data[dataKey]]
            data[dataKey].push(dataValue)
        } else {
            data[dataKey] = dataValue;
        }
    })
    return data;
}