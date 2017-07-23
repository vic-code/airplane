/*
 * @Author: lenovo
 * @Date:   2017-07-20 21:33:28
 * @Last Modified by:   lenovo
 * @Last Modified time: 2017-07-23 18:21:58
 */

'use strict';

function isPc() { //判断是否是pc
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

var PC = isPc();
var div = document.getElementsByTagName('div')[0],
    canvas = document.getElementById('canvas');
if (PC) {
    div.style.margin = "0 auto";
    div.style.width = "480px";
    div.style.height = "650px";
    div.style.background = "#323232";
    div.style.textAlign = "center";
    div.style.verticalAlign = "middle";

    canvas.setAttribute("width", 480);
    canvas.setAttribute("height", 650);
} else { // 手机屏幕
    div.style.margin = "0 auto";
    div.style.width = window.innerWidth + "px";
    div.style.height = window.innerHeight + "px";
    div.style.background = "#323232";
    div.style.textAlign = "center";
    div.style.verticalAlign = "middle";
    div.style.overflowX = "hidden";

    canvas.setAttribute("width", window.innerWidth);
    canvas.setAttribute("height", window.innerHeight);
    canvas.style.margin = "0px";
    canvas.style.padding = "0px";
    canvas.style.display = "block";
}

var context = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
//游戏状态
const START = 0;
const STARTTING = 1;
const RUNNING = 2;
const PAUSED = 3;
const GAMEOVER = 4;
//当前游戏状态
var state = 0;
//得分
var score = 0;
//生命
var life = 3;

var bg = new Image();
bg.src = "images/background.png";

//背景图
var BG = {
    imgs: bg,
    width: WIDTH,
    height: HEIGHT
}

function Bg(config) {
    this.imgs = config.imgs;
    this.width = config.width;
    this.height = config.height;

    this.y1 = 0;
    this.y2 = -this.height;

    this.paint = function(cxt) {
        cxt.drawImage(this.imgs, 0, this.y1, this.width, this.height);
        cxt.drawImage(this.imgs, 0, this.y2, this.width, this.height);
    }
    //动画
    this.step = function() {
        //向下移动
        this.y1++;
        this.y2++;
        //边界
        if (this.y2 == 0) {
            this.y1 = -this.height;
        }
        if (this.y1 == 0) {
            this.y2 = -this.height;
        }
    }
}

//创建背景对象
var backg = new Bg(BG);
//加载load图片
var logo = new Image();
logo.src = "images/start.png";

//游戏开始
canvas.onclick = function() {
	if(state==START){
		state=STARTTING;
	}else if(state == RUNNING){
		hero.switchBullet = !hero.switchBullet; //子弹切换
	}
}

var loadings=[];
loadings[0]=new Image();
loadings[0].src="images/game_loading1.png";
loadings[1]=new Image();
loadings[1].src="images/game_loading2.png";
loadings[2]=new Image();
loadings[2].src="images/game_loading3.png";
loadings[3]=new Image();
loadings[3].src="images/game_loading4.png";

var LOADING={
	imgs:loadings,
	width:186,
	height:38,
	sum:loadings.length
}
function Loading(config){  //加载动画构造器
	this.imgs=config.imgs;
	this.width=config.width;
	this.height=config.height;
	this.sum=config.sum;
	//索引
	this.frameIndex=0;

	this.paint=function(cxt){
		cxt.drawImage(this.imgs[this.frameIndex], 0, HEIGHT - this.height);
	}

	this.speed=0;
	this.step=function(){
		this.speed++;
		if(this.speed%3==0){
			this.frameIndex++;
		}
		if(this.frameIndex==4){
			state = RUNNING;
		}
	} 
}
var loading=new Loading(LOADING);


//游戏控制器
setInterval(function(){
	backg.paint(context);  //背景
	backg.step();  //动画
	switch(state){
        case START:
            context.drawImage(logo, 0, 0, WIDTH, HEIGHT);//logo
            break;
        case STARTTING:
            loading.paint(context);
            loading.step();
        break;
    }
},60);
