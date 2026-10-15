import { describe, expect, it } from "vitest";
import { parseVideoUrl, videoPlayerSrc } from "@/lib/urls";

describe("videoPlayerSrc", () => {
  it("autoplays the Vimeo VSL with sound requested", () => {
    const source = parseVideoUrl("https://vimeo.com/1234742435?share=copy");
    expect(source).toEqual({ type: "vimeo", id: "1234742435" });
    expect(videoPlayerSrc(source)).toBe(
      "https://player.vimeo.com/video/1234742435?autoplay=1&muted=0&loop=1&playsinline=1&autopause=0&title=0&byline=0&portrait=0",
    );
    expect(videoPlayerSrc(source)).not.toContain("muted=1");
  });

  it("autoplays YouTube embeds with sound requested", () => {
    const source = parseVideoUrl("https://www.youtube.com/watch?v=abcdefghijk");
    expect(videoPlayerSrc(source)).toContain("autoplay=1");
    expect(videoPlayerSrc(source)).toContain("mute=0");
    expect(videoPlayerSrc(source)).not.toContain("mute=1");
  });
});
