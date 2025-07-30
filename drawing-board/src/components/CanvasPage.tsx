import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react';
import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  Arrow,
  Text,
  RegularPolygon
} from 'react-konva';

export type ShapeType = 'brush' | 'eraser' | 'rect' | 'circle' | 'triangle' | 'arrow' | 'text';

export type CanvasPageHandle = {
  undo: () => void;
  redo: () => void;
};

type CanvasPageProps = {
  color: string;
  thickness: number;
  mode: ShapeType;
  zoom: number;
};

const CanvasPage = forwardRef<CanvasPageHandle, CanvasPageProps>(
  ({ color, thickness, mode, zoom }, ref) => {
    const [elements, setElements] = useState<any[]>([]);
    const [redoStack, setRedoStack] = useState<any[]>([]);
    const [current, setCurrent] = useState<any>(null);
    const isDrawing = useRef(false);
    const stageRef = useRef<any>(null);

    // 🧠 提供 undo / redo 給 parent
    useImperativeHandle(ref, () => ({
      undo,
      redo
    }));

    const undo = () => {
      if (elements.length === 0) return;
      const newElements = [...elements];
      const last = newElements.pop();
      setElements(newElements);
      setRedoStack([last, ...redoStack]);
    };

    const redo = () => {
      if (redoStack.length === 0) return;
      const [first, ...rest] = redoStack;
      setElements([...elements, first]);
      setRedoStack(rest);
    };

    const handleMouseDown = (e: any) => {
      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();

      switch (mode) {
        case 'brush':
        case 'eraser': {
          setCurrent({
            type: 'line',
            points: [pos.x, pos.y],
            stroke: color,
            strokeWidth: thickness,
            globalCompositeOperation: mode === 'eraser' ? 'destination-out' : 'source-over',
          });
          break;
        }
        case 'rect':
          setCurrent({
            type: 'rect',
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            stroke: color,
            strokeWidth: thickness
          });
          break;
        case 'circle':
        case 'triangle':
          setCurrent({
            type: mode,
            x: pos.x,
            y: pos.y,
            radius: 0,
            stroke: color,
            strokeWidth: thickness
          });
          break;
        case 'arrow':
          setCurrent({
            type: 'arrow',
            points: [pos.x, pos.y, pos.x, pos.y],
            stroke: color,
            strokeWidth: thickness
          });
          break;
        case 'text':
          const newText = prompt('Enter text:') || '';
          setElements([...elements, {
            type: 'text',
            x: pos.x,
            y: pos.y,
            text: newText,
            fontSize: 20,
            fill: color
          }]);
          setRedoStack([]); // 清除 redo stack
          break;
      }
    };

    const handleMouseMove = (e: any) => {
      if (!isDrawing.current || !current) return;
      const pos = e.target.getStage().getPointerPosition();

      if (current.type === 'line') {
        setCurrent({ ...current, points: [...current.points, pos.x, pos.y] });
      } else if (current.type === 'rect') {
        setCurrent({ ...current, width: pos.x - current.x, height: pos.y - current.y });
      } else if (current.type === 'circle' || current.type === 'triangle') {
        const dx = pos.x - current.x;
        const dy = pos.y - current.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        setCurrent({ ...current, radius });
      } else if (current.type === 'arrow') {
        const newPoints = [current.points[0], current.points[1], pos.x, pos.y];
        setCurrent({ ...current, points: newPoints });
      }
    };

    const handleMouseUp = () => {
      if (current) {
        setElements([...elements, current]);
        setRedoStack([]); // 一旦繪製新圖形，清除 redo
        setCurrent(null);
      }
      isDrawing.current = false;
    };

    return (
      <Stage
        ref={stageRef}
        width={window.innerWidth - 40}
        height={500}
        scaleX={zoom}
        scaleY={zoom}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        style={{ border: '1px solid #ccc', background: 'white' }}
      >
        <Layer>
          {[...elements, current].filter(Boolean).map((el, i) => {
            switch (el.type) {
              case 'line':
                return <Line key={i} {...el} lineCap="round" tension={0.5} globalCompositeOperation={el.globalCompositeOperation} />;
              case 'rect':
                return <Rect key={i} {...el} />;
              case 'circle':
                return <Circle key={i} {...el} />;
              case 'triangle':
                return (
                  <RegularPolygon
                    key={i}
                    x={el.x}
                    y={el.y}
                    sides={3}
                    radius={el.radius}
                    stroke={el.stroke}
                    strokeWidth={el.strokeWidth}
                  />
                );
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
    );
  }
);

export default CanvasPage;
