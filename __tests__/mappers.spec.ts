import { ulid } from 'ulid';
import { day, hour, minute } from '../models/constants';
import {
  convertRouteToSiteName,
  convertTimeStamp,
  mapResponseToMumble,
  mapResponseToUser,
} from '../models/mappers';
import { postResponse } from '../test-data/test.data';

describe('mappers', () => {
  const currentDate = new Date();
  const user = {
    id: 'userId',
    firstName: 'firstName',
    lastName: 'lastName',
    userName: 'userName',
    avatarUrl: 'avatarUrl',
  };
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

  describe('convertRouteToSiteName', () => {
    it('should return Timeline', () => {
      expect(convertRouteToSiteName('/')).toEqual('Timeline');
    });
    //generate test cases for all routes
    it('should return Detail', () => {
      expect(convertRouteToSiteName('/mumble/[id]')).toEqual('Detail');
    });

    it('should return Profile', () => {
      expect(convertRouteToSiteName('/profile/[id]')).toEqual('Profile');
    });

    it('should return Login', () => {
      expect(convertRouteToSiteName('/auth/login')).toEqual('Login');
    });

    it('should return Login', () => {
      expect(convertRouteToSiteName('/auth/login')).toEqual('Login');
    });

    it('should return Login', () => {
      expect(convertRouteToSiteName('/auth/login')).toEqual('Login');
    });

    it('should return Error', () => {
      expect(convertRouteToSiteName('/error')).toEqual('Error');
    });

    it('should return empty string by default', () => {
      expect(convertRouteToSiteName('/not-existing-route')).toEqual('');
    });
  });

  describe('mapResponseToMumble', () => {
    const expectedMumble = {
      id: '01GYYGWZWJDKJMPDSZR9SGEKAB',
      creator: '205891388519219457',
      text: 'G Wagon',
      mediaUrl:
        'https://storage.googleapis.com/qwacker-api-prod-data/6f8ff09a-9fb3-4675-aaa2-028bd11d51e9',
      mediaType: 'image/jpeg',
      likeCount: 1,
      likedByUser: false,
      type: 'post',
      replyCount: 1,
      createdTimestamp: 'vor 3 Tage',
    };

    const expectedMumbleWithUser = {
      ...expectedMumble,
      fullName: `${user.firstName} ${user.lastName}`,
      userName: user.userName,
      avatarUrl: user.avatarUrl,
    };

    it('should return a Mumble with user data', () => {
      expect(mapResponseToMumble(postResponse, user)).toEqual(
        expectedMumbleWithUser
      );
    });

    it('should return a Mumble without user', () => {
      expect(mapResponseToMumble(postResponse)).toEqual(expectedMumble);
    });

    it('should return random object if input is a random object with valid ulid', () => {
      const randomObject = {
        id: ulid(currentDate.valueOf()),
        randomKey1: 'randomValue1',
        randomKey2: 'randomValue2',
      };
      const expectedResult = {
        ...randomObject,
        createdTimestamp: 'jetzt',
      };
      expect(mapResponseToMumble(randomObject)).toEqual(expectedResult);
    });

    it('should throw error if ulid is invalid', () => {
      const randomObject = {
        id: 'invalidUlid',
      };
      expect(() => mapResponseToMumble(randomObject)).toThrow();
    });
  });

  describe('mapResponseToUser', () => {
    it('should return the same object as MumbleUser', () => {
      expect(mapResponseToUser(user)).toEqual(user);
    });
  });
});
