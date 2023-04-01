import React, { useRef, useState, useEffect } from "react"
import "./Map.css";
import MapContext from "../Map/MapContext";

import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {fromLonLat} from 'ol/proj';


const MapProvider = ({ children }) => {

    const mapRef = useRef();
    const [map, setMap] = useState(null);

    const center = fromLonLat([25.328343, 42.897759]);
    const zoom = 7;

    // on component mount
    useEffect(() => {
        let options = {
            view: new View({ zoom, center }),
            layers: [],
            controls: [],
            overlays: []
        };

        let mapObject = new Map(options);
        mapObject.setTarget(mapRef.current);
        setMap(mapObject);

        return () => mapObject.setTarget(undefined);
    }, []);

    // zoom change handler
    useEffect(() => {
        if (!map) return;

        map.getView().setZoom(zoom);
    }, [zoom]);

    // center change handler
    useEffect(() => {
        if (!map) return;

        map.getView().setCenter(center)
    }, [center])



    return (
        <MapContext.Provider value={{ map }}>
            <div ref={mapRef} className="ol-map">{children}</div>
        </MapContext.Provider>
    )
}

export default MapProvider;