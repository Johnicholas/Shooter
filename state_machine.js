// A state machine idiom,
// following ClickTeam's MMF2.

'use strict';

var state_machine =  {
    state_index: 0,

    // there should be a states attribute added sometime before we start.

    previous_state: function () {
	this.state_index -= 1;
	// fix up to guarantee positive
	if (this.state_index < 0) {
	    this.state_index = 0;
	}
	this.setup();
    },
    next_state: function () {
	this.state_index += 1;
	// note: wraparound should be handled by the states object,
	// if that's the appropriate way to handle it.
	this.setup();
    },
    // called by jaws
    setup: function () {
	// delegate through to the current state
	jaws.clearKeyCallbacks();
	this.state = this.states.get(this.state_index);
	this.state.setup();
    },
    // called by jaws periodically
    draw: function () {
	// delegate through to the current state
	this.state.draw();
    },
    // called by jaws periodically
    update: function () {
	// delegate through to the current state
	this.state.update();
    }
};
