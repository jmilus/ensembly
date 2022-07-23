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
            ensembles: {
                include: {
                    ensemble: {
                        include: {
                            type: true
                        }
                    },
                    section: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
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

    const tempEnsembles = {};
    fetchedMember.ensembles.forEach((m, i) => {
        console.log(m)
        const newObj = {
            membershipId: m.id,
            ensembleName: m.ensemble.name,
            ensembleType: m.ensemble.type,
            ensembleId: m.ensembleId,
            roles: []
        }
        const role = {
            endDate: m.endDate,
            membershipId: m.id,
            startDate: m.startDate,
            status: m.status,
            name: m.role,
            section: m.section
        }

        if (!tempEnsembles[m.ensembleId]) {
            tempEnsembles[m.ensembleId] = newObj;
        } 
        tempEnsembles[m.ensembleId].roles.push(role)
    })
    fetchedMember.ensembles = tempEnsembles;


    return dateStripped(fetchedMember);
}

export default getThisMember;