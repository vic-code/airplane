/*
 * @Author: lenovo
 * @Date:   2017-07-20 21:33:28
 * @Last Modified by:   lenovo
 * @Last Modified time: 2017-08-01 00:14:48
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



//子弹类
var bullet = new Image();
bullet.src = "images/bullet.png";
var BULLET = {
    imgs: bullet,
    width: 9,
    height: 21
}

function Bullet(config) {
    this.imgs = config.imgs;
    this.width = config.width;
    this.height = config.height;

    this.x1 = hero.x + hero.width / 2 - this.width / 2 - 10;
    this.x2 = hero.x + hero.width / 2 - this.width / 2 + 10;
    this.y = hero.y - this.height - 10;
    //是否删除子弹
    this.del = false;

    this.paint = function(cxt) {
        cxt.drawImage(this.imgs, this.x1, this.y);
        cxt.drawImage(this.imgs, this.x2, this.y);
    }
    //正常子弹
    this.step = function() {
        this.y -= 20;
    }
    //散弹
    this.step_san = function() {
        this.y -= 20;
        this.x1 -= 10;
        this.x2 += 10;
    }
}

//子弹存储数组
var bullets = [];
var san_bullets = [];

//绘制所有子弹
function paintBullets() {
    for (var i = 0; i < bullets.length; i++) {
        bullets[i].paint(context);
    }
    for (var i = 0; i < san_bullets.length; i++) {
        san_bullets[i].paint(context);
    }
}

//子弹移动轨迹
function stepBullets() {
    for (var i = 0; i < bullets.length; i++) {
        bullets[i].step();
    }
    for (var i = 0; i < san_bullets.length; i++) {
        san_bullets[i].step_san(context);
    }
}

//超出屏幕删除子弹容器
function delBullets() {
    for (var i = 0; i < bullets.length; i++) {
        if (bullets[i].y <= -bullets[i].height || bullets[i].del) {
            bullets.splice(i, 1);
        }
    }
    for (var j = 0; j < san_bullets.length; j++) {
        if (san_bullets[j].y <= -san_bullets[j].height || san_bullets[j].del) {
            san_bullets.splice(j, 1);
        }
    }
}



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



//敌人的飞机
var enemy1 = [];
enemy1[0] = new Image();
enemy1[0].src = "images/enemy1.png";
enemy1[1] = new Image();
enemy1[1].src = "images/enemy1_down1.png";
enemy1[2] = new Image();
enemy1[2].src = "images/enemy1_down2.png";
enemy1[3] = new Image();
enemy1[3].src = "images/enemy1_down3.png";
enemy1[4] = new Image();
enemy1[4].src = "images/enemy1_down4.png";
var enemy2 = [];
enemy2[0] = new Image();
enemy2[0].src = "images/enemy2.png";
enemy2[1] = new Image();
enemy2[1].src = "images/enemy2_down1.png";
enemy2[2] = new Image();
enemy2[2].src = "images/enemy2_down2.png";
enemy2[3] = new Image();
enemy2[3].src = "images/enemy2_down3.png";
enemy2[4] = new Image();
enemy2[4].src = "images/enemy2_down4.png";
var enemy3 = [];
enemy3[0] = new Image();
enemy3[0].src = "images/enemy3_n1.png";
enemy3[1] = new Image();
enemy3[1].src = "images/enemy3_n2.png";
enemy3[2] = new Image();
enemy3[2].src = "images/enemy3_down1.png";
enemy3[3] = new Image();
enemy3[3].src = "images/enemy3_down2.png";
enemy3[4] = new Image();
enemy3[4].src = "images/enemy3_down3.png";
enemy3[5] = new Image();
enemy3[5].src = "images/enemy3_down4.png";
enemy3[6] = new Image();
enemy3[6].src = "images/enemy3_down5.png";
enemy3[7] = new Image();
enemy3[7].src = "images/enemy3_down6.png";

var ENEMY1 = {
    imgs: enemy1,
    width: 57,
    height: 51,
    sum: enemy1.length,
    type: 1,
    life: 1,
    score: 1
}
var ENEMY2 = {
    imgs: enemy2,
    width: 69,
    height: 95,
    sum: enemy2.length,
    type: 2,
    life: 5,
    score: 3
}
var ENEMY3 = {
    imgs: enemy3,
    width: 169,
    height: 258,
    sum: enemy3.length,
    type: 3, //种类
    life: 20, //生命值
    score: 10
}
//敌人飞机构造函数
function Enemy(config) {
    this.imgs = config.imgs;
    this.width = config.width;
    this.height = config.height;
    this.sum = config.sum;
    this.type = config.type;
    this.life = config.life;
    this.score = config.score;

    this.x = Math.random() * (WIDTH - this.width);
    this.y = -this.height;

    this.frameIndex = 0; //飞机种类控制
    //爆破
    this.down = false;
    //删除
    this.del = false;

    this.paint = function(cxt) {
        cxt.drawImage(this.imgs[this.frameIndex], this.x, this.y);
    }
    this.step = function() {
        if (this.down) { //爆破
            this.frameIndex++;
            if (this.frameIndex == this.sum) {
                this.del = true;
                score += this.score;
                this.frameIndex = this.sum - 1;
            }
        } else { //正常
            switch (this.type) {
                case 1: //炮灰飞机
                    this.frameIndex = 0;
                    this.y += 10;
                    break;
                case 2: //小boss
                    this.frameIndex = 0;
                    this.y += 5;
                    break;
                case 3: //boss
                    this.frameIndex = (this.frameIndex == 0) ? 1 : 0;
                    this.y++;
                    break;
            }
        }
    }
    //碰撞检测
    this.hit = function(compont) {
        return (compont.y + compont.height >= this.y &&
                compont.x + compont.width >= this.x &&
                compont.y <= this.y + this.height &&
                compont.x <= this.x + this.width) ||

            (compont.y + compont.height >= this.y &&
                compont.x1 + compont.width >= this.x &&
                compont.y <= this.y + this.height &&
                compont.x1 <= this.x + this.width) ||

            (compont.y + compont.height >= this.y &&
                compont.x2 + compont.width >= this.x &&
                compont.y <= this.y + this.height &&
                compont.x2 <= this.x + this.width);
    }
    this.brokenDown = function() {
        this.life--;
        if (this.life == 0) {
            this.down = true; //爆破
            if (this.type == 3) { //大飞机
                this.frameIndex = 2;
            } else { //小|中飞机
                this.frameIndex = 1;
            }
        }
    }
}

//敌方飞机数组
var enemies = [];
//生成敌方飞机的函数
function createEnemy() {
    var num = Math.random() * 200;
    if (num <= 8) { //小飞机
        enemies[enemies.length] = new Enemy(ENEMY1);
    } else if (num <= 9) { //中飞机
        enemies[enemies.length] = new Enemy(ENEMY2);
    } else if (num <= 10) { //boss
        if (enemies.length > 0 && enemies[0].type != 3) { //防止第一个飞机就是大boss
            enemies.splice(0, 0, new Enemy(ENEMY3));
        }
    }
}

function paintEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].paint(context);
    }
}

function stepEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        enemies[i].step();
    }
}

function delEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].y == HEIGHT || enemies[i].del) {
            enemies.splice(i, 1);
        }
    }
}

//检测碰撞
function checkHit() {
    //遍历敌方飞机
    for (var i = 0; i < enemies.length; i++) {
        //被我方飞机撞击
        if (enemies[i].hit(hero) && !hero.down && !enemies[i].down) {
            hero.brokenDown(); //我方飞机执行被撞击后的逻辑
            enemies[i].brokenDown(); //敌方飞机执行被撞击后的逻辑
        }

        //被子弹打中
        for (var j = 0; j < bullets.length; j++) {
            if (enemies[i].hit(bullets[j]) && !enemies[i].down) {
                bullets[j].del = true; //子弹撞击后的逻辑
                enemies[i].brokenDown(); //敌方飞机执行被撞击后的逻辑
            }
        } //被散弹打中
        for (var k = 0; k < san_bullets.length; k++) {
            if (enemies[i].hit(san_bullets[k]) && !enemies[i].down) {
                san_bullets[k].del = true; //子弹撞击后的逻辑
                enemies[i].brokenDown(); //敌方飞机执行被撞击后的逻辑
            }
        }
    }
}


//飞机跟随鼠标移动
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
            hero.shoot(); //射击方法
            paintBullets();
            stepBullets(); //移动所有子弹方法
            delBullets(); //移除飞出画面的子弹方法

            //敌人飞机
            createEnemy();
            paintEnemies();
            stepEnemies();
            delEnemies();

            //检测碰撞
            checkHit(); //检查是否撞击方法
            break;
    }
}, 60);