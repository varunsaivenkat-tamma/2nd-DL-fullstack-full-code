import React from 'react'
import '@google/model-viewer'

export default function ModelShowcase() {
  const modelUrl = "https://modelviewer.dev/shared-assets/models/Astronaut.glb"

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-primary-light to-secondary-light shadow-md">
      
      <model-viewer
        src={modelUrl}
        alt="3D car model"
        camera-controls
        auto-rotate
        style={{ width: "100%", height: "320px", borderRadius: "14px" }}
        exposure="1.1"
      ></model-viewer>

      <div className="mt-3 text-center text-text-light text-sm">
        Cinematic 3D preview (replace with car GLB)
      </div>
    </div>
  )
}
