var gfc2023 = ee.Image("UMD/hansen/global_forest_change_2023_v1_11")
var countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017")
var france = countries.filter(ee.Filter.eq('country_na', 'France'));
var gfc2023_france = gfc2023.clip(france);
var unchanged = gfc2023_france.select('treecover2000')
                .gt(10) // fermeture de la canopée pour les arbres de plus de 5m (en %)
                .and(gfc2023_france.select('loss').eq(0));
                
var unchangedVis = {
  min: 0,
  max: 1,
  palette: ['white', 'green']
};

Map.centerObject(france, 6);

Map.addLayer(unchanged.mask(unchanged), unchangedVis, 'Zones de forêt inchangées depuis 2000');

Map.addLayer(
    gfc2023_france, {bands: ['last_b50', 'last_b40', 'last_b30']}, 'fausses couleurs', 0);
    
Map.addLayer(gfc2023_france, {
  bands: ['loss', 'treecover2000', 'gain'],
  max: [1, 255, 1]
}, 'forest cover, loss, gain', 0);