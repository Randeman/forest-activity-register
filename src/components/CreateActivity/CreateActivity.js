import { useEffect, useState, useContext, useRef } from 'react';
import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';

import { Draw, Modify, Snap } from 'ol/interaction.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { get } from 'ol/proj.js';
import GeoJSON from "ol/format/GeoJSON";
import { osm } from "../Map/Source";
import { featureStyles as FeatureStyles } from "../Map/Features/Styles";
import { Controls, FullScreenControl, MousePositionControl } from "../Map/Controls";
import { Layers, TileLayer } from "../Map/Layers";
import { fromLonLat } from 'ol/proj';

import MapContext from "../../contexts/MapContext";
import "./CreateActivity.css"


export const CreateActivity = ({ onCreateActivitySubmit }) => {

    const { register, handleSubmit, setValue, setError, formState: { errors } } = useForm({ criteriaMode: 'all' });

    const onSubmit = (data) => {
        console.log(data);
        onCreateActivitySubmit(data);

    }
    

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


    const [figure, setFigure] = useState("");
    useEffect(() => {
        if (!!figure) {
            setValue("figure", figure)
        }
    }, [figure]);

    const [coordinates, setCoordinates] = useState("");
    useEffect(() => {
        if (!!coordinates) {
            setValue("coordinates", coordinates)
        }
    }, [coordinates]);

    const [zoomPointCoordinates, setZoomPointCoordinates] = useState("");
    useEffect(() => {
        if (!!zoomPointCoordinates) {
            setValue("zoomPointCoordinates", zoomPointCoordinates)
        }
    }, [zoomPointCoordinates]);

    const [district, setDistrict] = useState("");
    const [municipality, setMunicipality] = useState("");
    const [land, setLand] = useState("");
    useEffect(() => {
        if (!!zoomPointCoordinates) {
            const url = "http://api.geonames.org/findNearbyPostalCodesJSON";
            fetch(`${url}?lat=${zoomPointCoordinates[1]}&lng=${zoomPointCoordinates[0]}&maxRows=1&username=rutor`)
                .then(res => res.json())
                .then(data => {
                    setDistrict(data.postalCodes["0"] ? data.postalCodes["0"]["adminName1"] || "None" : "None");
                    setMunicipality(data.postalCodes["0"] ? data.postalCodes["0"]["adminName2"] || "None" : "None");
                    setLand(data.postalCodes["0"] ? data.postalCodes["0"]["placeName"] || "None" : "None")
                }).catch(err => console.log(err))
                
        }
    }, [zoomPointCoordinates, district, municipality, land]);

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
            const drawFeature = e.feature

            setCoordinates(JSON.stringify(drawFeature
                .getGeometry()
                .clone()
                .transform("EPSG:3857", "EPSG:4326")
                .getCoordinates(),
                null, 0));

            setFigure(new GeoJSON().writeFeatures([drawFeature], { featureProjection: get("EPSG:3857") }));
            setZoomPointCoordinates(drawFeature.getGeometry().clone()
                .transform("EPSG:3857", "EPSG:4326").getFirstCoordinate());

            drawFeature.setStyle(FeatureStyles[drawFeature.getGeometry().getType()]);

            vectorLayer.current.setMap(map);

            map.removeInteraction(draw);
            map.removeInteraction(snap);


        });

        modify.on('modifyend', function (e) {

            const modifyFeature = e.features.getArray()[0]


            setCoordinates(JSON.stringify(modifyFeature
                .getGeometry()
                .clone()
                .transform("EPSG:3857", "EPSG:4326")
                .getCoordinates(),
                null, 0));

            setFigure(new GeoJSON().writeFeatures([modifyFeature], { featureProjection: get("EPSG:3857") }));
            setZoomPointCoordinates(modifyFeature.getGeometry().clone()
                .transform("EPSG:3857", "EPSG:4326").getFirstCoordinate());

            modifyFeature.setStyle(FeatureStyles[modifyFeature.getGeometry().getType()]);

            vectorLayer.current.setMap(map);

        });


    }

    const [downloadLinkGeo, setDownloadLinkGeo] = useState('')
    const loadFile = () => {

        const blob = new Blob([figure], { type: "aplication/json" });
        if (downloadLinkGeo !== '') window.URL.revokeObjectURL(downloadLinkGeo)
        setDownloadLinkGeo(window.URL.createObjectURL(blob));

    }

    useEffect(() => {
        loadFile()
    }, [figure])

    const onFigureDelete = (e) => {
        e.preventDefault();
        map.removeInteraction(modify);
        map.removeInteraction(draw);
        map.removeInteraction(snap);

        vectorLayer.current.setMap(null);
        vectorLayer.current.getSource().clear();

        setCoordinates("");
        setZoomPointCoordinates("");
        setDistrict("");
        setMunicipality("");
        setLand("");
        setGeomType(e.target.value)

        if (e.target.id === "geomType") return;
        setGeomType("");
    }

    const onChangeGeomType = (e) => {
        e.preventDefault();
        if (!geomType) return onFigureDelete(e);
        if (window.confirm('A figure can be drawn with one of the types presented. If a figure has been drawn, it will be deleted!')) {
            onFigureDelete(e);
        }

    }


    const onZoom = () => {

        map.getView().setCenter(fromLonLat(zoomPointCoordinates));
        map.getView().setZoom(12);
    }


    //onBlur={e => {window.confirm('If a figure has been drawn, it will be deleted!') && onFigureDelete(e)}}

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
            {isLoadedMap && <form id="create-form" method="post" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>Geometry type </label>
                    <select id="geomType" value={geomType} onChange={e => onChangeGeomType(e)}>
                        <option onPop hidden value="">--Choose type--</option>
                        <option value="Point">Point</option>
                        <option value="LineString">LineString</option>
                        <option value="Polygon">Polygon</option>
                    </select>
                    {["LineString", "Polygon"].includes(geomType) && <i >For free drawing press the Shift key</i>}
                </div>
                <label>Longitude/Latitude coordinates(EPSG:4326, WGS84)</label>
                <textarea value={coordinates || ""} readOnly id="data" rows="6" style={{ width: "100%" }}></textarea>
                <div>
                    <label>District </label>
                    <input value={district || ""}  type="text" placeholder="" {...register("district", { required: true, message: "This input is required." })} />
                    <label>Municipality </label>
                    <input value={municipality || ""}  type="text" placeholder="" {...register("municipality", { required: true, minLength: 3, message: "This input is required." })} />
                    <label>Land </label>
                    <input value={land || ""}  type="text" placeholder="" {...register("land", { required: true, message: "This input is required." })} />
                </div>
                <div className='actions'>
                    <button type="button" id="delete" onClick={(e) => onFigureDelete(e)} >
                        Delete current figure
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
                    <select {...register("category", { required: true })}>
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
                <label>Description </label>
                <textarea placeholder="Please enter a description for your activity" rows="6" style={{ width: "100%" }}
                    {...register("description", { required: true, maxLength: 1000, message: "This input is more than 1000 characters." })} />
                <div>
                    
                    <label>Start </label>
                    <input type="datetime-local" placeholder="Start" {...register("start", { required: true, message: "This input is required." })} />
                    <label>End </label>
                    <input type="datetime-local" placeholder="End" {...register("end", { required: true, message: "This input is required." })} />
                </div>
                
                <div>
                    <label>Contact person </label>
                    <input type="text" placeholder="First and Last Name" {...register("contactPerson", { required: true, message: "This input is required." })} />
                    <label>Phone number </label>
                    <input type="tel" placeholder="+359*********" {...register("phoneNumber", { required: true, message: "This input is required." })} />
                </div>
                <hr />
                <ErrorMessage
                    errors={errors}
                    name="multipleErrorInput"
                    render={({ messages }) =>
                        messages &&
                        Object.entries(messages).map(([type, message]) => (
                            <p key={type}>{message}</p>
                        ))
                    }
                />
                <div className='actions'>
                    <input id='submit' type="submit" value={"CREATE ACTIVITY"} />
                </div>
            </form>}
            {isLoadedMap && <hr />}

        </>
    );
}

