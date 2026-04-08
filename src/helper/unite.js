import paper from '@turbowarp/paper';
import {clearSelection, getSelectedRootItems, setItemSelection} from './selection';
import {isGroup} from './group';

const canUniteItem = function (item) {
    if (!item || isGroup(item)) {
        return false;
    }
    if (item instanceof paper.Raster || item instanceof paper.PointText) {
        return false;
    }
    return typeof item.unite === 'function';
};

const getUniteCandidates = function () {
    return getSelectedRootItems().filter(canUniteItem);
};

const shouldShowUnite = function () {
    return getUniteCandidates().length > 1;
};

const uniteSelection = function (clearSelectedItems, setSelectedItems, onUpdateImage) {
    const selected = getUniteCandidates();
    if (selected.length < 2) {
        return false;
    }

    const topMostSelected = selected[selected.length - 1];
    let merged = selected[0].clone({insert: false});

    for (let i = 1; i < selected.length; i++) {
        const temp = merged.unite(selected[i], {insert: false});
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

export {
    shouldShowUnite,
    uniteSelection
};
