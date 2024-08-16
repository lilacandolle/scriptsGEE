//ce script permet de calculer les surfaces de déprise agricole potentielle en Europe entre 2000 et 2018
var geometry = ee.Geometry.Polygon([
    [
      [-26.64873246104071, 66.07225537514246],
      [-16.45341996104071, 45.43052529125806],
      [-31.852249218563372, 40.44481644815948],
      [-26.13935859356343, 27.91429273359656],
      [-17.17451484356343, 21.20484862896586],
      [1.2825164064365708, 31.576150281886978],
      [29.58329765643657, 29.303119912589256],
      [41.36064140643657, 32.61851210280929],
      [50.32548515643657, 41.70363831791843],
      [39.07548515643657, 52.96018864800743],
      [32.92314140643657, 61.14188403480401],
      [35.38407890643657, 71.15848727621125]
    ]
  ]);
var countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017");

var pixelArea = ee.Image.pixelArea();
function calcSurf(regionMasquee, geometry) {
    /*
    * Calcule la surface d'une région masquée en km^2.
    */
  var surfaceM2 = regionMasquee.multiply(pixelArea);
  var surfaceReduite = surfaceM2.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: 100,
    crs: 'EPSG:3035',
    maxPixels: 1e16
  });
  return ee.Number(surfaceReduite.get('deprise_agri_pot')).divide(1e6);
}

function anaDepriseAgri(codePays){
    /*
   * Analyse de la déprise agricole pour un pays donné entre 2000 et 2018.
   * 
   * @param {string} codePays - Code FIPS du pays à analyser
   * @return {ee.Image} - Image Earth Engine représentant les zones de déprise agricole potentielle, avec un attribut
   * 'pays' contenant le code du pays.
   */
    var pays = countries.filter(ee.Filter.eq('country_co', codePays));
    //var clc1990 = ee.Image('COPERNICUS/CORINE/V20/100m/1990').clip(pays).select('landcover');
    var clc2000 = ee.Image('COPERNICUS/CORINE/V20/100m/2000').clip(pays).select('landcover');
    //var clc2006 = ee.Image('COPERNICUS/CORINE/V20/100m/2006').clip(pays).select('landcover');
    //var clc2012 = ee.Image('COPERNICUS/CORINE/V20/100m/2012').clip(pays).select('landcover');
    var clc2018 = ee.Image('COPERNICUS/CORINE/V20/100m/2018').clip(pays).select('landcover');
    
    //entre 2000 et 2018
    var lc32_2018 = clc2018.gte(320).and(clc2018.lte(329));
    //var lc32_2012 = clc2018.gte(320).and(clc2018.lte(329));
    //var lc32_2006 = clc2018.gte(320).and(clc2018.lte(329));
    
    var lc21a24_2000 = clc2000.gte(210).and(clc2000.lte(249));
    //var lc21a24_1990 = clc1990.gte(210).and(clc1990.lte(249));
    
    var deprise_agri_pot = lc32_2018.and(lc21a24_2000);
    //var deprise_agri_pot = lc32_2012.and(lc21a24_2000);
    //var deprise_agri_pot = lc32_2006.and(lc21a24_2000);
  
     return deprise_agri_pot
      .rename('deprise_agri_pot')
      .set('pays', codePays)
      .mask(deprise_agri_pot);
  }

var lot1 = [
  'RI', 'HU', 'GM', 'PL', 'LU', 'RO', 'LO', 'MJ', 'SP'
  ];

var lot2 = [
  'TU', 'AU', 'PO', 'GR', 'DA','IT', 'EI', 'LG', 'NL'
  ];

var lot3 = [
  'EN', 'BU', 'MT', 'BE', 'FR', 'SI', 'EZ', 'LH', 'HR'
  ];
  
var lot4 = [
  'AL', 'BK', 'CY', 'FI', 'IC', 'KV', 'MK', 'NO', 'SW', 'SZ', 'UK', 'LS'
  ]; // ces pays ne sont pas couverts par CLC en 1990

//calculer la déprise agricole potentielle pour chaque lot
var depriseAgriPotCollection1 = ee.ImageCollection(
    lot1.map(function(pays) {
      return anaDepriseAgri(pays);
    })
  );
  print('Collection de déprise agricole potentielle', depriseAgriPotCollection1);

var depriseAgriPotCollection2 = ee.ImageCollection(
    lot2.map(function(pays) {
      return anaDepriseAgri(pays);
    })
  );
  print('Collection de déprise agricole potentielle', depriseAgriPotCollection2);  

var depriseAgriPotCollection3 = ee.ImageCollection(
    lot3.map(function(pays) {
      return anaDepriseAgri(pays);
    })
  );
  print('Collection de déprise agricole potentielle', depriseAgriPotCollection3);

var depriseAgriPotCollection4 = ee.ImageCollection(
    lot4.map(function(pays) {
      return anaDepriseAgri(pays);
    })
  );
  print('Collection de déprise agricole potentielle', depriseAgriPotCollection4);  

//calculer les surfaces de déprise agricole potentielle pour chaque lot
var surfaceTotale1 = depriseAgriPotCollection1.map(function(image) {
    var surface = calcSurf(image, image.geometry());
    return ee.Feature(null, {'pays': image.get('pays'), 'surface': surface});
  });

var surfaceTotale2 = depriseAgriPotCollection2.map(function(image) {
    var surface = calcSurf(image, image.geometry());
    return ee.Feature(null, {'pays': image.get('pays'), 'surface': surface});
  });
  
var surfaceTotale3 = depriseAgriPotCollection3.map(function(image) {
    var surface = calcSurf(image, image.geometry());
    return ee.Feature(null, {'pays': image.get('pays'), 'surface': surface});
  });
  
var surfaceTotale4 = depriseAgriPotCollection4.map(function(image) {
    var surface = calcSurf(image, image.geometry());
    return ee.Feature(null, {'pays': image.get('pays'), 'surface': surface});
  });

//exporter les surfaces de déprise agricole potentielle par lot
Export.table.toDrive({
    collection: surfaceTotale1,
    description: 'SurfaceTotale1_0006',
    folder: 'EarthEngineExports',
    fileFormat: 'CSV'
  });
  
  Export.table.toDrive({
    collection: surfaceTotale2,
    description: 'SurfaceTotale2_0006',
    folder: 'EarthEngineExports',
    fileFormat: 'CSV'
  });
  
  Export.table.toDrive({
    collection: surfaceTotale3,
    description: 'SurfaceTotale3_0006',
    folder: 'EarthEngineExports', 
    fileFormat: 'CSV'
  });
  
  Export.table.toDrive({
    collection: surfaceTotale4,
    description: 'SurfaceTotale4_0006',
    folder: 'EarthEngineExports', 
    fileFormat: 'CSV'
  });


//Afficher et exporter le raster
// Fusionner les collections d'images pour chaque lot
var depriseAgriPotCollection = depriseAgriPotCollection1
.merge(depriseAgriPotCollection2)
.merge(depriseAgriPotCollection3)
.merge(depriseAgriPotCollection4);

// Fusionner les images dans une seule image
var depriseAgriPotImage = depriseAgriPotCollection.mosaic();
//afficher le masque
Map.addLayer(depriseAgriPotImage, {palette: 'red'}, 'depriseAgriPotImage');


// Exporter l'image fusionnée
/*var geometry = ee.Geometry.Polygon([
[
  [-26.64873246104071, 66.07225537514246],
  [-16.45341996104071, 45.43052529125806],
  [-31.852249218563372, 40.44481644815948],
  [-26.13935859356343, 27.91429273359656],
  [-17.17451484356343, 21.20484862896586],
  [1.2825164064365708, 31.576150281886978],
  [29.58329765643657, 29.303119912589256],
  [41.36064140643657, 32.61851210280929],
  [50.32548515643657, 41.70363831791843],
  [39.07548515643657, 52.96018864800743],
  [32.92314140643657, 61.14188403480401],
  [35.38407890643657, 71.15848727621125]
]
]);*/

/*Export.image.toDrive({
image: depriseAgriPotImage,
description: 'depriseAgriPotMosaic0018',
folder: 'EarthEngineExports', 
fileNamePrefix: 'depriseAgriPotMosaic',
region: geometry, 
scale: 100,
crs: 'EPSG:3035',
maxPixels: 1e13
});*/