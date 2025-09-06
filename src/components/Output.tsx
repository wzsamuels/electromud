import DOMPurify from "dompurify";
import React, { useEffect, useRef } from "react";
import { Line } from "src/types";

const escapeAngleBrackets = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const convertUrlsToLinks = (text: string): string => {
  const urlRegex = /(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
  return text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
};

const TextWithLinks: React.FC<{ line: Line }> = ({ line }) => {

  // First, escape angle brackets in the original text
  const escapedText = escapeAngleBrackets(line.text);
  
  // Then, convert URLs to clickable links in the escaped text
  const htmlContentWithLinks = convertUrlsToLinks(escapedText);

  // Sanitize the final HTML content to ensure safety
  const sanitizedHtml = DOMPurify.sanitize(htmlContentWithLinks);

  return (
    <div className='my-1'>
      {line.channelName ? (
        <>
          <span style={{ color: line.color }} dangerouslySetInnerHTML={{ __html: line.channelName }} />
          <span className="text-text dark:text-darkText" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
        </>
      ) : (
        <span style={{ color: line.color, whiteSpace: "pre-wrap", }} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
      )}
    </div>
  );
};

function Output({ lines } : {lines: Line[]}) {
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the scrollable container

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      // Directly set scrollTop to scrollHeight to scroll to the bottom
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [lines]);

  return (
    <div ref={containerRef} className='grow overflow-y-auto '>
      {lines.map((line, index) => (
        <TextWithLinks  key={index} line={line}/>
      ))}
    </div>
  );
}

export default Output