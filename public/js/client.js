/* global TrelloPowerUp */


// https://trello.com/c/1jf9wbWC/2-ask-a-question

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
        //refresh: 30 
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

var emergencyCards = {};

function constructEmergencyBoard(trello)
{
  console.log("constructEmergencyBoard()");
  var readAllCards = function()
  {   
    return trello.cards("all");
  };
  
  return readAllCards()
  .then(function(cardList)
  {
    for(var cardId in cardList)
    {
      var card = cardList[cardId];
      //console.log("card : " + card.name + ' ' + card.emergency);
      
      // https://stackoverflow.com/questions/17244614/passing-variable-to-promise-in-a-loop
      (function(card){
        
      trello.get(card.id, 'shared', 'emergency').then(function(emergencyLevel)
      {
        if(emergencyLevel == 'spicy')
        {
          emergencyCards[card.id] = card;
          //console.log(card.name + ' emergency : ' + emergencyLevel);
        }
        else
        {
          delete emergencyCards[card.id];
        }
      });
        
      })(card);
    }
    
    var newCard = 
    {
      name: "test", 
      desc: "test",
      pos: "top", 
      idBoard :'EaCl5utu'
    };
    //window.Trello.post('/cards/', newCard, manageSuccess, manageError);
    
    return emergencyCards;
  });
}

var manageSuccess = function(successMsg) { /* your actions on success case */}
var manageError= function(errorMsg) { /* your actions on error case */}

var writeEmergencyChoice = function(trello, choice){
  console.log('writeEmergencyChoice()');
  //if (trello.memberCanWriteToModel('card')){
    //return trello.attach({ url:nameForItem, name: nameForItem }).then(function(){ return trello.closePopup();});
    //return trello.card('all').then(function (card) { console.log(JSON.stringify(card, null, 2));});
    return trello.card('all').then(function (card) 
    { 
      console.log(choice);console.log(card.name);
      //card.badges["emergency"] = emergencyBadge;
      trello.set('card', 'shared', 'emergency', choice);
      //console.log('Registered emergency level : ' + trello.get('card', 'shared', 'emergency'));
      trello.get('card', 'shared', 'emergency').then(function(emergencyLevel){console.log('Registered emergency level : ' + emergencyLevel)});
      
      constructEmergencyBoard(trello).then(function(emergencyList)
      {
        console.log('Iterating in emergency list');
        for(var emergencyId in emergencyList)
        {
          var emergency = emergencyList[emergencyId];
          console.log('Emergency : ~~~ ' + emergency.name + ' ~~~ '); 
        }

      });
      
      trello.closePopup();
    });
  //} 
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
