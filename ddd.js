/*function func(n){
    var total = 1,index = 1,is_add = true,num = 1;
    for(var i=1;i<n;i++){
        if(is_add){
            if(num < index){
                total += 1;
                num ++;
            }else{
                total += 1;
                index ++;
                num = 1;
                is_add = false;
            }
        }else{
            total -= 1;
            is_add = true;
        }
    }
    return total;
}*/
/*
function func(n) {
    var i = 0,
        k = 2,
        j = 2;
    while(k < n) {
        i = i + 2;
        j = j + 1;
        k = k + j;
    }

    return n - i;
}
 var line;
 while(line = read_line()){
 line = line.split(' ');
 print(func(+line[0]));
 }*/

/*function times(l,r,m){
    var times = 0;
    if(r>=l && m>=0 && r<=2000000){
        for(var i=l;i<=r;i++){
            if(i == 0 && m == 0){
                times += 1;
                continue;
            }else if(i == 0){
                continue;
            }
            var erjz = parseInt(i,10).toString(2).match(/1/g);
            if(m == erjz.length){
                times += 1;
            }
        }
        times = times ? times : -1;
        return times;
    }
}*/
/*var line;
while(line = read_line()){
	line = line.split(" ");
  	print(times(parseInt(line[0]),parseInt(line[1]),parseInt(line[2])));
}*/
/*function obj(name){
    if(name){this.name = name;}
    return this;
}
obj.prototype.name = "name2";
var a = obj("name1");
var b = new obj;
console.log(a.name +";"+b.name);
function getNthFibonacci(count) {
    if(count == 0){
        return 0;
    }else if(count == 1){
        return 1;    
    }else{
        return getNthFibonacci(count-1) + getNthFibonacci(count -2);
    }
}*/
/*function main(atr,times,arr1,arr2){
    var newAtr = atr;
    for(var i=0;i<times;i++){
        console.log(newAtr.split(""));
        newAtr = newAtr + newAtr.split("").slice(arguments[i+2][0],arguments[i+2][1]).reverse().join("");
    }
    return newAtr;
}
console.log(main("ab",2,[0,2],[1,3]));*/
function do_something(n, s, l){
	//你的代码
	var single = Math.floor(l-n+1 / s);
	if (single % 13 === 0) single--;
	if (s === l) single = 1;

	var res = Math.ceil(n / single)

	if (res === 1 && n % 13 === 0) res++;

	return res;
}
console.log(do_something(13,30,980));
/*(function() {
    var line;
    while (line = read_line()) {
        line = line.split(' ');

        print(solve(parseInt(line[0]), parseInt(line[1]), parseInt(line[2])));
    }
})();*/
// console.log(solve(2000,1000,6));