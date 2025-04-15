import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

interface ImageResizeOptions {
  minWidth: number;
  maxWidth: number;
}

export const ImageResizeExtension = Extension.create<ImageResizeOptions>({
  name: 'imageResize',

  addOptions() {
    return {
      minWidth: 100,
      maxWidth: 1000,
    };
  },

  addProseMirrorPlugins() {
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let $selectedImage: HTMLImageElement | null = null;
    let isDragging = false;
    let activeHandle: string | null = null;

    const createResizeHandle = (position: string) => {
      const handle = document.createElement('div');
      handle.className = `image-resize-handle ${position}`;
      return handle;
    };

    const updateImageSize = (view: EditorView, width: number, height: number) => {
      if (!$selectedImage) return;

      const pos = view.state.doc.resolve(0);
      let imagePos = -1;

      view.state.doc.nodesBetween(0, view.state.doc.content.size, (node, pos) => {
        if (node.type.name === 'image' && node.attrs.src === $selectedImage?.src) {
          imagePos = pos;
          return false;
        }
        return true;
      });

      if (imagePos === -1) return;

      const transaction = view.state.tr.setNodeMarkup(imagePos, null, {
        ...view.state.doc.nodeAt(imagePos)?.attrs,
        width: Math.round(width),
        height: Math.round(height),
      });

      view.dispatch(transaction);
    };

    const removeResizeHandles = () => {
      document.querySelectorAll('.image-resize-handle').forEach(handle => handle.remove());
      if ($selectedImage) {
        $selectedImage.classList.remove('selected');
        $selectedImage = null;
      }
    };

    return [
      new Plugin({
        key: new PluginKey('imageResize'),
        props: {
          handleDOMEvents: {
            mousedown(view, event) {
              const target = event.target as HTMLElement;
              
              if (target.tagName === 'IMG') {
                event.preventDefault();
                const img = target as HTMLImageElement;
                $selectedImage = img;
                img.classList.add('selected');

                // Create resize handles
                const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
                positions.forEach(pos => {
                  const handle = createResizeHandle(pos);
                  img.parentElement?.appendChild(handle);
                });
              }

              if (target.classList.contains('image-resize-handle')) {
                event.preventDefault();
                isDragging = true;
                activeHandle = target.className.split(' ')[1];
                startX = event.pageX;
                startY = event.pageY;
                if ($selectedImage) {
                  startWidth = $selectedImage.width;
                  startHeight = $selectedImage.height;
                }
              }

              return false;
            },

            mousemove(view, event) {
              if (!isDragging || !$selectedImage || !activeHandle) return false;

              const deltaX = event.pageX - startX;
              const deltaY = event.pageY - startY;
              let newWidth = startWidth;
              let newHeight = startHeight;

              const aspectRatio = startWidth / startHeight;

              if (activeHandle.includes('right')) {
                newWidth = startWidth + deltaX;
              } else if (activeHandle.includes('left')) {
                newWidth = startWidth - deltaX;
              }

              newHeight = newWidth / aspectRatio;

              // Constrain to min/max width
              newWidth = Math.max(this.options.minWidth, Math.min(this.options.maxWidth, newWidth));
              newHeight = newWidth / aspectRatio;

              updateImageSize(view, newWidth, newHeight);
              return true;
            },

            mouseup() {
              isDragging = false;
              activeHandle = null;
              return false;
            },

            click(view, event) {
              const target = event.target as HTMLElement;
              if (!target.closest('img')) {
                removeResizeHandles();
              }
              return false;
            },
          },
        },
      }),
    ];
  },
});