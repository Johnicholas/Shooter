'use strict';

var shooter = function (jaws) {
    function random(max) {
	return Math.floor(Math.random() * (max + 1));
    };

    var max_particle_speed = 10; // pixels per update
    var particle_lifetime = 100; // milliseconds
    var spaceship_height = 27.5;
    var spaceship_width = 20;
    var projectile_speed = 10; // pixels per update

    function Player() {
	this.x = jaws.width / 2;
	this.y = jaws.height / 2;
	this.vx = 0;
	this.vy = 0;
    };
    Player.prototype = {
	draw: function () {
	    jaws.context.save(); // push state on state stack
	    jaws.context.translate(this.x, this.y);
	    jaws.context.scale(spaceship_width / 100, spaceship_height / 100);
	    jaws.context.beginPath();
	    jaws.context.moveTo(0, -66);
	    jaws.context.lineTo(50, 33);
	    jaws.context.lineTo(25, 18);
	    jaws.context.lineTo(-25, 18);
	    jaws.context.lineTo(-50, 33);
	    jaws.context.lineTo(0, -66);
	    jaws.context.strokeStyle = 'white';
	    jaws.context.stroke();
	    jaws.context.restore(); // pop state stack and restore state
	}
    };
    function Background() {
    };
    Background.prototype = {
	draw: function () {
	    jaws.context.fillStyle = 'black';
	    jaws.context.fillRect(0, 0, jaws.width, jaws.height);
	}
    };
    /*
    function Particle(origin) {
	this.x = origin.x;
	this.y = origin.y;
	var angle = random(100);
	var speed = random(max_particle_speed);
	this.vx = origin.vx + Math.cos(2 * Math.PI / 100 * angle) * speed;
	this.vy = origin.vy + Math.sin(2 * Math.PI / 100 * angle) * speed;
	this.alive = true;
	var that = this;
	setTimeout(function () { that.alive = false; }, particle_lifetime);
    };
    Particle.prototype = {
	draw: function () {
	    if (this.alive) {
		jaws.context.fillStyle = 'white';
		jaws.context.fillRect(this.x, this.y, 1, 1);
	    }
	},
	update: function () {
	    this.x += this.vx;
	    this.y += this.vy;
	}
    };
    function Projectile(origin) {
	this.x = origin.x;
	this.y = origin.y;
	this.vx = 0;
	this.vy = -1 * projectile_speed;
	this.alive = true;
	this.particles = [];
    };
    Projectile.prototype = {
	draw: function () {
	    for (var i in this.particles) {
		this.particles[i].draw();
	    }
	},
	update: function () {
	    if (this.x < 0 || this.x > jaws.width) {
		this.alive = false;
		return;
	    } else if (this.y < 0 || this.y > jaws.height) {
		this.alive = false;
		return;
	    } else {
		this.x += this.vx;
		this.y += this.vy;
		this.particles.push(new Particle(this));
		this.particles = this.particles.filter(function (it) {
		    return it.alive;
		});
		for (var i in this.particles) {
		    this.particles[i].update();
		}
	    }
	}
    };
    */

    return {
	setup: function () {
	    jaws.preventDefaultKeys(['up', 'down', 'left', 'right', 'space']);
	    this.player = new Player();
	    this.background = new Background();
	    this.projectiles = [];
	},
	draw: function () {
	    this.background.draw();
	    this.player.draw();
	    //for (var i in this.projectiles) {
	    //this.projectiles[i].draw();
	//}
	},
	update: function () {
	    if (jaws.pressed('up')) {
		this.player.y -= 10;
	    }
	    if (jaws.pressed('down')) {
		this.player.y += 10;
	    }
	    if (jaws.pressed('left')) {
		this.player.x -= 10;
	    }
	    if (jaws.pressed('right')) {
		this.player.x += 10;
	    }
	    //if (jaws.pressed('space')) {
	    //this.projectiles.push(new Projectile(this.player));
	//}
	    //for (var i in this.projectiles) {
	    //this.projectiles[i].update();
	    //}
	}
    }
};
