import { useParams, useNavigate } from "react-router-dom";
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

export const EditActivity = ({ onEditActivitySubmit }) => {


    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        clearErrors,
        trigger,
        watch,
        reset } = useForm({ criteriaMode: "all" });

    const onSubmit = (data, e) => {
        e.preventDefault();
        onEditActivitySubmit(data);
        navigate('/activities');
        onFigureDelete(e);
    }

    console.log(errors);

    const { activityId } = useParams();
    const activityService = useService(activityServiceFactory);
    const [{ category, description, start, end, contactPerson, phoneNumber, ...values }, setValues] = useState({ 
        category: "", 
        description: "",
        start: "", 
        end: "", 
        contactPerson: "", 
        phoneNumber: "",
         });

    useEffect(() => {
        activityService.getOne(activityId)
            .then(result => {
                console.log(result);
                // setValues({ category, description, start, end, district, municipality, land, contactPerson, phoneNumber });
                // setFigure(figure);
                // setCoordinates({ coordinates })
                // setZoomPointCoordinates({ zoomPointCoordinates })
                Object.entries(result).forEach(([key, value]) => {
                    if(key === "figure"){
                        setValue(key, value)
                        setValue("geomType", JSON.parse(value).features[0].geometry.type)
                    }
                    else if(key === "start" || key === "end" ){
                        setValue(key, new Date(value.slice(-1)))
                    }
                    else{
                        setValue(key, value)
                    }
                });
                
            });
    }, [activityId]);



    const navigate = useNavigate();

    const { map } = useContext(MapContext);

    const [isLoadedMap, setIsLoadedMap] = useState(false);

    useEffect(() => {
        setIsLoadedMap(true);
    }, [])

    const [geomType, setGeomType] = useState("");
    const [figure, setFigure] = useState("");
    useEffect(() => {
        if (!!figure) {
            setValue("figure", figure)
        }
    }, [figure]);

    useEffect(() => {
        if (!geomType || !map || !figure) return;
        addInteractions();

    }, [geomType, figure])
    

    // const source = useRef(vector({
    //     features: new GeoJSON()
    //       .readFeatures(JSON.parse(figure), { featureProjection: get("EPSG:3857") })
    //   }));

    // const vectorLayer = useRef(new VectorLayer({
    //     source: source.current,
    // }));


    let modify, draw, snap; // global so we can remove them later



    const [coordinates, setCoordinates] = useState("");
    useEffect(() => {
        if (!!coordinates) {
            setValue("coordinates", coordinates)
            clearErrors("coordinates");
        }
    }, [coordinates]);

    const [zoomPointCoordinates, setZoomPointCoordinates] = useState("");

    useEffect(() => {
        if (!!zoomPointCoordinates) {
            setValue("zoomPointCoordinates", zoomPointCoordinates)
            const url = "http://api.geonames.org/findNearbyPostalCodesJSON";
            fetch(`${url}?lat=${zoomPointCoordinates[1]}&lng=${zoomPointCoordinates[0]}&maxRows=1&username=rutor`)
                .then(res => res.json())
                .then(data => {
                    setDistrict(data.postalCodes["0"] ? data.postalCodes["0"]["adminName1"] || "None" : "None");
                    setMunicipality(data.postalCodes["0"] ? data.postalCodes["0"]["adminName2"] || "None" : "None");
                    setLand(data.postalCodes["0"] ? data.postalCodes["0"]["placeName"] || "None" : "None")
                }).catch(err => console.log(err))
        }


    }, [zoomPointCoordinates]);

    const [district, setDistrict] = useState("");
    useEffect(() => {
        if (!!district) {
            setValue("district", district)
        }
    }, [district]);

    const [municipality, setMunicipality] = useState("");
    useEffect(() => {
        if (!!municipality) {
            setValue("municipality", municipality)
        }
    }, [municipality]);

    const [land, setLand] = useState("");
    useEffect(() => {
        if (!!land) {
            setValue("land", land)
        }
    }, [land]);

    const [time, setTime] = useState("");
    useEffect(() => {
        if (!!time) {
            setValue("time", time);
        }

    }, [time]);

    const onChangeStart = () => {
        fetch("http://worldtimeapi.org/api/ip")
            .then(res => res.json())
            .then(data => setTime(data.datetime));
        trigger("start");
    }



    function addInteractions() {

        modify = new Modify({ source: vector({
                features: new GeoJSON()
                  .readFeatures(JSON.parse(figure), { featureProjection: get("EPSG:3857") })
              })});
        map.addInteraction(modify);
        draw = new Draw({
            source: vector({
                features: new GeoJSON()
                  .readFeatures(JSON.parse(figure), { featureProjection: get("EPSG:3857") })
              }),
            type: !!geomType ? geomType : "Point",
        });
        map.addInteraction(draw);
        snap = new Snap({ source: vector({
            features: new GeoJSON()
              .readFeatures(JSON.parse(figure), { featureProjection: get("EPSG:3857") })
          }) });
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

            //vectorLayer.current.setMap(map);

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

            //vectorLayer.current.setMap(map);

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

        // vectorLayer.current.setMap(null);
        // vectorLayer.current.getSource().clear();

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
        if (!!zoomPointCoordinates) {
            map.getView().setCenter(fromLonLat(zoomPointCoordinates));
            map.getView().setZoom(14);
        }
    }


    return (
        <>

            <Layers>
                <TileLayer source={osm()} zIndex={0} />
                {!!figure && <VectorLayer key={activityId}
              source={vector({
                features: new GeoJSON()
                  .readFeatures(JSON.parse(figure), { featureProjection: get("EPSG:3857") })
              })}
              style={FeatureStyles[JSON.parse(figure).features[0].geometry.type]}
            />}
            </Layers>
            <Controls>
                <FullScreenControl />
                <MousePositionControl />
            </Controls>
            {isLoadedMap && <hr />}
            {isLoadedMap && <form id="create-form" method="post" onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label>Geometry type </label>
                    <select id="geomType" name="geomType" {...register("geomType")} value={geomType} onChange={e => onChangeGeomType(e)}>
                        <option hidden value="">--Choose type--</option>
                        <option value="Point">Point</option>
                        <option value="LineString">LineString</option>
                        <option value="Polygon">Polygon</option>
                    </select>
                    {["LineString", "Polygon"].includes(geomType) && <i >For free drawing press the Shift key</i>}
                </div>
                <label>Longitude/Latitude coordinates(EPSG:4326, WGS84)</label>
                <textarea value={coordinates} name="coordinates" {...register("coordinates")} id="coordinates" rows="6" {...register("coordinates", { required: "*Please select a geometry type and draw a figure." })} style={{ width: "100%" }}></textarea>
                <div>
                    <label>District </label>
                    <input value={district} name="district" {...register("district")} readOnly type="text" placeholder="" />
                    <label>Municipality </label>
                    <input value={municipality} name="municipality" {...register("municipality")} readOnly type="text" placeholder="" />
                    <label>Land </label>
                    <input value={land} name="land" {...register("land")} readOnly type="text" placeholder="" />
                </div>
                <span>{errors.coordinates?.message}</span>
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
                    <select name="category" {...register("category", { required: "*Please select a category." })}>
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
                    <span>{errors.category?.message}</span>
                </div>
                <label>Description </label>
                <textarea name="description" placeholder="Please enter a description for your activity" rows="6" style={{ width: "100%" }}
                    {...register("description", { required: "*Please enter a description.", maxLength: { value: 1000, message: "Your description is more than 1000 characters." } })} />
                <ErrorMessage
                    errors={errors}
                    name="description"
                    render={({ messages }) =>
                        messages &&
                        Object.entries(messages).map(([type, message]) => (
                            <span key={type}>{message}</span>
                        ))
                    }
                />
                <div>
                    <label>Start </label>
                    <input type="datetime-local" name="start" placeholder="Start" {...register("start",
                        {
                            required: "*Please enter a start date of activity.",
                            onChange: () => onChangeStart(),
                            valueAsDate: true,
                            validate: {
                                assertEnd: (v) => {
                                    if (v > watch("end"))
                                        return "*Start date should be earlier than end date."
                                },
                                assertTime: (v) => {
                                    if (v < new Date(watch("time")))
                                        return "*Start date should be later than current time."
                                }
                                // if (value > watch("time"))
                                //     return "*Start date should be later than current time.";        
                            }

                        })} />
                    <ErrorMessage
                        errors={errors}
                        name="start"
                        render={({ messages }) =>
                            messages &&
                            Object.entries(messages).map(([type, message]) => (
                                <span key={type}>{message}</span>
                            ))
                        }
                    />
                    <label>End </label>
                    <input type="datetime-local" name="end" placeholder="End" {...register("end",
                        {
                            required: "*Please enter an end date of activity.",
                            valueAsDate: true,
                            validate: (value) => {
                                if (value < watch("start"))
                                    return "*End date should be later than start date.";

                                trigger("start");
                            }
                        })} />
                    <span>{errors.end?.message}</span>
                </div>

                <div>
                    <label>Contact person </label>
                    <input name="phoneNumber" type="text" placeholder="First and Last Name" {...register("contactPerson", { required: "*Please enter a name of contact person." })} />
                    {errors.contactPerson ? <span>{errors.contactPerson.message}</span> : <span></span>}
                    <label>Phone number </label>
                    <input type="tel" name="contactPerson" placeholder="+359*********" {...register("phoneNumber", { required: "*Please enter a phone number." })} />
                    <span>{errors.phoneNumber?.message}</span>
                </div>
                <hr />
                <div className='actions'>
                    <input id='submit' type="submit" value={"CREATE ACTIVITY"} />
                </div>
            </form>}
            {isLoadedMap && <hr />}

        </>
    );
};