/**
 * Created by yi@Coy on 2016/8/4.
 */
'use strict';


app.controller("HeaderCtrl",['$scope','$rootScope','ajaxServer',function($scope,$rootScope,ajaxServer){
    $rootScope.head = true;
    $scope.selectCity = function () {
        angular.element(".popup_wrap").css("display","block");
        setTimeout(function () {
            angular.element(".popup_wrap").addClass("popup_wrap_shaw");
        },0);
    };
    $scope.close = function () {
      angular.element(".popup_wrap").css("display","none");
    }
}]);
app.controller("mainCtrl",['$scope','$rootScope','ajaxServer','$location',function($scope,$rootScope,ajaxServer,$location){
    if(!(sessionStorage.token != "" && sessionStorage.token != undefined && sessionStorage.token != "undefined")){
        sessionStorage.token = $location.search().token;
    }
    var getCategory = function () {
        ajaxServer.ajaxed("/api/user/category",{city_id:sessionStorage.selfCityId},function(res){
            res.data.forEach(function (item) {
                angular.extend(item,item,{
                    logo : item.logo == ""?"/weixin/images/nav_01.png":item.logo
                })
            });
            $rootScope.isSpinner = false;
            sessionStorage.mainData = JSON.stringify(res.data);
            $rootScope.mainList = JSON.parse(sessionStorage.mainData);
            $scope.$apply();
        });
    };
    var positionCity = function (cityList) {   //百度API定位
        var geolocation = new BMap.Geolocation();
        var gc = new BMap.Geocoder();
        geolocation.getCurrentPosition(function(r){
            if(this.getStatus() == BMAP_STATUS_SUCCESS){
                console.log('您的位置：'+r.point.lng+','+r.point.lat);
                sessionStorage.lat_lng = JSON.stringify({lat:r.point.lat,lng:r.point.lng});
                var point = new BMap.Point( r.point.lng,r.point.lat);
                gc.getLocation(point, function(rs){
                    var addComp = rs.addressComponents;
                    var isCity = cityList.some(function (ele) {
                        sessionStorage.selfCityId = ele.id;
                        sessionStorage.selfCityName = ele.name;
                        angular.element(".selfCity").attr("data-id",ele.id);
                        console.log(ele.name );
                        return (ele.name == addComp.city);
                    });
                    if(isCity){
                        angular.element(".selfCity").text(addComp.city);
                        angular.element(".selfCity").addClass("cities");
                        getCategory();
                    }else{
                        angular.element(".popup_wrap").css("display","block");
                        setTimeout(function () {
                            angular.element(".popup_wrap").addClass("popup_wrap_shaw");
                        },0);
                    }
                    sessionStorage.addressDetails = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                })
            }
            else {
                console.error('failed'+this.getStatus());
            }
        },{enableHighAccuracy: true});
    };
    if(sessionStorage.selfCityId){
        angular.element(".selfCity").attr("data-id",sessionStorage.selfCityId);
        angular.element(".selfCity").text(sessionStorage.selfCityName);
        angular.element(".selfCity").addClass("cities");
        $rootScope.cityList = JSON.parse(sessionStorage.cityList);
        getCategory();
    }else{
        if(!sessionStorage.cityList){
            ajaxServer.ajaxed("/api/home/city",{},function(res){
                sessionStorage.cityList = JSON.stringify(res.data);
                $rootScope.cityList = JSON.parse(sessionStorage.cityList);
                positionCity(res.data);
            });
        }else{
            $rootScope.cityList = JSON.parse(sessionStorage.cityList);
            positionCity($rootScope.cityList);
        }
    }

    $rootScope.isSpinner = true;
    angular.element(".popup_content").on("click",".cities",function () {
        angular.element(".popup_wrap").removeClass("popup_wrap_shaw");
        setTimeout(function () {
            angular.element(".popup_wrap").css("display","none");
        },500);
        sessionStorage.selfCityId = angular.element(this).attr("data-id");
        sessionStorage.selfCityName = angular.element(this).text();
        angular.element(".indexCity").text(angular.element(this).text());
        ajaxServer.ajaxed("/api/user/category",{city_id:angular.element(this).attr("data-id")},function(res){
            sessionStorage.mainData = JSON.stringify(res.data);
            $rootScope.mainList = res.data;
        });
        return false;
    });
    if(sessionStorage.mainData){
        $rootScope.isSpinner = false;
        $rootScope.mainList = JSON.parse(sessionStorage.mainData);
    }
    ajaxServer.ajaxed("/api/home/banner",{},function(res){
        $scope.banner = res.data;
        var mySwiper = new Swiper ('.swiper-container', {
            direction: 'horizontal',
            loop: false,
            // 如果需要分页器
            pagination: '.swiper-pagination',
            autoplay:2000,
            observer: true,//修改swiper自己或子元素时，自动初始化swiper
            observeParents: true//修改swiper的父元素时，自动初始化swiper
        });
    })
}]);
app.controller("serviceDetailsCtrl",['$scope','$rootScope','$location','ajaxServer','alertReset',function($scope,$rootScope,$location,ajaxServer,alertReset){
    var id = $location.search().id;
    console.log(id);
    sessionStorage.serviceId = "";
    var categoryList = JSON.parse(sessionStorage.mainData);
    var selfCategory = categoryList.filter(function (ele) {
        if(ele.id == id){
            $rootScope.pageTitle = ele.name;
            return true;
        }
    });
    $scope.selfCategoryList = selfCategory[0].list;
    if($scope.selfCategoryList.length !== 0){
        $scope.selfSelectDetails = selfCategory[0].list[0].list;
        $scope.selfServerSm = selfCategory[0].list[0].list[0].explain;
        sessionStorage.serviceId = selfCategory[0].list[0].list[0].id;
    }
    $scope.swiperSlide = function () {
        angular.element(".swiper-wrapper").removeClass("swiper_wrapper_first");
        $scope.selfSelectDetails = this.item.list;
        $scope.selfServerSm = this.item.list[0].explain;
        sessionStorage.serviceId = this.item.list[0].id;
    };
    $scope.serverSmFn = function () {
        // angular.element(".service_details_ul").removeClass("service_details_first");
        $scope.selfServerSm = this.item.explain;
        sessionStorage.serviceId = this.item.id;
    };
    $scope.toAddOrder = function () {
        if(sessionStorage.serviceId != ""){
            $location.url("/orderAdd");
        }else{
            alertReset.alert("暂无维修分类");
        }
    }
}]);
app.controller("orderAddCtrl",['$scope','ajaxServer','fileAjax','$location','$rootScope','$interval','alertReset',function($scope,ajaxServer,fileAjax,$location,$rootScope,$interval,alertReset){
    if(!sessionStorage.timeSelect){
        $scope.timeSelect = "请选择";
    }else{
        $scope.timeSelect = sessionStorage.timeSelect;
    }
    $scope.send_text = "确认下单";
    $scope.send_text_bind = "确认绑定并下单";
    $scope.is_bindPhone = false;
    sessionStorage.removeItem("addressId");
    $scope.numImg = 6;
    ajaxServer.ajaxed("/api/address/addressLists",{},function (res) {
        var is_selected = res.data.some(function (item) {
            sessionStorage.addressId = item.id;
            $scope.addressDetails = item.address;
            $scope.detail = item.detail;
            $scope.user = item.name +" "+item.phone;
            return (item.selected == "1");
        });
        if(is_selected){
            $scope.is_address = true;
        }else{
            $scope.is_address = false;
            if(sessionStorage.position_lat_lng){
                $scope.detail = JSON.parse(sessionStorage.position_lat_lng).position_title;
            }else{
                $scope.detail = sessionStorage.addressDetails;
            }
        }
        if(sessionStorage.select_address){
            var selectAddress = JSON.parse(sessionStorage.select_address);
            sessionStorage.addressId = selectAddress.addressId;
            $scope.addressDetails = selectAddress.addressDetail;
            $scope.detail = selectAddress.address;
            $scope.user = selectAddress.info;
        }
    });
    var is_send = false;
    $scope.submitOrder = function () {
        if(is_send){
            return false;
        }
        is_send = true;
        $scope.send_text = "订单上传中,请稍后...";
        $scope.send_text_bind = "绑定成功，正在上传订单...";
        var city_id = sessionStorage.selfCityId,
            cate_id = sessionStorage.serviceId,
            time = $scope.timeSelect == "请选择"?false:Date.parse($scope.timeSelect.split(".").join("/"))/1000,
            remark = $scope.remark?$scope.remark:"",
            address_id = "",
            address = sessionStorage.addressDetails;
        if($scope.is_address){
            address_id = sessionStorage.addressId
        }else{
            var name = $scope.name,
                phone = /0?(13|14|15|18|17)[0-9]{9}$/i.test($scope.phone)?$scope.phone:"",
                detail = $scope.writeAddress,
                address = $scope.detail,
                lat_lng = sessionStorage.position_lat_lng ? JSON.parse(sessionStorage.position_lat_lng) : JSON.parse(sessionStorage.lat_lng),
                lat = lat_lng.lat,
                lng = lat_lng.lng;
            if(phone == "" && address){
                address_id = false;
            }else{
                address_id = JSON.stringify({
                    name:name,
                    phone:phone,
                    detail:detail,
                    address:address,
                    lat: lat,
                    lng:lng
                })
            }
        }
        angular.element(".img_content ul li").each(function (index,item) {
            if(angular.element(item).css("display") == "none"){
                angular.element(item).remove();
            }
        });
        if(city_id && time && address_id){
            ajaxServer.ajaxed("/api/user/detail",{},function (res) {
                sessionStorage.removeItem("select_address");
                if(res.data.phone == ""){
                    $scope.is_bindPhone = true;
                    is_send = false;
                    $scope.send_text = "确认下单";
                    $scope.send_text_bind = "确认绑定并下单";
                }else{
                    var option_v = fileAjax.ajaxFiled("/api/order/submitOrder",{
                        city_id : city_id,
                        cate_id : cate_id,
                        time : time,
                        remark : remark,
                        address_id : address_id,
                        address:address
                    },function (response) {
                        is_send = false;
                        $location.url("/bespokeOrder?id="+response.data.id);
                        $scope.$apply();
                    });
                    angular.element("#addOrder").ajaxSubmit(option_v);
                }
            });
        }else{
            is_send = false;
            $scope.send_text = "确认下单";
            $scope.send_text_bind = "确认绑定并下单";
            alertReset.alert("请填写完整和正确格式的手机号码");
        }
    };
    $scope.verifiticationCode = "获取验证码";
    $scope.button_disabled = true;
    var time = 0;
    $scope.time_out = function(){
        var phone = $scope.phone;
        if(!phone){
            alertReset.alert("请输入手机号!");
            return false;
        }
        if($scope.button_disabled){
            time =60;
            $scope.button_disabled = false;
            var timer = $interval(function(){
                if (time <= 0) {
                    $scope.button_disabled = true;
                    $scope.verifiticationCode = "重新获取";
                    $interval.cancel(timer);
                    return;
                }
                time--;
                $scope.verifiticationCode = "剩" + time + "秒";
            }, 1000);
            ajaxServer.ajaxed("/api/user/getCode",{phone:phone},function (res) {
                console.log(res.data);
            });
        }
    };
    $scope.bindPhone = function () {
        var code = $scope.captcha,
            phone = $scope.phone;
        if(!(code || phone)){
            alertReset.alert("请输入手机号或验证码!");
            return false;
        }
        ajaxServer.ajaxed("/api/user/bindPhone",{phone:phone,code:code},function (res) {
            $scope.submitOrder();
        })
    }
}]);
app.controller("selectTimeCtrl",['$scope','$rootScope','$location','alertReset',function($scope,$rootScope,$location,alertReset){
    $scope.sureTime = function () {
        var timeDoc = angular.element(".active");
        if(timeDoc.length == 0 || timeDoc.length == 1){
            alertReset.alert("请填写完整！");
        }else{
            var day = angular.element(".active")[0],
                hours = angular.element(".active")[1];
            var time = angular.element(day).attr("date") + " " +angular.element(hours).text()+":00";
            console.log(time);
            sessionStorage.timeSelect = time;
            history.back();
        }
    }
}]);
app.controller("selectSitusCtrl",['$scope','$rootScope','ajaxServer',function($scope,$rootScope,ajaxServer){
    // 百度地图API功能
    var selfCityName = sessionStorage.selfCityName;
    var options = {
        onSearchComplete: function(results){
            // 判断状态是否正确
            if (local.getStatus() == BMAP_STATUS_SUCCESS){
                var s = [];
                for (var i = 0; i < results.getCurrentNumPois(); i ++){
                    var position = {};
                    position.title = results.getPoi(i).title;
                    position.address = results.getPoi(i).address ? results.getPoi(i).address :"";
                    position.point = results.getPoi(i).point;
                    s.push(position);
                }
                var situsList = '';
                s.forEach(function (item) {
                    situsList += '<a href="jacascript:;" lat="' +
                        item.point.lat +'" lng="'+
                        item.point.lng +'"><h2>' +
                        item.title +'</h2><p>' +
                        item.address +'</p></a>';
                });
                angular.element(".situs_wrap").empty();
                angular.element(".situs_wrap").append(situsList);
            }else{
                angular.element(".situs_wrap").empty();
                angular.element(".situs_wrap").append("<h2>暂无搜索内容或者搜索内容超出选择区域</h2>");
            }
        }
    };
    var local = new BMap.LocalSearch(selfCityName, options);
    $scope.searchBtn = function () {
        var str = $scope.search_val;
        local.search(str);
    };
    angular.element(".situs_wrap").on("click","a",function () {
        var position_lat_lng = {};
        position_lat_lng.lat = angular.element(this).attr("lat");
        position_lat_lng.lng = angular.element(this).attr("lng");
        position_lat_lng.position_title = angular.element(this).find("h2").text();
        sessionStorage.position_lat_lng =  JSON.stringify(position_lat_lng);
        history.back();
    });
    $scope.cancelSearch = function () {
        $scope.search_val = "";
        angular.element("#suggestId").focus();
    }
}]);
app.controller("selectAddressCtrl",['$scope','$rootScope','ajaxServer','alertReset','confirmReset',function($scope,$rootScope,ajaxServer,alertReset,confirmReset){
    var addressList = function () {
        ajaxServer.ajaxed("/api/address/addressLists",{},function (res) {
            res.data.forEach(function (item) {
                angular.extend(item,item,{
                    selected : item.selected == "1"? "select_address_defaultBtn" : "address_defaultBtn"
                });
            });
            $scope.addressList = res.data;
        })
    };
    addressList();
    $scope.deleteAdr = function(){
        var id = this.item.id;
        confirmReset.confirm("是否删除地址？",function(){
            ajaxServer.ajaxed("/api/address/deleteAddress",{address_id:id},function(res){
                addressList();
                alertReset.alert(res.status.msg);
            })
        });
    };
    $scope.selectAdr = function(id){
        sessionStorage.select_address = JSON.stringify({
            addressDetail:this.item.address,
            addressId:id,
            address:this.item.detail,
            info: this.item.name + " " + this.item.phone
        });
        history.back();
    };
    $scope.defaultFn = function () {
        var address_id = this.item.id;
        ajaxServer.ajaxed("/api/address/setDefaultAddress",{address_id: address_id},function (res) {
            alertReset.alert(res.status.msg);
        });
    }
}]);
app.controller("commonAdrListCtrl",['$scope','$rootScope','ajaxServer','alertReset','confirmReset',function($scope,$rootScope,ajaxServer,alertReset,confirmReset){
    var addressList = function () {
        ajaxServer.ajaxed("/api/address/addressLists",{},function (res) {
            res.data.forEach(function (item) {
                angular.extend(item,item,{
                    selected : item.selected == "1"? "select_address_defaultBtn" : "address_defaultBtn"
                });
            });
            $scope.addressList = res.data;
        })
    };
    addressList();
    $scope.deletAddress = function () {
        var address_id = this.item.id;
        confirmReset.confirm("是否删除？",function(){
            ajaxServer.ajaxed("/api/address/deleteAddress",{address_id:address_id},function (res) {
                addressList();
            })
        });
    };
    $scope.defaultFn = function () {
        var address_id = this.item.id;
        ajaxServer.ajaxed("/api/address/setDefaultAddress",{address_id: address_id},function (res) {
            alertReset.alert(res.status.msg);
        });
    }
}]);
app.controller("commentAddressCtrl",['$scope','$rootScope','ajaxServer','$location','alertReset',function($scope,$rootScope,ajaxServer,$location,alertReset){
    var id = $location.search().id;
    var lat_lng;
    angular.element("input[type='checkbox']").click(function () {
        if(angular.element(this).is(":checked")){
            angular.element(this).siblings("i").removeClass('address_defaultBtn').addClass("select_address_defaultBtn");
        }else{
            angular.element(this).siblings("i").addClass("address_defaultBtn").removeClass("select_address_defaultBtn");
        }
    });
    if(id){
        ajaxServer.ajaxed("/api/address/detail",{address_id:id},function (res) {
            if(sessionStorage.position_lat_lng){
                var position_lat_lng = JSON.parse(sessionStorage.position_lat_lng);
                $scope.addressDetails = position_lat_lng.position_title;
                lat_lng = position_lat_lng;
            }else{
                $scope.addressDetails = res.data.address;
                lat_lng = {
                    lat:res.data.lat,
                    lng:res.data.lng
                };
            }
            $scope.detail = res.data.detail;
            $scope.name = res.data.name;
            $scope.phone = res.data.phone;
        });
        $scope.addAddress = function () {
            var name = $scope.name,
                phone = $scope.phone,
                selected = angular.element("input[type='checkbox']").is(":checked")?1:0,
                lat = lat_lng.lat,
                lng = lat_lng.lng,
                detail = $scope.detail,
                address = $scope.addressDetails;
            if(name || phone || detail){
                if(/0?(13|14|15|18|17)[0-9]{9}$/i.test(phone)){
                    ajaxServer.ajaxed("/api/address/editAddress",{address_id:id,name:name,phone: phone,selected:selected,lat:lat,lng:lng,detail:detail,address:address},function (res) {
                        history.back();
                    });
                }else{
                    alertReset.alert("请输入正确的手机号码");
                }
            }else{
                alertReset.alert("请填写完整");
            }
            sessionStorage.removeItem("position_title");
        }
    }else{
        if(sessionStorage.position_lat_lng){
            var position_lat_lng = JSON.parse(sessionStorage.position_lat_lng);
            $scope.addressDetails = position_lat_lng.position_title;
            lat_lng = position_lat_lng;
        }else{
            $scope.addressDetails = sessionStorage.addressDetails;
            lat_lng = JSON.parse(sessionStorage.lat_lng);
        }
        $scope.addAddress = function () {
            var name = $scope.name,
                phone = $scope.phone,
                selected = angular.element("input[type='checkbox']").is(":checked")?1:0,
                lat = lat_lng.lat,
                lng = lat_lng.lng,
                detail = $scope.detail,
                address = $scope.addressDetails;
            if(name || phone || detail){
                if(/0?(13|14|15|18|17)[0-9]{9}$/i.test(phone)){
                    ajaxServer.ajaxed('/api/address/addAddress',{name:name,phone: phone,selected:selected,lat:lat,lng:lng,detail:detail,address:address},function (res) {
                        sessionStorage.select_address = JSON.stringify({
                            addressDetail:res.data.address,
                            addressId:res.data.id,
                            address:res.data.detail,
                            info: name + " " + phone
                        });
                        history.back();
                    })
                }else{
                    alertReset.alert("请输入正确的手机号码");
                }
            }else{
                alertReset.alert("请填写完整！");
            }
            sessionStorage.removeItem("position_title");
        }
    }
}]);
app.controller("bespokeOrderCtrl",['$scope','$location','ajaxServer','timestamp','$rootScope',function($scope,$location,ajaxServer,timestamp,$rootScope){
    var id = $location.search().id;
    $scope.orderId = id;
    ajaxServer.ajaxed("/api/order/oderProgressList",{order_id:id},function(res){
        res.data.forEach(function (item) {
            angular.extend(item,item,{
                createtime:timestamp.format(Number(item.createtime)*1000)
            });
        });
       $scope.lists = res.data;
    });
    ajaxServer.ajaxed("/api/order/orderDetail",{order_id:id},function (res) {
        var status;
        switch (res.data.status){
            case "0": status = "暂无师傅接单";$scope.is_master = false;$rootScope.pageTitle = "预约中订单详情";break;
            case "1": status = res.data.master.realname;$scope.is_master = true;$rootScope.pageTitle = "已预约订单详情";break;
            case "2": status = res.data.master.realname;$scope.is_master = true;$rootScope.pageTitle = "检测中订单详情";break;
            case "3": status = res.data.master.realname;$scope.is_master = true;$rootScope.pageTitle = "待支付订单详情";break;
            case "4": status = res.data.master.realname;$scope.is_master = true;$rootScope.pageTitle = "待评价订单详情";break;
            case "5": status = res.data.master.realname;$scope.is_master = true;$rootScope.pageTitle = "已完成订单详情";break;
            case "6": status = res.data.master.realname?res.data.master.realname:"已取消";$rootScope.pageTitle = "已取消订单详情";break;
            case "7": status = res.data.master.realname;$scope.is_master = true;$rootScope.pageTitle = "待支付订单详情";angular.element(".master_order").css("height","auto");break;
        }
        var starList = ['star1','star1','star1','star1','star1'];
        if(Number(res.data.comment.star)%1 === 0){
            for(var i=0;i<Number(res.data.comment.star);i++){
                starList.splice(i,1,"star3");
            }
        }else{
            for(var i=0;i<(Number(res.data.comment.star)+0.5);i++){
                if(i == (Number(res.data.comment.star)+0.5)-1){
                    starList.splice(i,1,"star2");
                }else{
                    starList.splice(i,1,"star3");
                }
            }
        }
        var cankao_fee="参考价格:"+res.data.service_fee,
            service_total_fee="人工费用:"+res.data.labour_fee +"+"+"耗材费用:"+res.data.material_fee +"="+(Number(res.data.labour_fee)+Number(res.data.material_fee))+"元";
        angular.extend(res.data,res.data,{
            time:timestamp.format(Number(res.data.time)*1000),
            remark:res.data.remark == ""?"无":res.data.remark,
            status:status,
            masterHead:res.data.master.head?res.data.master.head:"/weixin/images/tx1.png",
            masterHref:res.data.master.uid?"#/teaDetaile?id="+res.data.master.uid:"javascript:;",
            status_display : res.data.status,
            display_fee:res.data.labour_fee == "0.00"?cankao_fee:service_total_fee,
            starList:starList
        });
        $scope.orderDetail = res.data;
        $scope.comment_display = res.data.comment.length == 0?false:true;
    });
    if(sessionStorage.serviceTel){
        $scope.serviceTel = sessionStorage.serviceTel;
    }else{
        ajaxServer.ajaxed("/api/home/setting",{},function (res) {
            res.data.forEach(function (item) {
                if(item.key =="400"){
                    $scope.serviceTel = item.content;
                    sessionStorage.serviceTel = item.content;
                }
            })
        })
    }

}]);
app.controller("cancleCtrl",['$scope','$rootScope','$route','ajaxServer','$location','alertReset',function($scope,$rootScope,$route,ajaxServer,$location,alertReset){
    var id = $location.search().id;
    ajaxServer.ajaxed("/api/order/orderDetail",{order_id:id},function(res){
        if(res.data.status == "6"){
            history.back();
        }
    });
    $scope.canclebtn = function() {
          var content = $scope.content,
              status = angular.element('input:radio[name="defaultAdr"]:checked').val();
        if(content && status){
            ajaxServer.ajaxed("/api/user/orderCancel",{
                order_id:id,
                content:content,
                status:status
            },function(res){
                $location.url("/bespokeOrder?id="+id);
                $scope.$apply();
            })
        }else{
            alertReset.alert("请填写完整");
        }
    }
}]);
app.controller("complaintCtrl",['$scope','ajaxServer','$location','hint','alertReset',function($scope,ajaxServer,$location,hint,alertReset){
    var id = $location.search().id;
    $scope.orderId = id;
    $scope.number =500;
    $scope.content ="";
    $scope.number = function(){
        return  500-$scope.content.length;
    };
    $scope.sendFn = function () {
        var title = $scope.title,
            content = $scope.content;
        if(title && content){
            ajaxServer.ajaxed("/api/user/orderFeedback",{order_id:id,title:title,content:content},function (res) {
                hint.hint("您的反馈我们已收到，我们会竭尽处理",function () {
                    setTimeout(function () {
                        angular.element(".hint_wrap").remove();
                        history.back();
                    },1000);
                });
            })
        }else{
            alertReset.alert("请输入订单标题和内容");
        }
    }
}]);
app.controller("shareOrderCtrl",['$scope','$rootScope','$location','ajaxServer','timestamp',function($scope,$rootScope,$location,ajaxServer,timestamp){
    var id = $location.search().id;
    $scope.orderId = id;
    angular.element(".master_order").css("height","auto");
    ajaxServer.ajaxed("/api/order/shareOrderDetail",{order_id:id},function (res) {
        var starList = ['star1','star1','star1','star1','star1'];
        if(Number(res.data.comment.star)%1 === 0){
            for(var i=0;i<Number(res.data.comment.star);i++){
                starList.splice(i,1,"star3");
            }
        }else{
            for(var i=0;i<(Number(res.data.comment.star)+0.5);i++){
                if(i == (Number(res.data.comment.star)+0.5)-1){
                    starList.splice(i,1,"star2");
                }else{
                    starList.splice(i,1,"star3");
                }
            }
        }
        var cankao_fee="参考价格:"+res.data.service_fee,
            service_total_fee="人工费用:"+res.data.labour_fee +"+"+"耗材费用:"+res.data.material_fee +"="+(Number(res.data.labour_fee)+Number(res.data.material_fee))+"元";
        res.data.progress.data.forEach(function (item) {
            angular.extend(item,item,{
                createtime:timestamp.format(Number(item.createtime)*1000)
            });
        });
        angular.extend(res.data,res.data,{
            time:timestamp.format(Number(res.data.time)*1000),
            remark:res.data.remark == ""?"无":res.data.remark,
            masterHead:res.data.master.head?res.data.master.head:"/weixin/images/tx1.png",
            masterHref:res.data.master.uid?"#/teaDetaile?id="+res.data.master.uid:"javascript:;",
            display_fee:res.data.labour_fee == "0.00"?cankao_fee:service_total_fee,
            starList:starList,
            lists : res.data.progress.data
        });
        $scope.orderDetail = res.data;
        $scope.comment_display = res.data.comment.length == 0?false:true;
    });
    if(sessionStorage.serviceTel){
        $scope.serviceTel = sessionStorage.serviceTel;
    }else{
        ajaxServer.ajaxed("/api/home/setting",{},function (res) {
            res.data.forEach(function (item) {
                if(item.key =="400"){
                    $scope.serviceTel = item.content;
                    sessionStorage.serviceTel = item.content;
                }
            })
        })
    }

}]);
app.controller("teaDetaileCtrl",['$scope','$rootScope','$location','ajaxServer',function($scope,$rootScope,$location,ajaxServer){
    var id = $location.search().id;
     /*ajaxServer.ajaxed("/api/user/masterDetail",{master_id:id},function(res){
        $scope.masterDetail = res.data;
     });*/
    angular.element(".teacher_detaile").on("click",".add_apply_type h4",function () {
        if(angular.element(this).siblings(".add_apply_type_list").height() == 0){
            angular.element(".add_apply_type_list").css("height","0");
            angular.element(this).siblings(".add_apply_type_list").css("height","auto");
        }else{
            angular.element(this).siblings(".add_apply_type_list").css("height","0");
        }
    });
    ajaxServer.ajaxed("/api/user/category",{},function(res_category){
        ajaxServer.ajaxed("/api/user/masterDetail",{master_id:id},function (res) {
            var serviceArray = [],starList = ['star1','star1','star1','star1','star1'];
            res.data.servie_type_ids.forEach(function(item,index){
                var serviceObj = {},serviceTwo = [];
                if(item.id == res_category.data[index].id){
                    serviceObj.id = item.id;
                    serviceObj.name = res_category.data[index].name;
                    item.ids.forEach(function(option,num){
                        var serviceTwoObj = {};
                        if(option == res_category.data[index].list[num].id){
                            serviceTwoObj.id = option;
                            serviceTwoObj.name = res_category.data[index].list[num].name;
                        }
                        serviceTwo.push(serviceTwoObj);
                    });
                    serviceObj.list = serviceTwo;
                }
                serviceArray.push(serviceObj);
            });
            if(Number(res.data.comment.star)%1 === 0){
                for(var i=0;i<Number(res.data.comment.star);i++){
                    starList.splice(i,1,"star3");
                }
            }else{
                for(var i=0;i<(Number(res.data.comment.star)+0.5);i++){
                    if(i == (Number(res.data.comment.star)+0.5)-1){
                        starList.splice(i,1,"star2");
                    }else{
                        starList.splice(i,1,"star3");
                    }
                }
            }
            angular.extend(res.data,res.data,{
                head:res.data.head==""?"/weixin/images/tx1.png":res.data.head,
                serviceArray:serviceArray,
                starList:starList
            });
            $scope.masterDetail = res.data;
        })
    });

}]);
app.controller("servieDetailCtrl",['$scope','$location','ajaxServer',function($scope,$location,ajaxServer){
    var page = 1,pageSize = 20;
    var id = $location.search().id;
    var viewMasterCL = function (page,pageSize) {
        ajaxServer.ajaxed("/api/order/viewMasterCommentLists",{master_id:id,page:page,pageSize:pageSize},function (res) {
            if(res.data.length == 0){
                $scope.noData = true;
                $scope.isLoadDisplay = false;
                return false;
            }
            $scope.noData = false;
            $scope.isLoadDisplay = true;
            res.data.forEach(function (item) {
                var starList = ['star1','star1','star1','star1','star1'];
                if(Number(item.star)%1 === 0){
                    for(var i=0;i<Number(item.star);i++){
                        starList.splice(i,1,"star3");
                    }
                }else{
                    for(var i=0;i<(Number(item.star)+0.5);i++){
                        if(i == (Number(item.star)+0.5)-1){
                            starList.splice(i,1,"star2");
                        }else{
                            starList.splice(i,1,"star3");
                        }
                    }
                }
                angular.extend(item,item,{
                    starList:starList
                })
            });
            $scope.masterComment =$scope.masterComment?$scope.masterComment.concat(res.data):res.data;
            $scope.isLoad = page >= res.paging.numberOfPage?false:true;
            $scope.loadText =$scope.isLoad?"显示更多":"没有更多了";
        })
    };

    viewMasterCL(page,pageSize);
    $scope.loadingFn = function () {
        if($scope.isLoad){
            page += 1;
            $scope.loadText = "加载中...";
            viewMasterCL(page,pageSize);
        }
    }
}]);
app.controller("canclepayCtrl",['$scope','$rootScope','$location','ajaxServer','payment','alertReset',function($scope,$rootScope,$location,ajaxServer,payment,alertReset){
    var id = $location.search().id;
    ajaxServer.ajaxed("/api/order/orderDetail",{order_id:id},function(res){
        if(res.data.status == "6"){
            history.back();
        }
    });
    $scope.sendAndPay = function(){
        var is_user = angular.element('input:radio[name="defaultAdr"]:checked').val(),
            content = $scope.content;
        if(is_user && content){
            ajaxServer.ajaxed("/api/user/orderCancel",{order_id:id,status:is_user,content:content},function(res){
                payment.start(res.data.appId,res.data.timeStamp,res.data.nonceStr,res.data.package,res.data.signType,res.data.paySign,function (payRes){
                    if(payRes.err_msg == "get_brand_wcpay_request:ok" ) {// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                        $location.url("/bespokeOrder?id="+id);
                        $scope.$apply();
                    }else if(payRes.err_msg == "get_brand_wcpay_request:fail" ){
                        alertReset.alert(payRes.err_desc);
                    }else if(payRes.err_msg == "get_brand_wcpay_request:cancel"){
                        alertReset.alert("你已经取消支付");
                    }
                });
            })
        }else{
            alertReset.alert("请填写完整");
        }
    }
}]);
app.controller("paywayCtrl",['$scope','$location','ajaxServer','payment','alertReset','hint',function($scope,$location,ajaxServer,payment,alertReset,hint){
    var id = $location.search().id;
    $scope.pay_text = "确认并进行支付";
    $scope.repair_gold = 0;
    ajaxServer.ajaxed("/api/order/orderDetail",{order_id:id},function(res){
        if(res.data.ispay == "1"){
            history.back();
        }
       $scope.order_total_price = Number(res.data.labour_fee) + Number(res.data.material_fee);
    });
    ajaxServer.ajaxed("/api/user/detail",{},function (res) {
        $scope.repairGoldTold = res.data.repair_gold;
    });
    angular.element("input[type='checkbox']").click(function () {
        if(angular.element(this).is(":checked")){
            angular.element(this).siblings("i").removeClass('address_defaultBtn').addClass("pay_defaultBtn");
            angular.element('input:radio[name="pay_type"][value="2"]').prop("checked",true);
            angular.element('input:radio[name="pay_type"]:eq(0)').siblings("i").removeClass('address_defaultBtn').addClass("select_address_defaultBtn");
            angular.element('input:radio[name="pay_type"]:eq(1)').siblings("i").addClass("address_defaultBtn").removeClass("select_address_defaultBtn");
        }else{
            angular.element(this).siblings("i").addClass("address_defaultBtn").removeClass("pay_defaultBtn");
        }
        if(angular.element("#wx_gold").is(":checked")){
            angular.element("#put_gold").attr("disabled",false);
        }else{
            angular.element("#put_gold").attr("disabled",true);
            $scope.repair_gold = 0;
            $scope.$apply();
        }
    });
    var is_pay = false;
    $scope.pay = function () {
        if(is_pay){
            return false;
        }
        $scope.pay_text = "支付中...";
        is_pay = true;
        var pay_type = angular.element('input:radio[name="pay_type"]:checked').val(),
            repair_gold = $scope.repair_gold;
        if(pay_type == "2"){
            if(angular.element("#wx_gold").is(":checked") && angular.element("#wx_line").is(":checked")){
                if(repair_gold != null){
                    ajaxServer.ajaxed("/api/order/userPay",{order_id:id,payment:2,repair_gold:repair_gold},function (response) {
                        is_pay = false;
                        $scope.pay_text = "确认并进行支付";
                        if(response.status.msg == "支付完成"){
                            hint.hint("支付成功！",function () {
                                setTimeout(function () {
                                    angular.element(".hint_wrap").remove();
                                    $location.url("/bespokeOrder?id="+id);
                                    $scope.$apply();
                                },1000);
                            });
                        }else if(response.data.appId){
                            payment.start(response.data.appId,response.data.timeStamp,response.data.nonceStr,response.data.package,response.data.signType,response.data.paySign,function (payRes){
                                if(payRes.err_msg == "get_brand_wcpay_request:ok" ) {// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                                    $location.url("/bespokeOrder?id="+id);
                                    $scope.$apply();
                                 }else if(payRes.err_msg == "get_brand_wcpay_request:fail" ){
                                    alertReset.alert(payRes.err_desc);
                                 }else if(payRes.err_msg == "get_brand_wcpay_request:cancel"){
                                    alertReset.alert("你已经取消支付");
                                 }
                            });
                        }else{
                            alertReset.alert(response.data.err_code_des);
                        }
                    })
                }else{
                    is_pay = false;
                    $scope.pay_text = "确认并进行支付";
                    alertReset.alert("请输入正确的维修币");
                }
            }else if(angular.element("#wx_line").is(":checked")){
                ajaxServer.ajaxed("/api/order/userPay",{order_id:id,payment:2},function (response) {
                    is_pay = false;
                    $scope.pay_text = "确认并进行支付";
                    if(response.data.appId){
                        payment.start(response.data.appId,response.data.timeStamp,response.data.nonceStr,response.data.package,response.data.signType,response.data.paySign,function (payRes){
                            if(payRes.err_msg == "get_brand_wcpay_request:ok" ) {// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                                $location.url("/bespokeOrder?id="+id);
                                $scope.$apply();
                            }else if(payRes.err_msg == "get_brand_wcpay_request:fail" ){
                                alertReset.alert(payRes.err_desc);
                            }else if(payRes.err_msg == "get_brand_wcpay_request:cancel"){
                                alertReset.alert("你已经取消支付");
                            }
                        });
                    }else{
                        alertReset.alert(response.data.err_code_des);
                    }
                })
            }else if(angular.element("#wx_gold").is(":checked")){
                if(repair_gold != null){
                    if(repair_gold < $scope.order_total_price){
                        is_pay = false;
                        $scope.pay_text = "确认并进行支付";
                        alertReset.alert("您输入的维修币不足，请使用微信在线支付");
                    }else{
                        ajaxServer.ajaxed("/api/order/userPay",{order_id:id,payment:2,repair_gold:repair_gold},function (response) {
                            hint.hint("支付成功！",function () {
                                setTimeout(function () {
                                    angular.element(".hint_wrap").remove();
                                    $location.url("/bespokeOrder?id="+id);
                                    $scope.$apply();
                                },1000);
                            });
                        })
                    }
                }else{
                    is_pay = false;
                    $scope.pay_text = "确认并进行支付";
                    alertReset.alert("请输入正确的维修币");
                }
            }else{
                is_pay = false;
                $scope.pay_text = "确认并进行支付";
                alertReset.alert("请选择微信支付方式");
            }
        }else if(pay_type == "0"){
            ajaxServer.ajaxed("/api/order/userPay",{order_id:id,payment:0},function (res) {
                is_pay = false;
                $location.url("/bespokeOrder?id="+id);
                $scope.$apply();
            })
        }else{
            is_pay = false;
            $scope.pay_text = "确认并进行支付";
            alertReset.alert("请选择支付方式");
        }
    };
    $scope.changeInputGold = function(){
        var repairGoldTold = Number($scope.repairGoldTold),
            order_total_price = Number($scope.order_total_price),
            input_gold;
        if($scope.repair_gold){
            if(Number($scope.repair_gold).toString().split(".").length != 1){
                input_gold = $scope.repair_gold && $scope.repair_gold.toString().split(".")[1].length > 2?Number($scope.repair_gold.toString().match(/\d+(\.\d{0,2})?/)[0]):$scope.repair_gold;
            }else {
                input_gold = $scope.repair_gold;
            }
        }else{
            input_gold = $scope.repair_gold;
        }
        if(order_total_price > repairGoldTold){
            $scope.repair_gold = input_gold>repairGoldTold?repairGoldTold:input_gold;
            //alert("余额不足");
        }else{
            $scope.repair_gold = input_gold>order_total_price?order_total_price:input_gold;
            //alert("超过支付金额");
        }
    }
}]);
app.controller("orderevaluateCtrl",['$scope','$rootScope','$location','fileAjax','ajaxServer',function($scope,$rootScope,$location,fileAjax,ajaxServer){
    $scope.numImg = 3;
    $scope.send_text = "发表评价";
    var id = $location.search().id;
    var is_send = false;
    ajaxServer.ajaxed("/api/order/orderDetail",{order_id:id},function(res){
        if(res.data.comment.length != 0){
            history.back();
        }
        $scope.head = res.data.master.head ? res.data.master.head : "/weixin/images/tx1.png";
    });
    $scope.SendService = function () {
        if(is_send){
            return false;
        }
        is_send = true;
        $scope.send_text = "发表中...";
        var  content = $scope.content,
            star = angular.element(".star_score").attr("star-score");
        angular.element(".img_content ul li").each(function (index,item) {
            if(angular.element(item).css("display") == "none"){
                angular.element(item).remove();
            }
        });
        var  load =  fileAjax.ajaxFiled("/api/order/orderComment",{
            order_id:id,
            content:content,
            star:star
        },function(res){
            $location.url("/bespokeOrder?id="+id);
            $scope.$apply();
        },function (res) {
            is_send = false;
            $scope.send_text = "发表评价";
            $scope.$apply();
        });
        angular.element("#orderevaluate").ajaxSubmit(load);
    }
}]);
app.controller("myinfoCtrl",['$scope','$rootScope','ajaxServer',function($scope,$rootScope,ajaxServer){
    ajaxServer.ajaxed("/api/user/detail",{},function(res){
        angular.extend(res.data,res.data,{
            head:res.data.head == ""?"/weixin/images/tx1.png":res.data.head
        });
        $scope.userInfo = res.data;
        // console.log($scope.userInfo);
    });
}]);

app.controller("bindphoneCtrl",['$scope','$rootScope','$location','$interval','ajaxServer','alertReset',function($scope,$rootScope,$location,$interval,ajaxServer,alertReset){
     $scope.verifiticationCode = "获取验证码";
     $scope.button_disabled = true;
     var time = 0;
     $scope.time_out = function(){
         var phone = $scope.phone;
         if(!phone){
             alertReset.alert("请输入手机号!");
             return false;
         }
      time =60;
      $scope.button_disabled = true;
      $interval(function(){
        if (time <= 0) {
          $scope.button_disabled = false;
          $scope.verifiticationCode = "重新获取";
          return;
        }
        time--;
        $scope.verifiticationCode = "剩" + time + "秒";
      }, 1000);
        ajaxServer.ajaxed("/api/user/getCode",{phone:phone},function (res) {
            console.log(res.data);
        });
    };
    $scope.bindPhone = function () {
        var code = $scope.captcha,
            phone = $scope.phone;
        if(!(code || phone)){
            alertReset.alert("请输入手机号或验证码!");
            return false;
        }
        ajaxServer.ajaxed("/api/user/editBindPhone",{phone:phone,code:code},function (res) {
            console.log(res.data);
            $location.path("/myinfo");
        })
    }
}]);
app.controller("restmyinfoCtrl",['$scope','$rootScope','ajaxServer','$location','alertReset',function($scope,$rootScope,ajaxServer,$location,alertReset){
    ajaxServer.ajaxed("/api/user/detail",{},function(res){
        $scope.nickName = res.data.nickname;
        $scope.gender = res.data.gender;
        $scope.age = res.data.age;
    });
    $scope.updateInfo = function () {
        var nickname = $scope.nickName,
            gender = $scope.gender,
            age = $scope.age;
        if(nickname || gender || age){
            ajaxServer.ajaxed('/api/user/editInfo',{nickname:nickname,gender:gender,age:age},function (res) {
                history.back();
            })
        }else{
            alertReset.alert("请输入完整!");
        }
    }
}]);
app.controller("spendorderCtrl",['$scope','$rootScope','ajaxServer','timestamp',function($scope,$rootScope,ajaxServer,timestamp){
    var page = 1,pageSize = 20;
    var orderSpendFn = function () {
        ajaxServer.ajaxed("/api/user/orderSpending",{page:page,pageSize:pageSize},function (res) {
            if(res.data.length != 0){
                res.data.forEach(function (item) {
                    angular.extend(item,item,{
                        createtime:timestamp.format(Number(item.createtime)*1000,4),
                        timeHoure:timestamp.format(Number(item.createtime)*1000,5),
                        fee:"¥"+item.fee
                    })
                });
                $scope.noData = false;
                $scope.isLoadDisplay = true;
                $scope.orderSpendList =$scope.orderSpendList?$scope.orderSpendList.concat(res.data):res.data;
                $scope.isLoad = page >= res.paging.numberOfPage?false:true;
                $scope.loadText =$scope.isLoad?"显示更多":"没有更多了";
            }else{
                $scope.noData = true;
                $scope.isLoadDisplay = false;
            }
        });
    };
    orderSpendFn(page,pageSize);
    $scope.loadingFn = function () {
        if($scope.isLoad){
            page += 1;
            $scope.loadText = "加载中...";
            orderSpendFn(page,pageSize);
        }
    }
}]);
app.controller("mywxcodeCtrl",['$scope','$rootScope','ajaxServer','timestamp',function($scope,$rootScope,ajaxServer,timestamp){
    var page = 1,pageSize=20;
    ajaxServer.ajaxed("/api/user/detail",{},function(res){
        $scope.repairCode = res.data.repair_gold;
    });
    var repairGoldFn = function (page,pageSize) {
        ajaxServer.ajaxed("/api/user/repairGoldDetail",{page:page,pageSize:pageSize},function (res) {
            if(res.data.length != 0){
                res.data.forEach(function (item) {
                    angular.extend(item,item,{
                        priceStyle:item.type == 0?"fsr":"fch",
                        repair_gold:item.type == 0?"+"+item.repair_gold:"-"+item.repair_gold,
                        title:item.order_id+"-"+item.title,
                        codeType:item.type==0?"收入":"支出",
                        createtime:timestamp.format(Number(item.createtime)*1000)
                    })
                });
                $scope.noData = false;
                $scope.isLoadDisplay = true;
                $scope.buyCodeUseList =$scope.buyCodeUseList?$scope.buyCodeUseList.concat(res.data):res.data;
                $scope.isLoad = page >= res.paging.numberOfPage?false:true;
                $scope.loadText =$scope.isLoad?"显示更多":"没有更多了";
            }else{
                $scope.noData = true;
                $scope.isLoadDisplay = false;
            }
        });
    };
    repairGoldFn(page,pageSize);
    $scope.loadingFn = function () {
        if($scope.isLoad){
            page += 1;
            $scope.loadText = "加载中...";
            repairGoldFn(page,pageSize);
        }
    }
}]);
app.controller("buycodeCtrl",['$scope','$rootScope','ajaxServer','timestamp',function($scope,$rootScope,ajaxServer,timestamp){
    ajaxServer.ajaxed("/api/user/packageList",{},function (res) {
        if(res.data.length != 0){
            res.data.forEach(function (item) {
               angular.extend(item,item,{
                   start:timestamp.format(Number(item.start)*1000,3),
                   end:timestamp.format(Number(item.end)*1000,3),
                   logo:item.logo == ""?"/weixin/images/QQb.png":item.logo
               })
            });
            $scope.buyCodeList = res.data;
            $scope.noData = false;
        }else{
            $scope.noData = true;
        }
    });
    /*$scope.buyCode = function () {
        ajaxServer.ajaxed("/api/order/userPay",{payment:2,})
    }*/

}]);
app.controller("gmcodeCtrl",['$scope','$rootScope','ajaxServer','$location','payment','alertReset',function($scope,$rootScope,ajaxServer,$location,payment,alertReset){
    var id = $location.search().id;
    ajaxServer.ajaxed("/api/user/packageDetail",{package_id:id},function(res){
        $scope.packageDetail = res.data;
    });
    $scope.buyCode = function(){
        ajaxServer.ajaxed("/api/user/buyRepairGold",{package_id:id},function(res){
            payment.start(res.data.appId,res.data.timeStamp,res.data.nonceStr,res.data.package,res.data.signType,res.data.paySign,function (payRes){
                if(payRes.err_msg == "get_brand_wcpay_request:ok" ) {// 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                    alertReset.alert("购买成功");
                    history.back();
                }else if(payRes.err_msg == "get_brand_wcpay_request:fail" ){
                    alertReset.alert(payRes.err_desc);
                }else if(payRes.err_msg == "get_brand_wcpay_request:cancel"){
                    alertReset.alert("你已经取消支付");
                }
            });
        });
    }
}]);
app.controller("userCenterCtrl",['$scope','$rootScope','ajaxServer',function($scope,$rootScope,ajaxServer){
    ajaxServer.ajaxed("/api/user/detail",{},function(res){
        angular.extend(res.data,res.data,{
            head:res.data.head == ""?"/weixin/images/header.png":res.data.head
        });
        sessionStorage.head = JSON.stringify(res.data);
        $scope.userInfo = res.data;
    });
}]);
app.controller("moreCtrl",['$scope','$rootScope','$route','ajaxServer',function($scope,$rootScope,$route,ajaxServer){
     ajaxServer.ajaxed("/api/home/setting",{},function(res){
         /*var moreList = res.data.filter(function (item) {
            return (item.key == "about" || item.key == "contact" || item.key == "laws" || item.key == "400")
         });*/
         res.data.forEach(function (item) {
             if(item.key == "about"){
                 $scope.about = item;
             }else if(item.key == "contact"){
                 $scope.contact = item;
             }else if(item.key == "laws"){
                 $scope.law = item;
             }else if(item.key == "400"){
                 $scope.tel = item;
                 sessionStorage.serviceTel = item.content;
             }
         });
     })
}]);
app.controller("myserviceCtrl",['$scope','$rootScope','ajaxServer',function($scope,$rootScope,ajaxServer){
    var page = 1,pageSize = 20;
    var userCommentFn = function (page,pageSize) {
        ajaxServer.ajaxed("/api/order/userCommentLists",{page:page,pageSize:pageSize},function (res) {
            if(res.data.length != 0){
                $scope.length = res.paging.totalCount;
                $scope.head = JSON.parse(sessionStorage.head);
                angular.extend($scope.head,$scope.head,{
                    head:$scope.head.head == ""?"/weixin/images/tx1.png":$scope.head.head
                });
                res.data.forEach(function(item){
                    var starList = ['star1','star1','star1','star1','star1'];
                    if(Number(item.star)%1 === 0){
                        for(var i=0;i<Number(item.star);i++){
                            starList.splice(i,1,"star3");
                        }
                    }else{
                        for(var i=0;i<(Number(item.star)+0.5);i++){
                            if(i == (Number(item.star)+0.5)-1){
                                starList.splice(i,1,"star2");
                            }else{
                                starList.splice(i,1,"star3");
                            }
                        }
                    }
                    angular.extend(item,item,{
                        starList:starList
                    });
                });
                $scope.noData = false;
                $scope.isLoadDisplay = true;
                $scope.lists =$scope.lists?$scope.lists.concat(res.data):res.data;
                $scope.isLoad = page >= res.paging.numberOfPage?false:true;
                $scope.loadText =$scope.isLoad?"显示更多":"没有更多了";
            }else{
                $scope.noData = true;
                $scope.length = 0;
                $scope.isLoadDisplay = false;
                $scope.head = JSON.parse(sessionStorage.head);
            }
        })
    };
    userCommentFn(page,pageSize);
    $scope.loadingFn = function () {
        if($scope.isLoad){
            page += 1;
            $scope.loadText = "加载中...";
            userCommentFn(page,pageSize);
        }
    }
}]);
app.controller("messagecenterCtrl",['$scope','$rootScope','ajaxServer','timestamp',function($scope,$rootScope,ajaxServer,timestamp){
    var page = 1,pageSize = 20;
    var messageListFn = function (page,pageSize) {
        ajaxServer.ajaxed("/api/message/messageLists",{page:page,pageSize:pageSize},function(res){
            if(res.data.length != 0){
                res.data.forEach(function(item){
                    angular.extend(item,item,{
                        createtime:timestamp.format(Number(item.createtime)*1000,2),
                        is_new:item.is_new == 1 ? true:false
                    })
                });
                $scope.noData = false;
                $scope.isLoadDisplay = true;
                $scope.messageList =$scope.messageList?$scope.messageList.concat(res.data):res.data;
                $scope.isLoad = page >= res.paging.numberOfPage?false:true;
                $scope.loadText =$scope.isLoad?"显示更多":"没有更多了";
            }else{
                $scope.noData = true;
                $scope.isLoadDisplay = false;
            }
        });
    };
    messageListFn(page,pageSize);
    $scope.isNew = function(){
        var id = this.item.id,
            is_new = this.item.is_new;
        if(is_new){
            ajaxServer.ajaxed("/api/message/setNewStatus",{msg_id:id},function(res){});
        }
    };
    $scope.loadingFn = function () {
        if($scope.isLoad){
            page += 1;
            $scope.loadText = "加载中...";
            messageListFn(page,pageSize);
        }
    }
}]);
app.controller("messcendetailCtrl",['$scope','$location','ajaxServer','timestamp','confirmReset',function($scope,$location,ajaxServer,timestamp,confirmReset){
    var id = $location.search().id;
    ajaxServer.ajaxed("/api/message/detail",{msg_id:id},function (res) {
        angular.extend(res.data,res.data,{
            createtime:timestamp.format(Number(res.data.createtime)*1000,2)
        });
        $scope.messageDetail = res.data;
    });
    $scope.deleteMessage = function () {
        confirmReset.confirm("是否删除?",function(){
            ajaxServer.ajaxed("/api/message/deleteMessage",{msg_id:id},function (res) {
                history.back();
            })
        })
    }
}]);
app.controller("myorderCtrl",['$scope','$rootScope','$route','ajaxServer','timestamp',function($scope,$rootScope,$route,ajaxServer,timestamp){
    var page = 1,pageSize = 20;
    var orderListFn = function (index,page,pageSize) {
        ajaxServer.ajaxed("/api/order/userOrderList",{type:index,page:page,pageSize:pageSize},function(res){
            if(res.data.length == 0){
                $scope.noData = true;
                $scope.isLoadDisplay = false;
                $scope.array_a = "";
                return false;
            }
            var array_a = [];
            var status;
            res.data.forEach(function(item){
                switch (item.status){
                    case "0": status = "预约中";break;
                    case "1": status = "已预约";break;
                    case "2": status = "检测中";break;
                    case "3": status = "待支付";break;
                    case "4": status = "待评价";break;
                    case "5": status = "已完成";break;
                    case "6": status = "已取消";break;
                    case "7": status = "待支付";break;
                }
                angular.extend(item,item,{
                    status:status,
                    createtime:timestamp.format((item.createtime) * 1000),
                    time:timestamp.format((item.time) * 1000),
                    order_btn_display:item.status
                });
                array_a.push(item);
            });
            $scope.array_a =$scope.array_a?$scope.array_a.concat(array_a):array_a;
            $scope.noData = false;
            $scope.isLoadDisplay = true;
            $scope.isLoad = page >= res.paging.numberOfPage?false:true;
            $scope.loadText =$scope.isLoad?"显示更多":"没有更多了";
        });
    };
    orderListFn("1",page,pageSize);
    $scope.selecTabIndex = 1;
    var selfIndex = "1";
    $scope.changeTab =function(index){
        $scope.isLoadDisplay = false;
        page = 1;
        $scope.noData = false;
        $scope.array_a = [];
        selfIndex = index;
        $scope.selecTabIndex = Number(index);
        orderListFn(index.toString(),page,pageSize);
    };
    $scope.loadingFn = function () {
        if($scope.isLoad){
            page += 1;
            $scope.loadText = "加载中...";
            orderListFn(selfIndex,page,pageSize);
        }
    }
}]);
app.controller("addUsCtrl",['$scope','$rootScope','$route','ajaxServer','$location','$interval','alertReset',function($scope,$rootScope,$route,ajaxServer,$location,$interval,alertReset){
    
    $scope.verifiticationCode = "获取验证码";
     $scope.button_disabled = true;
     var time = 0;
     $scope.time_out = function(){
         var phone = $scope.phone;
         if(!phone){
             alertReset.alert("请输入手机号!");
             return false;
         }
      if($scope.button_disabled){
          time =60;
          $scope.button_disabled = false;
          var timer = $interval(function(){
              if (time <= 0) {
                  $scope.button_disabled = true;
                  $scope.verifiticationCode = "重新获取";
                  $interval.cancel(timer);
                  return;
              }
              time--;
              $scope.verifiticationCode = "剩" + time + "秒";
          }, 1000);
          ajaxServer.ajaxed("/api/user/masterGetcode",{phone:phone},function (res) {
              console.log(res.data);
          });
      }
    };
    $scope.join = function () {
        var code = $scope.captcha,
            phone = $scope.phone;
        if(!(code || phone)){
            alertReset.alert("请输入手机号或验证码!");
            return false;
        }
        ajaxServer.ajaxed("/api/user/masterEnter",{phone:phone,code:code},function (res) {
            if(res.data.data.is_audit == '0'){
                sessionStorage.phone_apply = phone;
                $location.url("/addApply");
            }else{
                $location.url("/masterDetail?uid="+res.data.data.uid);
            }
        })
    }
}]);
app.controller("masterDetailCtrl",['$scope','$location','ajaxServer','timestamp',function($scope,$location,ajaxServer,timestamp){
    angular.element(".add_apply_ul").on("click",".add_apply_type h4",function () {
        if(angular.element(this).siblings(".add_apply_type_list").height() == 0){
            angular.element(".add_apply_type_list").css("height","0");
            angular.element(this).siblings(".add_apply_type_list").css("height","auto");
        }else{
            angular.element(this).siblings(".add_apply_type_list").css("height","0");
        }
    });
    var id = $location.search().uid,phone = "";
    ajaxServer.ajaxed("/api/user/category",{},function(res_category){
        ajaxServer.ajaxed("/api/user/masterDetail",{master_id:id},function (res) {
            phone = res.data.phone;
            var is_audit = '',time_detail;
            switch (res.data.is_audit){
                case "0":is_audit = "未认证";time_detail = "提交时间:"+timestamp.format(Number(res.data.createtime)*1000);break;
                case "1":is_audit = "认证中";time_detail = "提交时间:"+timestamp.format(Number(res.data.createtime)*1000);break;
                case "2":is_audit = "认证成功";time_detail = "审核时间:"+timestamp.format(Number(res.data.auth_time)*1000);break;
                case "-1":is_audit = "认证失败";time_detail = "审核时间:"+timestamp.format(Number(res.data.auth_time)*1000);$scope.is_defailt = true;break;
            }
            var serviceArray = [];
            res.data.servie_type_ids.forEach(function(item,index){
                var serviceObj = {},serviceTwo = [];
                if(item.id == res_category.data[index].id){
                    serviceObj.id = item.id;
                    serviceObj.name = res_category.data[index].name;
                    item.ids.forEach(function(option,num){
                        var serviceTwoObj = {};
                        if(option == res_category.data[index].list[num].id){
                            serviceTwoObj.id = option;
                            serviceTwoObj.name = res_category.data[index].list[num].name;
                        }
                        serviceTwo.push(serviceTwoObj);
                    });
                    serviceObj.list = serviceTwo;
                }
                serviceArray.push(serviceObj);
            });
            angular.extend(res.data,res.data,{
                is_audit:is_audit,
                serviceArray:serviceArray,
                time_detail:time_detail
            });
            $scope.masterDetail = res.data;
        })
    });
    $scope.setApplyPhone = function () {
        sessionStorage.phone_apply = phone;
    }
}]);
app.controller("addApplyCtrl",['$scope','$location','fileAjax','ajaxServer','alertReset',function($scope,$location,fileAjax,ajaxServer,alertReset){
    angular.element(".add_apply_ul").on("click",".add_apply_type h4",function () {
        if(angular.element(this).siblings(".add_apply_type_list").height() == 0){
            angular.element(".add_apply_type_list").css("height","0");
            angular.element(this).siblings(".add_apply_type_list").css("height","auto");
        }else{
            angular.element(this).siblings(".add_apply_type_list").css("height","0");
        }
    });
    ajaxServer.ajaxed("/api/user/category",{},function(res){
       $scope.categoryList = res.data;
    });
    var cityList = null;
    ajaxServer.ajaxed("/api/home/city",{},function(res){
       $scope.cityList = res.data;
        cityList = res.data;
        res.data.forEach(function (item) {
            if(item.id == sessionStorage.selfCityId){
                $scope.selftCite_list = item.list;
                $scope.selfRegion_id = item.list[0].id;
                return true;
            }
        });
    });
    $scope.selfCity_id = sessionStorage.selfCityId;
    $scope.selectCity = function () {
        $scope.cityList.forEach(function (item) {
            if(item.id == $scope.selfCity_id){
                $scope.selftCite_list = item.list;
                $scope.selfRegion_id = item.list[0].id;
            }
        });
    };
    var lat_lng;
    if(sessionStorage.position_lat_lng){
        lat_lng = JSON.parse(sessionStorage.position_lat_lng);
        $scope.address = lat_lng.position_title;
    }else{
        lat_lng = JSON.parse(sessionStorage.lat_lng);
        $scope.address = sessionStorage.addressDetails;
    }
    angular.element(".add_apply_type").on("click",".add_apply_type_list span",function(){
        if(angular.element(this).is(".select_server_apply")){
            angular.element(this).removeClass("select_server_apply");
        }else{
            angular.element(this).addClass("select_server_apply");
        }
    });
    $scope.displaySitus = function () {
        angular.element(".add_apply_situs").css("display","block");
        $scope.search_val = "";
    };
    $scope.masterSubmit = function () {
        var categoryList = [];
        angular.element(".add_apply_type_row").each(function(index,item){
            var categoryOpt = [],categoryFirst = "";
            angular.element(item).find(".select_server_apply").each(function(index,item){
                categoryFirst = angular.element(item).parent().attr("data-id");
                categoryOpt.push(angular.element(item).attr("data-id"));
            });
            if(categoryOpt.length != 0){
                var categoryStr = categoryFirst + "_" + categoryOpt.join(",");
                categoryList.push(categoryStr);

            }
        });
        var isImg = true;
        angular.element(".add_apply_photo div").each(function(index,item){
            if(angular.element(item).find("input").val() == ''){
                isImg = false;
                return false;
            }
        });
        var phone = sessionStorage.phone_apply,
            realname = $scope.realname,
            card_number = $scope.card_number,
            servie_type_ids = categoryList.join("-"),
            city_id = $scope.selfCity_id,
            districtid = $scope.selfRegion_id,
            address = sessionStorage.position_lat_lng?JSON.parse(sessionStorage.position_lat_lng).position_title:sessionStorage.addressDetails,
            lat = lat_lng.lat,
            lng = lat_lng.lng;
        if(realname || card_number || isImg){
            var option_v = fileAjax.ajaxFiled("/api/user/masterAuth",{
                phone:phone,
                realname:realname,
                card_number:card_number,
                servie_type_ids:servie_type_ids,
                city_id:city_id,
                districtid:districtid,
                address:address,
                lat:lat,
                lng:lng
            },function(res){
                alertReset.alert(res.status.msg);
                $location.url("/masterDetail?uid="+res.data.uid);
                $scope.$apply();
            });
            angular.element("#addMaster").ajaxSubmit(option_v);
        }else{
            alertReset.alert("请填写完整!");
        }
    };
    //situs html js
    // 百度地图API功能
    var selfCityName = sessionStorage.selfCityName;
    var options = {
        onSearchComplete: function(results){
            // 判断状态是否正确
            if (local.getStatus() == BMAP_STATUS_SUCCESS){
                var s = [];
                for (var i = 0; i < results.getCurrentNumPois(); i ++){
                    var position = {};
                    position.title = results.getPoi(i).title;
                    position.address = results.getPoi(i).address ? results.getPoi(i).address :"";
                    position.point = results.getPoi(i).point;
                    s.push(position);
                }
                var situsList = '';
                s.forEach(function (item) {
                    situsList += '<a href="jacascript:;" lat="' +
                        item.point.lat +'" lng="'+
                        item.point.lng +'"><h2>' +
                        item.title +'</h2><p>' +
                        item.address +'</p></a>';
                });
                angular.element(".situs_wrap").empty();
                angular.element(".situs_wrap").append(situsList);
            }else{
                angular.element(".situs_wrap").empty();
                angular.element(".situs_wrap").append("<h2>暂无搜索内容或者搜索内容超出选择区域</h2>");
            }
        }
    };
    var local = new BMap.LocalSearch(selfCityName, options);
    $scope.searchBtn = function () {
        var str = $scope.search_val;
        local.search(str);
    };
    $scope.backBtn = function () {
        angular.element(".add_apply_situs").css("display","none");
    };
    angular.element(".situs_wrap").on("click","a",function () {
        var position_lat_lng = {};
        position_lat_lng.lat = angular.element(this).attr("lat");
        position_lat_lng.lng = angular.element(this).attr("lng");
        position_lat_lng.position_title = angular.element(this).find("h2").text();
        sessionStorage.position_lat_lng =  JSON.stringify(position_lat_lng);
        $scope.address = angular.element(this).find("h2").text();
        $scope.$apply();
        angular.element(".add_apply_situs").css("display","none");
    });
    $scope.cancelSearch = function () {
        $scope.search_val = "";
        angular.element("#suggestId").focus();
    }
}]);
app.controller("opinionCtrl",['$scope','$rootScope','ajaxServer','hint','alertReset',function($scope,$rootScope,ajaxServer,hint,alertReset){
 $scope.number =500;
 $scope.content ="";
 $scope.disabled = false;
 $scope.number = function(){
      return  500-$scope.content.length;
 };
 $scope.submit = function(){
    var title = $scope.title,
        content = $scope.content;
     if(title || content){
         ajaxServer.ajaxed("/api/user/feedback",{title:title,content:content},function(res){
             $scope.title = "";
             $scope.content = "";
             hint.hint("您的反馈我们已收到，我们会竭尽处理",function () {
                 setTimeout(function () {
                     angular.element(".hint_wrap").remove();
                     history.back();
                 },1000);
             });
         });
     }else{
         alertReset.alert("反馈标题和内容必须输入!");
     }
 }
}]);