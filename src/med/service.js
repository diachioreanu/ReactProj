import {action, getLogger, errorPayload} from '../core/utils';
import {search, save} from './resource';

const log = getLogger('med/service');

// Loading meds
const LOAD_MEDS_STARTED = 'med/loadStarted';
const LOAD_MEDS_SUCCEEDED = 'med/loadSucceeded';
const LOAD_MEDS_FAILED = 'med/loadFailed';
const CANCEL_LOAD_MEDS = 'med/cancelLoad';

// Saving meds
const SAVE_MED_STARTED = 'med/saveStarted';
const SAVE_MED_SUCCEEDED = 'med/saveSucceeded';
const SAVE_MED_FAILED = 'med/saveFailed';
const CANCEL_SAVE_MED = 'med/cancelSave';

// Med notifications
const MED_DELETED = 'med/deleted';

export const loadMeds = () => async(dispatch, getState) => {
    log(`loadMeds...`);
    const state = getState();
    const medState = state.med;
    try {
        dispatch(action(LOAD_MEDS_STARTED));
        const meds = await search(state.auth.server, state.auth.token)
        log(`loadMeds succeeded`);
        if (!medState.isLoadingCancelled) {
            dispatch(action(LOAD_MEDS_SUCCEEDED, meds));
        }
    } catch(err) {
        log(`loadMeds failed`);
        if (!medState.isLoadingCancelled) {
            dispatch(action(LOAD_MEDS_FAILED, errorPayload(err)));
        }
    }
};

export const cancelLoadMeds = () => action(CANCEL_LOAD_MEDS);

export const saveMed = (med) => async(dispatch, getState) => {
    log(`saveMed...`);
    const state = getState();
    const medState = state.med;
    try {
        dispatch(action(SAVE_MED_STARTED));
        const savedMed = await save(state.auth.server, state.auth.token, med)
        log(`saveMed succeeded`);
        if (!medState.isSavingCancelled) {
            dispatch(action(SAVE_MED_SUCCEEDED, savedMed));
        }
    } catch(err) {
        log(`saveMed failed`);
        if (!medState.isSavingCancelled) {
            dispatch(action(SAVE_MED_FAILED, errorPayload(err)));
        }
    }
};

export const cancelSaveMed = () => action(CANCEL_SAVE_MED);

export const medCreated = (createdMed) => action(SAVE_MED_SUCCEEDED, createdMed);
export const medUpdated = (updatedMed) => action(SAVE_MED_SUCCEEDED, updatedMed);
export const medDeleted = (deletedMed) => action(MED_DELETED, deletedMed);

export const medReducer = (state = {items: [], isLoading: false, isSaving: false}, action) => { //newState (new object)
    let items, index;
    switch (action.type) {
        // Loading
        case LOAD_MEDS_STARTED:
            return {...state, isLoading: true, isLoadingCancelled: false, issue: null};
        case LOAD_MEDS_SUCCEEDED:
            return {...state, items: action.payload, isLoading: false};
        case LOAD_MEDS_FAILED:
            return {...state, issue: action.payload.issue, isLoading: false};
        case CANCEL_LOAD_MEDS:
            return {...state, isLoading: false, isLoadingCancelled: true};
        // Saving
        case SAVE_MED_STARTED:
            return {...state, isSaving: true, isSavingCancelled: false, issue: null};
        case SAVE_MED_SUCCEEDED:
            items = [...state.items];
            index = items.findIndex((i) => i._id == action.payload._id);
            if (index != -1) {
                items.splice(index, 1, action.payload);
            } else {
                items.push(action.payload);
            }
            return {...state, items, isSaving: false};
        case SAVE_MED_FAILED:
            return {...state, issue: action.payload.issue, isSaving: false};
        case CANCEL_SAVE_MED:
            return {...state, isSaving: false, isSavingCancelled: true};
        // Notifications
        case MED_DELETED:
            items = [...state.items];
            const deletedMed = action.payload;
            index = state.items.findIndex((med) => med._id == deletedMed._id);
            if (index != -1) {
                items.splice(index, 1);
                return {...state, items};
            }
            return state;
        default:
            return state;
    }
};