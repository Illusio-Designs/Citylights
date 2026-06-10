import React from "react";
import "../styles/component/Skeleton.css";

// A single card-shaped skeleton with an image block and two text lines.
export const SkeletonCard = ({ className = "" }) => (
  <div className={`skeleton-card ${className}`}>
    <div className="skeleton-thumb shimmer" />
    <div className="skeleton-line shimmer" />
    <div className="skeleton-line short shimmer" />
  </div>
);

// A set of skeleton cards, meant to be dropped inside a grid/flex container.
export const SkeletonCards = ({ count = 8, className = "" }) =>
  Array.from({ length: count }).map((_, i) => (
    <SkeletonCard key={i} className={className} />
  ));

// A full-width banner/hero skeleton.
export const SkeletonBanner = ({ className = "" }) => (
  <div className={`skeleton-banner shimmer ${className}`} />
);

export default SkeletonCard;
