// One-shot static site generator for TopInkjet.
// Generates: products.json + every HTML page, copies & renames product images.
// The OUTPUT (site/) is pure HTML/CSS/JS — this script is a developer tool
// only, never executed at runtime, never shipped to users.
//
// Run: node artifacts/topinkjet/build-site.mjs
// (Run from repo root.)

import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const ROOT = path.resolve("artifacts/topinkjet");
const SITE = path.join(ROOT, "site");
const SRC_IMG = path.resolve("attached_assets/_extracted");

// Detect which ImageMagick binary is available.
//   - ImageMagick 7 (Replit, Homebrew) → `magick`
//   - ImageMagick 6 (Ubuntu apt default, used in CI) → `convert`
// All flags used below (-auto-orient/-strip/-background/-flatten/-resize/-quality)
// are supported by both versions, so swapping the binary is enough.
function detectImageMagick() {
  for (const bin of ["magick", "convert"]) {
    const r = spawnSync(bin, ["-version"], { stdio: "ignore" });
    if (r.status === 0) return bin;
  }
  throw new Error(
    "ImageMagick not found. Install `imagemagick` (provides `convert`) or ImageMagick 7 (provides `magick`)."
  );
}
const IM_BIN = detectImageMagick();

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function write(rel, content) {
  const full = path.join(SITE, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content);
}

// Resize an image with ImageMagick. Skips work if the destination already
// exists and is newer than the source. The `>` after the resize geometry
// means "only shrink, never enlarge".
function resizeImg(srcAbs, destAbs, { maxWidth, quality }) {
  ensureDir(path.dirname(destAbs));
  try {
    const ds = fs.statSync(destAbs);
    const ss = fs.statSync(srcAbs);
    if (ds.mtimeMs >= ss.mtimeMs) return;
  } catch { /* dest missing — fall through and build */ }
  const args = [
    srcAbs,
    "-auto-orient",
    "-strip",
    "-background", "white",
    "-flatten",
    "-resize", `${maxWidth}x${maxWidth}>`,
    "-quality", String(quality),
    destAbs,
  ];
  execFileSync(IM_BIN, args, { stdio: "pipe" });
}

// ---------- Product catalog (real HP printers from the attached zips) ----------
// Image picking: each folder has 4-6 images; we take the cleanest 4 and rename.
// We pass exact source filenames so the pipeline is deterministic.

const PRODUCTS = [
  // ----- OFFICE (8) -----
  {
    id: "TI-OJ-8015E", slug: "hp-officejet-8015e", category: "office-inkjet",
    brand: "HP", name: "HP OfficeJet 8015e All-in-One Printer",
    price: 179.99, sku: "1G5M5A",
    folder: "8015e",
    images: [
      "HP OfficeJet 8015e All-in-One Printer with 6 Months of Instant Ink for free with HP+.png",
      "HP OfficeJet 8015e All-in-One Printer with 6 Months of Instant Ink for free with HP+2.jpg",
      "HP OfficeJet 8015e All-in-One Printer with 6 Months of Instant Ink for free with HP+3.jpg",
      "HP OfficeJet 8015e All-in-One Printer with 6 Months of Instant Ink for free with HP+4.webp",
    ],
    short: "Wireless all-in-one inkjet for small offices — print, scan, copy, fax with automatic two-sided printing.",
    long: "The HP OfficeJet 8015e is a workhorse for the busy small office. It pairs fast color inkjet output with a 35-page automatic document feeder, automatic two-sided printing, and a 225-sheet input tray, so you spend less time at the printer and more time on the work that matters. Wireless dual-band Wi-Fi, AirPrint, and the HP Smart app keep printing simple from any device on your network.",
    specs: {
      "Functions": "Print, scan, copy, fax",
      "Print Speed": "Up to 18 ppm black / 10 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Wi-Fi Direct, USB 2.0",
      "Paper Capacity": "225 sheets input, 60-sheet output",
      "ADF": "35-sheet automatic document feeder",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.2-inch mono touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Mopria",
      "Dimensions": "17.5 x 13.4 x 8.4 in",
      "Weight": "17.6 lb",
    },
  },
  {
    id: "TI-OJP-8125E", slug: "hp-officejet-pro-8125e", category: "office-inkjet",
    brand: "HP", name: "HP OfficeJet Pro 8125e All-in-One Printer",
    price: 199.99, sku: "405T6A",
    folder: "8125e",
    images: [
      "HP-OfficeJet-Pro-8125e-AiO-405T6A-1659x1246.png.jpg",
      "Moreto_HiBase_LightCement_Catalog_WhiteBG_LeftProfile_M1550395.png",
      "Moreto_HiBase_LightCement_Catalog_WhiteBG_Top_ScannerOpen_M1550393.png",
      "Moreto_HiBase_LightCement_Catalog_WhiteBG_ControlPanelDetail_M1550396.png",
    ],
    short: "Compact OfficeJet Pro all-in-one with auto-duplex printing and a 35-sheet ADF for everyday office work.",
    long: "The HP OfficeJet Pro 8125e is built for offices that print, scan, and copy every day. A 250-sheet input tray, automatic two-sided printing, and a 35-page ADF keep documents moving, while the 2.7-inch color touchscreen makes settings simple. Print, scan, and share securely from anywhere with the HP Smart app.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 20 ppm black / 10 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth Low Energy, USB 2.0",
      "Paper Capacity": "250 sheets input",
      "ADF": "35-sheet automatic document feeder",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.7-inch color touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.0 x 14.4 x 9.7 in",
      "Weight": "18.0 lb",
    },
  },
  {
    id: "TI-OJP-8135E", slug: "hp-officejet-pro-8135e", category: "office-inkjet",
    brand: "HP", name: "HP OfficeJet Pro 8135e All-in-One Printer",
    price: 229.99, sku: "404M2A",
    folder: "8135e",
    images: [
      "HP OfficeJet Pro 8135e Wireless All-in-One Printer with 3 Months of Instant Ink for free with HP+.png",
      "HP OfficeJet Pro 8135e Wireless All-in-One Printer with 3 Months of Instant Ink for free with HP+2.png",
      "HP OfficeJet Pro 8135e Wireless All-in-One Printer with 3 Months of Instant Ink for free with HP+3.png",
      "HP OfficeJet Pro 8135e Wireless All-in-One Printer with 3 Months of Instant Ink for free with HP+4.png",
    ],
    short: "Mid-range OfficeJet Pro with mobile fax, larger paper capacity, and a 2.7-inch color touchscreen.",
    long: "Step up to the HP OfficeJet Pro 8135e for offices that need fax in the mix. The 8135e adds mobile fax via the HP Smart app, dual-band Wi-Fi for reliable connectivity, and a 250-sheet paper tray. The 35-sheet ADF and automatic two-sided printing handle stacks of paperwork without intervention.",
    specs: {
      "Functions": "Print, scan, copy, mobile fax",
      "Print Speed": "Up to 20 ppm black / 10 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth LE, USB 2.0",
      "Paper Capacity": "250 sheets input",
      "ADF": "35-sheet automatic document feeder",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.7-inch color touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.0 x 14.4 x 9.7 in",
      "Weight": "18.5 lb",
    },
  },
  {
    id: "TI-OJP-8139E", slug: "hp-officejet-pro-8139e", category: "office-inkjet",
    brand: "HP", name: "HP OfficeJet Pro 8139e All-in-One Printer",
    price: 259.99, sku: "404M3A",
    folder: "8139e",
    images: [
      "HP OfficeJet Pro 8139e Wireless All-in-One Printer with 1 Full Year Instant Ink with HP+.png",
      "HP OfficeJet Pro 8139e Wireless All-in-One Printer with 1 Full Year Instant Ink with HP+2.png",
      "HP OfficeJet Pro 8139e Wireless All-in-One Printer with 1 Full Year Instant Ink with HP+3.png",
      "HP OfficeJet Pro 8139e Wireless All-in-One Printer with 1 Full Year Instant Ink with HP+4.png",
    ],
    short: "Top-tier OfficeJet Pro 8000-series with full-year ink program eligibility and high-volume features.",
    long: "The OfficeJet Pro 8139e is the high-volume sibling in the 8000 series. Designed for teams that print thousands of pages a month, it pairs a 250-sheet tray with a 35-page ADF, auto-duplex printing, and full mobile management. The HP+ smart printing system delivers extra security and convenient cloud features.",
    specs: {
      "Functions": "Print, scan, copy, mobile fax",
      "Print Speed": "Up to 20 ppm black / 10 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth LE, USB 2.0",
      "Paper Capacity": "250 sheets input",
      "ADF": "35-sheet automatic document feeder",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.7-inch color touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.0 x 14.4 x 9.7 in",
      "Weight": "18.5 lb",
    },
  },
  {
    id: "TI-OJP-9110B", slug: "hp-officejet-pro-9110b", category: "office-inkjet",
    brand: "HP", name: "HP OfficeJet Pro 9110b Wireless Printer",
    price: 299.99, sku: "4V2L4A",
    folder: "9110",
    images: [
      "HP OfficeJet Pro 9110b Wireless Printer with PDL Page Descriptive Language Support.jpg",
      "HP OfficeJet Pro 9110b Wireless Printer with PDL Page Descriptive Language Support2.png",
      "HP OfficeJet Pro 9110b Wireless Printer with PDL Page Descriptive Language Support3.png",
      "HP OfficeJet Pro 9110b Wireless Printer with PDL Page Descriptive Language Support4.png",
    ],
    short: "Single-function color inkjet with PDL (PCL/PostScript) page-description language support for managed offices.",
    long: "The HP OfficeJet Pro 9110b is a print-only color inkjet built for managed office environments. PCL and PostScript emulation make it a drop-in replacement for legacy laser fleets, while a 250-sheet input tray and automatic two-sided printing keep it productive. Native dual-band Wi-Fi and Gigabit Ethernet round out the connectivity options.",
    specs: {
      "Functions": "Print only",
      "Print Speed": "Up to 25 ppm black / 20 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Gigabit Ethernet, USB 2.0",
      "Paper Capacity": "250 sheets input, 60-sheet output",
      "Page Description": "PCL 5c, PCL 6, PostScript 3 emulation, PDF",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.0-inch mono LCD",
      "Mobile Printing": "HP Smart, AirPrint, Mopria",
      "Dimensions": "16.7 x 14.0 x 8.0 in",
      "Weight": "16.5 lb",
    },
  },
  {
    id: "TI-OJP-9125E", slug: "hp-officejet-pro-9125e", category: "office-inkjet",
    brand: "HP", name: "HP OfficeJet Pro 9125e All-in-One Printer",
    price: 329.99, sku: "403X9A",
    folder: "9125e",
    images: [
      "HP OfficeJet Pro 9125e All-in-One Printer with 3 Months of Instant Ink for free with HP+.png",
      "HP OfficeJet Pro 9125e All-in-One Printer with 3 Months of Instant Ink for free with HP+2.png",
      "HP OfficeJet Pro 9125e All-in-One Printer with 3 Months of Instant Ink for free with HP+3.jpg",
      "HP OfficeJet Pro 9125e All-in-One Printer with 3 Months of Instant Ink for free with HP+4.png",
    ],
    short: "Premium OfficeJet Pro all-in-one with 35-sheet duplex ADF, fast scanning, and color touch UI.",
    long: "The HP OfficeJet Pro 9125e is built for the demanding small office. A duplex 35-page ADF lets you scan, copy, and fax double-sided documents in a single pass. With print speeds up to 22 ppm and a 250-sheet input tray, it powers through long jobs while keeping the desk footprint compact.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 22 ppm black / 18 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Gigabit Ethernet, Bluetooth LE, USB 2.0",
      "Paper Capacity": "250 sheets input",
      "ADF": "35-sheet duplex ADF",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.7-inch color touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Mopria",
      "Dimensions": "17.3 x 14.4 x 11.5 in",
      "Weight": "21.5 lb",
    },
  },
  {
    id: "TI-OJP-9135E", slug: "hp-officejet-pro-9135e", category: "office-inkjet",
    brand: "HP", name: "HP OfficeJet Pro 9135e All-in-One Printer",
    price: 379.99, sku: "404M0A",
    folder: "9135e",
    images: [
      "HP-OfficeJet-Pro-9135e-AiO-404M0A-Front-1659x1246.png",
      "HP OfficeJet Pro 9135e Wireless All-in-One Printer with 3 Months of Instant Ink for free with HP+2.png",
      "HP OfficeJet Pro 9135e Wireless All-in-One Printer with 3 Months of Instant Ink for free with HP+3.jpg",
      "HP OfficeJet Pro 9135e Wireless All-in-One Printer with 3 Months of Instant Ink for free with HP+5.png",
    ],
    short: "Top-of-line 9000-series with mobile fax, Gigabit Ethernet, and the largest paper capacity in its class.",
    long: "The HP OfficeJet Pro 9135e adds mobile fax to the 9125e platform and pushes paper capacity to 250 sheets with an additional 35-page duplex ADF. With Gigabit Ethernet, dual-band Wi-Fi, and PCL emulation, it integrates into modern office networks with ease. The 2.7-inch color touchscreen brings smart-app workflows to your fingertips.",
    specs: {
      "Functions": "Print, scan, copy, mobile fax",
      "Print Speed": "Up to 22 ppm black / 18 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Gigabit Ethernet, Bluetooth LE, USB 2.0",
      "Paper Capacity": "250 sheets input",
      "ADF": "35-sheet duplex ADF",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.7-inch color touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Mopria",
      "Dimensions": "17.3 x 14.4 x 11.5 in",
      "Weight": "21.5 lb",
    },
  },
  {
    id: "TI-OJP-9730E", slug: "hp-officejet-pro-9730e-wide-format", category: "office-inkjet",
    brand: "HP", name: "HP OfficeJet Pro 9730e Wide Format All-in-One Printer",
    price: 549.99, sku: "537P6A",
    folder: "9730e",
    images: [
      "HP-OfficeJet-Pro-9730e-WideFormat-537P6A-Eddington-1659x1246.png.jpg",
      "Eddington_OJPro_Cement_Catalog_WhiteBG_FrontLeft_wOutput_M1600606.png",
      "Eddington_OJPro_Cement_Catalog_WhiteBG_LeftProfile_M1600615.png",
      "Eddington_OJPro_Cement_Catalog_WhiteBG_Rear_M1600616.png",
    ],
    short: "Wide-format A3/11x17 all-in-one for offices that print spreadsheets, drawings, and tabloid-size documents.",
    long: "The HP OfficeJet Pro 9730e is built for offices that need full A3 / 11x17 inch tabloid output. Print, scan, copy, and fax wide-format documents with an automatic duplex 35-page ADF and dual paper trays totaling 500 sheets. A 4.3-inch color touchscreen makes large-format job setup a breeze. Ideal for architects, real-estate, education, and finance teams.",
    specs: {
      "Functions": "Print, scan, copy, fax",
      "Maximum Paper Size": "11 x 17 in (A3 / Tabloid)",
      "Print Speed": "Up to 25 ppm black / 20 ppm color",
      "Print Quality": "Up to 2400 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Gigabit Ethernet, USB 2.0",
      "Paper Capacity": "500 sheets total (2 trays)",
      "ADF": "35-sheet duplex ADF",
      "Duplex": "Automatic two-sided printing",
      "Display": "4.3-inch color touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Mopria",
      "Dimensions": "21.5 x 17.5 x 13.4 in",
      "Weight": "32.4 lb",
    },
  },

  // ----- HOME (14) -----
  {
    id: "TI-DJ-2827E", slug: "hp-deskjet-2827e", category: "home-inkjet",
    brand: "HP", name: "HP DeskJet 2827e All-in-One Printer",
    price: 89.99, sku: "60K70A",
    folder: "2827e",
    images: [
      "61vyxWYQnzL._AC_SL1500_.jpg",
      "61vn0N88ROL._AC_SL1500_.jpg",
      "61g0ZhtFErL._AC_SL1500_.jpg",
      "71o2CDNDrDL._AC_SL1500_.jpg",
    ],
    short: "Compact, affordable home all-in-one for everyday print, scan, and copy with the HP Smart app.",
    long: "The HP DeskJet 2827e is the easy-to-set-up home printer that handles homework, recipes, photos, and forms. Print and scan from any device using the HP Smart app, connect via dual-band Wi-Fi, and stay supplied with optional Instant Ink delivery. A footprint that fits any desk and a price tag that fits any household budget.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 7.5 ppm black / 5.5 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), USB 2.0",
      "Paper Capacity": "60 sheets input, 25-sheet output",
      "Scanner": "Flatbed, up to 1200 dpi",
      "Display": "Icon LCD",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "16.7 x 12.0 x 6.0 in",
      "Weight": "8.2 lb",
    },
  },
  {
    id: "TI-DJ-2855E", slug: "hp-deskjet-2855e", category: "home-inkjet",
    brand: "HP", name: "HP DeskJet 2855e All-in-One Printer",
    price: 99.99, sku: "60K71A",
    folder: "2855e",
    images: [
      "HP DeskJet 2855e All-in-One Printer with 3 Months of Instant Ink for free with HP+.jpg",
      "HP DeskJet 2855e All-in-One Printer with 3 Months of Instant Ink for free with HP+2.jpg",
      "HP DeskJet 2855e All-in-One Printer with 3 Months of Instant Ink for free with HP+3.png",
      "HP DeskJet 2855e All-in-One Printer with 3 Months of Instant Ink for free with HP+4.png",
    ],
    short: "Reliable color all-in-one for households that need easy printing, copying, and scanning at home.",
    long: "The HP DeskJet 2855e brings simple, reliable color printing to any home. Set up in minutes with the HP Smart app, then print, scan, and copy from your phone, tablet, or laptop. A built-in dual-band Wi-Fi connection means you stay connected without extra hardware, and Instant Ink eligibility keeps replacement cartridges arriving on schedule.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 7.5 ppm black / 5.5 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), USB 2.0",
      "Paper Capacity": "60 sheets input, 25-sheet output",
      "Scanner": "Flatbed, up to 1200 dpi",
      "Display": "Icon LCD",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "16.7 x 12.0 x 6.0 in",
      "Weight": "8.2 lb",
    },
  },
  {
    id: "TI-DJ-4255E", slug: "hp-deskjet-4255e", category: "home-inkjet",
    brand: "HP", name: "HP DeskJet 4255e All-in-One Printer",
    price: 129.99, sku: "588S6A",
    folder: "4255e",
    images: [
      "HP DeskJet 4255e All-in-One Printer with 3 Months of Instant Ink for free with HP+.jpg",
      "HP DeskJet 4255e All-in-One Printer with 3 Months of Instant Ink for free with HP+2.jpg",
      "HP DeskJet 4255e All-in-One Printer with 3 Months of Instant Ink for free with HP+3.png",
      "HP DeskJet 4255e All-in-One Printer with 3 Months of Instant Ink for free with HP+4.jpg",
    ],
    short: "Step-up DeskJet with automatic document feeder and faster print speeds for busier households.",
    long: "The HP DeskJet 4255e steps up from the entry-level DeskJets with a 35-sheet automatic document feeder, making multi-page scans and copies effortless. Faster print speeds, dual-band Wi-Fi, and the HP Smart app make it the right pick for hybrid workers, students, and families with regular printing needs.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 8.5 ppm black / 5.5 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), USB 2.0",
      "Paper Capacity": "60 sheets input",
      "ADF": "35-sheet automatic document feeder",
      "Scanner": "Flatbed, up to 1200 dpi",
      "Display": "2.0-inch mono touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.7 x 14.0 x 7.6 in",
      "Weight": "11.4 lb",
    },
  },
  {
    id: "TI-EN-6155E", slug: "hp-envy-6155e", category: "home-inkjet",
    brand: "HP", name: "HP Envy 6155e All-in-One Printer",
    price: 179.99, sku: "223N1A",
    folder: "6155e",
    images: [
      "HP Envy 6155e All-in-One Printer w:bonus 3 months Instant Ink through HP+.jpg",
      "HP Envy 6155e All-in-One Printer w:bonus 3 months Instant Ink through HP+2.jpg",
      "HP Envy 6155e All-in-One Printer w:bonus 3 months Instant Ink through HP+3.png",
      "HP Envy 6155e All-in-One Printer w:bonus 3 months Instant Ink through HP+4.jpg",
    ],
    short: "Stylish home printer with auto-duplex printing and borderless photos for hybrid work and creativity.",
    long: "The HP Envy 6155e blends lifestyle design with serious capability. Print sharp documents, glossy borderless 4x6 photos, and double-sided pages automatically. The minimal silhouette suits any room, while the HP Smart app turns your phone into a remote print and scan hub.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 10 ppm black / 7 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth LE, USB 2.0",
      "Paper Capacity": "100 sheets input",
      "Photo Output": "Borderless up to 8.5 x 11 in",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.0-inch mono touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.0 x 14.0 x 5.5 in",
      "Weight": "11.0 lb",
    },
  },
  {
    id: "TI-EN-6555E", slug: "hp-envy-6555e", category: "home-inkjet",
    brand: "HP", name: "HP Envy 6555e All-in-One Printer",
    price: 199.99, sku: "223N2A",
    folder: "6555e",
    images: [
      "HP Envy 6555e All-in-One Printer with 3 Months of Instant Ink for free with HP+.jpg",
      "HP Envy 6555e All-in-One Printer with 3 Months of Instant Ink for free with HP+2.jpg",
      "HP Envy 6555e All-in-One Printer with 3 Months of Instant Ink for free with HP+3.jpg",
      "HP Envy 6555e All-in-One Printer with 3 Months of Instant Ink for free with HP+ copy.jpg",
    ],
    short: "Slim Envy all-in-one with auto-duplex, borderless photos, and quiet operation for shared spaces.",
    long: "The HP Envy 6555e is designed to live anywhere — kitchen counter, home office, or family hub. Whisper-quiet operation, auto-duplex printing, and the ability to produce borderless photos up to 8.5x11 make it as flexible as it is stylish. Set up in minutes from the HP Smart app and start printing from any device.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 10 ppm black / 7 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth LE, USB 2.0",
      "Paper Capacity": "100 sheets input",
      "Photo Output": "Borderless up to 8.5 x 11 in",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.0-inch mono touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.0 x 14.0 x 5.5 in",
      "Weight": "11.0 lb",
    },
  },
  {
    id: "TI-EI-7255E", slug: "hp-envy-inspire-7255e", category: "home-inkjet",
    brand: "HP", name: "HP ENVY Inspire 7255e All-in-One Printer",
    price: 229.99, sku: "1W2Y8A",
    folder: "7255e",
    images: [
      "HP ENVY Inspire 7255e All-in-One Printer with 3 Months of Instant Ink for free with HP+.jpg",
      "HP ENVY Inspire 7255e All-in-One Printer with 3 Months of Instant Ink for free with HP+2.png.webp",
      "HP ENVY Inspire 7255e All-in-One Printer with 3 Months of Instant Ink for free with HP+3.jpg.webp",
      "HP ENVY Inspire 7255e All-in-One Printer with 3 Months of Instant Ink for free with HP+4.jpg.webp",
    ],
    short: "Photo-focused all-in-one with dedicated photo tray, vibrant color, and a 2.7-inch color touchscreen.",
    long: "The HP ENVY Inspire 7255e is built for makers and memory keepers. A dedicated photo tray loads 4x5 paper without unloading your everyday letter stock, and the upgraded inkjet color brings photos and creative projects to life. The 2.7-inch color touchscreen makes printing crafts, school projects, and family albums simple.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 15 ppm black / 10 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth LE, USB 2.0",
      "Paper Capacity": "125 sheets main + photo tray",
      "Photo Output": "Borderless up to 8.5 x 11 in, dedicated photo tray",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.7-inch color touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.3 x 16.7 x 7.8 in",
      "Weight": "16.6 lb",
    },
  },
  {
    id: "TI-EI-7955E", slug: "hp-envy-inspire-7955e", category: "home-inkjet",
    brand: "HP", name: "HP ENVY Inspire 7955e All-in-One Printer",
    price: 249.99, sku: "1W2Y8A-7955",
    folder: "7955e",
    images: [
      "HP ENVY Inspire 7955e All-in-One Printer with 3 Months of Instant Ink for free with HP+.jpg",
      "HP ENVY Inspire 7955e All-in-One Printer with 3 Months of Instant Ink for free with HP+3.jpg",
      "HP ENVY Inspire 7955e All-in-One Printer with 3 Months of Instant Ink for free with HP+4.jpg.webp",
      "HP ENVY Inspire 7955e All-in-One Printer with 3 Months of Instant Ink for free with HP+5.jpg.webp",
    ],
    short: "Photo and craft printer with auto-duplex, dedicated photo tray, and full color touchscreen.",
    long: "The HP ENVY Inspire 7955e is the dependable home creative companion. With a dedicated photo tray, a 2.7-inch color touchscreen, and great color reproduction, it's a smart pick for photo enthusiasts and makers. Auto-duplex printing keeps long documents quick and efficient, and dual-band Wi-Fi means it just works on modern home networks.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 15 ppm black / 10 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth LE, USB 2.0",
      "Paper Capacity": "125 sheets main + photo tray",
      "Photo Output": "Borderless up to 8.5 x 11 in, dedicated photo tray",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.7-inch color touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.3 x 16.7 x 7.8 in",
      "Weight": "16.6 lb",
    },
  },
  {
    id: "TI-EI-7958E", slug: "hp-envy-inspire-7958e", category: "home-inkjet",
    brand: "HP", name: "HP ENVY Inspire 7958e All-in-One Printer",
    price: 259.99, sku: "1W2Y8B",
    folder: "7958e",
    images: [
      "7958e1.jpg",
      "7958e3.jpg",
      "7958e4.png",
      "7958e5.jpg",
    ],
    short: "Premium ENVY Inspire with photo tray and crisp color for serious home creators.",
    long: "The ENVY Inspire 7958e tops the home creator lineup with photo-quality color, a dedicated 5x5 photo tray, and a polished 2.7-inch color touchscreen. Use the HP Smart app to print, scan, and share from anywhere on your network, and rely on auto-duplex to keep long projects efficient.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 15 ppm black / 10 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth LE, USB 2.0",
      "Paper Capacity": "125 sheets main + photo tray",
      "Photo Output": "Borderless up to 8.5 x 11 in, dedicated photo tray",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.7-inch color touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.3 x 16.7 x 7.8 in",
      "Weight": "16.6 lb",
    },
  },
  {
    id: "TI-ST-5101", slug: "hp-smart-tank-5101", category: "home-inkjet",
    brand: "HP", name: "HP Smart Tank 5101 All-in-One Printer",
    price: 199.99, sku: "1F3Y0A",
    folder: "5101",
    images: [
      "HP Smart Tank 5101 All-in-One Printer.png",
      "HP Smart Tank 5101 All-in-One Printer2.jpg",
      "HP Smart Tank 5101 All-in-One Printer3.jpg.webp",
      "HP Smart Tank 5101 All-in-One Printer5.jpg",
    ],
    short: "Cartridge-free Smart Tank printer with up to 2 years of ink in the box for ultra-low cost per page.",
    long: "The HP Smart Tank 5101 takes the cartridge out of the equation. Refillable ink tanks deliver up to two years of ink in the box, dropping cost per page to a fraction of a typical cartridge printer. Wireless connectivity, mobile printing, and easy refill bottles make it a long-term workhorse for the home.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 12 ppm black / 5 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), USB 2.0",
      "Paper Capacity": "100 sheets input",
      "Ink System": "Refillable ink tanks (cartridge-free)",
      "Pages in Box": "Up to 6,000 black / 6,000 color",
      "Display": "Icon LCD",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "20.5 x 14.4 x 6.4 in",
      "Weight": "11.5 lb",
    },
  },
  {
    id: "TI-ST-5103", slug: "hp-smart-tank-5103", category: "home-inkjet",
    brand: "HP", name: "HP Smart Tank 5103 All-in-One Printer",
    price: 219.99, sku: "1F3Y2A",
    folder: "5103",
    images: [
      "HP Smart Tank 5103 All-in-One Printer.png",
      "HP Smart Tank 5103 All-in-One Printer2.png",
      "HP Smart Tank 5103 All-in-One Printer4.jpg",
      "HP Smart Tank 5103 All-in-One Printer5.png",
    ],
    short: "Smart Tank with bundled extra ink, refillable tanks, and steady mobile printing for the family.",
    long: "Same dependable cartridge-free system as the 5101 with extra ink in the box. The Smart Tank 5103 is the value pick for households printing hundreds of pages a month who want to forget about cartridge runs and keep cost per page rock bottom.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 12 ppm black / 5 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), USB 2.0",
      "Paper Capacity": "100 sheets input",
      "Ink System": "Refillable ink tanks (cartridge-free)",
      "Pages in Box": "Up to 6,000 black / 6,000 color",
      "Display": "Icon LCD",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "20.5 x 14.4 x 6.4 in",
      "Weight": "11.5 lb",
    },
  },
  {
    id: "TI-ST-6001", slug: "hp-smart-tank-6001", category: "home-inkjet",
    brand: "HP", name: "HP Smart Tank 6001 All-in-One Printer",
    price: 249.99, sku: "2H0B9A",
    folder: "6001",
    images: [
      "HP Smart Tank 6001 All in One Printer.png",
      "HP Smart Tank 6001 All in One Printer2.jpg",
      "HP Smart Tank 6001 All in One Printer3.jpg.webp",
      "HP Smart Tank 6001 All in One Printer5.jpg",
    ],
    short: "Cartridge-free Smart Tank with auto-duplex, modern design, and outstanding cost per page.",
    long: "The HP Smart Tank 6001 layers automatic two-sided printing on top of the cartridge-free Smart Tank platform. The clean, modern shell looks at home in any room, and the see-through ink tanks let you check supply at a glance. With up to 2 years of ink in the box, it's the most economical way to print at home.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 12 ppm black / 7 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth LE, USB 2.0",
      "Paper Capacity": "150 sheets input",
      "Ink System": "Refillable ink tanks (cartridge-free)",
      "Pages in Box": "Up to 6,000 black / 6,000 color",
      "Duplex": "Automatic two-sided printing",
      "Display": "1.45-inch mono touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.5 x 14.4 x 7.6 in",
      "Weight": "13.0 lb",
    },
  },
  {
    id: "TI-ST-7001", slug: "hp-smart-tank-7001", category: "office-inkjet",
    brand: "HP", name: "HP Smart Tank 7001 All-in-One Printer",
    price: 289.99, sku: "28B49A",
    folder: "7001",
    images: [
      "Sayan_WL_7001_Light_Basalt_Coreset_FrontOutput_M1639110.png",
      "11_HP_Smart_Tank_7001_28B49A_KSP9_BL_M1891467.jpg",
      "Sayan_WL_7001_Light_Basalt_Coreset_FrontLeftOutput_M2016579.jpg",
      "Sayan_WL_7001_Light_Basalt_Coreset_FrontRightOutput_M2016581.jpg",
    ],
    short: "Stylish Smart Tank with high-yield refillable ink, auto-duplex, and a quiet design for the home.",
    long: "The HP Smart Tank 7001 brings refined design to the cartridge-free Smart Tank family. A larger paper tray, automatic duplex printing, and quiet operation make it a great fit for home offices and shared family spaces. Up to 2 years of ink in the box keeps your total cost of ownership remarkably low.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 15 ppm black / 9 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth LE, USB 2.0",
      "Paper Capacity": "250 sheets input",
      "Ink System": "Refillable ink tanks (cartridge-free)",
      "Pages in Box": "Up to 6,000 black / 6,000 color",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.0-inch mono touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.4 x 14.7 x 7.8 in",
      "Weight": "14.7 lb",
    },
  },
  {
    id: "TI-ST-7301", slug: "hp-smart-tank-7301", category: "office-inkjet",
    brand: "HP", name: "HP Smart Tank 7301 All-in-One Printer",
    price: 319.99, sku: "28B69A",
    folder: "7301",
    images: [
      "HP Smart Tank 7301 All-in-One Printer.png",
      "HP Smart Tank 7301 All-in-One Printer2.png",
      "HP Smart Tank 7301 All-in-One Printer3.jpg",
      "HP Smart Tank 7301 All-in-One Printer4.png",
    ],
    short: "Smart Tank with ADF, auto-duplex, and refillable tanks for productive home offices.",
    long: "The HP Smart Tank 7301 layers a 35-page automatic document feeder onto the Smart Tank platform, making it the perfect home-office printer. Scan and copy multi-page documents while keeping cost per page tiny thanks to refillable ink tanks. Wireless dual-band Wi-Fi and a 2.0-inch touchscreen finish the package.",
    specs: {
      "Functions": "Print, scan, copy",
      "Print Speed": "Up to 15 ppm black / 9 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth LE, USB 2.0",
      "Paper Capacity": "250 sheets input",
      "ADF": "35-sheet automatic document feeder",
      "Ink System": "Refillable ink tanks (cartridge-free)",
      "Pages in Box": "Up to 6,000 black / 6,000 color",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.0-inch mono touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.4 x 14.7 x 9.9 in",
      "Weight": "16.5 lb",
    },
  },
  {
    id: "TI-ST-7602", slug: "hp-smart-tank-7602", category: "office-inkjet",
    brand: "HP", name: "HP Smart Tank 7602 All-in-One Printer",
    price: 349.99, sku: "28C20A",
    folder: "7602",
    images: [
      "HP Smart Tank 7602 All-in-One.jpg",
      "HP Smart Tank 7602 All-in-One2.png.webp",
      "HP Smart Tank 7602 All-in-One3.jpg.webp",
      "HP Smart Tank 7602 All-in-One4.jpg",
    ],
    short: "Top-tier Smart Tank with mobile fax, ADF, photo printing, and refillable tanks for power home users.",
    long: "The HP Smart Tank 7602 is the most full-featured printer in the Smart Tank lineup. Mobile fax, a 35-page ADF, automatic duplex printing, and a 2.7-inch color touchscreen make it a true do-it-all device. With up to 2 years of ink in the box, it's an investment that pays for itself page after page.",
    specs: {
      "Functions": "Print, scan, copy, mobile fax",
      "Print Speed": "Up to 15 ppm black / 9 ppm color",
      "Print Quality": "Up to 4800 x 1200 dpi color",
      "Connectivity": "Wi-Fi (dual-band), Bluetooth LE, USB 2.0",
      "Paper Capacity": "250 sheets input",
      "ADF": "35-sheet automatic document feeder",
      "Ink System": "Refillable ink tanks (cartridge-free)",
      "Pages in Box": "Up to 6,000 black / 6,000 color",
      "Duplex": "Automatic two-sided printing",
      "Display": "2.7-inch color touchscreen",
      "Mobile Printing": "HP Smart, AirPrint, Wi-Fi Direct",
      "Dimensions": "17.4 x 14.7 x 9.9 in",
      "Weight": "16.7 lb",
    },
  },
];

console.log(`[products] ${PRODUCTS.length} total — ${PRODUCTS.filter(p=>p.category==='office-inkjet').length} office, ${PRODUCTS.filter(p=>p.category==='home-inkjet').length} home`);

// ---------- Copy + rename product images ----------
function extByPicker(name) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".png.webp")) return ".webp";
  if (lower.endsWith(".jpg.webp")) return ".webp";
  if (lower.endsWith(".png.avif")) return ".avif";
  if (lower.endsWith(".webp")) return ".webp";
  if (lower.endsWith(".avif")) return ".avif";
  if (lower.endsWith(".png.jpg")) return ".jpg";
  if (lower.endsWith(".png")) return ".png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return ".jpg";
  return path.extname(name) || ".jpg";
}

// Discover ALL real product images per folder so the gallery uses every photo
// the supplier shipped (5–7 per SKU), not just the first 4.
function discoverFolderImages(folder, hardcoded) {
  const dir = path.join(SRC_IMG, folder);
  if (!fs.existsSync(dir)) return hardcoded.slice();
  const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
  const found = fs.readdirSync(dir).filter((f) => {
    const ext = path.extname(f).toLowerCase();
    // accept doubled extensions like ".png.webp" / ".png.jpg" / ".png.avif"
    if (allowed.has(ext)) return true;
    const lower = f.toLowerCase();
    return lower.endsWith(".png.webp") || lower.endsWith(".jpg.webp") ||
           lower.endsWith(".png.avif") || lower.endsWith(".png.jpg");
  });
  // start with the curated/hardcoded order so the lead photo stays editorial
  const ordered = [];
  const seen = new Set();
  for (const h of hardcoded) {
    if (found.includes(h) && !seen.has(h)) { ordered.push(h); seen.add(h); }
  }
  // append every other image the supplier shipped (sorted for stable order).
  // No cap and no filtering — the user wants every single image on the site.
  for (const f of found.sort()) {
    if (!seen.has(f)) {
      ordered.push(f); seen.add(f);
    }
  }
  return ordered;
}

function processImages() {
  const outDir = path.join(SITE, "assets/products");
  // Clear stale files so we don't accumulate old originals from previous builds
  if (fs.existsSync(outDir)) {
    for (const f of fs.readdirSync(outDir)) {
      if (!/\.(jpg|webp)$/.test(f)) {
        try { fs.unlinkSync(path.join(outDir, f)); } catch {}
      }
    }
  }
  ensureDir(outDir);
  let resizedCount = 0;
  let skipCount = 0;
  for (const p of PRODUCTS) {
    const srcs = discoverFolderImages(p.folder, p.images || []);
    p.gallery = [];
    p.thumbs = [];
    srcs.forEach((src, i) => {
      const baseName = `${p.slug}-${i + 1}`;
      const fullDest = path.join(outDir, `${baseName}.jpg`);
      const thumbDest = path.join(outDir, `${baseName}-thumb.webp`);
      const srcAbs = path.join(SRC_IMG, p.folder, src);
      if (!fs.existsSync(srcAbs)) {
        console.warn("MISSING:", srcAbs);
        return;
      }
      // Track whether we did real work so the build log is informative
      const fullExists = fs.existsSync(fullDest);
      const thumbExists = fs.existsSync(thumbDest);
      // Full-size image used on product detail page (max 1200px wide JPG q82)
      resizeImg(srcAbs, fullDest, { maxWidth: 1200, quality: 82 });
      // Tiny WebP thumbnail used on every product card grid (480px wide)
      resizeImg(srcAbs, thumbDest, { maxWidth: 480, quality: 72 });
      if (fullExists && thumbExists) skipCount++; else resizedCount++;
      p.gallery.push(`${baseName}.jpg`);
      p.thumbs.push(`${baseName}-thumb.webp`);
    });
    p.image = p.gallery[0] || `${p.slug}-1.jpg`;
    p.thumb = p.thumbs[0] || `${p.slug}-1-thumb.webp`;
  }
  console.log(`[images] resized ${resizedCount}, cached ${skipCount}`);
}

processImages();

// ---------- products.json ----------
const productsForJson = PRODUCTS.map((p) => ({
  id: p.id,
  slug: p.slug,
  category: p.category,
  brand: p.brand,
  name: p.name,
  price: p.price,
  sku: p.sku,
  shortDescription: p.short,
  longDescription: p.long,
  specs: p.specs,
  image: p.image,
  thumb: p.thumb,
  gallery: p.gallery,
  thumbs: p.thumbs,
}));
write("data/products.json", JSON.stringify(productsForJson, null, 2));

// ---------- Inline catalog as JS so window.TI.products is set synchronously ----------
write(
  "assets/js/catalog.js",
  `// AUTO-GENERATED by build-site.mjs. Do not edit.
window.TI = window.TI || {};
window.TI.products = ${JSON.stringify(productsForJson)};
`
);

// ---------- Page generation imports ----------
import("./build-pages.mjs").then((mod) => mod.buildPages(PRODUCTS, write));
