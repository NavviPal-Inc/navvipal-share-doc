import React, { useState, useRef, useEffect, useCallback, useImperativeHandle } from 'react';

const AdvancedImageViewer = React.forwardRef(({ src, alt = "Document", noDownload = false, onZoomChange }, ref) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const imageRef = useRef(null);
  const hasExternalRef = ref != null;

  const minScale = 0.1;
  const maxScale = 5;
  const scaleStep = 0.2;

  // Reset to fit screen
  const resetView = useCallback(() => {
    if (!imageRef.current) return;

    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + scaleStep, maxScale));
  }, [scaleStep, maxScale]);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - scaleStep, minScale));
  }, [scaleStep, minScale]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -scaleStep : scaleStep;
    setScale(prev => Math.max(minScale, Math.min(prev + delta, maxScale)));
  }, [scaleStep, minScale, maxScale]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    }
  }, [position]);

  const handleTouchMove = useCallback((e) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetView();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetView]);

  // Reset view when image loads
  useEffect(() => {
    if (imageLoaded) {
      resetView();
    }
  }, [imageLoaded, resetView]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const getZoomLabel = useCallback(() => `${Math.round(scale * 100)}%`, [scale]);

  const rotateClockwise = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
    setPosition({ x: 0, y: 0 });
  }, []);

  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
    resetView,
    getZoomLabel,
    rotateClockwise
  }), [zoomIn, zoomOut, resetView, getZoomLabel, rotateClockwise]);

  useEffect(() => {
    if (typeof onZoomChange === 'function') {
      onZoomChange(getZoomLabel());
    }
  }, [scale, onZoomChange, getZoomLabel]);

  if (imageError) {
    return (
      <div className="image-error">
        <p>Failed to load image</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="advanced-image-viewer">
      {/* Controls */}
      {!hasExternalRef && (
        <div className="viewer-controls">
          <button onClick={rotateClockwise} title="Rotate Clockwise 90°">
            <span>⟳</span>
          </button>
          <button onClick={zoomOut} disabled={scale <= minScale} title="Zoom Out (Ctrl + -)">
            <span>−</span>
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={scale >= maxScale} title="Zoom In (Ctrl + +)">
            <span>+</span>
          </button>
          <button onClick={resetView} title="Fit to Screen (Ctrl + 0)">
            <span>⌂</span>
          </button>
        </div>
      )}

      {!imageLoaded && (
        <div className="image-loading">
          <div className="spinner"></div>
          <p>Loading image...</p>
        </div>
      )}

      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="viewer-image"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
          opacity: imageLoaded ? 1 : 0
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onContextMenu={noDownload ? (e) => e.preventDefault() : undefined}
        draggable={false}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

    </div>
  );
});

AdvancedImageViewer.displayName = 'AdvancedImageViewer';

export default AdvancedImageViewer;
