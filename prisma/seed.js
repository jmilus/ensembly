const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function Main() {
    let ensembleTypes = [
            {
                name: "chorus",
                typeColor: '{"type": "hsl", "values": [200, 100, 50]}'
            },
            {
                name: "orchestra",
                typeColor: '{"type": "hsl", "values": [50, 100, 50]}'
            },
            {
                name: "theater",
                typeColor: '{"type": "hsl", "values": [280, 100, 50]}'
            },
            {
                name: "dance",
                typeColor: '{"type": "hsl", "values": [350, 100, 50]}'
            }
        ]

    const types = await Promise.all(
        ensembleTypes.map(async type => {
            return await prisma.ensembleType.create({
                data: type,
                select: {
                    name: true,
                    id: true
                }
            })
        })
    )

    const ensembleTypeIds = {}
    types.forEach(type => {
        ensembleTypeIds[type.name] = type.id;
    })
    const divs = [
        { name: "Sopranos", cap: "Performer", alias: "Section", ensembleType: "chorus"},
        { name: "Altos", cap: "Performer", alias: "Section", ensembleType: "chorus"},
        { name: "Tenors", cap: "Performer", alias: "Section", ensembleType: "chorus"},
        { name: "Basses", cap: "Performer", alias: "Section", ensembleType: "chorus" },
        { name: "Administration", cap: "Staff", alias: "Department", ensembleType: "chorus" },
        { name: "Stage", cap: "Crew", alias: "Role", ensembleType: "chorus" }        
    ]

    const divisions = await Promise.all(
        divs.map(async div => {
            return await prisma.division.create({
                data: {
                    name: div.name,
                    capacity: div.cap,
                    divisionAlias: div.alias,
                    ensembleTypeId: ensembleTypeIds[div.ensembleType]
                },
                select: {
                    name: true,
                    id: true
                }
            })
        })
        
    )

    const getDivisionId = (divname) => {
        const result = divisions.find(div => {
            return div.name === divname;
        })
        return result.id
    }

    const subdivs = [
        { name: "1st Sopranos", alias: "Subsection", division: "Sopranos" },
        { name: "1st Altos", alias: "Subsection", division: "Altos" },
        { name: "1st Tenors", alias: "Subsection", division: "Tenors" },
        { name: "1st Basses", alias: "Subsection", division: "Basses" },
        { name: "2nd Sopranos", alias: "Subsection", division: "Sopranos" },
        { name: "2nd Altos", alias: "Subsection", division: "Altos" },
        { name: "2nd Tenors", alias: "Subsection", division: "Tenors" },
        { name: "2nd Basses", alias: "Subsection", division: "Basses" },
        { name: "Executive Director", alias: "Title", division: "Administration" },
        { name: "Creative Director", alias: "Title", division: "Administration" },
        { name: "Accompianist", alias: "Title", division: "Stage" }
    ]

    const subDivisions = await Promise.all(
        subdivs.map(async sd => {
            return await prisma.subDivision.create({
                data: {
                    name: sd.name,
                    subDivisionAlias: sd.alias,
                    divisionId: getDivisionId(sd.division)
                },
                select: {
                    name: true,
                    id: true
                }
            })
        })
    )

    console.log({types, divisions, subDivisions})
        
}

Main()
.then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })