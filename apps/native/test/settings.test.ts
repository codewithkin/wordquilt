import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  cycleMotion,
  defaultSettings,
  motionLabel,
  notificationAction,
  shouldReduceMotion,
} from "../lib/settings.ts";

describe("reduce motion layers over the OS setting", () => {
  it("defers to the device by default", () => {
    assert.equal(shouldReduceMotion({ reduceMotion: "system" }, true), true);
    assert.equal(shouldReduceMotion({ reduceMotion: "system" }, false), false);
  });

  it("an explicit ON overrides a device that is not reducing", () => {
    assert.equal(shouldReduceMotion({ reduceMotion: "on" }, false), true);
  });

  it("an explicit OFF overrides a device that IS reducing", () => {
    // A real preference: someone may reduce motion globally but want the
    // reveal in this app. Ignoring that would make the switch meaningless.
    assert.equal(shouldReduceMotion({ reduceMotion: "off" }, true), false);
  });

  it("cycles system -> on -> off -> system", () => {
    assert.equal(cycleMotion("system"), "on");
    assert.equal(cycleMotion("on"), "off");
    assert.equal(cycleMotion("off"), "system");
  });

  it("says which way the device is leaning when following it", () => {
    assert.match(motionLabel({ reduceMotion: "system" }, true), /on$/);
    assert.match(motionLabel({ reduceMotion: "system" }, false), /off$/);
    assert.equal(motionLabel({ reduceMotion: "on" }, false), "On");
  });
});

describe("notifications reconcile with the OS", () => {
  it("schedules when on and a rhythm is chosen", () => {
    const a = notificationAction({ notifications: true, rhythm: "Morning" });
    assert.deepEqual(a, { action: "schedule", rhythm: "Morning" });
  });

  it("CANCELS when turned off", () => {
    // A setting that says Off while the OS still fires tomorrow is a broken
    // promise, and this product's whole position is that it does not nag.
    assert.deepEqual(
      notificationAction({ notifications: false, rhythm: "Morning" }),
      { action: "cancel" },
    );
  });

  it("cancels when on but no rhythm was ever picked", () => {
    assert.deepEqual(
      notificationAction({ notifications: true, rhythm: null }),
      { action: "cancel" },
    );
  });
});

describe("defaults", () => {
  it("starts with notifications OFF", () => {
    // Never opt a player in to being contacted.
    assert.equal(defaultSettings.notifications, false);
  });

  it("starts following the device for motion", () => {
    assert.equal(defaultSettings.reduceMotion, "system");
  });
});
