class Utils {
  
  static randomChoice(choices) {
    let choice = Math.floor(Math.random() * choices.length);
    return choice;
  }
  
  // TESTS

  static testRandomChoice(trials = 100000) {
    let result = [];

    for (let i = 0; i < trials; i++) {
      result.push(Utils.randomChoice([1, 0]));
    }

    let sum = result.reduce((accum, v) => accum + v);
    console.log(`Result: ${sum} of ${TRIALS}`)
  }
}

module.exports = Utils;

