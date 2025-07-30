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
  RegularPolygon,
  Image as KonvaImage
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
  ({ color, thickness, mode, zoom, fontSize, fontFamily }, ref) => {
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

    useImperativeHandle(ref, () => ({ undo, redo, bringForward, sendBackward }));

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

    const bringForward = () => {
      if (selectedId === null || selectedId >= elements.length - 1) return;
      const newElements = [...elements];
      const temp = newElements[selectedId];
      newElements[selectedId] = newElements[selectedId + 1];
      newElements[selectedId + 1] = temp;
      setElements(newElements);
      setSelectedId(selectedId + 1);
    };

    const sendBackward = () => {
      if (selectedId === null || selectedId <= 0) return;
      const newElements = [...elements];
      const temp = newElements[selectedId];
      newElements[selectedId] = newElements[selectedId - 1];
      newElements[selectedId - 1] = temp;
      setElements(newElements);
      setSelectedId(selectedId - 1);
    };

    const handleDropImage = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      console.log('📥 Image dropped');

      const stage = stageRef.current;
      if (!stage) return;

      const canvasWidth = stage.width();
      const canvasHeight = stage.height();
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));

      if (imageFiles.length === 0) {
        console.warn('⚠️ No image files dropped.');
        return;
      }

      imageFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = () => {
          const imageObj = new window.Image();
          imageObj.src = reader.result as string;

          imageObj.onload = () => {
            console.log('🖼️ Image fully loaded:', imageObj);
            const scaleFactor = (canvasWidth / 5) / imageObj.width;

            const width = imageObj.width * scaleFactor;
            const height = imageObj.height * scaleFactor;

            const x = (canvasWidth - width) / 2 + index * 30; // 每張圖片錯開
            const y = (canvasHeight - height) / 2 + index * 30;

            const newEl = {
              type: 'image',
              image: imageObj,
              x,
              y,
              width,
              height,
            };

            console.log('🧱 Adding to elements:', newEl);
            setElements((prev) => [...prev, newEl]);
          };
        };
        reader.readAsDataURL(file);
      });
    };

    const handleMouseDown = (e: any) => {
      if (e.target.className === 'Image') {
        return;
      }
      const stage = stageRef.current;
      const clickedOnEmpty = e.target === stage || e.target === stage.getStage();

      // 如果是點到其他元素（如 image），不要畫圖
      if (!clickedOnEmpty && mode !== 'text') return;

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
          if (!clickedOnEmpty) return;

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
        setCurrent({ ...current, radius: Math.sqrt(dx * dx + dy * dy) });
      } else if (current.type === 'arrow') {
        const newPoints = [current.points[0], current.points[1], pos.x, pos.y];
        setCurrent({ ...current, points: newPoints });
      }
    };

    const handleMouseUp = () => {
      if (current) {
        setElements([...elements, current]);
        setRedoStack([]);
        setCurrent(null);
      }
      isDrawing.current = false;
    };

    return (
      <div
        onDrop={handleDropImage}
        onDragOver={(e) => e.preventDefault()}
        style={{ width: '100%', height: '500px' }}
      >
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
                  return <RegularPolygon key={i} x={el.x} y={el.y} sides={3} radius={el.radius} strokeWidth={el.strokeWidth} stroke={isSelected ? 'blue' : el.stroke} dash={isSelected ? [4, 4] : []} onClick={() => setSelectedId(i)} />;
                case 'arrow':
                  return <Arrow key={i} {...el} onClick={() => setSelectedId(i)} />;
                case 'text':
                  return <Text key={i} {...el} draggable stroke={selectedId === i ? 'blue' : undefined} strokeWidth={selectedId === i ? 0.5 : 0} onClick={() => setSelectedId(i)} onDblClick={() => setEditingId(i)} onDragEnd={(e) => {
                    const newElements = [...elements];
                    newElements[i] = { ...newElements[i], x: e.target.x(), y: e.target.y() };
                    setElements(newElements);
                  }} />;
                case 'image':
                  return (
                    <KonvaImage
                      key={i}
                      image={el.image}
                      x={el.x}
                      y={el.y}
                      width={el.width}
                      height={el.height}
                      draggable
                      onClick={() => setSelectedId(i)}
                      onDragStart={(e) => {
                        // 🛑 阻止事件傳遞到 Stage（避免畫筆誤觸）
                        e.cancelBubble = true;
                        isDrawing.current = false;
                        setCurrent(null);
                      }}
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
      </div>
    );
  }
);

export default CanvasPage;
