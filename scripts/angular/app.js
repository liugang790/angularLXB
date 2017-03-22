/**
 * Created by yi@Coy on 2016/8/4.
 */
'use strict';

var app = angular.module('myApp', ['ngRoute']);
app.config(['$routeProvider', '$locationProvider','$httpProvider', function ($routeProvider, $locationProvider,$httpProvider) {
    $routeProvider
        .when('/', {templateUrl: 'views/tpl/main.html', controller: "mainCtrl",title:"率修邦",headerType:"main"})
        .when('/serviceDetails?:id', {templateUrl: 'views/tpl/serviceDetails.html', controller: "serviceDetailsCtrl",title:"家电维修",headerType:"back"})
        .when('/orderAdd', {templateUrl: 'views/tpl/orderAdd.html', controller: "orderAddCtrl",title:"完善订单信息",headerType:"back"})
        .when('/selectTime', {templateUrl: 'views/tpl/selectTime.html', controller: "selectTimeCtrl",title:"预约时间选择",headerType:"back"})
        .when('/selectSitus', {templateUrl: 'views/tpl/selectSitus.html', controller: "selectSitusCtrl",title:"维修地点定位",headerType:"back"})
        .when('/selectAddress', {templateUrl: 'views/tpl/selectAddress.html', controller: "selectAddressCtrl",title:"常用地址选择",headerType:"back"})
        .when('/commentAddress?:id', {templateUrl: 'views/tpl/commentAddress.html', controller: "commentAddressCtrl",title:"常用地址",headerType:"back"})
        .when('/bespokeOrder?:id',{templateUrl:'views/tpl/bespokeOrder.html',controller:"bespokeOrderCtrl",title:"订单详情",headerType:"back"})
        .when('/cancle',{templateUrl:'views/tpl/cancle.html',controller:"cancleCtrl",title:"取消订单",headerType:"back"})
		.when('/complaint?:id',{templateUrl:'views/tpl/complaint.html',controller:"complaintCtrl",title:"投诉反馈",headerType:"back"})
        .when('/teaDetaile',{templateUrl:'views/tpl/teaDetaile.html',controller:"teaDetaileCtrl",title:"师傅详情",headerType:"back"})
        .when('/servieDetail?:id',{templateUrl:'views/tpl/servieDetail.html',controller:"servieDetailCtrl",title:"评价详情",headerType:"back"})
        .when('/canclepay?:id',{templateUrl:'views/tpl/canclepay.html',controller:"canclepayCtrl",title:"取消订单",headerType:"back"})
        .when('/payway?:id',{templateUrl:'views/tpl/payway.html',controller:"paywayCtrl",title:"支付方式选择",headerType:"back"})
        .when('/orderevaluate?:id',{templateUrl:'views/tpl/orderevaluate.html',controller:"orderevaluateCtrl",title:"订单评价",headerType:"back"})
        .when('/myinfo',{templateUrl:'views/tpl/myinfo.html',controller:"myinfoCtrl",title:"个人资料",headerType:"back"})
        .when('/bindphone',{templateUrl:'views/tpl/bindphone.html',controller:"bindphoneCtrl",title:"更改绑定手机",headerType:"back"})
        .when('/restmyinfo',{templateUrl:'views/tpl/restmyinfo.html',controller:"restmyinfoCtrl",title:"个人资料修改",headerType:"back"})
        .when('/spendorder',{templateUrl:'views/tpl/spendorder.html',controller:"spendorderCtrl",title:"我的消费",headerType:"back"})
        .when('/mywxcode',{templateUrl:'views/tpl/mywxcode.html',controller:"mywxcodeCtrl",title:"我的维修币",headerType:"back"})
        .when('/buycode',{templateUrl:'views/tpl/buycode.html',controller:"buycodeCtrl",title:"维修币套餐",headerType:"back"})
        .when('/gmcode?:id',{templateUrl:'views/tpl/gmcode.html',controller:"gmcodeCtrl",title:"购买维修币",headerType:"back"})
        .when('/myservice',{templateUrl:'views/tpl/myservice.html',controller:"myserviceCtrl",title:"我的评价",headerType:"back"})
        .when('/messagecenter',{templateUrl:'views/tpl/messagecenter.html',controller:"messagecenterCtrl",title:"消息中心",headerType:"back"})
        .when('/messcendetail?:id',{templateUrl:'views/tpl/messcendetail.html',controller:"messcendetailCtrl",title:"消息中心",headerType:"back"})
        .when('/myorder',{templateUrl:'views/tpl/myorder.html',controller:"myorderCtrl",title:"我的订单",headerType:"order"})
        .when('/userCenter',{templateUrl:'views/tpl/userCenter.html',controller:"userCenterCtrl",title:"个人中心",headerType:"user"})
        .when('/more',{templateUrl:'views/tpl/more.html',controller:"moreCtrl",title:"更多",headerType:"back"})
        .when('/addUs',{templateUrl:'views/tpl/addUs.html',controller:"addUsCtrl",title:"师傅入驻",headerType:"back"})
        .when('/addApply',{templateUrl:'views/tpl/addApply.html',controller:"addApplyCtrl",title:"师傅入驻申请",headerType:"back"})
        .when('/masterDetail?:id',{templateUrl:'views/tpl/masterDetail.html',controller:"masterDetailCtrl",title:"师傅入驻申请",headerType:"back"})
        .when('/commonAdrList',{templateUrl:'views/tpl/commonAddressList.html',controller:"commonAdrListCtrl",title:"常用地址",headerType:"back"})
        .when('/aboutUs',{templateUrl:'views/tpl/aboutUs.html',title:"关于我们",headerType:"back"})
        .when('/contactUs',{templateUrl:'views/tpl/contactUs.html',title:"联系我们",headerType:"back"})
        .when('/law',{templateUrl:'views/tpl/law.html',title:"法律条款",headerType:"back"})
        .when('/opinion',{templateUrl:'views/tpl/opinion.html',controller:"opinionCtrl",title:"意见反馈",headerType:"back"})
        .when('/shareOrder?:id',{templateUrl:'views/tpl/shareOrder.html',controller:"shareOrderCtrl",title:"订单分享结果详情页面",headerType:"head"})
        .otherwise({redirectTo: '/'});
    // $locationProvider.html5Mode(true);

    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    // Use x-www-form-urlencoded Content-Type
    $httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript, *!/!*; q=0.01';
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data)
    {
        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function(obj)
        {
            var query = '';
            var name, value, fullSubName, subName, subValue, innerObj, i;

            for(name in obj)
            {
                value = obj[name];

                if(value instanceof Array)
                {
                    for(i=0; i<value.length; ++i)
                    {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                }
                else if(value instanceof Object)
                {


                    for(subName in value)
                    {


                        subValue = value[subName];
                        if(subValue != null){
                            // fullSubName = name + '[' + subName + ']';
                            fullSubName = name + '.' + subName;
                            // fullSubName =  subName;
                            innerObj = {};
                            innerObj[fullSubName] = subValue;
                            query += param(innerObj) + '&';
                        }
                    }
                }
                else if(value !== undefined ) //&& value !== null
                {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }


            return query.length ? query.substr(0, query.length - 1) : query;
        };


        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];

}]);
app.run(['$rootScope','$route','$http',function($rootScope,$route,$http){
    $rootScope.$on("$routeChangeSuccess", function(event,currentRoute, previousRoute) {
        $rootScope.pageTitle = $route.current.title;
        switch ($route.current.headerType){
            case "main" : $rootScope.headShow = "main_show";break;
            case "back" : $rootScope.headShow = "back_show";break;
            case "order" : $rootScope.headShow = "order_show";break;
            case "user" : $rootScope.headShow = "user_show";break;
            case "head" : $rootScope.headShow = "head_show";break;
        }
        angular.element(".popup_wrap").removeClass("popup_wrap_shaw");
        setTimeout(function () {
            angular.element(".popup_wrap").css("display","none");
        },500);
        if(currentRoute.$$route.originalPath == "/serviceDetails?:id" || currentRoute.$$route.originalPath == "/selectAddress"){
            sessionStorage.removeItem("select_address");
        }
    });
}]);
/*测试环境*/
/*app.constant("remoteApiUrl","http://lvxiubang.zgcom.cn/index.php");*/
/*正式环境*/
app.constant("remoteApiUrl","http://www.shuaixiubang.com/index.php?s=");
