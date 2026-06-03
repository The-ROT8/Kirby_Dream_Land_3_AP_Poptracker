#target photoshop
var s2t = stringIDToTypeID,
    treeView = true;
var theDoc = app.activeDocument;
var docPath = theDoc.path;
var outfolder = new Folder(docPath);
(r = new ActionReference()).putProperty(s2t('property'), p = s2t('json'));
r.putEnumerated(s2t('document'), s2t('ordinal'), s2t('targetEnum'));
eval('var layersCollection = ' + executeActionGet(r).getString(p).replace(/\\/g, ''));
var needToProcess = collectAdjustmentLayers(layersCollection.layers)
var f = new File(outfolder + '/layerList.txt');
f.open('w');
f.encoding = 'UTF-8';
f.write(theDoc.name + '\n');
f.write(needToProcess.join('\n'));
f.close();
function collectAdjustmentLayers(layersObject, collectedLayers, tab) {
    collectedLayers = collectedLayers ? collectedLayers : [];
    tab = tab ? tab : '';
    for (var i = 0; i < layersObject.length; i++) {
        cur = layersObject[i];
        if (cur.layers) {
            collectedLayers.push(tab + cur.name)
            collectAdjustmentLayers(cur.layers, collectedLayers, treeView ? tab + '  ' : '')
        }
        else collectedLayers.push(tab + cur.name)
    }
    return collectedLayers;
}