/*
 * @Author: lenovo
 * @Date:   2017-07-20 21:33:28
 * @Last Modified by:   lenovo
 * @Last Modified time: 2017-07-27 22:47:44
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
    if (state == START) {
        state = STARTTING;
    } else if (state == RUNNING) {
        hero.switchBullet = !hero.switchBullet; //子弹切换
    }
}

var loadings = [];
loadings[0] = new Image();
loadings[0].src = "images/game_loading1.png";
loadings[1] = new Image();
loadings[1].src = "images/game_loading2.png";
loadings[2] = new Image();
loadings[2].src = "images/game_loading3.png";
loadings[3] = new Image();
loadings[3].src = "images/game_loading4.png";

var LOADING = {
    imgs: loadings,
    width: 186,
    height: 38,
    sum: loadings.length
}

function Loading(config) { //加载动画构造器
    this.imgs = config.imgs;
    this.width = config.width;
    this.height = config.height;
    this.sum = config.sum;
    //索引
    this.frameIndex = 0;

    this.paint = function(cxt) {
        cxt.drawImage(this.imgs[this.frameIndex], 0, HEIGHT - this.height);
    }

    this.speed = 0;
    this.step = function() {
        this.speed++;
        if (this.speed % 3 == 0) {
            this.frameIndex++;
        }
        if (this.frameIndex == 4) {
            state = RUNNING;
        }
    }
}
var loading = new Loading(LOADING);



//我方飞机
var heros = [];
heros[0] = new Image();
heros[0].src = "images/hero1.png";
heros[1] = new Image();
heros[1].src = "images/hero2.png";
heros[2] = new Image();
heros[2].src = "images/hero_blowup_n1.png";
heros[3] = new Image();
heros[3].src = "images/hero_blowup_n2.png";
heros[4] = new Image();
heros[4].src = "images/hero_blowup_n3.png";
heros[5] = new Image();
heros[5].src = "images/hero_blowup_n4.png";

var HERO = {
    imgs: heros,
    width: 99,
    height: 124,
    sum: heros.length
}
//英雄飞机
function Hero(config) {
    this.imgs = config.imgs;
    this.width = config.width;
    this.height = config.height;
    this.sum = config.sum;

    this.frameIndex = 0;

    this.x = (WIDTH - this.width) / 2;
    this.y = HEIGHT - this.height - 30;

    //是否爆破
    this.broken = false;

    this.switchBullet = false; //切换子弹

    this.paint = function(cxt) {
        cxt.drawImage(this.imgs[this.frameIndex], this.x, this.y);
    }

    this.step = function() {
        if (this.broken) {
            this.frameIndex++;
            if (this.frameIndex == this.sum) {
                this.frameIndex = this.sun - 1;
                life--;
                if (life == 0) {
                    state = GAMEOVER;
                } else {
                    hero = new Hero(HERO);
                }
            }
        } else {
            this.frameIndex = (++this.frameIndex) % 2;
        }
    }

    //射击
    this.shootSpeed = 0;
    this.shoot = function() {
        this.shootSpeed++;
        if (this.shootSpeed % 3 == 0) {
            if (!this.switchBullet) {
                bullets[bullets.length] = new Bullet(BULLET);
            } else {
                san_bullets[san_bullets.length] = new Bullet(BULLET);
            }
        }
    }

    //撞击后的方法
    this.brokenDown = function() {
        this.broken = true;
        this.frameIndex = 2; //爆破动画
    }
}

var hero = new Hero(HERO);

canvas.onmousemove = function(event) {
    if (state == RUNNING) {
        // a. 鼠标坐标值:pageX|clientX|offsetX|x
        // b. 根据鼠标当前坐标值,修改hero的坐标值
        hero.x = event.offsetX - hero.width / 2;
        hero.y = event.offsetY - hero.height / 2;
    }
}

//手机触摸屏
if (!PC) {
    (function() {
        var hasTouch = true;
        var touchStart = hasTouch ? 'touchstart' : 'mousedown';
        var touchMove = hasTouch ? 'touchmove' : 'mousemove';
        var touchEnd = hasTouch ? 'touchend' : 'mouseup';

        var start = function(e) {
            var point = hasTouch ? e.touches[0] : e;
            //添加“触摸移动”事件监听
            canvas.addEventListener(touchMove, move, false);
            //添加“触摸结束”事件监听
            canvas.addEventListener(touchEnd, end, false);
        }

        var move = function(e) {
            var point = hasTouch ? e.touches[0] : e;
            e.preventDefault();
            if (state == RUNNING) {
                hero.x = point.pageX - hero.width / 2;
                hero.y = point.pageY - hero.height / 2;
            }
        }

        var end = function(e) {
            canvas.removeEventListener(touchStart, end, false);
            canvas.removeEventListener(touchMove, move, false);
            canvas.removeEventListener(touchEnd, end, false);
        }
        //添加“触摸开始”事件监听
        canvas.addEventListener(touchStart, start, false);
    })();
}

//子弹类




//游戏控制器
setInterval(function() {
    backg.paint(context); //背景
    backg.step(); //动画
    switch (state) {
        case START:
            context.drawImage(logo, 0, 0, WIDTH, HEIGHT); //logo
            break;
        case STARTTING:
            loading.paint(context);
            loading.step();
            break;
        case RUNNING:
            hero.paint(context); //绘制方法
            hero.step(); //动画方法
            //hero.shoot();//射击方法
            break;
    }
}, 60);