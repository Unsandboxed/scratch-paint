import log from '../log/log';

const CHANGE_SMOOTHNESS = 'scratch-paint/pen-mode/CHANGE_SMOOTHNESS';
const initialState = {smoothness: 30};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case CHANGE_SMOOTHNESS:
        if (isNaN(action.smoothness)) {
            log.warn(`Invalid pen smoothness: ${action.smoothness}`);
            return state;
        }
        return {smoothness: Math.min(100, Math.max(0, action.smoothness))};
    default:
        return state;
    }
};

const changeSmoothness = function (smoothness) {
    return {
        type: CHANGE_SMOOTHNESS,
        smoothness: smoothness
    };
};

export {
    reducer as default,
    changeSmoothness
};
