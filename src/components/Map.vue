<template>
  <l-map
    data-cy="map"
    ref="map"
    style="height: 400px; width: 100%"
    :zoom="3"
    :bounds="bounds"
  >
    <l-tile-layer :url="url"></l-tile-layer>
    <l-geo-json
      ref="geojson"
      :geojson="geojson"
      :options="options"
      :options-style="styleFunction"
    />
  </l-map>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LMap, LTileLayer, LGeoJson } from "@vue-leaflet/vue-leaflet";

export default {
  components: {
    LMap,
    LTileLayer,
    LGeoJson
  },
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
    this.$nextTick(() => {
      this.bounds = this.$refs.geojson.mapObject.getBounds();
    });
  },
  computed: {
    options() {
      return {
        pointToLayer: this.pointToLayer,
        onEachFeature: this.onEachFeatureFunction
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