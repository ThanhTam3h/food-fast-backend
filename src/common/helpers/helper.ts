export class Helper {
  static isEqualArray = (arr1: number[], arr2: number[]): boolean => {
    if (arr1.length !== arr2.length) return false;

    return arr1.every((val, index) => val === arr2[index]);
  };

  static readonly FEE_BRACKETS = [
    { minDistance: 0, maxDistance: 3, basePrice: 10000, perKmFee: 0 },
    { minDistance: 3, maxDistance: 5, basePrice: 20000, perKmFee: 4000 },
    { minDistance: 5, maxDistance: 10, basePrice: 35000, perKmFee: 8000 },
    {
      minDistance: 10,
      maxDistance: Infinity,
      basePrice: 50000,
      perKmFee: 10000,
    },
  ];

  static caculateDeliveryFee(distance: number): number {
    for (const bracket of this.FEE_BRACKETS) {
      if (distance > bracket.minDistance && distance <= bracket.maxDistance) {
        const remainingKm = Math.max(0, distance - bracket.minDistance);
        return bracket.basePrice + remainingKm * bracket.perKmFee;
      }
    }
    return this.FEE_BRACKETS[this.FEE_BRACKETS.length - 1].basePrice;
  }

  static validateDeliveryDistance(
    distance: number,
    maxDistance: number = Number(process.env.MAX_DELIVERY_DISTANCE),
  ): boolean {
    return distance <= maxDistance;
  }

  static async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }
}
