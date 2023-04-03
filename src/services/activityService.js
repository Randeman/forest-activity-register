import { requestFactory } from './requester';

const baseUrl = 'http://localhost:3030/data/activities';

export const activityServiceFactory = (token) => {
    const request = requestFactory(token);

    const getAll = async () => {
        const result = await request.get(baseUrl);
        const activities = Object.values(result);
    
        return activities;
    };
    
    const getOne = async (activityId) => {
        const result = await request.get(`${baseUrl}/${activityId}`);
    
        return result;
    };
    
    const create = async (activityData) => {
        const result = await request.post(baseUrl, activityData);
    
        console.log(result);
    
        return result;
    };
    
    const edit = (activityId, data) => request.put(`${baseUrl}/${activityId}`, data);

    const deleteActivity = (activityId) => request.delete(`${baseUrl}/${activityId}`);


    return {
        getAll,
        getOne,
        create,
        edit,
        delete: deleteActivity,
    };
}