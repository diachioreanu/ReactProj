import {
    OK, NOT_FOUND, LAST_MODIFIED, NOT_MODIFIED, BAD_REQUEST, ETAG,
    CONFLICT, METHOD_NOT_ALLOWED, NO_CONTENT, CREATED, FORBIDDEN, setIssueRes
} from './utils';
import Router from 'koa-router';
import {getLogger} from './utils';

const log = getLogger('med');

let medsLastUpdateMillis = null;

export class MedRouter extends Router {
    constructor(props) {
        super(props);
        this.medStore = props.medStore;
        this.io = props.io;
        this.get('/', async(ctx) => {
            let res = ctx.response;
            let lastModified = ctx.request.get(LAST_MODIFIED);
            if (lastModified && medsLastUpdateMillis && medsLastUpdateMillis <= new Date(lastModified).getTime()) {
                log('search / - 304 Not Modified (the client can use the cached data)');
                res.status = NOT_MODIFIED;
            } else {
                res.body = await this.medStore.find({user: ctx.state.user._id});
                if (!medsLastUpdateMillis) {
                    medsLastUpdateMillis = Date.now();
                }
                res.set({[LAST_MODIFIED]: new Date(medsLastUpdateMillis)});
                log('search / - 200 Ok');
            }
        })
            .get('/:id', async(ctx) => {
                let med = await this.medStore.findOne({_id: ctx.params.id});
                let res = ctx.response;
                if (med) {
                    if (med.user == ctx.state.user._id) {
                        log('read /:id - 200 Ok');
                        this.setMedRes(res, OK, med); //200 Ok
                    } else {
                        log('read /:id - 403 Forbidden');
                        setIssueRes(res, FORBIDDEN, [{error: "It's not your med"}]);
                    }
                } else {
                    log('read /:id - 404 Not Found (if you know the resource was deleted, then you can return 410 Gone)');
                    setIssueRes(res, NOT_FOUND, [{warning: 'Med not found'}]);
                }
            })
            .post('/', async(ctx) => {
                let med = ctx.request.body;
                let res = ctx.response;
                if (med.text) { //validation
                    med.user = ctx.state.user._id;
                    await this.createMed(ctx, res, med);
                } else {
                    log(`create / - 400 Bad Request`);
                    setIssueRes(res, BAD_REQUEST, [{error: 'Text is missing'}]);
                }
            })
            .put('/:id', async(ctx) => {
                let med = ctx.request.body;
                let id = ctx.params.id;
                let medId = med._id;
                let res = ctx.response;
                if (medId && medId != id) {
                    log(`update /:id - 400 Bad Request (param id and body _id should be the same)`);
                    setIssueRes(res, BAD_REQUEST, [{error: 'Param id and body _id should be the same'}]);
                    return;
                }
                if (!med.text) {
                    log(`update /:id - 400 Bad Request (validation errors)`);
                    setIssueRes(res, BAD_REQUEST, [{error: 'Text is missing'}]);
                    return;
                }
                if (!medId) {
                    await this.createMed(ctx, res, med);
                } else {
                    let persistedMed = await this.medStore.findOne({_id: id});
                    if (persistedMed) {
                        if (persistedMed.user != ctx.state.user._id) {
                            log('update /:id - 403 Forbidden');
                            setIssueRes(res, FORBIDDEN, [{error: "It's not your med"}]);
                            return;
                        }
                        let medVersion = parseInt(ctx.request.get(ETAG)) || med.version;
                        if (!medVersion) {
                            log(`update /:id - 400 Bad Request (no version specified)`);
                            setIssueRes(res, BAD_REQUEST, [{error: 'No version specified'}]); //400 Bad Request
                        } else if (medVersion < persistedMed.version) {
                            log(`update /:id - 409 Conflict`);
                            setIssueRes(res, CONFLICT, [{error: 'Version conflict'}]); //409 Conflict
                        } else {
                            med.version = medVersion + 1;
                            med.updated = Date.now();
                            let updatedCount = await this.medStore.update({_id: id}, med);
                            medsLastUpdateMillis = med.updated;
                            if (updatedCount == 1) {
                                this.setMedRes(res, OK, med); //200 Ok
                                this.io.to(ctx.state.user.username).emit('med/updated', med);
                            } else {
                                log(`update /:id - 405 Method Not Allowed (resource no longer exists)`);
                                setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Med no longer exists'}]); //
                            }
                        }
                    } else {
                        log(`update /:id - 405 Method Not Allowed (resource no longer exists)`);
                        setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Med no longer exists'}]); //Method Not Allowed
                    }
                }
            })
            .del('/:id', async(ctx) => {
                let id = ctx.params.id;
                let med = await this.medStore.findOne({_id: ctx.params.id});
                await this.medStore.remove({_id: id, user: ctx.state.user._id});
                this.io.to(ctx.state.user.username).emit('med/deleted', {_id: id});
                medsLastUpdateMillis = Date.now();
                ctx.response.status = OK;
                ctx.response.body = med;
                log(`remove /:id - 204 No content (even if the resource was already deleted), or 200 Ok`);
            });
    }

    async createMed(ctx, res, med) {
        med.version = 1;
        med.updated = Date.now();
        let insertedMed = await this.medStore.insert(med);
        medsLastUpdateMillis = med.updated;
        this.setMedRes(res, CREATED, insertedMed); //201 Created
        this.io.to(ctx.state.user.username).emit('med/created', insertedMed);
    }

    setMedRes(res, status, med) {
        res.body = med;
        res.set({
            [ETAG]: med.version,
            [LAST_MODIFIED]: new Date(med.updated)
        });
        res.status = status; //200 Ok or 201 Created
    }
}
