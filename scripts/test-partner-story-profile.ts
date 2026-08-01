import assert from "node:assert/strict";
import {createElement} from "react";
import {renderToStaticMarkup} from "react-dom/server";

const profileModule = await import("../components/partner-story-profile").catch(
  () => null,
);

assert.ok(profileModule, "Missing partner story profile component");

const withImage = renderToStaticMarkup(
  createElement(profileModule.PartnerStoryProfile, {
    name: "Ilse & Tim",
    imageSrc:
      "/media/images/isoble-experience-pictures/webp/isa-3-ilse-and-tim.webp",
    imageAlt: "Portrait of Ilse and Tim",
  }),
);

assert.match(withImage, /src="\/media\/images\/isoble-experience-pictures\/webp\/isa-3-ilse-and-tim\.webp"/);
assert.match(withImage, /alt="Portrait of Ilse and Tim"/);
assert.match(withImage, /h-\[52px\]/);
assert.match(withImage, /w-\[52px\]/);
assert.match(withImage, /rounded-full/);
assert.match(withImage, /object-cover/);
assert.match(withImage, />Ilse &amp; Tim<\/h3>/);

const withoutImage = renderToStaticMarkup(
  createElement(profileModule.PartnerStoryProfile, {name: "Story without portrait"}),
);

assert.doesNotMatch(withoutImage, /<img/);
assert.match(withoutImage, />Story without portrait<\/h3>/);

console.log("partner story profile tests passed");
