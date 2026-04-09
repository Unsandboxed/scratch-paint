import paper from '@turbowarp/paper';
import {clearSelection, getSelectedRootItems, setItemSelection} from './selection';
import {isGroup} from './group';

const BooleanOperations = {
    UNITE: 'unite',
    SUBTRACT: 'subtract',
    INTERSECT: 'intersect',
    EXCLUDE: 'exclude'
};

const canBooleanOperateItem = function (item) {
    if (!item || isGroup(item)) {
        return false;
    }
    if (item instanceof paper.Raster || item instanceof paper.PointText) {
        return false;
    }
    return typeof item.unite === 'function';
};

const getBooleanCandidates = function () {
    return getSelectedRootItems().filter(canBooleanOperateItem);
};

const shouldShowBooleanOperation = function () {
    return getBooleanCandidates().length > 1;
};

const applyBooleanSelection = function (operation, clearSelectedItems, setSelectedItems, onUpdateImage) {
    const selected = getBooleanCandidates();
    if (selected.length < 2) {
        return false;
    }

    const topMostSelected = selected.reduce((top, item) => (
        !top || item.index > top.index ? item : top
    ), null);
    let merged = selected[0].clone({insert: false});

    for (let i = 1; i < selected.length; i++) {
        const temp = merged[operation](selected[i], {insert: false});
        merged.remove();
        merged = temp;
    }

    merged.insertAbove(topMostSelected);
    merged.applyMatrix = true;

    for (const item of selected) {
        item.remove();
    }

    clearSelection(clearSelectedItems);
    setItemSelection(merged, true);
    setSelectedItems();
    onUpdateImage();
    return true;
};

const uniteSelection = function (clearSelectedItems, setSelectedItems, onUpdateImage) {
    return applyBooleanSelection(BooleanOperations.UNITE, clearSelectedItems, setSelectedItems, onUpdateImage);
};

const subtractSelection = function (clearSelectedItems, setSelectedItems, onUpdateImage) {
    return applyBooleanSelection(BooleanOperations.SUBTRACT, clearSelectedItems, setSelectedItems, onUpdateImage);
};

const intersectSelection = function (clearSelectedItems, setSelectedItems, onUpdateImage) {
    return applyBooleanSelection(BooleanOperations.INTERSECT, clearSelectedItems, setSelectedItems, onUpdateImage);
};

const excludeSelection = function (clearSelectedItems, setSelectedItems, onUpdateImage) {
    return applyBooleanSelection(BooleanOperations.EXCLUDE, clearSelectedItems, setSelectedItems, onUpdateImage);
};

export {
    shouldShowBooleanOperation,
    uniteSelection,
    subtractSelection,
    intersectSelection,
    excludeSelection
};
