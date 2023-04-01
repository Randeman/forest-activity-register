import React, { useEffect, useState, useContext, useRef } from 'react';
import { useForm } from "react-hook-form";

import { Draw, Modify, Snap } from 'ol/interaction.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { get } from 'ol/proj.js';
import GeoJSON from "ol/format/GeoJSON";
import { osm } from "../Map/Source";
import { featureStyles as FeatureStyles } from "../Map/Features/Styles";
import { Controls, FullScreenControl, MousePositionControl } from "../Map/Controls";
import { Layers, TileLayer } from "../Map/Layers";

import MapContext from "../Map/MapContext";
import "./CreateActivity.css"

import {fromLonLat} from 'ol/proj'

const CreateActivity = () => {

    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const onSubmit = data => console.log(data);
    console.log(errors);

    const { map } = useContext(MapContext);

    const [isLoadedMap, setIsLoadedMap] = useState(false);

    useEffect(() => {
        setIsLoadedMap(true);
    }, [])

    const [geomType, setGeomType] = useState("");

    useEffect(() => {
        if (!geomType || !map) return;
        addInteractions();

    }, [geomType])

    const source = useRef(new VectorSource({
        features: [],
    }));

    const vectorLayer = useRef(new VectorLayer({
        source: source.current,
    }));


    let modify, draw, snap; // global so we can remove them later


    const [geoObject, setGeoObject] = useState({});
    const [coordinates, setCoordinates] = useState("");
    useEffect(() => {
        if (!!coordinates) {
            setValue("Coordinates", coordinates)}
    }, [coordinates]);

    function addInteractions() {

        modify = new Modify({ source: source.current });
        map.addInteraction(modify);
        draw = new Draw({
            source: source.current,
            type: !!geomType ? geomType : "Point",
        });
        map.addInteraction(draw);
        snap = new Snap({ source: source.current });
        map.addInteraction(snap);


        draw.once('drawend', function (e) {
            const drawFeature = e.feature;
            console.log(drawFeature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").getCoordinates());
            setCoordinates(state => state+JSON.stringify(drawFeature
                .getGeometry()
                .clone()
                .transform("EPSG:3857", "EPSG:4326")
                .getCoordinates(),
                null, 0));
            console.log(drawFeature);
            setGeoObject(new GeoJSON().writeFeatures([drawFeature], { featureProjection: get("EPSG:3857") }));

            drawFeature.setStyle(FeatureStyles[drawFeature.getGeometry().getType()]);

            vectorLayer.current.setMap(map);

            map.removeInteraction(draw);
            map.removeInteraction(snap);


        });

        modify.on('modifyend', function (e) {
            console.log(e)
            const modifyFeature = e.features.getArray()[0];
            console.log(modifyFeature.getGeometry().clone().transform("EPSG:3857", "EPSG:4326").getCoordinates());
            setCoordinates(JSON.stringify(modifyFeature
                .getGeometry()
                .clone()
                .transform("EPSG:3857", "EPSG:4326")
                .getCoordinates(),
                null, 0));
            setGeoObject(new GeoJSON().writeFeatures([modifyFeature], { featureProjection: get("EPSG:3857") }));

            modifyFeature.setStyle(FeatureStyles[modifyFeature.getGeometry().getType()]);

            vectorLayer.current.setMap(map);

        });


    }

    const [downloadLinkGeo, setDownloadLinkGeo] = useState('')
    const loadFile = () => {
        console.log(geoObject);
        const blob = new Blob([geoObject], { type: "aplication/json" });
        if (downloadLinkGeo !== '') window.URL.revokeObjectURL(downloadLinkGeo)
        setDownloadLinkGeo(window.URL.createObjectURL(blob));

    }

    useEffect(() => { loadFile() }, [geoObject])

    const onFeaturesDelete = (e) => {
        e.preventDefault();
        map.removeInteraction(modify);
        map.removeInteraction(draw);
        map.removeInteraction(snap);

        vectorLayer.current.setMap(null);
        vectorLayer.current.getSource().clear();

        setCoordinates("");
        setGeomType(e.target.value)

        if (e.target.id === "geomType") return;
        setGeomType("");
    }

    const onChangeGeomType = (e) => {
        e.preventDefault();
        if (!geomType) return onFeaturesDelete(e);
        if (window.confirm('If a feature has been drawn, it will be deleted!')) {
            onFeaturesDelete(e);
        }

    }

    const onZoom = () => {
        console.log(JSON.parse(coordinates));
        //map.getView().setCenter(fromLonLat(JSON.parse(coordinates)));
        //map.getView().setZoom(12);
    }

    return (
        <>
            <Layers>
                <TileLayer source={osm()} zIndex={0} />
                {/* <VectorLayer /> */}
            </Layers>
            <Controls>
                <FullScreenControl />
                <MousePositionControl />
            </Controls>
            {isLoadedMap && <hr />}
            {isLoadedMap && <form id="options-form" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>Geometry type </label>
                    <select id="geomType" value={geomType} onChange={e => onChangeGeomType(e)}>
                        <option hidden value="">--Choose type--</option>
                        <option value="Point">Point</option>
                        <option value="LineString">LineString</option>
                        <option value="Polygon">Polygon</option>
                    </select>
                    {["LineString", "Polygon"].includes(geomType) && <i >For free drawing press the Shift key</i>}
                </div>
                <label>Longitude/Latitude coordinates(EPSG:4326, WGS84): </label>
                <textarea value={coordinates} readOnly id="data" rows="6" style={{ width: "100%" }}></textarea>
                <div className='actions'>
                    <button type="button" id="delete" onClick={(e) => onFeaturesDelete(e)} >
                        Delete current feature
                    </button>
                    <button id="load" type="button">
                        <a download='geo.json' style={{ textDecorationLine: "none" }} href={downloadLinkGeo}>Download as GeoJSON file
                        </a>
                    </button>
                    <button id="zoom" type="button" onClick={onZoom} >
                        Zoom
                    </button>
                </div>
                <hr />
                <div>
                    <label>Category </label>
                    <select {...register("Category", { required: true })}>
                        <option hidden value="">--Choose category--</option>
                        <option value="Logging">Logging</option>
                        <option value="Hunting">Hunting</option>
                        <option value="Forestation">Forestation</option>
                        <option value="Tourism">Tourism</option>
                        <option value="Sport">Sport</option>
                        <option value="Maintenance and Repair of technical infrastructure">Maintenance and Repair of technical infrastructure</option>
                        <option value="Picking Mushrooms, Berries and Herbs">Picking Mushrooms, Berries and Herbs</option>
                        <option value="Another">Another</option>
                    </select>
                </div>
                <hr style={{ borderTop: "dotted 1px" }} />
                <label>Description </label>
                <textarea placeholder="Description" rows="6" style={{ width: "100%" }} {...register("Description", { required: true, max: 4000, min: 10 })} />
                <div>
                    <hr style={{ borderTop: "dotted 1px" }} />
                    <label>Start </label>
                    <input type="datetime-local" placeholder="Start" {...register("Start", { required: true })} />
                    <label>End </label>
                    <input type="datetime-local" placeholder="End" {...register("End", {})} />
                </div>
                <hr style={{ borderTop: "dotted 1px" }} />
                <div>
                    <label>District </label>
                    <input type="text" placeholder="" {...register("District", { required: true, max: 30, min: 3 })} />
                    <label>Municipality </label>
                    <input type="text" placeholder="" {...register("Municipality", { required: true, max: 30, min: 3 })} />
                    <label>Land </label>
                    <input type="text" placeholder="" {...register("Land", { required: true, max: 30, min: 3 })} />
                </div>
                <hr style={{ borderTop: "dotted 1px" }} />
                <div>
                    <label>Contact person </label>
                    <input type="text" placeholder="First and Last Name" {...register("Contact person", { required: true, max: 30, min: 3 })} />
                    <label>Phone number </label>
                    <input type="tel" placeholder="+359*********" {...register("Phone number", { required: true })} />
                </div>
                <hr style={{ borderTop: "dotted 1px" }} />
                <div className='actions'>
                    <input id='create' type="submit" value={"CREATE ACTIVITY"} />
                </div>
                <hr />
            </form>}
        </>
    );
}

export default CreateActivity;