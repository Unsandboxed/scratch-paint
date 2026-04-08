import paper from '@turbowarp/paper';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';
import Modes from '../lib/modes';
import ColorStyleProptype from '../lib/color-style-proptype';
import {clearSelection} from '../helper/selection';
import {styleShape, MIXED} from '../helper/style-path';
import {changeStrokeColor, clearStrokeGradient} from '../reducers/stroke-style';
import {changeStrokeWidth} from '../reducers/stroke-width';
import {changeSmoothness} from '../reducers/pen-mode';
import {changeMode} from '../reducers/modes';
import {clearSelectedItems} from '../reducers/selected-items';

import PenModeComponent from '../components/pen-mode/pen-mode.jsx';

class PenMode extends React.Component {
    static get DEFAULT_COLOR () {
        return '#000000';
    }
    constructor (props) {
        super(props);
        bindAll(this, [
            'activateTool',
            'deactivateTool',
            'onMouseDown',
            'onMouseDrag',
            'onMouseUp'
        ]);
    }
    componentDidMount () {
        if (this.props.isPenModeActive) {
            this.activateTool();
        }
    }
    componentWillReceiveProps (nextProps) {
        if (nextProps.isPenModeActive && !this.props.isPenModeActive) {
            this.activateTool();
        } else if (!nextProps.isPenModeActive && this.props.isPenModeActive) {
            this.deactivateTool();
        }
    }
    shouldComponentUpdate (nextProps) {
        return nextProps.isPenModeActive !== this.props.isPenModeActive;
    }
    componentWillUnmount () {
        if (this.tool) {
            this.deactivateTool();
        }
    }
    activateTool () {
        clearSelection(this.props.clearSelectedItems);

        const strokeColor1 = this.props.colorState.strokeColor.primary;
        const strokeColor2 = this.props.colorState.strokeColor.secondary;
        if (strokeColor1 === MIXED ||
            (strokeColor1 === null &&
                (strokeColor2 === null || strokeColor2 === MIXED))) {
            this.props.onChangeStrokeColor(PenMode.DEFAULT_COLOR);
        }
        if (strokeColor2 === MIXED) {
            this.props.clearStrokeGradient();
        }
        if (!this.props.colorState.strokeWidth) {
            this.props.onChangeStrokeWidth(1);
        }

        this.path = null;
        this.tool = new paper.Tool();
        this.tool.minDistance = 1;

        const penMode = this;
        this.tool.onMouseDown = function (event) {
            if (event.event.button > 0) return;
            penMode.onMouseDown(event);
        };
        this.tool.onMouseDrag = function (event) {
            if (event.event.button > 0) return;
            penMode.onMouseDrag(event);
        };
        this.tool.onMouseUp = function (event) {
            if (event.event.button > 0) return;
            penMode.onMouseUp(event);
        };

        this.tool.activate();
    }
    onMouseDown (event) {
        this.path = new paper.Path();
        this.path.strokeCap = 'round';
        this.path.strokeJoin = 'round';
        this.path.add(event.point);

        styleShape(this.path, {
            fillColor: null,
            strokeColor: this.props.colorState.strokeColor,
            strokeWidth: this.props.colorState.strokeWidth
        });
    }
    onMouseDrag (event) {
        if (!this.path) return;
        this.path.add(event.point);
    }
    onMouseUp () {
        if (!this.path) return;

        if (this.path.segments.length < 2) {
            this.path.remove();
            this.path = null;
            return;
        }

        const smoothness = Math.max(0, this.props.penModeState.smoothness - 40);
        const simplifyTolerance = smoothness / 25;
        if (simplifyTolerance > 0) {
            this.path.simplify(simplifyTolerance);
        }
        this.path.smooth({type: 'catmull-rom', factor: smoothness / 100});

        styleShape(this.path, {
            fillColor: null,
            strokeColor: this.props.colorState.strokeColor,
            strokeWidth: this.props.colorState.strokeWidth
        });

        this.props.onUpdateImage();
        this.path = null;
    }
    deactivateTool () {
        this.tool.remove();
        this.tool = null;
        this.path = null;
    }
    render () {
        return (
            <PenModeComponent
                isSelected={this.props.isPenModeActive}
                onMouseDown={this.props.handleMouseDown}
            />
        );
    }
}

PenMode.propTypes = {
    clearSelectedItems: PropTypes.func.isRequired,
    clearStrokeGradient: PropTypes.func.isRequired,
    colorState: PropTypes.shape({
        strokeColor: ColorStyleProptype,
        strokeWidth: PropTypes.number
    }).isRequired,
    handleMouseDown: PropTypes.func.isRequired,
    isPenModeActive: PropTypes.bool.isRequired,
    penModeState: PropTypes.shape({
        smoothness: PropTypes.number.isRequired
    }).isRequired,
    onChangeSmoothness: PropTypes.func.isRequired,
    onChangeStrokeColor: PropTypes.func.isRequired,
    onChangeStrokeWidth: PropTypes.func.isRequired,
    onUpdateImage: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    colorState: state.scratchPaint.color,
    isPenModeActive: state.scratchPaint.mode === Modes.PEN,
    penModeState: state.scratchPaint.penMode
});
const mapDispatchToProps = dispatch => ({
    clearSelectedItems: () => {
        dispatch(clearSelectedItems());
    },
    clearStrokeGradient: () => {
        dispatch(clearStrokeGradient());
    },
    handleMouseDown: () => {
        dispatch(changeMode(Modes.PEN));
    },
    onChangeStrokeColor: strokeColor => {
        dispatch(changeStrokeColor(strokeColor));
    },
    onChangeSmoothness: smoothness => {
        dispatch(changeSmoothness(smoothness));
    },
    onChangeStrokeWidth: strokeWidth => {
        dispatch(changeStrokeWidth(strokeWidth));
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PenMode);
