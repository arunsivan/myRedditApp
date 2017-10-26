'use strict';

/**
 * @author Arun Sivan
 * @name chatBotApp
 * @description
 * 
 * # chatBotApp
 *
 * Main module of the application.
 */
var chatApp = angular.module('chatBotApp', []);
chatApp.controller('ChatboatComponentController', function ($scope, HttpDataService, ShareDataService, $filter, $timeout) {
  // Initialize Chat Bot When Website Starts
  $scope.initializeChatBotConfig = function () {
    $scope.isPopUpEnabled = false;
    $scope.messageList = [];
    $scope.messageText = null;
    ShareDataService.setUserId();
    $scope.resetChatBotMessages(1);
    $scope.userSelectedCheckBoxMessage = [];
    $scope.realEstatesDataBuyer = [];
    $scope.showQuickAccessMenu = false;
    $scope.isPopUpMiniMized = false;
    $scope.isPopUp = false;

  }
  // Hide And Show Chat Bot Window
  $scope.toggleChatBoxWindow = function () {
    $scope.showChatBox = !$scope.showChatBox;
  }
  // Reset Chat Bot to Initial Stage
  $scope.resetChatBotMessages = function (requestType) {
    HttpDataService.getCoordinates(1, null, ShareDataService.getUserId()).then(function (data) {
      HttpDataService.getBotMessageResponse(data).then(function (response) {
        if (response.data.messageText && response.data.messageSource) {
          response.data.messageTime = new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
          response.data.messageText = response.data.messageText[0][0];
          //response.data.isClickedByUser = true;
          if (requestType == 1) {
            $scope.messageList.push(response.data);
            console.info($scope.messageList);
            ShareDataService.setPersonas($scope.messageList[0].plugin.data);
          }
        } else {
          //$scope.messageList = [];
        }
      });
    });
  }
  $scope.buttonSelection = function (buttonText, event, requestType) {
    if (event) {
      $(event.target).attr("disabled", true);
      $(event.target).addClass("clickedButtons");
    }
    if (requestType == 1) {
      $scope.isPopUpEnabled = false;
      $scope.isPopUp = false;
      $scope.resetChatBotMessages(2);
      $scope.userSelectedCheckBoxMessage = [];
      $scope.realEstatesDataBuyer = [];
      $scope.showQuickAccessMenu = false;
      $scope.isPopUpMiniMized = false;
      $scope.messageList = [];
      $scope.messageText = null;
    } else {
      $scope.isPopUp = false;
      $scope.showQuickAccessMenu = false;
    }
    $scope.messageList.push({ "messageText": buttonText, "messageSource": 'messageFromUser' });


    //console.info(JSON.stringify($scope.messageList));

    angular.forEach($scope.messageList, function (value, key) {
      if ($scope.messageList[key].messageSource == 'messageFromBot' && $scope.messageList[key].plugin) {
        delete $scope.messageList[key].plugin["data"];
      }
    });
    $scope.showMsgLoader = true;

    scrollToChatBoxBottom();
    HttpDataService.getCoordinates(3, buttonText, ShareDataService.getUserId()).then(function (data) {
      HttpDataService.getBotMessageResponse(data).then(function (response) {
        if (response.data) {
          if (response.data.plugin) {
            if (response.data.plugin.name == "autofill") {
              response.data.messageTime = new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
              response.data.messageText = response.data.messageText[0][0];
              response.data.messageSource = 'messageFromBot';
              $scope.messageList.push(response.data);
              //console.info($scope.messageList);
              scrollToChatBoxBottom();
            } else if (response.data.plugin.name == "popup") {
              $scope.isPopUp = true;
              response.data.messageTime = new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
              response.data.messageText = response.data.messageText[0][0];
              response.data.messageSource = 'messageFromBot';
              $scope.messageList.push(response.data);
              if (response.data.plugin.type == "manufacturers") {
                $scope.isPopUpEnabled = !$scope.isPopUpEnabled;
                $scope.popUpList = [];
                angular.forEach(response.data.plugin.data, function (value, key) {
                  $scope.popUpList.push({ "index": key, "name": value, "isDisabled": false, "isChecked": false });
                });
                $scope.popUpName = 'Manufacturers';
                ShareDataService.setPopUpList(response.data.plugin.data);
                //console.info($scope.popUpList);
              }
              else if (response.data.plugin.type == "category") {
                $scope.isPopUpEnabled = !$scope.isPopUpEnabled;
                $scope.popUpList = [];
                angular.forEach(response.data.plugin.data, function (value, key) {
                  $scope.popUpList.push({ "index": key, "name": value, "isDisabled": false, "isChecked": false });
                });
                $scope.popUpName = 'Categories';
                ShareDataService.setPopUpList(response.data.plugin.data);
                //console.info($scope.popUpList);
              }
            }
          } else {
            response.data.messageTime = new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
            var textString='';
            angular.forEach(response.data.messageText, function (value,key) {
              for(var x in value){
                textString=textString+response.data.messageText[key][x];
              }
            });
            response.data.messageText=textString;
            response.data.messageSource = 'messageFromBot';
            
            $scope.messageList.push(response.data);
           
            
          }
          if (response.data.ResultBuyer) {

            $scope.realEstatesDataBuyer = response.data.ResultBuyer;
          }

        }
        $scope.showMsgLoader = false;
      });
    });
  }
  $scope.selectItems = function (item) {

    if ($scope.userSelectedCheckBoxMessage.indexOf(item) == -1) {
      $scope.userSelectedCheckBoxMessage.push(item)
    } else {
      $scope.userSelectedCheckBoxMessage.splice($scope.userSelectedCheckBoxMessage.indexOf(item.name), 1);
    }
    if (item == "No preference") {
      angular.forEach($scope.popUpList, function (value, key) {
        if (value.name != "No preference") {
          $scope.popUpList[key].isDisabled = !$scope.popUpList[key].isDisabled;
        } else {
          $scope.popUpList[key].isDisabled = false;
        }
      });
    }
    else if (item == "No selection") {
      angular.forEach($scope.popUpList, function (value, key) {
        if (value.name != "No selection") {
          $scope.popUpList[key].isDisabled = !$scope.popUpList[key].isDisabled;
        } else {
          $scope.popUpList[key].isDisabled = false;
        }
      });
    } else {
      angular.forEach($scope.popUpList, function (value, key) {
        if ($scope.popUpList[key].name == "No preference") {
          if ($(":checkbox:checked").not(document.getElementById("noPreferenceInput")).length) {
            $scope.popUpList[key].isDisabled = true;
          } else {
            $scope.popUpList[key].isDisabled = false;
          }
        } else if ($scope.popUpList[key].name == "No selection") {
          if ($(":checkbox:checked").not(document.getElementById("noPreferenceInput")).length) {
            $scope.popUpList[key].isDisabled = true;
          } else {
            $scope.popUpList[key].isDisabled = false;
          }
        } else {
          $scope.popUpList[key].isDisabled = false;
        }
      });
    }

  }
  $scope.checkPopUpListReset = function () {
    $scope.userSelectedCheckBoxMessage = [];
    angular.forEach($scope.popUpList, function (value, key) {
      $scope.popUpList[key].isDisabled = false;
      $scope.popUpList[key].isChecked = false;
    });

  }
  $scope.chatDone = function () {

    var x = false;
    var postMessageText = '';
    angular.forEach($scope.userSelectedCheckBoxMessage, function (value, key) {
      if (postMessageText == '') {
        postMessageText = postMessageText + value;
      } else {
        postMessageText = postMessageText + ' , ' + value;
      }
    });
    $scope.buttonSelection(postMessageText, null, 3);
    $scope.userSelectedCheckBoxMessage = [];
    $scope.isPopUpEnabled = !$scope.isPopUpEnabled;

  }
  $scope.sendMessageToBot = function (messageText) {
    if (messageText != null && messageText != undefined && messageText != "") {
      if ($scope.isPopUp) {
        var isMessageTextInPopUpList = false;
        if (ShareDataService.getPopUpList().map(v => v.toLowerCase()).indexOf(messageText.toLowerCase()) != -1) {
          $scope.isPopUpEnabled = !$scope.isPopUpEnabled;
          $scope.buttonSelection(messageText, null, 3);
          $scope.messageText = '';
          $scope.isPopUp = false;
        } else {
          $scope.isPopUpEnabled = !$scope.isPopUpEnabled;
          var msMap = {
            messageTime: new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3"),
            messageText: messageText,
            messageSource: 'messageFromUser'
          }
          var msMap1 = {
            messageTime: new Date().toLocaleTimeString().replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3"),
            messageText: "Not Found.",
            messageSource: 'messageFromBot'
          }
          $scope.messageText = '';
          $scope.$evalAsync(function () {
            $scope.messageList.push(msMap);
            $scope.messageList.push(msMap1);
            $scope.messageList.push($scope.messageList[$scope.messageList.length - 3]);
            console.info($scope.messageList);
            scrollToChatBoxBottom();
            $timeout(function () {
              $scope.isPopUpEnabled = !$scope.isPopUpEnabled;
            }, 3000);


          });

          $scope.userSelectedCheckBoxMessage = [];
        }

      } else {
        $scope.buttonSelection(messageText, null, 3);
        $scope.messageText = '';
      }
    }

  }
  $scope.resetChat = function () {
    $scope.initializeChatBotConfig();
    //$scope.isPopUpEnabled=!$scope.isPopUpEnabled;
  }
  $scope.floatButtonClick = function () {
    $scope.showQuickAccessMenu = !$scope.showQuickAccessMenu;
    $scope.personasListOfMap = ShareDataService.getPersonas();
    console.info($scope.personasListOfMap);
  }
  $scope.minimizeButtn = function () {
    // $('.popupclose').addClass('popUpListMinimize');
    $scope.isPopUpMiniMized = !$scope.isPopUpMiniMized;
    $scope.isPopUpEnabled = !$scope.isPopUpEnabled;
  }
  $scope.userFilteringPopUpList = function (messageText) {

    var autofillArray = $filter('popUpNameFilter')($scope.popUpList, messageText);
    console.info($scope.md);
  }
  function scrollToChatBoxBottom() {
    $(".chatWrapper").animate({ scrollTop: $(".chatScroller").height() }, 500);
    $(".chatScroller").scrollTop()
    document.querySelector('#messageText').focus();
  }

}); // end of controller
chatApp.service('HttpDataService', function ($http) {
  var HttpDataService = {

    getBotMessageResponse: function (postMap) {
      //http://backend-dev-gunbro-com-215761916.us-east-1.elb.amazonaws.com/RE_bot/Response
      //https://staging-api.appcohesion.io/bot
      return $http.post('https://staging-api.appcohesion.io/bot', postMap).then(function (data) {
        return data;
      });
    },
    getCoordinates: function (requestType, messageText, userId) {
      return $http.get('http://ip-api.com/json').then(function (coordinates) {
        var myCoordinates = {};
        myCoordinates.state = coordinates.regionName;
        myCoordinates.city = coordinates.city;
        myCoordinates.userId = userId;

        var data = {
          "user_id": myCoordinates.userId,
          "state": myCoordinates.state,
          "city": myCoordinates.city
        };
        if (requestType == 1) {
          data.messageSource = "userInitiatedReset";
          data.messageText = "";

        } else if (requestType == 2) {
          data.messageSource = "sellerFlag";
        } else if (requestType == 3) {
          data.messageText = messageText;
          data.messageSource = "messageFromUser";
        }
        else if (requestType == 4) {
          data.messageSource = "messageFromBot";
        }
        return data;
      });
    }
  };
  return HttpDataService;
});

chatApp.service('ShareDataService', function ($http) {
  var userId;
  var personasList;
  var popUpList;
  var ShareDataService = {
    setUserId: function () {

      function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
          s4() + '-' + s4() + s4() + s4();
      }
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      userId = guid();
    }, getUserId: function () {
      return userId;
    },
    setPersonas: function (newPersonasList) {

      personasList = newPersonasList.slice(0);
    },
    getPersonas: function () {
      return personasList;
    },
    setPopUpList: function (newPopUpList) {
      console.log(popUpList);
      popUpList = newPopUpList.slice(0);
    },
    getPopUpList: function () {
      console.log(popUpList);
      return popUpList;
    }

  }
  return ShareDataService;
});
chatApp.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter);
        });

        event.preventDefault();
      }
    });
  };
});
chatApp.filter('popUpNameFilter', function () {
  return function (items, input) {
    // console.log(items);
    // console.log(input);
    var filtered = [];

    if (input === undefined || input === '') {
      return items;
    }

    angular.forEach(items, function (item) {

      if (item.name.toLowerCase().indexOf(input.toLowerCase()) === 0) {
        filtered.push(item);
      }
    });
    //console.log(filtered);

    return filtered;
  };
});
chatApp.directive('chatBotComponent', function () {
  return {
    template: `<div class="row">
    <div class="col-md-3 col-xs-12 chatBox" ng-show="showChatBox">
        <div class="row">
            <div class="col-md-12 chatTitle">
                <div class="row">
                    <div class="col-md-8 chatUser">Ask Joe</div>
                    <div class="col-md-2 resetChatButton" ng-click="resetChat()" title="Reset"></div>
                    <div class="col-md-2 chatClose" title="Minimize" ng-class="showChatBox?'rotateArrow':null" ng-click="toggleChatBoxWindow()"></div>
                </div>
            </div>
            <div class="col-md-12 chatWrapper">
                <div class="col-xs-12 col-md-12 chatScroller">
                    <div ng-repeat="item in messageList track by $index">
                        <div class="row incomingMessage" ng-if="item.messageSource==='messageFromBot'">
                            <div class="col-md-2 userThumbnail"></div>
                            <div class="col-md-10 userMessage">
                                <span ng-bind="item.messageText"></span>
                                <a href="{{item.link}}" target="_blank">{{item.link}}</a>
                                <div class="clearfix"></div>
                                <div class="col-md-10 userMessageAgo" ng-if="item.messageSource==='messageFromBot'">{{item.messageTime}}</div>
                                <span ng-if="item.plugin.type=='Manufacturer'" class="preferenceButton">No Preference</span>
                                <div ng-if="item.plugin.name === 'autofill'" ng-repeat="plugns in item.plugin.data">
                                    <div class="clearfix"></div>
                                    <button class="col-md-4 selectionButton" ng-disabled="isClickedByUser" ng-click="buttonSelection(plugns,$event,3)">{{plugns}}</button>
                                </div>
                            </div>
                            <div class="clearfix"></div>
                        </div>
                        <div class="row outgoingMessage" ng-if="item.messageSource==='messageFromUser'">
                            <!-- <div class="col-md-2 botThump"></div> -->
                            <div class="col-md-10 userMessage">
                                <span>{{item.messageText}}</span>
                                <a href="{{item.link}}" target="_blank">{{item.link}}</a>
                                <div class="clearfix"></div>
                            </div>
                        </div>
                    </div>
                    <div class="row loadingMessage" ng-if="showMsgLoader">
                        <div class="col-md-2 userThumbnail"></div>
                        <div class="col-md-10 userMessage">
                            <div class="col-md-4 loadingAnim">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-12 chatSend">
                <div class="row">
                    <div class="col-md-10 col-xs-10 textMessage">

                        <span class="floatBtn" ng-click="floatButtonClick();">
                            <i class="glyphicon glyphicon-align-justify	Try it" aria-hidden="true"></i>
                        </span>

                        <textarea style="text-indent:25px;" class="textMessageField" id="messageText" ng-model="messageText" ng-enter="sendMessageToBot(messageText)"
                            ng-change="userFilteringPopUpList(messageText)"></textarea>
                    </div>
                    <div class="col-md-2 col-xs-2 sendButton" ng-click="sendMessageToBot(messageText)"></div>
                </div>
            </div>
        </div>
        <div class="col-xs-12 popupContainer" ng-show="isPopUpEnabled">
            <div class="popupMinimize" ng-click="minimizeButtn()" ng-class="isPopUpEnabled?null:'rotateArrow'"></div>

            <div class="clearfix" style="max-height: 200px;height:200px;">
                <label>{{popUpName}}</label>
                <ul>
                    <!-- popupitem in (popup | popup:messageText | limitTo : 8) as autofillFiltered -->
                    <li ng-repeat="item in popUpList">
                        <label ng-class="item.isDisabled ? 'blurText':'null'">
                            <input id="noPreferenceInput" ng-model="item.isChecked" ng-if="item.name=='No preference'" type="checkbox" ng-click="selectItems(item.name)"
                                ng-disabled="item.isDisabled" />
                            <input type="checkbox" ng-model="item.isChecked" ng-if="item.name!='No preference'" ng-click="selectItems(item.name)" ng-disabled="item.isDisabled"
                            /> {{item.name}}
                        </label>
                    </li>
                </ul>
            </div>
            <div class="clearfix" style="width: 100%;padding:10px;">
                <div class="col-xs-6 col-md-6 col-sm-6 chatDoneBtn text-center" ng-click="chatDone()">Done!</div>
                <div class="col-xs-6 col-md-6 col-sm-6 chatResetBtn text-center" ng-click="checkPopUpListReset( )">Reset</div>
            </div>
        </div>
        <div class="popupclose" ng-click="isPopUpMiniMized=!isPopUpMiniMized;isPopUpEnabled=!isPopUpEnabled" ng-show="isPopUpMiniMized"
            ng-class="isPopUpEnabled?'rotateArrow':null"></div>

        <div class="col-md-12 quickAccessMenu" ng-class="showQuickAccessMenu ? 'displayBlockClass':'displayNoneClass'">
            <div class="row" style="padding:10px;">
                <div class="col-xs-4 text-center" class="quickAccessIcons" ng-repeat="plugnData in personasListOfMap">
                    <div class="quickAccessInnerIcons" ng-click="buttonSelection(plugnData,null,1)" style="padding:5px;min-height: 85px;margin-bottom: 5px;">
                        <!-- <i class="glyphicon glyphicon-align-justify" aria-hidden="true"></i> -->
                        <div class="img-container">
                            <img class="img-responsive" ng-if="plugnData=='Personal protection'" src="chatBot_img/personal_protection.png" alt="" />
                            <img class="img-responsive" ng-if="plugnData=='Recreational Shooting'" src="chatBot_img/shooting.png" alt="" />
                            <img class="img-responsive" ng-if="plugnData=='Hunting'" src="chatBot_img/hunter.png" alt="" />
                            <img class="img-responsive" ng-if="plugnData=='Something else'" src="chatBot_img/LEO.png" alt="" />
                        </div>

                        <div style="font-size:10px">{{plugnData}}</div>
                    </div>
                </div>
            </div>
            <div class="clearfix"></div>
        </div>
    </div>
</div>
<a href="javascript:void(0);" class="chat-bubble" ng-click="toggleChatBoxWindow()">Ask Joe!</a>`,
    restrict: 'E',
    link: function postLink(scope, element, attrs) {
    }
  };
});
chatApp.directive('productResultComponent', function () {
  return {
    template: `<div class="page home">
    <div class="main col1-layout">
        <div class="col-main">
            <ul class="cards-list">
                <li>
                    <a class="cardClick" ng-href="https://www.gundeals.com/{{item.url_key}}" target="_blank">
                        <div class="sin-card" ng-repeat="item in realEstatesDataBuyer | limitTo: increLength">
                            <!-- <span class="gun-img"><img src={{item.Image1}} alt="Gun" /></span> -->
                            <span class="gun-img">
                                <img ng-src="{{item.Image1}}" fallback-src="media/DataIngestionAppINITIALTEMPIMAGE.png">
                            </span>
                            <span class="gun-title">
                                <strong>{{item.Manufacturer}}
                                    <br />{{item.Model}}</strong>
                            </span>
                            <span class="gun-feat">
                                <span>
                                    <strong>MSRP:</strong>
                                    <b ng-if="item.MSRP">$</b>{{item.MSRP}}
                                    <b ng-if="!item.MSRP">N/A</b>
                                </span>
                                <span ng-if="item.Caliber">
                                    <strong>Caliber:</strong>
                                    <b ng-if="!item.Caliber">N/A</b>{{item.Caliber}}</span>
                                <span ng-if="item.gauge">
                                    <strong>Gauge:</strong>
                                    <b ng-if="!item.gauge">N/A</b>{{item.gauge}}</span>
                                <span>
                                    <strong>Capacity:</strong>{{item.CapacityStandard}}</span>
                            </span>
                            <span class="gun-feat">
                                <span>
                                    <strong>Our Price:</strong>
                                    <b ng-if="item.Our_price">$</b>{{item.Our_price}}</span>
                                <span>
                                    <strong>Barrel Length:</strong>{{item.BarrelLength}}</span>
                                <span>
                                    <strong>Category:</strong>{{item.Category}}</span>
                            </span>
                            <span class="gun-feat" style="height:60px;">
                                <span style="width:100%;">
                                    <strong>Best Use</strong>{{item.BestUse}}</span>
                            </span>
                            <a class="buy-gun" ng-href="https://www.gundeals.com/{{item.url_key}}" target="_blank">BUY NOW</a>
                        </div>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</div>
<span in-view="$inview && lineInView()" id="lazingLoading" style="color:transparent">&nbsp;Loading....</span>
`,
    restrict: 'E',
    link: function postLink(scope, element, attrs) {
    }
  };
});
