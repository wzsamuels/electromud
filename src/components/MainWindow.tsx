import React, { useEffect, useState} from 'react'
import { useIpcData } from '../IpcContext'
import usePrevious from '../usePrevious'
import InputForm from './InputForm';
import Output from './Output';

import { Line } from 'src/types';

let colorPalette: string[];

if(localStorage.theme = 'dark') {
  colorPalette = [
    '#FF6B6B', // Lighter red
    '#51D88A', // Bright green
    '#54A0FF', // Bright blue
    '#F368E0', // Bright pink
    '#FF9F43', // Bright orange
    '#0ABDE3', // Cyan
    '#FFEAA7', // Light yellow
    '#1DD1A1', // Teal
    '#5E60CE', // Lavender
    '#28B463', // Emerald
    '#FA8231', // Dark orange
    '#45AAF2', // Light blue
    '#20BF6B', // Bright green
    '#D980FA', // Purple
    '#EB3B5A', // Dark pink
    '#2D98DA', // Dodger blue
  ];
} else {
  colorPalette = [
    '#C0392B', // Dark red
    '#27AE60', // Forest green
    '#2980B9', // Strong blue
    '#8E44AD', // Deep purple
    '#D35400', // Pumpkin orange
    '#16A085', // Sea green
    '#2C3E50', // Dark slate
    '#F39C12', // Vibrant yellow
    '#A569BD', // Soft purple
    '#D98880', // Pastel red
    '#76D7C4', // Light sea green
    '#5DADE2', // Light blue
    '#F7DC6F', // Light yellow
    '#7DCEA0', // Light green
    '#85929E', // Greyish blue
    '#F1948A', // Soft pink
  ];
  
}

let channelColorAssignments: { [channel: string]: string } = {};
let colorUsage: string[] = [];

function MainWindow() {
  const { data } = useIpcData();
  const previousData = usePrevious(data);
  const [lines, setLines] = useState<Line[]>([]);

  const assignColorToChannel = (channel: string): string => {
    if (!channelColorAssignments[channel]) {
      const availableColor = colorPalette.find(color => !Object.values(channelColorAssignments).includes(color)) || colorUsage.shift()!;
      channelColorAssignments[channel] = availableColor;
      colorUsage.push(availableColor); // Track usage for recycling colors
    }
    return channelColorAssignments[channel];
  };

  useEffect(() => {
    if (previousData !== data && data) {
      const newLines = data.split(/(?<=\n)/).map((line): Line => {
        const channelMatch = line.match(/^\[([\w.-]+)\]/);
        let channelName: string | undefined = undefined;
        let color = "#ccc"; // Default color for lines without a channel
        if (channelMatch) {
          channelName = channelMatch[0];
          color = assignColorToChannel(channelName); // Assign color based on channel name
          line = line.substring(channelMatch[0].length); // Remove the channel name from the line
        }
        return { text: line, channelName, color };
      });
      setLines(state => [...state, ...newLines]);
    }
  }, [data, previousData]);

  const handleSubmit = (text: string) => {
    setLines(state => [...state, {text: text, color: '#6a9955'}])
  }

  return (

    <div className='flex flex-col h-[100vh] overflow-y-hidden'>
      <Output lines={lines}/>
      <InputForm onSubmit={handleSubmit}/>
    </div>
  )
}



export default MainWindow