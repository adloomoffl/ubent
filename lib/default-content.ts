import type { SiteContent } from './content-schema';
export const defaultContent: SiteContent = {
  hero: { line1: 'Stories that', line2: 'move', accent: 'you.', subtitle: 'Films. Short films. Music videos.\nRooted in Kochi.\nMade to be felt.', image: '/assets/hero.jpg', imageAlt: 'Film crew setting up a cinema camera on a night shoot', imageNote: 'Representative production imagery' },
  about: { lead: 'UB ENTERTAINMENTS is an Indian film production company based in Kochi, Keralam. It was founded in 2026 by Ukbath.', body: 'Dedicated to the craft of cinema, we bring a bold and fresh perspective to movies, short films, and music videos. We believe in the power of an honest story, a striking frame, and a moment that stays with you.', image: '/assets/ukbath.jpg', founder: 'Ukbath' },
  services: [
    { id:'movies',title:'Movies',image:'/assets/hero.jpg',alt:'A cinema camera and crew on a night shoot',description:'Compelling characters. Worlds worth getting lost in. Stories imagined for the big screen.',tags:'STORY · PRODUCTION · CINEMA' },
    { id:'short-films',title:'Short films',image:'/assets/scenery.jpg',alt:'A winding road across dramatic copper-toned mountains',description:'A small window into a bigger world. Distinctive ideas and powerful storytelling in a shorter format.',tags:'IDEAS · CHARACTER · IMPACT' },
    { id:'music-videos',title:'Music videos',image:'/assets/music.jpg',alt:'A singer performing beneath golden stage lights',description:'Where sound finds its visual language. Music brought to life through rhythm, emotion, and imagery.',tags:'MUSIC · MOVEMENT · MOOD' },
  ],
  gallery: { description:'A glimpse of the visual worlds that inspire us.', note:'Representative imagery. UB project stills coming soon.', items:[
    {id:'journey',title:'The journey within',category:'VISUAL INSPIRATION / 01',image:'/assets/scenery.jpg',alt:'A ribbon of road winding through a vast mountain landscape'},
    {id:'frame',title:'Behind the frame',category:'ON SET / 02',image:'/assets/hero.jpg',alt:'The craft behind a film: a camera and crew working after dark'},
    {id:'rhythm',title:'Feel the rhythm',category:'MUSIC / 03',image:'/assets/music.jpg',alt:'A live performance captured in warm golden light'},
  ]},
  news:[{id:'beginning',title:'A new home for stories in Kochi.',category:'OUR BEGINNING',date:'2026',image:'/assets/ub-logo.png',body:'UB Entertainment is established in Kochi, Keralam. Our story begins with movies, short films, music videos, and a belief in the power of storytelling.'}],
  contact:{location:'Kochi, Keralam',email:'',phone:'+91 95398 66838',whatsapp:'+91 95398 66838',instagram:'',youtube:''},
};
