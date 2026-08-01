import {mkdir} from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const imageDirectory = path.join(
  process.cwd(),
  "public/media/images/isoble-experience-pictures",
);
const outputDirectory = path.join(imageDirectory, "webp");

const portraits = [
  {
    source: "ISA 1 Angela H. - Fitness Instructor.png",
    output: "isa-1-angela-hancock.webp",
  },
  {
    source: "ISA 2 - Heather - Business-Personal Trainer -Nutritionist.png",
    output: "isa-2-heather.webp",
  },
  {
    source: "ISA 3 - Ilse & Tim - Police officer & Sales Rep.png",
    output: "isa-3-ilse-and-tim.webp",
  },
  {
    source: "ISA 4 - Lara E. - NHS Nurse.png",
    output: "isa-4-lara-eastwood.webp",
  },
  {
    source: "ISA 5 - Lissa A. - Beauty Salon Owner.png",
    output: "isa-5-lissa-asselbergs.webp",
  },
  {
    source: "ISA 6 - SASKIA - Personal Trainer & Nutritionist.png",
    output: "isa-6-saskia.webp",
  },
  {
    source: "ISA 7 - Tinashe - Sales Professional with Health Background.png",
    output: "isa-7-tinashe.webp",
  },
  {
    source: "ISA 8 - Michael B. - Gym Owner & Personal Trainer.png",
    output: "isa-8-michael-bockaert.webp",
  },
];

await mkdir(outputDirectory, {recursive: true});

for (const portrait of portraits) {
  await sharp(path.join(imageDirectory, portrait.source))
    .resize(480, 480, {fit: "cover", position: "centre"})
    .webp({quality: 82, effort: 6})
    .toFile(path.join(outputDirectory, portrait.output));
}

console.log(`Generated ${portraits.length} ISOBL WebP profile images`);
