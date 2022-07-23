const membersList = [
    {
        id: '1',
        bio: {
            name: "Josephine Burkley",
            birthday: "November 15, 1983",
            photo: "https://images.squarespace-cdn.com/content/v1/53ed0e3ce4b0c296acaeae80/1584577530134-Y4EZ3YKZPO2JAISHDO50/Alix-Lloyd-343-DHWEB%2BHeadshot%2BPhotography%2Bby%2BAaron%2BLucy%2BDenver%2BColorado%2BHeadshots%2BPhotographer.jpg?format=2500w",
            sex: "female",
            height: `5' 8"`,
            weight: 135,
            race: "white",
            eyes: "blue",
            hair: "brown"
        },
        contact: {
            email: { personal: "joburkley@gmail.com", work: "jburkley@officemates.com" },
            phone: { mobile: "610-821-9941" },
            address: { home: { street: "2170 E. Hills Dr.", city: "Orpheum", state: "CO", zip: "80933" } }
        },
        ensembles: {
            ["CS Chorale"]: [{ competence: "singer", section: "soprano", class: "soprano-1" }]
        }
    },
    {
        id: 2,
        bio: {
            name: "George Kantos",
            birthday: "March 22, 1974",
            photo: "https://www.coloradospringsheadshots.com/wp-content/uploads/2019/01/Colorado-Springs-Business-Headshot-1024x819.jpg",
            sex: "male",
            height: `5' 9"`,
            weight: 190,
            race: "white",
            eyes: "blue",
            hair: "gray"
        },
        contact: {
            email: { personal: "captainkantos@yahoo.com" },
            phone: { home: "788-215-0094", mobile: "788-331-2050" },
            address: { home: { street: "345 Bayhop St.", city: "Orpheum", state: "CO", zip: "80933" } }
        },
        ensembles: {
            ["CS Chorale"]: [{ competence: "singer", section: "tenor", class: "tenor-2", role: "tenor captain" }],
            ["CS Players"]: [{ competence: "actor" }, { competence: "director" }]
        },
        roles: ["staff", "coordinator"]
    },
    {
        id: 3,
        bio: {
            name: "Caroline Degray",
            birthday: "July 21, 1993",
            photo: "https://images.squarespace-cdn.com/content/v1/53026ab4e4b0649958df1a45/1561570934019-G266ICY40D51GT0PGO3R/Best+CEO+Executive+portraits+actors+headshots+personal+portraiture+fine+art+portraits+head+shot+nyc+tess+steinkolk+new+york+city+master+photographer+photographs+photography+corporate+ny-.jpg?format=2500w",
            sex: "female",
            height: `5' 2"`,
            weight: 118,
            race: "African-American",
            eyes: "brown",
            hair: "brown"
        },
        contact: {
            email: { personal: "caroline.degray@hotmail.com" },
            phone: { mobile: "610-344-7711" },
            address: { home: { street: "1710 W. Palm Ave. #210", city: "Preekers", state: "CO", zip: "80912" } }
        },
        ensembles: {
            ["CS Chorale"]: [{ competence: "singer", section: "alto", class: "alto-1" }],
            ["CS Ballet"]: [{ competence: "dancer", class: "chorus" }]
        }
    },
    {
        id: 4,
        bio: {
            name: "Randall Grease",
            birthday: "April 12, 1982",
            photo: "https://images.squarespace-cdn.com/content/v1/53ed0e3ce4b0c296acaeae80/1584577511464-8FDZYWQVXUI1OBS4VTZP/Bonneville14082-Edit-DHWEB%2BNick%2BFerguson%2BDenver%2BBroncos%2BHeadshot%2BPhotography%2Bby%2BAaron%2BLucy%2BDenver%2BColorado%2BHeadshots%2BPhotographer.jpg?format=2500w",
            sex: "male",
            height: `6' 2"`,
            weight: 215,
            race: "African-American",
            eyes: "brown",
            hair: "black"
        },
        contact: {
            email: { personal: "greasemonkey@yahoo.com" },
            phone: { mobile: "440-617-2333" },
            address: { home: { street: "2112 Corporal St.", city: "Preekers", state: "CO", zip: "80912" } }
        },
        ensembles: {
            ["CS Chorale"]: [{ competence: "singer", section: "bass", class: "bass-2" }]
        }
    },
    {
        id: 5,
        bio: {
            name: "Patrice Yu",
            birthday: "October 1, 1988",
            photo: "https://www.sacmag.com/wp-content/uploads/sites/50/2020/12/HI_RES_FIN_IMG_8626.jpg",
            sex: "female",
            height: `5' 4"`,
            weight: 106,
            race: "East-Asian",
            eyes: "brown",
            hair: "brown"
        },
        contact: {
            email: { personal: "yu.patrice@gmail.com" },
            phone: { mobile: "610-310-9765" },
            address: { home: { street: "15 Chantel Ct.", city: "Orpheum", state: "CO", zip: "80934" } }
        },
        ensembles: {
            ["CS Chorale"]: [{ competence: "singer", section: "alto", class: "alto-1" }],
        }
    },
    {
        id: 6,
        bio: {
            name: "Arthur Conway",
            birthday: "January 21, 1959",
            photo: "https://images.squarespace-cdn.com/content/v1/5528a968e4b02ed06b8e918e/1488345363184-JKKV7AZI9078J9HMXCKU/00-male-beard-actor-headshots-denver.jpg?format=1000w",
            sex: "male",
            height: `5' 11"`,
            weight: 197,
            race: "White",
            eyes: "brown",
            hair: "gray"
        },
        contact: {
            email: { personal: "artconway@aol.com" },
            phone: { mobile: "610-571-0015" },
            address: { home: { street: "25111 W. Maple Grove Ave.", city: "Orpheum", state: "CO", zip: "80933" } }
        },
        ensembles: {
            ["CS Chorale"]: [{ competence: "singer", section: "tenor", class: "tenor-2" }]
        }
    },
    {
        id: 7,
        bio: {
            name: "Carey Poole",
            birthday: "February 29, 1976",
            photo: "https://www.justheadshots.photo/wp-content/uploads/2020/04/Dark-background-headshots-015.jpg",
            sex: "male",
            height: `5' 9"`,
            weight: 195,
            race: "White",
            eyes: "hazel",
            hair: "gray"
        },
        contact: {
            email: { personal: "cpoole76@hotmail.com" },
            phone: { mobile: "610-693-1030" },
            address: { home: { street: "370 N. Hooper Pl.", city: "Preekers", state: "CO", zip: "80912" } }
        },
        ensembles: {
            ["CS Chorale"]: [{ competence: "singer", section: "tenor", class: "tenor-1" }]
        }
    },
    {
        id: 8,
        bio: {
            name: "Cheryl Washington",
            birthday: "March 30, 1967",
            photo: "https://philcantor.com/images/Business-Headshots-13.jpg",
            sex: "female",
            height: `5' 10"`,
            weight: 145,
            race: "African-American",
            eyes: "brown",
            hair: "gray"
        },
        contact: {
            email: { personal: "sunrisesmiles99@yahoo.com" },
            phone: { mobile: "310-224-0496" },
            address: { home: { street: "660 Practical Cr. #4", city: "Preekers", state: "CO", zip: "80912" } }
        },
        ensembles: {
            ["CS Chorale"]: [{ competence: "singer", section: "alto", class: "alto-2" }]
        }
    },
    {
        id: 9,
        bio: {
            name: "Jane McRay",
            birthday: "August 3, 1970",
            photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2xB0ydHdUT6E00zeCkplxPg3q4FZy2D6yxw&usqp=CAU",
            sex: "female",
            height: `5' 7"`,
            weight: 155,
            race: "White",
            eyes: "blue",
            hair: "blonde"
        },
        contact: {
            email: { personal: "bubblekittens@hotmail.com" },
            phone: { mobile: "615-707-2901" },
            address: { home: { street: "1095 Winston Rd.", city: "Preekers", state: "CO", zip: "80912" } }
        },
        ensembles: {
            ["CS Chorale"]: [{ competence: "singer", section: "soprano", class: "soprano-2" }]
        }
    },
    {
        id: 10,
        bio: {
            name: "Trevor Platt",
            birthday: "July 5, 1990",
            photo: "https://www.lensrentals.com/blog/media/2016/02/Cinematic-Headshots-1.jpg",
            sex: "male",
            height: `6' 4"`,
            weight: 200,
            race: "White",
            eyes: "brown",
            hair: "brown"
        },
        contact: {
            email: { personal: "skifan90@gmail.com" },
            phone: { mobile: "303-330-0951" },
            address: { home: { street: "3344 Yorka Ave. #355", city: "Orpheum", state: "CO", zip: "80933" } }
        },
        ensembles: {
            ["CS Chorale"]: [{ competence: "singer", section: "bass", class: "bass-1" }]
        }
    }
]

const ensembles = [
    {
        id: 1,
        name: "CS Chorale",
        type: "choir",
        competency: "singer",
        sections: [
            { name: "soprano", color: "hsl(100, 90%, 50%)", classes: ["soprano-1", "soprano-2"] },
            { name: "alto", color: "red", classes: ["alto-1", "alto-2"] },
            { name: "tenor", color: "green", classes: ["tenor-1", "tenor-2"] },
            { name: "bass", color: "blue", classes: ["bass-1", "bass-2"] }
        ]
    },
    {
        id: 2,
        name: "CS Players",
        type: "theater",
        competency: "drama",
        sections: [
            { name: "cast", classes: ["lead", "background", "understudy"] },
            { name: "crew", classes: ["lighting", "rigging", "audio", "wardrobe", "makeup", "set design", "directtion"] }
        ]
    },
    {
        id: 3,
        name: "CS Ballet",
        type: "dance",
        competency: "dance",
        sections: [
            { name: "cast", classes: ["lead", "background", "understudy"] }
        ]
    }
]


export { ensembles, membersList };