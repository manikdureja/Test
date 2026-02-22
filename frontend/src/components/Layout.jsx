import { useState, useRef, useEffect, useCallback } from "react";

export default function DashboardLayout({ leftSidebarContent, rightSidebarContent, mainContent }) {
  // --- Left Sidebar State ---
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(260); // Default width
  const isDraggingLeft = useRef(false);

  // --- Right Sidebar State (if you want the exact same logic there) ---
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [rightWidth, setRightWidth] = useState(300);
  const isDraggingRight = useRef(false);

  // --- Dragging Logic for Left Sidebar ---
  const handleLeftMouseDown = () => {
    isDraggingLeft.current = true;
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = useCallback((e) => {
    if (isDraggingLeft.current) {
      // Prevent making it too small or too large
      const newWidth = Math.min(Math.max(e.clientX, 160), 400); 
      setLeftWidth(newWidth);
    }
    if (isDraggingRight.current) {
      const newWidth = Math.min(Math.max(window.innerWidth - e.clientX, 200), 500);
      setRightWidth(newWidth);
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    isDraggingLeft.current = false;
    isDraggingRight.current = false;
    document.body.style.cursor = "default";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Sidebar styling constants
  const collapsedWidth = 64;
  const currentLeftWidth = isLeftCollapsed ? collapsedWidth : leftWidth;
  const currentRightWidth = isRightCollapsed ? collapsedWidth : rightWidth;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "#0a0e1a", color: "#dde3f0", overflow: "hidden" }}>
      
      {/* ─── LEFT SIDEBAR ─── */}
      <div 
        style={{ 
          width: currentLeftWidth, 
          background: "#0f1825", 
          borderRight: "1px solid #1e2a3a",
          position: "relative",
          transition: isDraggingLeft.current ? "none" : "width 0.2s ease", // No transition while dragging for smooth performance
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Toggle Button */}
        <div style={{ padding: "12px", borderBottom: "1px solid #1e2a3a", display: "flex", justifyContent: isLeftCollapsed ? "center" : "space-between", alignItems: "center" }}>
          {!isLeftCollapsed && <span style={{ fontWeight: 700, fontSize: 14 }}>Menu</span>}
          <button 
            onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}
            style={{ background: "transparent", border: "none", color: "#6a7a8a", cursor: "pointer", padding: 4 }}
          >
            {isLeftCollapsed ? "→" : "←"} 
          </button>
        </div>

        {/* Sidebar Content (Hidden or shrunken when collapsed) */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", opacity: isLeftCollapsed ? 0 : 1, transition: "opacity 0.2s" }}>
          {leftSidebarContent}
        </div>

        {/* Drag Handle (Only active when not collapsed) */}
        {!isLeftCollapsed && (
          <div 
            onMouseDown={handleLeftMouseDown}
            style={{
              position: "absolute", right: -3, top: 0, bottom: 0, width: 6,
              cursor: "col-resize", zIndex: 10,
              // Optional: add a hover effect so the user knows they can drag it
              backgroundColor: "transparent",
            }}
          />
        )}
      </div>

      {/* ─── MAIN CONTENT ─── */}
      {/* flex: 1 forces this to fill the space between the two sidebars */}
      <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
        {mainContent}
      </div>

      {/* ─── RIGHT SIDEBAR ─── */}
      <div 
        style={{ 
          width: currentRightWidth, 
          background: "#0f1825", 
          borderLeft: "1px solid #1e2a3a",
          position: "relative",
          transition: isDraggingRight.current ? "none" : "width 0.2s ease",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Drag Handle for Right Sidebar */}
        {!isRightCollapsed && (
          <div 
            onMouseDown={() => { isDraggingRight.current = true; document.body.style.cursor = "col-resize"; }}
            style={{ position: "absolute", left: -3, top: 0, bottom: 0, width: 6, cursor: "col-resize", zIndex: 10 }}
          />
        )}

        <div style={{ padding: "12px", borderBottom: "1px solid #1e2a3a", display: "flex", justifyContent: isRightCollapsed ? "center" : "space-between", alignItems: "center" }}>
          <button 
            onClick={() => setIsRightCollapsed(!isRightCollapsed)}
            style={{ background: "transparent", border: "none", color: "#6a7a8a", cursor: "pointer", padding: 4 }}
          >
            {isRightCollapsed ? "←" : "→"} 
          </button>
          {!isRightCollapsed && <span style={{ fontWeight: 700, fontSize: 14 }}>Feed</span>}
        </div>

        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", opacity: isRightCollapsed ? 0 : 1 }}>
          {rightSidebarContent}
        </div>
      </div>

    </div>
  );
}