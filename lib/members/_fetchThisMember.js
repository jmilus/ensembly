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

const getThisMember = async (id) => {
    const fetchedMember = await prisma.member.findUnique({
        where: {
            id: id
        },
        include: {
            memberBio: {
                include: {
                    photos: true
                }
            },
            memberships: {
                include: {
                    ensemble: {
                        include: {
                            type: true
                        }
                    },
                    division: true,
                    subDivision: true
                }
            },
            phoneNumbers: true,
            addresses: true,
            emails: {
                orderBy: {
                    rank: 'asc'
                }
            }
        }
    })
    
    console.log("API", {fetchedMember});

    const tempEnsembles = {};
    fetchedMember.memberships.forEach((m, i) => {
        console.log(m)
        const newObj = {
            id: m.ensembleId,
            name: m.ensemble.name,
            type: m.ensemble.type,
            capacities: []
        }
        const capacity = {
            membershipId: m.id,
            startDate: m.startDate,
            endDate: m.endDate,
            status: m.status,
            name: m.capacity,
            division: m.division,
            subDivision: m.subDivision
        }

        if (!tempEnsembles[m.ensembleId]) {
            tempEnsembles[m.ensembleId] = newObj;
        } 
        tempEnsembles[m.ensembleId].capacities.push(capacity)
    })
    fetchedMember.ensembles = tempEnsembles;


    return dateStripped(fetchedMember);
}

export default getThisMember;