import * as olSource from "ol/source";

function osm() {
	return new olSource.XYZ({
        url: "http://mt0.google.com/vt/lyrs=y&hl=bg&x={x}&y={y}&z={z}",
      });
}

export default osm;