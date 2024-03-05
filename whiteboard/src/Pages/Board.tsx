/* eslint-disable @typescript-eslint/no-explicit-any */
import {fabric} from "fabric"
import "../App.css";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { useSocket } from "../socketProvider/Socket";
import { v4 as uuidv4 } from "uuid";
import {
  emitAdd,
  emitModify,
  emitMouseMove,
  emitPathAdd,
  emitRemove,
} from "../socketProvider/SocketHandler";
// import { DefaultEventsMap } from "@socket.io/component-emitter";
// import { Socket } from "socket.io-client";
import { PiRectangle } from "react-icons/pi";
import { PiCircle } from "react-icons/pi";
import { PiTriangle } from "react-icons/pi";
import { IoBrush } from "react-icons/io5";
import { MdOutlineDelete } from "react-icons/md";
import { BsCursorFill } from "react-icons/bs";
import { useSearchParams } from "react-router-dom";

function Board() {
  const [freehand, setFreehand] = useState(false);
  const [strokeColor, setStrokeColor] = useState<
    "black" | "blue" | "red" | "green"
  >("black");
  const [pathStrokeWidth, setPathStrokeWidth] = useState(1);
  const [strokeVisible, setStrokeVisible] = useState(false);
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState<string[]>([]);
  const room = searchParams.get("room");
  const name = searchParams.get("name");
  console.log("room: " + room + " name: " + name);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasState = useRef<string | null>(null);
  const socket = useSocket();



  useEffect(() => {
    socket.emit("new-user", { name: "jay" });
    socket.emit("join-room", { name, room });
    socket.on("connection-made", () => {
      console.log("connection made");
    });

    socket.on("user-joined", ({ name }) => {
      setUsers((prev) => {
        if (prev.includes(name)) return users;
        return [...prev, name];
      });
    });

    canvasRef.current = new fabric.Canvas("canvas");
    canvasRef.current.freeDrawingBrush.width = 5;
    canvasRef.current.freeDrawingBrush.color = "#000000"; // Set the drawing brush color

    canvasRef.current.on("path:created", handlePathCreated);

    canvasRef.current.on("object:modified", handleObjectModified);

    canvasRef.current.on("object:moving", handleObjectModified);

    canvasRef.current.on("object:removed", handleObjectRemoved);

    canvasRef.current.on("mouse:move", handleMouseMove);

    socket.on("newPathCreated", (newObject) => {
      console.log("new object receiverd");
      const { Object:object, id } = newObject;
      console.log(Object);
      const path = new fabric.Path(object.path.path, object.path as fabric.IPathOptions);
      path.set((id));
      canvasRef.current?.add(path);
    });

    socket.on("mouseMove", ({ x, y, user }) => {
      const cursor = document.getElementById(`${user}`);
      if (cursor) {
        cursor.style.left = x.toString() + "px";
        cursor.style.top = y.toString() + "px";
      }
    });

    socket.on("room-joined", ({ room, canvasState, sendingUsers }) => {
      console.log("hello user to room: " + room);
      setUsers(sendingUsers);
      canvasRef.current?.loadFromJSON(canvasState, () => {
        canvasRef.current?.renderAll();
      });
    });

    socket.on("newObjectAdded", (options) => {
      const { obj, id } = options;
      let object;
      if (obj.type === "line") {
        object = new fabric.Line([50, 50, 200, 50], {
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
        });
      } else if (obj.type === "rect") {
        object = new fabric.Rect({
          height: obj.height,
          width: obj.width,
          fill: obj.fill,
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
        });
      } else if (obj.type === "circle") {
        object = new fabric.Circle({
          radius: obj.radius,
          stroke: obj.stroke,
          fill: "transparent",

          strokeWidth: obj.strokeWidth,
        });
      } else  {
        object = new fabric.Triangle({
          width: obj.width,
          height: obj.height,
          fill: "transparent",
          stroke: obj.stroke,
          strokeWidth: obj.strokeWidth,
        });
      }

      (object as any).set({ id: id });
      canvasRef.current?.add(object!);
      canvasRef.current?.renderAll();
    });
  }, []);

  socket.on("user-left", ({ name }) => {
    setUsers(
      users.filter((user) => {
        if (user != name) return user;
      })
    );
  });

  socket.on("newObjectModify", (options) => {
    const { obj, id } = options;

    canvasRef.current?.getObjects()
      .forEach(
        (object: fabric.Object) => {
          if ((object as any).id === id) {
            object.set(obj);
            object.setCoords();
            canvasRef.current?.renderAll();
          }
        }
      );
  });

  socket.on("removeObject", (id) => {
    canvasRef.current?.getObjects().forEach((object: fabric.Object) => {
      if ((object as any).id === id) {
        canvasRef.current?.remove(object);
      }
    });
  });

  socket.on("undoCanvasChange", ({ canvasState }) => {
    console.log(canvasState);
    canvasRef.current?.loadFromJSON(canvasState, () => {
      canvasRef.current?.renderAll();
    });
  });

  socket.on("Hello", () => {
    alert("alkdfjalskjdf");
  });

  const handlePathCreated = async (Object:fabric.IEvent ) => {
    await (Object as any).path.set({ id: uuidv4() });
    canvasState.current = JSON.stringify(canvasRef.current?.toJSON());
    // socket.emit("newPathCreated", { Object, id: Object.path.id, room , canvasState: canvasState.current});
    emitPathAdd({ Object, room, socket, canvasState });
  };

  const handleObjectModified = (options:fabric.IEvent ) => {
    if (options.target) {
      const modifiedObj = {
        obj: options.target,
        id: (options as any).target.id,
      };
      console.log(room);
      canvasState.current = JSON.stringify(canvasRef.current?.toJSON());
      emitModify({
        obj: modifiedObj,
        socket,
        room,
        canvasState: canvasState.current,
      });
    }
  };

  const handleMouseMove = (Object: any) => {
    
    emitMouseMove({ x: (Object as any).e.clientX, y: (Object as any).e.clientY, room, socket });
  };

  const handleObjectRemoved = (object: fabric.IEvent) => {
    canvasState.current = JSON.stringify(canvasRef.current?.toJSON());
    emitRemove({
      id: (object as any).target!.id,
      socket,
      room,
      canvasState: canvasState.current,
    });
  };

  useEffect(() => {
     // Set the drawing brush color
    if (canvasRef.current) {
      canvasRef.current.freeDrawingBrush.width = pathStrokeWidth;
      canvasRef.current.freeDrawingBrush.color = strokeColor;
      canvasRef.current.isDrawingMode = freehand;
    }
  }, [freehand, pathStrokeWidth, strokeColor]); // Re-run this effect whenever `freehand` changes

  const deleteObj = () => {
    const selectedObject = canvasRef.current?.getActiveObjects(); // Get the currently selected object

    selectedObject!.forEach((selectedObject) => {
      canvasRef.current?.remove(selectedObject); // Remove the selected object from the canvas
      canvasRef.current?.renderAll(); // Render the canvas to reflect the changes
    });
  };

  const addShape :MouseEventHandler<HTMLButtonElement> = (e) => {
    const type = (e as any).target.name;
    let object;
    if (type == "line") {
      object = new fabric.Line([50, 50, 200, 50], {
        stroke: strokeColor,
        strokeWidth: pathStrokeWidth,
      });
    } else if (type === "rectangle") {
      object = new fabric.Rect({
        height: 75,
        width: 150,
        fill: "transparent",
        stroke: strokeColor,
        strokeWidth: pathStrokeWidth,
      });
    } else if (type === "triangle") {
      object = new fabric.Triangle({
        width: 100,
        height: 100,
        fill: "transparent",
        stroke: strokeColor,
        strokeWidth: pathStrokeWidth,
      });
    } else if (type === "circle") {
      object = new fabric.Circle({
        radius: 50,
        fill: "transparent",
        stroke: strokeColor,
        strokeWidth: pathStrokeWidth,
      });
    }
    (object as any)!.set({ id: uuidv4() });
    canvasRef.current?.add(object!);
    canvasRef.current?.renderAll();
    canvasState.current = JSON.stringify(canvasRef.current?.toJSON());
    emitAdd({
      obj: { obj: object, id: (object as any)!.id },
      socket,
      room,
      canvasState: canvasState.current,
    });
  };

  const download = () => {
    const dataURL = canvasRef.current?.toDataURL({format: "image/jpeg"}); // Change 'image/png' to 'image/jpeg' for JPEG format
    const img = document.createElement("img");
    img.src = dataURL!;

    // Append the image to the document or do something else with it
    document.body.appendChild(img);

    // Optionally, you can download the image using a link
    const downloadLink = document.createElement("a");
    downloadLink.href = dataURL!;
    downloadLink.download = "canvas_image.png"; // Change the filename and extension as needed
    downloadLink.click();
  };

  return (
    <>
      {users?.map((user) => {
        if (user != name && user != null) {
          return (
            <div
              style={{
                position: "absolute",
                zIndex: "10",
                pointerEvents: "none",
              }}
              id={user.toString()}
              key={user.toString()}
            >
              <BsCursorFill />
            </div>
          );
        }
      })}
      <div className="actionSelector">
        <div
          className="brushBtn"
          style={{ height: "20px", width: "20px" }}
          onClick={() => {
            setFreehand(true);
          }}
        >
          <IoBrush />
        </div>
        <div
          style={{ height: "20px", width: "20px" }}
          onClick={() => {
            setFreehand(false);
          }}
        >
          <BsCursorFill />
        </div>

        <div style={{ height: "20px", width: "20px" }} onClick={deleteObj}>
          <MdOutlineDelete />
        </div>

        <div
          style={{ height: "20px", width: "20px" }}
          onClick={() => {
            setStrokeVisible((prev) => !prev);
          }}
        >
          <i className="fi fi-rr-line-width"></i>
        </div>
        {freehand ? (
          <div
            className="strokeWidth"
            style={
              strokeVisible
                ? { transform: "translate(120%, -80%)" }
                : { transform: "translate(-120%, -80%)" }
            }
          >
            <button
              onClick={() => {
                setPathStrokeWidth((prev) => prev + 1);
                console.log(pathStrokeWidth);
              }}
            >
              <i className="fi fi-rr-plus-small"></i>
            </button>
            <div className="strokeValue">{pathStrokeWidth}</div>
            <button
              onClick={() => {
                setPathStrokeWidth((prev) => (prev - 1 > 0 ? prev - 1 : prev));
              }}
            >
              <i className="fi fi-rr-minus-small"></i>
            </button>
          </div>
        ) : (
          <div
            className="strokeWidth"
            style={
              strokeVisible
                ? { transform: "translate(120%, -80%)" }
                : { transform: "translate(-120%, -80%)" }
            }
          >
            <button
              onClick={() => {
                setPathStrokeWidth((prev) => prev + 1);
              }}
            >
              <i className="fi fi-rr-plus-small"></i>
            </button>
            <div className="strokeValue">{pathStrokeWidth}</div>
            <button
              onClick={() => {
                setPathStrokeWidth((prev) => (prev - 1 > 0 ? prev - 1 : prev));
              }}
            >
              <i className="fi fi-rr-minus-small"></i>
            </button>
          </div>
        )}

        <div
          style={{ height: "20px", width: "20px" }}
          onClick={() => {
            setStrokeColor('black');
          }}
        >
          <img style={{height:'20px'}}  src="https://png.pngtree.com/png-clipart/20201029/ourmid/pngtree-circle-clipart-black-circle-png-image_2381996.jpg" alt="" />
        </div>
        <div
          style={{ height: "20px", width: "20px" }}
          onClick={() => {
            setStrokeColor('red');
          }}
        >
          <img  style={{height:'20px'}} src="https://png.pngtree.com/png-clipart/20201029/ourmid/pngtree-circle-clipart-red-circle-png-image_2381952.jpg" alt="" />
        </div>
        <div
          style={{ height: "20px", width: "20px" }}
          onClick={() => {
            setStrokeColor('blue');
          }}
        >
          <img style={{height:'20px'}}  src="https://png.pngtree.com/png-clipart/20201029/ourmid/pngtree-circle-clipart-blue-circle-png-image_2381949.jpg" alt="" />
        </div>
        <div
          style={{ height: "20px", width: "20px" }}
          onClick={() => {
            setStrokeColor('green');
          }}
        >
          <img style={{height:'20px'}}  src="https://png.pngtree.com/png-clipart/20201029/ourmid/pngtree-circle-clipart-dark-green-circle-png-image_2382001.jpg" alt="" />
        </div>
      </div>

      <div className="addShapes">
        <button type="button" name="circle" onClick={addShape}>
          <PiCircle
            style={{ height: "20px", width: "30px", pointerEvents: "none" }}
          />
        </button>

        <button type="button" name="triangle" onClick={addShape}>
          <PiTriangle
            style={{ height: "20px", width: "30px", pointerEvents: "none" }}
          />
        </button>

        <button type="button" name="rectangle" onClick={addShape}>
          <PiRectangle
            style={{ height: "20px", width: "30px", pointerEvents: "none" }}
          />
        </button>

        <button type="button" name="line" onClick={addShape}>
          <i
            className="fi fi-rr-slash"
            style={{ height: "20px", width: "30px", pointerEvents: "none" }}
          ></i>
        </button>
        <button onClick={download}>Download</button>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        <canvas
          id="canvas"
          width={window.innerWidth * 0.99}
          height={window.innerHeight * 0.92}
        ></canvas>
      </div>
    </>
  );
}

export default Board;
