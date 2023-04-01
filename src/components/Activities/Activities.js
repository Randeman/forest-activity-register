import React, { useState, useEffect } from "react";

import { Layers, TileLayer, VectorLayer } from "../Map/Layers";
import { osm, vector } from "../Map/Source";
import { get } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { Controls, FullScreenControl, MousePositionControl } from "../Map/Controls";
import { featureStyles as FeatureStyles } from "../Map/Features/Styles";

const mapURL = "http://localhost:3030/jsonstore/geoobjects/";
const activitiesURL = "http://localhost:3030/jsonstore/activities/";

const Activities = () => {

  const [geoObjects, setGeoObjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoadedMap, setIsLoadedMap] = useState(false);

  useEffect(() => {
    fetch(mapURL)
      .then(res => res.ok && res.status !== 204 ? res.json() : {})
      .then(data => setGeoObjects(state => Object.values(data)));
      setIsLoadedMap(true);
  }, [])

  useEffect(() => {
    fetch(activitiesURL)
      .then(res => res.ok && res.status !== 204 ? res.json() : {})
      .then(data => setActivities(state => Object.values(data)));
      
  }, [])


  return (
    <>
    <div>
      <Layers>
        <TileLayer source={osm()} zIndex={0} />
        {(!!geoObjects.length && isLoadedMap) && geoObjects.map(g =>
          <VectorLayer key={g._id}
            source={vector({
              features: new GeoJSON()
                .readFeatures(g, { featureProjection: get("EPSG:3857") })
            })}
            style={FeatureStyles[g.features[0].geometry.type]}
          />)}
      </Layers>
      <Controls >
        <FullScreenControl />
        <MousePositionControl />
      </Controls>
      </div>
      {(!activities.length && isLoadedMap) && <div>"NO ACTIVITIES YET ..."</div>}
      {(!!activities.length && isLoadedMap) && geoObjects.map(g => <div>`{JSON.stringify(g)}`</div>) }
    </>
  )
}

export default Activities;
