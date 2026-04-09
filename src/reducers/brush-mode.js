import log from '../log/log';

const CHANGE_BRUSH_SIZE = 'scratch-paint/brush-mode/CHANGE_BRUSH_SIZE';
const CHANGE_BRUSH_TYPE = 'scratch-paint/brush-mode/CHANGE_BRUSH_TYPE';
const CHANGE_BROAD_LOOSENESS = 'scratch-paint/brush-mode/CHANGE_BROAD_LOOSENESS';
const CHANGE_DETAIL_PRECISION = 'scratch-paint/brush-mode/CHANGE_DETAIL_PRECISION';
const BrushTypes = {
    AUTO: 'auto',
    BROAD: 'broad',
    DETAIL: 'detail'
};

const clamp = function (value, min, max) {
    return Math.min(max, Math.max(min, value));
};

const initialState = {
    brushSize: 10,
    brushType: BrushTypes.AUTO,
    broadLooseness: 65,
    detailPrecision: 72
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case CHANGE_BRUSH_SIZE:
        if (isNaN(action.brushSize)) {
            log.warn(`Invalid brush size: ${action.brushSize}`);
            return state;
        }
        return {...state, brushSize: Math.max(1, action.brushSize)};
    case CHANGE_BRUSH_TYPE:
        if (!Object.prototype.hasOwnProperty.call(BrushTypes, action.brushType.toUpperCase())) {
            log.warn(`Invalid brush type: ${action.brushType}`);
            return state;
        }
        return {...state, brushType: action.brushType};
    case CHANGE_BROAD_LOOSENESS:
        if (isNaN(action.broadLooseness)) {
            log.warn(`Invalid broad looseness: ${action.broadLooseness}`);
            return state;
        }
        return {...state, broadLooseness: clamp(action.broadLooseness, 0, 100)};
    case CHANGE_DETAIL_PRECISION:
        if (isNaN(action.detailPrecision)) {
            log.warn(`Invalid detail precision: ${action.detailPrecision}`);
            return state;
        }
        return {...state, detailPrecision: clamp(action.detailPrecision, 0, 100)};
    default:
        return state;
    }
};

// Action creators ==================================
const changeBrushSize = function (brushSize) {
    return {
        type: CHANGE_BRUSH_SIZE,
        brushSize: brushSize
    };
};

const changeBrushType = function (brushType) {
    return {
        type: CHANGE_BRUSH_TYPE,
        brushType: brushType
    };
};

const changeBroadLooseness = function (broadLooseness) {
    return {
        type: CHANGE_BROAD_LOOSENESS,
        broadLooseness: broadLooseness
    };
};

const changeDetailPrecision = function (detailPrecision) {
    return {
        type: CHANGE_DETAIL_PRECISION,
        detailPrecision: detailPrecision
    };
};

export {
    reducer as default,
    changeBrushSize,
    changeBrushType,
    changeBroadLooseness,
    changeDetailPrecision,
    BrushTypes
};
