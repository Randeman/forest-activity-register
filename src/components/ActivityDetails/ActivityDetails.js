import { useEffect, useReducer } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { activityServiceFactory } from '../../services/activityService';
import * as commentService from '../../services/commentService';
import { useService } from '../../hooks/useService';
import { useAuthContext } from '../../contexts/AuthContext';

import { AddComment } from './AddComment/AddComment';
import { activityReducer } from '../../reducers/activityReducer';

export const ActivityDetails = () => {
    const { activityId } = useParams();
    const { userId, isAuthenticated, userEmail } = useAuthContext();
    const [activity, dispatch] = useReducer(activityReducer, {});
    const activityService = useService(activityServiceFactory)
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([
            activityService.getOne(activityId),
            commentService.getAll(activityId),
        ]).then(([activityData, comments]) => {
            const activityState = {
                ...activityData,
                comments,
            };
            
            dispatch({type: 'ACTIVITY_FETCH', payload: activityState})
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

    const onDeleteClick = async () => {
        await activityService.delete(activity._id);

        // TODO: delete from state

        navigate('/catalog');
    };

    return (
        <section id="activity-details">
            <h1>Activity Details</h1>
            <div>

                <div >
                    
                    <h1>{activity.title}</h1>
                    <span className="levels">MaxLevel: {activity.maxLevel}</span>
                    <p className="type">{activity.category}</p>
                </div>

                <p className="text">{activity.summary}</p>

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
                </div>

                {isOwner && (
                    <div className="buttons">
                        <Link to={`/catalog/${activity._id}/edit`} className="button">Edit</Link>
                        <button className="button" onClick={onDeleteClick}>Delete</button>
                    </div>
                )}
            </div>

            {isAuthenticated && <AddComment onCommentSubmit={onCommentSubmit} />}
        </section>
    );
};