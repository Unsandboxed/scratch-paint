import paper from '@turbowarp/paper';
import Modes from '../../lib/modes';
import {styleShape} from '../style-path';
import {clearSelection, getSelectedRootItems} from '../selection';
import {getSquareDimensions} from '../math';
import BoundingBoxTool from '../selection-tools/bounding-box-tool';
import NudgeTool from '../selection-tools/nudge-tool';

/**
 * Tool for drawing rectangles.
 */
class RectTool extends paper.Tool {
    static get TOLERANCE () {
        return 2;
    }

    static get RECT_TOOL_DATA_KEY () {
        return 'isRectToolShape';
    }

    static get RECT_FRAME_DATA_KEY () {
        return 'rectFrame';
    }
    /**
     * @param {function} setSelectedItems Callback to set the set of selected items in the Redux state
     * @param {function} clearSelectedItems Callback to clear the set of selected items in the Redux state
     * @param {function} setCursor Callback to set the visible mouse cursor
     * @param {!function} onUpdateImage A callback to call when the image visibly changes
     */
    constructor (setSelectedItems, clearSelectedItems, setCursor, onUpdateImage) {
        super();
        this.setSelectedItems = setSelectedItems;
        this.clearSelectedItems = clearSelectedItems;
        this.onUpdateImage = onUpdateImage;
        this.boundingBoxTool = new BoundingBoxTool(
            Modes.RECT,
            setSelectedItems,
            clearSelectedItems,
            setCursor,
            onUpdateImage
        );
        const nudgeTool = new NudgeTool(Modes.RECT, this.boundingBoxTool, onUpdateImage);

        // We have to set these functions instead of just declaring them because
        // paper.js tools hook up the listeners in the setter functions.
        this.onMouseDown = this.handleMouseDown;
        this.onMouseMove = this.handleMouseMove;
        this.onMouseDrag = this.handleMouseDrag;
        this.onMouseUp = this.handleMouseUp;
        this.onKeyUp = nudgeTool.onKeyUp;
        this.onKeyDown = nudgeTool.onKeyDown;

        this.rect = null;
        this.colorState = null;
        this.isBoundingBoxMode = null;
        this.active = false;
        this.rectRadius = 0;
        this.rectSides = 4;
        this.lastDownPoint = null;
        this.lastPoint = null;
        this.lastModifiers = null;
    }
    getHitOptions () {
        return {
            segments: true,
            stroke: true,
            curves: true,
            fill: true,
            guide: false,
            match: hitResult =>
                (hitResult.item.data && (hitResult.item.data.isScaleHandle || hitResult.item.data.isRotHandle)) ||
                hitResult.item.selected, // Allow hits on bounding box and selected only
            tolerance: RectTool.TOLERANCE / paper.view.zoom
        };
    }
    /**
     * Should be called if the selection changes to update the bounds of the bounding box.
     * @param {Array<paper.Item>} selectedItems Array of selected items.
     */
    onSelectionChanged (selectedItems) {
        this.boundingBoxTool.onSelectionChanged(selectedItems);
    }
    setColorState (colorState) {
        this.colorState = colorState;
    }
    setRectRadius (rectRadius) {
        this.rectRadius = rectRadius;
        if (this.active && !this.isBoundingBoxMode && this.rect && this.lastDownPoint && this.lastPoint) {
            this._drawRect(this.lastDownPoint, this.lastPoint, this.lastModifiers || {});
        } else {
            this._updateSelectedShapes();
        }
    }

    setRectSides (rectSides) {
        this.rectSides = Math.max(3, Math.round(rectSides));
        if (this.active && !this.isBoundingBoxMode && this.rect && this.lastDownPoint && this.lastPoint) {
            this._drawRect(this.lastDownPoint, this.lastPoint, this.lastModifiers || {});
        } else {
            this._updateSelectedShapes();
        }
    }

    _frameFromRect (rect) {
        return {
            center: rect.center.clone(),
            width: Math.abs(rect.width),
            height: Math.abs(rect.height)
        };
    }

    _frameFromItem (item, sides) {
        const itemBounds = item.bounds;
        return {
            center: itemBounds.center.clone(),
            width: Math.abs(itemBounds.width),
            height: Math.abs(itemBounds.height)
        };
    }

    _rectFromFrame (frame) {
        return new paper.Rectangle(
            frame.center.subtract(new paper.Point(frame.width / 2, frame.height / 2)),
            new paper.Size(frame.width, frame.height)
        );
    }

    _copyShapeStyle (source, target) {
        target.fillColor = source.fillColor;
        target.strokeColor = source.strokeColor;
        target.strokeWidth = source.strokeWidth;
        target.strokeCap = source.strokeCap;
        target.strokeJoin = source.strokeJoin;
        target.strokeScaling = source.strokeScaling;
        target.dashArray = source.dashArray;
        target.dashOffset = source.dashOffset;
        target.opacity = source.opacity;
        target.blendMode = source.blendMode;
    }

    _roundPolygonCorners (path, radiusAmount) {
        if (!path || !path.closed || !path.segments || path.segments.length < 3 || radiusAmount <= 0) {
            return path;
        }

        const points = path.segments.map(segment => segment.point.clone());
        const roundedPath = new paper.Path();
        roundedPath.closed = true;

        for (let i = 0; i < points.length; i++) {
            const prev = points[(i + points.length - 1) % points.length];
            const current = points[i];
            const next = points[(i + 1) % points.length];

            const toPrev = prev.subtract(current);
            const toNext = next.subtract(current);
            const prevLen = toPrev.length;
            const nextLen = toNext.length;

            if (prevLen < 0.001 || nextLen < 0.001) {
                continue;
            }

            const inset = Math.min(radiusAmount, prevLen / 2, nextLen / 2);
            const start = current.add(toPrev.normalize(inset));
            const end = current.add(toNext.normalize(inset));

            if (roundedPath.segments.length === 0) {
                roundedPath.add(start);
            } else {
                roundedPath.lineTo(start);
            }

            if (!start.equals(end)) {
                roundedPath.quadraticCurveTo(current, end);
            }
        }

        if (roundedPath.segments.length < 3) {
            roundedPath.remove();
            return path;
        }

        path.remove();
        return roundedPath;
    }

    _createPolygonPath (rect, sides) {
        const rawPoints = [];
        const angleOffset = -Math.PI / 2;

        for (let i = 0; i < sides; i++) {
            const angle = angleOffset + ((Math.PI * 2) * i / sides);
            rawPoints.push(new paper.Point(
                Math.cos(angle),
                Math.sin(angle)
            ));
        }

        const xs = rawPoints.map(point => point.x);
        const ys = rawPoints.map(point => point.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const spanX = maxX - minX || 1;
        const spanY = maxY - minY || 1;

        const path = new paper.Path();
        for (const point of rawPoints) {
            const normalizedX = (point.x - minX) / spanX;
            const normalizedY = (point.y - minY) / spanY;
            path.add(new paper.Point(
                rect.left + (normalizedX * Math.abs(rect.width)),
                rect.top + (normalizedY * Math.abs(rect.height))
            ));
        }
        path.closed = true;
        if (this.rectRadius > 0) {
            return this._roundPolygonCorners(path, this.rectRadius);
        }
        return path;
    }

    _createShapePath (frame) {
        const rect = this._rectFromFrame(frame);
        if (this.rectSides === 4) {
            return new paper.Path.Rectangle(rect, this.rectRadius);
        }
        return this._createPolygonPath(rect, this.rectSides);
    }

    _updateSelectedShapes () {
        const selectedItems = getSelectedRootItems();
        let updated = false;
        for (const item of selectedItems) {
            if (!(item instanceof paper.Path) || !(item.data && item.data[RectTool.RECT_TOOL_DATA_KEY])) {
                continue;
            }

            const previousSides = item.data && item.data.rectSides ? item.data.rectSides : this.rectSides;
            const storedFrame = item.data && item.data[RectTool.RECT_FRAME_DATA_KEY];
            const frame = item.data && item.data[RectTool.RECT_FRAME_DATA_KEY] ? {
                center: new paper.Point(storedFrame.center[0], storedFrame.center[1]),
                width: storedFrame.width,
                height: storedFrame.height
            } : this._frameFromItem(item, previousSides);

            const replacement = this._createShapePath(frame);
            this._copyShapeStyle(item, replacement);
            replacement.data = {
                ...item.data,
                [RectTool.RECT_TOOL_DATA_KEY]: true,
                rectSides: this.rectSides,
                [RectTool.RECT_FRAME_DATA_KEY]: {
                    center: [frame.center.x, frame.center.y],
                    width: frame.width,
                    height: frame.height
                }
            };
            replacement.insertAbove(item);
            replacement.selected = true;
            item.remove();
            updated = true;
        }

        if (updated) {
            this.setSelectedItems();
            this.onUpdateImage();
        }
    }

    _drawRect (downPoint, point, modifiers) {
        if (this.rect) {
            this.rect.remove();
        }

        const rect = new paper.Rectangle(downPoint, point);
        const squareDimensions = getSquareDimensions(downPoint, point);
        if (modifiers.shift) {
            rect.size = squareDimensions.size.abs();
        }

        const frame = this._frameFromRect(rect);
        this.rect = this._createShapePath(frame);
        if (modifiers.alt) {
            this.rect.position = downPoint;
        } else if (modifiers.shift) {
            this.rect.position = squareDimensions.position;
        } else {
            const dimensions = point.subtract(downPoint);
            this.rect.position = downPoint.add(dimensions.multiply(0.5));
        }

        const storedFrame = this._frameFromItem(this.rect, this.rectSides);
        this.rect.data = {
            ...(this.rect.data || {}),
            [RectTool.RECT_TOOL_DATA_KEY]: true,
            rectSides: this.rectSides,
            [RectTool.RECT_FRAME_DATA_KEY]: {
                center: [storedFrame.center.x, storedFrame.center.y],
                width: storedFrame.width,
                height: storedFrame.height
            }
        };

        styleShape(this.rect, this.colorState);
    }
    handleMouseDown (event) {
        if (event.event.button > 0) return; // only first mouse button
        this.active = true;

        if (this.boundingBoxTool.onMouseDown(
            event, false /* clone */, false /* multiselect */, false /* doubleClicked */, this.getHitOptions())) {
            this.isBoundingBoxMode = true;
        } else {
            this.isBoundingBoxMode = false;
            clearSelection(this.clearSelectedItems);
        }
    }
    handleMouseDrag (event) {
        if (event.event.button > 0 || !this.active) return; // only first mouse button

        if (this.isBoundingBoxMode) {
            this.boundingBoxTool.onMouseDrag(event);
            return;
        }

        this.lastDownPoint = event.downPoint.clone();
        this.lastPoint = event.point.clone();
        this.lastModifiers = {
            alt: event.modifiers.alt,
            shift: event.modifiers.shift
        };
        this._drawRect(this.lastDownPoint, this.lastPoint, this.lastModifiers);
    }
    handleMouseUp (event) {
        if (event.event.button > 0 || !this.active) return; // only first mouse button

        if (this.isBoundingBoxMode) {
            this.boundingBoxTool.onMouseUp(event);
            this.isBoundingBoxMode = null;
            return;
        }

        if (this.rect) {
            if (this.rect.area < RectTool.TOLERANCE / paper.view.zoom) {
                // Tiny rectangle created unintentionally?
                this.rect.remove();
                this.rect = null;
            } else {
                this.rect.selected = true;
                this.setSelectedItems();
                this.onUpdateImage();
                this.rect = null;
            }
        }
        this.lastDownPoint = null;
        this.lastPoint = null;
        this.lastModifiers = null;
        this.active = false;
    }
    handleMouseMove (event) {
        this.boundingBoxTool.onMouseMove(event, this.getHitOptions());
    }
    deactivateTool () {
        this.boundingBoxTool.deactivateTool();
    }
}

export default RectTool;
