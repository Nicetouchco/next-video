import { useEffect, useRef, useCallback } from "react";
const config = JSON.parse(
  process.env.NEXT_PUBLIC_DEV_VIDEO_OPTS ?? process.env.NEXT_PUBLIC_VIDEO_OPTS ?? "{}"
);
const DEFAULT_POLLING_INTERVAL = 5e3;
const FILES_FOLDER = `${config.folder ?? "videos"}/`;
function toSymlinkPath(path) {
  if (!path?.startsWith(FILES_FOLDER)) return path;
  return path?.replace(FILES_FOLDER, `_next-video/`);
}
function camelCase(name) {
  return name.toLowerCase().replace(/[-_]([a-z])/g, ($0, $1) => $1.toUpperCase());
}
function getUrlExtension(url) {
  if (typeof url === "string") {
    return url.split(/[#?]/)[0].split(".").pop()?.trim();
  }
}
function usePolling(callback, interval = DEFAULT_POLLING_INTERVAL) {
  const abortControllerRef = useRef(new AbortController());
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    callback(abortControllerRef.current.signal);
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);
  const intervalFn = useCallback(() => {
    return callback(abortControllerRef.current.signal);
  }, []);
  useInterval(intervalFn, interval);
}
function useInterval(callback, delay) {
  const savedCallback = useRef(null);
  useEffect(() => {
    savedCallback.current = callback;
  });
  useEffect(() => {
    const tick = async () => {
      await savedCallback.current?.();
    };
    if (delay != null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
function isReactComponent(component) {
  return isClassComponent(component) || typeof component === "function" || isExoticComponent(component);
}
function isClassComponent(component) {
  return typeof component === "function" && (() => {
    const proto = Object.getPrototypeOf(component);
    return proto.prototype && proto.prototype.isReactComponent;
  })();
}
function isExoticComponent(component) {
  return typeof component === "object" && typeof component.$$typeof === "symbol" && ["react.memo", "react.forward_ref"].includes(component.$$typeof.description);
}
function svgBlurImage(blurDataURL) {
  const svg = (
    /*html*/
    `<svg xmlns="http://www.w3.org/2000/svg"><filter id="b" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="20"/><feComponentTransfer><feFuncA type="discrete" tableValues="1 1"/></feComponentTransfer></filter><g filter="url(#b)"><image width="100%" height="100%" preserveAspectRatio="xMidYMid slice" href="${blurDataURL}"/></g></svg>`
  );
  return svg.replace(/#/g, "%23");
}
function isDevMode() {
  const env = process.env;
  return env.NODE_ENV === "development";
}
export {
  camelCase,
  config,
  getUrlExtension,
  isDevMode,
  isReactComponent,
  svgBlurImage,
  toSymlinkPath,
  useInterval,
  usePolling
};
