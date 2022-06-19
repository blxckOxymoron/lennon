import { createHash } from "crypto";
import { URLSearchParams } from "url";
import { prisma } from "../../lib";
import { RenderFunction } from "../svg";

type MathRenderer = RenderFunction<string>;

const mathoidBase = "https://mathoid2.wmflabs.org/";

// THROWS
export const generateImage: MathRenderer = async equation => {
  const query = equation.replaceAll(/ +/g, " ").trim();
  const key = createHash("sha256").update(query).digest();

  const cached = await prisma.image.findFirst({
    where: {
      key,
      type: "mathoid",
    },
    select: {
      url: true,
    },
  });

  if (cached) return new URL(cached.url);

  const png = await fetch(mathoidBase + "png", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      type: "tex",
      q: query,
    }),
  }).then(async res => {
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.detail?.error?.message ?? "Server Error");
    }
    return res.arrayBuffer();
  });

  return Buffer.from(png);
};

export const getTexName = async (equation: string) => {
  const query = equation.replaceAll(/ +/g, " ").trim();

  const name = await fetch(mathoidBase + "speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      type: "tex",
      q: query,
    }),
  }).then(res => (res.ok ? res.text() : "equation"));

  return name;
};

export const texHash = (tex: string) => {
  const trimmed = tex.replaceAll(/ +/g, " ").trim();
  return createHash("sha256").update(trimmed).digest();
};
