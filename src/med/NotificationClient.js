const io = require('socket.io-client');
import {serverUrl} from '../core/api';
import {getLogger} from '../core/utils';
import {medCreated, medUpdated, medDeleted} from './service';

window.navigator.userAgent = 'ReactNative';

const log = getLogger('NotificationClient');

const MED_CREATED = 'med/created';
const MED_UPDATED = 'med/updated';
const MED_DELETED = 'med/deleted';

export class NotificationClient {
    constructor(store) {
        this.store = store;
    }

    connect() {
        log(`connect...`);
        const store = this.store;
        const auth = store.getState().auth;
        this.socket = io(auth.server.url, {transports: ['websocket']});
        const socket = this.socket;
        socket.on('connect', () => {
            log('connected');
            socket
                .emit('authenticate', {token: auth.token})
                .on('authenticated', () => log(`authenticated`))
                .on('unauthorized', (msg) => log(`unauthorized: ${JSON.stringify(msg.data)}`))
        });
        socket.on(MED_CREATED, (med) => {
            log(MED_CREATED);
            store.dispatch(medCreated(med));
        });
        socket.on(MED_UPDATED, (med) => {
            log(MED_UPDATED);
            store.dispatch(medUpdated(med))
        });
        socket.on(MED_DELETED, (med) => {
            log(MED_DELETED);
            store.dispatch(medDeleted(med))
        });
    };

    disconnect() {
        log(`disconnect`);
        this.socket.disconnect();
    }
}