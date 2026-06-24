"use strict";

// Guards the guided episode flow -> layout-first placement entry point (#1026 / #582 / #583):
// source media health is where the creator reviews each speaker's uploaded recording, so that
// step offers a "Place videos in layout" link back to the layout-first start — like the ingest,
// style, speaker-setup, and reuse steps already do. Kept in its own file so it does not collide
// with the frequently-edited episode-flow-nav.test.js.
// Run with: `node preview/episode-flow-layout-placement.test.js`

const fs = require("fs");
const path = require("path");
const assert = require("assert");

const navScript = fs.readFileSync(path.join(__dirname, "episode-flow-nav.js"), "utf8");

assert.ok(
  navScript.includes('LAYOUT_FIRST_PLACEMENT_STEP_FILE = "source-media-health.html"'),
  "the placement link is offered on the source media health step, where the speaker recordings are reviewed",
);
assert.ok(
  navScript.includes('file: "source-media-health.html"'),
  "source media health is a real episode-flow step",
);
assert.ok(
  navScript.includes('LAYOUT_FIRST_PLACEMENT_FILE = "layout-first.html"'),
  "the placement link targets the layout-first start",
);
assert.ok(
  navScript.includes('"Place videos in layout"'),
  "the entry point uses the same creator-facing label as the other steps",
);
assert.ok(
  navScript.includes("function layoutFirstPlacementSearch"),
  "the placement href is built with URLSearchParams so shell path context is preserved",
);
assert.ok(
  navScript.includes("shouldOfferLayoutPlacement(step)"),
  "the placement link is gated to its step, not rendered on every episode-flow screen",
);
assert.ok(
  navScript.includes('params.set("from", "episode")'),
  "the placement link carries the episode-flow origin",
);

assert.ok(
  fs.existsSync(path.join(__dirname, "layout-first.html")),
  "the layout-first placement screen exists as a real target",
);

const renderSlice = navScript.slice(navScript.indexOf("shouldOfferLayoutPlacement(step)"));
assert.ok(
  renderSlice.includes('"Place videos in layout"'),
  "the gated branch renders the placement link",
);

console.log("episode-flow nav: source media health offers a layout-first 'Place videos in layout' entry point");
