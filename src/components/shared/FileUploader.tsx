import { useCallback, useState } from 'react'
import { FileWithPath, useDropzone } from 'react-dropzone'
import { Button } from '../ui/button'

type FileUploaderProps = {
  fieldChange: (files: File[]) => void
  mediaUrl: string
}

export default function FileUploader({
  fieldChange,
  mediaUrl,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl)

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      // Do something with the files
      setFiles(acceptedFiles)
      fieldChange(acceptedFiles)
      setFileUrl(URL.createObjectURL(acceptedFiles[0]))
    },
    [files]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.gif', '.jpg', '.jpeg'],
    },
  })

  return (
    <div
      {...getRootProps()}
      className='flex-center flex-col bg-dark-3 rounded-xl cursor-pointer'
    >
      <input {...getInputProps()} className='cursor-pointer' />
      {fileUrl ? (
        <>
          <div className='flex flex-1 justify-center w-full p-5 lg:p-10'>
            <img src={fileUrl} alt='file' className='file_uploader-img' />
          </div>
          <p className='file_uploader-label'>
            Click or drag file to this area to replace.
          </p>
        </>
      ) : (
        <div className='file_uploader-box'>
          <img
            src='/assets/icons/file-upload.svg'
            alt='upload'
            width={96}
            height={77}
          />
          <h3 className='base-medium text-light-2 mb-2 mt-6'>
            Drag your file here
          </h3>
          <p className='text-light-4 small-regular mb-6'>SVG, PNG, JPG</p>
          <Button className='shad-button_dark_4'>
            Select from your computer
          </Button>
        </div>
      )}
    </div>
  )
}
