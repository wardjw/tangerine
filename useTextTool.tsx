import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';

export function useTextTool(currentTool, stageRef, textAreas, setTextAreas, trRef, layerRef, selectedNodes, setSelectedNodes, textNodes, setTextNodes, Tool) {
    // text tool

    useEffect(() => {
        const tr = new Konva.Transformer({
        // ... Your transformer configuration ...
        nodes: [],
        enabledAnchors: [
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right',
            'top-center',
            'bottom-center',
        ],
        anchorSize: 8,
        anchorCornerRadius: 4,
        anchorFill: '#ffffff',
        anchorStroke: '#333333',
        anchorStrokeWidth: 1,
        borderStroke: '#333333',
        borderStrokeWidth: 1,
        keepRatio: false,
        // set minimum width of text
        boundBoxFunc: function (oldBox, newBox) {
            newBox.width = Math.max(30, newBox.width);
            return newBox;
        },
        });
        trRef.current = tr;
        layerRef.current?.add(tr);
    }, [trRef, layerRef]);

    const isSelected = (node: SelectedNode) => node.selected === true;

    const selectNode = (node: SelectedNode) => {
        node.selected = true;
        setSelectedNodes((prevNodes) => [...prevNodes, node]);
    };

    const deselectNode = (node: SelectedNode) => {
        node.selected = false;
        setSelectedNodes((prevNodes) => prevNodes.filter((n) => n !== node));
    };

    const clearSelection = () => {
        selectedNodes.forEach((node) => {
        node.selected = false;
        });
        setSelectedNodes([]);
        trRef.current?.nodes([]);
        trRef.current?.visible(false);
        layerRef.current?.batchDraw();
    };

    const showTransformer = () => {
        trRef.current?.nodes(selectedNodes);
        trRef.current?.visible(true);
        layerRef.current?.batchDraw();
    };

    useEffect(() => {
        const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!(currentTool === Tool.TEXT) || e.target !== stageRef.current) {
            return;
        }

        const pos = stageRef.current.getPointerPosition();
        if (pos !== null) {
            setTextAreas((prevTextAreas) => [
            ...prevTextAreas,
            { x: pos.x, y: pos.y, content: '' },
            ]);
        }      
        };

        const stage = stageRef.current;
        if (stage) {
        stage.on('click tap', handleStageClick);
        return () => {
            // Clean up the event listener when the component unmounts or updates
            stage.off('click tap', handleStageClick);
        };
        }
    }, [currentTool]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
        // Update the textAreas state
        setTextAreas((prevTextAreas) => prevTextAreas.map((textArea, i) =>
        i === index ? { ...textArea, content: e.target.value } : textArea
        ));

        // Resize the textarea to fit its content
        e.target.style.width = `${e.target.scrollWidth}px`;
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const convertTextAreasToTextNodes = () => {
        textAreas.forEach((textArea, index) => {
        setTextNodes((prevNodes) => [
            ...prevNodes,
            {
            x: textArea.x,
            y: textArea.y,
            text: textArea.content,
            }
        ]);
        });
    
        // clear text areas after they have been processed
        setTextAreas([]);
    
        // force layer to redraw
        layerRef.current?.batchDraw();
    };  

    useEffect(() => {
        if (layerRef.current) {
        layerRef.current.batchDraw();
        }
    }, [textNodes]);

    const convertTextNodesToTextAreas = () => {
        const newTextAreas = textNodes.map((textNode) => ({
        x: textNode.x,
        y: textNode.y,
        content: textNode.text,
        }));
    
        setTextAreas((prevTextAreas) => [...prevTextAreas, ...newTextAreas]);
        setTextNodes([]);
    };
