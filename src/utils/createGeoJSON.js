export function createGeoJSON(data) {
    const headers = data[0]
    const idColumnIndex = headers.indexOf('id_lieu')
    const nameColumnIndex = headers.indexOf('nom_lieu')
    const lonColumnIndex = headers.indexOf('Xlong')
    const latColumnIndex = headers.indexOf('Ylat')
    let features = []
    for (const [index, row] of data.entries()) {
        if (index > 0 && row.length > 1) {
            const emptyId = row[idColumnIndex] === ''
            const feature = {
                type: "Feature",
                properties: { emptyId: emptyId, name: row[nameColumnIndex] },
                geometry: {
                    type: "Point",
                    coordinates: [
                        parseFloat(row[lonColumnIndex]),
                        parseFloat(row[latColumnIndex])
                    ]
                }
            }
            features.push(feature)
        }
    }
    return {
        type: "FeatureCollection",
        features: features
    }
}