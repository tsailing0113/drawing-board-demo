import React, {
  useRef,
  useImperativeHandle,
  forwardRef,
  useEffect,
  useState,
  useCallback
} from 'react';
import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  Arrow,
  Text,
  RegularPolygon,
  Transformer,
  Image as KonvaImage
} from 'react-konva';
import Konva from 'konva';

export type ShapeType =
  | 'brush'
  | 'eraser'
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'arrow'
  | 'text';

export type CanvasPageHandle = {
  undo: () => void;
  redo: () => void;
  bringForward: () => void;
  sendBackward: () => void;
};

type CanvasPageProps = {
  color: string;
  thickness: number;
  mode: ShapeType;
  zoom: number;
  fontSize: number;
  fontFamily: string;
  lines: any[];
  setLines: (lines: any[]) => void;
};

const CanvasPage = forwardRef<CanvasPageHandle, CanvasPageProps>(({
  color,
  thickness,
  mode,
  zoom,
  fontSize,
  fontFamily,
  lines,
  setLines
}, ref) => {
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const imageNodeRef = useRef<Konva.Image>(null);
  const [current, setCurrent] = useState<any>(null);
  const [textEditValue, setTextEditValue] = useState('');
  const [textEditPosition, setTextEditPosition] = useState<{ x: number; y: number } | null>(null);
  const [textEditIndex, setTextEditIndex] = useState<number | null>(null);

  const setImageRef = useCallback((node: Konva.Image | null) => {
    if (selectedId !== null && lines[selectedId]?.type === 'image') {
      imageNodeRef.current = node;
    }
  }, [selectedId, lines]);

  useEffect(() => {
    setSelectedId(null);
    setEditingId(null);
  }, [mode]);

  useEffect(() => {
    if (selectedId !== null && lines[selectedId]?.type === 'image') {
      const transformer = transformerRef.current;
      const imageNode = imageNodeRef.current;
      if (transformer && imageNode) {
        transformer.nodes([imageNode]);
        transformer.getLayer()?.batchDraw();
      }
    }
  }, [selectedId, lines]);

  useImperativeHandle(ref, () => ({ undo, redo, bringForward, sendBackward }));

  const undo = () => {
    if (lines.length === 0) return;
    const newLines = [...lines];
    const last = newLines.pop();
    setRedoStack([last, ...redoStack]);
    setLines(newLines);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const [first, ...rest] = redoStack;
    const newLines = [...lines, first];
    setLines(newLines);
    setRedoStack(rest);
  };

  const bringForward = () => {
    if (selectedId === null || selectedId >= lines.length - 1) return;
    const newLines = [...lines];
    [newLines[selectedId], newLines[selectedId + 1]] = [newLines[selectedId + 1], newLines[selectedId]];
    setLines(newLines);
    setSelectedId(selectedId + 1);
  };

  const sendBackward = () => {
    if (selectedId === null || selectedId <= 0) return;
    const newLines = [...lines];
    [newLines[selectedId], newLines[selectedId - 1]] = [newLines[selectedId - 1], newLines[selectedId]];
    setLines(newLines);
    setSelectedId(selectedId - 1);
  };

  const handleMouseDown = (e: any) => {
    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    if (!pos) return;
    isDrawing.current = true;
    setSelectedId(null);
    setEditingId(null);

    switch (mode) {
      case 'brush':
      case 'eraser':
        setCurrent({
          type: 'line',
          points: [pos.x, pos.y],
          stroke: color,
          strokeWidth: thickness,
          globalCompositeOperation: mode === 'eraser' ? 'destination-out' : 'source-over'
        });
        break;
      case 'rect':
        setCurrent({
          type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0,
          stroke: color, strokeWidth: thickness
        });
        break;
      case 'circle':
      case 'triangle':
        setCurrent({
          type: mode, x: pos.x, y: pos.y, radius: 0,
          stroke: color, strokeWidth: thickness
        });
        break;
      case 'arrow':
        setCurrent({
          type: 'arrow', points: [pos.x, pos.y, pos.x, pos.y],
          stroke: color, strokeWidth: thickness
        });
        break;
      case 'text': {
        const text = prompt('Enter text') || '';
        if (!text) return;
        setLines([...lines, {
          type: 'text', x: pos.x, y: pos.y, text,
          fontSize, fontFamily, fill: color
        }]);
        break;
      }
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || !current) return;
    const pos = stageRef.current.getPointerPosition();
    if (!pos) return;

    if (current.type === 'line') {
      setCurrent({ ...current, points: [...current.points, pos.x, pos.y] });
    } else if (current.type === 'rect') {
      setCurrent({ ...current, width: pos.x - current.x, height: pos.y - current.y });
    } else if (current.type === 'circle' || current.type === 'triangle') {
      const dx = pos.x - current.x;
      const dy = pos.y - current.y;
      setCurrent({ ...current, radius: Math.sqrt(dx * dx + dy * dy) });
    } else if (current.type === 'arrow') {
      setCurrent({ ...current, points: [current.points[0], current.points[1], pos.x, pos.y] });
    }
  };

  const handleMouseUp = () => {
    if (current) {
      setLines([...lines, current]);
      setRedoStack([]);
      setCurrent(null);
    }
    isDrawing.current = false;
  };

  return (
    <div style={{ width: '100%', height: '500px', position: 'relative' }}>
      <Stage
        ref={stageRef}
        width={window.innerWidth - 40}
        height={500}
        scaleX={zoom}
        scaleY={zoom}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ border: '1px solid #ccc', background: '#fff' }}
      >
        <Layer>
          {[...lines, current].filter(Boolean).map((el, i) => {
            switch (el.type) {
              case 'line':
                return <Line key={i} {...el} lineCap="round" tension={0.5} globalCompositeOperation={el.globalCompositeOperation} />;
              case 'rect':
                return <Rect key={i} {...el} />;
              case 'circle':
                return <Circle key={i} {...el} />;
              case 'triangle':
                return <RegularPolygon key={i} x={el.x} y={el.y} sides={3} radius={el.radius} stroke={el.stroke} strokeWidth={el.strokeWidth} />;
              case 'arrow':
                return <Arrow key={i} {...el} />;
              case 'text':
                return <Text key={i} {...el} />;
              default:
                return null;
            }
          })}
        </Layer>
      </Stage>
    </div>
  );
});

export default CanvasPage;
