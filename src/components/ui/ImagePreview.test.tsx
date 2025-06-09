
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { ImagePreview } from './ImagePreview';

describe('ImagePreview', () => {
  const mockSrc = 'https://files.shapes.inc/test-image.png';
  const mockAlt = 'Test Image Alt Text';

  test('renders the image with correct src and alt attributes', () => {
    render(<ImagePreview src={mockSrc} alt={mockAlt} />);
    
    const imgElement = screen.getByRole('img');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', mockSrc);
    expect(imgElement).toHaveAttribute('alt', mockAlt);
  });

  test('renders the Download button', () => {
    render(<ImagePreview src={mockSrc} alt={mockAlt} />);
    
    const buttonElement = screen.getByRole('button', { name: /download/i });
    expect(buttonElement).toBeInTheDocument();
  });

  test('clicking the Download button triggers download logic', () => {
    // Mock DOM methods
    // Create a real anchor element to be returned by the mock
    const actualLinkElement = document.createElement('a');
    // Spy on its click method BEFORE it's returned by createElement
    const linkClickSpy = vi.spyOn(actualLinkElement, 'click');

    const originalCreateElement = document.createElement; // Save original
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        // Reset properties for this specific test run if the element is reused
        actualLinkElement.href = '';
        actualLinkElement.download = '';
        return actualLinkElement;
      }
      // Fallback for any other elements that might be created by RTL etc.
      return originalCreateElement.call(document, tagName);
    });
    
    render(<ImagePreview src={mockSrc} alt={mockAlt} />);
    
    // Spy on body methods after render and before click
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');
    
    const buttonElement = screen.getByRole('button', { name: /download/i });
    fireEvent.click(buttonElement);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(actualLinkElement.href.endsWith(mockSrc)).toBe(true); // EndsWith because JSDOM might make it absolute
    expect(actualLinkElement.download).toBe('test-image.png');
    expect(appendChildSpy).toHaveBeenCalledWith(actualLinkElement);
    expect(linkClickSpy).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledWith(actualLinkElement);

    // Restore original implementations
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  test('clicking the Download button uses default filename if URL has no obvious filename', () => {
    const mockSrcNoFilename = 'https://files.shapes.inc/somepath/';
    // Create a real anchor element for this test
    const actualLinkElementNoFilename = document.createElement('a');
    const linkClickSpyNoFilename = vi.spyOn(actualLinkElementNoFilename, 'click');

    const originalCreateElement = document.createElement; // Save original
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        actualLinkElementNoFilename.href = '';
        actualLinkElementNoFilename.download = '';
        return actualLinkElementNoFilename;
      }
      return originalCreateElement.call(document, tagName);
    });

    render(<ImagePreview src={mockSrcNoFilename} alt={mockAlt} />);
    
    // Spy on body methods after render and before click
    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');
    
    const buttonElement = screen.getByRole('button', { name: /download/i });
    fireEvent.click(buttonElement);

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(actualLinkElementNoFilename.href.endsWith(mockSrcNoFilename)).toBe(true);
    expect(actualLinkElementNoFilename.download).toBe('downloaded-image.png');
    expect(appendChildSpy).toHaveBeenCalledWith(actualLinkElementNoFilename);
    expect(linkClickSpyNoFilename).toHaveBeenCalledTimes(1);
    expect(removeChildSpy).toHaveBeenCalledWith(actualLinkElementNoFilename);

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});
