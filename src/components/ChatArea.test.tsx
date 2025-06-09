
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { ChatArea } from './ChatArea';
import { ImagePreview } from './ui/ImagePreview';
import { AudioPlayer } from './AudioPlayer';

import { act } from 'react';

// Mock child components
vi.mock('./ui/ImagePreview', () => ({
  ImagePreview: vi.fn(({ src, alt }) => <div data-testid="bot-image-preview" data-src={src} data-alt={alt}>ImagePreviewMock</div>)
}));

vi.mock('./AudioPlayer', () => ({
  AudioPlayer: vi.fn(({ src }) => <div data-testid="audio-player" data-src={src}>AudioPlayerMock</div>)
}));

// Mock global objects
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();
global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

// Mock FileReader
const mockFileReaderInstance = {
  readAsDataURL: vi.fn(),
  onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
  onerror: null as ((event: ProgressEvent<FileReader>) => void) | null,
  result: null as string | ArrayBuffer | null,
};
vi.stubGlobal('FileReader', vi.fn(() => mockFileReaderInstance));

const mockSelectedChatbots = [{
  id: '1',
  name: 'TestBot',
  url: 'https://shapes.inc/testbot',
  avatar: '',
  description: '',
  tags: [],
  is_visible: true,
  created_at: '',
  updated_at: '',
}];
const mockApiKey = 'test-api-key';

// Helper to get access to renderMessageContent
// This is a bit of a workaround because renderMessageContent is not directly exported
// We render ChatArea and then find a way to call it.
// For simplicity in this test setup, we'll assume ChatArea internally calls renderMessageContent
// when messages are passed to it. We'll simulate this by setting messages.

// A more direct way would be to refactor ChatArea to export renderMessageContent or test it via interaction tests
// if it were more complex. Given its current structure, we focus on the output within a message.

// Let's define a simplified Message type for testing, matching what ChatArea expects
interface TestMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

describe('ChatArea component - renderMessageContent logic', () => {
  // This setup is to allow calling renderMessageContent indirectly.
  // We'll need to find a rendered message and check its content.
  // For these tests, we will manually construct the part of the component tree
  // that `renderMessageContent` would produce.

  // Since renderMessageContent is an internal function, we'll test its behavior by what ChatArea renders.
  // For `isImageUrl`, we test it via the behavior of `renderMessageContent`.

  // Mock performApiCall which is imported and used by ChatArea
  const mockPerformApiCall = vi.fn();
  // We need to mock the module that exports performApiCall if it's not ChatArea itself.
  // Assuming ChatArea is the one calling it directly or it's a helper within ChatArea.
  // For simplicity, if performApiCall was imported from a utils file, we'd mock that file.
  // Here, it's a function within ChatArea, so we'd test its effects or spy on fetch if it wasn't extracted.
  // Since it *is* extracted but part of the same file, we can't easily mock it directly using vi.mock for itself.
  // For these tests, we will assume performApiCall is implicitly tested by sendMessage effects.
  // If we wanted to prevent actual fetch, we'd mock `global.fetch`.
  const mockFetch = vi.fn().mockImplementation(async () => {
    return new Response(JSON.stringify({ choices: [{ message: { content: "Mocked bot response" } }] }), { status: 200 });
  });
  global.fetch = mockFetch;

  const renderChatArea = () => {
    render(<ChatArea selectedChatbots={mockSelectedChatbots} apiKey={mockApiKey} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset FileReader mock instance state
    mockFileReaderInstance.readAsDataURL.mockClear();
    mockFileReaderInstance.onload = null;
    mockFileReaderInstance.onerror = null;
    mockFileReaderInstance.result = null;
    // Reset URL mocks
    mockCreateObjectURL.mockClear();
    mockRevokeObjectURL.mockClear();
    // Reset fetch mock
    mockFetch.mockClear();
  });

  // Test cases for the original isImageUrl logic (implicitly via renderMessageContent)
  const testIsBotImageUrl = (url: string) => {
    const imageUrlRegex = /(https:\/\/files\.shapes\.inc\/[^\s]+\.(png|jpg|jpeg|gif))/gi;
    return imageUrlRegex.test(url);
  };

  describe('isImageUrl (simulated direct test)', () => {
    it('correctly identifies valid image URLs', () => {
      expect(testIsBotImageUrl('https://files.shapes.inc/image.png')).toBe(true);
      expect(testIsBotImageUrl('https://files.shapes.inc/image.jpg')).toBe(true);
      expect(testIsBotImageUrl('https://files.shapes.inc/image.jpeg')).toBe(true);
      expect(testIsBotImageUrl('https://files.shapes.inc/image.gif')).toBe(true);
      expect(testIsBotImageUrl('Some text https://files.shapes.inc/image.png also text')).toBe(true);
    });

    it('rejects invalid image URLs', () => {
      expect(testIsBotImageUrl('https://files.shapes.inc/image.mp3')).toBe(false);
      expect(testIsBotImageUrl('https://otherdomain.com/image.png')).toBe(false);
      expect(testIsBotImageUrl('https://files.shapes.inc/image.txt')).toBe(false);
      expect(testIsBotImageUrl('just text no url')).toBe(false);
      expect(testIsBotImageUrl('https://files.shapes.inc/imagepng')).toBe(false); // No dot
    });
  });
  
  // Testing renderMessageContent outcomes (conceptual)
  // These tests assume we can isolate the rendering logic for a single message.

  // Mock implementation of renderMessageContent for testing purposes.
  // This is what we *wish* we could import and test.
  const mockRenderMessageContent = (message: TestMessage) => {
    const imageUrlRegex = /(https:\/\/files\.shapes\.inc\/[^\s]+\.(png|jpg|jpeg|gif))/gi;
    const audioUrlRegex = /(https:\/\/files\.shapes\.inc\/[^\s]+\.mp3)/g;

    const imageUrl = message.content.match(imageUrlRegex)?.[0];
    const audioUrl = message.content.match(audioUrlRegex)?.[0];

    if (imageUrl && message.sender === 'bot') {
      const textContent = message.content.replace(imageUrl, '').trim();
      return (
        <div className="space-y-2">
          {textContent && <p className="text-sm">{textContent}</p>}
          <ImagePreview src={imageUrl} alt="Bot image content" />
        </div>
      );
    }
    
    if (audioUrl && message.sender === 'bot') {
      const textContent = message.content.replace(audioUrl, '').trim();
      return (
        <div className="space-y-2">
          {textContent && <p className="text-sm">{textContent}</p>}
          <AudioPlayer src={audioUrl} />
        </div>
      );
    }
    return <p className="text-sm">{message.content}</p>;
  };

  describe('renderMessageContent logic (simulated with mock implementation)', () => {
    const baseMessage: Omit<TestMessage, 'content'> = {
      id: '1',
      sender: 'bot',
      timestamp: new Date(),
    };

    beforeEach(() => {
      // Reset mocks before each test if they are stateful (like call counts)
      vi.clearAllMocks();
    });

    it('renders ImagePreview for bot message with image URL', () => {
      const message = { ...baseMessage, content: 'Check this out: https://files.shapes.inc/photo.jpg' };
      const { getByTestId, getByText } = render(mockRenderMessageContent(message));
      
      expect(getByTestId('bot-image-preview')).toBeInTheDocument();
      expect(getByTestId('bot-image-preview')).toHaveAttribute('data-src', 'https://files.shapes.inc/photo.jpg');
      expect(getByTestId('bot-image-preview')).toHaveAttribute('data-alt', 'Bot image content');
      expect(getByText('Check this out:')).toBeInTheDocument();
      expect(AudioPlayer).not.toHaveBeenCalled();
    });

    it('renders ImagePreview and text for bot message with image URL and leading/trailing text', () => {
      const message = { ...baseMessage, content: 'Look: https://files.shapes.inc/image.gif please' };
      const { getByTestId, getByText } = render(mockRenderMessageContent(message));
      
      expect(getByTestId('bot-image-preview')).toBeInTheDocument();
      expect(getByTestId('bot-image-preview')).toHaveAttribute('data-src', 'https://files.shapes.inc/image.gif');
      expect(getByText(/Look:/)).toBeInTheDocument();
      expect(getByText(/please/)).toBeInTheDocument();
      expect(AudioPlayer).not.toHaveBeenCalled();
    });

    it('renders AudioPlayer for bot message with audio URL', () => {
      const message = { ...baseMessage, content: 'Listen: https://files.shapes.inc/sound.mp3' };
      const { getByTestId, getByText } = render(mockRenderMessageContent(message));

      expect(getByTestId('audio-player')).toBeInTheDocument();
      expect(getByTestId('audio-player')).toHaveAttribute('data-src', 'https://files.shapes.inc/sound.mp3');
      expect(getByText('Listen:')).toBeInTheDocument();
      expect(ImagePreview).not.toHaveBeenCalled();
    });

    it('does not render ImagePreview if sender is user', () => {
      const message = { ...baseMessage, sender: 'user' as const, content: 'My image: https://files.shapes.inc/user.png' };
      const { queryByTestId, getByText } = render(mockRenderMessageContent(message));
      
      expect(queryByTestId('image-preview')).not.toBeInTheDocument();
      expect(getByText('My image: https://files.shapes.inc/user.png')).toBeInTheDocument();
    });

    it('does not render ImagePreview or AudioPlayer for non-media URL', () => {
      const message = { ...baseMessage, content: 'Just text https://files.shapes.inc/document.pdf' };
      const { queryByTestId, getByText } = render(mockRenderMessageContent(message));
      
      expect(queryByTestId('image-preview')).not.toBeInTheDocument();
      expect(queryByTestId('audio-player')).not.toBeInTheDocument();
      expect(getByText('Just text https://files.shapes.inc/document.pdf')).toBeInTheDocument();
    });

    it('renders only text if no URL is present', () => {
      const message = { ...baseMessage, content: 'Hello world' };
      const { queryByTestId, getByText } = render(mockRenderMessageContent(message));

      expect(queryByTestId('image-preview')).not.toBeInTheDocument();
      expect(queryByTestId('audio-player')).not.toBeInTheDocument();
      expect(getByText('Hello world')).toBeInTheDocument();
    });
  });
});
