import { decodeTime } from 'ulid';
import { Post, PostWithUserData, Reply, ReplyWithUserData } from '../models';
import { MumbleDetailState, PostsState } from '../state/mumble-detail';

export const initialPostState: PostsState = { posts: [], hasMore: false };

export const mockPosts: PostWithUserData[] = [
  {
    id: '01GV3TEH72RC5VEQJFCM0YYBA0',
    creator: '201444056083988737',
    text: 'Ash in action',
    mediaUrl:
      'https://storage.googleapis.com/qwacker-api-prod-data/e85a73a4-6b00-4130-890b-d585812f37c0',
    mediaType: 'image/gif',
    likeCount: 0,
    likedByUser: false,
    type: 'post',
    replyCount: 0,
    createdTimestamp: new Date(
      decodeTime('01GV3TEH72RC5VEQJFCM0YYBA0')
    ).toDateString(),
    userName: 'McMock',
    fullName: 'Sir Mock von Stub',
    avatarUrl: 'mockadu.com',
  },
  {
    id: '01GV3SY9CTE1ASR5NMJYY9XF2T',
    creator: '201444056083988737',
    text: 'Just 4 fun ',
    mediaUrl: '',
    mediaType: '',
    likeCount: 0,
    likedByUser: false,
    type: 'post',
    replyCount: 0,
    createdTimestamp: new Date(
      decodeTime('01GV3SY9CTE1ASR5NMJYY9XF2T')
    ).toDateString(),
    userName: 'McMock',
    fullName: 'Sir Mock von Stub',
    avatarUrl: 'mockadu.com',
  },
  {
    id: '01GV3SXDFPNX1362TE3108ZSTT',
    creator: '201444056083988737',
    text: 'Hier werden nun einige Postings gemacht werden.',
    mediaUrl: '',
    mediaType: '',
    likeCount: 0,
    likedByUser: false,
    type: 'post',
    replyCount: 0,
    createdTimestamp: new Date(
      decodeTime('01GV3SXDFPNX1362TE3108ZSTT')
    ).toDateString(),
    userName: 'McMock',
    fullName: 'Sir Mock von Stub',
    avatarUrl: 'mockadu.com',
  },
];

export const singleMockPost: PostWithUserData = {
  id: '01GV0C6FV9873R83SCKMZM6H7T',
  creator: '201164885894103297',
  text: 'Bike2Work im Winter',
  mediaUrl:
    'https://storage.googleapis.com/qwacker-api-prod-data/91a85473-73ab-4871-af9e-8569066e8038',
  mediaType: 'image/jpeg',
  likeCount: 1,
  likedByUser: false,
  type: 'post',
  replyCount: 0,
  createdTimestamp: new Date(
    decodeTime('01GV0C6FV9873R83SCKMZM6H7T')
  ).toDateString(),
  userName: 'McMock',
  fullName: 'Sir Mock von Stub',
  avatarUrl: 'mockadu.com',
};

export const initialPostDetailState: MumbleDetailState = {
  post: singleMockPost,
  replies: [],
};

export const singleMockReply: ReplyWithUserData = {
  id: '01GDMMR85BEHP8AKV8ZGGM259K',
  creator: '179944860378202369',
  text: 'Hello World! @user #newpost',
  mediaUrl:
    'https://storage.googleapis.com/cas-fee-adv-qwacker-api-local-dev/1094b5e0-5f30-4f0b-a342-ae12936c42ff',
  mediaType: 'image/png',
  likeCount: 42,
  likedByUser: true,
  type: 'reply',
  parentId: '01GV0C6FV9873R83SCKMZM6H7T',
  createdTimestamp: new Date(
    decodeTime('01GDMMR85BEHP8AKV8ZGGM259K')
  ).toDateString(),
  userName: 'McMock',
  fullName: 'Sir Mock von Stub',
  avatarUrl: 'mockadu.com',
};

export const singleMockReply2: ReplyWithUserData = {
  id: '01GDMMR85BEHP8AKV8ZGGM259G',
  creator: '179944860378202369',
  text: 'Hello World! @user #newpost',
  mediaUrl:
    'https://storage.googleapis.com/cas-fee-adv-qwacker-api-local-dev/1094b5e0-5f30-4f0b-a342-ae12936c42ff',
  mediaType: 'image/png',
  likeCount: 0,
  likedByUser: false,
  type: 'reply',
  parentId: '01GV0C6FV9873R83SCKMZM6H7T',
  createdTimestamp: new Date(
    decodeTime('01GDMMR85BEHP8AKV8ZGGM259K')
  ).toDateString(),
  userName: 'McMock',
  fullName: 'Sir Mock von Stub',
  avatarUrl: 'mockadu.com',
};
