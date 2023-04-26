const profileBackgrounds = [
  'https://cdn.pixabay.com/photo/2012/08/27/14/19/mountains-55067_960_720.png',
  'https://cdn.pixabay.com/photo/2017/02/01/22/02/mountain-landscape-2031539_960_720.jpg',
  'https://cdn.pixabay.com/photo/2015/12/01/20/28/forest-1072828_960_720.jpg',
  'https://cdn.pixabay.com/photo/2017/12/29/18/47/mountains-3048299_960_720.jpg',
  'https://cdn.pixabay.com/photo/2017/10/10/07/48/beach-2836300_960_720.jpg',
  'https://cdn.pixabay.com/photo/2014/09/10/00/59/mountains-440520_960_720.jpg',
];

export const randomProfileBackground = () => 
  profileBackgrounds[Math.floor(Math.random() * profileBackgrounds.length)];

const profileBios = [
  'Threesome? No thanks… If I wanted to disappoint two people in the same room, I’d have dinner with my parents.',
  "If you're looking for a bad boy, look no further. I'm bad at everything.",
  'Married. Couple of kids. Looking for some side action. Just kidding. Single. 3 Tamagotchis. Looking for someone to take to family events so they’ll stop thinking something’s wrong with me.',
  'Pros: Great at making pasta. Cons: Can only make pasta.',
  'I am a rocket scientist. I’ve appeared on the cover of GQ – twice. And after mastering Italian, I became an international super spy. Right now, I’m yachting my way across the Caribbean, stealing top-secret information, and sipping Mai Tais… shaken, not stirred. Okay, fine. I exaggerated *just* a smidge. But I do like a good Mai Tai and I got a B+ in my 5th grade science class. Message me for more straight talk and I’ll send you FB links, photos of science fair trophies and much MUCH more…',
  'Looking for a guy who will pick me over beer.',
];

export const randomProfileBio = () =>
  profileBios[Math.floor(Math.random() * profileBios.length)];
