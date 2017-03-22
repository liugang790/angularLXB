'use strict';
app.directive("banner",function(){
    return {
        link:function(scope,elem){
            var mySwiper = new Swiper ('.swiper-container', {
                direction: 'horizontal',
                loop: false,
                // 如果需要分页器
                pagination: '.swiper-pagination',
                autoplay:2000,
                observer: true,//修改swiper自己或子元素时，自动初始化swiper
                observeParents: true//修改swiper的父元素时，自动初始化swiper
            });
        }
    }
});
app.directive("serviceLeft",function(){
    return {
        link:function(scope,elem){
            var mySwiper = new Swiper('.swiper-container', {
                direction: 'vertical',
                slidesPerView : "auto",
                observer: true,//修改swiper自己或子元素时，自动初始化swiper
                observeParents: true//修改swiper的父元素时，自动初始化swiper
            });
            // angular.element(".swiper-wrapper .swiper-slide").eq(0).addClass("active");
            angular.element(".swiper-wrapper").on("click",".swiper-slide",function(){
                angular.element(this).addClass("active").siblings().removeClass("active");
            });
            angular.element(".swiper-wrapper").find(".swiper-slide").eq(0).addClass("active");
        }
    }
});
app.directive('stringHtml' , function(){
    return function(scope , el , attr){
        if(attr.stringHtml){
            scope.$watch(attr.stringHtml , function(html){
                el.html(html || '');//更新html内容
            });
        }
    };
});
app.directive("selectTime",function(){
    return {
        link:function(scope,elem,attr){
            var date = new Date();
            var month = date.getMonth()+1,
                day = date.getDate(),
                year = date.getFullYear(),
                monHead = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], //每月的天数
                timeHead = [9.00,9.30,10.00,10.30,11.00,11.30,12.00,12.30,13.00,13.30,14.00,14.30,15.00,15.30,16.00,16.30,17.00,17.30,18.00,18.30,19.00,19.30,20.00,20.30,21.00],
                timeHeaded = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00"],
                dayList = [],
                dayDoc = '';
            if(year%100 == 0){
                monHead[1] = year%400 == 0?29:28;
            }else{
                monHead[1] = year%4 == 0?29:28;
            }
            if(monHead[month-1]-day>=4){
                dayList = [month+"."+day,month+"."+(day+1),month+"."+(day+2),month+"."+(day+3),month+"."+(day+4)];
            }else{
                switch (monHead[month-1]-day){
                    case 0:dayList = [month+"."+day,(month+1)+"."+1,month+"."+2,month+"."+3,month+"."+4];break;
                    case 1:dayList = [month+"."+day,month+"."+(day+1),(month+1)+"."+1,(month+1)+"."+2,(month+1)+"."+3];break;
                    case 2:dayList = [month+"."+day,month+"."+(day+1),month+"."+(day+2),(month+1)+"."+1,(month+1)+"."+2];break;
                    case 3:dayList = [month+"."+day,month+"."+(day+1),month+"."+(day+2),month+"."+(day+3),(month+1)+"."+1];break;
                }
            }
            dayList.forEach(function (item,index) {
                switch (index){
                    case 0: dayDoc += '<span date="'+year+'.'+item+'">今日</span>';break;
                    case 1: dayDoc += '<span date="'+year+'.'+item+'">明日</span>';break;
                    case 2: dayDoc += '<span date="'+year+'.'+item+'">后日</span>';break;
                    default : dayDoc += '<span date="'+year+'.'+item+'">'+item+'</span>';break;
                }
            });
            elem.find(".day_list").empty();
            elem.find(".day_list").append(dayDoc);
            elem.find(".day_list").on("click","span",function(){
                var selfDay = angular.element(this).attr("date").split(".")[2],hours = Number(date.getHours()+"."+date.getMinutes());
                var timeListDoc = '';
                if(Number(selfDay) == day){
                    timeHead.forEach(function (item,index) {
                        if(item >= (hours+2)){
                            timeListDoc += '<span>'+timeHeaded[index]+'</span>';
                        }else{
                            timeListDoc += '<time>'+timeHeaded[index]+'</time>'
                        }
                    });
                }else{
                    timeHead.forEach(function (item,index) {
                        timeListDoc += '<span>'+timeHeaded[index]+'</span>';
                    });
                }
                elem.find(".time_list").empty();
                elem.find(".time_list").append(timeListDoc);
                angular.element(this).addClass("active").siblings().removeClass("active");
            });
            elem.find(".time_list").on("click","span",function(){
                angular.element(this).addClass("active").siblings().removeClass("active");
            });
        }
    }
});
app.directive("selectAddress",function(){
    return {
        link:function(scope,elem){
            elem.on("click","input[type='radio']", function () {
                elem.find("input[type='radio']").each(function (index,item) {
                    if(angular.element(item).is(":checked")){
                        angular.element(item).siblings("i").removeClass('address_defaultBtn').addClass("select_address_defaultBtn");
                    }else{
                        angular.element(item).siblings("i").addClass("address_defaultBtn").removeClass("select_address_defaultBtn");
                    }
                })
            });
        }
    }
});
app.directive("selectPayType",function(){
    return {
        link:function(scope,elem){
            elem.on("click","input[type='radio']", function () {
                elem.find("input[type='radio']").each(function (index,item) {
                    if(angular.element(item).is(":checked")){
                        angular.element(item).siblings("i").removeClass('address_defaultBtn').addClass("select_address_defaultBtn");
                    }else{
                        angular.element(item).siblings("i").addClass("address_defaultBtn").removeClass("select_address_defaultBtn");
                    }
                });
                if(angular.element('input:radio[name="pay_type"]:checked').val() == "2"){
                    angular.element("#wx_gold").prop("checked","checked");
                    angular.element("#wx_line").prop("checked","checked");
                    angular.element("#wx_gold,#wx_line").each(function (index,ele) {
                        angular.element(ele).siblings("i").removeClass('address_defaultBtn').addClass("pay_defaultBtn");
                    });
                }else{
                    angular.element("#wx_gold").attr("checked",false);
                    angular.element("#wx_line").attr("checked",false);
                    angular.element("#wx_gold,#wx_line").each(function (index,ele) {
                        angular.element(ele).siblings("i").addClass('address_defaultBtn').removeClass("pay_defaultBtn");
                    });
                }
            });
        }
    }
});
app.directive("popupWrap",['ajaxServer','$rootScope',function(ajaxServer,$rootScope){
    return {
        link:function(scope,elem){
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
                                return (ele.name == addComp.city);
                            });
                            sessionStorage.addressDetails = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
                        })
                    }
                    else {
                        console.error('failed'+this.getStatus());
                    }
                },{enableHighAccuracy: true});
            };
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
    }
}]);
app.directive("addImg",function(){
    return {
        link:function(scope,elem){
            var imgIndex = 0,totalNum = 0;
            angular.element(".add_img_btnRow").click(function(){
                if(!(totalNum<scope.numImg && scope.numImg)){
                    alert("只能上传"+scope.numImg+"张图片");
                    return false;
                }
                var orderAddLi = '<li data-index="'+imgIndex+'"><img src="" class="order_img_'+imgIndex+'" alt="11"><input type="file" name="images_'+imgIndex+'" id="order_input_'+imgIndex+'"></li>';
               angular.element(this).before(orderAddLi);
                angular.element("#order_input_"+imgIndex).click();
                imgIndex ++;
            });
            angular.element(".img_content").on("change","input",function (e) {
                var index = angular.element(this).parent().attr("data-index");
                // var file = e.target.files||e.dataTransfer.files;
                var file = document.getElementById('order_input_'+index).files[0];
                if(!file){
                    angular.element(".order_img_"+ index).parent().remove();
                }else if(file && file.type == "image/jpeg" || file.type == "image/png" || file.type == "image/jpg"){
                    var reader = new FileReader();
                    reader.onload=function(){
                        totalNum++;
                        angular.element(".order_img_"+ index).attr("src",this.result);
                        angular.element(".order_img_"+ index).parent().css("display","block");
                    };
                    reader.readAsDataURL(file);
                    return false;
                }else{
                    elem.find("[data-index='"+(imgIndex-1)+"']").remove();
                    imgIndex --;
                    alert("您上传的图片格式不正确，只能是：jpeg、png、jpg");
                }
            });
        }
    }
});
app.directive("updateNickIcon",['fileAjax',function(fileAjax){
    return {
        link:function(scope,elem){
            elem.on("change","input",function (e) {
                var file = document.getElementById('nickIcon').files[0];
                if(file && file.type == "image/jpeg" || file.type == "image/png" || file.type == "image/jpg"){
                    var reader = new FileReader();
                    reader.onload=function(){
                        var option_v = fileAjax.ajaxFiled("/api/user/editInfo",{},function (res) {
                            elem.find("img").prop("src",res.data.head);
                        });
                        angular.element("#head").ajaxSubmit(option_v);
                    };
                    reader.readAsDataURL(file);
                    return false;
                }else{
                    alert("您上传的图片格式不正确，只能是：jpeg、png、jpg");
                }
            });
        }
    }
}]);
app.directive("applyPhoto",function(){
   return{
       link:function(scope,elem){
           angular.element(".add_apply_photo").on("click","input",function (e) {
               angular.element(this).siblings('img').attr("src","");
           });
           angular.element(".add_apply_photo").on("change","input",function (e) {
               var _self = angular.element(this);
               var index = _self.attr("data-index");
               var file = document.getElementById('apply_photo_'+index).files[0];
               if(file && file.type == "image/jpeg" || file.type == "image/png" || file.type == "image/jpg"){
                   var reader = new FileReader();
                   reader.onload=function(){
                       _self.siblings('img').attr("src",this.result);
                   };
                   reader.readAsDataURL(file);
                   return false;
               }else{
                   alert("您上传的图片格式不正确，只能是：jpeg、png、jpg");
               }
           });
       }
   }
});
app.directive("selectType",function(){
    return {
        link:function(scope,elem){
            elem.find("li:eq(0)").addClass("select_thirty_type");
            elem.on("click","li",function () {
                angular.element(this).parents(".service_details_ul").removeClass("service_details_first");
                angular.element(this).addClass("select_thirty_type").siblings().removeClass("select_thirty_type");
            })
        }
    }
});
app.directive("star",function(){
    return{
        link:function(scope,elem){
            elem.find("i").click(function(){
               var _self = angular.element(this),
                   self_index = _self.attr("index"),
                   self_status = _self.attr("status");
                _self.nextAll("i").each(function(index,item){
                    angular.element(item).removeClass("star2").addClass("star1");
                    angular.element(item).removeClass("star3").addClass("star1");
                });
                _self.prevAll("i").each(function(index,item){
                    angular.element(item).removeClass("star1").addClass("star3");
                    angular.element(item).removeClass("star2").addClass("star3");
                });
                if(self_status == "1"){
                    _self.removeClass("star1").addClass("star2");
                    _self.attr("status","2");
                    _self.parents(".star_score").attr("star-score",(self_index-0.5));
                }else if(self_status == "2"){
                    _self.removeClass("star2").addClass("star3");
                    _self.parents(".star_score").attr("star-score",(self_index));
                    _self.attr("status","3");
                }else if(self_status == "3"){
                    _self.removeClass("star3").addClass("star2");
                    _self.attr("status","2");
                    _self.parents(".star_score").attr("star-score",(self_index-0.5));
                }
            });
        }
    }
});
