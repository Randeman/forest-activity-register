import { requestFactory } from './requester';

const baseUrl = 'http://localhost:3030/data/figures';

export const figureServiceFactory = (token) => {
    const request = requestFactory(token);

    const getAll = async () => {

        const result = await request.get(baseUrl);
        const figures = Object.values(result);

        return figures;
    };

    const getOne = async (activityId) => {

        const figure = await request.get(`${baseUrl}/${activityId}`);

        return figure;
    };

    const create = async (activityId, figure) => {
        const result = await request.post(baseUrl, { activityId, figure });

        return result;
    };

    const edit = (activityId, data) => request.put(`${baseUrl}/${activityId}`, data);

    const deleteFigure = (activityId) => request.delete(`${baseUrl}/${activityId}`);


    return {
        getAll,
        getOne,
        create,
        edit,
        delete: deleteFigure,
    };
}