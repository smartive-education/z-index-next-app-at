import { day, hour, minute } from '../models/constants';
import { convertTimeStamp } from '../models/mappers';

describe('mappers', () => {
  const currentDate = new Date();
  describe('convertTimeStamp', () => {
    it('should return days if elapsedTime is >= 2 day', () => {
      const creationDate = new Date(currentDate.valueOf() - 2 * day);
      expect(convertTimeStamp(creationDate, currentDate)).toEqual('vor 2 Tage');
    });
    it('should return hours if elapsedTime is >= 2 hour', () => {
      const creationDate = new Date(currentDate.valueOf() - 2 * hour);
      expect(convertTimeStamp(creationDate, currentDate)).toEqual(
        'vor 2 Stunden'
      );
    });
    it('should return minutes if elapsedTime is >= 2 minute', () => {
      const creationDate = new Date(currentDate.valueOf() - 2 * minute);
      expect(convertTimeStamp(creationDate, currentDate)).toEqual(
        'vor 2 Minuten'
      );
    });

    it('should return days if elapsedTime is > 1 day', () => {
      const creationDate = new Date(currentDate.valueOf() - 1 * day);
      expect(convertTimeStamp(creationDate, currentDate)).toEqual('vor 1 Tag');
    });
    it('should return hours if elapsedTime is > 1 hour', () => {
      const creationDate = new Date(currentDate.valueOf() - 1 * hour);
      expect(convertTimeStamp(creationDate, currentDate)).toEqual(
        'vor 1 Stunde'
      );
    });
    it('should return minutes if elapsedTime is > 1 minute', () => {
      const creationDate = new Date(currentDate.valueOf() - 1 * minute);
      expect(convertTimeStamp(creationDate, currentDate)).toEqual(
        'vor 1 Minute'
      );
    });

    it('should return jetzt if elapsed time is  < 1 minute', () => {
      const creationDate = new Date(currentDate.valueOf() - 0.5 * minute);
      expect(convertTimeStamp(creationDate, currentDate)).toEqual('jetzt');
    });

    it('should return rounded down integers', () => {
      const creationDate = new Date(currentDate.valueOf() - 1.5675 * minute);
      expect(convertTimeStamp(creationDate, currentDate)).toEqual(
        'vor 1 Minute'
      );
    });
  });
});
