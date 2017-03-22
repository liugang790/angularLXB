/**
 * server.js
 */
app.service('ajaxServer',["$http",'remoteApiUrl','$location',function ($http,remoteApiUrl,$location){
    return{
        ajaxed : function (url,data,successBack,errorBack) {
            if(sessionStorage.token && sessionStorage.token != "undefined"){
                data.token = sessionStorage.token;
            }else{
                sessionStorage.token = $location.search().token;
                data.token = $location.search().token;
            }
            $http({
                method:'post',
                timeout:'5000',
                url:remoteApiUrl + url,
                crossDomain: true,
                data:data,
                dataType:"json"
            }).success(function(data){
                angular.element(".loading-message").css("display","none");
                if(data.status.code == 0){
                    return successBack(data);
                }else{
                    if(data.status.code == 10000){
                        alert(data.status.msg);
                    }else if(data.status.code == 10001){
                        alert(data.status.msg);
                    }else if(data.status.code == 10002){
                        alert(data.status.msg);
                    }
                }
            }).error(function(e){
                errorBack = errorBack ? errorBack(e) : "";
                return errorBack;
            })
        }
    }
}]);
app.service('fileAjax',["remoteApiUrl","$location",function (remoteApiUrl,$location) {
    return {
        ajaxFiled : function (url,data,successBack,faillBack,errorBack) {
            if(sessionStorage.token && sessionStorage.token != "undefined"){
                data.token = sessionStorage.token;
            }else{
                sessionStorage.token = $location.search().token;
                data.token = $location.search().token;
            }
            return {
                url:remoteApiUrl + url,
                data:data,
                /*xhrFields : {
                    withCredentials : true
                },*/
                crossDomain: true,
                success:function (data) {
                    if(data.status.code == 0){
                        return successBack(data);
                    }else{
                        if(data.status.code == 10000){
                            alert(data.status.msg);
                        }else if(data.status.code == 10001){
                            alert(data.status.msg);
                        }else if(data.status.code == 10002){
                            alert(data.status.msg);
                        }
                        return faillBack = faillBack ? faillBack(data):"";
                    }
                },
                error:function () {
                    return errorBack = errorBack ? errorBack():"";
                }
            }
        }
    }
}]);

app.service('timestamp',["remoteApiUrl","$location",function (remoteApiUrl,$location) {
    return {
        format : function (timestamp,num) {
            var time = new Date(timestamp);
            var y = time.getFullYear();
            var m = time.getMonth()+1;
            var d = time.getDate();
            var h = time.getHours();
            var mm = time.getMinutes();
            var s = time.getSeconds();
            if(num == 2){
                return y+'/'+this.add(m)+'/'+this.add(d)+' '+this.add(h)+':'+this.add(mm)+':'+this.add(s);
            }else if(num == 3){
                return y+'/'+this.add(m)+'/'+this.add(d);
            }else if(num == 4){
                return this.add(m)+'-'+this.add(d);
            }else if(num == 5){
                return this.add(h)+':'+this.add(mm);
            }else{
                return y+'/'+this.add(m)+'/'+this.add(d)+' '+this.add(h)+':'+this.add(mm);
            }
        },
        add:function (m) {
            return m<10?'0'+m:m;
        }
    }
}]);
app.service('payment',["remoteApiUrl",function (remoteApiUrl) {
    return {
        start:function (appId,timeStamp,nonceStr,package_param,signType,paySign,successBack) {
            if (typeof WeixinJSBridge == "undefined"){
                if( document.addEventListener ){
                    document.addEventListener('WeixinJSBridgeReady', this.onBridgeReady, false);
                }else if (document.attachEvent){
                    document.attachEvent('WeixinJSBridgeReady', this.onBridgeReady);
                    document.attachEvent('onWeixinJSBridgeReady', this.onBridgeReady);
                }
            }else{
                this.onBridgeReady(appId,timeStamp,nonceStr,package_param,signType,paySign,successBack);
            }
        },
        onBridgeReady:function(appId,timeStamp,nonceStr,package_param,signType,paySign,successBack){
            WeixinJSBridge.invoke(
                'getBrandWCPayRequest', {
                    "appId" : appId,     //公众号名称，由商户传入
                    "timeStamp":timeStamp.toString(),         //时间戳，自1970年以来的秒数
                    "nonceStr" : nonceStr, //随机串
                    "package" : package_param,
                    "signType" : signType,         //微信签名方式
                    "paySign" : paySign //微信签名
                },function(res){
                    successBack = successBack?successBack(res):"";
                    return successBack;
                }
            );
        }
    }
}]);
app.service('hint',function () {
   return {
       hint:function (content,callback) {
           var hint = '<div class="hint_wrap"><div class="hint_content"><span>'+content+'</span></div></div>';
           angular.element("body").append(hint);
           return callback = callback?callback():"";
       }
   }
});
app.service('alertReset',function () {
   return {
       alert:function (content) {
           var hint = '<div class="hint_wrap"><div class="hint_content"><span>'+content+'</span></div></div>';
           angular.element("body").append(hint);
           setTimeout(function () {
               angular.element(".hint_wrap").remove();
           },1000);
       }
   }
});
app.service('confirmReset',function () {
   return {
       confirm:function (content,sureCallback) {
           var hint = '<div class="hint_wrap"><div class="hint_content"><span>'+content+'</span><div class="confirm_event"><a href="javascript:;" id="confirmSure">确定</a><a href="javascript:;" id="confirmCancel">取消</a></div></div></div>';
           angular.element("body").append(hint);
           angular.element("#confirmSure").on("click",function () {
               angular.element(".hint_wrap").remove();
               return sureCallback?sureCallback():"";
           });
           angular.element("#confirmCancel").on("click",function () {
               angular.element(".hint_wrap").remove();
           });
       }
   }
});