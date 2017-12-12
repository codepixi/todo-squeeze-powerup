/* global TrelloPowerUp */

var Promise = TrelloPowerUp.Promise;

var GRAY_ICON = 'https://cdn.hyperdev.com/us-east-1%3A3d31b21c-01a0-4da2-8827-4bc6e88b7618%2Ficon-gray.svg';
  
var COLOR_FOR_EMERGENCY = {'ice':'yellow','vanilla':'orange','smoothie':'lime','medium':'sky','spicy':'red'};

var prepareEmergencyBadge = function(trello)
{
  var emergencyBadge = {
    dynamic: function(){
       //return trello.card('all').get('name').then(function(name)
      return trello.get('card', 'shared', 'emergency').then(function(emergencyLevel)
      {
        return {
        title: 'Emergency', 
        text: emergencyLevel,
        icon: 'https://cdn.hyperdev.com/us-east-1%3Acba180f4-ee65-4dfc-8dd5-f143280d3c10%2Fdiamond.svg', 
        color: COLOR_FOR_EMERGENCY[emergencyLevel],
        refresh: 30 
        };
      });
    }
  };

  return emergencyBadge;
}


var getBadges = function(trello){
  
  return trello.card('name').get('name').then(function(cardName)
  {
    return [prepareEmergencyBadge(trello)];
  });
};

var authorize = function(trello, options){
    return trello.get('member', 'private', 'token')
    .then(function(token){
      if(token){
        return { authorized: true };
      }
      return { authorized: false };
    });
  };

function get(url) {
  return fetch(url).then(response => {
    if (response.ok) {
      const contentType = response.headers.get('Content-Type') || '';

      if (contentType.includes('application/json')) {
        return response.json().catch(error => {
          return Promise.reject(new Error('Invalid JSON: ' + error.message));
        });
      }

      if (contentType.includes('text/html')) {
        return response.text().then(html => {
          return {
            page_type: 'generic',
            html: html
          };
        }).catch(error => {
          return Promise.reject(new Error('HTML error: ' + error.message));
        })
      }

      return Promise.reject(new Error('Invalid content type: ' + contentType));
    }

    if (response.status == 404) {
      return Promise.reject(new Error('Page not found: ' + url));
    }

    return Promise.reject(new Error('HTTP error: ' + response.status));
  }).catch(error => {
    return Promise.reject(new Error(error.message));
  });
}


function constructEmergencyBoard(trello)
{
  console.log("constructEmergencyBoard()");
  //https://github.com/rooreynolds/trello-show/issues/1
  var readAllCards = function()
  {   
    return trello.cards("all");
    //var url = 'https://api.trello.com/1/boards/LNRU7QUR/cards?key=&token=';
    //get(url);
  };

  readAllCards().then(function(cartes)
  {
    var listeCartes = [];

    for(var carteId in cartes)
    {
      var carte = cartes[carteId];
      console.log(carte['name']);
      listeCartes[carte['id']] = carte;
    }
    return listeCartes;
  });
}

var writeEmergencyChoice = function(trello, choice){
  if (trello.memberCanWriteToModel('card')){
    //return trello.attach({ url:nameForItem, name: nameForItem }).then(function(){ return trello.closePopup();});
    //return trello.card('all').then(function (card) { console.log(JSON.stringify(card, null, 2));});
    return trello.card('all').then(function (card) 
    { 
      console.log(choice);console.log(card.name);
      //var emergencyBadge = prepareEmergencyBadge(choice);
      //card.badges.length
      //card.badges["emergency"] = emergencyBadge;
      //console.log(JSON.stringify(card.badges));
      //console.log(JSON.stringify(card));
      //console.log("nombre de badges " + card.badges.length);
      trello.set('card', 'shared', 'emergency', choice);
      //console.log('Registered emergency level : ' + trello.get('card', 'shared', 'emergency'));
      trello.get('card', 'shared', 'emergency').then(function(emergencyLevel){console.log('Registered emergency level : ' + emergencyLevel)});
      trello.closePopup();
    });
  } 
  return trello.closePopup();
}

var actionEmergencyChoice = function(trello){
  var items = ['spicy', 'medium', 'smoothie', 'vanilla', 'ice'].map(function(item){
    var nameForItem = '🏞 ' + item.toUpperCase();
    return {
      text: nameForItem,
      callback: function(t){ return writeEmergencyChoice(t, item); }
    };
  });
  return trello.popup({
    title: 'Emergency assessment',
    items: items  });};

var optionCardButtonPopup = {
      icon: GRAY_ICON, 
      text: 'Emergency assessment',
      callback: actionEmergencyChoice
    };

var optionsCardButtons = [optionCardButtonPopup];

TrelloPowerUp.initialize({
//  'beginning': function(trello,options){},
  'board-buttons': function(trello, options){ constructEmergencyBoard(trello);return [];},
  'card-badges': function(trello, options){return getBadges(trello);},
  'card-detail-badges': function(trello, options) { return getBadges(trello);},
  'card-buttons': function(trello, options) { return optionsCardButtons; },
  'card-from-url': null,
  'format-url': null,
  'show-settings': null,  
  'authorization-status': authorize,
  'show-authorization': null
});

console.log('Loaded by: ' + document.referrer);
