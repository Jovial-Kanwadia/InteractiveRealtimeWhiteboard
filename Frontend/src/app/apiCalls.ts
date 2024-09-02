import api from "./api"

export const testing = async() => {
    try {
        const response = await api.get('/test/testing');
        console.log(response.data);
    } catch (error) {
        console.log(error);
    }
}