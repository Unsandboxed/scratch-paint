import classNames from 'classnames';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import {
    changeBrushSize,
    changeBrushType,
    changeBroadLooseness,
    changeDetailPrecision,
    BrushTypes
} from '../../reducers/brush-mode';
import {changeBrushSize as changeEraserSize} from '../../reducers/eraser-mode';
import {changeBitBrushSize} from '../../reducers/bit-brush-size';
import {changeBitEraserSize} from '../../reducers/bit-eraser-size';
import {changeRectRadius, changeRectSides} from '../../reducers/rect-mode';
import {changeStrokeWidth} from '../../reducers/stroke-width';
import {changeSmoothness} from '../../reducers/pen-mode';
import {setShapesFilled} from '../../reducers/fill-bitmap-shapes';
import {clearSelectedItems, setSelectedItems} from '../../reducers/selected-items';
import {getSelectedLeafItems} from '../../helper/selection';
import {
    shouldShowBooleanOperation,
    uniteSelection,
    subtractSelection,
    intersectSelection,
    excludeSelection
} from '../../helper/unite';

import Button from '../button/button.jsx';
import Dropdown from '../dropdown/dropdown.jsx';
import FontDropdown from '../../containers/font-dropdown.jsx';
import LiveInputHOC from '../forms/live-input-hoc.jsx';
import Label from '../forms/label.jsx';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import Input from '../forms/input.jsx';
import InputGroup from '../input-group/input-group.jsx';
import LabeledIconButton from '../labeled-icon-button/labeled-icon-button.jsx';
import Modes from '../../lib/modes';
import Formats, {isBitmap, isVector} from '../../lib/format';
import {hideLabel} from '../../lib/hide-label';
import styles from './mode-tools.css';

import copyIcon from '!../../tw-recolor/build!./icons/copy.svg';
import pasteIcon from '!../../tw-recolor/build!./icons/paste.svg';
import deleteIcon from '!../../tw-recolor/build!./icons/delete.svg';

import bitBrushIcon from '../bit-brush-mode/brush.svg';
import bitEraserIcon from '../bit-eraser-mode/eraser.svg';
import bitLineIcon from '../bit-line-mode/line.svg';
import brushIcon from '../brush-mode/brush.svg';
import penIcon from '../pen-mode/pen.svg';
import curvedPointIcon from '!../../tw-recolor/build!./icons/curved-point.svg';
import eraserIcon from '../eraser-mode/eraser.svg';
import flipHorizontalIcon from '!../../tw-recolor/build!./icons/flip-horizontal.svg';
import flipVerticalIcon from '!../../tw-recolor/build!./icons/flip-vertical.svg';
import roundRectIcon from '../rounded-rect-mode/rounded-rectangle.svg';
import straightPointIcon from '!../../tw-recolor/build!./icons/straight-point.svg';
import uniteIcon from '!../../tw-recolor/build!./icons/unite.svg';
import subtractIcon from '!../../tw-recolor/build!./icons/subtract.svg';
import intersectIcon from '!../../tw-recolor/build!./icons/intersect.svg';
import excludeIcon from '!../../tw-recolor/build!./icons/exclude.svg';
import bitOvalIcon from '../bit-oval-mode/oval.svg';
import bitRectIcon from '../bit-rect-mode/rectangle.svg';
import bitOvalOutlinedIcon from '../bit-oval-mode/oval-outlined.svg';
import bitRectOutlinedIcon from '../bit-rect-mode/rectangle-outlined.svg';

import {MAX_STROKE_WIDTH} from '../../reducers/stroke-width';

const LiveInput = LiveInputHOC(Input);

const ModeToolsComponent = props => {
    const messages = defineMessages({
        brushSize: {
            defaultMessage: 'Size',
            description: 'Label for the brush size input',
            id: 'paint.modeTools.brushSize'
        },
        eraserSize: {
            defaultMessage: 'Eraser size',
            description: 'Label for the eraser size input',
            id: 'paint.modeTools.eraserSize'
        },
        rectRadius: {
            defaultMessage: 'Corner radius',
            description: 'Label for the corner radius input',
            id: 'paint.modeTools.rectRadius'
        },
        rectSides: {
            defaultMessage: 'Sides',
            description: 'Label for the polygon side count in rect tool',
            id: 'paint.modeTools.rectSides'
        },
        copy: {
            defaultMessage: 'Copy',
            description: 'Label for the copy button',
            id: 'paint.modeTools.copy'
        },
        paste: {
            defaultMessage: 'Paste',
            description: 'Label for the paste button',
            id: 'paint.modeTools.paste'
        },
        delete: {
            defaultMessage: 'Delete',
            description: 'Label for the delete button',
            id: 'paint.modeTools.delete'
        },
        curved: {
            defaultMessage: 'Curved',
            description: 'Label for the button that converts selected points to curves',
            id: 'paint.modeTools.curved'
        },
        pointed: {
            defaultMessage: 'Pointed',
            description: 'Label for the button that converts selected points to sharp points',
            id: 'paint.modeTools.pointed'
        },
        thickness: {
            defaultMessage: 'Thickness',
            description: 'Label for the number input to choose the line thickness',
            id: 'paint.modeTools.thickness'
        },
        smoothness: {
            defaultMessage: 'Smoothness',
            description: 'Label for the number input to choose pen smoothing amount',
            id: 'paint.modeTools.smoothness'
        },
        brushTypeAuto: {
            defaultMessage: 'Auto',
            description: 'Label for the automatic vector brush type',
            id: 'paint.modeTools.brushTypeAuto'
        },
        brushTypeBroad: {
            defaultMessage: 'Broad',
            description: 'Label for the broad vector brush type',
            id: 'paint.modeTools.brushTypeBroad'
        },
        brushTypeDetail: {
            defaultMessage: 'Detail',
            description: 'Label for the detail vector brush type',
            id: 'paint.modeTools.brushTypeDetail'
        },
        brushType: {
            defaultMessage: 'Brush Type',
            description: 'Label for the vector brush type dropdown',
            id: 'paint.modeTools.brushType'
        },
        broadLooseness: {
            defaultMessage: 'Looseness',
            description: 'Label for broad brush looseness amount',
            id: 'paint.modeTools.broadLooseness'
        },
        detailPrecision: {
            defaultMessage: 'Precision',
            description: 'Label for detail brush precision amount',
            id: 'paint.modeTools.detailPrecision'
        },
        subtract: {
            defaultMessage: 'Subtract',
            description: 'Label for the button that subtracts selected vector shapes',
            id: 'paint.modeTools.subtract'
        },
        intersect: {
            defaultMessage: 'Intersect',
            description: 'Label for the button that keeps the overlap of selected vector shapes',
            id: 'paint.modeTools.intersect'
        },
        exclude: {
            defaultMessage: 'Exclude',
            description: 'Label for the button that excludes overlap from selected vector shapes',
            id: 'paint.modeTools.exclude'
        },
        flipHorizontal: {
            defaultMessage: 'Flip Horizontal',
            description: 'Label for the button to flip the image horizontally',
            id: 'paint.modeTools.flipHorizontal'
        },
        flipVertical: {
            defaultMessage: 'Flip Vertical',
            description: 'Label for the button to flip the image vertically',
            id: 'paint.modeTools.flipVertical'
        },
        filled: {
            defaultMessage: 'Filled',
            description: 'Label for the button that sets the bitmap rectangle/oval mode to draw outlines',
            id: 'paint.modeTools.filled'
        },
        outlined: {
            defaultMessage: 'Outlined',
            description: 'Label for the button that sets the bitmap rectangle/oval mode to draw filled-in shapes',
            id: 'paint.modeTools.outlined'
        },
        unite: {
            defaultMessage: 'Unite',
            description: 'Label for the button that merges selected vector shapes into one shape',
            id: 'paint.modeTools.unite'
        }
    });

    switch (props.mode) {
    case Modes.BRUSH:
    {
        const brushTypeOptions = [
            {type: BrushTypes.AUTO, message: messages.brushTypeAuto},
            {type: BrushTypes.BROAD, message: messages.brushTypeBroad},
            {type: BrushTypes.DETAIL, message: messages.brushTypeDetail}
        ];
        const selectedBrushType = brushTypeOptions.find(option => option.type === props.brushType) || brushTypeOptions[0];
        const isBroadBrush = props.brushType === BrushTypes.BROAD;
        const isDetailBrush = props.brushType === BrushTypes.DETAIL;
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <div>
                    <img
                        alt={props.intl.formatMessage(messages.brushSize)}
                        className={styles.modeToolsIcon}
                        draggable={false}
                        src={brushIcon}
                    />
                </div>
                <LiveInput
                    range
                    small
                    max={MAX_STROKE_WIDTH}
                    min="1"
                    type="number"
                    value={props.brushValue}
                    onSubmit={props.onBrushSliderChange}
                />
                <Dropdown
                    className={classNames(styles.modUnselect, styles.brushTypeDropdown)}
                    enterExitTransitionDurationMs={20}
                    popoverContent={
                        <InputGroup className={styles.modContextMenu}>
                            {brushTypeOptions.map(option => (
                                <Button
                                    key={option.type}
                                    className={classNames(styles.modMenuItem, {
                                        [styles.modMenuItemSelected]: props.brushType === option.type
                                    })}
                                    onClick={() => props.onBrushTypeChange(option.type)}
                                >
                                    {props.intl.formatMessage(option.message)}
                                </Button>
                            ))}
                        </InputGroup>
                    }
                    tipSize={.01}
                >
                    <span title={props.intl.formatMessage(messages.brushType)}>
                        {props.intl.formatMessage(selectedBrushType.message)}
                    </span>
                </Dropdown>
                {isBroadBrush ? (
                    <InputGroup className={classNames(styles.modDashedBorder, styles.brushSettingsPanel)}>
                        <Label text={props.intl.formatMessage(messages.broadLooseness)}>
                            <LiveInput
                                range
                                small
                                max="100"
                                min="0"
                                type="number"
                                value={props.broadLooseness}
                                onSubmit={props.onBroadLoosenessChange}
                            />
                        </Label>
                    </InputGroup>
                ) : null}
                {isDetailBrush ? (
                    <InputGroup className={classNames(styles.modDashedBorder, styles.brushSettingsPanel)}>
                        <Label text={props.intl.formatMessage(messages.detailPrecision)}>
                            <LiveInput
                                range
                                small
                                max="100"
                                min="0"
                                type="number"
                                value={props.detailPrecision}
                                onSubmit={props.onDetailPrecisionChange}
                            />
                        </Label>
                    </InputGroup>
                ) : null}
            </div>
        );
    }
    case Modes.BIT_BRUSH:
        /* falls through */
    case Modes.BIT_LINE:
    {
        const currentIcon = isVector(props.format) ? brushIcon :
            props.mode === Modes.BIT_LINE ? bitLineIcon : bitBrushIcon;
        const currentBrushValue = isBitmap(props.format) ? props.bitBrushSize : props.brushValue;
        const changeFunction = isBitmap(props.format) ? props.onBitBrushSliderChange : props.onBrushSliderChange;
        const currentMessage = props.mode === Modes.BIT_LINE ?
            messages.thickness : messages.brushSize;
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <div>
                    <img
                        alt={props.intl.formatMessage(currentMessage)}
                        className={styles.modeToolsIcon}
                        draggable={false}
                        src={currentIcon}
                    />
                </div>
                <LiveInput
                    range
                    small
                    max={MAX_STROKE_WIDTH}
                    min="1"
                    type="number"
                    value={currentBrushValue}
                    onSubmit={changeFunction}
                />
            </div>
        );
    }
    case Modes.PEN:
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <div>
                    <img
                        alt={props.intl.formatMessage(messages.smoothness)}
                        className={styles.modeToolsIcon}
                        draggable={false}
                        src={penIcon}
                    />
                </div>
                <Label text={props.intl.formatMessage(messages.smoothness)}>
                    <LiveInput
                        range
                        small
                        max="100"
                        min="0"
                        type="number"
                        value={props.penSmoothness}
                        onSubmit={props.onPenSmoothnessChange}
                    />
                </Label>
            </div>
        );
    case Modes.RECT: {
        // to do: use reducers
        const currentIcon = roundRectIcon;
        const currentRadiusValue = props.rectRadius;
        const currentSidesValue = props.rectSides;
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <div>
                    <img
                        alt={props.intl.formatMessage(messages.rectRadius)}
                        className={styles.modeToolsIcon}
                        draggable={false}
                        src={currentIcon}
                    />
                </div>
                <LiveInput
                    range
                    small
                    max={MAX_STROKE_WIDTH}
                    min="0"
                    type="number"
                    value={currentRadiusValue}
                    onSubmit={props.onRectRadiusSliderChange}
                />
                <Label text={props.intl.formatMessage(messages.rectSides)}>
                    <LiveInput
                        range
                        small
                        max="12"
                        min="3"
                        type="number"
                        value={currentSidesValue}
                        onSubmit={props.onRectSidesSliderChange}
                    />
                </Label>
            </div>
        )
    }
    case Modes.BIT_ERASER:
        /* falls through */
    case Modes.ERASER:
    {
        const currentIcon = isVector(props.format) ? eraserIcon : bitEraserIcon;
        const currentEraserValue = isBitmap(props.format) ? props.bitEraserSize : props.eraserValue;
        const changeFunction = isBitmap(props.format) ? props.onBitEraserSliderChange : props.onEraserSliderChange;
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <div>
                    <img
                        alt={props.intl.formatMessage(messages.eraserSize)}
                        className={styles.modeToolsIcon}
                        draggable={false}
                        src={currentIcon}
                    />
                </div>
                <LiveInput
                    range
                    small
                    max={MAX_STROKE_WIDTH}
                    min="1"
                    type="number"
                    value={currentEraserValue}
                    onSubmit={changeFunction}
                />
            </div>
        );
    }
    case Modes.RESHAPE:
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                    <LabeledIconButton
                        disabled={!props.hasSelectedUncurvedPoints}
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={curvedPointIcon}
                        title={props.intl.formatMessage(messages.curved)}
                        onClick={props.onCurvePoints}
                    />
                    <LabeledIconButton
                        disabled={!props.hasSelectedUnpointedPoints}
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={straightPointIcon}
                        title={props.intl.formatMessage(messages.pointed)}
                        onClick={props.onPointPoints}
                    />
                </InputGroup>
                <InputGroup className={classNames(styles.modLabeledIconHeight)}>
                    <LabeledIconButton
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={deleteIcon}
                        title={props.intl.formatMessage(messages.delete)}
                        onClick={props.onDelete}
                    />
                </InputGroup>
            </div>
        );
    case Modes.BIT_SELECT:
        /* falls through */
    case Modes.SELECT:
    {
        const canBooleanOperate = props.selectedItems && shouldShowBooleanOperation();
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                    <LabeledIconButton
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={copyIcon}
                        title={props.intl.formatMessage(messages.copy)}
                        onClick={props.onCopyToClipboard}
                    />
                    <LabeledIconButton
                        disabled={!(props.clipboardItems.length > 0)}
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={pasteIcon}
                        title={props.intl.formatMessage(messages.paste)}
                        onClick={props.onPasteFromClipboard}
                    />
                </InputGroup>
                <InputGroup className={classNames(styles.modDashedBorder, styles.modLabeledIconHeight)}>
                    <LabeledIconButton
                        hideLabel={hideLabel(props.intl.locale)}
                        imgSrc={deleteIcon}
                        title={props.intl.formatMessage(messages.delete)}
                        onClick={props.onDelete}
                    />
                </InputGroup>
                <InputGroup className={classNames(styles.modLabeledIconHeight)}>
                    <LabeledIconButton
                        hideLabel={props.intl.locale !== 'en'}
                        imgSrc={flipHorizontalIcon}
                        title={props.intl.formatMessage(messages.flipHorizontal)}
                        onClick={props.onFlipHorizontal}
                    />
                    <LabeledIconButton
                        hideLabel={props.intl.locale !== 'en'}
                        imgSrc={flipVerticalIcon}
                        title={props.intl.formatMessage(messages.flipVertical)}
                        onClick={props.onFlipVertical}
                    />
                </InputGroup>
                {props.mode === Modes.SELECT ? (
                    <InputGroup className={classNames(styles.modLabeledIconHeight, styles.modDividerBefore)}>
                        <LabeledIconButton
                            disabled={!canBooleanOperate}
                            hideLabel={props.intl.locale !== 'en'}
                            imgSrc={uniteIcon}
                            title={props.intl.formatMessage(messages.unite)}
                            onClick={props.onUnite}
                        />
                        <LabeledIconButton
                            disabled={!canBooleanOperate}
                            hideLabel={props.intl.locale !== 'en'}
                            imgSrc={subtractIcon}
                            title={props.intl.formatMessage(messages.subtract)}
                            onClick={props.onSubtract}
                        />
                        <LabeledIconButton
                            disabled={!canBooleanOperate}
                            hideLabel={props.intl.locale !== 'en'}
                            imgSrc={intersectIcon}
                            title={props.intl.formatMessage(messages.intersect)}
                            onClick={props.onIntersect}
                        />
                        <LabeledIconButton
                            disabled={!canBooleanOperate}
                            hideLabel={props.intl.locale !== 'en'}
                            imgSrc={excludeIcon}
                            title={props.intl.formatMessage(messages.exclude)}
                            onClick={props.onExclude}
                        />
                    </InputGroup>
                ) : null}
            </div>
        );
    }
    case Modes.BIT_TEXT:
        /* falls through */
    case Modes.TEXT:
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <InputGroup>
                    <FontDropdown
                        onUpdateImage={props.onUpdateImage}
                        onManageFonts={props.onManageFonts}
                    />
                </InputGroup>
            </div>
        );
    case Modes.BIT_RECT:
        /* falls through */
    case Modes.BIT_OVAL:
    {
        const fillIcon = props.mode === Modes.BIT_RECT ? bitRectIcon : bitOvalIcon;
        const outlineIcon = props.mode === Modes.BIT_RECT ? bitRectOutlinedIcon : bitOvalOutlinedIcon;
        return (
            <div className={classNames(props.className, styles.modeTools)}>
                <InputGroup>
                    <LabeledIconButton
                        highlighted={props.fillBitmapShapes}
                        imgSrc={fillIcon}
                        title={props.intl.formatMessage(messages.filled)}
                        onClick={props.onFillShapes}
                        gray
                    />
                </InputGroup>
                <InputGroup>
                    <LabeledIconButton
                        highlighted={!props.fillBitmapShapes}
                        imgSrc={outlineIcon}
                        title={props.intl.formatMessage(messages.outlined)}
                        onClick={props.onOutlineShapes}
                        gray
                    />
                </InputGroup>
                {props.fillBitmapShapes ? null : (
                    <InputGroup>
                        <Label text={props.intl.formatMessage(messages.thickness)}>
                            <LiveInput
                                range
                                small
                                max={MAX_STROKE_WIDTH}
                                min="1"
                                type="number"
                                value={props.bitBrushSize}
                                onSubmit={props.onBitBrushSliderChange}
                            />
                        </Label>
                    </InputGroup>)
                }
            </div>
        );
    }
    default:
        // Leave empty for now, if mode not supported
        return (
            <div className={classNames(props.className, styles.modeTools)} />
        );
    }
};

ModeToolsComponent.propTypes = {
    bitBrushSize: PropTypes.number,
    bitEraserSize: PropTypes.number,
    broadLooseness: PropTypes.number,
    brushType: PropTypes.string,
    brushValue: PropTypes.number,
    className: PropTypes.string,
    clipboardItems: PropTypes.arrayOf(PropTypes.array),
    eraserValue: PropTypes.number,
    fillBitmapShapes: PropTypes.bool,
    format: PropTypes.oneOf(Object.keys(Formats)),
    hasSelectedUncurvedPoints: PropTypes.bool,
    hasSelectedUnpointedPoints: PropTypes.bool,
    intl: intlShape.isRequired,
    detailPrecision: PropTypes.number,
    mode: PropTypes.string.isRequired,
    onBitBrushSliderChange: PropTypes.func.isRequired,
    onBitEraserSliderChange: PropTypes.func.isRequired,
    onBroadLoosenessChange: PropTypes.func.isRequired,
    onBrushSliderChange: PropTypes.func.isRequired,
    onBrushTypeChange: PropTypes.func.isRequired,
    onCopyToClipboard: PropTypes.func.isRequired,
    onCurvePoints: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onEraserSliderChange: PropTypes.func,
    onExclude: PropTypes.func.isRequired,
    onFillShapes: PropTypes.func.isRequired,
    onFlipHorizontal: PropTypes.func.isRequired,
    onFlipVertical: PropTypes.func.isRequired,
    onIntersect: PropTypes.func.isRequired,
        onDetailPrecisionChange: PropTypes.func.isRequired,
    onManageFonts: PropTypes.func,
    onOutlineShapes: PropTypes.func.isRequired,
    onPasteFromClipboard: PropTypes.func.isRequired,
    onPointPoints: PropTypes.func.isRequired,
    onPenSmoothnessChange: PropTypes.func.isRequired,
    onRectSidesSliderChange: PropTypes.func.isRequired,
    onSubtract: PropTypes.func.isRequired,
    onUnite: PropTypes.func.isRequired,
    onUpdateImage: PropTypes.func.isRequired,
    penSmoothness: PropTypes.number,
    rectRadius: PropTypes.number,
    rectSides: PropTypes.number,
    selectedItems: PropTypes.array,
    strokeWidth: PropTypes.number
};

const mapStateToProps = state => ({
    mode: state.scratchPaint.mode,
    format: state.scratchPaint.format,
    fillBitmapShapes: state.scratchPaint.fillBitmapShapes,
    bitBrushSize: state.scratchPaint.bitBrushSize,
    bitEraserSize: state.scratchPaint.bitEraserSize,
    broadLooseness: state.scratchPaint.brushMode.broadLooseness,
    brushType: state.scratchPaint.brushMode.brushType,
    brushValue: state.scratchPaint.brushMode.brushSize,
    clipboardItems: state.scratchPaint.clipboard.items,
    selectedItems: state.scratchPaint.selectedItems,
    eraserValue: state.scratchPaint.eraserMode.brushSize,
    detailPrecision: state.scratchPaint.brushMode.detailPrecision,
    penSmoothness: state.scratchPaint.penMode.smoothness,
    rectRadius: state.scratchPaint.rectMode.rectRadius,
    rectSides: state.scratchPaint.rectMode.rectSides,
    strokeWidth: state.scratchPaint.color.strokeWidth
});
const mapDispatchToProps = (dispatch, ownProps) => ({
    onBrushSliderChange: brushSize => {
        dispatch(changeBrushSize(brushSize));
    },
    onBrushTypeChange: brushType => {
        dispatch(changeBrushType(brushType));
    },
    onBroadLoosenessChange: broadLooseness => {
        dispatch(changeBroadLooseness(broadLooseness));
    },
    onDetailPrecisionChange: detailPrecision => {
        dispatch(changeDetailPrecision(detailPrecision));
    },
    onBitBrushSliderChange: bitBrushSize => {
        dispatch(changeBitBrushSize(bitBrushSize));
    },
    onBitEraserSliderChange: eraserSize => {
        dispatch(changeBitEraserSize(eraserSize));
    },
    onEraserSliderChange: eraserSize => {
        dispatch(changeEraserSize(eraserSize));
    },
    onRectRadiusSliderChange: rectRadius => {
        dispatch(changeRectRadius(rectRadius));
    },
    onRectSidesSliderChange: rectSides => {
        dispatch(changeRectSides(rectSides));
    },
    onPenSmoothnessChange: smoothness => {
        dispatch(changeSmoothness(smoothness));
    },
    onFillShapes: () => {
        dispatch(setShapesFilled(true));
    },
    onOutlineShapes: () => {
        dispatch(setShapesFilled(false));
    },
    onUnite: () => {
        uniteSelection(
            () => dispatch(clearSelectedItems()),
            () => dispatch(setSelectedItems(getSelectedLeafItems(), false)),
            ownProps.onUpdateImage
        );
    },
    onSubtract: () => {
        subtractSelection(
            () => dispatch(clearSelectedItems()),
            () => dispatch(setSelectedItems(getSelectedLeafItems(), false)),
            ownProps.onUpdateImage
        );
    },
    onIntersect: () => {
        intersectSelection(
            () => dispatch(clearSelectedItems()),
            () => dispatch(setSelectedItems(getSelectedLeafItems(), false)),
            ownProps.onUpdateImage
        );
    },
    onExclude: () => {
        excludeSelection(
            () => dispatch(clearSelectedItems()),
            () => dispatch(setSelectedItems(getSelectedLeafItems(), false)),
            ownProps.onUpdateImage
        );
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(ModeToolsComponent));
