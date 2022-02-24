import axios from 'axios'
const io = axios.create({
    timeout: 3000,
    headers: { 'cache-control': 'no-cache' }
})
let start, end
io.interceptors.request.use((request) => {
    start = new Date().getTime();
    return request;
})

io.interceptors.response.use((resp) => {
    end = new Date().getTime()
    resp.time = {
        start: start,
        end: end
    }
    return resp
});

export default io;
