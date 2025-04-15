import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { noteEditorAPI } from '../../../api/noteEditor';

interface ImageButtonProps {
  editor: any;
}

const ImageButton: React.FC<ImageButtonProps> = ({ editor }) => {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const userId = localStorage.getItem('user_id');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor || !userId) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Only JPG, JPEG and PNG files are allowed');
      return;
    }

    setIsUploadingImage(true);

    try {
      const response = await noteEditorAPI.uploadImage(userId, file);
      
      if (response.success && response.url) {
        const { from } = editor.view.state.selection;
        
        if (!editor.isActive('paragraph')) {
          editor.chain().focus().setParagraph().run();
        }
        
        editor
          .chain()
          .focus()
          .setTextSelection(from)
          .insertContent({
            type: 'image',
            attrs: {
              src: response.url,
              alt: file.name,
              title: file.name,
              class: 'resizable-image',
              width: 300,
              height: 'auto'
            }
          })
          .run();
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <>
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
      />
      <button
        onClick={() => imageInputRef.current?.click()}
        className="p-2 rounded hover:bg-gray-100 relative"
        title="Insert Image"
        disabled={isUploadingImage}
      >
        {isUploadingImage ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
      </button>
    </>
  );
};

export default ImageButton;