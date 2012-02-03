// A game state for showing a brief cutscene,
// including an image and some text.

'use strict';

var cutscene = function (jaws, machine, description) {
    var lineheight = 50; // pixels - a rough guess?

    return {
	setup: function () {
	    if (description.background_image) {
		this.background = new Image();
		this.background.src = description.background_image;
	    }
	    jaws.preventDefaultKeys(['space']);
	    this.step = 0;
	    var that = this;
	    jaws.on_keydown('space', function () {
		if (description.text[that.step + 1]) {
		    that.step += 1;
		} else {
		    machine.next_state();
		}
	    });
	},
	draw: function () {
	    if (description.background_color) {
		jaws.context.fillStyle = description.background_color;
		jaws.context.fillRect(0, 0, jaws.width, jaws.height);
	    }
	    if (this.background) {
		jaws.context.drawImage(this.background, 0, 0);
	    }
	    if (description.text) {
		for (var i = 0; i <= this.step; ++i) {
		    jaws.context.font = '24pt Inconsolata';
		    jaws.context.textAlign = 'center';
		    jaws.context.fillStyle = 'black';
		    jaws.context.fillText(description.text[i],
					  jaws.width / 2,
					  (jaws.height - description.text.length * lineheight) / 2 + i * lineheight);
		}
	    }
	},
	update: function () {
	    // nothing to do
	}
    };
};
