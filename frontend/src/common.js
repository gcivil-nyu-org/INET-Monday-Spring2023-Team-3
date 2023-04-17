import { toaster as _toaster } from "evergreen-ui";

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

export function convertDateHumanReadable(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    date
  );
  const day = date.getDate();
  const formattedDate = `${month} ${day}, ${year}`;
  return formattedDate;
}

export const toaster = {};

toaster.success = (x) => {
  console.log(x);
  _toaster.closeAll();
  setTimeout(() => {
    _toaster.success(x);
  }, 100);
};

toaster.danger = (x) => {
  console.log(x);
  _toaster.closeAll();
  setTimeout(() => {
    _toaster.danger(x);
  }, 100);
};

toaster.notify = (x) => {
  _toaster.closeAll();
  setTimeout(() => {
    _toaster.notify(x);
  }, 100);
};

toaster.warning = (x) => {
  _toaster.closeAll();
  setTimeout(() => {
    _toaster.warning(x);
  }, 100);
};
