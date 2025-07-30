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
import Konva from 'konva';

export type ShapeType = 'brush' | 'eraser' | 'rect' | 'circle' | 'triangle' | 'arrow' | 'text';

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
};

const CanvasPage = forwardRef<CanvasPageHandle, CanvasPageProps>(
  ({ color, thickness, mode, zoom, fontSize, fontFamily  }, ref) => {
    const [elements, setElements] = useState<any[]>([]);
    const [redoStack, setRedoStack] = useState<any[]>([]);
    const [current, setCurrent] = useState<any>(null);
    const isDrawing = useRef(false);
    const stageRef = useRef<any>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
      setSelectedId(null);
      setEditingId(null);
    }, [mode]);


    // 🧠 提供 undo / redo 給 parent
    useImperativeHandle(ref, () => ({
      undo,
      redo,
      bringForward,
      sendBackward
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

    // 👉 向前移動一層
    const bringForward = () => {
      if (selectedId === null || selectedId >= elements.length - 1) return;
      const newElements = [...elements];
      const temp = newElements[selectedId];
      newElements[selectedId] = newElements[selectedId + 1];
      newElements[selectedId + 1] = temp;
      setElements(newElements);
      setSelectedId(selectedId + 1); // 更新選取 ID
    };

    // 👉 向後移動一層
    const sendBackward = () => {
      if (selectedId === null || selectedId <= 0) return;
      const newElements = [...elements];
      const temp = newElements[selectedId];
      newElements[selectedId] = newElements[selectedId - 1];
      newElements[selectedId - 1] = temp;
      setElements(newElements);
      setSelectedId(selectedId - 1); // 更新選取 ID
    };

    const handleMouseDown = (e: any) => {

      isDrawing.current = true;
      const pos = e.target.getStage().getPointerPosition();

      setSelectedId(null);
      setEditingId(null);

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
        case 'text': {
          const stage = stageRef.current;
          if (!stage) return;

          const clickedOnEmpty = e.target === stage;
          if (!clickedOnEmpty) return;

          const pos = stage.getPointerPosition();
          const newText = prompt('Enter text:') || '';
          setElements([
            ...elements,
            {
              type: 'text',
              x: pos.x,
              y: pos.y,
              text: newText,
              fontSize,
              fontFamily,
              fill: color,
            },
          ]);
          setRedoStack([]);
          break;
        }
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
      <>
        <Stage
          ref={stageRef}
          width={window.innerWidth - 40}
          height={500}
          scaleX={zoom}
          scaleY={zoom}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onMouseDownCapture={(e: Konva.KonvaEventObject<MouseEvent>) => {
            if (e.target === e.target.getStage()) {
              setSelectedId(null);
              setEditingId(null);
            }
          }}
          style={{ border: '1px solid #ccc', background: 'white' }}
        >
          <Layer>
            {[...elements, current].filter(Boolean).map((el, i) => {
              const isSelected = i === selectedId;
              switch (el.type) {
                case 'line':
                  return <Line key={i} {...el} lineCap="round" tension={0.5} globalCompositeOperation={el.globalCompositeOperation} onClick={() => setSelectedId(i)} />;
                case 'rect':
                  return <Rect key={i} {...el} stroke={isSelected ? 'blue' : el.stroke} dash={isSelected ? [4, 4] : []} onClick={() => setSelectedId(i)} />;
                case 'circle':
                  return <Circle key={i} {...el} stroke={isSelected ? 'blue' : el.stroke} dash={isSelected ? [4, 4] : []} onClick={() => setSelectedId(i)} />;
                case 'triangle':
                  return (
                    <RegularPolygon
                      key={i}
                      x={el.x}
                      y={el.y}
                      sides={3}
                      radius={el.radius}
                      strokeWidth={el.strokeWidth}
                      stroke={isSelected ? 'blue' : el.stroke} 
                      dash={isSelected ? [4, 4] : []} 
                      onClick={() => setSelectedId(i)} 
                    />
                  );
                case 'arrow':
                  return <Arrow key={i} {...el} onClick={() => setSelectedId(i)} />;
                case 'text':
                  return (
                    <Text
                      key={i}
                      {...el}
                      draggable
                      stroke={selectedId === i ? 'blue' : undefined}
                      strokeWidth={selectedId === i ? 0.5 : 0}
                      onClick={() => setSelectedId(i)}
                      onDblClick={() => setEditingId(i)}
                      onDragEnd={(e) => {
                        const newElements = [...elements];
                        newElements[i] = {
                          ...newElements[i],
                          x: e.target.x(),
                          y: e.target.y(),
                        };
                        setElements(newElements);
                      }}
                    />
                  );
                default:
                  return null;
              }
            })}
          </Layer>
        </Stage>

        {editingId !== null && elements[editingId]?.type === 'text' && (
          <input
            autoFocus
            type="text"
            value={elements[editingId].text}
            style={{
              position: 'absolute',
              top: stageRef.current?.container().getBoundingClientRect().top +
                  elements[editingId].y * zoom,
              left: stageRef.current?.container().getBoundingClientRect().left +
                    elements[editingId].x * zoom,
              fontSize: elements[editingId].fontSize,
              fontFamily: elements[editingId].fontFamily,
              padding: '2px',
              border: '1px solid gray',
              zIndex: 10,
            }}
            onChange={(e) => {
              const newElements = [...elements];
              newElements[editingId].text = e.target.value;
              setElements(newElements);
            }}
            onBlur={() => setEditingId(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setEditingId(null);
            }}
          />
        )}
      </>
    );
  }
);

export default CanvasPage;
