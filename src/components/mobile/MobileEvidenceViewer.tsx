import { useState, useRef } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  FileText, 
  Image, 
  Video, 
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react'
import { GavelButton } from '@/components/ui/gavel-button'
import { useSwipeGesture } from './SwipeableCard'
import { useIsMobile } from '@/hooks/use-mobile'

interface MobileEvidenceViewerProps {
  evidence: any[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onPresent: () => void
  userRole: string
}

export function MobileEvidenceViewer({
  evidence,
  currentIndex,
  onIndexChange,
  onPresent,
  userRole
}: MobileEvidenceViewerProps) {
  const isMobile = useIsMobile()
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  
  const currentEvidence = evidence[currentIndex]
  
  // Swipe gesture for evidence navigation
  const swipeGesture = useSwipeGesture({
    onSwipeLeft: () => nextEvidence(),
    onSwipeRight: () => prevEvidence(),
    threshold: 50
  })
  
  const nextEvidence = () => {
    if (currentIndex < evidence.length - 1) {
      onIndexChange(currentIndex + 1)
      resetZoom()
      if (navigator.vibrate) navigator.vibrate(10)
    }
  }
  
  const prevEvidence = () => {
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1)
      resetZoom()
      if (navigator.vibrate) navigator.vibrate(10)
    }
  }
  
  const resetZoom = () => {
    setIsZoomed(false)
    setZoomLevel(1)
    setRotation(0)
  }
  
  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed)
    setZoomLevel(isZoomed ? 1 : 2)
  }
  
  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }
  
  const getEvidenceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'image':
      case 'photo':
        return Image
      case 'video':
        return Video
      case 'document':
      case 'text':
        return FileText
      default:
        return FileText
    }
  }
  
  const EvidenceIcon = getEvidenceIcon(currentEvidence?.evidence_type)
  
  if (!currentEvidence) {
    return (
      <div className="flex items-center justify-center h-full bg-parchment/50 rounded-xl">
        <div className="text-center">
          <FileText className="w-12 h-12 text-mahogany/40 mx-auto mb-2" />
          <p className="text-mahogany/60">No evidence available</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Evidence navigation header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <EvidenceIcon className="w-5 h-5 text-gavel-blue" />
          <span className="text-sm font-medium text-gavel-blue">
            {currentIndex + 1} of {evidence.length}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <motion.button
            className="p-2 rounded-lg bg-parchment/50 text-gavel-blue disabled:opacity-30"
            onClick={prevEvidence}
            disabled={currentIndex === 0}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            className="p-2 rounded-lg bg-parchment/50 text-gavel-blue disabled:opacity-30"
            onClick={nextEvidence}
            disabled={currentIndex === evidence.length - 1}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      {/* Evidence viewer */}
      <div 
        ref={containerRef}
        className="flex-1 bg-parchment/95 rounded-xl overflow-hidden relative"
        {...swipeGesture}
      >
        <motion.div
          className="h-full p-4 overflow-auto scroll-touch"
          animate={controls}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.9, x: 100 }}
              animate={{ 
                opacity: 1, 
                scale: zoomLevel, 
                x: 0,
                rotate: rotation
              }}
              exit={{ opacity: 0, scale: 0.9, x: -100 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full"
            >
              {/* Evidence title */}
              <h3 className="font-semibold text-gavel-blue text-lg mb-2">
                {currentEvidence.evidence_name}
              </h3>
              
              {/* Evidence content */}
              <div className="bg-white/70 rounded-lg p-4 mb-4">
                {currentEvidence.evidence_type?.toLowerCase() === 'image' ? (
                  <div className="aspect-video bg-mahogany/10 rounded-lg flex items-center justify-center">
                    <Image className="w-12 h-12 text-mahogany/40" />
                    <p className="text-mahogany/60 ml-2">Image Evidence</p>
                  </div>
                ) : currentEvidence.evidence_type?.toLowerCase() === 'video' ? (
                  <div className="aspect-video bg-mahogany/10 rounded-lg flex items-center justify-center">
                    <Video className="w-12 h-12 text-mahogany/40" />
                    <p className="text-mahogany/60 ml-2">Video Evidence</p>
                  </div>
                ) : (
                  <div className="min-h-[200px] text-mahogany/80 leading-relaxed">
                    {currentEvidence.description || 'Evidence description would appear here'}
                  </div>
                )}
              </div>
              
              {/* Evidence metadata */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-mahogany/60">Impact:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < (currentEvidence.impact_strength || 3) 
                            ? 'bg-verdict-gold' 
                            : 'bg-mahogany/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                {currentEvidence.legal_foundation && (
                  <div>
                    <span className="text-sm text-mahogany/60">Legal Foundation:</span>
                    <p className="text-sm text-mahogany/80 mt-1">
                      {currentEvidence.legal_foundation}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
        {/* Evidence controls overlay */}
        <div className="absolute top-4 right-4 flex gap-2">
          <motion.button
            className="p-2 bg-black/20 backdrop-blur-sm rounded-lg text-white"
            onClick={handleZoomToggle}
            whileTap={{ scale: 0.9 }}
          >
            {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </motion.button>
          
          {currentEvidence.evidence_type?.toLowerCase() === 'image' && (
            <motion.button
              className="p-2 bg-black/20 backdrop-blur-sm rounded-lg text-white"
              onClick={handleRotate}
              whileTap={{ scale: 0.9 }}
            >
              <RotateCw className="w-4 h-4" />
            </motion.button>
          )}
        </div>
        
        {/* Evidence progress indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex gap-1">
            {evidence.map((_, index) => (
              <motion.div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentIndex ? 'bg-verdict-gold' : 'bg-white/30'
                }`}
                animate={{
                  scale: index === currentIndex ? 1.2 : 1
                }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Present evidence button */}
      {userRole === 'attorney' && (
        <motion.div className="mt-4">
          <motion.button
            className="w-full btn-mobile haptic-medium"
            onClick={onPresent}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            <Eye className="w-5 h-5" />
            Present to Jury
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}