
state_machine.states = {
    intro: [
	cutscene(jaws, state_machine, {
	    background_color: 'grey',
	    text: [
		'Press space',
		'to fire.',
		'Use arrow keys',
		'to steer.',
	    ]
	}),
	cutscene(jaws, state_machine, {
	    background_color: 'grey',
	    text: [
		'Defend your home oceans,',
		'from the dark sky fish,',
		'with sparklers.'
		]
	})
    ],
    loop: function (x) {
	return [
	    shooter(jaws, state_machine),
	    cutscene(jaws, state_machine, {
		background_color: 'grey',
		text: [
		    'A tragic loss.',
		    'Press space',
		    'to try again.'
		]
	    })
	];
    },
    get: function (which) {
	if (which < this.intro.length) {
	    return this.intro[which];
	} else {
	    which -= this.intro.length;
	    var loop_instance = this.loop(which);
	    return loop_instance[wrap(which, loop_instance.length)];
	}
    }
};

jaws.start(state_machine);
