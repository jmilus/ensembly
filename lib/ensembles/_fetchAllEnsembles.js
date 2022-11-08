import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const dateStripped = obj => {
	let newObj = {}
	Object.keys(obj).forEach(key => {
		let value = obj[key]
		if (value !== null) {
			// If array, loop...
			if (Array.isArray(value)) {
				value = value.map(item => {
					if (typeof item === 'object' || Array.isArray(item)) dateStripped(item);
					return item;
				})
			}
			// ...if property is date/time, stringify/parse...
			else if (typeof value === 'object' && typeof value.getMonth === 'function') {
				value = JSON.parse(JSON.stringify(value))
			}
			// ...and if a deep object, loop.
			else if (typeof value === 'object') {
				value = dateStripped(value)
			} else {
				
			}
		}
		newObj[key] = value
	})
	return newObj
}

const getAllEnsembles = async () => {
	const fetchedEnsembles = await prisma.ensemble.findMany({
		include: {
			type: true
		}
	})
    //return fetchedEnsembles;
    const processedEnsembles = fetchedEnsembles.map(ensemble => {
        return dateStripped(ensemble);
    })
    
    return processedEnsembles;
}

export default getAllEnsembles;