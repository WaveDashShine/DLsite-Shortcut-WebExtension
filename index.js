var self = require("sdk/self");

/***
// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
function dummy(text, callback) {
  callback(text);
}

exports.dummy = dummy;
***/

/*** 
WARNING:
sdk self is initialized above the dummy code
add it back when the app breaks when the dummy is removed
***/

var selection = require("sdk/selection");
var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var cm = require("sdk/context-menu");

// regex for the product codes in DLsite
var regex = /R(J|E)\d{6}/g;
// TODO: implement default DLsite in options
var dlsite = "http://www.dlsite.com/home/work/=/product_id/";

// console logs for superficially checking that index.js is running
//console.log("index.js is running...");

/*** CONTEXT MENU OPEN IN DLSITE
1) context menu item to open product codes in DLsite
*) currently only compatible with RE and RJ codes
***/
// dlMenu.parentMenu.items[0].destroy(); if you need to destroy the cm.Item
var dlMenu = cm.Item({
  label: "Open in DLsite",
  image: self.data.url("./DL-16.png"),
  contentScript: 'self.on("click", function () {' +
                 '  var text = window.getSelection().toString();' +
                 '  self.postMessage(text);' +
                 '});',
  onMessage: function (selectionText) {
    //console.log("Selected text is: " + selectionText);
    openDLsite(selectionText);
  },
  context: [cm.PredicateContext(isProductCode), cm.SelectionContext()]
});

/*** CONTEXT MENU LANGUAGE TOGGLE
1) context menu item to toggle between ENG and JP
*) currently only compatible with RE and RJ codes
***/
var langMenu = cm.Item({
  label: "Toggle language",
  image: self.data.url("./DL-16.png"),
  contentScript: 'self.on("click", function () {' +
                 '  self.postMessage();' +
                 '});',
  onMessage: function () {
    //console.log("Selected text is: " + selectionText);
    languageToggle();
  },
  context: cm.URLContext("*.dlsite.com")
});

/*** PREDICATE FUNCTION FOR CONTEXT MENU
1) Returns TRUE if selected text contains dlsite product code
***/
function isProductCode(data){
  if (data.selectionText === null) {
    return false;
  }
  var match = data.selectionText.match(regex);
  if (match) {
    return true;
  }
}

/*** DLSITE BUTTON 
***/
var button = buttons.ActionButton({
  id: "dlsite-link",
  label: "DLsite JP <-> ENG",
  icon: {
    "16": "./DL-16.png",
    "32": "./DL-32.png",
    "64": "./DL-64.png"
  },
  onClick: function(state){
    openHome();
    languageToggle();
  }
});

/*** OPEN DLSITE HOMEPAGE
1) opens the DLsite homepage if not already on the site
***/
function openHome() {
  var active = tabs.activeTab.url;

  if (!active.includes("dlsite.com")){
    tabs.open("http://www.dlsite.com/");
  }
}

/*** BUTTON FUNCTION LANGUAGE TOGGLE and OPEN DLsite
1) loads DLsite.com in new tab if active tab does not have DLsite open
2) if product code is detected in URL, toggles the region language

RE    : RJ
eng   : home
ecchi-eng : maniax

*) TODO: refactor and separate functions
***/
function languageToggle() {
  // variables for the product codes and various language conversion
  // case 1:
  var rj = "/product_id/RJ";
  var re = "/product_id/RE";
  // case 2:
  var eng = "/eng";
  var home = "/home";
  // case 3:
  var ecchi = "/ecchi-eng";
  var maniax = "/maniax";

  var active = tabs.activeTab.url;

  if (active.includes("dlsite.com")){

  	if (active.includes(rj)){
  		tabs.activeTab.url = active.replace(rj,re);
  	} else if (active.includes(re)){
  		tabs.activeTab.url = active.replace(re,rj); 
  	} else if (active.includes(eng)){
      tabs.activeTab.url = active.replace(eng,home);
    } else if (active.includes(home)){
      tabs.activeTab.url = active.replace(home,eng);
    } else if (active.includes(ecchi)){
      tabs.activeTab.url = active.replace(ecchi,maniax);
    } else if (active.includes(maniax)){
      tabs.activeTab.url = active.replace(maniax,ecchi);
    }

  }
}

/*** SEARCH SELECTION FOR DLSITE PRODUCT CODE AND OPENS CORRESPONDING PAGE
TODO: refactor code to separate functions
1) opens sanitized text DLsite
*) match() returns an array object if match is found, null otherwise
***/
function openDLsite(text){
  //console.log("text is: " + text);
  var matchArray = text.toString().match(regex);
  //console.log("matched regex is: " + matchArray);
  if(matchArray) {
    //console.log("length of Array is: " + matchArray.length);
    for (var i = 0; i < matchArray.length; i++) {
      //console.log("Number " + i + " in the array is: " + matchArray[i]);
      tabs.open(dlsite+matchArray[i]);
    }
  }
}