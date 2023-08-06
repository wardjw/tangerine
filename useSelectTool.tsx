import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';

export function useSelectTool(currentTool, stageRef, layerRef, selectNode, clearSelection) {
    // select tool

    useEffect(() => {
      if (currentTool === Tool.SELECT && stageRef.current) {
        let isDragging = false;
        let startPoint: Konva.Vector2d | undefined;
        let selectionRect: Konva.Rect | undefined;

        const stage = stageRef.current;
        const layer = layerRef.current;

        const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
          // Ignore right-clicks
          if (e.evt.button !== 0) return;

          // Check if the event target is a draggable shape, text, or transformer handle
          if (
            e.target.hasName('shape') ||
            e.target.hasName('textNode') ||
            e.target.hasName('top-left') ||
            e.target.hasName('top-right') ||
            e.target.hasName('bottom-left') ||
            e.target.hasName('bottom-right') ||
            e.target.hasName('middle-left') ||
            e.target.hasName('middle-right') ||
            e.target.hasName('top-center') ||
            e.target.hasName('bottom-center') ||
            e.target.hasName('rotater')
          ) {
            return;
          }

          // Get the starting point of the selection rectangle
          const pos = stage.getPointerPosition();
          startPoint = pos ? { x: pos.x, y: pos.y } : undefined;

          // Create a new selection rectangle shape
          if (startPoint) {
            selectionRect = new Konva.Rect({
              fill: 'rgba(0, 0, 255, 0.3)', // Transparent blue color
              visible: false, // Initially hidden
            });

            // Add the selection rectangle to the layer
            layer?.add(selectionRect);

            // Set dragging flag to true
            isDragging = true;
          }
        };

        const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
          // Skip if not dragging or right-clicking
          if (!isDragging || e.evt.button !== 0 || !startPoint || !selectionRect) return;

          // Calculate the current position of the selection rectangle
          const pos = stage.getPointerPosition();

          // Update the selection rectangle properties
          if (pos) {
            selectionRect.setAttrs({
              visible: true,
              x: Math.min(startPoint.x, pos.x),
              y: Math.min(startPoint.y, pos.y),
              width: Math.abs(pos.x - startPoint.x),
              height: Math.abs(pos.y - startPoint.y),
            });

            // Batch draw the layer to update the stage
            layer?.batchDraw();
          }
        };

        const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
          // Skip if not dragging or right-clicking
          if (!isDragging || e.evt.button !== 0 || !selectionRect) return;

          // Get the selection rectangle position and size
          const rect = selectionRect.getClientRect();

          // Select the objects inside the selection rectangle
          layer?.find('.textNode, .shape').forEach((node) => {
            const nodeRect = node.getClientRect();

            if (rect && nodeRect && Konva.Util.haveIntersection(rect, nodeRect)) {
              selectNode(node as SelectedNode);
            }
          });

          // Show the transformer for the selected nodes
          showTransformer();

          // Remove the selection rectangle
          selectionRect.remove();

          // Set dragging flag to false
          isDragging = false;
        };

        const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
          if (e.target === stage) {
            clearSelection();
          }
        };

        stage.on('mousedown touchstart', handleMouseDown);
        stage.on('mousemove touchmove', handleMouseMove);
        stage.on('mouseup touchend', handleMouseUp);
        stage.on('click tap', handleClick);

        return () => {
          stage.off('mousedown touchstart', handleMouseDown);
          stage.off('mousemove touchmove', handleMouseMove);
          stage.off('mouseup touchend', handleMouseUp);
          stage.off('click tap', handleClick);
        };
      }
    }, [currentTool]);
  