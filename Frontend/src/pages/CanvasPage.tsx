import { TbRectangle } from "react-icons/tb";
import { IoMdDownload } from "react-icons/io";
import { FaLongArrowAltRight } from "react-icons/fa";
import { LuPencil } from "react-icons/lu";
import { GiArrowCursor } from "react-icons/gi";
import { FaRegCircle } from "react-icons/fa6";
import {
  Arrow,
  Circle,
  Layer,
  Line,
  Rect,
  Stage,
  Transformer,
} from "react-konva";
import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ACTIONS } from "@/lib/constants";
import socket from "@/socket";

const CanvasPage = () => {
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const [action, setAction] = useState<string>(ACTIONS.SELECT);
  const [fillColor, setFillColor] = useState<string>("#ff0000");
  const [rectangles, setRectangles] = useState<any[]>([]);
  const [circles, setCircles] = useState<any[]>([]);
  const [arrows, setArrows] = useState<any[]>([]);
  const [scribbles, setScribbles] = useState<any[]>([]);
  const [strokeColor, setStrokeColor] = useState<string>("#000000");


  const [history, setHistory] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);


  const isPaining = useRef<boolean>(false);
  const currentShapeId = useRef<string | null>(null);

  const isDraggable = action === ACTIONS.SELECT;

  useEffect(() => {
    // Listen for draw events from the server
    socket.on("draw", ({ shape, action }) => {
      switch (action) {
        case ACTIONS.RECTANGLE:
          setRectangles((rectangles) => [...rectangles, shape]);
          break;
        case ACTIONS.CIRCLE:
          setCircles((circles) => [...circles, shape]);
          break;
        case ACTIONS.ARROW:
          setArrows((arrows) => [...arrows, shape]);
          break;
        case ACTIONS.SCRIBBLE:
          setScribbles((scribbles) => [...scribbles, shape]);
          break;
      }
    });

    return () => {
      socket.off("draw");
    };
  }, []);


  function onPointerDown() {
    if (action === ACTIONS.SELECT) return;

    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition()!;
    const id = uuidv4();

    currentShapeId.current = id;
    isPaining.current = true;

    const newShape = {
      id,
      x,
      y,
      fillColor,
    };

    switch (action) {
      case ACTIONS.RECTANGLE:
        const newRectangle = { ...newShape, height: 20, width: 20 };
        setRectangles((rectangles) => [...rectangles, newRectangle]);
        socket.emit("draw", { action, shape: newRectangle });
        break;
      case ACTIONS.CIRCLE:
        const newCircle = { ...newShape, radius: 20 };
        setCircles((circles) => [...circles, newCircle]);
        socket.emit("draw", { action, shape: newCircle });
        break;
      case ACTIONS.ARROW:
        const newArrow = { ...newShape, points: [x, y, x + 20, y + 20] };
        setArrows((arrows) => [...arrows, newArrow]);
        socket.emit("draw", { action, shape: newArrow });
        break;
      case ACTIONS.SCRIBBLE:
        const newScribble = { ...newShape, points: [x, y] };
        setScribbles((scribbles) => [...scribbles, newScribble]);
        socket.emit("draw", { action, shape: newScribble });
        break;
    }
  }

  function onPointerMove() {
    if (action === ACTIONS.SELECT || !isPaining.current) return;

    const stage = stageRef.current;
    const { x, y } = stage.getPointerPosition()!;

    let updatedShape: { id: string | null; x?: any; y?: any; width?: number; height?: number; fillColor: string; radius?: number; points?: any[]; };
    switch (action) {
      case ACTIONS.RECTANGLE:
        updatedShape = {
          id: currentShapeId.current,
          x: rectangles.find(r => r.id === currentShapeId.current)?.x || x,
          y: rectangles.find(r => r.id === currentShapeId.current)?.y || y,
          width: x - rectangles.find(r => r.id === currentShapeId.current)?.x || 0,
          height: y - rectangles.find(r => r.id === currentShapeId.current)?.y || 0,
          fillColor,
        };
        setRectangles((rectangles) =>
          rectangles.map((rectangle) => rectangle.id === currentShapeId.current ? updatedShape : rectangle)
        );
        socket.emit("draw", { action, shape: updatedShape });
        break;
      case ACTIONS.CIRCLE:
        updatedShape = {
          id: currentShapeId.current,
          x: circles.find(c => c.id === currentShapeId.current)?.x || x,
          y: circles.find(c => c.id === currentShapeId.current)?.y || y,
          radius: Math.sqrt((y - circles.find(c => c.id === currentShapeId.current)?.y || 0) ** 2 + (x - circles.find(c => c.id === currentShapeId.current)?.x || 0) ** 2),
          fillColor,
        };
        setCircles((circles) =>
          circles.map((circle) => circle.id === currentShapeId.current ? updatedShape : circle)
        );
        socket.emit("draw", { action, shape: updatedShape });
        break;
      case ACTIONS.ARROW:
        updatedShape = {
          id: currentShapeId.current,
          points: [arrows.find(a => a.id === currentShapeId.current)?.points[0] || x, arrows.find(a => a.id === currentShapeId.current)?.points[1] || y, x, y],
          fillColor,
        };
        setArrows((arrows) =>
          arrows.map((arrow) => arrow.id === currentShapeId.current ? updatedShape : arrow)
        );
        socket.emit("draw", { action, shape: updatedShape });
        break;
      case ACTIONS.SCRIBBLE:
        updatedShape = {
          id: currentShapeId.current,
          points: [...scribbles.find(s => s.id === currentShapeId.current)?.points || [], x, y],
          fillColor,
        };
        setScribbles((scribbles) =>
          scribbles.map((scribble) => scribble.id === currentShapeId.current ? updatedShape : scribble)
        );
        socket.emit("draw", { action, shape: updatedShape });
        break;
    }
  }

  function onPointerUp() {
    isPaining.current = false;

    // Get the final shape data
    let shapeData;
    switch (action) {
      case ACTIONS.RECTANGLE:
        shapeData = rectangles.find(rect => rect.id === currentShapeId.current);
        break;
      case ACTIONS.CIRCLE:
        shapeData = circles.find(circle => circle.id === currentShapeId.current);
        break;
      case ACTIONS.ARROW:
        shapeData = arrows.find(arrow => arrow.id === currentShapeId.current);
        break;
      case ACTIONS.SCRIBBLE:
        shapeData = scribbles.find(scribble => scribble.id === currentShapeId.current);
        break;
    }

    // Emit the final shape data to the server
    if (shapeData) {
      socket.emit("draw", {
        shape: shapeData,
        action,
      });

      // Save the current state to history for undo functionality
      setHistory(prev => [...prev, { rectangles, circles, arrows, scribbles }]);
      setRedoStack([]);  // Clear redo stack when a new action is taken
    }
}


function handleUndo() {
  if (history.length === 0) return;

  // Pop the last state from history
  const lastState = history[history.length - 1];
  setHistory(history.slice(0, history.length - 1));

  // Save the current state to the redo stack
  setRedoStack((prev) => [...prev, { rectangles, circles, arrows, scribbles }]);

  // Restore the previous state
  setRectangles(lastState.rectangles);
  setCircles(lastState.circles);
  setArrows(lastState.arrows);
  setScribbles(lastState.scribbles);
}

function handleRedo() {
  if (redoStack.length === 0) return;

  // Pop the last state from the redo stack
  const lastRedoState = redoStack[redoStack.length - 1];
  setRedoStack(redoStack.slice(0, redoStack.length - 1));

  // Save the current state to the history stack
  setHistory((prev) => [...prev, { rectangles, circles, arrows, scribbles }]);

  // Restore the redo state
  setRectangles(lastRedoState.rectangles);
  setCircles(lastRedoState.circles);
  setArrows(lastRedoState.arrows);
  setScribbles(lastRedoState.scribbles);
}

  function handleExport() {
    const uri = stageRef.current.toDataURL();
    const link = document.createElement("a");
    link.download = "image.png";
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function onClick(e: any) {
    if (action !== ACTIONS.SELECT) return;
    const target = e.currentTarget;
    transformerRef.current.nodes([target]);
  }

  return (
    <>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Controls */}
        <div className="absolute top-0 z-10 w-full py-2 ">
          <div className="flex justify-center items-center gap-3 py-2 px-3 w-fit mx-auto border shadow-lg rounded-lg">
            <button
              className={
                action === ACTIONS.SELECT
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.SELECT)}
            >
              <GiArrowCursor size={"2rem"} />
            </button>
            <button onClick={handleUndo}>Undo</button>
            <button onClick={handleRedo}>Redo</button>
            <button
              className={
                action === ACTIONS.RECTANGLE
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.RECTANGLE)}
            >
              <TbRectangle size={"2rem"} />
            </button>
            <button
              className={
                action === ACTIONS.CIRCLE
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.CIRCLE)}
            >
              <FaRegCircle size={"1.5rem"} />
            </button>
            <button
              className={
                action === ACTIONS.ARROW
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.ARROW)}
            >
              <FaLongArrowAltRight size={"2rem"} />
            </button>
            <button
              className={
                action === ACTIONS.SCRIBBLE
                  ? "bg-violet-300 p-1 rounded"
                  : "p-1 hover:bg-violet-100 rounded"
              }
              onClick={() => setAction(ACTIONS.SCRIBBLE)}
            >
              <LuPencil size={"1.5rem"} />
            </button>
            <button>
              <input
                className="w-6 h-6"
                type="color"
                value={strokeColor}
                onChange={(e) => setStrokeColor(e.target.value)}
              />
            </button>
            <button>
              <input
                className="w-6 h-6"
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
              />
            </button>

            <button onClick={handleExport}>
              <IoMdDownload size={"1.5rem"} />
            </button>
          </div>
        </div>
        {/* Canvas */}
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              height={window.innerHeight}
              width={window.innerWidth}
              fill="#ffffff"
              id="bg"
              onClick={() => {
                transformerRef.current.nodes([]);
              }}
            />

            {rectangles.map((rectangle) => (
              <Rect
                key={rectangle.id}
                x={rectangle.x}
                y={rectangle.y}
                stroke={strokeColor}
                strokeWidth={2}
                fill={rectangle.fillColor}
                height={rectangle.height}
                width={rectangle.width}
                draggable={isDraggable}
                onClick={onClick}
              />
            ))}

            {circles.map((circle) => (
              <Circle
                key={circle.id}
                radius={circle.radius}
                x={circle.x}
                y={circle.y}
                stroke={strokeColor}
                strokeWidth={2}
                fill={circle.fillColor}
                draggable={isDraggable}
                onClick={onClick}
              />
            ))}

            {arrows.map((arrow) => (
              <Arrow
                key={arrow.id}
                points={arrow.points}
                stroke={strokeColor}
                strokeWidth={2}
                fill={arrow.fillColor}
                draggable={isDraggable}
                onClick={onClick}
              />
            ))}

            {scribbles.map((scribble) => (
              <Line
                key={scribble.id}
                points={scribble.points}
                stroke={strokeColor}
                strokeWidth={2}
                fill={scribble.fillColor}
                draggable={isDraggable}
                onClick={onClick}
              />
            ))}
          </Layer>
        </Stage>
        <Transformer ref={transformerRef} />
      </div>
    </>
  );
}

export default CanvasPage
