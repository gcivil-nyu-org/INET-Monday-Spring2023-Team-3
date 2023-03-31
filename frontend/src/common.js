export function secondsToHms(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " hour " : " hours ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " min " : " mins ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return hDisplay + mDisplay;
}

export const TRANSIT_TYPES = {
  DRIVING: "Drive",
  WALKING: "Walk",
  TRANSIT: "Transit",
  BICYCLING: "Bicycle",
};
