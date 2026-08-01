import assert from "node:assert/strict";
import {access} from "node:fs/promises";
import path from "node:path";
import {
  getIsoblPartnerImage,
  ISOBL_PARTNER_IMAGES,
} from "../lib/isobl-partner-images";
const ids = Object.keys(ISOBL_PARTNER_IMAGES).map(Number);

assert.deepEqual(ids, [1, 2, 3, 4, 5, 6, 7, 8]);

const sources = Object.values(ISOBL_PARTNER_IMAGES).map((image) => image.src);
assert.equal(new Set(sources).size, 8);

for (const image of Object.values(ISOBL_PARTNER_IMAGES)) {
  assert.match(
    image.src,
    /^\/media\/images\/isoble-experience-pictures\/webp\/isa-[1-8]-[a-z-]+\.webp$/,
  );
  assert.match(image.alt.de, /^Porträt von /);
  assert.match(image.alt.en, /^Portrait of /);
  await access(path.join(process.cwd(), "public", image.src));
}

assert.deepEqual(getIsoblPartnerImage(3, "de"), {
  imageSrc: "/media/images/isoble-experience-pictures/webp/isa-3-ilse-and-tim.webp",
  imageAlt: "Porträt von Ilse und Tim",
});
assert.deepEqual(getIsoblPartnerImage(3, "en"), {
  imageSrc: "/media/images/isoble-experience-pictures/webp/isa-3-ilse-and-tim.webp",
  imageAlt: "Portrait of Ilse and Tim",
});

console.log("ISOBL partner image mapping tests passed");
