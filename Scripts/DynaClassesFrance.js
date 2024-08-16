//ce script permet de regarder les dynamiques temporelles des espaces dee déprise agricole potentielle en France en fonction de l'occupation du sol de départ
//ce script marche mais il doit tourner quelques minutes
var france = countries.filter(ee.Filter.eq('country_na', 'France'));
var countries = ee.FeatureCollection("USDOS/LSIB_SIMPLE/2017");
var landCover1990 = ee.Image('COPERNICUS/CORINE/V20/100m/1990').clip(france).select('landcover');
var landCover2000 = ee.Image('COPERNICUS/CORINE/V20/100m/2000').clip(france).select('landcover');
var landCover2006 = ee.Image('COPERNICUS/CORINE/V20/100m/2006').clip(france).select('landcover');
var landCover2012 = ee.Image('COPERNICUS/CORINE/V20/100m/2012').clip(france).select('landcover');
var landCover2018 = ee.Image('COPERNICUS/CORINE/V20/100m/2018').clip(france).select('landcover');

//Friches agricoles (Guetté et Carruthers-Jones, 2023)

var lc21_1990 = landCover1990.gte(210).and(landCover1990.lte(219));
var lc22_1990 = landCover1990.gte(220).and(landCover1990.lte(229));
var lc23_1990 = landCover1990.gte(230).and(landCover1990.lte(239));
var lc24_1990 = landCover1990.gte(240).and(landCover1990.lte(249));
var lc21a24_1990 = landCover1990.gte(210).and(landCover1990.lte(249));

///entre 1990 et 2000
var lc32_2000 = landCover2000.gte(320).and(landCover2000.lte(329));
var deprise_agri_pot_2000 = lc32_2000.and(lc21a24_1990);

///entre 1990 et 2006
var lc32_2006 = landCover2006.gte(320).and(landCover2006.lte(329));
var deprise_agri_pot_2006 = lc32_2006.and(lc21a24_1990);

///entre 1990 et 2012
var lc32_2012 = landCover2012.gte(320).and(landCover2012.lte(329));
var deprise_agri_pot_2012 = lc32_2012.and(lc21a24_1990);

///entre 1990 et 2018
var lc32_2018 = landCover2018.gte(320).and(landCover2018.lte(329));
var deprise_agri_pot = lc32_2018.and(lc21a24_1990);
/*var da_21 = lc32_2018.and(lc21_1990);
var da_22 = lc32_2018.and(lc22_1990);
var da_23 = lc32_2018.and(lc23_1990);
var da_24 = lc32_2018.and(lc24_1990);*/

///2000 pas 2018
//var c2000_2018 = deprise_agri_pot_2000.and(deprise_agri_pot.not());

///calcul aires
var pixelArea = ee.Image.pixelArea();
function calcSurf(regionMasquee) {
  var surfaceM2 = regionMasquee.multiply(pixelArea);
  var surfaceReduite = surfaceM2.reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: france.geometry(),
    scale: 100, 
    crs: 'EPSG:2154',
    maxPixels: 1e14 
  });
  return ee.Number(surfaceReduite.get('landcover')).divide(1e6);
}

var surface_2000 = calcSurf(deprise_agri_pot_2000);
var surface_2006 = calcSurf(deprise_agri_pot_2006);
var surface_2012 = calcSurf(deprise_agri_pot_2012);
var surface_2018 = calcSurf(deprise_agri_pot);

var years = [2000, 2006, 2012, 2018];
var surfaces = [surface_2000, surface_2006, surface_2012, surface_2018];
var surfaces = [
  surface_2000.getInfo(),
  surface_2006.getInfo(),
  surface_2012.getInfo(),
  surface_2018.getInfo()
];

var years = [2000, 2006, 2012, 2018];

// Créez un graphique avec des options d'affichage adaptées
var chart = ui.Chart.array.values(surfaces, 0, years)
    .setChartType('LineChart')
    .setOptions({
      title: 'Surface des zones de déprise agricole potentielle (km²)',
      hAxis: {
        title: 'Année',
        minValue: 2000,  // Valeur minimale pour l'axe X
        maxValue: 2020,   // Valeur maximale pour l'axe X
      },
      vAxis: {
        title: 'Surface (km²)', 
        minValue: 600,  // Valeur minimale pour l'axe Y
        maxValue: 800,  // Valeur maximale pour l'axe Y
        format: 'decimal'  // Format pour les nombres
      },
      lineWidth: 2,
      pointSize: 5,
    });

print(chart);
print(surfaces);
/*print('2000', calcSurf(deprise_agri_pot_2000))
print('Surface deprise_agri_pot (km²):', calcSurf(deprise_agri_pot));
print('Surface c2000_2018 (km²):', calcSurf(c2000_2018));*/
/*print('Surface 21 vers 32 en 2018',calcSurf(da_21));
print('Surface 22 vers 32',calcSurf(da_22));
print('Surface 23 vers 32',calcSurf(da_23));
print('Surface 24 vers 32',calcSurf(da_24));*/


function calcSurfByClass(year) {
  var landCover = ee.Image('COPERNICUS/CORINE/V20/100m/' + year).clip(france).select('landcover');
  var lc32 = landCover.gte(320).and(landCover.lte(329));
  
  var da_21 = lc32.and(lc21_1990);
  var da_22 = lc32.and(lc22_1990);
  var da_23 = lc32.and(lc23_1990);
  var da_24 = lc32.and(lc24_1990);
  
  return [
    calcSurf(da_21).getInfo(),
    calcSurf(da_22).getInfo(),
    calcSurf(da_23).getInfo(),
    calcSurf(da_24).getInfo()
  ];
}

var years = [2000, 2006, 2012, 2018];
var allSurfaces = years.map(function(year) {
  return calcSurfByClass(year);
});

var data = [['Année', 'Classe 21', 'Classe 22', 'Classe 23', 'Classe 24']];
for (var i = 0; i < years.length; i++) {
  data.push([years[i]].concat(allSurfaces[i]));
}


var chart = ui.Chart(data)
    .setChartType('LineChart')
    .setOptions({
      title: 'Déprise agricole par classe de départ (km²)',
      hAxis: {
        title: 'Année',
        format: '####'
      },
      vAxis: {
        title: 'Surface (km²)', 
        minValue: 0,
        format: 'decimal'
      },
      series: {
        0: { color: '#1f77b4' },
        1: { color: '#ff7f0e' },
        2: { color: '#2ca02c' },
        3: { color: '#d62728' }
      }
    });

print(chart);
print('Surfaces par classe et par année:', data);
//Visualisation       
var depriseVis = {
  min: 0,
  max: 1,
  palette: ['white', 'red']
};



Map.centerObject(france, 6); // Centrer et zoomer

Map.addLayer(deprise_agri_pot.mask(deprise_agri_pot), depriseVis, 'deprise agricole 1990-2018');