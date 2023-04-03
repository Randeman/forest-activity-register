import { useParams } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from 'react';
import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';

import { Draw, Modify, Snap } from 'ol/interaction.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { get } from 'ol/proj.js';
import GeoJSON from "ol/format/GeoJSON";
import { osm, vector } from "../Map/Source";
import { featureStyles as FeatureStyles } from "../Map/Features/Styles";
import { Controls, FullScreenControl, MousePositionControl } from "../Map/Controls";
import { Layers, TileLayer } from "../Map/Layers";
import { fromLonLat } from 'ol/proj';

import MapContext from "../../contexts/MapContext";
import "./EditActivity.css"
import { useService } from "../../hooks/useService";
import { activityServiceFactory } from "../../services/activityService";

export const EditActivity = ({onEditActivitySubmit}) => {

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({criteriaMode: 'all'});

    const onSubmit = (data) => {
        console.log(data);
       onEditActivitySubmit(data);

    }
    console.log(errors);

    const { activityId } = useParams();
    const activityService = useService(activityServiceFactory);
    const [ {category, description, start, end, district, municipality, land, contactPerson, phoneNumber, ...values}, setValues ] = useState(null);
    
    useEffect(() => {
        activityService.getOne(activityId)
            .then(result => {
                setValues({category, description, start, end, district, municipality, land, contactPerson, phoneNumber});
                setFigure({figure});
                setCoordinates({coordinates})
                setZoomPointCoordinates({zoomPointCoordinates})
            });
    }, [activityId]);

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

    return (
        <>
           <Layers>
                <TileLayer source={osm()} zIndex={0} />
                {(isLoadedMap) && [figure].map(f =>
          <VectorLayer key={f._id}
            source={vector({
              features: new GeoJSON()
                .readFeatures(f, { featureProjection: get("EPSG:3857") })
            })}
            style={FeatureStyles[f.features[0].geometry.type]}
          />)}
            </Layers>
            <Controls>
                <FullScreenControl />
                <MousePositionControl />
            </Controls>
            {isLoadedMap && <hr />}
            {isLoadedMap && <form id="edit-form" method="post" onSubmit={handleSubmit(onSubmit)}>
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
                <textarea value={coordinates} readOnly id="data" rows="6" style={{ width: "100%" }}></textarea>
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
                <hr style={{ borderTop: "dotted 1px" }} />
                <label>Description </label>
                <textarea placeholder="Please enter a description for your activity" rows="6" style={{ width: "100%" }} 
                {...register("description", { required: true, maxLength: 1000, message: "This input is more than 1000 characters." })} />
                <div>
                    <hr style={{ borderTop: "dotted 1px" }} />
                    <label>Start </label>
                    <input type="datetime-local" placeholder="Start" {...register("start", { required: true, message: "This input is required."})} />
                    <label>End </label>
                    <input type="datetime-local" placeholder="End" {...register("end", { required: true , message: "This input is required."})} />
                </div>
                <hr style={{ borderTop: "dotted 1px" }} />
                <div>
                    <label>District </label>
                    <input type="text" placeholder="" {...register("district", { required: true, message: "This input is required." })} />
                    <label>Municipality </label>
                    <input type="text" placeholder="" {...register("municipality", { required: true, minLength: 3, message: "This input is required." })} />
                    <label>Land </label>
                    <input type="text" placeholder="" {...register("land", { required: true, message: "This input is required." })} />
                </div>
                <hr style={{ borderTop: "dotted 1px" }} />
                <div>
                    <label>Contact person </label>
                    <input type="text" placeholder="First and Last Name" {...register("contactPerson", { required: true, message: "This input is required."})} />
                    <label>Phone number </label>
                    <input type="tel" placeholder="+359*********" {...register("phoneNumber", { required: true, message: "This input is required."})} />
                </div>
                <hr style={{ borderTop: "dotted 1px" }} />
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
                    <input id='create' type="submit" value={"CREATE ACTIVITY"} />
                </div>
                <hr />
            </form>}
        </>
    );
};