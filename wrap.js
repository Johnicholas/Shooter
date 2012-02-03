function wrap(value, max) {
    value %= max;
    // we want to guarantee the output is within [0..max),
    // and javascript modulus doesn't quite do it,
    // so we have to fix up negatives.
    if (value < 0) {
	value += max;  
    }
    return value;
};
