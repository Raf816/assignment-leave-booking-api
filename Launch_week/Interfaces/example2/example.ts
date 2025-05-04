import { Speaker } from "./Speaker"; 

const speaker = new Speaker("Sonos 1");

console.log(speaker.toString());
speaker.turnDown();
console.log(speaker.toString());

speaker.turnUp();
console.log(speaker.toString());

speaker.toggleMute();
console.log(speaker.toString());

speaker.toggleMute();
console.log(speaker.toString());