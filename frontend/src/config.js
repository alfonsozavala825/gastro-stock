// Si estamos en localhost, usa el puerto 5000. Si no, usa la URL que pondremos luego.
const API_URL = (typeof import.meta !== 'undefined' && import.meta.env.VITE_API_URL) 
                ? import.meta.env.VITE_API_URL 
                : process.env.VITE_API_URL || 'http://localhost:5000/api';
export default API_URL;


