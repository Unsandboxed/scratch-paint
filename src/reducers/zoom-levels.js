import paper from '@turbowarp/paper';
import log from '../log/log';

const SAVE_ZOOM_LEVEL = 'scratch-paint/zoom-levels/SAVE_ZOOM_LEVEL';
const SET_ZOOM_LEVEL_ID = 'scratch-paint/zoom-levels/SET_ZOOM_LEVEL_ID';
const RESET_ZOOM_LEVELS = 'scratch-paint/zoom-levels/RESET_ZOOM_LEVELS';
const initialState = {};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_ZOOM_LEVEL_ID:
        if (action.zoomLevelId === 'currentZoomLevelId') {
            log.warn(`currentZoomLevelId is an invalid string for zoomLevel`);
            return state;
        }
        return Object.assign({}, state, {
            currentZoomLevelId: action.zoomLevelId
        });
    case SAVE_ZOOM_LEVEL:
        return Object.assign({}, state, {
            [state.currentZoomLevelId]: action.zoomLevel
        });
    case RESET_ZOOM_LEVELS:
        return {};
    default:
        return state;
    }
};

// Action creators ==================================
const saveZoomLevel = function (zoomLevel) {
    if (!(zoomLevel instanceof paper.Matrix)) {
        log.warn(`Not a matrix: ${zoomLevel}`);
    }
    return {
        type: SAVE_ZOOM_LEVEL,
        zoomLevel: new paper.Matrix(zoomLevel)
    };
};
const setZoomLevelId = function (zoomLevelId) {
    return {
        type: SET_ZOOM_LEVEL_ID,
        zoomLevelId: zoomLevelId
    };
};
const resetZoomLevels = function () {
    return {
        type: RESET_ZOOM_LEVELS
    };
};

export {
    reducer as default,
    saveZoomLevel,
    setZoomLevelId,
    resetZoomLevels
};
