import { createGeoJSON } from '@/utils/createGeoJSON.js'

const data = [
    ['id_lieu', 'insee', 'nom_lieu', 'Xlong', 'Ylat'],
    ['75013-C-001', '75013', 'aire1', '2.5', '48'],
    ['', '75013', 'aire2', '2.51', '48.1'],
    [''],
    [],
]

test('create the GeoJSON from the parsed csv', () => {
    expect(createGeoJSON(data)).toEqual({
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: { emptyId: false, name: 'aire1' },
                geometry: {
                    type: "Point",
                    coordinates: [
                        2.5,
                        48
                    ]
                }
            },
            {
                type: "Feature",
                properties: { emptyId: true, name: 'aire2' },
                geometry: {
                    type: "Point",
                    coordinates: [
                        2.51,
                        48.1
                    ]
                }
            }
        ]
    })
})
