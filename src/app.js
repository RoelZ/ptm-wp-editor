import 'bootstrap';
import $ from 'jquery';
require('webpack-jquery-ui/resizable');
import L from 'leaflet';
import mapboxgl from 'mapbox-gl';
import mapboxGL from 'mapbox-gl-leaflet';
import leafletSearch from 'leaflet-search';
import { GeoSearchControl, GoogleProvider } from 'leaflet-geosearch';

//import jsPDF from 'jspdf';
//import domtoimage from 'dom-to-image';
import './assets/scss/app.scss';
//import Base64 from './assets/js/base64.js';
//import svgCanvas from './assets/js/svgcanvas.js';


// import mapboxBlackStyle from './assets/styles/style.json';
// import mapboxWhiteStyle from './assets/styles/mapbox-white/style.json';
// import mapputnikStyle from './assets/styles/maputnik.json';

// var maptilerBlack = 'https://maps.tilehosting.com/c/44c99296-dff6-484b-9ce9-f9f9ab795632/styles/PTM-Blacklines/style.json?key=T8rAFKMk9t6uFsXlx0KS';
// var maptilerWhite = 'https://maps.tilehosting.com/c/44c99296-dff6-484b-9ce9-f9f9ab795632/styles/PTM-Whitelines/style.json?key=T8rAFKMk9t6uFsXlx0KS';
var maptilerBlack = 'https://maps.tilehosting.com/c/44c99296-dff6-484b-9ce9-f9f9ab795632/styles/PTM-Blacklines/{z}/{x}/{y}.png?key=T8rAFKMk9t6uFsXlx0KS';
var maptilerVectorBlack = 'https://maps.tilehosting.com/c/44c99296-dff6-484b-9ce9-f9f9ab795632/styles/PTM-Blacklines/style.json?key=T8rAFKMk9t6uFsXlx0KS';
var maptilerWhite = 'https://maps.tilehosting.com/c/44c99296-dff6-484b-9ce9-f9f9ab795632/styles/PTM-Whitelines/{z}/{x}/{y}.png?key=T8rAFKMk9t6uFsXlx0KS';
var maptilerVectorWhite = 'https://maps.tilehosting.com/c/44c99296-dff6-484b-9ce9-f9f9ab795632/styles/PTM-Whitelines/style.json?key=T8rAFKMk9t6uFsXlx0KS';

// var MapboxGeocoder = require('@mapbox/mapbox-gl-geocoder');
//var urlExists = require('url-exists');
const provider = new GoogleProvider({
    params: {
        key: 'AIzaSyCE1svBjPmf71zWMhdr5r0Xu9EDN2sxwHk'
    }
});
const searchControl = new GeoSearchControl({
  provider: provider,
  autoCompleteDelay: 250,
  retainZoomLevel: false,
  animateZoom: false,

});

let varId;  // WooCommerce ID
var cartUrl = 'https://www.placethemoment.com/dev/collectie/city-map-poster/?attribute_pa_dimensions=50x70&attribute_design=';
//var styleUrl = 'https://maps.tilehosting.com/c/44c99296-dff6-484b-9ce9-f9f9ab795632/styles/PTM-Blacklines/style.json?key=T8rAFKMk9t6uFsXlx0KS';
//var styleUrl = 'http://localhost:8080/styles/ptm-white-lines-final/style.json';
//var styleUrl = 'http://placethemoment.com/dev/ptm-editor/assets/styles/style.json';
//var styleUrl = "mapbox://styles/roelz/cjbp002fe6an22smmpzfotnk4";
//var styleUrl = maptilerBlack;

let currentStyle = "moon";
let currentMarkerStyle = "yellow";
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

let ptm_moment = $('#addToCart input[name="ptm_moment"]');
let ptm_subline = $('#addToCart input[name="ptm_subline"]');
let ptm_tagline = $('#addToCart input[name="ptm_tagline"]');

ptm_subline.val(defaultStartView.name);
ptm_tagline.val('The Netherlands');


/* INITIAL BREAKPOINTS CHECK */
$(document).ready(function() {
    checkSize();    
    $(window).resize(checkSize);   
    
    // Needs realtime isMobile check!
    if(isMobile){
        $('main').on('click', function(){
            $('.collapse').collapse('hide');
        });
        $('#posterText').on('click', function(){
            $('#collapseTwo').collapse('toggle');
        });
        $('#collapseTwo').on('show.bs.collapse', function(){
            $('#posterWrapper').css('transform', 'translateY(-70%)');

        });        
        $('#collapseTwo').on('hide.bs.collapse', function(){
            $('#posterWrapper').css('transform','');
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


        
        let addToCart = $('#addToCart');
        addToCart.appendTo('#btnGroup');
        // addToCart.children('')

        $('nav.navbar').removeClass('d-flex').addClass('d-none');
        
    }
});

function checkSize(){
    if ($(".sidebar-sticky").css('position') != 'sticky'){
        isMobile = true;

        //$('#collapseOne').addClass('show'); 
        // $('#accordion .btn-group button[data-target="#collapseOne"]').trigger("click");
    } else {
        $('#mapbox').find('.geosearch').appendTo($('#geocoder'));
    }

    if(!$('#collapseOne').hasClass('show')){
        $('#collapseOne').addClass('show');
    }
}


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

/*
function checkUrlExists(host,cb) {
    http.request({method:'HEAD',host,port:80,path: '/'}, (r) => {
        cb(null, r.statusCode > 200 && r.statusCode < 400 );
    }).on('error', cb).end();
}
*/

// var canvas = map.getCanvasContainer();
let debugPanel = document.getElementById('debugger');

let map = L.map('mapbox', { zoomControl: false});

// console.log(defaultStartView);

map.on('load', function(){
    formCoordinates.val(JSON.stringify(map.getBounds()));
    formZoom.val(13);
    formMarkerStyle.val(currentMarkerStyle);
    formMarkerCoordinates.val(L.latLng([defaultStartView.lat,defaultStartView.lng]));
}).setView(L.latLng([defaultStartView.lat,defaultStartView.lng]),13);

let mapStyle = L.mapboxGL({
    style: maptilerVectorWhite,
    accessToken: 'no-token'
}).addTo(map);

let markerOnMap = new L.marker(map.getCenter(), {
    icon: L.icon({iconUrl: defaultMarkerStyleUrl, className: 'marker'}),
    draggable: true,
}).addTo(map);




const geocoderInput = $('#geocoder');

const GooglePlacesSearchBox = L.Control.extend({
onAdd: function() {
    var element = document.createElement("input");
    element.id = "searchBox";
    return element;
}
});
L.control.zoom({position:'topright'}).addTo(map);

(new GooglePlacesSearchBox).addTo(map);
  
var input = document.getElementById("searchBox");
$(input).addClass('form-control py-2 border-right-0 border').attr('placeholder','Enter your place');

var searchBox = new google.maps.places.SearchBox(input);

searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
  
    if (places.length == 0) {
      return;
    }

    let latlng,latlngbounds;
    let locationCity, locationCountry, locationName;
    let subline,tagline;
    
    places.forEach(function(place) {
        console.log(place.place_id);        
        formPlaceId.val(place.place_id);

        $.getJSON('https://www.placethemoment.com/api/v1/json.php?placeid='+place.place_id, function(data){            
        console.log(data.result);

        // Adding address fields
        data.result.address_components.forEach(address => {
            address.types.forEach(type => {
                if(type == 'country')
                    locationCountry = address.long_name;

                if(locationCity == '' && type == 'administrative_area_level_2'){
                    locationCity = address.short_name;
                }else if(type == 'locality'){
                    locationCity = address.long_name;
                }
            });
        });

        locationName = data.result.name;

        if(locationCity == locationName)
            tagline = locationCountry;
        else if(locationCountry == locationName)
            tagline = locationCity;
        else
            tagline = locationCity ? locationCity+" - "+locationCountry : locationCountry;

        $('#sublineInput').val(locationName);
        $('#addToCart input[name="ptm_subline"]').val(locationName);
        $('#taglineInput').val(tagline);
        $('#addToCart input[name="ptm_tagline"]').val(tagline);

        $("#posterText .card-text:first").html(locationName);
        $("#posterText .card-text:last").html(tagline);

        });

        latlng = L.latLng(
                place.geometry.location.lat(),
                place.geometry.location.lng()
        );

        let northeast = L.latLng(place.geometry.viewport.f.b,place.geometry.viewport.b.b);
        let southwest = L.latLng(place.geometry.viewport.f.f,place.geometry.viewport.b.f);

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
          icon: L.icon({iconUrl: markerStyle, className: 'marker'}),
          draggable: true,
        })
        .addTo(map);
        
        markerOnMap.setIcon(L.icon({ iconUrl: markerStyle, className: 'marker' }));
                
        formMarkerCoordinates.val(markerOnMap.getLatLng());
        
        markerOnMap.on('dragend', function(){
            formMarkerCoordinates.val(markerOnMap.getLatLng());
        });
       
    }); 

    map.flyToBounds(latlngbounds, {duration: 3, maxZoom: 15});

    // Adding coordinate bounds
    // console.log(latlngbounds);
    formCoordinates.val(JSON.stringify(latlngbounds));


  });

input.focus();

$('.mapwindow').append($('.leaflet-control-container'));
geocoderInput.append(input);
geocoderInput.append('<span class="input-group-append"><button class="btn btn-outline-light border-left-0 border" type="button"><i class="fa fa-search"></i></button></span>');


map.on('zoomend', function(){
    formZoom.val(map.getZoom());
    formCoordinates.val(JSON.stringify(map.getBounds()));
});
    

map.on('dragend', function(){
    formCoordinates.val(JSON.stringify(map.getBounds()));
});




// Adding source layer after map is loaded
// map.on('load', function(){   

//     debugPanel.style.display = 'none';
//     debugPanel.innerHTML = 'Longitude: ' + map.getBounds();
//     var mapCanvas = map.getCanvas();

//     if(!isMobile){
//     //BLOB
    
//     //function({
//         /*
//     mapCanvas.toBlob(function(blob){
//         var newImg = document.createElement('img'),
//         url = URL.createObjectURL(blob);

//         newImg.onload = function(){
//             URL.revokeObjectURL(url);
//         };

//         newImg.src = url;
//         $('#canvasImage').parent('div').append(newImg);
//         //document.body.appendChild(newImg);
//     });
//     */

//     // PNG
        
//    imgData = mapCanvas.toDataURL('image/png',1);
//    $('#canvasImage').attr("src",imgData);  

//    /*
//    domtoimage.toBlob(mapCanvas)
//    .then(function(blob){
//     window.saveAs(blob, 'ptm-map.png');
//    });
//     */

//     // SVG
//     //mapCanvas.toBlob(function(blob){
// /*
//     var svgString = new XMLSerializer().serializeToString(mapCanvas);
//     var svg = new Blob([svgString], { type: "image/svg+xml;charset=utf-8"});
//     var svgurl = URL.createObjectURL(svg);
    
//     var newImg = document.createElement('img');
//     newImg.onload = function(){
//         URL.revokeObjectURL(svgurl);
//     };

//     newImg.src = svgurl;
//     $('#canvasImage').parent('div').append(newImg);
// */
//     //});
//     //var svg = $('#mapbox .mapbox-canvas').html();
//     //console.log(imgData);  
    
//     //var ctx = new SVGCanvas("mapboxgl-canvas");
//     //$('#canvasImage').parent().html(ctx.toDataURL("image/svg+xml"));
//     //var xml = '<?xml version="1.0" encoding="utf-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 20010904//EN" "http://www.w3.org/TR/2001/REC-SVG-20010904/DTD/svg10.dtd"><svg xmlns="http://www.w3.org/2000/svg" width="' + 600 + '" height="' + 600 + '" xmlns:xlink="http://www.w3.org/1999/xlink"><source><![CDATA[' + imgData + ']]></source>' + svg + '</svg>';
//     //var b64 = Base64.encode(svg);
    
//     //$('#canvasImage').append("<a href-lang='image/svg+xml' href='data:image/svg+xml;base64,\n"+b64+"'>download</a>");
    
//     //PDF
//     /*
//     var doc = new jsPDF();

//     if(currentStyle == "granite"){
//         doc.setFillColor("44","34","22","77");  //44 34 22 77
//     } else if(currentStyle == "mint"){
//         doc.setFillColor("54","8","47","14");  //54 8 47 14
//     } else {
//         doc.setFillColor(44,34,22,77);  //44 34 22 77
//     }

//     doc.roundedRect(5,7,200,200,100,100);

//     doc.setFontSize("56");
//     //doc.setFont("Open Sans");
//     doc.setTextColor("255");
//     if($('#momentInput').val())
//         var docText = $('#momentInput').val();
//     else
//         var docText = "Place the moment";
//     doc.text(docText,"50","220");

//     doc.addImage(imgData, 'png', 5, 7, 200, 200, '', 'slow');
//     doc.save('ptm-print.pdf');
// )}
//     */
// }
    
// });  // end Map onLoad


var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

var token = function() {
    return rand() + rand() // extra rand() to make it longer
};

// Deze functie haalt de coordinaten van de GET header op
function findGetParameter(parameterName) {
    var result = null,
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

// Functie om een correcte Mapbox LngLat output te geven op basis van coordinaten (b.v. 51.31,5.1)
function getCoordinates(value){
    var cor = new Array();
    cor= value.split(',');
    //return mapboxgl.LngLat(cor[0],cor[1]);
    return cor;
}


function defaultView(){
    let places = {
        0 : {
            name: 'Eindhoven',
            lat : '51.441767',
            lng : '5.470247',
            zoom : '12.1'
        },
        1 : {
            name: 'Utrecht',
            lat : '52.090737',
            lng : '5.12142',
            zoom : '12.1'
        },
        2 : {
            name: 'Amsterdam',
            lat : '52.370216',
            lng : '4.895168',
            zoom : '12.1'
        },
    }

    let randomItem = Math.floor(Math.random() * Object.keys(places).length);  
        
    return places[randomItem];
}

function getStyle(name){

    if(name == 'mapboxStyle'){
        varId = 1207
        return mapboxStyle;
        //return 'mapbox://styles/mapbox/streets-v9';
    }
    else if(name == 'maputnikStyle'){
        varId = 1207
        return maputnikStyle;
    }
    else if(name == 'snow'){
        formVariationId.val(1207);
        return maptilerVectorBlack; //'http://localhost:8080/styles/ptm-black-lines-final/style.json'; 
    }
    else if(name == 'moon'){
        formVariationId.val(1208);
        return maptilerVectorWhite; //'http://localhost:8080/styles/ptm-white-lines-final/style.json'; 
    }
    else if(name == 'granite'){
        formVariationId.val(1209);
        return maptilerVectorWhite; //'http://localhost:8080/styles/ptm-white-lines-final/style.json'; 
    }
    else if(name == 'mint'){
        formVariationId.val(1210);
        return maptilerVectorWhite; //'http://localhost:8080/styles/ptm-white-lines-final/style.json'; 
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
            return 'https://www.placethemoment.com/dev/editor/images/ptm-marker-snow.svg';
        else if(style == "granite")
            return 'https://www.placethemoment.com/dev/editor/images/ptm-marker-granite.svg';
        else if(style == "yellow")
            return 'https://www.placethemoment.com/dev/editor/images/ptm-marker-yellow.svg';
        else if(style == "mint")
            return 'https://www.placethemoment.com/dev/editor/images/ptm-marker-mint.svg';
    } else {
        if(style == "snow")
            return 'https://www.placethemoment.com/dev/editor/images/ptm-marker-mint.svg';
        else if(style == "granite")
            return 'https://www.placethemoment.com/dev/editor/images/ptm-marker-yellow.svg';
        else if(style == "moon")
            return 'https://www.placethemoment.com/dev/editor/images/ptm-marker-snow.svg';
        else if(style == "mint")
            return 'https://www.placethemoment.com/dev/editor/images/ptm-marker-granite.svg';        
    }
}

$(document).keyup(function(e){

    if(e.keyCode == 49){       
        map.setStyle(maptilerWhite);
    } else if(e.keyCode == 50){
        map.setStyle(maptilerBlack);
    }
//});
    else if(e.keyCode == 27){
         /*
         var mapCanvas = map.getCanvas();
       
        domtoimage.toBlob(mapCanvas)
        .then(function(blob){
            window.saveAs(blob, 'ptm-map.png');
        });
        */
/*
        mapCanvas.toBlob(function(blob){
            var newImg = document.createElement('img'),
            url = URL.createObjectURL(blob);

            newImg.onload = function(){
                URL.revokeObjectURL(url);
            };

            newImg.src = url;
            $('#canvasImage').parent('div').append(newImg);
            //document.body.appendChild(newImg);
        });
*/
//if(findGetParameter("debug")){
    // IMG
    
    $("#toPNG").click(function(e){
        var mapCanvas = map.getCanvas();
        imgData = mapCanvas.toDataURL('image/png',1);
        $('#canvasImage').attr("src",imgData); 

        //var mapCanvas = map.getCanvas();
        //on.mapCanvas.getContext('webgl').finish()
        //imgData = mapCanvas.toDataURL('image/png',1);
        
        //console.log('putting data to img...')
        //var imgData = map.getCanvas().toDataURL('image/jpeg');
        //$("#canvasImage").parent('div').removeClass('d-none');
        //$('#canvasImage').attr("src",imgData); 
        //console.log(imgData);
    });
    // PDF
    $("#toPDF").parent('nav').removeClass('d-none');
    $("#canvasImage").parent('div').removeClass('d-none');
    $("#toPDF").click(function(e){
        var imgData = map.getCanvas().toDataURL();

        var doc = new jsPDF();

        /*
        if(currentStyle == "granite"){
            doc.setFillColor("44","34","22","77");  //44 34 22 77
        } else if(currentStyle == "mint"){
            doc.setFillColor("54","8","47","14");  //54 8 47 14
        }
        doc.setFontSize("56");
        //doc.setFont("Open Sans");
        //doc.setTextColor("255");
        if($('#momentInput').val())
            var docText = $('#momentInput').val();
        else
            var docText = "Place the moment";
        doc.text(docText,"50","555");
        */
        doc.addImage(imgData, 'PNG', 52, 73, 400, 400);
        doc.save('ptm-print.pdf');
    });

};

});

// Tabs: Moment
var activeTab;

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


    $('.poster').attr('class','card poster '+event.target.id);

    $('#addToCart').attr('action', cartUrl+event.target.id);

    mapStyle._glMap.setStyle(getStyle(currentStyle));
    
    let marker = $('#markerSelector').find("label.active").attr('id');
    markerOnMap.setIcon(L.icon({ iconUrl: getMarker(marker), className: 'marker' }));
    
    // Needs refactoring: update (default) text to marker
    /*
    $(this).parent().find("label").each(function(){
        $(this).find('span.text-muted').removeClass('d-block').addClass('d-none');
            
        if(defaultMarkerStyle() == $(this).attr('id'))
            $(this).find('span.text-muted').addClass('d-block');
    });
    */
    
});



// Marker
$('#markerSelector .ptm-btn').click(function ( event ) {

    $(this).parent().find("label").each(function(){        
        $(this).removeClass('active');        
    });

    let clickedMarker = $(this).attr('id');
    formMarkerStyle.val(clickedMarker);
    markerOnMap.setIcon(L.icon({ iconUrl: getMarker(clickedMarker), className: 'marker'}));
        
});
