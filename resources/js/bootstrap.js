import axios from 'axios';
import { getCsrfToken, syncCsrfToken } from '@/lib/csrf';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;
syncCsrfToken(getCsrfToken());
