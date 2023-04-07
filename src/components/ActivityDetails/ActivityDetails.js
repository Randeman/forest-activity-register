import { useEffect, useReducer, useContext, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { activityServiceFactory } from '../../services/activityService';
import * as commentService from '../../services/commentService';
import { useService } from '../../hooks/useService';
import { useAuthContext } from '../../contexts/AuthContext';

import { AddComment } from './AddComment/AddComment';
import { activityReducer } from '../../reducers/activityReducer';

import { Layers, TileLayer, VectorLayer } from "../Map/Layers";
import { osm, vector } from "../Map/Source";
import { get } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { Controls, FullScreenControl, MousePositionControl } from "../Map/Controls";
import { featureStyles as FeatureStyles } from "../Map/Features/Styles";

import MapContext from "../../contexts/MapContext";
import "./ActivityDetails.css"

export const ActivityDetails = ({onDeleteActivitySubmit}) => {
    const { activityId } = useParams();
    const { userId, isAuthenticated, userEmail } = useAuthContext();
    const [activity, dispatch] = useReducer(activityReducer, {});
    const activityService = useService(activityServiceFactory)
    const navigate = useNavigate();

    const { onZoom, onLoadFile, downloadLinkGeo } = useContext(MapContext);

    const [isLoadedMap, setIsLoadedMap] = useState(false);

    useEffect(() => {

        setIsLoadedMap(true);
    }, [])


    useEffect(() => {

        Promise.all([
            activityService.getOne(activityId),
            commentService.getAll(activityId),
        ]).then(([activityData, comments]) => {
            const activityState = {
                ...activityData,
                comments,
            };

            dispatch({ type: 'ACTIVITY_FETCH', payload: activityState })
        });
    }, [activityId]);

    const onCommentSubmit = async (values) => {
        const response = await commentService.create(activityId, values.comment);

        dispatch({
            type: 'COMMENT_ADD',
            payload: response,
            userEmail,
        });
    };

    const isOwner = activity._ownerId === userId;

    const onDeleteClick = () => {
        
        onDeleteActivitySubmit(activity._id);

        navigate('/activities');
        
    };


    return (
        <>
            <section>
                <Layers>
                    <TileLayer source={osm()} zIndex={0} />
                    {(!!activity.figure && isLoadedMap) && <VectorLayer key={activityId}
                        source={vector({
                            features: new GeoJSON()
                                .readFeatures(JSON.parse(activity.figure), { featureProjection: get("EPSG:3857") })
                        })}
                        style={FeatureStyles[JSON.parse(activity.figure).features[0].geometry.type]}
                    />}
                </Layers>
                <Controls >
                    <FullScreenControl />
                    <MousePositionControl />
                </Controls>
            </section>
            {isLoadedMap && <section id="activity-details">
                <h1>Activity Details</h1>
                <h2>{activity.category}</h2>
                {isOwner && (
                    <div style={{ position: "absolute", right: "100px" }}>
                        <button className="isOwner">
                            <Link to={`/activities/${activity._id}/edit`} style={{ textDecoration: "none", color: "white" }}>Edit</Link>
                        </button>
                        <button className="isOwner" onClick={onDeleteClick}>Delete</button>
                    </div>
                )}
                <div >
                    <label>District: </label>
                    <span >{activity.district}</span>
                    <label>Municipality: </label>
                    <span >{activity.municipality}</span>
                    <label>Land: </label>
                    <span >{activity.land}</span>
                    <p></p>
                    <label>Longitude/Latitude coordinates(EPSG:4326, WGS84): </label>
                    <p>{activity.coordinates}</p>
                    <button id="load" onClick={() => onLoadFile(activity.figure)} type="button">
                        <a download='geo.json' style={{ textDecorationLine: "none" }} href={downloadLinkGeo}>Download as GeoJSON file
                        </a>
                    </button>
                    <button id="zoom" type="button" onClick={() => onZoom(activity.zoomPointCoordinates)} >
                        Zoom
                    </button>
                </div>
                <hr />
                <div>
                    <label>Description: </label>
                    <p>{activity.description}</p>
                    <label>Start (yyyy-mm-dd, hh.mm): </label>
                    <span>{activity.start?.replace("T", ", ").slice(0, 17)}</span>
                    <label>End (yyyy-mm-dd, hh.mm): </label>
                    <span>{activity.end?.replace("T", ", ").slice(0, 17)}</span>
                    <label>Contact Person: </label>
                    <span>{activity.contactPerson}</span>
                    <span>📞{activity.phoneNumber}</span>
                </div>
                <hr />
                <div className="details-comments">
                    <h2>Comments:</h2>
                    <ul>
                        {activity.comments && activity.comments.map(x => (
                            <li key={x._id} className="comment">
                                <p>{x.author.email}: {x.comment}</p>
                            </li>
                        ))}
                    </ul>
                    {!activity.comments?.length && (
                        <p className="no-comment">No comments.</p>
                    )}
                {isAuthenticated && <AddComment onCommentSubmit={onCommentSubmit} />}
                </div>
            </section>}

        </>
    );
};