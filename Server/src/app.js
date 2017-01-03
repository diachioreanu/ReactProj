import Koa from 'koa';
import cors from 'koa-cors';
import convert from 'koa-convert';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import http from 'http';
import socketIo from 'socket.io';
import dataStore from 'nedb-promise';
import {getLogger, timingLogger, errorHandler, jwtConfig} from './utils';
import {MedRouter} from './med-router';
import {AuthRouter} from './auth-router';
import koaJwt from 'koa-jwt';
import socketioJwt from 'socketio-jwt';

const app = new Koa();
const server = http.createServer(app.callback());
const io = socketIo(server);
const log = getLogger('app');

app.use(timingLogger);
app.use(errorHandler);

app.use(bodyParser());
app.use(convert(cors()));

const apiUrl = '/api';

log('config public routes');
const authApi = new Router({prefix: apiUrl})
const userStore = dataStore({filename: '../users.json', autoload: true});
authApi.use('/auth', new AuthRouter({userStore, io}).routes())
app.use(authApi.routes()).use(authApi.allowedMethods())

log('config protected routes');
app.use(convert(koaJwt(jwtConfig)));
const protectedApi = new Router({prefix: apiUrl})
const medStore = dataStore({filename: '../meds.json', autoload: true});
protectedApi.use('/med', new MedRouter({medStore, io}).routes())
app.use(protectedApi.routes()).use(protectedApi.allowedMethods());

log('config socket io');
io.on('connection', socketioJwt.authorize(jwtConfig))
    .on('authenticated', (socket) => {
        const username = socket.decoded_token.username;
        socket.join(username);
        log(`${username} authenticated and joined`);
        socket.on('disconnect', () => {
            log(`${username} disconnected`);
        })
    });

(async() => {
    log('ensure default data');
    const ensureUserAndMeds = async(username) => {
        let user = await userStore.findOne({username: username});
        if (user) {
            log(`user ${username} was in the store`);
        } else {
            user = await userStore.insert({username, password: username});
            log(`user added ${JSON.stringify(user)}`);
        }
        let meds = await medStore.find({user: user._id});
        if (meds.length > 0) {
            log(`user ${username} had ${meds.length} meds`);
        } else {
            for (let i = 0; i < 10; i++) {
                let med = await medStore.insert({
                    text: `Med ${username}${i}`,
                    status: "active",
                    img: "http://www.meashamselfdrive.co.uk/assets/images/med-placeholder.png",
                    updated: Date.now(),
                    user: user._id,
                    version: 1
                });
                log(`med added ${JSON.stringify(med)}`);
            }
        }
    };
    await Promise.all(['andrei', 'julia'].map(username => ensureUserAndMeds(username)));
})();

server.listen(3000);

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: '+add);
})