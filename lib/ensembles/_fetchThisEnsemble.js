import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

const dateStripped = obj => {
	let newObj = {}
	Object.keys(obj).forEach(key => {
		let value = obj[key]
		if (value !== null) {
			// If array, loop...
			if (Array.isArray(value)) {
				value = value.map(item => dateStripped(item))
			}
			// ...if property is date/time, stringify/parse...
			else if (typeof value === 'object' && typeof value.getMonth === 'function') {
				value = JSON.parse(JSON.stringify(value))
			}
			// ...and if a deep object, loop.
			else if (typeof value === 'object') {
				value = dateStripped(value)
			}
		}
		newObj[key] = value
	})
	return newObj
}

const getThisEnsemble = async (id) => {
    const fetchedEnsemble = await prisma.ensemble.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
			membership: {
				include: {
					member: true,
					division: true,
					subDivision: true
				}
			},
			type: true
        }
    })

	return dateStripped(fetchedEnsemble);
}

export default getThisEnsemble;