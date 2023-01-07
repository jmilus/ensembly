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

    const typeDivisions = {
        chorus: [
            {
                name: "Sopranos",
                alias: "Section",
                capacity: "Performer",
                childDivisions: [
                    { name: "1st Sopranos", alias: "Subsection", capacity: "Performer" },
                    { name: "2nd Sopranos", alias: "Subsection", capacity: "Performer" }
                ]
            },
            {
                name: "Altos",
                alias: "Section",
                capacity: "Performer",
                childDivisions: [
                    { name: "1st Altos", alias: "Subsection", capacity: "Performer" },
                    { name: "2nd Altos", alias: "Subsection", capacity: "Performer" }
                ]
            },
            {
                name: "Tenors",
                alias: "Section",
                capacity: "Performer",
                childDivisions: [
                    { name: "1st Tenors", alias: "Subsection", capacity: "Performer" },
                    { name: "2nd Tenors", alias: "Subsection", capacity: "Performer" }
                ]
            },
            {
                name: "Basses",
                alias: "Section",
                capacity: "Performer",
                childDivisions: [
                    { name: "1st Basses", alias: "Subsection", capacity: "Performer" },
                    { name: "2nd Basses", alias: "Subsection", capacity: "Performer" }
                ]
            },
            {
                name: "Crew",
                alias: "Crew",
                capacity: "Crew",
                childDivisions: [
                    { name: "Hair/Makeup", alias: "Department", capacity: "Crew" },
                    { name: "Audio", alias: "Department", capacity: "Crew" },
                    { name: "Lighting", alias: "Department", capacity: "Crew" }
                ]
            },
            {
                name: "Staff",
                alias: "Department",
                capacity: "Staff"
            }
        ],
        orchestra: [
            { name: "Strings", alias: "Section", capacity: "Performer" },
            { name: "Percussion", alias: "Section", capacity: "Performer" },
            { name: "Woodwinds", alias: "Section", capacity: "Performer" },
            { name: "Brass", alias: "Section", capacity: "Performer" }
        ]
    }

    const types = await Promise.all(
        ensembleTypes.map(async type => {
            return await prisma.ensembleType.create({
                data: type,
                select: {
                    id: true,
                    name: true
                }
            })
        })
    )

    const divisions = await Promise.all(
        typeDivisions.chorus.map(async div => {
            return await prisma.division.create({
                data: {
                    name: div.name,
                    alias: div.alias,
                    capacity: div.capacity,
                    ensembleType:
                        { connect: { id: types.find(type => type.name === "chorus").id } },
                    childDivisions: div.childDivisions ? {
                        createMany: {
                            data: div.childDivisions
                        }
                    } : undefined
                },
                select: {
                    name: true,
                    id: true
                }
            });
        })
    )

    const eventTypes = await prisma.eventType.createMany({
        data: [
            {
                name: "Rehearsal",
                color: '{"type":"hsl", "values": [50, 80, 50]}'
            },
            {
                name: "Dress Rehearsal",
                color: '{"type":"hsl", "values": [100, 80, 50]}'
            },
            {
                name: "Performance",
                color: '{"type":"hsl", "values": [150, 80, 50]}'
            },
            {
                name: "Social",
                color: '{"type":"hsl", "values": [200, 80, 50]}'
            },
            {
                name: "Admin",
                color: '{"type":"hsl", "values": [250, 80, 50]}'
            },
            {
                name: "Audition",
                color: '{"type":"hsl", "values": [300, 80, 50]}'
            }
        ]
    })

    console.log({ types, divisions, eventTypes })
        
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