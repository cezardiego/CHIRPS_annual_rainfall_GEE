// Load the feature as a FeatureCollection
var pernambuco = ee.FeatureCollection('users/diego/pernambuco')
var empty = ee.Image().byte();
var outline = empty.paint({
  featureCollection: pernambuco,
  color: 1,
  width: 2
});
Map.addLayer(outline, {palette: '#000000'}, 'Pernambuco',1);
Map.centerObject(pernambuco, 8)

// Load the CHIRPS dataset
var chirps = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY');

// Get the start and end years of the time series
var startYear = 2015;
var endYear = 2022;

// Loop through all the years in the time series
for (var year = startYear; year <= endYear; year++) {
  var start = ee.Date.fromYMD(year, 1, 1);
  var end = ee.Date.fromYMD(year, 12, 31);

  // Filter the data to the study area and to a specific year
  var filtered = chirps.filterBounds(pernambuco)
    .filterDate(start, end);

  // Get the cumulative precipitation for the feature and time period
  var cumulativePrecip = filtered.sum();

  // Clip the cumulative precipitation to the boundary
  var clipped = cumulativePrecip.clip(pernambuco);

  // Display the clipped cumulative precipitation on the map
  Map.addLayer(clipped, {min:0, max:3000, palette: ['red', 'yellow', 'green']}, 'Cumulative Precipitation');

  // Export the clipped cumulative precipitation to Google Drive
  Export.image.toDrive({
    image: clipped,
    description: 'clipped_cumulative_precip_chirps_pernambuco_' + year,
    folder: 'GEE_Exports',
    scale: 5000,
    region: pernambuco
  });
}