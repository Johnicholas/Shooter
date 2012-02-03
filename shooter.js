'use strict';

var shooter = function (jaws, machine) {
    function random(max) {
	return Math.floor(Math.random() * (max + 1));
    };

    var max_particle_speed = 10; // pixels per update
    var particle_lifetime = 100; // milliseconds
    var spaceship_height = 27.5;
    var spaceship_width = 20;
    var enemy_height = 40;
    var enemy_width = 15;
    var projectile_speed = 1; // pixels per update
    var gun_refractory_period = 100; // updates
    var player_speed = 10; // pixels per update
    var near_distance = 150; // pixels
    var very_near_distance = 10; // pixels
    var enemy_speed_multiplier = 0.10;
    var enemies_count = 10;
    var cities_count = 10;
    var damage_refractory_period = 40; // updates

    function Target(x, y) {
	if (this.x && this.y) {
	    this.x = x;
	    this.y = y;
	} else {
	    // default target is a random point along the bottom
	    this.x = jaws.width / 100 * random(100);
	    this.y = jaws.height;
	}
    };
    Target.prototype = {
	draw: function () {
	    jaws.context.fillStyle = 'rgba(255, 0, 0, 32)';
	    jaws.context.fillRect(this.x - 2, this.y - 2,
				  4, 4);
	}
    }

    function Ship(height, width) {
	this.x = jaws.width / 2;
	this.y = jaws.height / 2;
	this.vx = 0;
	this.vy = 0;
	this.angle = -1 * Math.PI / 2;
	this.height = height;
	this.width = width;
	this.speed = player_speed;
	this.target = new Target();
	this.alive = true;
	this.gun_refractory_state = 0;
	this.damage_refractory_state = 0;
    };
    Ship.prototype = {
	draw: function () {
	    if (!this.alive) {
		return;
	    }
	    if (wrap(Math.floor(this.damage_refractory_state / 5), 2) !== 0) {
		// blink in and out of existence
		return;
	    }
	    // this.target.draw();
	    jaws.context.save(); // push state on state stack
	    jaws.context.translate(this.x, this.y);
	    jaws.context.rotate(this.angle);
	    jaws.context.scale(this.height / 100, this.width / 100);
	    jaws.context.beginPath();
	    jaws.context.moveTo(66, 0);
	    jaws.context.lineTo(-33, 50);
	    jaws.context.lineTo(-18, 25);
	    jaws.context.lineTo(-18, -25);
	    jaws.context.lineTo(-33, -50);
	    jaws.context.lineTo(66, 0);
	    jaws.context.strokeStyle = 'white';
	    jaws.context.stroke();
	    jaws.context.clip();
	    jaws.context.fillStyle = 'white';
	    jaws.context.fillRect(-33, -50,
				  this.gun_refractory_state,
				  100);
	    jaws.context.restore(); // pop state stack and restore state
	},
	distance: function (other) {
	    var dx = this.x - other.x;
	    var dy = this.y - other.y;
	    return Math.sqrt(dx * dx + dy * dy);
	},
	near: function (other) {
	    return this.distance(other) < near_distance;
	},
	very_near: function (other) {
	    return this.distance(other) < very_near_distance;
	},
	kill: function () {
	    // TODO: play a sound?
	    this.alive = false;
	},
	steer: function () {
	    if (this.damage_refractory_state > 0) {
		this.damage_refractory_state -= 1;
		return;
	    } 
	    if (jaws.pressed('up')) { this.y -= this.speed; }
	    if (jaws.pressed('down')) { this.y += this.speed; }
	    if (jaws.pressed('left')) { this.x -= this.speed; }
	    if (jaws.pressed('right')) { this.x += this.speed; }
	    if (this.x < 0) { this.x = 0; }
	    if (this.x > jaws.width) { this.x = jaws.width; }
	    if (this.y < 0) { this.y = 0; }
	    if (this.y > jaws.height) { this.y = jaws.height; }
	    if (this.gun_refractory_state > 0) {
		this.gun_refractory_state -= 1;
	    }
	},
	enemy_update: function (player) {
	    if (!this.alive) {
		return;
	    }
	    if (this.near(player)) {
		this.target.x = player.x;
		this.target.y = player.y;
	    } else if (this.very_near(this.target)) {
		this.target = new Target();
	    }
	    this.angle = Math.atan2(this.target.y - this.y,
				    this.target.x - this.x);
	    this.vx = Math.cos(this.angle) * this.speed;
	    this.vy = Math.sin(this.angle) * this.speed;
	    this.x += this.vx;
	    this.y += this.vy;
	}
    };
    function Background() {
	this.stars = [];
	for (var i= 0; i < 100; ++i) {
	    this.stars.push({x: random(jaws.width), y: random(jaws.height)});
	}
    };
    Background.prototype = {
	draw: function () {
	    jaws.context.fillStyle = 'black';
	    jaws.context.fillRect(0, 0, jaws.width, jaws.height);
	    jaws.context.fillStyle = 'white';
	    for (var i in this.stars) {
		jaws.context.fillRect(this.stars[i].x, this.stars[i].y, 1, 1);
	    }
	}
    };
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
	    // jaws.context.fillStyle = 'white';
	    // jaws.context.fillRect(this.x, this.y, 10, 10);
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

    function City() {
	this.x = jaws.width / 100 * random(100);
	this.y = jaws.height;
	this.alive = true;
    };
    City.prototype = {
	draw: function () {
	    if (!this.alive) {
		return;
	    }
	    jaws.context.fillStyle = 'blue';
	    jaws.context.fillRect(this.x - 10, this.y - 10,
				  20, 20);
	},
	kill: function () {
	    // TODO: play a sound?
	    this.alive = false;
	}
    };

    return {
	setup: function () {
	    jaws.preventDefaultKeys(['up', 'down', 'left', 'right', 'space']);
	    this.player = new Ship(spaceship_height, spaceship_width);
	    this.background = new Background();
	    this.projectiles = [];
	    this.cities = [];
	    for (var i = 0; i < cities_count; ++i) {
		this.cities.push(new City());
	    }
	    this.spawn();
	    this.points = 0;
	},
	spawn: function () {
	    this.enemies = [];
	    for (var i = 0; i < enemies_count; ++i) {
		var enemy = new Ship(enemy_height, enemy_width);
		enemy.angle = (2*Math.PI/360) * random(360);
		enemy.x = random(jaws.width);
		enemy.y = -100;
		enemy.speed *= enemy_speed_multiplier;
		this.enemies.push(enemy);
	    }
	},
	draw: function () {
	    this.background.draw();
	    this.player.draw();
	    for (var i in this.projectiles) {
		this.projectiles[i].draw();
	    }
	    for (var i in this.enemies) {
		this.enemies[i].draw();
	    }
	    for (var i in this.cities) {
		this.cities[i].draw();
	    }
	    jaws.context.font = '24pt Inconsolata';
	    jaws.context.textAlign = 'left';
	    jaws.context.fillStyle = 'white';
	    jaws.context.fillText(this.points, 10, 50);
	},
	update: function () {
	    this.player.steer();
	    if (jaws.pressed('space') &&
		this.player.gun_refractory_state == 0) {
		this.projectiles.push(new Projectile(this.player));
		this.player.gun_refractory_state = gun_refractory_period;
	    }
	    for (var i in this.projectiles) {
		this.projectiles[i].update();
	    }
	    this.projectiles = this.projectiles.filter(function (it) {
		return it.alive;
	    });
	    for (var i in this.enemies) {
		this.enemies[i].enemy_update(this.player);
	    }
	    for (var i in this.enemies) {
		for (var j in this.projectiles) {
		    if (this.enemies[i].very_near(this.projectiles[j])) {
			this.enemies[i].kill();
		    }
		}
	    }
	    this.enemies = this.enemies.filter(function (it) {
		return it.alive;
	    });
	    for (var i in this.enemies) {
		if (this.enemies[i].very_near(this.player)) {
		    // TODO: play a sound?
		    // they don't kill, but it's not good
		    this.player.damage_refractory_state = damage_refractory_period
		    var enemy = new Ship(enemy_height, enemy_width);
		    enemy.angle = (2*Math.PI/360) * random(360);
		    enemy.x = random(jaws.width);
		    enemy.y = -100;
		    enemy.speed *= enemy_speed_multiplier;
		    this.enemies[i] = enemy;
		}
	    }
	    for (var i in this.enemies) {
		for (var j in this.cities) {
		    if (this.enemies[i].very_near(this.cities[j])) {
			this.cities[j].kill();
		    }
		}
	    }
	    this.cities = this.cities.filter(function (it) {
		return it.alive;
	    });
	    if (this.cities.length === 0) {
		alert('loss');
		machine.next_state();
	    } else if (this.enemies.length === 0) {
		// TODO: play a sound?
		this.points += this.cities.length;
		this.spawn();
	    }
	}
    }
};
