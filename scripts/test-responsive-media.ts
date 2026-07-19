import assert from "node:assert/strict";
import {mediaImageProps} from "../lib/responsive-media.ts";

assert.equal(mediaImageProps({url: "/old.jpg", variants: {}, width: null, height: null, focalX: 0.5, focalY: 0.5}).srcSet, undefined);
const props = mediaImageProps({url: "/lg.webp", variants: {lg: {url: "/lg.webp", width: 1920, height: 1080}, sm: {url: "/sm.webp", width: 640, height: 360}}, width: 2000, height: 1200, focalX: 0.25, focalY: 0.75});
assert.equal(props.srcSet, "/sm.webp 640w, /lg.webp 1920w");
assert.deepEqual(props.style, {objectPosition: "25% 75%"});
console.log("responsive media: ok");
