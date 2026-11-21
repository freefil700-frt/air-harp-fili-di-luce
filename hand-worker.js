import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/vision_bundle.mjs";
let landmarker=null;
self.onmessage=async function(event){
  const data=event.data||{};
  if(data.type==="init"){
    try{
      const vision=await FilesetResolver.forVisionTasks(data.wasmUrl);
      const options={runningMode:"VIDEO",numHands:2,minHandDetectionConfidence:.48,minHandPresenceConfidence:.48,minTrackingConfidence:.46};
      try{landmarker=await HandLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:data.modelUrl,delegate:"GPU"},...options});}
      catch(gpuError){landmarker=await HandLandmarker.createFromOptions(vision,{baseOptions:{modelAssetPath:data.modelUrl,delegate:"CPU"},...options});}
      self.postMessage({type:"ready"});
    }catch(error){self.postMessage({type:"init-error",message:error?.message||String(error)});}
    return;
  }
  if(data.type==="frame"&&landmarker){
    const bitmap=data.bitmap;
    try{
      const result=landmarker.detectForVideo(bitmap,data.timestamp);
      self.postMessage({type:"result",landmarks:result.landmarks||[],handedness:result.handedness||[],timestamp:data.timestamp});
    }catch(error){self.postMessage({type:"frame-error",message:error?.message||String(error)});}
    finally{bitmap?.close?.();}
  }
};
