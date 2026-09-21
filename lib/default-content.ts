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
    {id:'dawn-serenade',title:'Echoes of the Western Ghats',category:'CINEMATIC HORIZONS / 01',image:'/assets/gallery-dawn.jpg',alt:'A solitary figure standing above mist-covered valleys in the Western Ghats at golden sunrise'},
    {id:'behind-the-lens',title:'Behind the frame',category:'ON SET PRODUCTION / 02',image:'/assets/gallery-onset.jpg',alt:'Cinema camera rig and film crew shooting a night sequence on a heritage street'},
    {id:'stage-symphony',title:'Soul in the spotlight',category:'MUSIC & RHYTHM / 03',image:'/assets/gallery-music.jpg',alt:'Performer singing into a vintage microphone under dramatic golden stage lights and smoke'},
    {id:'twilight-waters',title:'Reflections at blue hour',category:'CHARACTER & STORY / 04',image:'/assets/gallery-story.jpg',alt:'A protagonist in traditional saree looking out from a wooden houseboat window on serene backwaters'},
  ]},
  news:[{id:'beginning',title:'A new home for stories in Kochi.',category:'OUR BEGINNING',date:'2026',image:'/assets/ub-logo.png',body:'UB Entertainment is established in Kochi, Keralam. Our story begins with movies, short films, music videos, and a belief in the power of storytelling.'}],
  contact:{location:'Kochi, Keralam',email:'',phone:'+91 95398 66838',whatsapp:'+91 95398 66838',instagram:'',youtube:''},
};
