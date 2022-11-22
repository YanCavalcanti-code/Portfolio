var map = L.map('map', {
  center:[41.1670117741, -8.6489868164],
  zoom: 13,
  gestureHandling: true,
  fullscreenControl: true
});

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// Base Maps

var white = L.tileLayer('https://api.mapbox.com/styles/v1/yansc/ckxoe65xy368w16ryv8hr8ni5/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoieWFuc2MiLCJhIjoiY2t4b2g5aGJtMXhtazJxcWtwZHFiY3U5dCJ9.tQ0YwlEPHIc9KGDSwUofGw',{
  minZoom: 11,
  attribution:'© <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright"><br>OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'
}). addTo(map);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  minZoom: 11,
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

//var osmb = new OSMBuildings(map).load('https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
//Load OSM Buildings then disable it on first load; can only be viewed at certain scales
var osmb = new OSMBuildings(map).load('https://{s}.data.osmbuildings.org/0.2/anonymous/tile/{z}/{x}/{y}.json');
map.removeLayer(osmb);

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________

//Coordinate Mouse (1)
var coordDIV = document.createElement('div');
coordDIV.id = 'mapCoordDIV';
coordDIV.style.position = 'absolute';
coordDIV.style.top = '0px';
coordDIV.style.right = '0px';
coordDIV.style.zIndex = '900';
coordDIV.style.color = 'white';
coordDIV.style.fontFamily = 'Arial';
coordDIV.style.fontSize = '10pt';
coordDIV.style.backgroundColor = 'black';
coordDIV.style.opacity='0.7';

document.getElementById('map').appendChild(coordDIV);

//Coordinate Mouse (2)
map.on('mousemove', function(e){
    var lat = e.latlng.lat.toFixed(10);
    var lon = e.latlng.lng.toFixed(10);
    document.getElementById('mapCoordDIV').innerHTML = 'Lat: ' + lat + ' Lng: ' + lon;
});

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// Location

L.control.locate({
  flyTo: true,
  showPopup: false,
  strings: {
    title: "Location"
  }
}).addTo(map);

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// Leaflet Geocoder

/*var geocoder = L.Control.geocoder({
  position:'topleft',
  defaultMarkGeocode: false
}).addTo(map);*/

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// Mini Map

var osmUrl='https://api.mapbox.com/styles/v1/yansc/cknvzchqa21rw17nxl2jg80ae/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoieWFuc2MiLCJhIjoiY2tudnprZ2ZiMHJzaTJxcnZ2ZTFpNTR6YiJ9.ISvDn6VrdLEli_j3ihlIvA';
var osmAttrib='Map data &copy; OpenStreetMap contributors';		

var osm2 = new L.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttrib });
var miniMap = new L.Control.MiniMap(osm2, { toggleDisplay: true }).addTo(map);


//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// Simple Geojson - CAOP

var porto = new L.geoJson(caop,{
  weight: 0.8,
  color: '#585858',
  fillColor: '#FFFFFF',
  fillOpacity: 0.01
}).addTo(map);

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// Store Graffiti

function CustomIconStore (feature, latlng) {
  let myIconStore = L.icon({
    iconUrl: 'leaflet/img/store_icon.png',
    iconSize: [17, 17],
    iconBorder: "#FFFF",
    popupAnchor: [0, 0]
  })
  return L.marker(latlng, { icon: myIconStore })
}

let myLayerOptions = {
  pointToLayer: CustomIconStore,
  onEachFeature: function (feature, layer) {
    let name = feature.properties.name_store;
    let where = feature.properties.address;
    layer.bindPopup('<p><b>Store: </b>'+ name +'</p><p><b>Address: </b>'+ where +'</p>');
    }
}

var graffiti_store = new L.geoJson(store, myLayerOptions);

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// Graffiti - Cluster 

function StylePoint_graffiti(feature){
  return {
  fillColor: '#00BFFF',
  radius:6,
  weight: 1,
  opacity: 1,
  color: "#FFFFFF",
  fillOpacity: 0.8}
};
  
function popUp_graffiti(feature, layer) {
  var text = '<img src="'+feature.properties.image_link+'"width=200px"/><p><b>Artist(s):</b> ' + feature.properties['name'] + '</p><p><b>Local:</b> ' + feature.properties['location'] + '</p>'
  layer.bindPopup(text);
}

var graffiti = new L.geoJson(art,{
  style:StylePoint_graffiti,
  onEachFeature: popUp_graffiti,  
  pointToLayer: function (feature, latlng){
    return L.circleMarker(latlng, StylePoint_graffiti);
  },
});
var cluster_graffiti = L.markerClusterGroup();
//map.addLayer(markers_CPatrimonio);		// add it to the map
cluster_graffiti.addLayer(graffiti).addTo(map);

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// Graffiti - Heat

var art_heat = [];
var art_heat_porto = L.geoJson(art,{
  onEachFeature: function (feature, layer){
    art_heat.push([feature.geometry.coordinates[1], feature.geometry.coordinates[0]])
  }
});
var heat_graffiti = L.heatLayer(art_heat,{
  radius: 20,
  max:0.2,
});

//Legend

let legend_heat = L.control({position: "bottomright"});

  // Function that runs when legend is added to map
  legend_heat.onAdd = function() {
  
      // Create <div> element and populate it with HTML
      let div = L.DomUtil.create("div", "legend_square");        
      div.innerHTML = 
        '<small><b>Hot Spots Art<br>in 20 meters</b></small><br>' +
          '<i style="background-color: #FF0000"></i>Max.<br>' +
          '<i style="background-color: #FF8000"></i><br>' +
          '<i style="background-color: #FFFF00"></i><br>' +
          '<i style="background-color: #00FF00"></i><br>' +
          '<i style="background-color: #00FFFF"></i><br>' +
          '<i style="background-color: #7401DF"></i>Min.<br>' ;
  
      // Return the legend <div> containing the HTML content
      return div;
  
  };

map.on('overlayadd', function (eventLayer) {
    if (eventLayer.name === 'Hot Spots Art') {
    legend_heat.addTo(this); 
}});
map.on('overlayremove', function (eventLayer) {
    if (eventLayer.name === 'Hot Spots Art') {
    this.removeControl(legend_heat);
}});

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// BGRI

//Legend

let legend_subsc = L.control({position: "bottomright"});

  // Function that runs when legend is added to map
  legend_subsc.onAdd = function() {
  
      // Create <div> element and populate it with HTML
      let div = L.DomUtil.create("div", "legend_square");        
      div.innerHTML = 
          '<i style="background-color: #8A0808"></i>33320-56000</i><br>' +
          '<i style="background-color: #B40404"></i>21833-33320<br>' +
          '<i style="background-color: #DF0101"></i>16166-21833<br>' +
          '<i style="background-color: #FF4000"></i>11612-16166<br>' +
          '<i style="background-color: #FE9A2E"></i>7900-11612<br>' +
          '<i style="background-color: #F7D358"></i>4857-7900<br>' +
          '<i style="background-color: #F3F781"></i>2180-4857<br>' +
          '<i style="background-color: #F2F5A9"></i>1-2180<br>' +
          '<i style="background-color: #FFFFFF"></i>0<br>' ;
  
      // Return the legend <div> containing the HTML content
      return div;
  
  };

//Custom Info Control

var info = L.control({position: 'bottomright'});

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed

info.update = function (props) { 
    this._div.innerHTML = '<h4>Population Density 2021</h4>' +  (props ?
        '<b>Residents:</b> ' + props.N_INDIV21 + '<br/><b>Hab/km<sup>2</sup>:</b> ' + props.Dens_Pop21 + '<br/><b>Subsection:</b> ' + props.BGRI2021 + ''
        : 'Hover over a layer');
};

function getColor(Dens_Pop21) {
  return Dens_Pop21 == 0.0 ? '#FFFFFF':
         Dens_Pop21 < 2180.8 ? '#F2F5A9' :
         Dens_Pop21 < 4857.1 ? '#F3F781' :
         Dens_Pop21 < 7900.0 ? '#F7D358' :
         Dens_Pop21 < 11612.9 ? '#FE9A2E' :
         Dens_Pop21 < 16166.7 ? '#FF4000' :
         Dens_Pop21 < 21833.3 ? '#DF0101' :
         Dens_Pop21 < 33320.0 ? '#B40404' :
                          '#8A0808';
}
function style(feature) {
  return {
      fillColor: getColor(feature.properties.Dens_Pop21),
      weight: 0.5,
      opacity: 1,
      color: '#424242',
      fillOpacity: 0.7,
  };
}

//Add Interaction

function highlightFeature(e) {
  var density_hover = e.target;

  density_hover.setStyle({
      weight: 5,
      color: '#666',
  });

  info.update(density_hover.feature.properties);
}

function resetHighlight(e) {
  
 var density_hoverback = e.target;

 density_hoverback.setStyle({
  weight: 0.5,
  color: '#424242',
});

 info.update();
}

function onEachFeature(feature, layer) {
  layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
  });
  let edif_21 = feature.properties.N_EDIF21;
  let edif_11 = feature.properties.N_EDIF11;
  let aloj_21 = feature.properties.N_ALOJ21;
  let aloj_11 = feature.properties.N_ALOJ11;
  let hab_21 = feature.properties.N_INDIV21;
  let hab_11 = feature.properties.N_INDIV11;
  let dens_pop21 = feature.properties.Dens_Pop21;
  let dens_pop11 = feature.properties.Dens_Pop11;
  let cod_sub = feature.properties.BGRI2021;
  let area = feature.properties.Area_ha;
  let perim = feature.properties.Perimetro;
  layer.bindPopup('<p><b>Subsecção:</b> ' + cod_sub + '</p><h4>Census Date - INE</h4><table><tr><td></td><td><b>2021</b></td><td></td><td><b>2011</b></td></tr><tr><tr><td>Buildings:</td><td>' + edif_21 + '</td><td></td><td>' + edif_11 + '</td></tr><tr><td>Accommodation:</td><td>' + aloj_21 + '</td><td></td><td>' + aloj_11 + '</td></tr><tr><tr><td>Residents:</td><td>' + hab_21 + '</td><td></td><td>' + hab_11 + '</td></tr><tr><td>Population/km²:</td><td>' + dens_pop21 + '</td><td></td><td>' + dens_pop11 + '</td></tr></tr></table><h4> Geometry</h4><p>Area: ' + area + ' ha &nbsp; Perimeter: ' + perim + ' m</p><p><strong>Source:</strong> Base Geográfica de Referênciação de Informação (BGRI-2011/2021)</p>', {maxHeight: 225})  
}

var population = L.geoJson(bgri, {
  style: style,
  onEachFeature: onEachFeature,
});

//Add and Remove legend

map.on('overlayadd', function (eventLayer) {
  if (eventLayer.name === 'Population') {
  legend_subsc.addTo(this),
  info.addTo(this); 
}});
map.on('overlayremove', function (eventLayer) {
  if (eventLayer.name === 'Population') {
  this.removeControl(legend_subsc),
  this.removeControl(info);
}});

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// COS

// Porto COS - 2º nível

function getAreaColor(feature){
  switch (feature.properties.COS2018_n4){
  case "1.1.1.1" : return '#FE9A2E' ; //Tecido edificado contínuo predominantemente vertical
  case "1.1.1.2" : return '#fff7bc' ; //Tecido edificado contínuo predominantemente horizontal
  case "1.1.3.1" : return '#A4A4A4' ; //Áreas de estacionamentos e logradouros
  case "1.1.2.1" : return '#F7BE81' ; //Tecido edificado descontínuo
  case "1.1.2.2" : return '#FAAC58' ; //Tecido edificado descontínuo esparso
  case "1.2.1.1" : return '#F7FE2E' ; //Indústria
  case "1.6.5.1" : return '#FF0000' ; //Outros equipamentos e instalações turísticas
  case "1.4.1.1" : return '#848484' ; //Rede viária e espaços associados
  case "1.5.3.1" : return '#FA5858' ; //Áreas em construção
  case "1.7.1.1" : return '#58FA82' ; //Parques e jardins
  case "1.6.4.1" : return '#585858' ; //Cemitérios
  case "1.6.1.2" : return '#A901DB' ; //Instalações desportivas
  case "1.6.3.1" : return '#FE2EF7' ; //Equipamentos culturais
  case "2.1.1.1" : return '#A5DF00' ; //Culturas temporárias de sequeiro e regadio
  case "2.3.2.1" : return '#00FF80' ; //Mosaicos culturais e parcelares complexos
  case "5.1.1.7" : return '#04B404' ; //Florestas de outras folhosas
  case "5.1.2.1" : return '#0B6121' ; //Florestas de Pinheiro Bravo
  case "6.1.1.1" : return '#64FE2E' ; //Matos
  case "9.1.1.1" : return '#2E9AFE' ; //Cursos de águas naturais
  case "5.1.1.3" : return '#088A29' ; //Floresta de outros carvalhos
  case "9.1.2.1" : return '#00BFFF' ; //Lagos e lagoas interiores artificiias
  case "9.3.3.1" : return '#013ADF' ; //Desembocaduras fluviais
  case "1.1.3.2" : return '#E6E6E6' ; //Espaços vazios sem construção
  case "1.4.1.2" : return '#424242' ; //Rede ferroviária e espaços associados
  case "2.3.3.1" : return '#04B486' ; //Agricultura com espaços naturais e seminaturais
  case "5.1.1.5" : return '#088A4B' ; //Florestas de eucalípto
  case "2.2.2.1" : return '#4B8A08' ; //Pomares
  case "2.4.1.1" : return '#AEB404' ; //Agricultura protegida e viveiros
  case "1.2.3.1" : return '#A9F5A9' ; //Instalações agrícolas
  case "7.1.1.2" : return '#F3F781' ; //Praias, dunas e areias costeiras
  case "1.4.2.1" : return '#424242' ; //Terminais portuários
  case "1.2.2.1" : return '#BCA9F5' ; //Comércio
  case "1.4.3.2" : return '#00FFFF' ; //Aeródromos
  case "1.6.2.2" : return '#FF0080' ; //Equipamentos de lazer
  case "9.3.4.1" : return '#0404B4' ; //Oceano
  case "7.1.2.1" : return '#61380B' ; //Rocha nua
}};

function areaStyle_cos(feature){
  return {
  fillColor: getAreaColor(feature),
  weight: 0.4,
  opacity: 1,
  color: "#424242",
  fillOpacity: 0.7}
};

//Add Interation

function highlightFeature_cos(e) {
  var cos_hover = e.target;

  cos_hover.setStyle({
    fillOpacity: 0.3,
  });

  info_cos.update(cos_hover.feature.properties);
}

function resetHighlight_cos(e) {
  
 var cos_hoverback = e.target;

 cos_hoverback.setStyle({
  fillOpacity: 0.7,
});

 info_cos.update();
}

function onEachFeature_cos  (feature, layer) {
  layer.on({
      mouseover: highlightFeature_cos,
      mouseout: resetHighlight_cos,
  });

  let classe = feature.properties.COS2018_Lg;
  let area = feature.properties.Area_ha;
  layer.bindPopup('<p><b>Carta de Ocupação do Solo</b><br><small>(4º nível de classificação)</small></p><p><b>Classe:</b> ' + classe + '</p><p><b>Área:</b> ' + area + ' ha<p><b>Fonte:</b> d.gTerritório - 2018</p>', {maxWidth: 230})
}

var ocupsolo = L.geoJSON(cos,{
  style:areaStyle_cos,  
  onEachFeature: onEachFeature_cos
});

//Custom Info Control

var info_cos = L.control({position: 'bottomright'});

info_cos.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed

info_cos.update = function (props) {
  this._div.innerHTML = '<h4>Land Cover 2018</h4>' +  (props ?
  '<b>Class:</b> ' + props.COS2018_Lg + '<br/> <b>Area:</b> ' + props.Area_ha + ' ha<br/> '
  : 'Hover over a layer');
};

map.on('overlayadd', function (eventLayer) {
  if (eventLayer.name === 'Land Cover') {
  info_cos.addTo(this); 
}});
map.on('overlayremove', function (eventLayer) {
  if (eventLayer.name === 'Land Cover') {
  this.removeControl(info_cos);
}});

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// DEM

var topo_raster = L.imageOverlay ('leaflet/geojson/Topo_Raster.png', [[41.1383506797128007, -8.6912940694204384],[41.1859353051988961, -8.5526134550583333]], {opacity:0.8});

// Legend

let legend_topo = L.control({position: "bottomright"});

  // Function that runs when legend is added to map
  legend_topo.onAdd = function() {
  
      // Create <div> element and populate it with HTML
      let div = L.DomUtil.create("div", "legend_square");        
      div.innerHTML = 
          '<b>Elevation</b><br>' +
          '<small>Meters</small><br>' +
          '<i style="background-color: red"></i>163,555<br>' +
          '<i style="background-color: orange"></i>119,411<br>' +
          '<i style="background-color: yellow"></i>75,167<br>' +
          '<i style="background-color: #A5DF00"></i>44,244<br>' +
          '<i style="background-color: green"></i>-13,321<br>';
  
      // Return the legend <div> containing the HTML content
      return div;
  
  };

  map.on('overlayadd', function (eventLayer) {
    if (eventLayer.name === 'Elevation') {
    legend_topo.addTo(this); 
  }});
  map.on('overlayremove', function (eventLayer) {
    if (eventLayer.name === 'Elevation') {
    this.removeControl(legend_topo);
  }});

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// Layer Control

var marker_0 = L.marker([0,0]);

var baseMaps = {
  "Mapbox - Light Map": white,
  "Esri - Word Imagery": Esri_WorldImagery
};

var overlayMaps = {
  "<b>Street Art</b>":{
    "Hot Spots Art": heat_graffiti,
    "Murals": cluster_graffiti,
    "Disable Layer": marker_0
  },
  "<b>Data Complement</b>":{
    "Graffiti Stores": graffiti_store,
    "Land Cover": ocupsolo,
    "Population": population,
	"Elevation": topo_raster,	  
    "3D City Map": osmb
  } 
};

var options = {
  exclusiveGroups: ["<b>Street Art</b>"]
};

var layerControl = L.control.groupedLayers(baseMaps, overlayMaps, options, {
  collapsed: false
}).addTo(map);

var htmlObject = layerControl.getContainer();
var layers_side = document.getElementById('autopan');

function setParent(el, newParent) {
  newParent.appendChild(el);
}
setParent(htmlObject, layers_side);

//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
//_______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________
// Scale

L.control.scale().addTo(map);


// create the sidebar instance and add it to the map
        var sidebar = L.control.sidebar({ container: 'sidebar' })
            .addTo(map)
            .open('autopan');


        // be notified when a panel is opened
        sidebar.on('content', function (ev) {
            switch (ev.id) {
                case 'autopan':
                sidebar.options.autopan = true;
                break;
                default:
                sidebar.options.autopan = false;
            }
        });

        var userid = 0
        function addUser() {
            sidebar.addPanel({
                id:   'user' + userid++,
                tab:  '<i class="fa fa-user"></i>',
                title: 'User Profile ' + userid,
                pane: '<p>user ipsum dolor sit amet</p>',
            });
        }


        
