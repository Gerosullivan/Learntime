"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Modal from "./ui/Modal"
import videoThumbnail from "@/public/assets/images/video-thumbnail.png"

const VideoTutorial: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  useEffect(() => {
    if (isModalOpen && videoRef.current) {
      videoRef.current.play()
    }
  }, [isModalOpen])

  return (
    <div className="mt-10 w-80 rounded-lg bg-gray-300 p-6 shadow-lg">
      <div className="relative">
        <a onClick={openModal} className="block cursor-pointer">
          <Image
            src={videoThumbnail}
            alt="Video Thumbnail"
            className="w-full rounded-lg"
          />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <svg
              className="mx-auto size-16 text-black"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 0a10 10 0 100 20 10 10 0 000-20zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
            <p className="mb-0 mt-2 whitespace-nowrap bg-white p-1 text-lg font-bold text-black">
              View quick start guide
            </p>
          </div>
        </a>
      </div>
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <video ref={videoRef} controls width="100%" height="auto" autoPlay>
            <source
              src="https://6k97emvmezlndrht.public.blob.vercel-storage.com/learntime_promo-6P3JeFeVmcoFsjfHePXtGiGz9hRWWV.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </Modal>
      )}
    </div>
  )
}

export default VideoTutorial
