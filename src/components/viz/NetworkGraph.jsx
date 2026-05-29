import { useEffect, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'

/**
 * Container-measured wrapper around react-force-graph-2d.
 * - measures its own width via ResizeObserver
 * - frames the graph with zoomToFit once the layout settles
 *
 * force-graph keeps its own canvas render loop running every frame, so a
 * time-based `nodeCanvasObject` (pulses, cascade colour shifts) animates
 * continuously without any manual refresh. Pass a `fgRef` to call zoomToFit.
 */
export default function NetworkGraph({
  data,
  height = 440,
  fgRef,
  nodeCanvasObject,
  linkColor = () => 'rgba(148,163,184,0.18)',
  linkWidth = 1,
  linkDirectionalParticles = 0,
  cooldownTime = 4000,
}) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width)
    })
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrapRef} style={{ height }} className="w-full">
      {width > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={width}
          height={height}
          graphData={data}
          backgroundColor="rgba(0,0,0,0)"
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(node.x, node.y, 8, 0, 2 * Math.PI)
            ctx.fill()
          }}
          linkColor={linkColor}
          linkWidth={linkWidth}
          linkDirectionalParticles={linkDirectionalParticles}
          linkDirectionalParticleWidth={1.6}
          linkDirectionalParticleColor={() => 'rgba(245,158,11,0.7)'}
          cooldownTime={cooldownTime}
          onEngineStop={() => fgRef?.current?.zoomToFit(400, 36)}
          enableNodeDrag={false}
        />
      )}
    </div>
  )
}
