import TicketPurchaseUtil from './ticketPurchase';

describe('TicketPurchaseUtil', () => {
  describe('calculatePointsForPurchase', () => {
    it('should generate 1 point each $peso if level is BRONZE', () => {
      const total = TicketPurchaseUtil.calculatePointsForPurchase(10, 'BRONZE');
      expect(total).toBe(10);
    });

    it('should generate 1.5 point each $peso if level is SILVER', () => {
      const total = TicketPurchaseUtil.calculatePointsForPurchase(10, 'SILVER');
      expect(total).toBe(15);
    });

    it('should generate 2 point each $peso if level is GOLD', () => {
      const total = TicketPurchaseUtil.calculatePointsForPurchase(10, 'GOLD');
      expect(total).toBe(20);
    });

    it('should generate 3 point each $peso if level is PLATINUM', () => {
      const total = TicketPurchaseUtil.calculatePointsForPurchase(10, 'PLATINUM');
      expect(total).toBe(30);
    });
  });

  describe('calculateNewLevel', () => {
    it('should return BRONZE if totalPoints is less than 1000 points', () => {
      const newLevel1 = TicketPurchaseUtil.calculateNewLevel(999);
      const newLevel2 = TicketPurchaseUtil.calculateNewLevel(1000);
      expect(newLevel1).toBe('BRONZE');
      expect(newLevel2).not.toBe('BRONZE');
    });

    it('should return SILVER if totalPoints is greater or equal than 1000 but less than 5000', () => {
      const newLevel1 = TicketPurchaseUtil.calculateNewLevel(1000);
      const newLevel2 = TicketPurchaseUtil.calculateNewLevel(4999);
      const newLevel3 = TicketPurchaseUtil.calculateNewLevel(5000);
      expect(newLevel1).toBe('SILVER');
      expect(newLevel2).toBe('SILVER');
      expect(newLevel3).not.toBe('SILVER');
    });

    it('should return GOLD if totalPoints is greater or equal than 5000 but less than 10000', () => {
      const newLevel1 = TicketPurchaseUtil.calculateNewLevel(5000);
      const newLevel2 = TicketPurchaseUtil.calculateNewLevel(9999);
      const newLevel3 = TicketPurchaseUtil.calculateNewLevel(10000);
      expect(newLevel1).toBe('GOLD');
      expect(newLevel2).toBe('GOLD');
      expect(newLevel3).not.toBe('GOLD');
    });

    it('should return PLATINUM if totalPoints is greater or equal than 10000', () => {
      const newLevel1 = TicketPurchaseUtil.calculateNewLevel(10000);
      const newLevel2 = TicketPurchaseUtil.calculateNewLevel(9999);
      expect(newLevel1).toBe('PLATINUM');
      expect(newLevel2).not.toBe('PLATINUM');
    });
  });
});
