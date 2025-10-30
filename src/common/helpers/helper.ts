export class Helper {
  static isEqualArray = (arr1: number[], arr2: number[]): boolean => {
    if (arr1.length !== arr2.length) return false;

    return arr1.every((val, index) => val === arr2[index]);
  };
}
