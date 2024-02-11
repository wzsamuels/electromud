import React, { useState, ChangeEvent, KeyboardEvent, FormEvent} from "react";

const InputForm = ({onSubmit}: {onSubmit: (text:string) => void}) => {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const handleSubmit = (event: FormEvent<HTMLFormElement> | KeyboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault(); // Prevent the default form submit action
    onSubmit(message);
    window.electronAPI.writeClient(message);
    setMessage('')    
  };

  // Function to handle key down events for navigating history
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      // Navigate up the history
      const newIndex = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(newIndex);
      setMessage(history[history.length - 1 - newIndex] || '');
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      // Navigate down the history
      const newIndex = Math.max(historyIndex - 1, -1);
      setHistoryIndex(newIndex);
      setMessage(history[history.length - 1 - newIndex] || '');
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      // Send message on Enter key
      // Add the message to the history and reset the history index
      setHistory(prev => [...prev, message]);
      setHistoryIndex(-1);
      onSubmit(message);
      window.electronAPI.writeClient(message);
      setMessage('')   
    }
  };

  return (
    <div className='w-full h-[2rem] border-t border-grey-500 text-text dark:text-darkText'>
      <input 
        className='w-full p-2 h-full focus:outline-none bg-background dark:bg-darkBackground'
        value={message}
        onChange={e => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
      ></input>
    </div>
  );
}

export default InputForm