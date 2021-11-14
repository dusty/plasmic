import registerComponent from "@plasmicapp/host/registerComponent";
import React, { ComponentProps } from "react";
import ReactParallaxTilt from "react-parallax-tilt";

export default function Tilt(props: ComponentProps<typeof ReactParallaxTilt>) {
  return (
    <ReactParallaxTilt
      {...props}
      style={{
        transformStyle: "preserve-3d",
        ...(props.style ?? {}),
      }}
    ></ReactParallaxTilt>
  );
}

registerComponent(Tilt, {
  name: "Tilt",
  importPath: "@plasmicpkgs/react-parallax-tilt",
  props: {
    children: "slot",
    tiltEnable: {
      type: "boolean",
      // defaultValueHint: true,
      description: "Enable tilt effect",
    },
    tiltReverse: {
      type: "boolean",
      // defaultValueHint: false,
      description: "Reverse tilt direction",
    },
    tiltAngleXInitial: {
      type: "number",
      // defaultValueHint: 0,
      description: "Initial tilt angle in degrees on X axis",
    },
    tiltAngleYInitial: {
      type: "number",
      // defaultValueHint: 0,
      description: "Initial tilt angle in degrees on Y axis",
    },
    tiltMaxAngleX: {
      type: "number",
      // defaultValueHint: 20,
      description: "Maximum tilt angle in degrees on X axis",
    },
    tiltMaxAngleY: {
      type: "number",
      // defaultValueHint: 20,
      description: "Maximum tilt angle in degrees on Y axis",
    },
    tiltAxis: {
      type: "choice",
      options: ["x", "y"],
      description:
        "Which axis should be enabled (unset means both are enabled)",
    },
    glareEnable: {
      type: "boolean",
      // defaultValueHint: false,
      description: "Enable glare effect",
    },
    glareMaxOpacity: {
      type: "number",
      // defaultValueHint: 0.7,
      description: "Maximum opacity of glare effect",
    },
    glareColor: {
      // TODO replace with color picker
      type: "string",
      // defaultValueHint: "#ffffff",
      description: "Color of glare effect",
    },
    glareBorderRadius: {
      type: "string",
      // defaultValueHint: '0',
      description: "Border radius of glare effect",
    },
    glarePosition: {
      type: "choice",
      options: ["top", "bottom", "left", "right", "all"],
      // defaultValueHint: 'bottom',
      description: "Position of the glare effect",
    },
    glareReverse: {
      type: "boolean",
      // defaultValueHint: false,
      description: "Reverse glare direction",
    },
    scale: {
      type: "number",
      // defaultValueHint: 1,
      description: "Scale of the element",
    },
    perspective: {
      type: "number",
      // defaultValueHint: 1000,
      description:
        "The perspective property defines how far the object (wrapped/child component) is away from the user. The lower the more extreme the tilt gets.",
    },
    flipVertically: {
      type: "boolean",
      // defaultValueHint: false,
      description: "Flip the element vertically",
    },
    flipHorizontally: {
      type: "boolean",
      // defaultValueHint: false,
      description: "Flip the element horizontally",
    },
    reset: {
      type: "boolean",
      // defaultValueHint: false,
      description: "Reset the element to its original state",
    },
    transitionEasing: {
      type: "string",
      // defaultValueHint: 'cubic-bezier(.03,.98,.52,.99)',
      description: "Easing function for the transition",
    },
    transitionSpeed: {
      type: "number",
      // defaultValueHint: 400,
      description: "Transition speed in milliseconds",
    },
    trackOnWindow: {
      type: "boolean",
      // defaultValueHint: false,
      description:
        "Track the mouse position on the whole window, not just on the element",
    },
    gyroscope: {
      type: "boolean",
      // defaultValueHint: false,
      description: "Enable device orientation detection",
    },
  },
  isDefaultExport: true,
  defaultStyles: {
    maxWidth: "100%",
  },
});