import {
    GetProfileQueryParams,
    GetProfileResponse,
    MumbleType,
    Profile,
    Response,
  } from '../models';
  import { mapResponseToProfile } from '../models/mappers';

  export const getProfileById = async (id: string, token: string): Promise<Profile> => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);
    const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users/${id}`;
    const res = await fetch(url);
    const profile: Response = await res.json();
    console.log(profile)
    return mapResponseToProfile(profile);
  };

// export const getProfileById = async (
//     params?: GetProfileQueryParams
//   ): Promise<GetProfileResponse> => {
//     const queryParams = new URLSearchParams({
//       id: String(params?.id),
//     });

//     const headers = new Headers();
//     headers.append('Content-Type', 'application/json');

//     const url = `${process.env.NEXT_PUBLIC_QWACKER_API_URL}/users?${queryParams}`;
//     const res = await fetch(url, { headers });
//     const { count, data } = await res.json();
//     console.log(data)
//     const profile = data
//     return {
//       count,
//       profile,
//     };
//   };
