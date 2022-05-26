import * as React from "react";
import * as ReactDOM from "react-dom";
import { ensure } from "./lang-utils";
import useForceUpdate from "./useForceUpdate";
const root = globalThis as any;

declare global {
  interface Window {
    __PlasmicHostVersion: string;
  }
}

if (root.__PlasmicHostVersion == null) {
  root.__PlasmicHostVersion = "2";
}

const rootChangeListeners: (() => void)[] = [];
class PlasmicRootNodeWrapper {
  constructor(private value: null | React.ReactElement) {}
  set = (val: null | React.ReactElement) => {
    this.value = val;
    rootChangeListeners.forEach((f) => f());
  };
  get = () => this.value;
}

const plasmicRootNode = new PlasmicRootNodeWrapper(null);

function getPlasmicOrigin() {
  const params = new URL(`https://fakeurl/${location.hash.replace(/#/, "?")}`)
    .searchParams;
  return ensure(
    params.get("origin"),
    "Missing information from Plasmic window."
  );
}

function renderStudioIntoIframe() {
  const script = document.createElement("script");
  const plasmicOrigin = getPlasmicOrigin();
  script.src = plasmicOrigin + "/static/js/studio.js";
  document.body.appendChild(script);
}

let renderCount = 0;
export function setPlasmicRootNode(node: React.ReactElement | null) {
  // Keep track of renderCount, which we use as key to ErrorBoundary, so
  // we can reset the error on each render
  renderCount++;
  plasmicRootNode.set(node);
}

/**
 * React context to detect whether the component is rendered on Plasmic editor.
 * If not, return false.
 * If so, return an object with more information about the component
 */
export const PlasmicCanvasContext = React.createContext<
  | {
      componentName: string | null;
    }
  | boolean
>(false);
export const usePlasmicCanvasContext = () =>
  React.useContext(PlasmicCanvasContext);

function _PlasmicCanvasHost({ nonce } : { nonce?: string }) {
  // If window.parent is null, then this is a window whose containing iframe
  // has been detached from the DOM (for the top window, window.parent === window).
  // In that case, we shouldn't do anything.  If window.parent is null, by the way,
  // location.hash will also be null.
  const isFrameAttached = !!window.parent;
  const isCanvas = !!location.hash?.match(/\bcanvas=true\b/);
  const isLive = !!location.hash?.match(/\blive=true\b/) || !isFrameAttached;
  const shouldRenderStudio =
    isFrameAttached &&
    !document.querySelector("#plasmic-studio-tag") &&
    !isCanvas &&
    !isLive;
  const forceUpdate = useForceUpdate();
  React.useLayoutEffect(() => {
    rootChangeListeners.push(forceUpdate);
    return () => {
      const index = rootChangeListeners.indexOf(forceUpdate);
      if (index >= 0) {
        rootChangeListeners.splice(index, 1);
      }
    };
  }, [forceUpdate]);
  React.useEffect(() => {
    if (shouldRenderStudio && isFrameAttached && window.parent !== window) {
      renderStudioIntoIframe();
    }
  }, [shouldRenderStudio, isFrameAttached]);
  React.useEffect(() => {
    if (!shouldRenderStudio && !document.querySelector("#getlibs") && isLive) {
      const scriptElt = document.createElement("script");
      scriptElt.id = "getlibs";
      scriptElt.src = getPlasmicOrigin() + "/static/js/getlibs.js";
      scriptElt.async = false;
      if (nonce) scriptElt.setAttribute('nonce', nonce);
      scriptElt.onload = () => {
        (window as any).__GetlibsReadyResolver?.();
      };
      document.head.append(scriptElt);
    }
  }, [shouldRenderStudio]);
  if (!isFrameAttached) {
    return null;
  }
  if (isCanvas || isLive) {
    let appDiv = document.querySelector("#plasmic-app.__wab_user-body");
    if (!appDiv) {
      appDiv = document.createElement("div");
      appDiv.id = "plasmic-app";
      appDiv.classList.add("__wab_user-body");
      document.body.appendChild(appDiv);
    }
    const locationHash = new URLSearchParams(location.hash);
    const plasmicContextValue = isCanvas
      ? {
          componentName: locationHash.get("componentName"),
        }
      : false;
    return ReactDOM.createPortal(
      <ErrorBoundary key={`${renderCount}`}>
        <PlasmicCanvasContext.Provider value={plasmicContextValue}>
          {plasmicRootNode.get()}
        </PlasmicCanvasContext.Provider>
      </ErrorBoundary>,
      appDiv,
      "plasmic-app"
    );
  }
  if (shouldRenderStudio && window.parent === window) {
    return (
      <iframe
        src={`https://docs.plasmic.app/app-content/app-host-ready#appHostUrl=${encodeURIComponent(
          location.href
        )}`}
        style={{
          width: "100vw",
          height: "100vh",
          border: "none",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 99999999,
        }}
      ></iframe>
    );
  }
  return null;
}

interface PlasmicCanvasHostProps {
  /**
   * Webpack hmr uses EventSource to	listen to hot reloads, but that
   * resultsin a persistent	connection from	each window.  In Plasmic
   * Studio, if a project is configured to use app-hosting with a
   * nextjs or gatsby server running in dev mode, each artboard will
   * be holding a persistent connection to the dev server.
   * Because browsers	have a limit to	how many connections can
   * be held	at a time by domain, this means	after X	artboards, new
   * artboards will freeze and not load.
   *
   * By default, <PlasmicCanvasHost /> will globally mutate
   * window.EventSource to avoid using EventSource for HMR, which you
   * typically don't need for your custom host page.  If you do still
   * want to retain HRM, then youc an pass enableWebpackHmr={true}.
   */
  enableWebpackHmr?: boolean;
  /**
   * A `nonce` to be added to the injected script, useful for a strict
   * content security policy
   */
  nonce?: string;
}

export const PlasmicCanvasHost: React.FunctionComponent<PlasmicCanvasHostProps> = (
  props
) => {
  const { enableWebpackHmr, nonce } = props;
  const [node, setNode] = React.useState<React.ReactElement<any, any> | null>(
    null
  );
  React.useEffect(() => {
    setNode(<_PlasmicCanvasHost nonce={nonce} />);
  }, []);
  return (
    <>
      {!enableWebpackHmr && <DisableWebpackHmr />}
      {node}
    </>
  );
};

type RenderErrorListener = (err: Error) => void;
const renderErrorListeners: RenderErrorListener[] = [];
export function registerRenderErrorListener(listener: RenderErrorListener) {
  renderErrorListeners.push(listener);
  return () => {
    const index = renderErrorListeners.indexOf(listener);
    if (index >= 0) {
      renderErrorListeners.splice(index, 1);
    }
  };
}

interface ErrorBoundaryProps {
  children?: React.ReactNode;
}

interface ErrorBoundaryState {
  error?: Error;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    renderErrorListeners.forEach((listener) => listener(error));
  }

  render() {
    if (this.state.error) {
      return <div>Error: {`${this.state.error.message}`}</div>;
    } else {
      return this.props.children;
    }
  }
}

function DisableWebpackHmr() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }
  return (
    <script
      type="text/javascript"
      dangerouslySetInnerHTML={{
        __html: `
      if (typeof window !== "undefined") {
        const RealEventSource = window.EventSource;
        window.EventSource = function(url, config) {
          if (/[^a-zA-Z]hmr($|[^a-zA-Z])/.test(url)) {
            console.warn("Plasmic: disabled EventSource request for", url);
            return {
              onerror() {}, onmessage() {}, onopen() {}, close() {}
            };
          } else {
            return new RealEventSource(url, config);
          }
        }
      }
      `,
      }}
    ></script>
  );
}
