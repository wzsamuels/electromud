import React, { useEffect, useRef, useState } from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { useIpcData } from './IpcContext'
import usePrevious from './usePrevious'

type Input = {
  text: string
}

interface onReadClientType { (text: string): void}

export interface IElectronAPI {
  writeClient: (data: string) => Promise<void>,
  onReadClient: (arg0: onReadClientType) => void
  connectClient: () => void
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
interface Line {
  text: string
  color: string
  id: number
}

function App() {
  const [count, setCount] = useState(0)
  const [lines, setLines] = useState<Line[]>([]);
  const lineCount = useRef(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Input>()

  const onSubmit: SubmitHandler<Input> = (data) => {
    console.log("Writing data: ", data.text);
    window.electronAPI.writeClient(data.text);
  }

  const { data } = useIpcData();
  const previousData = usePrevious(data);

  useEffect(() => {
    if (previousData !== data) {
      console.log('Data has changed: ', data);
      setLines(state => state.concat({text: data, color: "#000", id: lineCount.current}))
    }
  }, [data, previousData]);

  return (

    <div>
      <OutputWindow lines={lines}/>
      <div className='fixed bottom-0 w-full h-[8rem] bg-white border border-t p-4'> 
        <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
          <input
            className='border border-black max-w-[40rem]'
            {...register("text", {required: true})}
          />
          <div className='flex gap-4 px-4'>
            <input className='hidden border border-black rounded-xl px-4 py-2 my-4 cursor:pointer' type="submit"/>
            <button className='border border-black rounded-xl px-4 py-2 my-4' onClick={() => window.electronAPI.connectClient()}>
              Connect
            </button>
          </div>
        </form>
        <div>

        </div>
      </div>
    </div>
  )
}

function OutputWindow({ lines } : {lines: Line[]}) {
  const containerRef = useRef(null);
  const endOfMessagesRef = useRef(null);

  const isScrolledToBottom = () => {
    if (!containerRef.current) return false;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Check if the user is scrolled to the bottom (allowing a small threshold for better UX)
    return scrollTop + clientHeight + 5 >= scrollHeight;
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isScrolledToBottom()) {
      scrollToBottom();
    }
  }, [lines]); // Dependency array includes messages, so effect runs when messages update

  return (
    <div ref={containerRef} className='p-4 pb-[5rem]' style={{overflowY: 'auto' }}>
      {lines.map((line, index) => (
        <p style={{ whiteSpace: 'pre-wrap' }} key={index}>{line.text}</p>
      ))}
      {/* Invisible element at the end of your messages */}
      <div ref={endOfMessagesRef} />
    </div>
  );
}

export default App