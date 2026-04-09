import log from '../log/log';
import {CHANGE_SELECTED_ITEMS} from './selected-items';

const CHANGE_RECT_RADIUS = 'scratch-paint/rect-mode/CHANGE_RECT_RADIUS';
const CHANGE_RECT_SIDES = 'scratch-paint/rect-mode/CHANGE_RECT_SIDES';
const initialState = {
    rectRadius: 0,
    rectSides: 4
};

const clamp = function (value, min, max) {
    return Math.min(max, Math.max(min, value));
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case CHANGE_RECT_RADIUS:
        if (isNaN(action.rectRadius)) {
            log.warn(`Invalid corner radius: ${action.rectRadius}`);
            return state;
        }
        return {...state, rectRadius: Math.max(0, action.rectRadius)};
    case CHANGE_RECT_SIDES:
        if (isNaN(action.rectSides)) {
            log.warn(`Invalid rect sides: ${action.rectSides}`);
            return state;
        }
        return {...state, rectSides: clamp(Math.round(action.rectSides), 3, 12)};
    default:
        return state;
    }
};

// Action creators ==================================
const changeRectRadius = function (rectRadius) {
    return {
        type: CHANGE_RECT_RADIUS,
        rectRadius: rectRadius
    };
};

const changeRectSides = function (rectSides) {
    return {
        type: CHANGE_RECT_SIDES,
        rectSides: rectSides
    };
};

export {
    reducer as default,
    changeRectRadius,
    changeRectSides
};