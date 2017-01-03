import {getLogger, ResourceError} from '../core/utils';
import {authHeaders} from '../core/api';

const log = getLogger('med/resource');

export const search = async(server, token) => {
    const url = `${server.url}/api/med`;
    log(`GET ${url}`);
    let ok;
    let json = await fetch(url, {method: 'GET', headers: authHeaders(token)})
        .then(res => {
            ok = res.ok;
            return res.json();
        })
    return interpretResult('GET', url, ok, json);
}

export const save = async(server, token, med) => {
    const body = JSON.stringify(med);
    const url = med._id ? `${server.url}/api/med/${med._id}` : `${server.url}/api/med`;
    const method = med._id ? 'PUT' : 'POST';
    log(`${method} ${url}`);
    let ok;
    return fetch(url, {method, headers: authHeaders(token), body})
        .then(res => {
            ok = res.ok;
            return res.json();
        })
    return interpretResult(method, url, ok, json);
};

function interpretResult(method, url, ok, json) {
    if (ok) {
        log(`${method} ${url} succeeded`);
        return json;
    } else {
        log(`${method} ${url} failed`);
        throw new ResourceError('Fetch failed', json.issue);
    }
}