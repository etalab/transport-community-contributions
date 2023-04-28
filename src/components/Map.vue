<template>
  <div id="map" data-cy="map" style="height: 400px; width: 100%">
  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default {
  components: {},
  data() {
    return {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      fillColor: { emptyId: "#ffbf00", withId: "blue" },
      bounds: [
        [40.712, -74.227],
        [40.774, -74.125]
      ]
    };
  },
  props: ["geojson"],
  methods: {},
  mounted() {
    let map = L.map('map').setView([48.853, 2.348], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    let geojson = L.geoJSON(this.geojson, this.options).addTo(map);
    let bounds = geojson.getBounds()
    if (bounds.isValid()) {
      map.fitBounds(bounds);
    }
    
  },
  computed: {
    options() {
      return {
        pointToLayer: this.pointToLayer,
        onEachFeature: this.onEachFeatureFunction,
        style: this.styleFunction,
      };
    },
    pointToLayer() {
      return function(geoJsonPoint, latlng) {
        return L.circleMarker(latlng, {
          radius: 5
        });
      };
    },
    styleFunction() {
      return feature => {
        const [fillColor, fillOpacity] = feature.properties.emptyId
          ? [this.fillColor.emptyId, 1]
          : [this.fillColor.withId, 0.5];
        return {
          weight: 0,
          fillColor: fillColor,
          fillOpacity: fillOpacity
        };
      };
    },
    onEachFeatureFunction() {
      return (feature, layer) => {
        if (feature.properties.emptyId) {
          layer.bindPopup(
            `Aire dont l'identifiant va être généré automatiquement <br> Nom de l'aire : ${feature.properties.name}`
          );
        } else {
          layer.bindPopup(`Nom de l'aire : ${feature.properties.name}`);
        }
      };
    }
  }
};
</script>

<style lang="scss" scoped>
</style>