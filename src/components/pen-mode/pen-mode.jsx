import React from 'react';
import PropTypes from 'prop-types';
import ToolSelectComponent from '../tool-select-base/tool-select-base.jsx';
import messages from '../../lib/messages.js';
import penIcon from './pen.svg';

const PenModeComponent = props => (
    <ToolSelectComponent
        imgDescriptor={messages.pen}
        imgSrc={penIcon}
        isSelected={props.isSelected}
        onMouseDown={props.onMouseDown}
        keybinding="P"
    />
);

PenModeComponent.propTypes = {
    isSelected: PropTypes.bool.isRequired,
    onMouseDown: PropTypes.func.isRequired
};

export default PenModeComponent;
