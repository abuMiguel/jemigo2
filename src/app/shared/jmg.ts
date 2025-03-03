export class Jmg {

  /**
   * Randomly shuffle indexes of array items
   *
   * @static
   * @template T
   * @param {Array<T>} array
   * @memberof Jmg
   */
  static shuffle<T>(array: Array<T>) {
    let currentIndex = array.length, randomIndex: number;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
  }

}