import 'bootstrap';
import $ from 'jquery';
require('webpack-jquery-ui/resizable');
import L from 'leaflet';
import mapboxgl from 'mapbox-gl';
import mapboxGL from 'mapbox-gl-leaflet';
// import { GeoSearchControl, GoogleProvider } from 'leaflet-geosearch';
// import html2canvas from 'html2canvas';
import leafletImage from 'leaflet-image';   // handmatige fix: https://github.com/mapbox/leaflet-image/issues/41
import './assets/js/Control.Loading';

import './assets/scss/app.scss';
import './assets/css/Control.Loading.css';

let defaultSnowMapStyle = 'https://tiles.placethemoment.com/styles/snow/{z}/{x}/{y}.png';
let defaultMoonMapStyle = 'https://tiles.placethemoment.com/styles/granite/{z}/{x}/{y}.png';
let defaultGraniteMapStyle = 'https://tiles.placethemoment.com/styles/granite/{z}/{x}/{y}.png';
let defaultMintMapStyle = 'https://tiles.placethemoment.com/styles/mint/{z}/{x}/{y}.png';

// const provider = new GoogleProvider({
//     params: {
//         fields: 'place_id',
//         key: 'AIzaSyDmN3d6aCXHXYo_oLjCEAdvUmO3ca38CVQ'
//     }
// });

// const searchControl = new GeoSearchControl({
//   provider: provider,
//   autoCompleteDelay: 1000,
//   retainZoomLevel: false,
//   animateZoom: false,
// });

const map = L.map('mapbox', { 
    renderer: L.canvas(),
    preferCanvas: true,
    zoomControl: false,
    attributionControl: false,
    loadingControl: true
});

// map.addControl(searchControl);

let varId;  // WooCommerce ID
let addToCart = $('#addToCart');
let cartUrl = addToCart.attr('action');

let currentPrice = 49;
let currentMarkerStyle = "yellow";
let currentFormat = "50x70";
let currentStyle = defaultStyle();
let defaultStartView = defaultView();

let defaultMarkerStyleUrl = getMarker(currentMarkerStyle);
var imgData = "";
let isMobile = false;

// Hidden Form values
let formCoordinates = $('#addToCart input[name="coordinates"]');
let formPlaceId = $('#addToCart input[name="placeid"]');
let formZoom = $('#addToCart input[name="zoom"]');
let formMarkerCoordinates = $('#addToCart input[name="marker_coordinates"]');
let formMarkerStyle = $('#addToCart input[name="marker_style"]');
let formVariationId = $('#addToCart input[name="variation_id"]');
let formPrice = $('#addToCart button[type="submit"]').find('span').not(":last-child");

let ptm_moment = $('#addToCart input[name="ptm_moment"]');
let ptm_subline = $('#addToCart input[name="ptm_subline"]');
let ptm_tagline = $('#addToCart input[name="ptm_tagline"]');
let ptm_thumb = $('#addToCart input[name="ptm_thumb"]');

map.on('load', function(){
    formCoordinates.val(JSON.stringify(map.getBounds()));
    formZoom.val(13);
    formMarkerStyle.val(currentMarkerStyle);
    formMarkerCoordinates.val(L.latLng([defaultStartView.ne.lat,defaultStartView.ne.lng]));
})
.fitBounds(L.latLngBounds([defaultStartView.ne.lat,defaultStartView.ne.lng],[defaultStartView.sw.lat,defaultStartView.sw.lng]));
// map.setZoom(3);

let ptmSnow = L.tileLayer(defaultSnowMapStyle, { attribution: false, maxZoom: 18, minZoom: 2, crossOrigin: 'anonymous'}),
    ptmMoon = L.tileLayer(defaultMoonMapStyle, { attribution: false, maxZoom: 18, minZoom: 2, crossOrigin: 'anonymous' }),
    ptmGranite = L.tileLayer(defaultGraniteMapStyle, { attribution: false, maxZoom: 18, minZoom: 2, crossOrigin: 'anonymous'}),
    ptmMint = L.tileLayer(defaultMintMapStyle, { attribution: false, maxZoom: 18, minZoom: 2, crossOrigin: 'anonymous'});

let activeLayer = getStyle(currentStyle);
activeLayer.addTo(map);

let markerOnMap = new L.marker(map.getCenter(), {
    icon: L.icon({
    iconUrl: defaultMarkerStyleUrl,
    iconSize: [24, 32],
    iconAnchor: [12, 32], 
    className: 'marker'
}),
draggable: true,
}).addTo(map);

L.control.zoom({position:'topright'}).addTo(map);

// let gmapi = new XMLHttpRequest();

// gmapi.open('GET', 'https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=Oculus%20Rift%20Eindhoven&inputtype=textquery&fields=photos,formatted_address,geometry/location&key=AIzaSyCE1svBjPmf71zWMhdr5r0Xu9EDN2sxwHk', true);
// gmapi.onload = function () {

let input = document.createElement("input");
    input.id = "searchBox";
let buttonUI = $('<span class="input-group-prepend"><button class="btn btn-outline-light border-left-0 border"><i class="fa fa-search"></i></button></span>');

const geocoderInput = $('#geocoder');

const GooglePlacesSearchBox = L.Control.extend({
  onAdd: function() {
      return input;
  }
});
(new GooglePlacesSearchBox).addTo(map);

$('.mapwindow').append($('.leaflet-control-container'));

geocoderInput.append(input);
geocoderInput.append(buttonUI);

$(input).addClass('form-control py-2 border-right-0 border')
.attr('placeholder','Enter your place');
input.focus();

input.addEventListener('keypress', function(e){
  getMapData(e);
});
buttonUI.on("click", "button", function(e){
  getMapData(e);
});

map.on('zoomend', function(){
    formZoom.val(map.getZoom());
    formCoordinates.val(JSON.stringify(map.getBounds()));
    updateDebugger();
});

map.on('moveend', function(){
    formCoordinates.val(JSON.stringify(map.getBounds()));
    updateDebugger();
});


/* Setting defaults to UI */
ptm_subline.val(defaultStartView.name);
$('#sublineInput').val(defaultStartView.name);
$("#posterText .card-text:first").html(defaultStartView.name);
ptm_tagline.val('The Netherlands');
$('#taglineInput').val('The Netherlands');
$("#posterText .card-text:last").html('The Netherlands');


/* INITIAL BREAKPOINTS CHECK */
$(document).ready(function() {
    checkSize();    
    $(window).resize(checkSize);   

    // Needs realtime isMobile check!
    if(isMobile){
        $('main').on('click', function(){
            $('.collapse').collapse('hide');
        });

        $('#collapseTwo').on('show.bs.collapse', function(){
            $('#collapseThree').collapse('hide');
            $('#posterWrapper').css('transform', 'translateY(-27%)');
            $('.fb_dialog').css('transform', 'translateY(-270%)');
        });
        $('#collapseTwo').on('hide.bs.collapse', function(){
            $('#posterWrapper').css('transform','');
            $('.fb_dialog').css('transform','translateY(0%)');
        });        
        $('#collapseThree').on('show.bs.collapse', function(){
            $('#collapseTwo').collapse('hide');
            $('#posterWrapper').css('transform', 'translateY(-30%)');
            $('.fb_dialog').css('transform', 'translateY(-320%)');
        });
        $('#collapseThree').on('hide.bs.collapse', function(){
            $('#posterWrapper').css('transform','');
            $('.fb_dialog').css('transform','translateY(0%)');
        });

        $('#accordion .btn-group button.btn-ptmLight').on('click', function(){
            $('#accordion .btn-group button').removeClass('active');
        });

        $('.collapse').on('show.bs.collapse', function (){
            $('button[data-target="#'+$(this).attr('id')+'"]').addClass('active');
        });
        $('.collapse').on('hide.bs.collapse', function (){
            $('button[data-target="#'+$(this).attr('id')+'"]').removeClass('active');
        });        

        $('nav.navbar').removeClass('d-flex').addClass('d-none');

        $('.fb_dialog').css({'right':'0','position':'relative','bottom':'144pt','float':'right'});
        
    }
    
    $('#posterText').on('click', function(){
        $('#collapseTwo').collapse('toggle');
        $('#momentInput').focus();
    });
});


function checkSize(){
    // if ($(".sidebar-sticky").css('position') != 'sticky'){
    if ($("#accordion > div").css('display') == 'none'){
        isMobile = true;

        if(!$('#collapseOne').hasClass('show')){
            $('#collapseOne').addClass('show');
        }        
        
        addToCart.appendTo('#btnGroup');

    } else {
        // $('#accordion .navbar span').next().prepend(addToCart);
    }

}

// *** Resize Poster Canvas ***
var $el = $("#posterCanvas");
var elHeight = $el.outerHeight();
var elWidth = $el.outerWidth();

var $wrapper = $("#posterWrapper");

$wrapper.resizable({
    resize: doResize
});

function doResize(event, ui) {

var scale, origin;
    
scale = Math.min(
    ui.size.width / elWidth,    
    ui.size.height / elHeight
);

scale = scale > 1 ? 1 : scale;

$el.css({
    transform: "translate(-50%, -50%) " + "scale(" + scale + ")"
});

}

var starterData = { 
size: {
    width: $wrapper.width(),
    height: $wrapper.height()
}
}
doResize(null, starterData);

$(window).resize(function() {
    starterData = { 
        size: {
            width: $wrapper.width(),
            height: $wrapper.height()
        }
    }
    doResize(null, starterData);
});

let debugPanel = $('#debugger');

let rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

let token = function() {
    return rand() + rand() // extra rand() to make it longer
};

function getMapData(e){
  let key,txtInput;

  if(e.type === 'keypress')
    key = e.which || e.keyCode;
  else if(e.type === 'click')
    key = 13;

  if (key === 13) {    
    txtInput = encodeURI($(input).val().toString());

    $.getJSON('https://www.placethemoment.com/api/v2/json.php?input='+txtInput, function(data){
      if(data.candidates.length){
      
        let place = data.candidates[0];
        let address = place.formatted_address.split(', ');
        let latlng,latlngbounds,northeast,southwest;
        let locationCity, locationCountry, locationName;
        let subline,tagline;

        formPlaceId.val(place.place_id);
        locationName = place.name;
        locationCountry = address[address.length-1];
        locationCity = (address.length > 2) ? address[1].replace(/\d+? [A-Z][A-Z]/g, '') : ''; 

        if(locationCity == locationName)
            tagline = locationCountry;
        else if(locationCountry == locationName)
            tagline = locationCity;
        else
            tagline = locationCity ? locationCity+" - "+locationCountry : locationCountry;

        $('#sublineInput').val(locationName);
        ptm_subline.val(locationName);
        $('#taglineInput').val(tagline);
        ptm_tagline.val(tagline);

        $("#posterText .card-text:first").html(locationName);
        $("#posterText .card-text:last").html(tagline);

        latlng = L.latLng(
          place.geometry.location.lat,
          place.geometry.location.lng
        );
        northeast = L.latLng(place.geometry.viewport.northeast);
        southwest = L.latLng(place.geometry.viewport.southwest);
        latlngbounds = L.latLngBounds(northeast,southwest);

        if(markerOnMap)
          map.removeLayer(markerOnMap);
          
        let markerStyle;            
        $('#markerSelector').find("label").each(function(){ 
            if($(this).hasClass('active')){
                markerStyle = getMarker($(this).attr('id'));
            }
        });

        markerOnMap = new L.marker(latlng, {
          icon: L.icon({
            iconUrl: defaultMarkerStyleUrl,
            iconSize: [24, 32], 
            iconAnchor: [12, 32], 
            className: 'marker'
          }),
          draggable: true,
        })
        .addTo(map);
          
        markerOnMap.setIcon(L.icon({
          iconUrl: defaultMarkerStyleUrl,
          iconSize: [24, 32], 
          iconAnchor: [12, 32], 
          className: 'marker' }));
                  
        formMarkerCoordinates.val(markerOnMap.getLatLng());
          
        markerOnMap.on('dragend', function(){
          formMarkerCoordinates.val(markerOnMap.getLatLng());
        });
        
        map.flyToBounds(latlngbounds, {duration: 3, maxZoom: 15});
        formCoordinates.val(JSON.stringify(latlngbounds));
        updateDebugger();

      };
    });
  };
};

function updateDebugger(){
    // console.log(map.getZoom());
    debugPanel.html('sw='+btoa(
        map.getBounds().getSouth()+','+
        map.getBounds().getWest())
        +'&ne='+btoa(
        map.getBounds().getNorth()+','+
        map.getBounds().getEast())
    );    
}

function findGetParameter(parameterName) {
    let result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function getCoordinates(value){
    let cor = new Array();
    cor = value ? value.split(',') : false;
    return cor;
}


function defaultView(){
    // 50.795953386601,5.6225967407227,50.896103955544,5.7812118530273
    // let place = L.LatLngBounds(50.795953386601,5.6225967407227,50.896103955544,5.7812118530273);    
    
    let userCoordinates = getCoordinates(findGetParameter('c'));
    console.log(userCoordinates);

    if(userCoordinates)
    {
      let place = {
        name: 'User Coordinates',
        ne: {
          lat : userCoordinates[0],
          lng : userCoordinates[1]
        },
        sw: {
          lat : userCoordinates[2],
          lng : userCoordinates[3]
        }
      }

      return place;

    } else {

      let places = {
        0 : {
          name: 'Eindhoven',
          ne: {
            lat : '51.49762961696847',
            lng : '5.539512634277345'
          },
          sw: {
            lat : '51.398777259985444',
            lng : '5.380897521972656'
          },
          zoom : '12.1'
        },
        1 : {
          name: 'Utrecht',
          ne: {
            lat : '52.13664902426816',
            lng : '5.193443298339845'
          },
          sw: {
            lat : '52.039187769080115',
            lng : '5.034828186035157'
          },
          zoom : '12.1'
        },
        2 : {
          name: 'Amsterdam',
          ne: {
            lat : '52.39959100269025',
            lng : '4.939727783203125'
          },
          sw: {
            lat : '52.35117489482139',
            lng : '4.860420227050782'
          },
          zoom : '12.1'
        },
      }

      let randomItem = Math.floor(Math.random() * Object.keys(places).length);
      return places[randomItem];

    }
  }

function defaultStyle(){
    
    let style = findGetParameter('attribute_design') ? findGetParameter('attribute_design') : "moon";
    currentFormat = findGetParameter('attribute_pa_dimensions') ? findGetParameter('attribute_pa_dimensions') : "50x70";
    $('.poster').addClass(style);
    $('#addToCart').attr('action', cartUrl+'?attribute_pa_dimensions='+currentFormat+'&attribute_design='+style);
        
    return style;    
}

function getStyle(name){

    if(name == 'mapboxStyle'){
        varId = 1207
        return mapboxStyle;
    }
    else if(name == 'maputnikStyle'){
        varId = 1207
        return maputnikStyle;
    }
    else if(name == 'snow' && currentFormat == '30x40'){
        formVariationId.val(2129);
        $('.ptm-cta').addClass('bounce');
        currentPrice = 39;
        formPrice.each(function(){ $(this).removeClass('py-3').addClass('py-2').html('&euro;'+currentPrice).prepend('<small class="d-block text-white">&euro;45</small>') })
        return ptmSnow
    }
    else if(name == 'moon' && currentFormat == '30x40'){
        formVariationId.val(2130);
        $('.ptm-cta').addClass('bounce');
        currentPrice = 39;
        formPrice.each(function(){ $(this).removeClass('py-3').addClass('py-2').html('&euro;'+currentPrice).prepend('<small class="d-block text-white">&euro;45</small>') })
        return ptmMoon
    }
    else if(name == 'granite' && currentFormat == '30x40'){
        formVariationId.val(2131);
        $('.ptm-cta').addClass('bounce');
        currentPrice = 39;
        formPrice.each(function(){ $(this).removeClass('py-3').addClass('py-2').html('&euro;'+currentPrice).prepend('<small class="d-block text-white">&euro;45</small>') })
        return ptmGranite
    }
    else if(name == 'mint' && currentFormat == '30x40'){
        formVariationId.val(2132);
        $('.ptm-cta').addClass('bounce');
        currentPrice = 39;
        formPrice.each(function(){ $(this).removeClass('py-3').addClass('py-2').html('&euro;'+currentPrice).prepend('<small class="d-block text-white">&euro;45</small>') })
        return ptmMint
    }
    else if(name == 'snow' && currentFormat == '50x70'){
        formVariationId.val(1207);
        $('.ptm-cta').removeClass('bounce');
        currentPrice = 49;
        formPrice.each(function(){ $(this).removeClass('py-2').addClass('py-3').html('&euro;'+currentPrice) })
        return ptmSnow
    }
    else if(name == 'granite' && currentFormat == '50x70'){
        formVariationId.val(1209);
        $('.ptm-cta').removeClass('bounce');
        currentPrice = 49;
        formPrice.each(function(){ $(this).removeClass('py-2').addClass('py-3').html('&euro;'+currentPrice) })
        return ptmGranite
    }
    else if(name == 'mint' && currentFormat == '50x70'){
        formVariationId.val(1210);
        $('.ptm-cta').removeClass('bounce');
        currentPrice = 49;
        formPrice.each(function(){ $(this).removeClass('py-2').addClass('py-3').html('&euro;'+currentPrice) })
        return ptmMint
    }
    else {      
      formVariationId.val(1208);
      $('.ptm-cta').removeClass('bounce');
      currentPrice = 49;
      formPrice.each(function(){ $(this).removeClass('py-2').addClass('py-3').html('&euro;'+currentPrice) })
      return ptmMoon
  }
    
}
function getVariation(style){
    if(style == 'snow')
        return 1207;
    else if(style == 'moon')
        return 1208;
    else if(style == 'granite')
        return 1209;
    else if(style == 'mint')
        return 1210;
}

function defaultMarkerStyle(){
    if(currentStyle == "snow")
        return 'mint';
    else if(currentStyle == "moon")
        return 'snow';
    else if(currentStyle == "granite")
        return 'yellow';
    else if(currentStyle == "mint")
        return 'granite';
}

function getMarker(style, poster = false){
    if(!poster){
        if(style == "snow")
            return 'http://dev.placethemoment.com/build/images/ptm-marker-snow.svg';
        else if(style == "granite")
            return 'http://dev.placethemoment.com/build/images/ptm-marker-granite.svg';
        else if(style == "yellow")
            return 'http://dev.placethemoment.com/build/images/ptm-marker-yellow.svg';
        else if(style == "mint")
            return 'http://dev.placethemoment.com/build/images/ptm-marker-mint.svg';
    } else {
        if(style == "snow")
            return 'http://dev.placethemoment.com/build/images/ptm-marker-mint.svg';
        else if(style == "granite")
                return 'http://dev.placethemoment.com/build/images/ptm-marker-yellow.svg';
        else if(style == "moon")
            return 'http://dev.placethemoment.com/build/images/ptm-marker-snow.svg';
        else if(style == "mint")
            return 'http://dev.placethemoment.com/build/images/ptm-marker-granite.svg';
    }
}

function KeyPress(e) {
    var evtobj = window.event? event : e
    if (evtobj.keyCode == 112 && evtobj.ctrlKey){

        debugPanel.toggleClass('d-block');

    };
}

document.onkeydown = KeyPress;

let activeTab;

$(".nav-item").click(function(e){
    
    if(e.target.id == "moment-tab"){
        $('main').addClass('moment');
        $('main').animate({scrollTop: $("main").height()}, 'slow');
        //return false;        
    }
    else if(activeTab == "moment-tab") {
        $('main').removeClass('moment');
        $('main').animate({scrollTop: 0}, 'slow');
    }

    activeTab = e.target.id;
});

// Dynamic text on poster
$('#momentInput').val($("#posterText .card-title").text());
//$('#momentInput').change(function(){
$("#momentInput").on("input", function(){
    $("#posterText .card-title").text($(this).val());
    ptm_moment.val($(this).val());
});

$("#sublineInput").on("input", function(){    
    $("#posterText .card-text:first").text($(this).val());
    ptm_subline.val($(this).val());
});

$("#taglineInput").on("input", function(){    
    $("#posterText .card-text:last").text($(this).val());
    ptm_tagline.val($(this).val());
});

$("#styleSelector .ptm-btn").click(function ( event ) {
    
    $(this).parent().find("label").each(function(){
        $(this).removeClass('active');
    });

    currentStyle = event.target.id;
    let posterSize = (currentFormat == '30x40') ? "small" : '';
    $('.poster').attr('class','card poster '+posterSize+' '+event.target.id);
    $('#addToCart').attr('action', cartUrl+'?attribute_pa_dimensions='+currentFormat+'&attribute_design='+currentStyle);

    map.removeLayer(activeLayer);
    activeLayer = getStyle(currentStyle);
    map.addLayer(activeLayer);    

    // let marker = $('#markerSelector').find("label.active").attr('id');
    markerOnMap.setIcon(L.icon({ 
        iconUrl: defaultMarkerStyleUrl,
        iconSize: [24, 32], 
        iconAnchor: [12, 32], 
        className: 'marker' 
    }));
    
    // Needs refactoring: update (default) text to marker
    /*
    $(this).parent().find("label").each(function(){
        $(this).find('span.text-muted').removeClass('d-block').addClass('d-none');
            
        if(defaultMarkerStyle() == $(this).attr('id'))
            $(this).find('span.text-muted').addClass('d-block');
    });
    */
    
});



$('#markerSelector .ptm-btn').click(function ( event ) {

    $(this).parent().find("label").each(function(){        
        $(this).removeClass('active');        
    });

    defaultSnowMapStyle = $(this).attr('id');
    defaultMarkerStyleUrl = getMarker(defaultSnowMapStyle);
    formMarkerStyle.val(defaultSnowMapStyle);
    markerOnMap.setIcon(L.icon({ 
        iconUrl: defaultMarkerStyleUrl,
        iconSize: [24, 32],
        iconAnchor: [12, 32], 
        className: 'marker'
    }));
        
});


$("#formatSelector .btn").click(function ( event ) {  
  currentFormat = event.target.id;
  activeLayer = getStyle(currentStyle);
  let posterSize = (currentFormat == '30x40') ? "small" : '';
  $('.poster').attr('class','card poster '+posterSize+' '+currentStyle);
  $('#addToCart').attr('action', cartUrl+'?attribute_pa_dimensions='+currentFormat+'&attribute_design='+currentStyle);
});

document.getElementById("addToCart").addEventListener("click", function(event){
    event.preventDefault();

    $('.ptm-cta').attr('disabled', true);
    $('.smooth-transition').css('opacity','0.5');
    $('body').prepend('<div class="generate align-items-center justify-content-center d-flex position-fixed w-100"><progress class="circular-activity" /></div>');
    let check = false;

    leafletImage(map, function(err, canvas) {
        let dataURL = canvas.toDataURL('image/png');
        // console.log(dataURL);
        dataURL = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        // ptm_thumb.val(dataURL);
        $.post("http://dev.placethemoment.com/build/save.php", { savedMap: dataURL }, 
        function(data) {
            ptm_thumb.val(data);
        })
        .done(function(){
            $('#addToCart').submit();
        });
        
    });

});