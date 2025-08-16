import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSendMessage: (text: string, imageUri?: string) => void;
  isAiTyping: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isAiTyping }) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast({
          title: "Image Too Large",
          description: "Max image size is 2MB. Please select a smaller image.",
          variant: "destructive",
          duration: 5000,
        });
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please select a JPG, PNG, WEBP, or GIF image.",
          variant: "destructive",
          duration: 5000,
        });
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const result = reader.result as string;
          if (result) {
            setSelectedImage(result);
            // If input is empty, we can send image directly.
            if (!inputValue.trim()) {
                onSendMessage("", result);
                setSelectedImage(null);
                if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
            }
          }
        } catch (error) {
          console.error('Error processing image:', error);
          toast({
            title: "Image Processing Error",
            description: "There was an error processing your image. Please try again.",
            variant: "destructive",
            duration: 5000,
          });
          if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        }
      };
      reader.onerror = () => {
        toast({
          title: "Image Read Error",
          description: "Could not read the selected image. Please try again.",
          variant: "destructive",
          duration: 5000,
        });
        if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (text: string, image?: File) => {
    if (!text.trim() && !image) return;

    const messageId = Date.now().toString();
    let userMessage = text;
    onSendMessage(userMessage, selectedImage || undefined);
    setInputValue('');
    setSelectedImage(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
    }
    if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 96)}px`; // Max height of 96px (24 * 4 lines approx)
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end p-2 sm:p-3 bg-chat-input-bg border-t border-border gap-2"
    >
      <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-foreground/80 self-end shrink-0">
        <Smile className="h-5 w-5" />
      </Button>
      <Textarea
        ref={textareaRef}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-grow resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-card rounded-lg shadow-sm custom-scrollbar py-2 px-3 text-sm leading-tight max-h-[6rem] min-h-[2.5rem]" 
        rows={1}
      />
      {inputValue.trim() || selectedImage ? (
        <Button type="submit" variant="default" size="icon" className="bg-primary hover:bg-primary/90 self-end shrink-0">
          <Send className="h-5 w-5 text-primary-foreground" />
        </Button>
      ) : (
        <Button variant="ghost" size="icon" type="button" className="text-muted-foreground hover:text-foreground/80 self-end shrink-0">
          <Mic className="h-5 w-5" />
        </Button>
      )}
       <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageChange} 
        accept="image/jpeg,image/png,image/webp,image/gif" 
        className="hidden" 
      />
      <Button 
        variant="ghost" 
        size="icon" 
        type="button" 
        className="text-muted-foreground hover:text-foreground/80 self-end shrink-0"
        onClick={() => fileInputRef.current?.click()}
      >
        <Paperclip className="h-5 w-5" />
      </Button>
    </form>
  );
};

export default ChatInput;